(async function () {

    // Memory allocation for n pixels 
    const nPixels = 3840 ** 2;

    // Instantiate WA Source
    const { pixelSort, memory } = await instantiate(nPixels);

    // Reg ev
    onmessage = async e => {
        const { imageData, threshold, maxDepth, emitRate } = e.data;
        const { width, height } = imageData;
        const ui8 = new Uint8ClampedArray(memory.buffer);

        //// Load image data into wasm memory
        for (let i = 0, iL = imageData.data.length; i < iL; ++i) {
            ui8[i] = imageData.data[i];
        }

        //// Process partitions 
        const emitFn = emitGen(ui8, width, height);
        const count = width * height;
        process({ count, threshold, maxDepth, pixelSort, emitFn, emitRate });
        emitFn('done');
    };
})();



//
// Instantiate WA source
//

async function instantiate(nPixels) {
    const bytes = await (await fetch('./pixelsort.wasm')).arrayBuffer();
    const initial = nPixels * 4 / (64 * 1024);
    const memory = new WebAssembly.Memory({ initial });
    const importObject = { env: { memory } };
    const result = await WebAssembly.instantiate(bytes, importObject);
    return Object.assign({ memory }, result.instance.exports);
}



//
// Create emit fn which posts message w/ imageData payload
//

function emitGen(ui8, width, height) {
    return function (type) {
        const arr = ui8.slice(0, width * height * 4);
        const imageData = new ImageData(arr, width, height);
        postMessage({ type, imageData }, [imageData.data.buffer]);
    }
}



//
// Process
// - Two strategies to stop further partition
//   1. pixels count < {threshold}
//   2. partition depth > {maxDepth}
// - Notify host to update canvas w/ processed imagedata periodically
//   - call {emitFn} every {emitRate} partitions has been handled
//

function process({ count, threshold, maxDepth, pixelSort, emitFn, emitRate }) {
    const partitions = [{ front: 0, end: count - 1, depth: 0 }];
    let j = 0;
    while (j !== partitions.length) {
        const { front, end, depth } = partitions[j];
        const i = pixelSort(front, end, threshold);
        if (i > -1 && depth < maxDepth - 1) {
            partitions.push({ front, end: i - 1, depth: depth + 1 });
            partitions.push({ front: i + 1, end, depth: depth + 1 });
        }
        ++j;
        if (j % emitRate === 0) {
            emitFn('progress');
        }
    }
}
