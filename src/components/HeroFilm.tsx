import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { asset, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { useMotion } from './MotionExperience';

/**
 * The owner's shop film, running on the first screen.
 *
 * Rules it follows, in order:
 *  1. It never blocks the page. The poster paints first, the film loads after the
 *     page is interactive, and a slow connection simply keeps the poster.
 *  2. It is muted, so Android, iOS and every desktop autoplay it without a tap.
 *     The speaker button is the only way sound is ever heard.
 *  3. It stops the moment the hero leaves the screen, when the browser switches
 *     tab, or when the visitor pauses animation. A phone never decodes video it
 *     cannot show.
 *  4. Native scrolling stays untouched: the player is `pointer-events` transparent
 *     except for its own two buttons.
 */

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Cheap connections get the small file and lose the film entirely. */
function connectionHint(): { saveData: boolean; slow: boolean } {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const effectiveType = connection?.effectiveType ?? '';
  return {
    saveData: Boolean(connection?.saveData),
    slow: effectiveType === 'slow-2g' || effectiveType === '2g',
  };
}

export function HeroFilm() {
  const { l } = useLanguage();
  const { enabled } = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  const [progress, setProgress] = useState(0);
  /* Phones get the 640-wide copy, everything else the 960-wide one. Chosen in
     JS because the `media` attribute on a <source> is not honoured for video. */
  const [source] = useState(() => asset(
    typeof matchMedia === 'function' && matchMedia('(max-width: 760px)').matches
      ? shop.heroFilm.srcSmall
      : shop.heroFilm.srcLarge,
  ));
  const hint = useRef(connectionHint());

  /* Attach the source only once the page is interactive: the hero text, the
     photograph and the poster are what the customer came for. */
  useEffect(() => {
    if (hint.current.saveData || hint.current.slow) { setFailed(true); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { setFailed(true); return; }
    const start = () => setVisible(true);
    if (document.readyState === 'complete') { start(); return; }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  /* Video only decodes while the hero is on screen and the tab is in front. */
  useEffect(() => {
    const hero = videoRef.current?.closest('.hero-neu');
    if (!hero || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting && entry.intersectionRatio > 0.15),
      { threshold: [0, 0.15, 0.5] },
    );
    observer.observe(hero);
    const onVisibility = () => setOnScreen(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const shouldPlay = enabled && onScreen && !failed && document.visibilityState !== 'hidden';

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setPlaying(true);
    } catch {
      /* Autoplay refused (rare with muted video): the poster and the play button stay. */
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) void tryPlay();
    else { video.pause(); setPlaying(false); }
  }, [shouldPlay, tryPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void tryPlay();
    else { video.pause(); setPlaying(false); }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    /* Asking for sound is a user gesture, so playback is always allowed here. */
    if (!next && video.paused) void tryPlay();
  };

  /* The progress line is driven by `timeupdate` (4 Hz), never by a render loop. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      const { currentTime, duration } = video;
      if (Number.isFinite(duration) && duration > 0) setProgress(currentTime / duration);
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, []);

  return <figure className="hero-film" data-playback={playing ? 'playing' : 'paused'}>
    <div className="hero-film-frame">
      {/* The browser paints the poster instantly and swaps it for frames as soon
          as the first one arrives: the hero is never an empty rectangle. */}
      <video
        ref={videoRef}
        className="hero-film-video"
        poster={asset(shop.heroFilm.poster)}
        src={visible && !failed ? source : undefined}
        muted={muted}
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        /* No long-press save / picture-in-picture menu over the shop film. */
        onContextMenu={event => event.preventDefault()}
        tabIndex={-1}
        aria-label={l(shop.heroFilm.caption)}
        onError={() => setFailed(true)}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        /* Start as soon as the first frames are decodable. Nothing waits for the
           whole file: a 4 MB film begins in well under a second. */
        onLoadedData={() => { if (shouldPlay) void tryPlay(); }}
      />

      <span className="hero-film-scrim" aria-hidden="true" />
      <span className="hero-film-live" aria-hidden="true"><i />{l({ bn: 'দোকানের ভিডিও', en: 'SHOP FILM' })}</span>

      <div className="hero-film-controls">
        <button
          type="button"
          className="hero-film-button"
          onClick={toggleSound}
          disabled={failed}
          aria-pressed={!muted}
          aria-label={muted ? l({ bn: 'ভিডিওর শব্দ চালু করুন', en: 'Turn the film’s sound on' }) : l({ bn: 'ভিডিওর শব্দ বন্ধ করুন', en: 'Mute the film' })}
          title={muted ? l({ bn: 'শব্দ চালু করুন', en: 'Sound on' }) : l({ bn: 'শব্দ বন্ধ', en: 'Mute' })}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button
          type="button"
          className="hero-film-button"
          onClick={togglePlay}
          disabled={failed}
          aria-label={playing ? l({ bn: 'ভিডিও থামান', en: 'Pause the film' }) : l({ bn: 'ভিডিও চালান', en: 'Play the film' })}
          title={playing ? l({ bn: 'থামান', en: 'Pause' }) : l({ bn: 'চালান', en: 'Play' })}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
      </div>

      <span className="hero-film-progress" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></span>
      {failed && <span className="hero-film-fallback" aria-hidden="true">{l({ bn: 'দোকানের ছবি', en: 'SHOP STILL' })}</span>}
    </div>
    <figcaption className="hero-film-caption">
      <span>{l({ bn: 'ভিডিওতে আমাদের দোকান', en: 'Our shop, on film' })}</span>
      <Link to="/about#our-shop">{l({ bn: 'দোকান ঘুরে দেখুন', en: 'Step inside' })}<ArrowUpRight size={14} aria-hidden="true" /></Link>
    </figcaption>
  </figure>;
}
