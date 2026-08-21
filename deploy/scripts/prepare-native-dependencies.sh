#!/usr/bin/env bash
set -euo pipefail

release_root="${1:-/opt/passwo-study/current}"
compatible_release_root="${2:-/opt/passwo-study/current}"
node_gyp_js="/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js"

module_dir="$(readlink -f "${release_root}/node_modules/better-sqlite3" 2>/dev/null || true)"
if [[ -z "${module_dir}" || ! -d "${module_dir}" ]]; then
  echo "better-sqlite3 wurde unter ${release_root}/node_modules nicht gefunden." >&2
  exit 1
fi

smoke_test() {
  local root="$1"
  (
    cd "${root}"
    node <<'NODE' >/dev/null 2>&1
const Database = require('better-sqlite3');
const database = new Database(':memory:');
database.prepare('SELECT 1').get();
database.close();
NODE
  )
}

module_version() {
  local root="$1"
  node -p "require('$(readlink -f "${root}/node_modules/better-sqlite3")/package.json').version"
}

if smoke_test "${release_root}"; then
  echo "better-sqlite3 ist mit diesem Host kompatibel."
  exit 0
fi

# Ein bereits laufender Release ist die schnellste und sicherste Quelle für ein
# ABI-/glibc-kompatibles Native-Modul, solange dieselbe Paketversion verwendet wird.
if [[ -d "${compatible_release_root}" && "$(readlink -f "${compatible_release_root}")" != "$(readlink -f "${release_root}")" ]]; then
  compatible_module_dir="$(readlink -f "${compatible_release_root}/node_modules/better-sqlite3" 2>/dev/null || true)"
  if [[ -n "${compatible_module_dir}" && -d "${compatible_module_dir}" ]] && \
     smoke_test "${compatible_release_root}" && \
     [[ "$(module_version "${compatible_release_root}")" == "$(module_version "${release_root}")" ]]; then
    if [[ -f "${compatible_module_dir}/prebuilds/linux-x64.node" ]]; then
      mkdir -p "${module_dir}/prebuilds"
      cp "${compatible_module_dir}/prebuilds/linux-x64.node" "${module_dir}/prebuilds/linux-x64.node"
      rm -rf "${module_dir}/build"
    elif [[ -f "${compatible_module_dir}/build/Release/better_sqlite3.node" ]]; then
      if [[ -f "${module_dir}/prebuilds/linux-x64.node" ]]; then
        mv \
          "${module_dir}/prebuilds/linux-x64.node" \
          "${module_dir}/prebuilds/linux-x64.node.disabled-for-host"
      fi
      mkdir -p "${module_dir}/build/Release"
      cp \
        "${compatible_module_dir}/build/Release/better_sqlite3.node" \
        "${module_dir}/build/Release/better_sqlite3.node"
    fi

    if smoke_test "${release_root}"; then
      echo "better-sqlite3 wurde aus dem kompatiblen aktuellen Release übernommen."
      exit 0
    fi
  fi
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

if ! smoke_test "${release_root}"; then
  echo "better-sqlite3 konnte für diesen Host nicht vorbereitet werden." >&2
  exit 1
fi

echo "better-sqlite3 wurde auf dem Zielhost aus Source gebaut und geprüft."
