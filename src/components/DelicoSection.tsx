import { Download, Smartphone, UtensilsCrossed } from 'lucide-react';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { delicoHref, track } from '../lib/business';
import { DelicoButton, SectionHeading } from './UI';

/**
 * A slim site-wide strip advertising the Delico food-delivery app. It sits
 * under the shop's own announcement on every page, so the promotion is visible
 * without taking over the shop's message.
 *
 * The whole strip is one link to https://delicoapp.com/ and opens in a new tab.
 * Renders nothing when the promotion is switched off in config/shop.ts.
 */
export function DelicoStrip() {
  const { t, l } = useLanguage();
  const href = delicoHref();
  if (!shop.delico.enabled || !href) return null;
  return <div className="delico-strip">
    <a className="container" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('delico_click', { placement: 'top-strip' })}>
      <UtensilsCrossed size={14} aria-hidden="true" />
      <span>{t('delico.banner')}</span>
      <strong className="delico-strip-cta">{l({ bn: 'অ্যাপটি খুলুন', en: 'Open the app' })}</strong>
    </a>
  </div>;
}

/**
 * The homepage advertisement for Delico, the Kolaghat food-delivery app.
 *
 * This shop sells bicycles, so the section is deliberately honest about that:
 * it promotes Delico as a separate app and says plainly that menus, prices and
 * delivery belong to Delico. Nothing here claims a dish, a price or a delivery
 * time this shop cannot verify — the same rule the catalogue follows.
 *
 * Renders nothing when the owner turns the promotion off in config/shop.ts.
 */
export function DelicoSection() {
  const { t, l } = useLanguage();
  const href = delicoHref();
  if (!shop.delico.enabled || !href) return null;

  const steps = [
    { icon: Smartphone, title: t('delico.section.1.title'), text: t('delico.section.1.text'), index: '01' },
    { icon: UtensilsCrossed, title: t('delico.section.2.title'), text: t('delico.section.2.text'), index: '02' },
    { icon: Download, title: t('delico.section.3.title'), text: t('delico.section.3.text'), index: '03' },
  ];

  return <section className="section delico-section" id="delico" aria-label={t('delico.section.eyebrow')}>
    <div className="container">
      <div className="delico-panel" data-reveal>
        <div className="delico-copy">
          <SectionHeading
            className="delico-heading"
            eyebrow={t('delico.section.eyebrow')}
            title={t('delico.section.title')}
            description={t('delico.section.description')}
          />
          <div className="delico-actions">
            <DelicoButton variant="delico" placement="home-section" />
            <a className="btn btn-delico-outline" href={shop.delico.playStoreUrl} target="_blank" rel="noopener noreferrer">
              <Download size={18} aria-hidden="true" /><span>{t('delico.playStore')}</span>
            </a>
          </div>
          <p className="delico-note">{t('delico.section.note')}</p>
        </div>
        <ol className="delico-steps">
          {steps.map(step => {
            const Icon = step.icon;
            return <li className="delico-step" key={step.index}>
              <span className="delico-step-icon"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
              <span className="delico-step-index" aria-hidden="true">{step.index}</span>
              <div><strong>{step.title}</strong><span>{step.text}</span></div>
            </li>;
          })}
          <li className="delico-step-footnote">
            <span>{l({ bn: 'ওয়েবসাইট', en: 'Website' })}</span>
            <a href={href} target="_blank" rel="noopener noreferrer">{shop.delico.domainDisplay}</a>
          </li>
        </ol>
      </div>
    </div>
  </section>;
}
