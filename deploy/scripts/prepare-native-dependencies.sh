#!/usr/bin/env bash
set -euo pipefail

release_root="${1:-/opt/passwo-study/current}"
module_dir="$(readlink -f "${release_root}/node_modules/better-sqlite3")"
node_gyp_js="/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js"

if [[ ! -d "${module_dir}" ]]; then
  echo "better-sqlite3 wurde unter ${release_root}/node_modules nicht gefunden." >&2
  exit 1
fi

if (
  cd "${release_root}"
  node <<'NODE' >/dev/null 2>&1
const Database = require('better-sqlite3');
const database = new Database(':memory:');
database.prepare('SELECT 1').get();
database.close();
NODE
); then
  echo "better-sqlite3 ist mit diesem Host kompatibel."
  exit 0
fi

if [[ ! -f "${node_gyp_js}" ]]; then
  echo "node-gyp wurde nicht unter ${node_gyp_js} gefunden." >&2
  exit 1
fi

if [[ -f "${module_dir}/prebuilds/linux-x64.node" ]]; then
  mv \
    "${module_dir}/prebuilds/linux-x64.node" \
    "${module_dir}/prebuilds/linux-x64.node.disabled-for-host"
fi

rm -rf "${module_dir}/build"
(
  cd "${module_dir}"
  node "${node_gyp_js}" rebuild --release
)

(
  cd "${release_root}"
  node <<'NODE'
const Database = require('better-sqlite3');
const database = new Database(':memory:');
const result = database.prepare('SELECT 1 AS ok').get();
console.log(result);
database.close();
NODE
)
