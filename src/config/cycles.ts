import type { CategoryId, Product } from './shop';

// Names and photos are based on the images supplied by the shop. Prices,
// availability and specifications remain unknown until the shop confirms them.
const cyclePhotos: { nameEn: string; nameBn: string; category: CategoryId; brand: string | null }[] = [
  { nameEn: 'Classic step-through cycle', nameBn: 'ক্লাসিক স্টেপ-থ্রু সাইকেল', category: 'city', brand: null },
  { nameEn: 'Avon Mallika', nameBn: 'অ্যাভন মল্লিকা', category: 'city', brand: 'Avon' },
  { nameEn: 'Hero Sprint Attitude', nameBn: 'হিরো স্প্রিন্ট অ্যাটিটিউড', category: 'student', brand: 'Hero' },
  { nameEn: 'Leader Breeze', nameBn: 'লিডার ব্রিজ', category: 'city', brand: 'Leader' },
  { nameEn: 'Brooks kids ride-on', nameBn: 'ব্রুকস শিশুদের রাইড-অন', category: 'kids', brand: 'Brooks' },
  { nameEn: 'Avon Waka Waka', nameBn: 'অ্যাভন ওয়াকা ওয়াকা', category: 'student', brand: 'Avon' },
  { nameEn: 'Brooks kids tricycle', nameBn: 'ব্রুকস শিশুদের ট্রাইসাইকেল', category: 'kids', brand: 'Brooks' },
  { nameEn: 'BMV white cycle', nameBn: 'বিএমভি সাদা সাইকেল', category: 'geared', brand: 'BMV' },
  { nameEn: 'BSA Mudhawk', nameBn: 'বিএসএ মাডহক', category: 'kids', brand: 'BSA' },
  { nameEn: 'Cosmic cycle', nameBn: 'কসমিক সাইকেল', category: 'geared', brand: 'Cosmic' },
  { nameEn: 'BMV X6 green cycle', nameBn: 'বিএমভি এক্স৬ সবুজ সাইকেল', category: 'geared', brand: 'BMV' },
  { nameEn: 'Hercules cycle', nameBn: 'হারকিউলিস সাইকেল', category: 'student', brand: 'Hercules' },
  { nameEn: 'Hero black and blue cycle', nameBn: 'হিরো কালো ও নীল সাইকেল', category: 'student', brand: 'Hero' },
  { nameEn: 'Stryder Harris', nameBn: 'স্ট্রাইডার হ্যারিস', category: 'student', brand: 'Stryder' },
  { nameEn: 'Stryder Hat-Trik', nameBn: 'স্ট্রাইডার হ্যাট-ট্রিক', category: 'kids', brand: 'Stryder' },
  { nameEn: 'Gang red cycle', nameBn: 'গ্যাং লাল সাইকেল', category: 'student', brand: 'Gang' },
  { nameEn: 'BSA Ladybird Diva', nameBn: 'বিএসএ লেডিবার্ড ডিভা', category: 'city', brand: 'BSA' },
  { nameEn: 'Hero black and orange cycle', nameBn: 'হিরো কালো ও কমলা সাইকেল', category: 'student', brand: 'Hero' },
  { nameEn: 'Tornado black and orange cycle', nameBn: 'টর্নেডো কালো ও কমলা সাইকেল', category: 'student', brand: 'Tornado' },
];

/**
 * Premium models photographed at the shop and supplied by the owner.
 *
 * Shop prices and stock remain unconfirmed (`price: null`, `availability: null`),
 * and unknown specifications stay null so the enquiry flow asks the shop directly.
 */
