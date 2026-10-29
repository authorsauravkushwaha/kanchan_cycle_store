import { ExternalLink, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react';
import { photos, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { PageHero, Photo, SectionHeading } from '../components/UI';
import { FinalCTA } from '../components/HeroSection';
import { MapSection } from '../components/MapSection';
export default function About() {
  const { t, l } = useLanguage();
  return <><SEO title={t('nav.about')} description="seo.aboutDescription" /><PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} description={t('about.description')} /><section className="section about-story"><div className="container about-story-grid"><Photo image={photos.hero} className="about-photo" sizes="(max-width: 760px) 90vw, 40vw" /><div><SectionHeading eyebrow={l(shop.name)} title={t('about.storyTitle')} />{['about.story1', 'about.story2', 'about.story3'].map(key => <p key={key}>{t(key as 'about.story1')}</p>)}<div className="about-values"><span><HeartHandshake size={21} strokeWidth={1.5} aria-hidden="true" />{t('benefit.2.title')}</span><span><ShieldCheck size={21} strokeWidth={1.5} aria-hidden="true" />{t('catalog.verifiedOnly')}</span><span><MapPin size={21} strokeWidth={1.5} aria-hidden="true" />{t('common.location')}</span></div></div></div></section><section className="section photo-transparency" id="photo-transparency"><div className="container"><SectionHeading title={t('about.photosTitle')} description={t('about.photosText')} /><details className="photo-source-details"><summary>{t('about.photoCredits')}<ExternalLink size={16} aria-hidden="true" /></summary><div><p>{l({ bn: 'নিচের ছবিগুলো Pexels ও Unsplash থেকে নেওয়া প্রতীকী ছবি। সংশ্লিষ্ট লাইসেন্সের শর্ত মেনে ব্যবহার করতে হবে। মূল মডেল বা দোকানের পণ্য হিসেবে দেখানো হয়নি।', en: 'These illustrative photographs are sourced from Pexels and Unsplash and are subject to their respective licences. They are not presented as the shop’s actual models or inventory.' })}</p><ul className="photo-credits-list">{Object.entries(photos).map(([key, image]) => <li key={key}><span>{l(image.alt)}</span><a href={imageCredits[key]} target="_blank" rel="noopener noreferrer">{l({ bn: 'ছবির উৎস', en: 'Photo source' })}<ExternalLink size={13} aria-hidden="true" /></a></li>)}</ul><div className="license-links"><a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">Pexels License<ExternalLink size={13} aria-hidden="true" /></a><a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Unsplash License<ExternalLink size={13} aria-hidden="true" /></a></div></div></details></div></section><MapSection /><FinalCTA /></>;
}
const imageCredits: Record<string, string> = {
  hero: 'https://www.pexels.com/photo/36891176/', kids: 'https://www.pexels.com/photo/3619972/',
  student: 'https://www.pexels.com/photo/101980/', city: 'https://unsplash.com/photos/green-city-bicycle-beside-green-steel-fence-during-daytime-PeSVtlpudx8',
  geared: 'https://unsplash.com/photos/person-cycling-on-bike-surrounds-with-trees-at-daytime-6DWMeV1kNCc',
  electric: 'https://www.pexels.com/photo/8811577/', accessories: 'https://www.pexels.com/photo/30827167/', repair: 'https://www.pexels.com/photo/10263877/',
};
