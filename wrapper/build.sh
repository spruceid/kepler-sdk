#!/bin/sh
tsc -p . && awk -i inplace '{gsub(/..\/..\/wasm/, "./wasm");}1' dist/*.d.ts && cp ../wasm/web/kepler_sdk_wasm.d.ts dist/wasm.d.ts
