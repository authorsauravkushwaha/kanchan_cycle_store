import { Bike, Wrench } from 'lucide-react';
import { addressLines, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { PageHero, SectionHeading, TextLink } from '../components/UI';
import { FinalCTA } from '../components/HeroSection';
import { MapSection } from '../components/MapSection';

export default function About() {
  const { t, l, language } = useLanguage();
  const offers = [
    { Icon: Bike, title: { bn: 'সাইকেল বিক্রি', en: 'Bicycle sales' }, text: { bn: 'আপনার ব্যবহার, মাপ ও বাজেট অনুযায়ী কী কী বিকল্প আছে জেনে নিন।', en: 'Ask about cycle options for your intended use, fit and budget.' } },
    { Icon: Wrench, title: { bn: 'মেরামত ও সার্ভিসিং', en: 'Repair & servicing' }, text: { bn: 'সাইকেলের সমস্যার কথা জানান এবং পরিষেবা, খরচ ও সময় নিয়ে কথা বলুন।', en: 'Describe the issue and ask about service, cost and timing.' } },
  ];
  return <>
    <SEO title={t('nav.about')} description="seo.aboutDescription" />
    <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} description={t('about.description')} />
    <section className="section about-story"><div className="container about-story-grid">
      <div className="about-story-copy">
        <SectionHeading eyebrow={l(shop.name)} title={t('about.storyTitle')} />
        {['about.story1', 'about.story2', 'about.story3'].map(key => <p key={key}>{t(key as 'about.story1')}</p>)}
      </div>
      <aside className="about-facts glass-panel" aria-label={l({ bn: 'দোকানের তথ্য', en: 'Shop details' })}>
        <p className="eyebrow"><span />{l({ bn: 'এক নজরে', en: 'AT A GLANCE' })}</p>
        <dl>
          <div><dt>{l({ bn: 'কী পাওয়া যায়', en: 'What we offer' })}</dt><dd>{l({ bn: 'সাইকেল বিক্রি, মেরামত ও সার্ভিসিং', en: 'Cycle sales, repair & servicing' })}</dd></div>
          <div><dt>{t('common.address')}</dt><dd>{addressLines(language).join(', ')}</dd></div>
          <div><dt>{t('common.hours')}</dt><dd>{l(shop.hours.display)}<small className="hours-caveat">{l(shop.hours.caveat)}</small></dd></div>
        </dl>
        <TextLink to="/contact">{t('action.contact')}</TextLink>
      </aside>
    </div></section>
    <section className="section about-offers-section" id="our-shop">
      <div className="container"><SectionHeading eyebrow={l({ bn: 'আপনার প্রয়োজন থেকে শুরু', en: 'START WITH WHAT YOU NEED' })} title={l({ bn: 'আমরা কীভাবে সাহায্য করতে পারি', en: 'How we can help' })} description={l({ bn: 'কোন মডেল, দাম, স্টক বা পরিষেবা নিশ্চিত না হলে অনুমান করে কিছু বলা হয় না—দোকানে জেনে নিন।', en: 'We do not guess about unconfirmed models, prices, stock or services. Ask the shop directly.' })} />
        <div className="about-offer-grid">{offers.map(({ Icon, title, text }) => <article className="about-offer glass-panel" key={title.en}><span className="about-offer-icon"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><h3>{l(title)}</h3><p>{l(text)}</p></article>)}</div>
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
