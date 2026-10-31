/**
 * Static security checks that are cheap enough to run on every build.
 * They are a safety net, not a penetration test: see SECURITY_REPORT.md.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { loadEnv } from 'vite';

const buildEnv = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
const PUBLIC_VITE_KEYS = new Set(['VITE_SITE_URL', 'VITE_BASE_PATH', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);
const unexpectedViteKey = Object.keys(buildEnv).find(name => name.startsWith('VITE_') && buildEnv[name] && !PUBLIC_VITE_KEYS.has(name));
assert.ok(!unexpectedViteKey, `${unexpectedViteKey || 'Unexpected VITE_* variable'} is not an approved public build variable.`);
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
for (const key of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'Cache-Control']) assert.ok(headers[key], `Missing ${key}`);
assert.equal(headers['Cross-Origin-Resource-Policy'], 'same-origin', 'CORP must not allow cross-origin embedding of this site\'s files');
const csp = headers['Content-Security-Policy'];
for (const directive of [
  "default-src 'none'", "script-src 'self'", "style-src 'self'", "manifest-src 'self'",
  "worker-src 'self'", "frame-ancestors 'none'", "object-src 'none'", "form-action 'none'",
]) assert.ok(csp.includes(directive), directive);
assert.ok(!/unsafe-inline|unsafe-eval|https?:\/\/\*/.test(csp), 'CSP must not allow unsafe inline/eval/wildcards');
assert.ok(!/connect-src[^;]*\bhttps:(?!\/\/)/.test(csp), 'connect-src must not allow every HTTPS origin');

// vercel.json and public/_headers must describe the same policy: a host reads
// exactly one of them, so drift silently weakens production while CI stays green.
const headerFile = await readFile('public/_headers', 'utf8');
const filePolicy = {};
let inGlobalBlock = false;
for (const rawLine of headerFile.split('\n')) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;
  if (!/^\s/.test(rawLine)) { inGlobalBlock = line === '/*'; continue; }
  const match = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
  if (inGlobalBlock && match) filePolicy[match[1].toLowerCase()] = match[2].trim();
}
for (const [name, value] of Object.entries(headers)) {
  const lower = name.toLowerCase();
  assert.ok(filePolicy[lower], `public/_headers is missing ${name} (present in vercel.json)`);
  assert.equal(filePolicy[lower].toLowerCase(), value.toLowerCase(), `${name} differs between vercel.json and public/_headers`);
}

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
const supabase = buildEnv.VITE_SUPABASE_URL;
if (supabase) {
  assert.ok(/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabase), 'VITE_SUPABASE_URL must be the HTTPS project root');
  const host = new URL(supabase).host;
  assert.ok(/^[a-z0-9-]+\.supabase\.co$/i.test(host), 'Unexpected Supabase host');
  assert.ok(csp.includes(`https://${host}`), `Add https://${host} to connect-src in vercel.json and public/_headers`);
  assert.ok(csp.includes(`img-src 'self' data: https://${host}`), `Add https://${host} to img-src for product photos`);
}

const ignore = await readFile('.gitignore', 'utf8');
assert.ok(ignore.includes('.env') && ignore.includes('*.pem'));

// Authentication and authorization stay separate: the optional database must
// enforce MFA + allowlist membership in RLS, not trust a hidden frontend route.
const schema = await readFile('supabase/schema.sql', 'utf8');
assert.ok(schema.includes('alter table public.products enable row level security;'));
assert.ok(schema.includes("coalesce(auth.jwt() ->> 'aal', '') = 'aal2'"), 'Owner writes must require an MFA-authenticated AAL2 JWT');
assert.ok(schema.includes('lower(email) = lower(coalesce(auth.jwt() ->> \'email\', \'\'))'), 'Owner authorization must use the private allowlist');
assert.ok(schema.includes('revoke all on table public.owner_allowlist from public, anon, authenticated;'));
const selectGrant = /grant select \(([\s\S]*?)\) on table public\.products to anon, authenticated;/i.exec(schema);
assert.ok(selectGrant, 'Browser roles must have only explicit product-column grants');
const grantedColumns = new Set(selectGrant[1].split(',').map(column => column.trim()));
const inventorySource = await readFile('src/lib/inventory.ts', 'utf8');
const columnList = /export const CATALOG_COLUMNS = \[([\s\S]*?)\] as const/.exec(inventorySource);
assert.ok(columnList, 'Catalogue query must declare its public column allowlist');
for (const [, column] of columnList[1].matchAll(/'([a-z_]+)'/g)) assert.ok(grantedColumns.has(column), `Supabase anon role lacks SELECT grant for ${column}`);
for (const column of ['published', 'sort_order']) assert.ok(grantedColumns.has(column), `Supabase anon role lacks filter/order grant for ${column}`);
assert.ok(schema.includes('grant insert, update, delete on table public.products to authenticated;'));
assert.ok(schema.includes('create policy "Owner reads all products"'));
assert.ok(schema.includes('using (published = true)'));
assert.ok(schema.includes('public.is_owner()'));
assert.ok(schema.includes('file_size_limit = excluded.file_size_limit'));
assert.ok(schema.includes('array[\'image/jpeg\', \'image/png\', \'image/webp\']'));
assert.ok(schema.includes('between 1 and 2097152'), 'Storage policy must enforce the 2 MB file limit');

