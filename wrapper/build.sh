#!/bin/sh
tsc -p . && sed -i 's/\(..\/..\/wasm\)/.\/wasm/g' dist/*.d.ts && cp ../wasm/web/kepler_sdk_wasm.d.ts dist/wasm.d.ts