/**
 * Static security checks that are cheap enough to run on every build.
 * They are a safety net, not a penetration test: see SECURITY_REPORT.md.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
for (const key of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Cache-Control']) assert.ok(headers[key], `Missing ${key}`);
const csp = headers['Content-Security-Policy'];
for (const directive of [
  "default-src 'none'", "script-src 'self'", "style-src 'self'", "manifest-src 'self'",
  "worker-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "form-action 'none'",
]) assert.ok(csp.includes(directive), directive);
assert.ok(!/unsafe-inline|unsafe-eval|https?:\/\/\*/.test(csp), 'CSP must not allow unsafe inline/eval/wildcards');
assert.ok(!/connect-src[^;]*\bhttps:(?!\/\/)/.test(csp), 'connect-src must not allow every HTTPS origin');

// The SPA rewrite must never shadow the PWA files: a manifest served as HTML
// silently disables installation, and a shadowed sw.js disables offline support.
const rewrite = new RegExp(`^${config.rewrites[0].source}$`);
for (const path of ['/sw.js', '/manifest.webmanifest', '/offline.html', '/offline.css', '/icons/icon-192.png']) {
  assert.ok(!rewrite.test(path), `The SPA rewrite would serve index.html for ${path}`);
}

const html = await readFile('dist/index.html', 'utf8');
const fallback = await readFile('dist/404.html', 'utf8');
for (const text of [html, fallback]) assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(text), 'Inline script in generated HTML');
assert.ok(html.includes('route-restore.js'));
assert.ok(fallback.includes('pages-redirect.js'));
assert.ok(html.includes('manifest.webmanifest'), 'index.html must link the manifest');

// PWA files exist and the service worker never caches cross-origin requests.
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
assert.ok(manifest.icons.length >= 4, 'Manifest needs regular and maskable icons');
assert.ok(manifest.display === 'standalone', 'Manifest must be installable');
const sw = await readFile('dist/sw.js', 'utf8');
assert.ok(sw.includes('isSameOrigin'), 'Service worker must scope caching to this origin');
assert.ok(!/unsafe-eval/.test(sw));
assert.ok(await readFile('dist/offline.html', 'utf8').then(text => text.includes('tel:+917076884950')));

// If a live catalogue is configured, the CSP must name the exact project host.
// Wildcards are never used; the build fails rather than silently blocking it.
const supabase = process.env.VITE_SUPABASE_URL;
if (supabase) {
  const host = new URL(supabase).host;
  assert.ok(/^[a-z0-9-]+\.supabase\.co$/.test(host), 'Unexpected Supabase host');
  assert.ok(csp.includes(`https://${host}`), `Add https://${host} to connect-src in vercel.json and public/_headers`);
  assert.ok(csp.includes(`img-src 'self' data: https://${host}`), `Add https://${host} to img-src for product photos`);
}

const ignore = await readFile('.gitignore', 'utf8');
assert.ok(ignore.includes('.env') && ignore.includes('*.pem'));

// Conservative repository secret pattern check (not a substitute for GitHub secret scanning).
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'build', '.cache', 'test-results'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(?:tsx?|jsx?|mjs|json|html|yml|md)$/.test(entry.name) && entry.name !== 'package-lock.json') {
      const text = await readFile(path, 'utf8');
      assert.ok(!/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\bghp_[A-Za-z0-9]{36}\b|\bAKIA[0-9A-Z]{16}\b|\bsb_secret_[A-Za-z0-9_-]{10,}/.test(text), `Potential secret: ${path}`);
    }
  }
}
await scan('.');
console.log('Static header, PWA, inline-script and secret-pattern checks passed.');
