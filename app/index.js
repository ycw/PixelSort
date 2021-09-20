import * as loader from "//cdn.jsdelivr.net/npm/@assemblyscript/loader/index.js";

const elInput = document.querySelector("input");
const elOutput = document.querySelector("output");

loader.instantiate(
  fetch("../build/optimized.wasm"), {}
).then(({ exports }) => {
  // glue
  const sort = (ui8ca, w) => {
    performance.mark("sort-start");
    const ptr_in = exports.__newArray(exports.id_ui8ca, ui8ca);
    const ptr_out = exports.sort(ptr_in, w);
    const out = exports.__getArray(ptr_out);
    performance.measure("sort", "sort-start");
    return new Uint8ClampedArray(out);
  };

  // ui
  let objectUrl;
  elInput.oninput = async (e) => {
    const file = e.target.files[0];
    if (file.type.startsWith("image/")) {
      elInput.disabled = true;
      await process(file);
      elInput.disabled = false;

      console.log(performance.getEntriesByName("sort")[0].duration);
      performance.clearMeasures();
      performance.clearMarks();
    } else {
      alert("Requires an image");
    }
  };

  async function process(file) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    
    const can = await intoCanvas(objectUrl);
    const ctx = can.getContext("2d");
    const { data } = ctx.getImageData(0, 0, can.width, can.height);
    const sorted = sort(data, can.width);
    const imageData = new ImageData(sorted, can.width, can.height);
    ctx.putImageData(imageData, 0, 0);

    const blob = await toBlob(can);
    URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.src = objectUrl;
    elOutput.querySelector("img")?.remove();
    elOutput.prepend(img);
  }
}).catch(alert);

function intoCanvas(imgUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const can = document.createElement("canvas");
      can.width = img.width;
      can.height = img.height;
      can.getContext("2d").drawImage(img, 0, 0);
      res(can);
    };
    img.onerror = rej;
    img.src = imgUrl;
  });
}

function toBlob(canvas) {
  return new Promise((res, rej) => {
    canvas.toBlob(res);
  });
}