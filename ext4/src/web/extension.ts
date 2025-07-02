import { Wasm } from '@vscode/wasm-wasi/v1';
import * as vscode from 'vscode';
// import * as Asyncify from 'asyncify-wasm';
import { WASI } from '@tybys/wasm-util';
const JSONfn = require('/workspaces/fr_task_4/ext4/node_modules/json-fn/jsonfn.js');

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ext4" is now active in the web extension host!');
	const wasm: Wasm = await Wasm.load();

	const disposable = vscode.commands.registerCommand('ext4.helloWorld', async () => {
		vscode.window.showInformationMessage('Hello World from extension_4 in a web extension host!');
		const wasi = new WASI({});

		const pty = wasm.createPseudoterminal();
		const terminal = vscode.window.createTerminal({
			name: 'Run Rust Example',
			pty,
			isTransient: true
		});
		terminal.show(true);
		const raw = await vscode.workspace.fs.readFile(
			vscode.Uri.joinPath(
				context.extensionUri,
				"src",
				"web",
				"module_out.wasm"
			)
		);
		const importObject: WebAssembly.Imports = {
			module1: {
				hello_world: async () => {
					console.log("Hello1");
					console.log("Hello2");
					await new Promise<void>(res => setTimeout(() => {
						console.log("World!");
						res();
					}, 1000));
					console.log("World!");
				}
			}
		};
		const bytes = new Uint8Array(raw);
		const module = await WebAssembly.compile(bytes);
		//const { instance, module } = await Asyncify.instantiate(bytes, importObject);
		const process = await wasm.createProcess(
			'hello',
			module,
			{ 
				stdio: pty.stdio,
			}
		);
		let arg: string = JSONfn.stringify(importObject);
		const result = await process.run(arg);
		if (result !== 0) {
			console.log(`Process hello ended with error: ${result}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
