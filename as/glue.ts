import * as loader from './node_modules/assemblyscript/lib/loader';



type API = {
    sort(len: number, pSz: number, pD: number, seed: number): void;
}

export async function init(wasmUrl: string) {
    const imports = {};
    const respond = await fetch(wasmUrl);
    const bytes = await respond.arrayBuffer();
    const wasm = await loader.instantiate<API>(bytes, imports);
    return new Sorter(wasm);
}



class Sorter {
    constructor(private wasm: loader.ASUtil & API) { }

    sort(iDat: ImageData, pSz: number, pD: number, seed: number = 1): ImageData {
        const data = iDat.data;
        const len = data.length;

        // Load 
        const view0 = new DataView(this.wasm.memory.buffer);
        for (let i = 0; i < len; ++i) {
            view0.setUint8(i, data[i]);
        }

        // Process
        this.wasm.sort(len, pSz, pD, seed);

        // Map 
        const view1 = new DataView(this.wasm.memory.buffer);
        for (let i = 0; i < len; ++i) {
            data[i] = view1.getUint8(i);
        }

        return iDat;
    }
}