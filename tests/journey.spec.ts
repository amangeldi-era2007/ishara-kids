import { test, expect } from '@playwright/test';

test('language, lesson, score and unlocking persist', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Қазақша' }).click();
  await expect(
    page.getByRole('link', { name: 'Бастау', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Русский' }).click();
  await page.getByRole('link', { name: 'Начать', exact: true }).click();
  await page.getByRole('link', { name: 'Начать', exact: true }).click();
  await expect(
    page.getByText('Здесь появится официальное видео'),
  ).toBeVisible();
  const next = page.getByRole('button', { name: 'Дальше' });
  await next.click();
  await page.getByRole('button', { name: 'Синий' }).click();
  await expect(next).toBeDisabled();
  await page.getByRole('button', { name: 'Жёлтый' }).click();
  await next.click();
  await page.getByRole('button', { name: 'Зелёный' }).click();
  await next.click();
  for (const [icon, label] of [
    ['☀️', 'Солнце'],
    ['🍃', 'Лист'],
    ['⭐', 'Звезда'],
  ]) {
    await page
      .getByRole('button', { name: new RegExp(`${icon}.*Выбрать`) })
      .click();
    await page.getByRole('button', { name: label }).click();
  }
  await next.click();
  await page.getByRole('button', { name: 'Завершить урок' }).click();
  await page.getByRole('link', { name: 'Мои награды' }).click();
  await expect(
    page.getByRole('heading', { name: 'Твои награды' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Звёзды: 50')).toBeVisible();
  await page.getByRole('link', { name: 'Продолжить путь' }).click();
  await expect(page.locator('a[href*="/learn/shapes"]')).toBeVisible();
});

test('mobile categories, bilingual search and media fallback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: /Школа/ }).click();
  await expect(page.getByRole('heading', { name: 'Книга' })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.getByText('Ожидает проверки')).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  await page.getByRole('button', { name: 'Все', exact: true }).click();
  await page.getByRole('searchbox').fill('қуаныш');
  await expect(page.getByRole('heading', { name: 'Радость' })).toBeVisible();
  await page.getByRole('searchbox').fill('zzz');
  await page.getByRole('button', { name: 'Очистить поиск' }).click();
  await expect(page.getByRole('heading', { name: 'Книга' })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  await page
    .getByRole('navigation', { name: 'Мобильное меню' })
    .getByRole('link', { name: 'Родителям' })
    .click();
  await expect(
    page.getByRole('link', { name: /Методические рекомендации/ }),
  ).toBeVisible();
});

test('both games reward once; profile reset needs confirmation', async ({
  page,
}) => {
  await page.goto('/games');
  for (const i of [0, 1, 0]) {
    await page
      .getByRole('button', { name: 'Играть', exact: true })
      .nth(i)
      .click();
    await page.getByRole('button', { name: 'Радость' }).click();
    await expect(page.getByRole('status')).toHaveText('Попробуй ещё.');
    for (const [j, name] of ['Книга', 'Вода', 'Радость'].entries()) {
      await page.getByRole('button', { name, exact: true }).click();
      await page
        .getByRole('button', {
          name: j === 2 ? 'К играм' : 'Дальше',
          exact: true,
        })
        .click();
    }
  }
  await page.goto('/profile');
  await expect(page.getByLabel('Звёзды: 20')).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить прогресс' }).click();
  await page.getByRole('button', { name: 'Отмена' }).click();
  await expect(page.getByLabel('Звёзды: 20')).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить прогресс' }).click();
  await page.getByRole('button', { name: 'Да, сбросить' }).click();
  await page.reload();
  await expect(page.getByLabel('Звёзды: 0')).toBeVisible();
});
