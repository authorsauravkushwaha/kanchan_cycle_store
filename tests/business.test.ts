import { describe, expect, it } from 'vitest';
import { shop } from '../src/config/shop';
import { whatsappHref, productUrl } from '../src/lib/business';
import { fixtureProducts } from './fixtures';
import { validateCatalog } from '../src/lib/configValidation';

describe('contact configuration', () => {
  it('uses the supplied digits-only international WhatsApp number and encodes Bengali', () => {
    const message = 'নমস্কার, দাম ও স্টক জানাবেন? / hello & goodbye';
    const url = new URL(whatsappHref(message)!);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/917076884950');
    expect(url.searchParams.get('text')).toBe(message);
  });
  it('creates a shareable product URL without a fabricated domain', () => {
    expect(productUrl('test-city')).toBe('http://localhost:3000/cycles/test-city');
  });
  it('keeps unconfirmed hours, prices, inventory, offers and reviews unpublished', () => {
    expect(shop.hours.confirmed).toBe(false);
    expect(shop.catalog).toHaveLength(19);
    expect(shop.catalog.every(product => product.price === null && product.availability === null)).toBe(true);
    expect(validateCatalog(shop.catalog, shop.categories.map(c => c.id))).toEqual([]);
    expect(shop.offers).toEqual([]);
    expect(shop.reviews).toEqual([]);
    expect(shop.services.every(service => service.price === null)).toBe(true);
    // Only the owner-confirmed "bicycle repair & servicing" service is published as confirmed.
    expect(shop.services.filter(service => service.confirmed).map(service => service.id)).toEqual(['general']);
  });
  it('uses the exact supplied coordinates and postal address', () => {
    expect(shop.coordinates).toEqual({ latitude: 22.4452382, longitude: 87.8751764 });
    expect(shop.directionsUrl).toBe('https://www.google.com/maps/dir/?api=1&destination=22.4452382%2C87.8751764');
    expect(shop.address.postalCode).toBe('721134');
    expect(shop.contact.phone).toBe('+917076884950');
  });
});
describe('catalog validation', () => {
  it('accepts explicitly unknown information in valid records', () => {
    expect(validateCatalog(fixtureProducts, shop.categories.map(c => c.id))).toEqual([]);
  });
  it('rejects duplicate slugs, negative prices and inconsistent categories', () => {
    const invalid = { ...fixtureProducts[0], slug: fixtureProducts[1].slug, price: -1, category: 'accessories' as const };
    const errors = validateCatalog([invalid, fixtureProducts[1]], shop.categories.map(c => c.id));
    expect(errors.join(' ')).toMatch(/slug|price|kind/);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
