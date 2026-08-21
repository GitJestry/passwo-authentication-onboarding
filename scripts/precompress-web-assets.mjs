import { gzipSync } from 'node:zlib';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetDirectory = fileURLToPath(new URL('../apps/study-web/dist/assets/', import.meta.url));
const referenceDirectory = fileURLToPath(
  new URL(
    '../research/private/reference/secaware/passwords-authentication/2026-07-26/study-build/',
    import.meta.url,
  ),
);
const compressibleExtensions = new Set([
  '.css',
  '.htm',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.svg',
  '.txt',
  '.vtt',
  '.xml',
]);
const minimumBytes = 1_024;

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

let appAssetsCompressed = 0;
let referenceAssetsCompressed = 0;
for (const [directory, recordCompressed] of [
  [assetDirectory, () => (appAssetsCompressed += 1)],
  [referenceDirectory, () => (referenceAssetsCompressed += 1)],
]) {
  if (!existsSync(directory)) continue;
  for (const path of filesBelow(directory)) {
    if (!compressibleExtensions.has(extname(path)) || statSync(path).size < minimumBytes) continue;
    writeFileSync(`${path}.gz`, gzipSync(readFileSync(path), { level: 9 }));
    recordCompressed();
  }
}

process.stdout.write(
  `Precompressed ${String(appAssetsCompressed)} app assets and ${String(referenceAssetsCompressed)} reference assets for Nginx gzip_static.\n`,
);
