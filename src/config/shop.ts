/**
 * কাঞ্চন সাইকেল স্টোর্স — the single owner-configuration file.
 * Read OWNER_CHECKLIST.md before changing verification flags.
 * Never turn an unknown price, stock level, service or offer into a claim.
 * Only the values in this file need editing for routine business updates.
 */
export type Language = 'bn' | 'en';
export type Localized = { bn: string; en: string };
export type CategoryId = 'kids' | 'student' | 'city' | 'geared' | 'electric' | 'accessories';
export type Availability = 'in-stock' | 'out-of-stock' | null;
export type UseCase = 'school' | 'commuting' | 'recreation' | 'mixed';
export interface ImageAsset {
  src: string;
  alt: Localized;
  width: number;
  height: number;
  illustrative: boolean;
  /** Optional smaller variant for responsive loading; omit if not available. */
  smallSrc?: string;
  smallWidth?: number;
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
  image: string;
  imageAlt: Localized;
  imageIsIllustrative: boolean;
  imageWidth: number;
  imageHeight: number;
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
export const photos = {
  hero: {
    src: '/images/hero-cycle.webp', smallSrc: '/images/hero-cycle-400.webp', smallWidth: 400, width: 500, height: 647, illustrative: true,
    alt: { bn: 'গাছের ছায়ায় একটি পথে দাঁড়িয়ে থাকা সাইকেল — প্রতীকী ছবি', en: 'A bicycle on a tree-lined path — illustrative photograph' },
  },
  kids: {
    src: '/images/kids-cycle.webp', smallSrc: '/images/kids-cycle-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'সাইকেল চালাচ্ছে একটি শিশু — বিভাগের প্রতীকী ছবি', en: 'A child enjoying a bicycle ride — illustrative category photograph' },
  },
  student: {
    src: '/images/student-cycle.webp', smallSrc: '/images/student-cycle-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'রাস্তার ধারে দুটি ক্লাসিক সাইকেল — প্রতীকী ছবি', en: 'Two classic bicycles beside a street — illustrative photograph' },
  },
  city: {
    src: '/images/city-cycle.webp', smallSrc: '/images/city-cycle-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'সবুজ রেলিংয়ের পাশে একটি সিটি সাইকেল — প্রতীকী ছবি', en: 'A green city bicycle beside railings — illustrative photograph' },
  },
  geared: {
    src: '/images/geared-cycle.webp', smallSrc: '/images/geared-cycle-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'বনের পথে সাইকেল চালাচ্ছেন একজন আরোহী — প্রতীকী ছবি', en: 'A cyclist riding along a forest trail — illustrative photograph' },
  },
  electric: {
    src: '/images/electric-cycle.webp', smallSrc: '/images/electric-cycle-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'পথের ধারে রাখা একটি ইলেকট্রিক সাইকেল — প্রতীকী ছবি', en: 'An electric bicycle parked beside a path — illustrative photograph' },
  },
  accessories: {
    src: '/images/accessories.webp', smallSrc: '/images/accessories-320.webp', smallWidth: 320, width: 480, height: 400, illustrative: true,
    alt: { bn: 'হ্যান্ডেলবারে লাগানো লাল রঙের সাইকেল বেল — প্রতীকী ছবি', en: 'A red bicycle bell on a handlebar — illustrative photograph' },
  },
  repair: {
    src: '/images/repair.webp', smallSrc: '/images/repair-480.webp', smallWidth: 480, width: 500, height: 750, illustrative: true,
    alt: { bn: 'সাইকেলের গিয়ার মেরামত করছেন একজন মেকানিক — প্রতীকী ছবি', en: 'A mechanic working on bicycle gears — illustrative photograph' },
  },
} satisfies Record<string, ImageAsset>;

export const shop = {
  name: { bn: 'কাঞ্চন সাইকেল স্টোর্স', en: 'Kanchan Cycle Stores' },
  tagline: { bn: 'আপনার পথে, আপনার পাশে।', en: 'Your ride. Your neighbourhood.' },
  announcement: {
    enabled: true,
    text: {
      bn: 'আপনার পছন্দের সাইকেল খুঁজুন — আজই যোগাযোগ করুন!',
      en: 'Find your next bicycle — talk to your local cycle shop today!',
    },
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
    // Owner supplied 9 AM–9 PM daily, but explicitly requested confirmation.
    // Keep false until confirmed. The public site will NOT publish these hours.
    confirmed: false,
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:00',
    closes: '21:00',
    display: { bn: 'প্রতিদিন সকাল ৯টা–রাত ৯টা', en: 'Every day, 9:00 AM–9:00 PM' },
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
    { id: 'kids', name: { bn: 'বাচ্চাদের সাইকেল', en: 'Kids’ cycles' }, subtitle: { bn: 'ছোট্ট পথচলার শুরু', en: 'Little rides, big smiles' }, image: photos.kids, availabilityConfirmed: false },
    { id: 'student', name: { bn: 'স্টুডেন্ট সাইকেল', en: 'Student cycles' }, subtitle: { bn: 'স্কুল থেকে কলেজের পথে', en: 'For the everyday journey' }, image: photos.student, availabilityConfirmed: false },
    { id: 'city', name: { bn: 'দৈনন্দিন সাইকেল', en: 'City & commuter' }, subtitle: { bn: 'চেনা পথে প্রতিদিন', en: 'Make the daily ride yours' }, image: photos.city, availabilityConfirmed: false },
    { id: 'geared', name: { bn: 'গিয়ার সাইকেল', en: 'Geared cycles' }, subtitle: { bn: 'পথ বদলাক, উৎসাহ নয়', en: 'A little more adventure' }, image: photos.geared, availabilityConfirmed: false },
    { id: 'electric', name: { bn: 'ইলেকট্রিক সাইকেল', en: 'Electric cycles' }, subtitle: { bn: 'নতুন ধরনের পথচলা', en: 'Explore a different ride' }, image: photos.electric, availabilityConfirmed: false },
    { id: 'accessories', name: { bn: 'সাইকেলের অ্যাক্সেসরিজ', en: 'Accessories' }, subtitle: { bn: 'যাত্রার ছোট্ট সঙ্গী', en: 'The little essentials' }, image: photos.accessories, availabilityConfirmed: false },
  ] as { id: CategoryId; name: Localized; subtitle: Localized; image: ImageAsset; availabilityConfirmed: boolean }[],
  /**
   * No product records were provided. Do not add fictional products to fill space.
   * A complete, commented example is in OWNER_CHECKLIST.md (not in public data).
   * Price, specifications, photos and availability must be checked by the owner.
   */
  catalog: [] as Product[],
  services: [
    { id: 'puncture', name: { bn: 'পাংচার মেরামত', en: 'Puncture repair' }, description: { bn: 'টিউবের সমস্যা ও মেরামতের খরচ সম্পর্কে জিজ্ঞাসা করুন।', en: 'Ask about tube problems and the cost of a repair.' }, confirmed: false, price: null },
    { id: 'brakes', name: { bn: 'ব্রেক অ্যাডজাস্টমেন্ট', en: 'Brake adjustment' }, description: { bn: 'ব্রেকের সমস্যার কথা জানিয়ে পরামর্শ নিন।', en: 'Describe the issue with your brakes and ask for advice.' }, confirmed: false, price: null },
    { id: 'chain', name: { bn: 'চেইন ও লুব্রিকেশন', en: 'Chain & lubrication' }, description: { bn: 'চেইনের সমস্যা ও যত্নের বিষয়ে কথা বলুন।', en: 'Talk to the shop about chain issues and care.' }, confirmed: false, price: null },
    { id: 'general', name: { bn: 'সাধারণ সার্ভিসিং', en: 'General servicing' }, description: { bn: 'সাইকেলের অবস্থা জানিয়ে সার্ভিসিং সম্পর্কে জিজ্ঞাসা করুন।', en: 'Tell us about your bicycle and ask about servicing.' }, confirmed: false, price: null },
    { id: 'gears', name: { bn: 'গিয়ার অ্যাডজাস্টমেন্ট', en: 'Gear adjustment' }, description: { bn: 'গিয়ার বদলাতে সমস্যা হচ্ছে? দোকানে জানান।', en: 'Having trouble shifting gears? Let the shop know.' }, confirmed: false, price: null },
    { id: 'tyres', name: { bn: 'টায়ার ও টিউব বদল', en: 'Tyre & tube replacement' }, description: { bn: 'সাইকেলের মাপ জানিয়ে টায়ার ও টিউবের খোঁজ নিন।', en: 'Share your bicycle’s size to ask about tyres and tubes.' }, confirmed: false, price: null },
  ] as Service[],
  offers: [] as Offer[],
  reviews: [] as Review[],
  reviewUrl: null as string | null,
  shopPhotos: [] as ImageAsset[],
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
