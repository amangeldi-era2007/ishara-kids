import { expect, test } from '@playwright/test';

test('opens the trainer and shows licensed dactyl references without requesting the camera', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () => {
        throw new Error('Unexpected access to camera');
      },
    });
  });
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: /Попробовать AI-тренажёр/ }).click();
  await expect(
    page.getByRole('heading', { name: 'AI-тренажёр', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/AI-проверка жеста пока недоступна/),
  ).toBeVisible();
  await page.getByRole('link', { name: /Открыть дактильный алфавит/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Казахский дактильный алфавит' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Перейти к букве', exact: true })
      .getByRole('link'),
  ).toHaveCount(42);
  await page
    .getByRole('link', { name: 'Перейти к букве Б', exact: true })
    .click();
  await expect(page).toHaveURL(/#entry-qazsl-b$/);
  const photo = page.getByRole('img', { name: 'Фото дактиля: Б' });
  await expect(photo).toBeVisible();
  await expect
    .poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalHeight))
    .toBe(720);
  await expect(
    page.getByRole('link', { name: 'Увеличить фото дактиля: Б' }),
  ).toHaveAttribute('href', '/content/images/qazsl-b.png');
  await expect(
    page.getByRole('link', { name: /Видео на YouTube · Б/ }),
  ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=jhmtdinluLk');
  const search = page.getByRole('searchbox');
  await search.fill('ү');
  await expect(
    page.getByRole('heading', { name: 'Ү', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Описание в таблице/ }),
  ).toHaveAttribute('href', /#page=5$/);
  await search.fill('ъ');
  await expect(
    page.getByRole('heading', { name: 'Ъ', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('img', { name: 'Фото дактиля: Ъ' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('link', { name: /Видео на YouTube · Ъ/ }),
  ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=UTSetRhp_DM');
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(pageWidth).toBeLessThanOrEqual(390);
  expect(failures).toEqual([]);
});

test('handles a declined camera request and does not request audio', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async (constraints: MediaStreamConstraints) => {
        if (constraints.audio !== false)
          throw new Error('Audio must be disabled');
        throw new DOMException('Permission denied by test', 'NotAllowedError');
      },
    });
  });
  await page.goto('/practice/diagnostics/');
  await page.getByRole('button', { name: 'Включить камеру' }).click();
  await expect(page.getByText(/Нет доступа к камере/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Попробовать снова' }),
  ).toBeVisible();
});

test('real Hand Landmarker detects hands in a prerecorded-image stream and releases it on navigation', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  const twoHandFixture = process.env.PLAYWRIGHT_TWO_HANDS_FIXTURE;
  if (twoHandFixture)
    await page.route('**/__test-two-hands.jpg', (route) =>
      route.fulfill({ path: twoHandFixture, contentType: 'image/jpeg' }),
    );
  await page.addInitScript(() => {
    const fixture = window as Window & { fixtureTrack?: MediaStreamTrack };
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async () => {
        const image = new Image();
        image.src = '/content/images/qazsl-b.png';
        await image.decode();
        const two = new Image();
        if (document.documentElement.dataset.twoHandFixture) {
          two.src = '/__test-two-hands.jpg';
          await two.decode();
        }
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d')!;
        let hands = 0;
        window.addEventListener('fixture-hands', (event) => {
          hands = (event as CustomEvent<number>).detail;
        });
        const stream = canvas.captureStream(25);
        const track = stream.getVideoTracks()[0];
        fixture.fixtureTrack = track;
        const paint = () => {
          if (track.readyState === 'ended') return;
          const width = hands === 2 ? two.naturalWidth : 640;
          const height = hands === 2 ? two.naturalHeight : 480;
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          ctx.fillStyle = '#d2d2c6';
          ctx.fillRect(0, 0, width, height);
          if (hands === 1) ctx.drawImage(image, 185, 40, 270, 310);
          if (hands === 2) ctx.drawImage(two, 0, 0);
          setTimeout(paint, 40);
        };
        paint();
        return stream;
      },
    });
  });
  await page.goto('/practice/diagnostics/');
  if (twoHandFixture)
    await page.evaluate(() => {
      document.documentElement.dataset.twoHandFixture = '1';
    });
  await page.getByRole('button', { name: 'Включить камеру' }).click();
  await expect(page.getByText(/Камера включена/)).toBeVisible({
    timeout: 15000,
  });
  const count = page
    .locator('.studio-diagnostics dt')
    .filter({ hasText: 'Руки в кадре' })
    .locator('xpath=following-sibling::dd[1]');
  await expect(count).toHaveText('0');
  await page.evaluate(() =>
    dispatchEvent(new CustomEvent('fixture-hands', { detail: 1 })),
  );
  await expect(count).toHaveText('1', { timeout: 10000 });
  await page.evaluate(() =>
    dispatchEvent(new CustomEvent('fixture-hands', { detail: 0 })),
  );
  await expect(count).toHaveText('0');
  if (twoHandFixture) {
    await page.evaluate(() =>
      dispatchEvent(new CustomEvent('fixture-hands', { detail: 2 })),
    );
    await expect(count).toHaveText('2', { timeout: 10000 });
    await page.evaluate(() =>
      dispatchEvent(new CustomEvent('fixture-hands', { detail: 0 })),
    );
    await expect(count).toHaveText('0');
  }
  await page.getByRole('link', { name: /isharakids/ }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { fixtureTrack?: MediaStreamTrack }).fixtureTrack
            ?.readyState,
      ),
    )
    .toBe('ended');
  const localhost = new URL(page.url()).origin;
  expect(requests.filter((url) => !url.startsWith(`${localhost}/`))).toEqual(
    [],
  );
  expect(requests.some((url) => url.endsWith('/ai/hand_landmarker.task'))).toBe(
    true,
  );
  expect(
    requests.some((url) => url.includes('/ai/wasm/') && url.endsWith('.wasm')),
  ).toBe(true);
});
