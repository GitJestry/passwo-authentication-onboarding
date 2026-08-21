import { gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetDirectory = fileURLToPath(new URL('../apps/study-web/dist/assets/', import.meta.url));
const compressibleExtensions = new Set(['.css', '.js', '.json', '.mjs', '.svg']);
const minimumBytes = 1_024;

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

let compressed = 0;
for (const path of filesBelow(assetDirectory)) {
  if (!compressibleExtensions.has(extname(path)) || statSync(path).size < minimumBytes) continue;
  writeFileSync(`${path}.gz`, gzipSync(readFileSync(path), { level: 9 }));
  compressed += 1;
}

process.stdout.write(`Precompressed ${String(compressed)} web assets for Nginx gzip_static.\n`);
