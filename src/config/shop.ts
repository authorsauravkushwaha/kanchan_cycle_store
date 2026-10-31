import { suppliedCycles } from './cycles.ts';

/**
 * কাঞ্চন সাইকেল স্টোর্স — the single owner-configuration file.
 * Read OWNER_CHECKLIST.md before changing verification flags.
 * Never turn an unknown price, stock level, service or offer into a claim.
 * Only the values in this file need editing for routine business updates.
 *
 * Product photographs supplied by the owner are included in the catalogue.
 */
export type Language = 'bn' | 'en';
export type Localized = { bn: string; en: string };
export type CategoryId = 'kids' | 'student' | 'city' | 'geared' | 'premium' | 'electric' | 'accessories';
export type Availability = 'in-stock' | 'out-of-stock' | null;
export type UseCase = 'school' | 'commuting' | 'recreation' | 'mixed';

/** A real photograph taken inside or outside the shop. Never a stock photo. */
export interface ShopPhoto {
  src: string;
  /** Smaller variant for responsive loading. */
  smallSrc: string;
  smallWidth: number;
  width: number;
  height: number;
  alt: Localized;
  caption: Localized;
}
export interface Product {
  id: string;
  slug: string;
  kind: 'cycle' | 'accessory';
  nameBn: string;
  nameEn: string;
  category: CategoryId;
  brand: string | null;
  /** A finite, owner-verified INR amount; null means contact for price. */
  price: number | null;
  descriptionBn: string;
  descriptionEn: string;
  /** Include only confirmed specifications. null is unknown, never false. */
  specifications: {
    geared: boolean | null;
    frameSize: string | null;
    wheelSize: string | null;
    brakes: string | null;
    riderHeightCm: { min: number; max: number } | null;
    intendedUse: UseCase[] | null;
  };
  /** null means unverified, not in stock. */
  availability: Availability;
  featured: boolean;
  /**
   * Owner-supplied product photograph. Static photos use local asset paths;
   * live (Supabase) photos must use HTTPS on an approved host.
   */
  photoUrl?: string | null;
}
export interface Service {
  id: string;
  name: Localized;
  description: Localized;
  confirmed: boolean;
  price: number | null;
}
export interface Offer {
  id: string;
  title: Localized;
  description: Localized;
  verified: boolean;
  validUntil: string | null;
}
export interface Review {
  id: string;
  author: string;
  text: Localized;
  sourceUrl: string;
  permissionConfirmed: boolean;
  rating: number | null;
}
export interface Category {
  id: CategoryId;
  name: Localized;
  subtitle: Localized;
  availabilityConfirmed: boolean;
}

