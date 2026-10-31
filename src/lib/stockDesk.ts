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
export const MAX_DRAFTS = 500;
export const MAX_DRAFT_IMPORT_BYTES = 1024 * 1024;
export const MAX_DRAFT_STORAGE_BYTES = 2 * 1024 * 1024;
const FIELD_MAX_LENGTH: Partial<Record<keyof DraftProduct, number>> = {
  id: 80, slug: 80, nameBn: 120, nameEn: 120, brand: 60, price: 10,
  descriptionBn: 600, descriptionEn: 600, frameSize: 40, wheelSize: 40, brakes: 40,
  riderHeightMin: 3, riderHeightMax: 3, intendedUse: 80, photoUrl: 500,
};
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function emptyDraft(): DraftProduct {
  return {
    key: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: '', slug: '', kind: 'cycle', nameBn: '', nameEn: '', category: 'student', brand: '', price: '',
    descriptionBn: '', descriptionEn: '', geared: '', frameSize: '', wheelSize: '', brakes: '',
    riderHeightMin: '', riderHeightMax: '', intendedUse: '', availability: '', featured: false, photoUrl: '',
  };
}

const text = (value: string, max: number) => value.slice(0, max).trim();
const slugify = (value: string) => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const normalizeDraftSlug = (value: string) => slugify(value);

