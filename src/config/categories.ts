import type { Category, Localized } from './shop.ts';

/**
 * The shop's bicycle categories. Kept in its own module so the catalogue can
 * build a description for every cycle without a circular import.
 */
export const categoryDefinitions: Category[] = [
  { id: 'kids', name: { bn: 'বাচ্চাদের সাইকেল', en: 'Kids’ cycles' }, subtitle: { bn: 'ছোট্ট পথচলার শুরু', en: 'Little rides, big smiles' }, availabilityConfirmed: false },
  { id: 'student', name: { bn: 'স্টুডেন্ট সাইকেল', en: 'Student cycles' }, subtitle: { bn: 'স্কুল থেকে কলেজের পথে', en: 'For the everyday journey' }, availabilityConfirmed: false },
  { id: 'city', name: { bn: 'দৈনন্দিন ব্যবহারের সাইকেল', en: 'Everyday city cycles' }, subtitle: { bn: 'চেনা পথে প্রতিদিন', en: 'Make the daily ride yours' }, availabilityConfirmed: false },
  { id: 'geared', name: { bn: 'গিয়ার সাইকেল', en: 'Geared cycles' }, subtitle: { bn: 'পথ বদলাক, উৎসাহ নয়', en: 'A little more adventure' }, availabilityConfirmed: false },
  // Premium models are sold through the shop, but stock and shop prices still
  // need confirming in person, so availabilityConfirmed stays false.
  { id: 'premium', name: { bn: 'প্রিমিয়াম সাইকেল', en: 'Premium cycles' }, subtitle: { bn: 'বাছাই করা উন্নত মডেল', en: 'Hand-picked, higher-spec models' }, availabilityConfirmed: false },
  { id: 'electric', name: { bn: 'ইলেকট্রিক সাইকেল', en: 'Electric cycles' }, subtitle: { bn: 'নতুন ধরনের পথচলা', en: 'Explore a different ride' }, availabilityConfirmed: false },
];

/** A short Bengali description of what the category is for. */
export const categoryPurpose: Record<Category['id'], Localized> = {
  kids: { bn: 'ছোট বাচ্চাদের জন্য সাইকেল', en: 'a bicycle for a young child' },
  student: { bn: 'স্কুল বা কলেজের পথের সাইকেল', en: 'a bicycle for the school or college journey' },
  city: { bn: 'প্রতিদিনের যাতায়াতের সাইকেল', en: 'an everyday city bicycle' },
  geared: { bn: 'গিয়ারযুক্ত সাইকেল', en: 'a geared bicycle' },
  premium: { bn: 'উন্নত মডেলের প্রিমিয়াম সাইকেল', en: 'a premium bicycle' },
  electric: { bn: 'ব্যাটারিসহ ইলেকট্রিক সাইকেল', en: 'an electric bicycle' },
};