// No dangerous HTML/code-evaluation sinks in the browser app. Structured data
// uses textContent; React renders user-controlled values as escaped text.
async function readSourceFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await readSourceFiles(path));
    else if (/\.(?:tsx?|jsx?)$/.test(entry.name)) files.push([path, await readFile(path, 'utf8')]);
  }
  return files;
}
const sourceFiles = await readSourceFiles('src');
const sourceText = sourceFiles.map(([, text]) => text).join('\n');
assert.ok(!/dangerouslySetInnerHTML|\binnerHTML\s*(?:=|\+=)|\beval\s*\(|new Function\s*\(/.test(sourceText), 'Unsafe HTML/code execution sink found in src/');
assert.ok(!/navigator\.clipboard\.(?:read|readText)\s*\(/.test(sourceText), 'The website must not read from the clipboard');
assert.ok(sourceText.includes('navigator.clipboard.writeText'), 'Expected deliberate plain-text copy actions');
const boundary = await readFile('src/components/RouteBoundary.tsx', 'utf8');
assert.ok(boundary.includes('if (import.meta.env.DEV) console.error'), 'Production must not log component stacks');

// Conservative repository/build secret checks (not a substitute for GitHub secret scanning).
const secretPattern = /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,255}\b|\bgithub_pat_[A-Za-z0-9_]{20,255}\b|\b(?:AKIA|ASIA)[0-9A-Z]{16}\b|\bnpm_[A-Za-z0-9]{36,}\b|\bxox[baprs]-[A-Za-z0-9-]{10,}\b|\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b|\bsb_secret_[A-Za-z0-9_-]{10,}/;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g;
function hasServiceRoleJwt(text) {
  for (const token of text.matchAll(jwtPattern)) {
    try {
      const claims = JSON.parse(Buffer.from(token[0].split('.')[1], 'base64url').toString('utf8'));
      if (claims.role === 'service_role') return true;
    } catch { /* Not a decodable JWT: ignore it. */ }
  }
  return false;
}
assert.ok(!secretPattern.test(buildEnv.VITE_SUPABASE_ANON_KEY || '') && !hasServiceRoleJwt(buildEnv.VITE_SUPABASE_ANON_KEY || ''),
  'VITE_SUPABASE_ANON_KEY must be a public anon/publishable key, never a service-role or sb_secret key.');

async function scanSource(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', 'build', '.cache', 'test-results'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scanSource(path);
    else if (/\.(?:tsx?|jsx?|mjs|json|html|yml|md|sql)$/.test(entry.name) && entry.name !== 'package-lock.json') {
      const text = await readFile(path, 'utf8');
      assert.ok(!secretPattern.test(text) && !hasServiceRoleJwt(text), `Potential secret: ${path}`);
    }
  }
}
await scanSource('.');

// VITE_ variables become public JavaScript. Scan the actual generated bundle too,
// so an accidental service-role key cannot be deployed by a host's build command.
async function scanBuiltFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scanBuiltFiles(path);
    else if (/\.(?:js|mjs|json|html|css|webmanifest|txt)$/.test(entry.name)) {
      const text = await readFile(path, 'utf8');
      assert.ok(!secretPattern.test(text) && !hasServiceRoleJwt(text), `Potential public-bundle secret: ${path}`);
    }
  }
}
await scanBuiltFiles('dist');
console.log('Static header, RLS, upload, browser-sink, PWA and source/bundle secret checks passed.');
