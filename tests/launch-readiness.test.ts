import { describe, expect, it } from 'vitest';
import { launchChecks, launchSummary } from '../src/lib/launchReadiness';
import { shop } from '../src/config/shop';

/**
 * The readiness panel on /owner is the shop's to-do list. It is derived from
 * the configuration, so these tests make sure it keeps saying the truth when
 * the owner changes something.
 */
describe('launch readiness checks', () => {
  const checks = launchChecks();
  const ids = checks.map(check => check.id);

  it('lists every blocker that stands between the site and a customer', () => {
    // The site is not published yet: no address and no indexing.
    expect(ids).toContain('website-url');
    expect(ids).toContain('indexing');
    // No cycle has a price or a confirmed stock status today.
    expect(ids).toContain('prices');
    expect(ids).toContain('stock');
    expect(ids).toContain('hours');
  });

  it('never invents a fact about the shop', () => {
    const cataloguePrices = shop.catalog.filter(product => product.price !== null).length;
    const pricedCheck = checks.find(check => check.id === 'prices');
    // The check only appears while the problem exists.
    expect(Boolean(pricedCheck)).toBe(cataloguePrices === 0);
    if (pricedCheck) expect(pricedCheck.severity).toBe('blocker');
  });

  it('writes every check in Bengali and English', () => {
    for (const check of checks) {
      expect(check.title.bn.length, check.id).toBeGreaterThan(4);
      expect(check.title.en.length, check.id).toBeGreaterThan(4);
      expect(check.detail.bn.length, check.id).toBeGreaterThan(10);
      expect(check.detail.en.length, check.id).toBeGreaterThan(10);
      expect(check.action.bn.length, check.id).toBeGreaterThan(10);
      expect(check.action.en.length, check.id).toBeGreaterThan(10);
    }
  });

  it('counts the blockers and the warnings', () => {
    const summary = launchSummary(checks);
    expect(summary.blockers).toBe(checks.filter(check => check.severity === 'blocker').length);
    expect(summary.warnings).toBe(checks.filter(check => check.severity === 'warning').length);
    expect(summary.blockers + summary.warnings).toBeGreaterThan(0);
  });

  it('gives every check a stable id so the panel can be tracked over time', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });
});
