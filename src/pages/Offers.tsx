import { ArrowRight, BadgeIndianRupee, Ruler, Tag, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { verifiedOffers } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { Notice, PageHero, SectionHeading } from '../components/UI';
import { FinalCTA } from '../components/HeroSection';
export default function Offers() {
  const { t, l, language } = useLanguage();
  const offers = verifiedOffers();
  const tips = [{ icon: BadgeIndianRupee }, { icon: Ruler }, { icon: Wrench }];
  const formatDate = (date: string) => new Intl.DateTimeFormat(language === 'bn' ? 'bn-IN' : 'en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' }).format(new Date(date));
  return <><SEO title={t('nav.offers')} description="seo.offersDescription" /><PageHero eyebrow={t('offers.eyebrow')} title={offers.length ? t('offers.current') : t('offers.title')} description={offers.length ? t('offers.description') : t('offers.description')} />{offers.length > 0 && <section className="section"><div className="container offers-grid">{offers.map(offer => <article key={offer.id} className="offer-card"><Tag size={28} aria-hidden="true" /><h2>{l(offer.title)}</h2><p>{l(offer.description)}</p>{offer.validUntil && <small>{t('offers.validUntil', { date: formatDate(offer.validUntil) })}</small>}</article>)}</div></section>}<section className="section buying-tips"><div className="container"><SectionHeading title={t('offers.tipTitle')} />{!offers.length && <Notice>{t('offers.description')}</Notice>}<div className="buying-tips-grid">{tips.map(({ icon: Icon }, index) => <article className="buying-tip" key={index}><span className="tip-number" aria-hidden="true">0{index + 1}</span><Icon size={31} strokeWidth={1.4} aria-hidden="true" /><h2>{t(`offers.tip${index + 1}.title` as 'offers.tip1.title')}</h2><p>{t(`offers.tip${index + 1}.text` as 'offers.tip1.text')}</p></article>)}</div><Link className="btn btn-primary" to="/recommendation">{t('action.help')}<ArrowRight size={18} aria-hidden="true" /></Link></div></section><FinalCTA /></>;
}
