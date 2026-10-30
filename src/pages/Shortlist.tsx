import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bike, Check, Heart, MapPin, MessageCircle, Minus, Phone, Plus, Trash2, X } from 'lucide-react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { phoneHref, track, whatsappHref } from '../lib/business';
import { hasUnpriced, shortlistMessage, shortlistTotal } from '../lib/shortlist';
import { useShortlist } from '../shortlist';
import { SEO } from '../components/SEO';
import { EmptyState, PageHero } from '../components/UI';

/**
 * The shortlist is built and stored on the customer's own phone, then sent to
 * the shop as one WhatsApp message. It converts browsing into a named,
 * itemised enquiry the owner can answer quickly.
 */
export default function Shortlist() {
  const { t, l, language, price, number } = useLanguage();
  const { entries, count, remove, setQty, clear } = useShortlist();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [note, setNote] = useState('');
  const [cleared, setCleared] = useState(false);
  const id = useId();

  const message = useMemo(() => shortlistMessage(entries, {
    language, name, area, note, siteUrl: shop.websiteUrl,
  }), [entries, language, name, area, note]);
  const href = whatsappHref(message);
  const total = shortlistTotal(entries);
  const pending = hasUnpriced(entries);

  return <>
    <SEO title={t('list.title')} description="seo.listDescription" />
    <PageHero eyebrow={t('list.eyebrow')} title={t('list.title')} description={t('list.description')}>
      <p className="list-device-note"><Heart size={15} aria-hidden="true" />{t('list.privacy')}</p>
    </PageHero>
    <section className="section list-section"><div className="container">
      {cleared && entries.length === 0 && <p className="inline-success" role="status"><Check size={16} aria-hidden="true" />{t('list.cleared')}</p>}
      {entries.length === 0 ? <EmptyState icon={Heart} title={t('list.emptyTitle')} description={t('list.emptyText')}>
        <Link to="/cycles" className="btn btn-primary">{t('list.browse')}<ArrowRight size={17} aria-hidden="true" /></Link>
      </EmptyState> : <>
        <div className="list-layout">
          <div className="list-main">
            <div className="list-toolbar">
              <p role="status" aria-live="polite">{l({ bn: 'তালিকায় {count}টি জিনিস', en: '{count} item(s) in your list' }).replace('{count}', number(count))}</p>
              <button type="button" className="btn btn-text list-clear" onClick={() => { clear(); setCleared(true); }}><Trash2 size={15} aria-hidden="true" />{t('list.clear')}</button>
            </div>
            <ul className="list-items">{entries.map(entry => <li key={entry.id} className="list-item">
              <div className="list-item-top">
                <Link to={`/cycles/${entry.slug}`} className="list-item-name">{language === 'bn' ? entry.nameBn : entry.nameEn}</Link>
                <button type="button" className="icon-button list-remove" onClick={() => remove(entry.id)} aria-label={`${t('list.remove')}: ${language === 'bn' ? entry.nameBn : entry.nameEn}`}><X size={16} /></button>
              </div>
              <div className="list-item-bottom">
                <span className={`list-price ${entry.price === null ? 'unknown-price' : ''}`}>{entry.price === null ? t('common.unknownPrice') : price(entry.price)}</span>
                <div className="qty-control" role="group" aria-label={`${t('list.quantity')}: ${language === 'bn' ? entry.nameBn : entry.nameEn}`}>
                  <button type="button" onClick={() => setQty(entry.id, entry.qty - 1)} disabled={entry.qty <= 1} aria-label={t('list.decrease')}><Minus size={14} /></button>
                  <span aria-live="polite">{number(entry.qty)}</span>
                  <button type="button" onClick={() => setQty(entry.id, entry.qty + 1)} disabled={entry.qty >= 9} aria-label={t('list.increase')}><Plus size={14} /></button>
                </div>
              </div>
              {entry.kind === 'cycle' && <span className="list-kind">{l({ bn: 'সাইকেল', en: 'Cycle' })}</span>}
            </li>)}</ul>
            <div className="list-total">
              <span>{pending ? t('list.totalPending') : t('list.totalVerified')}</span>
              {!pending && <strong>{price(total)}</strong>}
            </div>
            <p className="list-footnote">{t('list.stockNote')}</p>
            <Link to="/cycles" className="text-link"><Bike size={17} aria-hidden="true" />{t('list.addMore')}</Link>
          </div>

          <aside className="list-send" aria-labelledby={`${id}-send`}>
            <h2 id={`${id}-send`}>{t('list.send')}</h2>
            <p>{t('list.help')}</p>
            <div className="list-fields">
              <div className="field"><label htmlFor={`${id}-name`}>{t('list.name')}</label><input id={`${id}-name`} value={name} maxLength={80} autoComplete="name" onChange={event => setName(event.target.value)} /></div>
              <div className="field"><label htmlFor={`${id}-area`}>{t('list.area')}</label><input id={`${id}-area`} value={area} maxLength={80} autoComplete="address-level2" onChange={event => setArea(event.target.value)} /></div>
              <div className="field"><label htmlFor={`${id}-note`}>{t('list.note')}</label><textarea id={`${id}-note`} rows={3} maxLength={300} value={note} onChange={event => setNote(event.target.value)} /></div>
            </div>
            {href ? <a className="btn btn-primary list-whatsapp" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('shortlist_share', { placement: 'shortlist' })}>
              <MessageCircle size={19} aria-hidden="true" />{t('list.send')}
            </a> : null}
            <p className="list-send-note">{t('common.whatsappNote')}</p>
            <div className="list-secondary-actions">
              <a className="btn btn-secondary" href={phoneHref()} onClick={() => track('phone_click', { placement: 'shortlist' })}><Phone size={17} aria-hidden="true" />{t('list.callAbout')}</a>
              <a className="btn btn-secondary" href={shop.directionsUrl} target="_blank" rel="noopener noreferrer" onClick={() => track('directions_click', { placement: 'shortlist' })}><MapPin size={17} aria-hidden="true" />{t('list.shopThisList')}</a>
            </div>
          </aside>
        </div>
      </>}
    </div></section>
  </>;
}
