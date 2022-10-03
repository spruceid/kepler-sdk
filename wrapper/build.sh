#!/bin/sh
tsc -p . && (
  echo 'var fs = require("fs");
const re = new RegExp("../../wasm", "g");
const dist = fs.opendirSync("./dist");
while (true) {
  const entry = dist.readSync();
  if (!entry) {
    break;
  }
  if (entry.isFile() && entry.name.endsWith(".d.ts")) {
    let filepath = "./dist/" + entry.name;
    let file = fs.readFileSync(filepath, { encoding: "utf8" });
    let replaced = file.replace(re, "./wasm");
    fs.writeFileSync(filepath, replaced);
    console.log("rewritten " + filepath);
  }
}' | node
) && cp ../wasm/web/kepler_sdk_wasm.d.ts dist/wasm.d.ts
