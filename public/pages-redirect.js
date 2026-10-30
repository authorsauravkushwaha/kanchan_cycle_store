// Only used by GitHub Pages 404 fallback. Never redirect off-origin.
(() => {
  const base = new URL(document.currentScript.src).pathname.replace(/pages-redirect\.js$/, '');
  const path = location.pathname;
  const route = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '');
  try { sessionStorage.setItem('kanchan-route', JSON.stringify({ path: '/' + route, search: location.search, hash: location.hash })); } catch { /* Storage can be unavailable. */ }
  location.replace(location.origin + base);
})();
