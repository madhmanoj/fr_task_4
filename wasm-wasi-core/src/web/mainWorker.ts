/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import RIL from './ril';
import { Asyncify } from '@tybys/wasm-util';
const JSONfn = require('/workspaces/fr_task_4/wasm-wasi-core/node_modules/json-fn/jsonfn.js');
RIL.install();

import { TraceWasiHost, Tracer, WasiHost} from '../common/host';
import { BrowserHostConnection } from './connection';
import { ServiceMessage, StartMainMessage, WorkerReadyMessage } from '../common/connection';
import { CapturedPromise } from '../common/promises';

class MainBrowserHostConnection extends BrowserHostConnection {

	private _done: CapturedPromise<void>;

	constructor(port: MessagePort | Worker | DedicatedWorkerGlobalScope) {
		super(port);
		this._done = CapturedPromise.create();
	}

	public done(): Promise<void> {
		return this._done.promise;
	}

	protected async handleMessage(message: ServiceMessage): Promise<void> {
		if (StartMainMessage.is(message)) {
			const asyncify = new Asyncify();
			const module = message.module;
			const memory = message.memory;
			const importObject: WebAssembly.Imports = JSONfn.parse(message.imports);
			let host = WasiHost.create(this);
			let tracer: Tracer | undefined;
			if (message.trace) {
				tracer  = TraceWasiHost.create(this, host);
				host = tracer.tracer;
			};
			importObject.wasi_snapshot_preview1 = host;
			importObject.wasi = host;
			const imports: WebAssembly.Imports = {
				wasi_snapshot_preview1: host,
				wasi: host
			};
			if (memory !== undefined) {
				imports.env = {
					memory: memory
				};
				importObject.env = {
					memory: memory
				};
			};
			//console.log(importObject.module1.hello_world);
			const base_instance  = await WebAssembly.instantiate(module, importObject);
			const instance = asyncify.init(base_instance.exports.memory, base_instance, {
				wrapExports: ['_start']
			});
			host.initialize(memory ?? instance);
			(instance.exports._start as Function)();
			if (tracer !== undefined) {
				tracer.printSummary();
			}
			this._done.resolve();
		}
	}
}

async function main(port: MessagePort | Worker | DedicatedWorkerGlobalScope): Promise<void> {
	const connection = new MainBrowserHostConnection(port);
	try {
		const ready: WorkerReadyMessage = { method: 'workerReady' };
		connection.postMessage(ready);
		await connection.done();
	} finally {
		connection.postMessage({ method: 'workerDone' });
		connection.destroy();
	}
}

main(self).catch(RIL().console.error).finally(() => close());