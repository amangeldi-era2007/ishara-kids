import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createProgressServer } from './progress.mjs';

const database = resolve(process.env.PROGRESS_DB_PATH || '.local-data/progress.sqlite');
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const origins = process.env.PROGRESS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';
const allowedOrigins = new Set(origins.split(',').map(origin => new URL(origin.trim()).origin));
mkdirSync(dirname(database), { recursive: true });
const server = createProgressServer({ database, allowedOrigins });
server.listen(port, host, () => console.log(`Ishara Kids progress API: http://${host}:${port}`));