/** Verified business details, customer services and contact actions. */
export const shop = {
  name: { bn: 'কাঞ্চন সাইকেল স্টোর্স', en: 'Kanchan Cycle Stores' },
  tagline: { bn: 'আপনার পথে, আপনার পাশে।', en: 'Your ride. Your neighbourhood.' },
  announcement: {
    enabled: true,
    text: {
      bn: 'নতুন সাইকেল, অ্যাক্সেসরিজ ও মেরামত — কোলাঘাটেই যোগাযোগ করুন।',
      en: 'New cycles, accessories and repairs — talk to the shop in Kolaghat.',
    },
  },
  /** The owner-uploaded portrait fills the homepage hero background. */
  heroPhoto: {
    src: '/images/kanchan-store-hero.jpeg', smallSrc: '/images/kanchan-store-hero.jpeg', smallWidth: 1024, width: 1024, height: 1536,
    alt: { bn: 'কোলাঘাটে কাঞ্চন সাইকেল স্টোর্সের ভিতরে দোকানদার', en: 'The shopkeeper inside Kanchan Cycle Stores in Kolaghat' },
    caption: { bn: 'কাঞ্চন সাইকেল স্টোর্স, কোলাঘাট', en: 'Kanchan Cycle Stores, Kolaghat' },
  },
  contact: {
    // Supplied by the business owner in the project brief.
    phone: '+917076884950',
    phoneDisplay: '+91 70768 84950',
    whatsapp: '917076884950',
    email: null as string | null,
  },
  address: {
    confirmed: true,
    street: { bn: 'কোলাঘাট–যাশর রোড', en: 'Kolaghat - Jashar Rd' },
    locality: { bn: 'কোলাঘাট', en: 'Kolaghat' },
    region: { bn: 'পশ্চিমবঙ্গ', en: 'West Bengal' },
    postalCode: '721134',
    countryCode: 'IN',
  },
  coordinates: { latitude: 22.4452382, longitude: 87.8751764 },
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=22.4452382%2C87.8751764',
  hours: {
    // Owner supplied 9 AM–9 PM daily, but explicitly requested final confirmation.
    // The times are shown with a visible caveat; structured data stays unpublished
    // until this flag is true.
    confirmed: false,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00',
    closes: '21:00',
    display: { bn: 'প্রতিদিন সকাল ৯টা–রাত ৯টা', en: 'Every day, 9:00 AM–9:00 PM' },
    caveat: { bn: 'সময় মালিকের চূড়ান্ত নিশ্চিতকরণ সাপেক্ষে', en: 'Subject to the owner’s final confirmation' },
  },
  // Set the real HTTPS website URL at deployment. No domain has been invented.
  websiteUrl: null as string | null,
  seo: {
    // Enable after final owner review; until then preview builds are noindex.
    indexingEnabled: false,
  },
  socialLinks: [] as { label: string; url: string }[],
  // null disables all analytics network requests. See README for consent rules.
  analytics: { endpoint: null as string | null },
  categories: [
    { id: 'kids', name: { bn: 'বাচ্চাদের সাইকেল', en: 'Kids’ cycles' }, subtitle: { bn: 'ছোট্ট পথচলার শুরু', en: 'Little rides, big smiles' }, availabilityConfirmed: false },
    { id: 'student', name: { bn: 'স্টুডেন্ট সাইকেল', en: 'Student cycles' }, subtitle: { bn: 'স্কুল থেকে কলেজের পথে', en: 'For the everyday journey' }, availabilityConfirmed: false },
    { id: 'city', name: { bn: 'দৈনন্দিন ব্যবহারের সাইকেল', en: 'Everyday city cycles' }, subtitle: { bn: 'চেনা পথে প্রতিদিন', en: 'Make the daily ride yours' }, availabilityConfirmed: false },
    { id: 'geared', name: { bn: 'গিয়ার সাইকেল', en: 'Geared cycles' }, subtitle: { bn: 'পথ বদলাক, উৎসাহ নয়', en: 'A little more adventure' }, availabilityConfirmed: false },
    // Premium models are sold through the shop, but stock and shop prices still
    // need confirming in person, so availabilityConfirmed stays false.
    { id: 'premium', name: { bn: 'প্রিমিয়াম সাইকেল', en: 'Premium cycles' }, subtitle: { bn: 'বাছাই করা উন্নত মডেল', en: 'Hand-picked, higher-spec models' }, availabilityConfirmed: false },
    { id: 'electric', name: { bn: 'ইলেকট্রিক সাইকেল', en: 'Electric cycles' }, subtitle: { bn: 'নতুন ধরনের পথচলা', en: 'Explore a different ride' }, availabilityConfirmed: false },
    { id: 'accessories', name: { bn: 'সাইকেলের অ্যাক্সেসরিজ', en: 'Cycle accessories' }, subtitle: { bn: 'যাত্রার ছোট্ট সঙ্গী', en: 'The little essentials' }, availabilityConfirmed: false },
  ] as Category[],
  /** Owner-supplied photos; price and stock remain unconfirmed. */
  catalog: suppliedCycles as Product[],
  services: [
    {
      id: 'general',
      name: { bn: 'সাইকেল মেরামত ও সার্ভিসিং', en: 'Bicycle repair & servicing' },
      description: { bn: 'কাঞ্চন সাইকেল স্টোর্সে সাইকেল মেরামত ও সার্ভিসিংয়ের কাজ হয়। সমস্যার কথা জানালে সারানোর বিষয়ে পরামর্শ পাবেন।', en: 'Kanchan Cycle Stores repairs and services bicycles. Describe the problem and the shop will advise on getting it fixed.' },
      confirmed: true,
      price: null,
    },
    { id: 'puncture', name: { bn: 'পাংচার মেরামত', en: 'Puncture repair' }, description: { bn: 'টিউবের সমস্যা ও মেরামতের খরচ সম্পর্কে জিজ্ঞাসা করুন।', en: 'Ask about tube problems and the cost of a repair.' }, confirmed: false, price: null },
    { id: 'brakes', name: { bn: 'ব্রেক অ্যাডজাস্টমেন্ট', en: 'Brake adjustment' }, description: { bn: 'ব্রেকের সমস্যার কথা জানিয়ে পরামর্শ নিন।', en: 'Describe the issue with your brakes and ask for advice.' }, confirmed: false, price: null },
    { id: 'chain', name: { bn: 'চেইন ও লুব্রিকেশন', en: 'Chain & lubrication' }, description: { bn: 'চেইনের সমস্যা ও যত্নের বিষয়ে কথা বলুন।', en: 'Talk to the shop about chain issues and care.' }, confirmed: false, price: null },
    { id: 'gears', name: { bn: 'গিয়ার অ্যাডজাস্টমেন্ট', en: 'Gear adjustment' }, description: { bn: 'গিয়ার বদলাতে সমস্যা হচ্ছে? দোকানে জানান।', en: 'Having trouble shifting gears? Let the shop know.' }, confirmed: false, price: null },
    { id: 'tyres', name: { bn: 'টায়ার ও টিউব বদল', en: 'Tyre & tube replacement' }, description: { bn: 'সাইকেলের মাপ জানিয়ে টায়ার ও টিউবের খোঁজ নিন।', en: 'Share your bicycle’s size to ask about tyres and tubes.' }, confirmed: false, price: null },
  ] as Service[],
  offers: [] as Offer[],
  reviews: [] as Review[],
  reviewUrl: null as string | null,
  budgets: [
    { id: 'under-5000', min: 0, max: 4999, label: { bn: '₹৫,০০০-এর কম', en: 'Under ₹5,000' } },
    { id: '5000-10000', min: 5000, max: 10000, label: { bn: '₹৫,০০০–₹১০,০০০', en: '₹5,000–₹10,000' } },
    { id: '10000-20000', min: 10000, max: 20000, label: { bn: '₹১০,০০০–₹২০,০০০', en: '₹10,000–₹20,000' } },
    { id: 'above-20000', min: 20000, max: null, label: { bn: '₹২০,০০০-এর বেশি', en: 'Above ₹20,000' } },
  ] as { id: string; min: number; max: number | null; label: Localized }[],
};

export const asset = (path: string): string => {
  if (/^https:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};
export const addressLines = (language: Language): string[] => {
  const postalCode = language === 'bn' ? shop.address.postalCode.replace(/\d/g, digit => '০১২৩৪৫৬৭৮৯'[+digit]) : shop.address.postalCode;
  return [shop.address.street[language], `${shop.address.locality[language]}, ${shop.address.region[language]} ${postalCode}`];
};
export const verifiedProducts = (kind?: Product['kind']) => shop.catalog.filter(p => !kind || p.kind === kind);
export const verifiedOffers = () => shop.offers.filter(o => o.verified);
export const verifiedReviews = () => shop.reviews.filter(r => r.permissionConfirmed && /^https:\/\//.test(r.sourceUrl));
export const confirmedServices = () => shop.services.filter(s => s.confirmed);
export const enquiryServices = () => shop.services.filter(s => !s.confirmed);
export const hoursDisplay = (language: Language) => shop.hours.display[language];
