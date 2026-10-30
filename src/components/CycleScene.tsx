import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowUpRight, MoveHorizontal, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useMotion } from './MotionExperience';

function Wheel({ cx, cy, id }: { cx: number; cy: number; id: string }) {
  return <g className="cycle-wheel">
    <circle cx={cx + 5} cy={cy + 5} r="111" fill="none" stroke="#263c33" strokeWidth="18" />
    <circle cx={cx} cy={cy} r="111" fill="none" stroke={`url(#${id}-rubber)`} strokeWidth="17" />
    <circle cx={cx} cy={cy} r="108" fill="none" stroke="#718579" strokeWidth="1.4" opacity=".65" />
    <circle cx={cx} cy={cy} r="99" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="6" />
    <circle cx={cx} cy={cy} r="94" fill="none" stroke="#adbcb0" strokeWidth="1" />
    <g className="wheel-spokes" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 24 }, (_, index) => {
        const angle = index * Math.PI / 12;
        return <line key={index} x1={cx + Math.cos(angle + 0.3) * 9} y1={cy + Math.sin(angle + 0.3) * 9} x2={cx + Math.cos(angle) * 96} y2={cy + Math.sin(angle) * 96} stroke={index % 2 ? '#91a497' : '#fafff9'} strokeWidth="1.25" />;
      })}
      <path d={`M${cx - 72} ${cy - 61}l10 9`} stroke="#e3bd42" strokeWidth="6" strokeLinecap="round" />
      <path d={`M${cx} ${cy - 94}v-7`} stroke="#52675a" strokeWidth="3" />
    </g>
    <circle cx={cx} cy={cy} r="13" fill={`url(#${id}-metal)`} stroke="#7a9081" strokeWidth="2" />
    <circle cx={cx} cy={cy} r="5" fill="#365444" />
  </g>;
}

