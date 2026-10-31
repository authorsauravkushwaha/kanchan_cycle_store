import { describe, expect, it } from 'vitest';
import { entryFromProduct, hasUnpriced, parseShortlist, shortlistCount, shortlistMessage, shortlistTotal } from '../src/lib/shortlist';
import { fixtureProducts } from './fixtures';

describe('shortlist storage', () => {
  it('ignores corrupt, duplicated or oversized stored data', () => {
    expect(parseShortlist(null)).toEqual([]);
    expect(parseShortlist('not json')).toEqual([]);
    expect(parseShortlist('{"id":"x"}')).toEqual([]);
    expect(parseShortlist(' '.repeat(32 * 1024 + 1))).toEqual([]);
    const entries = parseShortlist(JSON.stringify([
      { id: 'a', slug: 'a', nameBn: 'ক', nameEn: 'A', qty: 42, price: 100 },
      { id: 'a', slug: 'a', nameBn: 'ক', nameEn: 'A', qty: 1, price: 100 },
      { id: 'b', slug: 'b', nameBn: 'খ', nameEn: 'B', qty: 0, price: -5 },
      { slug: 'missing-id' },
    ]));
    expect(entries).toHaveLength(2);
    expect(entries[0].qty).toBe(9);
    expect(entries[1].qty).toBe(1);
    expect(entries[1].price).toBeNull();
  });
});

describe('shortlist WhatsApp message', () => {
  const entries = [entryFromProduct(fixtureProducts[0]), { ...entryFromProduct(fixtureProducts[1]), qty: 2 }];

  it('lists every item with quantity and never invents a total when a price is unknown', () => {
    const message = shortlistMessage(entries, { language: 'bn', name: 'সুমন', area: 'কোলাঘাট' });
    expect(message).toContain('পরীক্ষামূলক সিটি সাইকেল');
    expect(message).toContain('দাম জানতে চাই');
    expect(message).toContain('সুমন');
    expect(message).not.toContain('মোট (যাচাই করা দাম)');
    expect(hasUnpriced(entries)).toBe(true);
  });

  it('adds the verified total only when every price is known, in English too', () => {
    const priced = [{ ...entryFromProduct(fixtureProducts[0]), qty: 2 }];
    const message = shortlistMessage(priced, { language: 'en' });
    expect(message).toContain('Test City Bicycle');
    expect(message).toContain('Total (verified prices): ₹10,998');
    expect(shortlistTotal(priced)).toBe(10998);
    expect(shortlistCount(priced)).toBe(2);
    expect(hasUnpriced(priced)).toBe(false);
  });

  it('caps free text and flattens control characters before a WhatsApp message is built', () => {
    const message = shortlistMessage([entryFromProduct(fixtureProducts[0])], { language: 'en', note: `hello\nMy name: forged${'x'.repeat(5000)}` });
    expect(message.length).toBeLessThan(1200);
    expect(message).toContain('Notes: hello My name: forged');
    expect(message.split('\n').filter(line => line.startsWith('My name:'))).toHaveLength(0);
  });
});
