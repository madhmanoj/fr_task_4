import { readFileSync } from "fs";
import { Asyncify, WASI } from "@tybys/wasm-util";

const asyncify = new Asyncify();

const wasi = new WASI({});

const wasmBuffer = readFileSync("/workspaces/fr_task_4/rust-wasm-interop/dist/module_out.wasm");

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const importObject = {
  wasi_snapshot_preview1: wasi.wasiImport,
  env: {
    async hello_world() {
      console.log("Hello");
      await sleep(1000);
      console.log("World!");
    }
  }
};


const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);
const asyncifiedInstance = asyncify.init(wasmModule.instance.exports.memory, wasmModule.instance, {
  wrapExports: ['_start']
})
wasi.start(asyncifiedInstance);
