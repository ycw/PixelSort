(async function () {
    const canvas0 = document.querySelector('#elOld');
    const canvas1 = document.querySelector('#elSorted');
    const worker = new Worker('worker.js');

    // 
    // States
    //

    let imgUrl = '';
    let isDoingJob = false;
    let controls = {
        divisions: 3,
        maxDepth: 10
    };

    //
    // Handle worker callbacks
    //

    worker.onmessage = e => {
        if (e.data.type === 'done') {
            isDoingJob = false;
        }
        put(e.data.imageData, canvas1);
    };

    //
    // Handle DND
    //

    document.body.addEventListener('dragover', e => {
        e.preventDefault();
    });

    document.body.addEventListener('drop', e => {
        e.preventDefault();

        if (isDoingJob) {
            alert(`Refused(current job is not done yet)`);
            return;
        }

        for (const item of e.dataTransfer.items) {
            if (isImageFile(item)) {
                URL.revokeObjectURL(imgUrl);
                imgUrl = URL.createObjectURL(item.getAsFile());
                clear(canvas0);
                clear(canvas1);
                sortByImageUrl(imgUrl);
                isDoingJob = true;
                break;
            }
        };
    });

    //
    // Handle "divisions" input
    //

    document.querySelector('#elDivisions').addEventListener('change', e => {
        controls.divisions = Number.parseInt(e.target.value);
        if (imgUrl && !isDoingJob) {
            sortByImageUrl(imgUrl);
        }
    });

    //
    // Handle "maxDepth" input
    //

    document.querySelector('#elMaxDepth').addEventListener('change', e => {
        controls.maxDepth = Number.parseInt(e.target.value);
        if (imgUrl && !isDoingJob) {
            sortByImageUrl(imgUrl);
        }
    });

    //
    // Handle .rng controls  
    //

    handleUI_RngControls(controls);

    //
    // Pixel sort an image, from {url}
    //

    async function sortByImageUrl(url) {

        const imageData = await loadImageDataAsync(url, canvas0);

        //// Config effect

        const threshold = imageData.width * imageData.height / controls.divisions | 0;
        const maxDepth = controls.maxDepth; // stop further partitions
        const emitRate = 10000; // emit progress event every N partitions

        worker.postMessage({
            imageData, threshold, maxDepth, emitRate
        }, [imageData.data.buffer]);
    }
})();

//
// Predicate: check if a DND item is an image file
//

function isImageFile(item) {
    return item.kind == 'file' && item.type.startsWith('image/');
}

//
// Get ImageData{} of an image from {imgUrl} 
//

async function loadImageDataAsync(imgUrl, canvas) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(draw(image, canvas)));
        image.addEventListener('error', reject);
        image.src = imgUrl;
    });
}

//
// "Put" ImageData{} on {canvas} 
//

function put(imageData, canvas) {
    const { width, height } = imageData;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
}

//
// Draw {image} on {canvas}; returns ImageData{}
//

function draw(image, canvas) {
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

//
// Clear {canvas}
//

function clear(canvas) {
    canvas.width = 0;
    canvas.height = 0;
}

// ----
//
// UI
//
// ----


//
// Handle .rng controls
//

function handleUI_RngControls(controls) {
    const rngs = document.querySelectorAll('.rng');
    const hldr = e => updateUI_RngControl(e.target);
    for (const rng of rngs) {
        const el = rng.querySelector('input');
        el.addEventListener('input', hldr);
        const key = el.id.substring(2).toLowerCase();
        for (const [k, v] of Object.entries(controls)) {
            if (k.toLowerCase() == key) {
                el.value = v;
                break;
            }
        }
        updateUI_RngControl(el);
    }
}

//
// .rng "input" handler
//

function updateUI_RngControl(input) {
    const max = +input.getAttribute('max');
    const min = +input.getAttribute('min');
    const n = (input.value - min) / (max - min);
    const parent = input.parentNode
    parent.style.setProperty('--value', n);
    parent.querySelector('output').textContent = input.value;
}


