const STATUS = {
    BUSY: Symbol(),
    SORT: Symbol(),
    DONE: Symbol()
};

const state = {
    nDivs: 3,
    pDepth: 2,
    seed: 1,
    imgUrl: '',
    activeElm: null,
    isEnabled: false,
    worker: null,
};

/// Main
(async function () {
    state.worker = new Worker('worker.js');
    state.worker.onmessage = (ev) => {
        if (ev.data.type == 'init') {
            handleUI();
            return;
        }
        if (ev.data.type == 'done') {
            showStatus(STATUS.DONE, ev.data);
            renderImage(ev.data.iDat);
            toggleControls(true);
            return;
        }
    };
}());

/// Reg Ev for UI controls
function handleUI() {
    /// Number of divisions
    document.querySelector('#el_nDivs').addEventListener('change', e => {
        state.nDivs = +e.target.value;
        toggleControls(false);
        sort();
    });
    /// Max partition depth
    document.querySelector('#el_pDepth').addEventListener('change', e => {
        state.pDepth = +e.target.value;
        toggleControls(false);
        sort();
    });
    /// Re-seed RNG
    document.querySelector('#el_reseed').addEventListener('click', e => {
        state.seed = Math.random() * (1 << 30) + 1;
        toggleControls(false);
        sort();
    });
    /// Drag n drop image file
    document.body.ondragover = e => e.preventDefault();
    document.body.ondrop = e => {
        e.preventDefault();
        if (state.imgUrl && !state.isEnabled) {
            showStatus(STATUS.BUSY);
            return;
        }
        for (const item of e.dataTransfer.items) {
            if (item.kind == 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                URL.revokeObjectURL(state.imgUrl);
                state.imgUrl = URL.createObjectURL(file);
                toggleControls(false);
                releaseCanvases();
                sort();
            }
        }
    };
    /// Sync
    document.querySelector('#el_nDivs').value = state.nDivs.toString();
    document.querySelector('#el_pDepth').value = state.pDepth.toString();
}

/// Sort the image from `state.imgUrl`
async function sort() {
    showStatus(STATUS.SORT);
    const { imgUrl, nDivs, pDepth, seed } = state;
    const image = await loadImageAsync(imgUrl);
    const iDat = getImageData(image);
    state.worker.postMessage({
        fnName: 'sort',
        args: [iDat, nDivs, pDepth, seed]
    }, [iDat.data.buffer]);
}

/// Toggle UI controls
function toggleControls(isEnabled) {
    state.isEnabled = isEnabled;
    /// Cache active control
    if (!isEnabled) {
        state.activeElm = document.activeElement;
    }
    for (const elm of document.querySelectorAll('input')) {
        elm.disabled = !isEnabled;
        /// Re-focus active control
        if (state.isEnabled && elm == state.activeElm) {
            elm.focus();
        }
    }
}

/// Put imageData on result canvas(#el_sorted)
function renderImage(imageData) {
    const canvas = document.querySelector('#el_sorted');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    document.body.append(canvas);
}

/// Load image async
function loadImageAsync(imageUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('error', reject);
        image.addEventListener('load', () => resolve(image));
        image.src = imageUrl;
    });
}

/// Show status message
function showStatus(type, data) {
    let msg = '';
    if (type == STATUS.SORT) {
        msg = 'Sorting, please wait.';
    } else if (type == STATUS.BUSY) {
        msg = 'Busy, please wait.';
    } else if (type == STATUS.DONE) {
        const t = data.dur | 0;
        msg = `Sorted. (${t}ms)`;
    }
    document.querySelector('#el_status').textContent = msg;
}

/// Draw image on canvas#el_original, then return its ImageData{}
function getImageData(image) {
    const canvas = document.querySelector('#el_original');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

/// GC bitmap
function releaseCanvases() {
    for (const elm of document.querySelectorAll('canvas')) {
        elm.width = 0;
        elm.height = 0;
    }
}