import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUp, Pause, Play } from 'lucide-react';
import { useLanguage } from '../i18n';
import { clamp, readMotionPreference, revealPose, saveMotionPreference, sceneProgress } from '../lib/motion';

const MotionContext = createContext({ enabled: true, systemReduced: false, toggle: () => {} });
export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(readMotionPreference);
  const [systemReduced, setSystemReduced] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const toggle = useCallback(() => setPaused(previous => {
    saveMotionPreference(!previous);
    return !previous;
  }), []);
  const enabled = !paused && !systemReduced;
  useEffect(() => {
    document.documentElement.dataset.motion = enabled ? 'full' : 'reduced';
    return () => { delete document.documentElement.dataset.motion; };
  }, [enabled]);
  return <MotionContext.Provider value={{ enabled, systemReduced, toggle }}>{children}</MotionContext.Provider>;
}

const REVEAL_SELECTOR = [
  '[data-reveal]', '.section-heading', '.category-card', '.product-card', '.service-card',
  '.maintenance-card', '.visit-item', '.map-content', '.map-frame', '.about-offer',
  '.contact-card', '.empty-state', '.quiz-card', '.repair-form', '.guide-checklist li',
].map(selector => `#main-content ${selector}`).join(',');
const TILT_SELECTOR = '.category-card, .product-card, .service-card, .maintenance-card, .visit-item, .about-offer, .contact-card';

type Scene = { element: HTMLElement; top: number; height: number; hero: boolean };
type Reveal = { element: HTMLElement; top: number; height: number };

/**
 * Native scrolling, never wheel/touch hijacking. One passive listener schedules
 * one frame; measurements are cached, and only visible surfaces are written.
 * Every transform is a function of scroll position, not elapsed time, so moving
 * up reverses the exact same journey. No animation library or render per frame.
 */