const premiumCycles: Product[] = [
  {
    id: 'hercules-top-gear-defender-fx-dd',
    slug: 'hercules-top-gear-defender-fx-dd',
    kind: 'cycle',
    nameBn: 'হারকিউলিস টপ গিয়ার ডিফেন্ডার FX DD',
    nameEn: 'Hercules Top Gear Defender FX DD',
    category: 'premium',
    brand: 'Hercules',
    price: null,
    descriptionBn: 'হারকিউলিস টপ গিয়ার ডিফেন্ডার FX DD — গিয়ারযুক্ত ডিফেন্ডার। স্টিল ফ্রেম, ২১-স্পিড Shimano গিয়ার, ডুয়াল ডিস্ক ব্রেক, ফ্রন্ট সাসপেনশন, ডাবল-ওয়াল অ্যালয় রিম ও ২.৪ ইঞ্চি MTB নাইলন টায়ার। চাকার মাপ, বর্তমান দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The geared Defender: Hercules Top Gear Defender FX DD with a steel frame, 21-speed Shimano gearing, dual disc brakes, front suspension and double-wall alloy rims, on 2.4 inch MTB nylon tyres. Ask the shop about wheel sizes, the current price and stock.',
    specifications: { geared: true, frameSize: null, wheelSize: null, brakes: 'Dual disc', riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: true,
    photoUrl: '/images/cycles/cycle-20.webp',
    photoUrls: ['/images/cycles/cycle-20.webp', '/images/cycles/cycle-21.webp'],
  },
  {
    id: 'tata-stryder-harris-x-ic-dd',
    slug: 'tata-stryder-harris-x-ic-dd',
    kind: 'cycle',
    nameBn: 'টাটা স্ট্রাইডার Harris-X IC DD',
    nameEn: 'Tata Stryder Harris-X IC DD',
    category: 'premium',
    brand: 'Tata Stryder',
    price: null,
    descriptionBn: '২৬ ইঞ্চি চাকার Tata Stryder Harris-X IC DD মাউন্টেন বাইক। ১৭ ইঞ্চি TIG-ওয়েল্ডেড স্টিল ফ্রেম, ২৬ × ২.৩৫ ইঞ্চি নাইলন টায়ার, সিঙ্গেল-স্পিড ও ডুয়াল ডিস্ক ব্রেক। থ্রেডেড ফ্রন্ট সাসপেনশন, স্টিল রিম, হাফ-অ্যালয় ব্রেক লিভার, লো-রাইজ স্টিল MTB হ্যান্ডেলবার, কুইক-রিলিজসহ প্যাডেড PU স্যাডল, রিফ্লেক্টরযুক্ত প্লাস্টিক প্যাডেল, ১৮-দাঁতের ফ্রিহুইল এবং প্লাস্টিক চেইন গার্ডসহ চেইনহুইল। ওয়াটার বোতল ও কেজ অ্যাক্সেসরি তালিকাভুক্ত; ভারতে তৈরি। বর্তমান দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Tata Stryder Harris-X IC DD is a 26-inch-wheel mountain bike with a 17-inch TIG-welded steel frame, 26 × 2.35 inch nylon tyres, single-speed gearing and dual disc brakes. It has a threaded front suspension fork, steel rims, half-alloy brake levers, a low-rise steel MTB handlebar, a padded PU saddle with quick release, reflectorised plastic pedals, an 18-tooth freewheel and a chainwheel with a plastic guard. A water bottle and cage are listed as accessories. Made in India. Ask the shop for the current price and stock.',
    specifications: { geared: false, frameSize: '17 in', wheelSize: '26 in', brakes: 'Dual disc', riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: true,
    photoUrl: '/images/cycles/cycle-23.webp',
    photoUrls: ['/images/cycles/cycle-23.webp', '/images/cycles/cycle-22.webp'],
  },
];

/** Old consolidated Defender slugs redirect to the single geared Defender listing. */
export const legacyCycleSlugs: Record<string, string> = {
  'hercules-defender-fx-dd': 'hercules-top-gear-defender-fx-dd',
  'hercules-defender-rf-vb': 'hercules-top-gear-defender-fx-dd',
};

const photographedCycles: Product[] = cyclePhotos.map((cycle, index) => {
  const id = `supplied-cycle-${String(index + 1).padStart(2, '0')}`;
  return {
    ...cycle, id, slug: id, kind: 'cycle', price: null, availability: null, featured: false,
    descriptionEn: 'Contact the shop for details and current availability.',
    descriptionBn: 'বিস্তারিত ও বর্তমান স্টক জানতে দোকানে যোগাযোগ করুন।',
    specifications: { geared: null, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    photoUrl: `/images/cycles/cycle-${String(index + 1).padStart(2, '0')}.webp`,
  };
});

export const suppliedCycles: Product[] = [...photographedCycles, ...premiumCycles];
