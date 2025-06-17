const fs = require("fs");
const Asyncify = require("asyncify-wasm");
const wasmBuffer = fs.readFileSync("/workspaces/fr_task_4/rust-wasm-interop/dist/module_out.wasm");

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const importObject = {
  env: {
    async hello_world() {
      console.log("Hello");
      await sleep(1000);
      console.log("World!");
    }
  }
};

(async () => {
  const wasmModule = await Asyncify.instantiate(wasmBuffer, importObject);
  await wasmModule.instance.exports.main(); 
})();