/** An original, decorative vector bicycle, not a product or a stock photograph. */
export function BicycleArtwork() {
  const id = useId().replace(/:/g, '');
  const frame = 'M180 320L310 157L350 320L180 320M310 157L502 157L350 320M502 157L521 207L350 320M521 207Q548 270 580 320';
  return <svg className="bicycle-artwork" viewBox="0 0 760 490" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-frame`} x1="270" y1="140" x2="390" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#9cbda5" /><stop offset=".28" stopColor="#527d61" /><stop offset=".55" stopColor="#244f39" /><stop offset=".8" stopColor="#3e6b4e" /><stop offset="1" stopColor="#173c29" /></linearGradient>
      <linearGradient id={`${id}-rubber`} x1="0" y1="200" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="#526359" /><stop offset=".3" stopColor="#263b30" /><stop offset="1" stopColor="#14271e" /></linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fcfff9" /><stop offset=".3" stopColor="#b4c3b7" /><stop offset=".5" stopColor="#eff5eb" /><stop offset=".75" stopColor="#789080" /><stop offset="1" stopColor="#cad6c8" /></linearGradient>
      <linearGradient id={`${id}-saddle`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#526457" /><stop offset="1" stopColor="#21382a" /></linearGradient>
      <filter id={`${id}-shadow`} x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="5" dy="9" stdDeviation="5" floodColor="#244332" floodOpacity=".2" /></filter>
    </defs>
    <ellipse className="bike-ground-shadow" cx="384" cy="446" rx="281" ry="16" fill="#536e59" opacity=".13" />
    <g className="bike-assembly" filter={`url(#${id}-shadow)`}>
      <Wheel cx={180} cy={320} id={id} />
      <Wheel cx={580} cy={320} id={id} />
      <path d="M65 305a116 116 0 0 1 224-31M471 275a116 116 0 0 1 218 12" stroke="#254b35" strokeWidth="10" strokeLinecap="round" />
      <path d="M65 302a116 116 0 0 1 224-31M471 272a116 116 0 0 1 218 12" stroke="#83a58b" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 218H242M109 218l70 102M231 218l-50 102" stroke="#7c9281" strokeWidth="4" strokeLinecap="round" />
      <path d={frame} stroke="#173d29" strokeWidth="18" strokeLinejoin="round" strokeLinecap="round" transform="translate(4 5)" />
      <path d={frame} stroke={`url(#${id}-frame)`} strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M314 153L497 153M316 165L351 307M363 310L506 166M526 214L578 310" stroke="#c0d4bd" strokeWidth="2.4" strokeLinecap="round" opacity=".65" />
      <path d="M183 315L347 307a14 14 0 0 1 0 28L183 326Z" stroke="#6f8273" strokeWidth="3" />
      <path d="M183 316L347 309M183 325L347 332" stroke="#d2d9c9" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="350" cy="320" r="28" fill={`url(#${id}-metal)`} stroke="#5b7662" strokeWidth="3" />
      <circle cx="350" cy="320" r="20" fill="#dce5d6" stroke="#8da18d" strokeWidth="2" />
      <g className="cycle-crank" style={{ transformOrigin: '350px 320px' }}>
        <path d="M350 320l28 34" stroke="#355440" strokeWidth="8" strokeLinecap="round" />
        <path d="M350 320l-28-34" stroke="#a1b2a1" strokeWidth="7" strokeLinecap="round" />
        <rect x="365" y="350" width="30" height="10" rx="3" fill="#2b4132" /><rect x="306" y="279" width="29" height="9" rx="3" fill="#2b4132" />
        <circle cx="350" cy="320" r="7" fill="#e5ece0" stroke="#5c7762" strokeWidth="2" />
      </g>
      <path d="M310 157l-12-43" stroke={`url(#${id}-metal)`} strokeWidth="9" />
      <path d="M268 108q30-10 53-2l29 8q9 8-4 12l-49 3q-29-1-32-10Z" fill="#193626" transform="translate(2 5)" />
      <path d="M268 105q30-10 53-2l29 8q9 8-4 12l-49 3q-29-1-32-10Z" fill={`url(#${id}-saddle)`} />
      <path d="M273 108q31-6 61 5" stroke="#819180" strokeWidth="2" strokeLinecap="round" />
      <path d="M502 157l-13-53 34-12q17-4 22 13l4 14" stroke="#24442f" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M500 153l-13-51 35-13q17-4 22 13" stroke={`url(#${id}-metal)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M544 103l7 20" stroke="#2c4332" strokeWidth="12" strokeLinecap="round" />
      <path d="M525 103q35 28 13 92" stroke="#657b69" strokeWidth="2" />
      <path d="M491 166l-15 30" stroke="#d7ba50" strokeWidth="7" strokeLinecap="round" />
      <path d="M349 337l-22 81 23 2" stroke="#6e8673" strokeWidth="5" strokeLinecap="round" />
      <circle cx="310" cy="157" r="10" fill={`url(#${id}-metal)`} /><circle cx="502" cy="157" r="9" fill={`url(#${id}-metal)`} />
      <path d="M389 237l23-25" stroke="#d8e7cd" strokeWidth="4" strokeLinecap="round" opacity=".75" />
    </g>
  </svg>;
}

export function CycleScene() {
  const { l } = useLanguage();
  const { enabled } = useMotion();
  const [angle, setAngle] = useState(0);
  const labels = [
    l({ bn: 'সামনের দৃশ্য', en: 'Front three-quarter view' }),
    l({ bn: 'পাশের দৃশ্য', en: 'Side view' }),
    l({ bn: 'উল্টো দিকের দৃশ্য', en: 'Reverse three-quarter view' }),
  ];
  return <div className="cycle-scene" data-tilt="" style={{ '--view-angle': `${enabled ? angle * 24 : 0}deg` } as CSSProperties}>
    <div className="scene-orbit orbit-one" aria-hidden="true" /><div className="scene-orbit orbit-two" aria-hidden="true" />
    <span className="scene-coordinate" aria-hidden="true">22.4452° N<br />87.8752° E</span>
    <div className="scene-edition" aria-hidden="true"><span>THE EVERYDAY</span><strong>ride.</strong><span className="edition-line" /></div>
    <div className="scene-platform" aria-hidden="true"><span /></div>
    <div className="scene-bicycle"><BicycleArtwork /></div>
    <Link to="/recommendation" className="scene-float scene-float-top"><span className="scene-float-icon"><ArrowUpRight size={21} /></span><span><small>{l({ bn: 'আপনার পছন্দে', en: 'MADE FOR YOU' })}</small><strong>{l({ bn: 'আপনার পরের সাইকেল', en: 'Your next chapter' })}</strong></span></Link>
    <div className="scene-float scene-float-bottom"><span className="scene-mini-wheel" aria-hidden="true" /><span><strong>{l({ bn: 'দুই চাকা। নতুন পথ।', en: 'Two wheels. Endless possibilities.' })}</strong><small>{l({ bn: 'পথচলার আনন্দে', en: 'FIND YOUR EVERYDAY FREEDOM' })}</small></span></div>
    <div className="scene-toolbar">
      <span className="scene-view-label" aria-live="polite">{labels[(angle + 1) % 3]}</span>
      <button type="button" className="scene-rotate" onClick={() => setAngle(previous => previous === 1 ? -1 : previous + 1)} disabled={!enabled} aria-label={l({ bn: 'সাইকেলের দেখার কোণ বদলান', en: 'Rotate bicycle view' })}><MoveHorizontal size={15} /><span>{l({ bn: 'ঘুরিয়ে দেখুন', en: 'Rotate view' })}</span></button>
      <button type="button" className="scene-reset" onClick={() => setAngle(0)} disabled={!enabled || angle === 0} aria-label={l({ bn: 'সাইকেলের দৃশ্য আগের অবস্থায়', en: 'Reset bicycle view' })}><RotateCcw size={14} /></button>
    </div>
    <span className="scene-disclaimer">{l({ bn: 'সাইকেলটি একটি শৈল্পিক নকশা', en: 'Bicycle shown is an illustration' })}</span>
  </div>;
}
