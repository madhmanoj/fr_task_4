const fs = require("fs");
const wasmBuffer = fs.readFileSync("/workspaces/fr_task_4/rust-wasm-interop/dist/module.wasm");

const importObject = {
  env: {
    hello_world: () => {
      console.log("Hello from JavaScript!");
    }
  }
};

(async () => {
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);
  wasmModule.instance.exports.main(); // This calls Rust's main(), which calls JS's hello_world
})();
