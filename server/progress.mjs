import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';

const maxBytes = 8 * 1024;
const keyPattern = /^[a-f0-9]{64}$/;
const id = z.string().regex(/^[a-z][a-z0-9:-]{0,63}$/);
const snapshot = z.strictObject({
  completed: z.record(id, z.literal([30, 40, 50])).refine(v => Object.keys(v).length <= 64),
  games: z.record(id, z.literal(true)).refine(v => Object.keys(v).length <= 64),
});

async function readJson(request) {
  const parts = [];
  let size = 0;
  for await (const part of request.iterator({ destroyOnReturn: false })) {
    size += part.length;
    if (size > maxBytes) return { error: 413 };
    parts.push(part);
  }
  try {
    return { value: JSON.parse(Buffer.concat(parts).toString('utf8')) };
  } catch {
    return { error: 400 };
  }
}

export function createProgressServer({ database, allowedOrigins }) {
  const db = new DatabaseSync(database);
  db.exec(`PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS backups (
      key_hash TEXT PRIMARY KEY,
      snapshot TEXT NOT NULL
    ) STRICT`);
  const get = db.prepare('SELECT snapshot FROM backups WHERE key_hash = ?');
  const put = db.prepare(`INSERT INTO backups (key_hash, snapshot) VALUES (?, ?)
    ON CONFLICT(key_hash) DO UPDATE SET snapshot = excluded.snapshot`);
  const remove = db.prepare('DELETE FROM backups WHERE key_hash = ?');

  const server = createServer({ headersTimeout: 10000, requestTimeout: 20000 }, async (request, response) => {
    function reply(status, value) {
      if (value !== undefined) response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.writeHead(status);
      response.end(value === undefined ? undefined : JSON.stringify(value));
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Vary', 'Origin');
    const { origin, authorization } = request.headers;
    if (origin) {
      if (!allowedOrigins.has(origin)) return reply(403, { error: 'origin_not_allowed' });
      response.setHeader('Access-Control-Allow-Origin', origin);
    }
    try {
      if (request.url === '/api/health' && request.method === 'GET') return reply(200, { ok: true });
      if (request.url !== '/api/progress') return reply(404, { error: 'not_found' });
      const method = request.method;
      if (method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        return reply(204);
      }
      if (method !== 'GET' && method !== 'PUT' && method !== 'DELETE') {
        response.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
        return reply(405, { error: 'method_not_allowed' });
      }
      const key = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
      if (!keyPattern.test(key)) return reply(401, { error: 'invalid_key' });
      const hash = createHash('sha256').update(key).digest('hex');
      if (method === 'GET') {
        const row = get.get(hash);
        return row ? reply(200, JSON.parse(row.snapshot)) : reply(404, { error: 'backup_not_found' });
      }
      if (method === 'DELETE') {
        remove.run(hash);
        return reply(204);
      }
      if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        return reply(415, { error: 'expected_json' });
      }
      const body = await readJson(request);
      if (body.error) {
        if (body.error === 413) response.setHeader('Connection', 'close');
        return reply(body.error, { error: body.error === 413 ? 'too_large' : 'invalid_json' });
      }
      const parsed = snapshot.safeParse(body.value);
      if (!parsed.success) return reply(400, { error: 'invalid_progress' });
      put.run(hash, JSON.stringify(parsed.data));
      return reply(204);
    } catch {
      if (!response.headersSent && !response.destroyed) reply(500, { error: 'server_error' });
    }
  });
  server.once('close', () => db.close());
  return server;
}
