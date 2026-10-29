import { describe, expect, it } from 'vitest';
import { defaultFilters, filterProducts, parseFilters } from '../src/lib/catalog';
import { fixtureProducts } from './fixtures';
const filter = (changes: Partial<typeof defaultFilters>) => filterProducts(fixtureProducts, { ...defaultFilters, ...changes }, 'en').map(p => p.id);
describe('catalog search, filters and sorting', () => {
  it('searches Bengali, English and brand names without mutation', () => {
    expect(filter({ query: 'শিশুদের' })).toEqual(['test-kids']);
    expect(filter({ query: 'CITY' })).toEqual(['test-city']);
    expect(filter({ query: 'test brand' })).toEqual(['test-city', 'test-geared']);
    expect(fixtureProducts).toHaveLength(3);
  });
  it('filters every cycle category', () => {
    expect(filter({ category: 'kids' })).toEqual(['test-kids']);
    expect(filter({ category: 'city' })).toEqual(['test-city']);
    expect(filter({ category: 'geared' })).toEqual(['test-geared']);
    expect(filter({ category: 'student' })).toEqual([]);
    expect(filter({ category: 'electric' })).toEqual([]);
  });
  it('does not treat unknown gearing as non-geared', () => {
    expect(filter({ gear: 'geared' })).toEqual(['test-geared']);
    expect(filter({ gear: 'non-geared' })).toEqual(['test-city']);
  });
  it('excludes unknown prices from budget filters', () => {
    expect(filter({ budget: 'under-5000' })).toEqual([]);
    expect(filter({ budget: '5000-10000' })).toEqual(['test-city']);
    expect(filter({ budget: '10000-20000' })).toEqual(['test-geared']);
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
