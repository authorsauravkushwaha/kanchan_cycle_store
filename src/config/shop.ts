import { suppliedCycles } from './cycles.ts';
import { categoryDefinitions } from './categories.ts';
import { photoSrcSets } from './photoVariants.ts';

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
export type CategoryId = 'kids' | 'student' | 'city' | 'geared' | 'premium' | 'electric';
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
  /** The website lists cycles only. */
  kind: 'cycle';
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
   * Owner-supplied product photograph(s). Static photos use local asset paths;
   * live (Supabase) photos must use HTTPS on an approved host.
   */
  photoUrl?: string | null;
  photoUrls?: string[];
  /**
   * Where the picture came from. 'shop' = photographed in the shop, 'catalogue' =
   * the brand's own picture. Saying so keeps the website honest: a customer
   * should never think a studio picture is the exact bicycle on the floor.
   */
  photoKind?: 'shop' | 'catalogue';
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
      bn: 'নতুন সাইকেল ও মেরামত — কোলাঘাটেই যোগাযোগ করুন।',
      en: 'New cycles and repairs — talk to the shop in Kolaghat.',
    },
  },
  /** The owner-uploaded portrait fills the homepage hero background. */
  heroPhoto: {
    src: '/images/kanchan-team-hero.jpeg', smallSrc: '/images/kanchan-team-hero.jpeg', smallWidth: 1600, width: 1600, height: 900,
    alt: { bn: 'কাঞ্চন সাইকেল স্টোর্সে দুই দোকানকর্মী', en: 'Two members of the Kanchan Cycle Stores team inside the shop' },
    caption: { bn: 'কাঞ্চন সাইকেল স্টোর্স, কোলাঘাট', en: 'Kanchan Cycle Stores, Kolaghat' },
  },
  /**
   * Photographs of the shop itself, taken by the owner. They are the strongest
   * trust signal a neighbourhood shop has: a customer can see the door, the
   * rows of cycles and the workshop before deciding to visit.
   */
  shopPhotos: [
    {
      src: '/images/shop/storefront.webp', smallSrc: '/images/shop/storefront-480.webp', smallWidth: 480, width: 960, height: 1200,
      alt: { bn: 'রাতের বেলা জ্বলন্ত সাইনবোর্ডসহ কাঞ্চন সাইকেল স্টোর্সের সামনের দিক', en: 'The front of Kanchan Cycle Stores at night with its lit signboard' },
      caption: { bn: 'কোলাঘাটে আমাদের দোকানের সামনে', en: 'Our shopfront in Kolaghat' },
    },
    {
      src: '/images/shop/showroom-row.webp', smallSrc: '/images/shop/showroom-row-400.webp', smallWidth: 400, width: 800, height: 600,
      alt: { bn: 'দোকানের ভেতরে সারি সারি সাজানো সাইকেল', en: 'Rows of cycles arranged inside the shop' },
      caption: { bn: 'দোকানের ভেতরের সাইকেল', en: 'Cycles inside the shop' },
    },
    {
      src: '/images/shop/bicycle-display.webp', smallSrc: '/images/shop/bicycle-display-400.webp', smallWidth: 400, width: 800, height: 600,
      alt: { bn: 'জ্বলন্ত সাইনবোর্ডের সামনে সাজানো সাইকেলের প্রদর্শনী', en: 'Cycles displayed in front of the lit shop sign' },
      caption: { bn: 'সাইকেলের প্রদর্শনী', en: 'On display' },
    },
    {
      src: '/images/shop/stryder-corner.webp', smallSrc: '/images/shop/stryder-corner-400.webp', smallWidth: 400, width: 800, height: 600,
      alt: { bn: 'দোকানের এক কোণে রাখা মাউন্টেন সাইকেল', en: 'A mountain cycle standing in a corner of the shop' },
      caption: { bn: 'দোকানের একটি কোণ', en: 'A corner of the shop' },
    },
    {
      src: '/images/shop/kids-and-city.webp', smallSrc: '/images/shop/kids-and-city-400.webp', smallWidth: 400, width: 800, height: 600,
      alt: { bn: 'দোকানের দেয়ালে ঝোলানো বাচ্চাদের সাইকেল', en: 'Children’s cycles hanging on the shop wall' },
      caption: { bn: 'বাচ্চাদের সাইকেলের অংশ', en: 'Our children’s cycles' },
    },
    {
      src: '/images/shop/workshop.webp', smallSrc: '/images/shop/workshop-400.webp', smallWidth: 400, width: 800, height: 600,
      alt: { bn: 'মেরামতের যন্ত্রপাতি ও সাইকেল নিয়ে দোকানের ওয়ার্কশপ', en: 'The workshop with tools and a cycle' },
      caption: { bn: 'মেরামতের জায়গা', en: 'Where the repairs happen' },
    },
  ] as ShopPhoto[],
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
  /**
   * Delico — the Kolaghat food-delivery app the shop promotes to visitors.
   * Every Delico button, banner and section reads from this block, so the
   * owner can change the link once or switch the whole promotion off with
   * `enabled: false`. These are external links: they open in a new tab so a
   * customer never loses their place on this website.
   *
   * Delico is a separate business. Do not publish prices, delivery times or
   * menu items as if this shop confirmed them — the same honesty rule that
   * applies to cycles applies here.
   */
  delico: {
    enabled: true,
    name: 'Delico',
    /** The website every Delico button points at. */
    url: 'https://delicoapp.com/',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delicorestuarant',
    domainDisplay: 'delicoapp.com',
    tagline: { bn: 'খাবার অর্ডার করুন, দরজায় পৌঁছে যাবে', en: 'Order food, delivered to your door' },
    description: {
      bn: 'Delico কোলাঘাটের একটি ফুড ডেলিভারি অ্যাপ। অ্যাপটিতে রেস্তোরাঁর মেনু দেখে খাবার অর্ডার করা যায়।',
      en: 'Delico is a food-delivery app from Kolaghat. Browse restaurant menus and order food inside the app.',
    },
  },
  // null disables all analytics network requests. See README for consent rules.
  analytics: { endpoint: null as string | null },
  categories: categoryDefinitions,
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
/**
 * The `srcset` for a catalogue photograph, so a phone downloads a small file
 * instead of the full-size one. Undefined for remote (Supabase) photographs.
 */
export const photoSrcSet = (src: string): string | undefined => {
  const entry = photoSrcSets[src];
  if (!entry) return undefined;
  return entry.split(', ').map(part => {
    const [path, descriptor] = part.split(' ');
    return `${asset(path)} ${descriptor}`;
  }).join(', ');
};
export const productPhotos = (product: Product): string[] => {
  const urls = [
    ...(product.photoUrl ? [product.photoUrl] : []),
    ...(product.photoUrls ?? []),
  ].filter((url): url is string => Boolean(url && url.trim()));
  return [...new Set(urls)];
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
