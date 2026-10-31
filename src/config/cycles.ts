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

export const suppliedCycles: Product[] = cyclePhotos.map((cycle, index) => {
  const id = `supplied-cycle-${String(index + 1).padStart(2, '0')}`;
  return {
    ...cycle, id, slug: id, kind: 'cycle', price: null, availability: null, featured: false,
    descriptionEn: 'Contact the shop for details and current availability.',
    descriptionBn: 'বিস্তারিত ও বর্তমান স্টক জানতে দোকানে যোগাযোগ করুন।',
    specifications: { geared: null, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null },
    photoUrl: `/images/cycles/cycle-${String(index + 1).padStart(2, '0')}.webp`,
  };
});
