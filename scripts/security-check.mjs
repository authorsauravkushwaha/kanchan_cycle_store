import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(({key, value}) => [key, value]));
for (const key of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Cache-Control']) assert.ok(headers[key], `Missing ${key}`);
const csp = headers['Content-Security-Policy'];
for (const directive of ["default-src 'none'", "script-src 'self'", "style-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "form-action 'none'"]) assert.ok(csp.includes(directive), directive);
assert.ok(!/unsafe-inline|unsafe-eval|https?:\/\/\*/.test(csp), 'CSP must not allow unsafe inline/eval/wildcards');
const html = await readFile('dist/index.html', 'utf8');
const fallback = await readFile('dist/404.html', 'utf8');
for (const text of [html, fallback]) assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(text), 'Inline script in generated HTML');
assert.ok(html.includes('route-restore.js'));
assert.ok(fallback.includes('pages-redirect.js'));
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
      assert.ok(!/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\bghp_[A-Za-z0-9]{36}\b|\bAKIA[0-9A-Z]{16}\b/.test(text), `Potential secret: ${path}`);
    }
  }
}
await scan('.');
console.log('Static header, inline-script and secret-pattern checks passed.');
