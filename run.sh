#!/bin/bash
set -e

# Clone VSCode if not present
if [ ! -d "vscode" ]; then
    git clone https://github.com/microsoft/vscode.git
    cd vscode
    git checkout tags/1.100.0
    npm install
    npm run compile
    npm run compile-web
    cd ..
fi

# Build wasm-wasi-core
cd wasm-wasi-core
echo "Building wasm-wasi-core"
npm install
npm run esbuild
cd ..

echo
cd wasm-wasi
echo "Building wasm-wasi"
npm install
npm run compile 
cd ..

echo 
echo "Building WASI from Rust"
rustc /workspaces/fr_task_4/ext4/src/web/lib.rs \
  --target=wasm32-wasip1 \
  --crate-type=cdylib \
  -o /workspaces/fr_task_4/ext4/src/web/module.wasm

echo
echo "Asyncifying WASI output"
# asyncify process
wasm-opt -O2 --asyncify \
  --pass-arg=asyncify-imports@env.hello_world \
  /workspaces/fr_task_4/ext4/src/web/module.wasm \
  -o /workspaces/fr_task_4/ext4/src/web/module_out.wasm

cd ext4
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run compile-web
cd ..

./vscode/scripts/code-web.sh \
    --coi \
    --host 0.0.0.0 \
    --extensionDevelopmentPath=/workspaces/fr_task_4/ext4 \
    --extensionPath=/workspaces/fr_task_4/wasm-wasi-core 