export function MotionExperience() {
  const { enabled, systemReduced, toggle } = useMotion();
  const { l } = useLanguage();
  const { pathname } = useLocation();
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById('main-content');
    if (!main) return;
    let frame = 0;
    let measureFrame = 0;
    let disposed = false;
    let lastY = window.scrollY;
    let viewport = window.innerHeight;
    let maximum = 1;
    let scenes: Scene[] = [];
    let reveals: Reveal[] = [];
    const visible = new Set<HTMLElement>();
    const knownReveals = new WeakSet<HTMLElement>();
    let candidates: HTMLElement[] = [];
    root.classList.toggle('motion-enhanced', enabled);
    const discover = () => {
      candidates = candidates.filter(element => element.isConnected);
      main.querySelectorAll<HTMLElement>(TILT_SELECTOR).forEach(element => { element.dataset.tilt = ''; });
      main.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(element => {
        if (knownReveals.has(element)) return;
        knownReveals.add(element);
        candidates.push(element);
        if (enabled) element.classList.add('reveal-item');
        if (observer) observer.observe(element);
        else visible.add(element);
      });
    };

    const paint = () => {
      frame = 0;
      if (disposed) return;
      const y = Math.max(0, window.scrollY);
      const progress = clamp(y / maximum);
      root.style.setProperty('--page-progress', String(progress));
      root.style.setProperty('--journey-turn', `${progress * 720}deg`);
      if (Math.abs(y - lastY) > 0.5) root.dataset.scrollDirection = y > lastY ? 'down' : 'up';
      lastY = y;
      setAtTop(y < 12);
      setAtBottom(y >= maximum - 12);
      if (!enabled) return;
      for (const scene of scenes) {
        if (y + viewport < scene.top || y > scene.top + scene.height) continue;
        const p = sceneProgress(y, scene.top, scene.height, viewport, scene.hero);
        const style = scene.element.style;
        style.setProperty('--scene-progress', p.toFixed(4));
        style.setProperty('--scene-shift', `${((scene.hero ? p : p - 0.5) * (scene.hero ? -46 : 32)).toFixed(2)}px`);
        style.setProperty('--scene-lean', `${((p - (scene.hero ? 0 : 0.5)) * (scene.hero ? 15 : 8)).toFixed(2)}deg`);
        style.setProperty('--wheel-turn', `${(p * (scene.hero ? 240 : 160)).toFixed(2)}deg`);
      }
      for (const { element, top, height } of reveals) {
        if (!visible.has(element)) continue;
        const pose = revealPose(y, top, height, viewport);
        element.style.setProperty('--reveal-y', `${pose.y.toFixed(2)}px`);
        element.style.setProperty('--reveal-scale', pose.scale.toFixed(4));
        element.style.setProperty('--reveal-opacity', pose.opacity.toFixed(3));
      }
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(paint); };
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      viewport = window.innerHeight;
      maximum = Math.max(1, root.scrollHeight - viewport);
      const y = window.scrollY;
      discover();
      scenes = Array.from(main.querySelectorAll<HTMLElement>('[data-scroll-scene]')).map(element => {
        const rect = element.getBoundingClientRect();
        return { element, top: rect.top + y, height: rect.height, hero: element.dataset.scrollScene === 'hero' };
      });
      // offsetTop ignores our visual transform, preventing measurement feedback.
      reveals = candidates.map(element => {
        let top = 0;
        let node: HTMLElement | null = element;
        while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
        return { element, top, height: element.offsetHeight };
      });
      paint();
    };
    const scheduleMeasure = () => { if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure); };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      });
      schedule();
    }, { rootMargin: '120px 0px', threshold: 0 }) : null;
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(scheduleMeasure) : null;
    resizeObserver?.observe(main);
    // Lazy routes and live inventory can arrive after the first layout effect.
    const mutations = new MutationObserver(scheduleMeasure);
    mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    document.fonts?.ready.then(() => { if (!disposed) scheduleMeasure(); });
    scheduleMeasure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer?.disconnect();
      resizeObserver?.disconnect();
      mutations.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', scheduleMeasure);
      root.classList.remove('motion-enhanced');
      candidates.forEach(element => {
        element.classList.remove('reveal-item');
        element.style.removeProperty('--reveal-y');
        element.style.removeProperty('--reveal-scale');
        element.style.removeProperty('--reveal-opacity');
      });
      main.querySelectorAll<HTMLElement>('[data-tilt]').forEach(element => {
        // The scene owns its React-managed data attribute.
        if (!element.classList.contains('cycle-scene')) delete element.dataset.tilt;
        element.style.removeProperty('--tilt-x');
        element.style.removeProperty('--tilt-y');
        element.style.removeProperty('--pointer-x');
      });
    };
  }, [pathname, enabled]);

  useEffect(() => {
    if (!enabled || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const main = document.getElementById('main-content');
    if (!main) return;
    let active: HTMLElement | null = null;
    let bounds: DOMRect | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (active) {
        active.style.removeProperty('--tilt-x');
        active.style.removeProperty('--tilt-y');
        active.style.removeProperty('--pointer-x');
      }
      active = null;
      bounds = null;
    };
    const paint = () => {
      frame = 0;
      if (!active || !bounds) return;
      const px = clamp((x - bounds.left) / bounds.width);
      const py = clamp((y - bounds.top) / bounds.height);
      active.style.setProperty('--tilt-x', `${((0.5 - py) * 7).toFixed(2)}deg`);
      active.style.setProperty('--tilt-y', `${((px - 0.5) * 9).toFixed(2)}deg`);
      active.style.setProperty('--pointer-x', `${px * 100}%`);
    };
    const over = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tilt], .cycle-scene') : null;
      if (target === active) return;
      reset();
      if (target && main.contains(target)) { active = target; bounds = target.getBoundingClientRect(); }
    };
    const move = (event: PointerEvent) => {
      if (!active) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const out = (event: PointerEvent) => {
      if (active && (!(event.relatedTarget instanceof Node) || !active.contains(event.relatedTarget))) reset();
    };
    main.addEventListener('pointerover', over, { passive: true });
    main.addEventListener('pointermove', move, { passive: true });
    main.addEventListener('pointerout', out, { passive: true });
    main.addEventListener('pointerleave', reset, { passive: true });
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('blur', reset);
    return () => {
      reset();
      main.removeEventListener('pointerover', over);
      main.removeEventListener('pointermove', move);
      main.removeEventListener('pointerout', out);
      main.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('blur', reset);
    };
  }, [pathname, enabled]);

  const scroll = (direction: -1 | 1) => window.scrollTo({
    top: direction === -1 && atTop ? 0 : window.scrollY + direction * window.innerHeight * 0.78,
    behavior: enabled ? 'smooth' : 'instant',
  });
  return <>
    <div className="reading-progress" aria-hidden="true"><span /></div>
    <div className="journey-controls" ref={controlsRef} aria-label={l({ bn: 'স্ক্রল ও অ্যানিমেশন নিয়ন্ত্রণ', en: 'Scroll and animation controls' })} role="group">
      <button type="button" className="journey-button" onClick={() => scroll(-1)} disabled={atTop} aria-label={l({ bn: 'উপরে স্ক্রল করুন', en: 'Scroll up' })} title={l({ bn: 'উপরে যান', en: 'Scroll up' })}><ArrowUp size={17} /></button>
      <span className="journey-dial" aria-hidden="true"><span /><i /></span>
      <button type="button" className="journey-button" onClick={() => scroll(1)} disabled={atBottom} aria-label={l({ bn: 'নিচে স্ক্রল করুন', en: 'Scroll down' })} title={l({ bn: 'নিচে যান', en: 'Scroll down' })}><ArrowDown size={17} /></button>
      <span className="journey-divider" aria-hidden="true" />
      <button type="button" className="journey-button motion-toggle" onClick={toggle} disabled={systemReduced} aria-pressed={!enabled} aria-label={systemReduced ? l({ bn: 'ডিভাইসে কম মোশন চালু', en: 'Reduced motion is enabled on your device' }) : enabled ? l({ bn: 'অ্যানিমেশন থামান', en: 'Pause animations' }) : l({ bn: 'অ্যানিমেশন চালু করুন', en: 'Resume animations' })} title={systemReduced ? l({ bn: 'ডিভাইসের কম মোশন সেটিং মানা হচ্ছে', en: 'Respecting your device’s reduced-motion setting' }) : enabled ? l({ bn: 'অ্যানিমেশন থামান', en: 'Pause animations' }) : l({ bn: 'অ্যানিমেশন চালু করুন', en: 'Resume animations' })}>{enabled ? <Pause size={15} /> : <Play size={15} />}</button>
    </div>
  </>;
}
