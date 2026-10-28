// Builds batik-soft.png from docs/design/batik.png: every pixel becomes white, the original alpha is kept, and the
// alpha is faded to 0 towards the image edges (FADE of each side, smoothstep) so no straight edge or line is visible.
// Output goes to web/src/assets/ and mobile/assets/. Run from the repo root: node scripts/make-batik.mjs
// pngjs is taken from mobile/node_modules (no extra dependency at the repo root).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { PNG } = createRequire(join(root, 'mobile', 'package.json'))('pngjs');

const FADE = 0.12;
const smooth = (t) => t * t * (3 - 2 * t);

const src = PNG.sync.read(readFileSync(join(root, 'docs', 'design', 'batik.png')));
const { width: w, height: h, data } = src;
const fadeX = w * FADE;
const fadeY = h * FADE;

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const f = Math.min(1, Math.min(x, w - 1 - x) / fadeX, Math.min(y, h - 1 - y) / fadeY);
    data[i] = data[i + 1] = data[i + 2] = 255;
    data[i + 3] = Math.round(data[i + 3] * smooth(f));
  }
}

const out = PNG.sync.write(src);
for (const dir of ['web/src/assets', 'mobile/assets']) {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, 'batik-soft.png'), out);
  console.log(`wrote ${dir}/batik-soft.png (${w}x${h})`);
}
