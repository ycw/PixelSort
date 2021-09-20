export const id_ui8ca = idof<Uint8ClampedArray>();

export function sort(
  arr: Uint8ClampedArray,
  w: i32,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(arr.length);
  const h = (arr.length / w) >> 2;
  const cols = new Array<Px>(h);
  for (let i = 0, $k: u32; i < w; ++i) {
    for (let j = 0; j < h; ++j) { // read
      $k = (j * w + i) << 2;
      unchecked(cols[j] = new Px(arr[$k], arr[$k + 1], arr[$k + 2]));
    }
    cols.sort(i & 1
      ? (a, b) => Math.abs(a.l - b.l) < .1 ? (a.l > b.l ? 1 : -1) : 0
      : (a, b) => Math.abs(a.l - b.l) > .1 ? (a.l < b.l ? 1 : -1) : 0
    );
    for (let j = 0; j < h; ++j) { // write
      $k = (j * w + i) << 2;
      unchecked(out[$k] = cols[j].r);
      unchecked(out[$k + 1] = cols[j].g);
      unchecked(out[$k + 2] = cols[j].b);
      unchecked(out[$k + 3] = 255);
    }
  }
  return out;
}

class Px {
  l: f32;
  constructor(
    public r: u8,
    public g: u8,
    public b: u8,
  ) {
    this.l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
}