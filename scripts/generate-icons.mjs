/**
 * Generates the Android / PWA icon set from one vector source.
 * Run `npm run icons` after changing the artwork, then commit the PNGs in public/icons/.
 * The artwork is our own: a bicycle wheel in the shop's forest-green and yellow colours.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const GREEN = '#14432f';
const GREEN_DARK = '#0b2a1f';
const YELLOW = '#f4cf47';
const CREAM = '#faf9f4';

/** `inset` keeps the mark inside Android's maskable safe zone. */
function artwork({ inset = 0, rounded = true, width = 512 } = {}) {
  const size = 512;
  const scale = 1 - inset * 2;
  const offset = size * inset;
  const spokes = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4;
    const x1 = 256 + Math.cos(angle) * 54;
    const y1 = 256 + Math.sin(angle) * 54;
    const x2 = 256 + Math.cos(angle) * 132;
    const y2 = 256 + Math.sin(angle) * 132;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${GREEN_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" ${rounded ? 'rx="112"' : ''} fill="url(#bg)"/>
  <g transform="translate(${offset} ${offset}) scale(${scale}) translate(${(1 - scale) / scale * 256} ${(1 - scale) / scale * 256})">
    <circle cx="256" cy="256" r="150" fill="none" stroke="${CREAM}" stroke-width="18"/>
    <circle cx="256" cy="256" r="132" fill="none" stroke="${CREAM}" stroke-width="4" opacity=".45"/>
    <g stroke="${CREAM}" stroke-width="9" stroke-linecap="round" opacity=".92">${spokes}</g>
    <circle cx="256" cy="256" r="30" fill="${YELLOW}"/>
    <circle cx="256" cy="256" r="12" fill="${GREEN_DARK}"/>
    <path d="M150 336c34 34 74 50 106 50s72-16 106-50" fill="none" stroke="${YELLOW}" stroke-width="16" stroke-linecap="round"/>
  </g>
</svg>`;
}

const out = resolve('public/icons');
await mkdir(out, { recursive: true });
const targets = [
  { file: 'icon-192.png', size: 192, svg: artwork({ inset: 0.04, rounded: false, width: 192 }) },
  { file: 'icon-512.png', size: 512, svg: artwork({ inset: 0.04, rounded: false }) },
  { file: 'icon-maskable-192.png', size: 192, svg: artwork({ inset: 0.14, rounded: false, width: 192 }) },
  { file: 'icon-maskable-512.png', size: 512, svg: artwork({ inset: 0.14, rounded: false }) },
  { file: 'apple-touch-icon.png', size: 180, svg: artwork({ inset: 0.06, rounded: false, width: 180 }) },
];
for (const target of targets) {
  const buffer = await sharp(Buffer.from(target.svg)).resize(target.size, target.size).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(resolve(out, target.file), buffer);
  console.log(`${target.file} — ${(buffer.length / 1024).toFixed(1)} kB`);
}
await writeFile(resolve('public/favicon.svg'), artwork({ inset: 0.02, rounded: true, width: 64 }) + '\n');
console.log('favicon.svg updated.');
