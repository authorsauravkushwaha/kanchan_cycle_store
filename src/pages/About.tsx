import { Bike, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';
import { addressLines, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { Notice, PageHero, SectionHeading, ShopGallery, TextLink } from '../components/UI';
import { FinalCTA } from '../components/HeroSection';
import { MapSection } from '../components/MapSection';

export default function About() {
  const { t, l, language } = useLanguage();
  return <>
    <SEO title={t('nav.about')} description="seo.aboutDescription" />
    <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} description={t('about.description')} />
    <section className="section about-story"><div className="container about-story-grid">
      <div className="about-story-copy">
        <SectionHeading eyebrow={l(shop.name)} title={t('about.storyTitle')} />
        {['about.story1', 'about.story2', 'about.story3'].map(key => <p key={key}>{t(key as 'about.story1')}</p>)}
        <div className="about-values"><span><HeartHandshake size={21} strokeWidth={1.5} aria-hidden="true" />{t('benefit.2.title')}</span><span><ShieldCheck size={21} strokeWidth={1.5} aria-hidden="true" />{t('catalog.verifiedOnly')}</span><span><MapPin size={21} strokeWidth={1.5} aria-hidden="true" />{t('common.location')}</span></div>
      </div>
      <aside className="about-facts" aria-label={l({ bn: 'দোকানের তথ্য', en: 'Shop details' })}>
        <p className="eyebrow"><span />{l({ bn: 'এক নজরে', en: 'AT A GLANCE' })}</p>
        <dl>
          <div><dt>{l({ bn: 'কী পাওয়া যায়', en: 'What we offer' })}</dt><dd>{l({ bn: 'সাইকেল বিক্রি, অ্যাক্সেসরিজ, মেরামত ও সার্ভিসিং', en: 'Cycle sales, accessories, repair & servicing' })}</dd></div>
          <div><dt>{t('common.address')}</dt><dd>{addressLines(language).join(', ')}</dd></div>
          <div><dt>{t('common.hours')}</dt><dd>{l(shop.hours.display)}<small className="hours-caveat">{l(shop.hours.caveat)}</small></dd></div>
        </dl>
        <TextLink to="/contact">{t('action.contact')}</TextLink>
      </aside>
    </div></section>
    <section className="section gallery-section" id="our-shop">
      <div className="container">
        <SectionHeading eyebrow={t('home.gallery.eyebrow')} title={t('about.photosTitle')} description={t('about.photosText')} />
        <p className="gallery-subheading">{t('about.galleryHeading')}</p>
        <ShopGallery />
        <Notice>{t('about.galleryNote')}</Notice>
      </div>
    </section>
    <section className="section about-promise"><div className="container about-promise-grid">
      <span className="about-promise-icon" aria-hidden="true"><Bike size={34} strokeWidth={1.3} /></span>
      <div><h2>{t('about.valuesTitle')}</h2><p>{l({ bn: 'আপনার প্রয়োজন বুঝে, বাজেট মিলিয়ে, সামনে দেখে সাইকেল বেছে নিন। দাম, মডেল বা পরিষেবা নিশ্চিত না হলে আমরা অনুমান করে কিছু লিখি না — সরাসরি দোকানে জিজ্ঞাসা করাই সবচেয়ে ভালো।', en: 'Choose a cycle after we understand what you need, match it to your budget and let you see it in person. If a price, model or service is not confirmed, we do not guess — asking the shop directly is always best.' })}</p></div>
    </div></section>
    <MapSection />
    <FinalCTA />
  </>;
}
