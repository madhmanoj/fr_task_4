cd rust-wasm-interop 
npm install
cd ..

echo 

rustc /workspaces/fr_task_4/rust-wasm-interop/src/lib.rs \
  --target=wasm32-wasip1 \
  --crate-type=cdylib \
  -o /workspaces/fr_task_4/rust-wasm-interop/dist/module.wasm

# asyncify process
wasm-opt -O2 --asyncify \
  --pass-arg=asyncify-imports@env.hello_world \
  /workspaces/fr_task_4/rust-wasm-interop/dist/module.wasm \
  -o /workspaces/fr_task_4/rust-wasm-interop/dist/module_out.wasm

node /workspaces/fr_task_4/rust-wasm-interop/dist/index.js
