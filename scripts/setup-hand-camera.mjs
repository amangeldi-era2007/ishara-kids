import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const modelUrl = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const modelSha256 = 'fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1';
const assets = fileURLToPath(new URL('../public/ai/', import.meta.url));
const modelPath = join(assets, 'hand_landmarker.task');
const require = createRequire(import.meta.url);
const packageWasm = join(dirname(require.resolve('@mediapipe/tasks-vision')), 'wasm');
const publicWasm = join(assets, 'wasm');

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function publishFile(path, write) {
  const temporaryPath = `${path}.${randomUUID()}`;
  try {
    await write(temporaryPath);
    await rename(temporaryPath, path);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

await mkdir(publicWasm, { recursive: true });

// FilesetResolver.forVisionTasks uses the classic loader unless useModule is enabled.
for (const variant of ['internal', 'nosimd_internal']) {
  for (const extension of ['js', 'wasm']) {
    const name = `vision_wasm_${variant}.${extension}`;
    await publishFile(join(publicWasm, name), (path) => copyFile(join(packageWasm, name), path));
  }
}

let cachedModel;
try {
  cachedModel = await readFile(modelPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (!cachedModel || sha256(cachedModel) !== modelSha256) {
  const response = await fetch(modelUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not download Hand Landmarker: HTTP ${response.status}`);
  const model = Buffer.from(await response.arrayBuffer());
  if (sha256(model) !== modelSha256) throw new Error('Hand Landmarker checksum did not match');

  await publishFile(modelPath, (path) => writeFile(path, model));
}
