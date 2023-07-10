import * as wasm from "./kepler_sdk_wasm_bg.wasm";
import { __wbg_set_wasm } from "./kepler_sdk_wasm_bg.js";
__wbg_set_wasm(wasm);
export * from "./kepler_sdk_wasm_bg.js";
