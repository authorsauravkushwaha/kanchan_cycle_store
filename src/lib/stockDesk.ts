import type { Availability, CategoryId, Product, UseCase } from '../config/shop';
import { shop } from '../config/shop';

/**
 * Owner "stock desk" helpers. The desk is deliberately local-first: the owner
 * can prepare the catalogue on their phone, then copy it into shop.ts or paste
 * the CSV into the Supabase table editor. There is no hidden write API.
 */
export interface DraftProduct {
  key: string;
  id: string;
  slug: string;
  /** The website lists cycles only. */
  kind: 'cycle';
  nameBn: string;
  nameEn: string;
  category: CategoryId;
  brand: string;
  price: string;
  descriptionBn: string;
  descriptionEn: string;
  geared: '' | 'true' | 'false';
  frameSize: string;
  wheelSize: string;
  brakes: string;
  riderHeightMin: string;
  riderHeightMax: string;
  intendedUse: string;
  availability: '' | 'in-stock' | 'out-of-stock';
  featured: boolean;
  /** Optional HTTPS photo of the actual product, supplied by the owner. */
  photoUrl: string;
}

const useCases: UseCase[] = ['school', 'commuting', 'recreation', 'mixed'];
const categoryIds = shop.categories.map(category => category.id);

export function emptyDraft(): DraftProduct {
  return {
    key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: '', slug: '', kind: 'cycle', nameBn: '', nameEn: '', category: 'student', brand: '', price: '',
    descriptionBn: '', descriptionEn: '', geared: '', frameSize: '', wheelSize: '', brakes: '',
    riderHeightMin: '', riderHeightMax: '', intendedUse: '', availability: '', featured: false, photoUrl: '',
  };
}

const text = (value: string, max: number) => value.trim().slice(0, max);
const slugify = (value: string) => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Returns a friendly, field-level reason instead of silently dropping a record. */
export function validateDraft(draft: DraftProduct, others: DraftProduct[]): string[] {
  const errors: string[] = [];
  if (!draft.nameBn.trim()) errors.push('বাংলা নাম / Bengali name is required.');
  if (!draft.nameEn.trim()) errors.push('English name is required.');
  if (!slugify(draft.slug)) errors.push('Slug must use a–z, 0–9 and dashes.');
  if (others.some(other => other.key !== draft.key && slugify(other.slug) === slugify(draft.slug))) errors.push('Slug is already used by another draft.');
  if (!categoryIds.includes(draft.category)) errors.push('Choose a valid category.');
  if (draft.price.trim()) {
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) errors.push('Price must be zero or more, or left empty.');
  }
  const min = draft.riderHeightMin.trim() ? Number(draft.riderHeightMin) : null;
  const max = draft.riderHeightMax.trim() ? Number(draft.riderHeightMax) : null;
  if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) errors.push('Rider height must be a number.');
  if (min !== null && max !== null && min > max) errors.push('Rider height minimum must not exceed the maximum.');
  if (draft.photoUrl.trim()) {
    try {
      const url = new URL(draft.photoUrl.trim());
      if (url.protocol !== 'https:') errors.push('Photo link must start with https://');
    } catch { errors.push('Photo link is not a valid URL.'); }
  }
  return errors;
}

/** A record the owner can review before publishing — never auto-filled with guesses. */
export function draftToProduct(draft: DraftProduct): Product {
  const price = draft.price.trim() ? Math.round(Number(draft.price)) : null;
  const min = draft.riderHeightMin.trim() ? Number(draft.riderHeightMin) : null;
  const max = draft.riderHeightMax.trim() ? Number(draft.riderHeightMax) : null;
  const intended = draft.intendedUse.split(',').map(use => use.trim()).filter((use): use is UseCase => (useCases as string[]).includes(use));
  return {
    id: text(draft.id, 80) || slugify(draft.slug),
    slug: slugify(draft.slug),
    kind: draft.kind,
    nameBn: text(draft.nameBn, 120),
    nameEn: text(draft.nameEn, 120),
    category: draft.category,
    brand: text(draft.brand, 60) || null,
    price: price !== null && price >= 0 ? price : null,
    descriptionBn: text(draft.descriptionBn, 600) || 'বিস্তারিত ও স্টক জানতে দোকানে জিজ্ঞাসা করুন।',
    descriptionEn: text(draft.descriptionEn, 600) || 'Ask the shop for details and stock.',
    specifications: {
      geared: draft.geared === '' ? null : draft.geared === 'true',
      frameSize: text(draft.frameSize, 40) || null,
      wheelSize: text(draft.wheelSize, 40) || null,
      brakes: text(draft.brakes, 40) || null,
      riderHeightCm: min !== null && max !== null ? { min, max } : null,
      intendedUse: intended.length ? intended : null,
    },
    availability: (draft.availability || null) as Availability,
    featured: draft.featured,
    photoUrl: draft.photoUrl.trim() || null,
  };
}

