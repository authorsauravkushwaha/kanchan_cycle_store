import type { CategoryId, Product } from './shop';
import { categoryPurpose } from './categories.ts';

// Names and photos are based on the images supplied by the shop. Prices,
// availability and specifications remain unknown until the shop confirms them.
const cyclePhotos: { nameEn: string; nameBn: string; category: CategoryId; brand: string | null; photoKind: 'shop' | 'catalogue' }[] = [
  { nameEn: 'Classic step-through cycle', nameBn: 'ক্লাসিক স্টেপ-থ্রু সাইকেল', category: 'city', brand: null, photoKind: 'catalogue' },
  { nameEn: 'Avon Mallika', nameBn: 'অ্যাভন মল্লিকা', category: 'city', brand: 'Avon', photoKind: 'catalogue' },
  { nameEn: 'Hero Sprint Attitude', nameBn: 'হিরো স্প্রিন্ট অ্যাটিটিউড', category: 'student', brand: 'Hero', photoKind: 'catalogue' },
  { nameEn: 'Leader Breeze', nameBn: 'লিডার ব্রিজ', category: 'city', brand: 'Leader', photoKind: 'catalogue' },
  { nameEn: 'Brooks kids ride-on', nameBn: 'ব্রুকস শিশুদের রাইড-অন', category: 'kids', brand: 'Brooks', photoKind: 'shop' },
  { nameEn: 'Avon Waka Waka', nameBn: 'অ্যাভন ওয়াকা ওয়াকা', category: 'student', brand: 'Avon', photoKind: 'catalogue' },
  { nameEn: 'Brooks kids tricycle', nameBn: 'ব্রুকস শিশুদের ট্রাইসাইকেল', category: 'kids', brand: 'Brooks', photoKind: 'catalogue' },
  { nameEn: 'BMV white cycle', nameBn: 'বিএমভি সাদা সাইকেল', category: 'geared', brand: 'BMV', photoKind: 'catalogue' },
  { nameEn: 'BSA Mudhawk', nameBn: 'বিএসএ মাডহক', category: 'kids', brand: 'BSA', photoKind: 'catalogue' },
  { nameEn: 'Cosmic cycle', nameBn: 'কসমিক সাইকেল', category: 'geared', brand: 'Cosmic', photoKind: 'catalogue' },
  { nameEn: 'BMV X6 green cycle', nameBn: 'বিএমভি এক্স৬ সবুজ সাইকেল', category: 'geared', brand: 'BMV', photoKind: 'catalogue' },
  { nameEn: 'Hercules cycle', nameBn: 'হারকিউলিস সাইকেল', category: 'student', brand: 'Hercules', photoKind: 'catalogue' },
  { nameEn: 'Hero black and blue cycle', nameBn: 'হিরো কালো ও নীল সাইকেল', category: 'student', brand: 'Hero', photoKind: 'catalogue' },
  { nameEn: 'Stryder Harris', nameBn: 'স্ট্রাইডার হ্যারিস', category: 'student', brand: 'Stryder', photoKind: 'catalogue' },
  { nameEn: 'Stryder Hat-Trik', nameBn: 'স্ট্রাইডার হ্যাট-ট্রিক', category: 'kids', brand: 'Stryder', photoKind: 'catalogue' },
  { nameEn: 'Gang red cycle', nameBn: 'গ্যাং লাল সাইকেল', category: 'student', brand: 'Gang', photoKind: 'catalogue' },
  { nameEn: 'BSA Ladybird Diva', nameBn: 'বিএসএ লেডিবার্ড ডিভা', category: 'city', brand: 'BSA', photoKind: 'catalogue' },
  { nameEn: 'Hero black and orange cycle', nameBn: 'হিরো কালো ও কমলা সাইকেল', category: 'student', brand: 'Hero', photoKind: 'catalogue' },
  { nameEn: 'Tornado black and orange cycle', nameBn: 'টর্নেডো কালো ও কমলা সাইকেল', category: 'student', brand: 'Tornado', photoKind: 'catalogue' },
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
    photoKind: 'shop',
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
    photoKind: 'catalogue',
  },
  {
    id: 'stryder-electric-cycle',
    slug: 'stryder-electric-cycle',
    kind: 'cycle',
    nameBn: 'স্ট্রাইডার ইলেকট্রিক সাইকেল',
    nameEn: 'Stryder electric cycle',
    category: 'electric',
    brand: 'Stryder',
    price: null,
    descriptionBn: 'স্ট্রাইডার ইলেকট্রিক সাইকেল, ব্যাটারি সহ। রেঞ্জ, গতি, চার্জিং সময়, দাম ও স্টক দোকানে জানতে হবে।',
    descriptionEn: 'Stryder electric cycle with battery. Range, speed, charging time, price and stock are confirmed at the shop — contact the shop for details.',
    specifications: { geared: null, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: true,
    photoUrl: '/images/cycles/cycle-24.jpg',
    photoUrls: ['/images/cycles/cycle-24.jpg'],
    photoKind: 'shop',
  },
];

