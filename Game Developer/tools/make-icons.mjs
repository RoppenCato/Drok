// Makes the two PWA icons, a flat green square with rounded corners on the page's dark blue, as PNG files with no
// image package: the PNG bytes are written here, with Node's own zlib. Run: npm run icons. Writes
// client/public/pwa-192x192.png and pwa-512x512.png. The Art Director's real icon replaces these files; nothing else changes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const OUT = join(import.meta.dirname, '..', 'client', 'public');
const BACK = [0x1b, 0x1f, 0x2a];
const SQUARE = [0x4f, 0xb0, 0x6d];

// PNG chunks carry a CRC-32 each.
const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** A square PNG from RGBA bytes: the header, one deflated block of rows (each with a "no filter" byte), the end. */
function png(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bits per channel
  header[9] = 6; // colour type: RGBA
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

/** Inside a rounded rectangle: within the inner rectangle, or within a corner's circle. */
function inRounded(px, py, x, y, w, h, r) {
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

function draw(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const box = { x: size * 0.16, y: size * 0.16, w: size * 0.68, h: size * 0.68, r: size * 0.14 };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = inRounded(x + 0.5, y + 0.5, box.x, box.y, box.w, box.h, box.r) ? SQUARE : BACK;
      const i = (y * size + x) * 4;
      rgba[i] = c[0];
      rgba[i + 1] = c[1];
      rgba[i + 2] = c[2];
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

mkdirSync(OUT, { recursive: true });
for (const size of [192, 512]) {
  const file = join(OUT, `pwa-${size}x${size}.png`);
  writeFileSync(file, png(size, draw(size)));
  console.log(`wrote ${file}`);
}
