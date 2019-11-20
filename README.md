# About

Pixel sorting using WebAssembly.

Tool
- https://ycw.github.io/PixelSort/app/
- Supports 8K



# Detail
- Non-recursive quicksort
  - Solved "stack size limit"  

- Shortcircuit
  - Avoid N^2 case
  - Control by partiton depth & partition size

- Random-pick pivot 
  - Avoid consecutive orphan partitions 


# Handcraft Version

> primitive/pixelsort.wat

- Requires [`wat2wasm`](https://github.com/WebAssembly/wabt) to build
- **Not** used by this project anymore