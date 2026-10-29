/** Build-time SEO and GitHub Pages refresh support. No guessed production domain. */
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
const routes = ['/', '/cycles', '/accessories', '/services', '/recommendation', '/offers', '/about', '/contact', '/privacy'];
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
const redirect = `<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>কাঞ্চন সাইকেল স্টোর্স</title><script>
(function(){var base=${JSON.stringify(basePath)};var path=window.location.pathname;var route=path.indexOf(base)===0?path.slice(base.length):path.replace(/^\\//,'');try{sessionStorage.setItem('kanchan-route',JSON.stringify({path:'/'+route,search:location.search,hash:location.hash}));}catch(e){}location.replace(location.origin+base);})();
</script></head><body><p>পেজটি খোলা হচ্ছে… / Opening the page…</p><a href="${basePath}">কাঞ্চন সাইকেল স্টোর্স / Kanchan Cycle Stores</a></body></html>`;
await writeFile(resolve(dist, '404.html'), redirect);
// Also include a root fallback for static hosts that need one before build.
await writeFile(resolve(dist, '_redirects'), '/* /index.html 200\n');
let index = await readFile(resolve(dist, 'index.html'), 'utf8');
if (!index.includes('kanchan-route')) throw new Error('Missing GitHub Pages route restoration script in index.html.');
// Discover the home LCP image and critical Bengali fonts before the JS bundle.
const assets = await readdir(resolve(dist, 'assets'));
const preloads: string[] = [];
for (const pattern of [/hind-siliguri-bengali-400-normal-.*\.woff2$/, /hind-siliguri-bengali-600-normal-.*\.woff2$/]) {
  const file = assets.find(name => pattern.test(name));
  if (file) preloads.push(`<link rel="preload" href="${basePath}assets/${file}" as="font" type="font/woff2" crossorigin>`);
}
const homeImagePreload = `<script>(function(){var b=${JSON.stringify(basePath)};var p=location.pathname;if(p===b||p===b+'index.html'){var l=document.createElement('link');l.rel='preload';l.as='image';l.href=b+'images/hero-cycle.webp';l.imageSrcset=b+'images/hero-cycle-400.webp 400w, '+b+'images/hero-cycle.webp 500w';l.imageSizes='(max-width: 760px) 92vw, 48vw';l.fetchPriority='high';document.head.appendChild(l);}})();</script>`;
index = index.replace('</head>', `${preloads.join('\n')}\n${homeImagePreload}\n</head>`);
await writeFile(resolve(dist, 'index.html'), index);
console.log(`Routes: ${routes.length}; base path: ${basePath}; GitHub Pages refresh fallback and critical preloads generated.`);