/**
 * Models added from the shop's own photographs and the Gang catalogue posters
 * the owner shared.
 *
 * The pictures on the website are cleaned studio renders prepared from those
 * photographs: the shop floor, cardboard, plastic wrapping, people and poster
 * text are removed so every card looks the same. Each cycle keeps its own
 * distinct picture — no photograph is reused between two products.
 *
 * Names come from the lettering on the frame or the brand's poster. Prices,
 * stock, frame sizes and wheel sizes stay with the shop until it confirms them.
 */
const studioCycles: Product[] = [
  {
    id: 'gang-lil-fairy-pink',
    slug: 'gang-lil-fairy-pink',
    kind: 'cycle',
    nameBn: 'গ্যাং লিল ফেয়ারি (গোলাপি)',
    nameEn: 'Gang Lil Fairy (pink)',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং লিল ফেয়ারি (গোলাপি): বাচ্চাদের ছোট সাইকেল, গোলাপি ফ্রেমে প্যাস্টেল ঢেউয়ের নকশা, সামনে ঝুড়ি, উঁচু ব্যাকরেস্টসহ নরম সিট, পুরো চেইন কভার ও ট্রেনিং হুইল। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Lil Fairy in hot pink: a small kids’ cycle with pastel wave graphics, a front basket, a padded saddle with a tall backrest, a full chain cover and a training wheel. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-25.webp',
    photoUrls: ['/images/cycles/cycle-25.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-lil-fairy-blue',
    slug: 'gang-lil-fairy-blue',
    kind: 'cycle',
    nameBn: 'গ্যাং লিল ফেয়ারি (নীল)',
    nameEn: 'Gang Lil Fairy (blue)',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং লিল ফেয়ারি (নীল): গাঢ় নীল ফ্রেমে গোলাপি ও হালকা নীল ফুলের নকশা, লোগো বসানো সামনের ঝুড়ি, উঁচু ব্যাকরেস্টসহ নরম সিট, পুরো চেইন কভার ও ট্রেনিং হুইল। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Lil Fairy in deep blue, with pink and light-blue floral waves, a basket carrying the Lil Fairy logo, a padded saddle with a tall backrest, a full chain cover and a training wheel. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-26.webp',
    photoUrls: ['/images/cycles/cycle-26.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-lil-fairy-purple',
    slug: 'gang-lil-fairy-purple',
    kind: 'cycle',
    nameBn: 'গ্যাং লিল ফেয়ারি (বেগুনি)',
    nameEn: 'Gang Lil Fairy (purple)',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং লিল ফেয়ারি (বেগুনি): বেগুনি ফ্রেমে হালকা ল্যাভেন্ডার টপ টিউব, ফুলের নকশা, বেগুনি ঝুড়ি, উঁচু ব্যাকরেস্টসহ নরম সিট, পুরো চেইন কভার ও ট্রেনিং হুইল। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Lil Fairy in purple with a lavender top tube, floral graphics, a purple front basket, a padded saddle with a tall backrest, a full chain cover and a training wheel. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-27.webp',
    photoUrls: ['/images/cycles/cycle-27.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-four-bmx-cyan',
    slug: 'gang-four-bmx-cyan',
    kind: 'cycle',
    nameBn: 'গ্যাং ফোর বিএমএক্স (সায়ান)',
    nameEn: 'Gang Four BMX (cyan)',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং ফোর বিএমএক্স (সায়ান): বিএমএক্স ধাঁচের বাচ্চাদের সাইকেল, ফিরোজা ফ্রেম, সাদা GANG লেখা কালো ম্যাগ হুইল, পিছনে ক্যারিয়ার, পুরো চেইন কভার ও সামনে রিম ব্রেক। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Four BMX in cyan: a BMX-style kids’ cycle with a turquoise frame, black mag wheels carrying white GANG lettering, a rear carrier, a full chain cover and a front rim brake. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: 'Rim brake', riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-28.webp',
    photoUrls: ['/images/cycles/cycle-28.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-four-bmx-red',
    slug: 'gang-four-bmx-red',
    kind: 'cycle',
    nameBn: 'গ্যাং ফোর বিএমএক্স (লাল)',
    nameEn: 'Gang Four BMX (red)',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং ফোর বিএমএক্স (লাল): বিএমএক্স ধাঁচের বাচ্চাদের সাইকেল, উজ্জ্বল লাল ফ্রেম, সাদা GANG লেখা কালো ম্যাগ হুইল, পিছনে ক্যারিয়ার, পুরো চেইন কভার ও সামনে রিম ব্রেক। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Four BMX in red: a BMX-style kids’ cycle with a bright red frame, black mag wheels carrying white GANG lettering, a rear carrier, a full chain cover and a front rim brake. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: 'Rim brake', riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-29.webp',
    photoUrls: ['/images/cycles/cycle-29.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-vroom-20',
    slug: 'gang-vroom-20',
    kind: 'cycle',
    nameBn: 'গ্যাং ভ্রুম ২০',
    nameEn: 'Gang Vroom 20',
    category: 'kids',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং ভ্রুম ২০: নিয়ন সবুজ ও কালো রঙের বিএমএক্স ধাঁচের বাচ্চাদের সাইকেল, একই রঙের ম্যাগ হুইল, পিছনে ক্যারিয়ার, পুরো চেইন কভার ও খাঁজকাটা টায়ার। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Vroom 20 in neon green and black: a BMX-style kids’ cycle with matching green-and-black mag wheels, a rear carrier, a full chain cover and knobby tyres. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-30.webp',
    photoUrls: ['/images/cycles/cycle-30.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'minnie-kids-cycle',
    slug: 'minnie-kids-cycle',
    kind: 'cycle',
    nameBn: 'মিন্নি শিশুদের সাইকেল',
    nameEn: 'Minnie kids cycle',
    category: 'kids',
    brand: null,
    price: null,
    descriptionBn: 'মিন্নি শিশুদের সাইকেল: গোলাপি রঙে ফুল ও কার্টুন ইঁদুরের নকশা, সাদা সামনের ঝুড়ি, পিছনের ক্যারিয়ারে মুখের আকৃতির প্লেট, ব্যাকরেস্টসহ নরম সিট, পুরো চেইন কভার ও ট্রেনিং হুইল। চাকার মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Minnie kids’ cycle in pink with floral and cartoon-mouse graphics, a white front basket, a face-shaped plate on the rear carrier, a padded saddle with a backrest, a full chain cover and a training wheel. Ask the shop to confirm the wheel size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-31.webp',
    photoUrls: ['/images/cycles/cycle-31.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-tiana',
    slug: 'gang-tiana',
    kind: 'cycle',
    nameBn: 'গ্যাং টিয়ানা',
    nameEn: 'Gang Tiana',
    category: 'city',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং টিয়ানা: বেগুনি স্টেপ-থ্রু সিটি সাইকেল, কোরাল রঙের ফুলের নকশা, সাদা তারের সামনের ঝুড়ি, পিছনে ক্যারিয়ার ও ফুলের নকশার চেইন কভার। প্রতিদিনের যাতায়াতের জন্য সহজে চড়া যায়। ফ্রেমের মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Tiana: a purple step-through city cycle with coral floral graphics, a white wire front basket, a rear carrier and a floral chain cover. Easy to mount for everyday errands. Ask the shop to confirm the frame size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-32.webp',
    photoUrls: ['/images/cycles/cycle-32.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-alice',
    slug: 'gang-alice',
    kind: 'cycle',
    nameBn: 'গ্যাং অ্যালিস',
    nameEn: 'Gang Alice',
    category: 'city',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং অ্যালিস: বেগুনি স্টেপ-থ্রু সিটি সাইকেল, হালকা নীল ফর্ক, ফুলের নকশা, সাদা তারের সামনের ঝুড়ি, পিছনে ক্যারিয়ার ও ফুলের চেইন কভার। ফ্রেমের মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang Alice: a purple step-through city cycle with a pale blue front fork, floral graphics, a white wire front basket, a rear carrier and a floral chain cover. Ask the shop to confirm the frame size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-33.webp',
    photoUrls: ['/images/cycles/cycle-33.webp'],
    photoKind: 'catalogue',
  },
  {
    id: 'gang-floral-city-teal',
    slug: 'gang-floral-city-teal',
    kind: 'cycle',
    nameBn: 'গ্যাং ফুলের নকশার সিটি সাইকেল (টিল)',
    nameEn: 'Gang floral city cycle (teal)',
    category: 'city',
    brand: 'Gang',
    price: null,
    descriptionBn: 'গ্যাং ফুলের নকশার সিটি সাইকেল (টিল): ফিরোজা রঙের স্টেপ-থ্রু সিটি সাইকেল, গোলাপি ফুলের নকশা, সাদা তারের সামনের ঝুড়ি, পিছনে ক্যারিয়ার ও ফুলের চেইন কভার। মডেলের নাম, ফ্রেমের মাপ, দাম ও স্টক দোকানে জেনে নিন।',
    descriptionEn: 'The Gang floral city cycle in turquoise teal: a step-through city cycle with pink floral graphics, a white wire front basket, a rear carrier and a floral chain cover. Ask the shop to confirm the model name, frame size, price and stock.',
    specifications: { geared: false, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    availability: null,
    featured: false,
    photoUrl: '/images/cycles/cycle-34.webp',
    photoUrls: ['/images/cycles/cycle-34.webp'],
    photoKind: 'catalogue',
  },
];

/** Old consolidated Defender slugs redirect to the single geared Defender listing. */
export const legacyCycleSlugs: Record<string, string> = {
  'hercules-defender-fx-dd': 'hercules-top-gear-defender-fx-dd',
  'hercules-defender-rf-vb': 'hercules-top-gear-defender-fx-dd',
};

/**
 * Every cycle gets its own description. Nineteen of them used to share one
 * generic sentence, which made the catalogue look empty and gave search
 * engines nothing to tell one cycle from another. The wording states only what
 * is known: the model name, the brand and what the category is for. Price,
 * stock and size stay with the shop.
 */
const photographedCycles: Product[] = cyclePhotos.map((cycle, index) => {
  const id = `supplied-cycle-${String(index + 1).padStart(2, '0')}`;
  const purpose = categoryPurpose[cycle.category];
  const brandBn = cycle.brand ? `${cycle.brand} ব্র্যান্ডের ` : '';
  const brandEn = cycle.brand ? `${cycle.brand} ` : '';
  return {
    ...cycle, id, slug: id, kind: 'cycle', price: null, availability: null, featured: false,
    descriptionBn: `${cycle.nameBn} — ${brandBn}${purpose.bn}। মডেল, দাম, স্টক ও মাপ দোকানে যোগাযোগ করে নিশ্চিত করুন।`,
    descriptionEn: `${cycle.nameEn} — ${brandEn}${purpose.en}. Ask the shop to confirm the model, price, stock and size.`,
    specifications: { geared: null, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    photoUrl: `/images/cycles/cycle-${String(index + 1).padStart(2, '0')}.webp`,
  };
});

export const suppliedCycles: Product[] = [...photographedCycles, ...premiumCycles, ...studioCycles];
