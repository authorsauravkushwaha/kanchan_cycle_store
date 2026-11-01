/**
 * Generates the responsive photo variants the website serves.
 *
 * The owner-supplied catalogue photographs are 500–1288 px wide and up to
 * 257 kB each. A customer on a 3G connection in Kolaghat paid for the whole
 * file on every visit. Two smaller variants (400 px and 800 px) cut the
 * catalogue to a fraction of the size on a phone.
 *
 * The script also writes src/config/photoVariants.ts, a small generated map
 * from each photograph to its `srcset` value. The map is committed, so a
 * normal build never needs Sharp.
 *
 * Run with: npm run images
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const CYCLE_DIR = resolve('public/images/cycles');
const MANIFEST = resolve('src/config/photoVariants.ts');
const WIDTHS = [400, 800];
const QUALITY = 72;

const files = (await readdir(CYCLE_DIR)).filter(name => /\.(webp|jpg|jpeg|png)$/i.test(name) && !/-400\.|-800\./.test(name));
const map = {};
let written = 0;
let bytes = 0;

for (const file of files) {
  const source = join(CYCLE_DIR, file);
  const extension = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
  const base = file.slice(0, file.lastIndexOf('.'));
  const info = await sharp(source).metadata();
  const originalWidth = info.width ?? 0;
  const entries = [];
  for (const width of WIDTHS) {
    // Never upscale: a 500 px photograph keeps its own width.
    if (originalWidth < width) continue;
    const target = join(CYCLE_DIR, `${base}-${width}.${extension}`);
    await mkdir(CYCLE_DIR, { recursive: true });
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .toFormat(extension === 'png' ? 'png' : extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : 'webp', { quality: QUALITY })
      .toFile(target);
    written += 1;
    bytes += (await stat(target)).size;
    entries.push(`/images/cycles/${base}-${width}.${extension} ${width}w`);
  }
  entries.push(`/images/cycles/${file} ${originalWidth}w`);
  map[`/images/cycles/${file}`] = entries.join(', ');
}

// The homepage hero fills the first screen on a phone. A 1200 px WebP is far
// lighter than the 1600 px JPEG it replaces on desktop.
const HERO_SOURCE = resolve('public/images/kanchan-team-hero.jpeg');
const HERO_TARGET = resolve('public/images/kanchan-team-hero.webp');
const heroInfo = await sharp(HERO_SOURCE).metadata();
await sharp(HERO_SOURCE)
  .resize({ width: Math.min(1200, heroInfo.width ?? 1200), withoutEnlargement: true })
  .toFormat('webp', { quality: 74 })
  .toFile(HERO_TARGET);
const heroBytes = (await stat(HERO_TARGET)).size;

const body = `/**
 * GENERATED FILE — do not edit by hand.
 * Created by scripts/generate-image-variants.mjs. Run \`npm run images\` after
 * replacing a catalogue photograph.
 */
export const photoSrcSets: Record<string, string> = ${JSON.stringify(map, null, 2)};

/** The \`srcset\` for a catalogue photograph, or undefined for remote images. */
export const photoSrcSet = (src: string): string | undefined => photoSrcSets[src];
`;
await writeFile(MANIFEST, body, 'utf8');
console.log(`Image variants: ${written} files (${Math.round(bytes / 1024)} kB) and ${Object.keys(map).length} srcset entries for ${files.length} catalogue photographs. Hero WebP: ${Math.round(heroBytes / 1024)} kB.`);
