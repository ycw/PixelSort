import { $ } from '../helper/dom.js';

let divisionCount;
let partitionDepth;
let seed;
let onSubmit;
let fileUrl;

export function init(o) {
    divisionCount = o.divisionCount;
    partitionDepth = o.partitionDepth;
    seed = o.seed;
    onSubmit = o.onSubmit;

    $('#el_divisionCount').oninput = handleDivisionCount;
    $('#el_partitionDepth').oninput = handlePartitionDepth;
    $('#el_seed').oninput = handleSeed;
    $('#el_submit').onclick = handleSubmit;
    $('body').ondragover = handleDragOver;
    $('body').ondrop = handleDrop;

    $('#el_divisionCount').value = divisionCount;
    $('#el_partitionDepth').value = partitionDepth;
    $('#el_seed').value = seed;
}

function handleDivisionCount(e) {
    divisionCount = parseInt(e.target.value);
}

function handlePartitionDepth(e) {
    partitionDepth = parseInt(e.target.value);
}

function handleSeed(e) {
    seed = parseInt(e.target.value);
}

function handleSubmit() {
    if (fileUrl) {
        onSubmit({ fileUrl, divisionCount, partitionDepth, seed });
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    for (const item of e.dataTransfer.items) {
        if (item.kind == 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            fileUrl && URL.revokeObjectURL(fileUrl);
            fileUrl = URL.createObjectURL(file);
            handleSubmit();
            return;
        }
    }
    return alert('Require an image file');
}
