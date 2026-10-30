/**
 * Verify the security headers that a *deployed* site actually sends.
 *
 * Why this exists: everything in this repository that talks about headers
 * (`vercel.json`, `public/_headers`) is only a request to the host. GitHub Pages
 * ignores both files completely, so a green `security:check` says nothing about
 * production. This script fetches the live site and compares the response with
 * the policy in `vercel.json`, which is the single source of truth.
 *
 * Usage:
 *   node scripts/verify-headers.mjs https://your-site.example
 *   node scripts/verify-headers.mjs https://your-site.example --require-hsts
 *
 * Exit codes: 0 = policy applied, 1 = drift or missing headers, 2 = bad usage
 * or the host could not be reached.
 *
 * HSTS is advisory by default because the audit deliberately leaves it off until
 * HTTPS is confirmed for every intended hostname (SECURITY_REPORT.md #47).
 * Pass --require-hsts once that has been checked, e.g. in a release gate.
 */
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const target = args.find((arg) => /^https?:\/\//.test(arg));
const requireHsts = args.includes('--require-hsts');

if (!target) {
  console.error('Usage: node scripts/verify-headers.mjs https://your-site.example [--require-hsts]');
  process.exit(2);
}

const ADVISORY = new Set(['strict-transport-security']);

/** Parse the `/*` block of a Netlify/Cloudflare style `_headers` file. */
function parseHeadersFile(text) {
  const global = {};
  let inGlobal = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      inGlobal = line === '/*';
      continue;
    }
    const match = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
    if (inGlobal && match) global[match[1].toLowerCase()] = match[2].trim();
  }
  return global;
}

/** Directive order and whitespace are irrelevant to CSP semantics. */
function normalize(name, value) {
  if (name !== 'content-security-policy') return value.trim().toLowerCase();
  return value
    .split(';')
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .sort()
    .join('; ');
}

const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const policy = Object.fromEntries(
  vercel.headers[0].headers.map(({ key, value }) => [key.toLowerCase(), value]),
);
delete policy['cache-control']; // Host-dependent and not a security control.

// Catch the two config files drifting apart before blaming the host.
const filePolicy = parseHeadersFile(await readFile('public/_headers', 'utf8'));
for (const [name, value] of Object.entries(policy)) {
  if (!(name in filePolicy)) {
    console.error(`Config drift: public/_headers is missing ${name} (present in vercel.json).`);
    process.exit(1);
  }
  if (normalize(name, filePolicy[name]) !== normalize(name, value)) {
    console.error(`Config drift: ${name} differs between vercel.json and public/_headers.`);
    process.exit(1);
  }
}

let response;
try {
  response = await fetch(target, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache' },
    signal: AbortSignal.timeout(15000),
  });
} catch (error) {
  console.error(`Could not reach ${target}: ${error.message}`);
  console.error('Nothing was verified. A local pass is not production evidence.');
  process.exit(2);
}

const sent = response.headers;
const finalUrl = new URL(response.url);
const server = (sent.get('server') || '').toLowerCase();

console.log(`\nLive header check: ${target}`);
console.log(`  status ${response.status} → ${response.url}\n`);

let failures = 0;
for (const [name, expected] of Object.entries(policy)) {
  const actual = sent.get(name);
  const advisory = ADVISORY.has(name) && !requireHsts;
  if (!actual) {
    if (advisory) {
      console.log(`  · ${name}: not set (advisory — see SECURITY_REPORT.md #47)`);
    } else {
      console.log(`  ✗ ${name}: MISSING (expected: ${expected})`);
      failures += 1;
    }
    continue;
  }
  if (normalize(name, actual) !== normalize(name, expected)) {
    console.log(`  ✗ ${name}: differs from policy`);
    console.log(`      sent:     ${actual}`);
    console.log(`      expected: ${expected}`);
    failures += 1;
  } else {
    console.log(`  ✓ ${name}`);
  }
}

// HSTS is never in vercel.json while it is staged off; report it either way.
if (!('strict-transport-security' in policy)) {
  const hsts = sent.get('strict-transport-security');
  if (hsts) console.log(`  ✓ strict-transport-security: ${hsts} (set by host)`);
  else if (requireHsts) {
    console.log('  ✗ strict-transport-security: MISSING (required by --require-hsts)');
    failures += 1;
  } else console.log('  · strict-transport-security: not set (advisory)');
}

// An https target that lands on http has been downgraded: that is a failure.
// A deliberately plain-http target is staging/local, so warn without failing.
if (finalUrl.protocol !== 'https:') {
  if (new URL(target).protocol === 'https:') {
    console.log(`  ✗ downgraded to ${finalUrl.protocol} — no HTTPS, so headers cannot protect it`);
    failures += 1;
  } else {
    console.log(`  · checked over ${finalUrl.protocol} (not HTTPS, so this is not production evidence)`);
  }
}
if (server.includes('github')) {
  console.log('\nNote: this looks like GitHub Pages, which cannot apply custom headers.');
  console.log('That is expected. Treat the deployment as a preview and put a header-capable');
  console.log('host (Vercel, Netlify, Cloudflare Pages) in front before launch.');
}

if (failures) {
  console.error(`\n${failures} header check(s) failed. Production does not match the policy in vercel.json.`);
  process.exit(1);
}
console.log('\nAll required headers match the policy in vercel.json.');
