import { shop, verifiedProducts } from '../config/shop';
import type { CategoryId, Product, UseCase } from '../config/shop';

/**
 * Live inventory, with no mandatory backend.
 *
 * - If Supabase is not configured the catalog comes from src/config/shop.ts,
 *   exactly as before. The website is fully static and works offline.
 * - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, published rows are
 *   read through the public REST endpoint (read-only key, row-level security).
 *   The last good response is cached on the phone, so a weak connection on the
 *   shop floor never shows an empty catalogue.
 *
 * The owner's phone can update stock without rebuilding the website.
 */
const CACHE_KEY = 'kanchan-catalog-cache-v2';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // Revalidate in the background after a day.

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const inventoryConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) && SUPABASE_KEY.length > 20;

export interface CatalogSnapshot {
  products: Product[];
  source: 'static' | 'live' | 'cache';
  fetchedAt: number | null;
}

const categoryIds = new Set<CategoryId>(shop.categories.map(category => category.id));
const uses = new Set<UseCase>(['school', 'commuting', 'recreation', 'mixed']);
const clean = (value: unknown, max: number): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
const optional = (value: unknown, max: number): string | null => clean(value, max) || null;
const slugSafe = (value: string) => /^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(value);
/** Only plain HTTPS image URLs from the configured Supabase project are shown. */
function securePhoto(value: unknown): string | null {
  const raw = clean(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (inventoryConfigured && url.hostname !== new URL(SUPABASE_URL).hostname) return null;
    return url.href;
  } catch { return null; }
}

/** Maps one Supabase row into the Product shape used throughout the UI. */
export function productFromRow(row: Record<string, unknown>): Product | null {
  const id = clean(row.id, 80);
  const slug = clean(row.slug, 80);
  // The website lists cycles only; accessory rows are ignored.
  if (row.kind === 'accessory') return null;
  const kind = 'cycle' as const;
  const category = (clean(row.category, 30) || 'city') as CategoryId;
  if (!id || !slugSafe(slug) || !categoryIds.has(category)) return null;
  const priceValue = row.price === null || row.price === undefined || row.price === '' ? null : Number(row.price);
  const price = priceValue !== null && Number.isFinite(priceValue) && priceValue >= 0 ? Math.round(priceValue) : null;
  const availability = row.availability === 'in-stock' || row.availability === 'out-of-stock' ? row.availability : null;
  const geared = typeof row.geared === 'boolean' ? row.geared : null;
  const min = Number(row.rider_height_min);
  const max = Number(row.rider_height_max);
  const riderHeightCm = Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min && max < 250 ? { min, max } : null;
  const intendedUse = Array.isArray(row.intended_use)
    ? (row.intended_use as unknown[]).map(use => String(use)).filter((use): use is UseCase => uses.has(use as UseCase))
    : null;
  const nameBn = clean(row.name_bn, 120) || clean(row.name_en, 120);
  const nameEn = clean(row.name_en, 120) || nameBn;
  if (!nameBn || !nameEn) return null;
  const photoUrl = securePhoto(row.photo_url);
  const extraPhotos = Array.isArray(row.photo_urls)
    ? [...new Set((row.photo_urls as unknown[]).map(securePhoto).filter((url): url is string => Boolean(url)))]
    : null;
  return {
    id,
    slug,
    kind,
    nameBn,
    nameEn,
    category,
    brand: optional(row.brand, 60),
    price,
    descriptionBn: clean(row.description_bn, 600) || 'বিস্তারিত ও স্টক জানতে দোকানে জিজ্ঞাসা করুন।',
    descriptionEn: clean(row.description_en, 600) || 'Ask the shop for details and stock.',
    specifications: {
      geared,
      frameSize: optional(row.frame_size, 40),
      wheelSize: optional(row.wheel_size, 40),
      brakes: optional(row.brakes, 40),
      riderHeightCm,
      intendedUse: intendedUse && intendedUse.length ? intendedUse : null,
    },
    availability,
    featured: row.featured === true,
    photoUrl: photoUrl ?? extraPhotos?.[0] ?? null,
    ...(extraPhotos && extraPhotos.length ? { photoUrls: extraPhotos } : {}),
  };
}

const dedupe = (products: Product[]): Product[] => {
  const byId = new Map<string, Product>();
  const slugs = new Set<string>();
  for (const product of products) {
    if (byId.has(product.id) || slugs.has(product.slug)) continue;
    byId.set(product.id, product);
    slugs.add(product.slug);
  }
  return [...byId.values()];
};

export function readCachedCatalog(): CatalogSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { products?: unknown; fetchedAt?: unknown };
    if (!Array.isArray(parsed.products)) return null;
    const products = dedupe(parsed.products.map(row => row && typeof row === 'object' ? productFromRow(row as Record<string, unknown>) : null)
      .filter((product): product is Product => Boolean(product)));
    if (!products.length) return null;
    const fetchedAt = typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : null;
    return { products, source: 'cache', fetchedAt };
  } catch { return null; }
}

function writeCachedCatalog(products: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      fetchedAt: Date.now(),
      products: products.map(product => ({
        id: product.id, slug: product.slug, kind: product.kind, name_bn: product.nameBn, name_en: product.nameEn,
        category: product.category, brand: product.brand, price: product.price,
        description_bn: product.descriptionBn, description_en: product.descriptionEn,
        geared: product.specifications.geared, frame_size: product.specifications.frameSize,
        wheel_size: product.specifications.wheelSize, brakes: product.specifications.brakes,
        rider_height_min: product.specifications.riderHeightCm?.min ?? null,
        rider_height_max: product.specifications.riderHeightCm?.max ?? null,
        intended_use: product.specifications.intendedUse, availability: product.availability, featured: product.featured, photo_url: product.photoUrl ?? null, photo_urls: product.photoUrls ?? null,
      })),
    }));
  } catch { /* Storage quota is optional; live data still renders. */ }
}

export function cacheIsFresh(snapshot: CatalogSnapshot | null): boolean {
  return Boolean(snapshot?.fetchedAt && Date.now() - snapshot.fetchedAt < CACHE_MAX_AGE);
}

/** Public, read-only catalogue request. Returns null when it cannot be used. */
export async function fetchLiveCatalog(signal?: AbortSignal): Promise<Product[] | null> {
  if (!inventoryConfigured) return null;
  const query = new URLSearchParams({
    select: '*',
    published: 'eq.true',
    order: 'sort_order.asc,id.asc',
    limit: '500',
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/products?${query.toString()}`, {
    signal,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' },
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });
  if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error('Catalogue response was not a list.');
  const products = dedupe(rows.map(row => row && typeof row === 'object' ? productFromRow(row as Record<string, unknown>) : null)
    .filter((product): product is Product => Boolean(product)));
  writeCachedCatalog(products);
  return products;
}

/** Static seed plus a live/cached catalogue, live rows winning on the same id. */
export function mergeCatalog(live: Product[] | null): Product[] {
  const seed = verifiedProducts();
  if (!live || !live.length) return dedupe(seed);
  const liveIds = new Set(live.map(product => product.id));
  return dedupe([...live, ...seed.filter(product => !liveIds.has(product.id))]);
}

export function initialCatalog(): CatalogSnapshot {
  const cached = readCachedCatalog();
  if (cached) return { products: mergeCatalog(cached.products), source: 'cache', fetchedAt: cached.fetchedAt };
  return { products: dedupe(verifiedProducts()), source: 'static', fetchedAt: null };
}