const csvCell = (value: string | number | boolean | null) => {
  if (value === null) return '';
  const raw = String(value);
  return /[",\n]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
};

const pgArray = (values: string[]) => values.length ? `{${values.map(value => `"${value.replaceAll('"', '\\"')}"`).join(',')}}` : '';

export const CSV_COLUMNS = ['id', 'slug', 'kind', 'name_bn', 'name_en', 'category', 'brand', 'price',
  'description_bn', 'description_en', 'geared', 'frame_size', 'wheel_size', 'brakes',
  'rider_height_min', 'rider_height_max', 'intended_use', 'availability', 'featured', 'photo_url', 'published', 'sort_order'] as const;

/** CSV shaped exactly like the Supabase `products` table, ready for the table editor import. */
export function draftsToCsv(drafts: DraftProduct[]): string {
  const rows = drafts.map(draft => {
    const product = draftToProduct(draft);
    const values: Record<(typeof CSV_COLUMNS)[number], string | number | boolean | null> = {
      id: product.id, slug: product.slug, kind: product.kind, name_bn: product.nameBn, name_en: product.nameEn,
      category: product.category, brand: product.brand, price: product.price,
      description_bn: product.descriptionBn, description_en: product.descriptionEn,
      geared: product.specifications.geared, frame_size: product.specifications.frameSize,
      wheel_size: product.specifications.wheelSize, brakes: product.specifications.brakes,
      rider_height_min: product.specifications.riderHeightCm?.min ?? null,
      rider_height_max: product.specifications.riderHeightCm?.max ?? null,
      intended_use: pgArray(product.specifications.intendedUse || []),
      availability: product.availability, featured: product.featured, photo_url: product.photoUrl ?? null, published: true, sort_order: 0,
    };
    return CSV_COLUMNS.map(column => csvCell(values[column])).join(',');
  });
  return [CSV_COLUMNS.join(','), ...rows].join('\n') + '\n';
}

/** JSON that can be pasted into `catalog: [...]` in src/config/shop.ts. */
export function draftsToCatalogJson(drafts: DraftProduct[]): string {
  return JSON.stringify(drafts.map(draftToProduct), null, 2);
}

export function parseDrafts(raw: string | null): DraftProduct[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      const value = item as Partial<DraftProduct>;
      if (typeof value.nameBn !== 'string' || typeof value.slug !== 'string') return [];
      const base = emptyDraft();
      return [{
        ...base,
        key: typeof value.key === 'string' ? value.key : base.key,
        id: typeof value.id === 'string' ? value.id : '',
        slug: value.slug,
        kind: 'cycle' as const,
        nameBn: value.nameBn, nameEn: typeof value.nameEn === 'string' ? value.nameEn : value.nameBn,
        category: categoryIds.includes(value.category as CategoryId) ? value.category as CategoryId : 'student',
        brand: typeof value.brand === 'string' ? value.brand : '',
        price: typeof value.price === 'string' ? value.price : '',
        descriptionBn: typeof value.descriptionBn === 'string' ? value.descriptionBn : '',
        descriptionEn: typeof value.descriptionEn === 'string' ? value.descriptionEn : '',
        geared: value.geared === 'true' || value.geared === 'false' ? value.geared : '',
        frameSize: typeof value.frameSize === 'string' ? value.frameSize : '',
        wheelSize: typeof value.wheelSize === 'string' ? value.wheelSize : '',
        brakes: typeof value.brakes === 'string' ? value.brakes : '',
        riderHeightMin: typeof value.riderHeightMin === 'string' ? value.riderHeightMin : '',
        riderHeightMax: typeof value.riderHeightMax === 'string' ? value.riderHeightMax : '',
        intendedUse: typeof value.intendedUse === 'string' ? value.intendedUse : '',
        availability: value.availability === 'in-stock' || value.availability === 'out-of-stock' ? value.availability : '',
        featured: value.featured === true,
        photoUrl: typeof value.photoUrl === 'string' ? value.photoUrl : '',
      }];
    });
  } catch { return []; }
}
