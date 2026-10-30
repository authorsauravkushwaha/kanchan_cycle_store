import type { Product } from '../src/config/shop';
/** TEST FIXTURES ONLY. Fictional records; never import into src or public catalog. */
export const fixtureProducts: Product[] = [
  {
    id: 'test-city', slug: 'test-city', kind: 'cycle', nameBn: 'পরীক্ষামূলক সিটি সাইকেল', nameEn: 'Test City Bicycle', category: 'city', brand: 'Test Brand',
    price: 5499,
    descriptionBn: 'শুধু স্বয়ংক্রিয় পরীক্ষার তথ্য।', descriptionEn: 'Automated test fixture only.',
    specifications: { geared: false, frameSize: '18 in', wheelSize: '26 in', brakes: null, riderHeightCm: { min: 145, max: 175 }, intendedUse: ['commuting', 'school'] }, availability: null, featured: true,
  },
  {
    id: 'test-kids', slug: 'test-kids', kind: 'cycle', nameBn: 'পরীক্ষামূলক শিশুদের সাইকেল', nameEn: 'Test Kids Bicycle', category: 'kids', brand: null,
    price: null,
    descriptionBn: 'শুধু স্বয়ংক্রিয় পরীক্ষার তথ্য।', descriptionEn: 'Automated test fixture only.',
    specifications: { geared: null, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: null, intendedUse: null }, availability: null, featured: false,
  },
  {
    id: 'test-geared', slug: 'test-geared', kind: 'cycle', nameBn: 'পরীক্ষামূলক গিয়ার সাইকেল', nameEn: 'Test Geared Bicycle', category: 'geared', brand: 'Test Brand',
    price: 12000,
    descriptionBn: 'শুধু স্বয়ংক্রিয় পরীক্ষার তথ্য।', descriptionEn: 'Automated test fixture only.',
    specifications: { geared: true, frameSize: null, wheelSize: null, brakes: null, riderHeightCm: { min: 155, max: 185 }, intendedUse: ['mixed'] }, availability: 'out-of-stock', featured: false,
  },
];