/** Returns a friendly, field-level reason instead of silently dropping a record. */
export function validateDraft(draft: DraftProduct, others: DraftProduct[]): string[] {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return ['Draft is invalid.'];
  const errors: string[] = [];
  const textFields = Object.entries(FIELD_MAX_LENGTH) as [keyof DraftProduct, number][];
  const invalidTypes = textFields.some(([field]) => typeof draft[field] !== 'string');
  if (invalidTypes) return ['Draft contains invalid field types.'];
  for (const [field, max] of textFields) {
    const value = draft[field] as string;
    if (value.length > max) errors.push(`${field} is too long (maximum ${max} characters).`);
    else if (CONTROL_CHARS.test(value)) errors.push(`${field} contains unsupported control characters.`);
  }
  // Do not call trim(), URL(), split() or a regex on any overlong value.
  if (errors.length) return errors;
  if (typeof draft.key !== 'string' || draft.key.length > 80 || typeof draft.featured !== 'boolean') return ['Draft contains invalid field types.'];
  if (draft.kind !== 'cycle') errors.push('Only cycle drafts are supported.');
  if (!draft.nameBn.trim()) errors.push('বাংলা নাম / Bengali name is required.');
  if (!draft.nameEn.trim()) errors.push('English name is required.');

  // Normalize once, then run only bounded, linear-time checks on user input.
  const normalizedSlug = slugify(draft.slug);
  const normalizedId = slugify(draft.id) || normalizedSlug;
  if (normalizedSlug.length < 3 || normalizedSlug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) errors.push('Slug must use a–z, 0–9 and dashes.');
  if (others.some(other => other.key !== draft.key && slugify(other.slug) === normalizedSlug)) errors.push('Slug is already used by another draft.');
  if (others.some(other => other.key !== draft.key && (slugify(other.id) || slugify(other.slug)) === normalizedId)) errors.push('ID is already used by another draft.');
  if (!categoryIds.includes(draft.category)) errors.push('Choose a valid category.');
  if (!['', 'true', 'false'].includes(draft.geared)) errors.push('Choose a valid gear option.');
  if (!['', 'in-stock', 'out-of-stock'].includes(draft.availability)) errors.push('Choose a valid stock option.');
  if (draft.price.trim()) {
    const price = Number(draft.price);
    if (!/^\d+$/.test(draft.price) || !Number.isSafeInteger(price) || price > 2_147_483_647) errors.push('Price must be a whole number from 0 to 2,147,483,647, or left empty.');
  }
  const readHeight = (value: string) => {
    if (!value.trim()) return null;
    if (!/^\d{1,3}$/.test(value)) return Number.NaN;
    const number = Number(value);
    return number >= 1 && number < 250 ? number : Number.NaN;
  };
  const min = readHeight(draft.riderHeightMin);
  const max = readHeight(draft.riderHeightMax);
  if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) errors.push('Rider height must be a whole number from 1 to 249 cm.');
  if (min !== null && max !== null && Number.isFinite(min) && Number.isFinite(max) && min > max) errors.push('Rider height minimum must not exceed the maximum.');
  if (draft.intendedUse.split(',').some(value => value.trim() && !useCases.includes(value.trim() as UseCase))) errors.push('Choose only listed intended uses.');
  if (draft.photoUrl.trim()) {
    try {
      const url = new URL(draft.photoUrl.trim());
      if (url.protocol !== 'https:' || url.username || url.password) errors.push('Photo link must be an HTTPS URL without embedded credentials.');
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

/**
 * Parse only bounded, well-shaped device-local draft data. The browser file
 * picker is not a trust boundary: callers can also pass localStorage contents.
 */
export function parseDrafts(raw: string | null, maxLength = MAX_DRAFT_IMPORT_BYTES): DraftProduct[] {
  if (!raw || raw.length > maxLength) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > MAX_DRAFTS) return [];
    const accepted: DraftProduct[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const value = item as Record<string, unknown>;
      if (typeof value.nameBn !== 'string' || typeof value.slug !== 'string') continue;
      if (value.nameBn.length > 120 || value.slug.length > 80 || CONTROL_CHARS.test(value.nameBn) || CONTROL_CHARS.test(value.slug)) continue;
      const base = emptyDraft();
      const specsValue = value.specifications && typeof value.specifications === 'object' && !Array.isArray(value.specifications)
        ? value.specifications as Record<string, unknown> : {};
      const heightValue = specsValue.riderHeightCm && typeof specsValue.riderHeightCm === 'object' && !Array.isArray(specsValue.riderHeightCm)
        ? specsValue.riderHeightCm as Record<string, unknown> : {};
      const readTextValue = (candidate: unknown, max: number, fallback = ''): string | null => {
        if (candidate === undefined || candidate === null) return fallback;
        if (typeof candidate !== 'string' || candidate.length > max || CONTROL_CHARS.test(candidate)) return null;
        return candidate;
      };
      const readText = (field: keyof DraftProduct, max: number, fallback = '') => readTextValue(value[field], max, fallback);
      const priceValue = value.price === undefined ? '' : value.price === null ? ''
        : typeof value.price === 'number' && Number.isSafeInteger(value.price) ? String(value.price) : value.price;
      const rawUse = value.intendedUse ?? specsValue.intendedUse;
      const useValue = Array.isArray(rawUse) && rawUse.length <= 4 && rawUse.every(use => typeof use === 'string')
        ? rawUse.join(', ') : rawUse;
      const rawMin = value.riderHeightMin ?? heightValue.min;
      const rawMax = value.riderHeightMax ?? heightValue.max;
      const minValue = typeof rawMin === 'number' && Number.isFinite(rawMin) ? String(rawMin) : rawMin;
      const maxValue = typeof rawMax === 'number' && Number.isFinite(rawMax) ? String(rawMax) : rawMax;
      const rawGeared = value.geared ?? specsValue.geared;
      const fields = {
        id: readText('id', 80), brand: readText('brand', 60), price: readTextValue(priceValue, 10),
        descriptionBn: readText('descriptionBn', 600), descriptionEn: readText('descriptionEn', 600),
        frameSize: readText('frameSize', 40), wheelSize: readText('wheelSize', 40), brakes: readText('brakes', 40),
        riderHeightMin: readTextValue(minValue, 3), riderHeightMax: readTextValue(maxValue, 3),
        intendedUse: readTextValue(useValue, 80), photoUrl: readText('photoUrl', 500),
        nameEn: readText('nameEn', 120, value.nameBn),
      };
      if (Object.values(fields).some(field => field === null)) continue;
      const candidate: DraftProduct = {
        ...base,
        key: typeof value.key === 'string' && value.key.length <= 40 && /^draft-\d{1,16}-[a-z0-9]{1,12}$/.test(value.key) ? value.key : base.key,
        id: fields.id!, slug: value.slug, kind: 'cycle', nameBn: value.nameBn, nameEn: fields.nameEn!,
        category: categoryIds.includes(value.category as CategoryId) ? value.category as CategoryId : 'student',
        brand: fields.brand!, price: fields.price!,
        descriptionBn: fields.descriptionBn!, descriptionEn: fields.descriptionEn!,
        geared: rawGeared === true ? 'true' : rawGeared === false ? 'false' : rawGeared === 'true' || rawGeared === 'false' ? rawGeared : '',
        frameSize: fields.frameSize!, wheelSize: fields.wheelSize!, brakes: fields.brakes!,
        riderHeightMin: fields.riderHeightMin!, riderHeightMax: fields.riderHeightMax!,
        intendedUse: fields.intendedUse!,
        availability: value.availability === 'in-stock' || value.availability === 'out-of-stock' ? value.availability : '',
        featured: value.featured === true, photoUrl: fields.photoUrl!,
      };
      if (validateDraft(candidate, accepted).length === 0) accepted.push(candidate);
    }
    return accepted;
  } catch { return []; }
}
