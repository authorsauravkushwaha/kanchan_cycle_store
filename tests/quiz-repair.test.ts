import { describe, expect, it } from 'vitest';
import { emptyAnswers, recommendProducts, validateQuizStep } from '../src/lib/quiz';
import { emptyRepair, localToday, normalizePhone, validateRepair } from '../src/lib/repair';
import { fixtureProducts } from './fixtures';
const answers = { rider: 'child', age: '8', height: '', budget: 'under-5000', use: 'school', gear: 'non-geared' };
describe('safe recommendations', () => {
  it('requires all non-skippable answers', () => {
    expect(validateQuizStep(0, emptyAnswers)).toBe('quiz.errorRider');
    expect(validateQuizStep(1, { ...emptyAnswers, age: '1' })).toBe('quiz.errorAge');
    expect(validateQuizStep(2, { ...emptyAnswers, height: '500' })).toBe('quiz.errorHeight');
    expect(validateQuizStep(2, emptyAnswers)).toBeNull();
  });
  it('never recommends an unknown-price bicycle for a fixed budget', () => {
    expect(recommendProducts(fixtureProducts, answers)).toEqual([]);
    expect(recommendProducts([], answers)).toEqual([]);
  });
  it('uses verified category, budget and gearing when available', () => {
    const matches = recommendProducts(fixtureProducts, { ...answers, rider: 'adult', age: '30', budget: '5000-10000', use: 'commuting' });
    expect(matches.map(p => p.id)).toEqual(['test-city']);
  });
  it('rejects oversized numeric strings before running the quiz validation regex', () => {
    expect(validateQuizStep(1, { ...answers, age: '9'.repeat(2_000_000) })).toBe('quiz.errorAge');
    expect(validateQuizStep(2, { ...answers, height: '9'.repeat(2_000_000) })).toBe('quiz.errorHeight');
  });
  it('does not infer fit when height is supplied without manufacturer measurements', () => {
    expect(recommendProducts(fixtureProducts, { ...answers, rider: 'adult', age: '30', height: '190', budget: '5000-10000' })).toEqual([]);
  });
  it('does not recommend out-of-stock products', () => {
    expect(recommendProducts(fixtureProducts, { ...answers, rider: 'adult', age: '30', budget: '10000-20000', gear: 'geared', use: 'mixed' })).toEqual([]);
  });
});
describe('repair enquiry validation', () => {
  const valid = { ...emptyRepair, name: 'পরীক্ষা নাম', phone: '7076884950', bikeType: 'city', service: 'brakes', date: '2026-10-30', time: '10:30' };
  it('requires every booking detail but not optional notes', () => {
    expect(Object.keys(validateRepair(emptyRepair, '2026-10-29'))).toHaveLength(6);
    expect(validateRepair(valid, '2026-10-29')).toEqual({});
  });
  it('rejects past and impossible dates', () => {
    expect(validateRepair({ ...valid, date: '2026-10-28' }, '2026-10-29').date).toBe('form.errorDate');
    expect(validateRepair({ ...valid, date: '2026-02-30' }, '2026-01-01').date).toBe('form.errorDate');
  });
  it('accepts Bengali digits and international formatting', () => {
    expect(normalizePhone('৭০৭৬৮৮৪৯৫০')).toBe('7076884950');
    expect(validateRepair({ ...valid, phone: '+91 70768 84950' }, '2026-10-29')).toEqual({});
    expect(validateRepair({ ...valid, phone: 'call me' }, '2026-10-29').phone).toBe('form.errorPhone');
  });
  it('builds a local calendar date rather than a UTC-shifted date', () => {
    expect(localToday(new Date(2026, 9, 29, 0, 15))).toBe('2026-10-29');
  });
});
describe('untrusted repair form values', () => {
  const valid = { ...emptyRepair, name: 'Test User', phone: '7076884950', bikeType: 'city', service: 'general', date: '2026-10-30', time: '10:30' };
  it('rejects forged select values and oversized notes', () => {
    const errors = validateRepair({ ...valid, bikeType: '<script>', service: '__proto__', source: 'unknown', details: 'x'.repeat(1001) }, '2026-10-30');
    expect(errors).toMatchObject({ bikeType: 'form.errorBike', service: 'form.errorService', source: 'form.errorSource', details: 'form.errorDetails' });
  });
  it('rejects unexpected runtime types without crashing', () => {
    expect(validateRepair({ ...valid, details: null, name: 42 } as unknown as typeof valid, '2026-10-30')).toMatchObject({ name: 'form.errorName', details: 'form.errorDetails' });
  });
  it('rejects oversized phone numbers and control characters', () => {
    expect(validateRepair({ ...valid, phone: '1'.repeat(23), details: 'hi\u0000there' }, '2026-10-30')).toMatchObject({ phone: 'form.errorPhone', details: 'form.errorDetails' });
  });
  it('bounds very long inputs before normalization or regular-expression work', () => {
    const huge = '9'.repeat(2_000_000);
    expect(validateRepair({ ...valid, name: huge, phone: huge, details: huge }, '2026-10-30')).toMatchObject({ name: 'form.errorName', phone: 'form.errorPhone', details: 'form.errorDetails' });
    expect(normalizePhone(huge)).toBe('');
    expect(validateRepair(null as unknown as typeof valid, '2026-10-30')).toHaveProperty('name', 'form.errorName');
  });
});
