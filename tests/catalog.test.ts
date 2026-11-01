import { describe, expect, it } from 'vitest';
import { defaultFilters, filterProducts, matchProducts, parseFilters } from '../src/lib/catalog';
import { fixtureProducts } from './fixtures';
const filter = (changes: Partial<typeof defaultFilters>) => filterProducts(fixtureProducts, { ...defaultFilters, ...changes }, 'en').map(p => p.id);
describe('catalog search, filters and sorting', () => {
  it('searches Bengali, English and brand names without mutation', () => {
    expect(filter({ query: 'শিশুদের' })).toEqual(['test-kids']);
    expect(filter({ query: 'CITY' })).toEqual(['test-city']);
    expect(filter({ query: 'test brand' })).toEqual(['test-city', 'test-geared']);
    expect(fixtureProducts).toHaveLength(3);
  });
  it('also searches the cycle description, not only the title', () => {
    // Customers type a brand, a purpose or a word from the description and
    // expect to find the cycle, not an exact title match.
    expect(filter({ query: 'fixture' })).toEqual(['test-city', 'test-kids', 'test-geared']);
    expect(filter({ query: 'স্বয়ংক্রিয়' })).toEqual(['test-city', 'test-kids', 'test-geared']);
  });
  it('filters every cycle category', () => {
    expect(filter({ category: 'kids' })).toEqual(['test-kids']);
    expect(filter({ category: 'city' })).toEqual(['test-city']);
    expect(filter({ category: 'geared' })).toEqual(['test-geared']);
    expect(filter({ category: 'student' })).toEqual([]);
    expect(filter({ category: 'electric' })).toEqual([]);
  });
  it('never treats unknown gearing as non-geared', () => {
    // A cycle whose gearing the shop has not confirmed is still listed, but it
    // is marked as unconfirmed instead of being silently dropped.
    const matches = matchProducts(fixtureProducts, { ...defaultFilters, gear: 'geared' }, 'en');
    expect(matches.map(match => match.product.id)).toEqual(['test-geared', 'test-kids']);
    expect(matches.map(match => match.status)).toEqual(['confirmed', 'unconfirmed']);
    expect(matches[1].pending).toEqual(['gear']);
  });
  it('keeps cycles with an unconfirmed price in budget results, last and flagged', () => {
    const matches = matchProducts(fixtureProducts, { ...defaultFilters, budget: 'under-5000' }, 'en');
    expect(matches.map(match => match.product.id)).toEqual(['test-kids']);
    expect(matches[0].status).toBe('unconfirmed');
    expect(matches[0].pending).toEqual(['budget']);
    // A confirmed price outside the budget is still excluded; the cycle whose
    // price is unknown stays in the list, after the confirmed matches.
    expect(filter({ budget: '5000-10000' })).toEqual(['test-city', 'test-kids']);
    expect(filter({ budget: '10000-20000' })).toEqual(['test-geared', 'test-kids']);
  });
  it('sorts verified prices and leaves unknown prices last in both directions', () => {
    expect(filter({ sort: 'price-asc' })).toEqual(['test-city', 'test-geared', 'test-kids']);
    expect(filter({ sort: 'price-desc' })).toEqual(['test-geared', 'test-city', 'test-kids']);
  });
  it('sanitizes URL parameters and returns a useful empty state', () => {
    expect(parseFilters(new URLSearchParams('category=invalid&gear=unknown&sort=bad&budget=bad'))).toEqual(defaultFilters);
    expect(filter({ query: 'no such cycle' })).toEqual([]);
  });
});
