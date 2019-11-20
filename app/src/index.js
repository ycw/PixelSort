import { $ } from './helper/dom.js'
import * as cForm from './control/form.js';

let sorter;
let canvas;
let isProcessing;

(async function () {
    sorter = await PixelSort.init('../../dist/optimized.wasm');
    canvas = $('canvas');
    isProcessing = false;
    handleUI();
}());

function handleUI() {
    cForm.init({
        divisionCount: 5,
        partitionDepth: 5,
        seed: 1,
        onSubmit
    });
}

async function onSubmit(o) {
    if (!o.fileUrl || isProcessing) {
        return;
    }
    
    log('Processing...');
    setProcessingState(true);
    setTimeout(sort, 10, o);
}

async function sort(o) {
    const image = await loadImageAsync(o.fileUrl);
    const imageData = imageToImageData(image);
    const pSz = imageData.width * imageData.height / o.divisionCount  | 0;
    const pD = o.partitionDepth;
    
    performance.mark('m0');
    sorter.sort(imageData, pSz, pD, o.seed);
    performance.measure('t0', 'm0');
    
    const { duration } = performance.getEntriesByName('t0')[0];
    log(`done. (${duration | 0}ms)`);

    performance.clearMarks();
    performance.clearMeasures();

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    setProcessingState(false);
}

//----
// helerps
//----

async function loadImageAsync(imageUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onerror = reject;
        image.onload = () => resolve(image);
        image.src = imageUrl;
    });
}

function imageToImageData(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

function log(msg) {
    $('#el_status').textContent = msg;
}

function setProcessingState(processingState) {
    isProcessing = processingState;
    $('#el_submit').disabled = isProcessing;
}