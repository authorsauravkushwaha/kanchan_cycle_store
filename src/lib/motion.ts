/** Pure, direction-independent scroll math. Scrolling back restores the same pose. */
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function sceneProgress(scrollY: number, top: number, height: number, viewport: number, hero = false) {
  if (height <= 0 || viewport <= 0) return 0;
  return clamp(hero ? (scrollY - top + 110) / height : (scrollY + viewport - top) / (viewport + height));
}

export function revealPose(scrollY: number, top: number, height: number, viewport: number) {
  if (viewport <= 0) return { y: 0, scale: 1, opacity: 1 };
  const entering = clamp((scrollY + viewport * 0.96 - top) / Math.max(1, viewport * 0.42));
  const leaving = clamp((scrollY - top - height * 0.65) / Math.max(1, viewport * 0.4));
  return {
    y: (1 - entering) * 32 - leaving * 18,
    scale: 0.975 + entering * 0.025,
    // Keep text fully opaque: depth changes must never reduce readability.
    opacity: 1,
  };
}

export function readMotionPreference(): boolean {
  try { return localStorage.getItem('kanchan-motion-paused') === 'true'; }
  catch { return false; }
}

export function saveMotionPreference(paused: boolean) {
  try { localStorage.setItem('kanchan-motion-paused', String(paused)); }
  catch { /* Private browsing and storage limits must not interrupt the experience. */ }
}
