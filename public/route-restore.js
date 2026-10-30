// GitHub Pages deep-link fallback. Only restore same-origin, base-relative paths.
(() => {
  try {
    const saved = sessionStorage.getItem('kanchan-route');
    if (!saved) return;
    sessionStorage.removeItem('kanchan-route');
    const route = JSON.parse(saved);
    const base = new URL(document.currentScript.src).pathname.replace(/route-restore\.js$/, '');
    if (typeof route.path !== 'string' || !/^\/(?!\/)/.test(route.path) || route.path.includes('\\')) return;
    const search = typeof route.search === 'string' && route.search.startsWith('?') ? route.search : '';
    const hash = typeof route.hash === 'string' && route.hash.startsWith('#') ? route.hash : '';
    const next = new URL(base + route.path.slice(1) + search + hash, location.origin);
    if (next.origin === location.origin && next.pathname.startsWith(base)) history.replaceState(null, '', next.pathname + next.search + next.hash);
  } catch { /* Storage can be unavailable. */ }
})();
