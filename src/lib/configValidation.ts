import type { Product } from '../config/shop';
/** Fail a production build rather than silently publishing inconsistent records. */
export function validateCatalog(products: Product[], categoryIds: string[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const [index, product] of products.entries()) {
    const label = `Product ${index + 1} (${product.id || 'missing id'})`;
    if (!product.id || ids.has(product.id)) errors.push(`${label}: id must be nonempty and unique.`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) || slugs.has(product.slug)) errors.push(`${label}: slug must be unique lowercase words separated by hyphens.`);
    ids.add(product.id); slugs.add(product.slug);
    if (!product.nameBn.trim() || !product.nameEn.trim()) errors.push(`${label}: both names are required.`);
    if (!product.descriptionBn.trim() || !product.descriptionEn.trim()) errors.push(`${label}: both descriptions are required.`);
    if (!categoryIds.includes(product.category)) errors.push(`${label}: unknown category.`);
    if (product.price !== null && (!Number.isFinite(product.price) || product.price < 0)) errors.push(`${label}: price must be null or a nonnegative finite number.`);
    if (![null, 'in-stock', 'out-of-stock'].includes(product.availability)) errors.push(`${label}: invalid availability.`);
    if (product.specifications.geared !== null && typeof product.specifications.geared !== 'boolean') errors.push(`${label}: gearing must be true, false or null.`);
    const range = product.specifications.riderHeightCm;
    if (range && (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min <= 0 || range.max < range.min)) errors.push(`${label}: invalid rider height range.`);
    if (product.specifications.intendedUse?.some(use => !['school', 'commuting', 'recreation', 'mixed'].includes(use))) errors.push(`${label}: invalid intended use.`);
    if (product.photoUrls !== undefined) {
      if (!Array.isArray(product.photoUrls) || product.photoUrls.some(url => typeof url !== 'string' || !url.trim())) errors.push(`${label}: photoUrls must contain nonempty strings.`);
      else if (new Set(product.photoUrls).size !== product.photoUrls.length) errors.push(`${label}: photoUrls must not contain duplicate entries.`);
    }
  }
  return errors;
}
