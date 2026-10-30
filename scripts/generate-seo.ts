/** Build-time SEO and GitHub Pages refresh support. No guessed production domain. */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { shop } from '../src/config/shop.ts';
import { validateCatalog } from '../src/lib/configValidation.ts';

const catalogErrors = validateCatalog(shop.catalog, shop.categories.map(category => category.id));
if (!/^[1-9]\d{9,14}$/.test(shop.contact.whatsapp)) catalogErrors.push('WhatsApp number must be international digits only.');
if (!/^\+[1-9]\d{9,14}$/.test(shop.contact.phone)) catalogErrors.push('Phone must use international + format.');
for (const service of shop.services) if (service.price !== null && !service.confirmed) catalogErrors.push(`Unconfirmed service ${service.id} must not publish a price.`);
for (const offer of shop.offers) if (offer.verified && (!offer.title.en || !offer.title.bn || !offer.description.en || !offer.description.bn)) catalogErrors.push(`Verified offer ${offer.id} needs bilingual content.`);
if (catalogErrors.length) throw new Error(catalogErrors.join('\n'));
const dist = resolve(process.env.SEO_OUTPUT_DIR || 'dist');
await mkdir(dist, { recursive: true });
const base = `/${(process.env.VITE_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`;
const basePath = base === '/' ? '/' : `${base}/`;
const configuredUrl = process.env.VITE_SITE_URL || shop.websiteUrl;
let websiteUrl: string | null = null;
if (configuredUrl) {
  const url = new URL(configuredUrl);
  if (url.protocol !== 'https:') throw new Error('The production website URL must use HTTPS.');
  if (url.search || url.hash) throw new Error('The website URL must not include a query or fragment.');
  websiteUrl = url.href.replace(/\/+$/, '');
}
const canIndex = Boolean(websiteUrl && shop.seo.indexingEnabled);
// /owner is deliberately excluded: it is a device-local tool, not a public page.
const routes = ['/', '/cycles', '/accessories', '/services', '/recommendation', '/list', '/offers', '/about', '/contact', '/privacy'];
for (const product of shop.catalog) routes.push(`/cycles/${encodeURIComponent(product.slug)}`);
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
if (canIndex && websiteUrl) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${escape(`${websiteUrl}${route}`)}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
  await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${websiteUrl}/sitemap.xml\n`);
  console.log(`SEO: sitemap generated for ${websiteUrl}.`);
} else {
  await writeFile(resolve(dist, 'robots.txt'), '# Owner review / production domain pending. See OWNER_CHECKLIST.md.\nUser-agent: *\nDisallow: /\n');
  console.log('SEO: noindex preview. Set websiteUrl and seo.indexingEnabled after owner review to generate a sitemap.');
}
// A host rewrite takes precedence on Vercel/Netlify. GitHub Pages uses this
// same-origin redirect to preserve deep links and refreshes under its base path.
const redirect = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>কাঞ্চন সাইকেল স্টোর্স</title><script src="${basePath}pages-redirect.js" defer></script></head><body><p>পেজটি খোলা হচ্ছে… / Opening the page…</p><a href="${basePath}">কাঞ্চন সাইকেল স্টোর্স / Kanchan Cycle Stores</a></body></html>`;
await writeFile(resolve(dist, '404.html'), redirect);
// Also include a root fallback for static hosts that need one before build.
await writeFile(resolve(dist, '_redirects'), '/* /index.html 200\n');
// Android installability is part of the product: fail the build if the pieces are missing.
for (const file of ['manifest.webmanifest', 'sw.js', 'offline.html', 'offline.css']) {
  await readFile(resolve(dist, file));
}
const manifest = JSON.parse(await readFile(resolve(dist, 'manifest.webmanifest'), 'utf8')) as { icons?: { src: string }[]; start_url?: string; short_name?: string };
if (!manifest.icons?.length) throw new Error('The web app manifest has no icons.');
for (const icon of manifest.icons) await readFile(resolve(dist, icon.src));
if (!manifest.short_name || manifest.short_name.length > 14) throw new Error('The manifest short_name must fit under an Android icon.');

let index = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!index.includes('manifest.webmanifest')) throw new Error('index.html does not link the web app manifest.');
if (!index.includes('route-restore.js')) throw new Error('Missing GitHub Pages route restoration script in index.html.');
// Inject every hashed JS/CSS asset into the service worker precache list, so a
// customer who installs the app can open pages they have not visited yet offline.
const assets = await readdir(resolve(dist, 'assets'));
const precacheAssets = assets.filter(name => /\.(?:js|css)$/.test(name)).map(name => `assets/${name}`);
let worker = await readFile(resolve(dist, 'sw.js'), 'utf8');
if (!worker.includes('const PRECACHE_ASSETS = [];')) throw new Error('Service worker precache placeholder was not found.');
worker = worker.replace('const PRECACHE_ASSETS = [];', `const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets)};`);
// A new build gets a new cache name, so old shells are deleted on activation.
const buildId = createHash('sha1').update(precacheAssets.join('|')).digest('hex').slice(0, 8);
if (!worker.includes("const VERSION = 'kanchan-v1';")) throw new Error('Service worker version placeholder was not found.');
worker = worker.replace("const VERSION = 'kanchan-v1';", `const VERSION = 'kanchan-${buildId}';`);
await writeFile(resolve(dist, 'sw.js'), worker);
console.log(`Offline precache: ${precacheAssets.length} JS/CSS files.`);

// Discover the home LCP photograph (the shop’s own photo) and critical Bengali fonts before the JS bundle.
const preloads: string[] = [];
for (const pattern of [/hind-siliguri-bengali-400-normal-.*\.woff2$/, /hind-siliguri-bengali-600-normal-.*\.woff2$/]) {
  const file = assets.find(name => pattern.test(name));
  if (file) preloads.push(`<link rel="preload" href="${basePath}assets/${file}" as="font" type="font/woff2" crossorigin>`);
}
// Static preload requires no inline script; browsers may ignore it on non-home routes.
const homeImagePreload = `<link rel="preload" href="${basePath}images/shop/storefront-480.webp" as="image" imagesrcset="${basePath}images/shop/storefront-480.webp 480w, ${basePath}images/shop/storefront.webp 960w" imagesizes="(max-width: 760px) 92vw, 42vw">`;
index = index.replace('</head>', `${preloads.join('\n')}\n${homeImagePreload}\n</head>`);
await writeFile(resolve(dist, 'index.html'), index);
console.log(`Routes: ${routes.length}; base path: ${basePath}; GitHub Pages refresh fallback and critical preloads generated.`);
