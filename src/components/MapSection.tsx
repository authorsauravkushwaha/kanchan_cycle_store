import { useState } from 'react';
import { Clock3, MapPin, Navigation, Phone } from 'lucide-react';
import { addressLines, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { phoneHref, track } from '../lib/business';
import { DirectionsButton, SectionHeading } from './UI';

export function MapSection({ standalone = false }: { standalone?: boolean }) {
  const { t, l, language } = useLanguage();
  const [mapRequested, setMapRequested] = useState(false);
  const { latitude, longitude } = shop.coordinates;
  return <section className={`section map-section ${standalone ? 'map-standalone' : ''}`} id="location"><div className="container map-layout">
    <div className="map-content"><SectionHeading eyebrow={t('map.eyebrow')} title={t('contact.visitTitle')} /><h3 className="map-shop-name">{l(shop.name)}</h3>
      <div className="map-detail"><MapPin size={21} aria-hidden="true" /><div><h4>{t('common.address')}</h4><address>{addressLines(language).map(line => <span key={line}>{line}</span>)}</address></div></div>
      <div className="map-detail"><Clock3 size={20} aria-hidden="true" /><div><h4>{t('common.hours')}</h4><p>{l(shop.hours.display)}{!shop.hours.confirmed && <small className="hours-caveat">{l(shop.hours.caveat)}</small>}</p></div></div>
      <a className="map-phone" href={phoneHref()} onClick={() => track('phone_click')}><Phone size={17} aria-hidden="true" />{shop.contact.phoneDisplay}</a>
      <div className="map-actions"><DirectionsButton variant="primary" /></div>
    </div>
    <div className={`map-frame ${mapRequested ? 'map-is-loaded' : ''}`}>
      {mapRequested ? <iframe title={t('common.mapTitle')} src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&hl=${language}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen aria-describedby="map-note" /> : <div className="map-facade"><span className="map-facade-ring" aria-hidden="true" /><span className="map-facade-pin"><MapPin size={34} strokeWidth={1.5} aria-hidden="true" /></span><h3>{t('map.locationTitle')}</h3><p>{latitude.toFixed(7)}, {longitude.toFixed(7)}</p><button className="btn btn-primary" onClick={() => setMapRequested(true)}><MapPin size={17} aria-hidden="true" />{t('map.load')}</button><small>{t('map.privacy')}</small></div>}
      <div className="map-label"><span><Navigation size={17} aria-hidden="true" /></span><div><strong>{l(shop.name)}</strong><small>{t('common.location')}</small></div></div>
    </div>
  </div><div className="container"><p className="map-note" id="map-note">{t('common.mapNote')} {mapRequested && <a href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('directions_click')}>{t('map.fallback')}</a>}</p></div></section>;
}
