import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProgressServer } from './progress.mjs';

const origin = 'https://example.org';
async function listen(database) {
  const server = createProgressServer({ database, allowedOrigins: new Set([origin]) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    url: `http://127.0.0.1:${server.address().port}/api/progress`,
    close: () => new Promise(resolve => server.close(resolve)),
  };
}

test('persists private progress on disk, supports retries and deletes only the selected copy', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ishara-progress-'));
  const path = join(dir, 'progress.sqlite');
  const auth = () => ({ Authorization: `Bearer ${randomBytes(32).toString('hex')}` });
  const alice = auth();
  const bob = auth();
  const data = { completed: { colors: 50 }, games: { garden: true } };
  let server = await listen(path);
  try {
    for (const headers of [alice, alice]) {
      const result = await fetch(server.url, {
        method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      assert.equal(result.status, 204);
    }
    await server.close();
    server = await listen(path);
    const restored = await fetch(server.url, { headers: { ...alice, Origin: origin } });
    assert.equal(restored.status, 200);
    assert.equal(restored.headers.get('access-control-allow-origin'), origin);
    assert.equal(restored.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await restored.json(), data);
    assert.equal((await fetch(server.url, { headers: bob })).status, 404);
    assert.equal((await fetch(server.url, { method: 'DELETE', headers: bob })).status, 204);
    assert.equal((await fetch(server.url, { headers: alice })).status, 200);
    assert.equal((await fetch(server.url, { method: 'DELETE', headers: alice })).status, 204);
    assert.equal((await fetch(server.url, { headers: alice })).status, 404);
  } finally {
    await server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('rejects unexpected origins, keys, private fields and oversized payloads', async () => {
  const server = await listen(':memory:');
  try {
    const headers = { Authorization: `Bearer ${'a'.repeat(64)}`, 'Content-Type': 'application/json' };
    assert.equal((await fetch(server.url)).status, 401);
    assert.equal((await fetch(server.url, { headers: { ...headers, Origin: 'https://untrusted.example' } })).status, 403);
    const preflight = await fetch(server.url, { method: 'OPTIONS', headers: { Origin: origin } });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/);
    const send = body => fetch(server.url, { method: 'PUT', headers, body: JSON.stringify(body) });
    assert.equal((await send({ nickname: 'private', completed: {}, games: {} })).status, 400);
    assert.equal((await send({ completed: { colors: 5000 }, games: {} })).status, 400);
    assert.equal((await send({ completed: {}, games: {}, video: 'a'.repeat(9000) })).status, 413);
    assert.equal((await fetch(server.url, { headers })).status, 404);
  } finally {
    await server.close();
  }
});
