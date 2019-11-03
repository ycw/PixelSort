class Pixel {
  public r: u8;
  public g: u8;
  public b: u8;
  public a: u8;
  public lum: f32;

  constructor(ind: i32) {
    let os:i32;
    this.r = load<u8>(os = ind << 2);
    this.g = load<u8>(os + 1);
    this.b = load<u8>(os + 2);
    this.a = load<u8>(os + 3);
    this.lum = 0.299 * this.r + 0.587 * this.g + 0.114 * this.b; 
  }
}



export function sort(len: i32, pSz: i32, pD: u32, seed: i32): void {

  //@ts-ignore
  Math.seedRandom(seed);

  const pixels = new Array<Pixel>(len >> 2);
  const iL = pixels.length;

  for (let i = 0; i < iL; ++i) {
    pixels[i] = new Pixel(i);
  }

  quickSort(pixels, pSz, pD);

  let p: Pixel;
  let os:i32;
  for (let i = 0; i < iL; ++i) {
    p = pixels[i];
    store<u8>(os = i << 2, p.r);
    store<u8>(os + 1, p.g);
    store<u8>(os + 2, p.b);
    store<u8>(os + 3, p.a);
  }
}



class Partition {
  constructor(public front: i32, public end: i32, public depth: u32) { }
}

function quickSort(pixels: Array<Pixel>, pSz: i32, pD: u32): void {
  const parts: Array<Partition> = [new Partition(0, pixels.length - 1, 0)];
  let part: Partition;
  let front: i32;
  let end: i32;
  let depth: u32;
  let i: i32;
  let j: i32;
  let k: i32;
  let pivot: f32;
  let tmp: Pixel;
  while (parts.length) {
    part = parts.pop();
    front = part.front;
    end = part.end;
    depth = part.depth;
    if (end - front < pSz || depth > pD) {
      continue;
    }
    i = (j = front) - 1;
    k = front + <i32>(Math.random() * (end - front));
    pivot = pixels[k].lum;
    while (j <= end) {
      if (pixels[j].lum < pivot || j == k) {
        tmp = pixels[++i];
        pixels[i] = pixels[j];
        pixels[j] = tmp;
      }
      ++j;
    }
    parts.push(new Partition(front, i - 1, depth + 1));
    parts.push(new Partition(i + 1, end, depth + 1));
  }
} 
