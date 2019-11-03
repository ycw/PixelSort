importScripts('./as/dist/pixelsort.js');
let sorter;



(async function () {
    sorter = await PixelSort.init('./as/build/optimized.wasm');
    postMessage({ type: 'init' });
    onmessage = (ev) => {
        const { fnName, args = [] } = ev.data;
        self[fnName](...args);
    };
}());



function sort(iDat, nDivs, pDepth, seed) {
    const pSize = iDat.width * iDat.height / nDivs | 0;
    performance.mark('ts0');
    sorter.sort(iDat, pSize, pDepth, seed);
    performance.measure('m0', 'ts0');
    const dur = performance.getEntriesByName('m0')[0].duration;
    performance.clearMarks();
    performance.clearMeasures();
    postMessage({ type: 'done', iDat, dur }, [iDat.data.buffer]);
}
