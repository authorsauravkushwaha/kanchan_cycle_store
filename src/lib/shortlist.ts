import type { Language, Product } from '../config/shop';

/**
 * A shortlist is the local "shop with me" list that a customer builds while
 * browsing on a phone. It never leaves the device until the customer chooses
 * to send it on WhatsApp. No account, no server, no tracking.
 */
export interface ShortlistEntry {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  kind: Product['kind'];
  price: number | null;
  qty: number;
}

export const SHORTLIST_KEY = 'kanchan-shortlist-v1';
export const SHORTLIST_LIMIT = 20;
const MAX_QTY = 9;
// 20 bounded product rows fit well below this; refuse oversized local data before JSON.parse.
const MAX_SHORTLIST_STORAGE_LENGTH = 32 * 1024;

export const entryFromProduct = (product: Product): ShortlistEntry => ({
  id: product.id,
  slug: product.slug,
  nameBn: product.nameBn,
  nameEn: product.nameEn,
  kind: product.kind,
  price: product.price,
  qty: 1,
});

/** Tolerant reader: a corrupted or older stored list must never break a page. */
export function parseShortlist(raw: string | null): ShortlistEntry[] {
  if (!raw || raw.length > MAX_SHORTLIST_STORAGE_LENGTH) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > SHORTLIST_LIMIT) return [];
    const seen = new Set<string>();
    return parsed.flatMap(item => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || !row.id || seen.has(row.id)) return [];
      if (typeof row.slug !== 'string' || !row.slug) return [];
      if (typeof row.nameBn !== 'string' || typeof row.nameEn !== 'string') return [];
      const qty = Math.min(MAX_QTY, Math.max(1, Math.round(Number(row.qty) || 1)));
      const price = typeof row.price === 'number' && Number.isFinite(row.price) && row.price >= 0 ? row.price : null;
      seen.add(row.id);
      return [{
        id: row.id.slice(0, 120),
        slug: row.slug.slice(0, 120),
        nameBn: row.nameBn.slice(0, 160),
        nameEn: row.nameEn.slice(0, 160),
        kind: 'cycle' as const,
        price,
        qty,
      }];
    }).slice(0, SHORTLIST_LIMIT);
  } catch { return []; }
}

const DIGITS = '০১২৩৪৫৬৭৮৯';
const localNumber = (value: number, language: Language) =>
  new Intl.NumberFormat(language === 'bn' ? 'bn-IN' : 'en-IN', { maximumFractionDigits: 0 }).format(value);
const localDigits = (value: string, language: Language) =>
  language === 'bn' ? value.replace(/\d/g, digit => DIGITS[+digit]) : value;
const safeMessageField = (value: unknown, max: number): string => typeof value === 'string'
  ? value.slice(0, max * 4).replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
  : '';

export interface ShortlistMessageOptions {
  language: Language;
  name?: string;
  area?: string;
  note?: string;
  /** Only supplied when the real production URL is configured. */
  siteUrl?: string | null;
}

/**
 * Builds the single WhatsApp message the shop receives. It is deliberately
 * plain text: it survives WhatsApp Web, forwarded messages and the shop's own
 * copy-and-paste habits.
 */
export function shortlistMessage(entries: ShortlistEntry[], options: ShortlistMessageOptions): string {
  const { language, siteUrl = null } = options;
  const name = safeMessageField(options.name, 80);
  const area = safeMessageField(options.area, 80);
  const note = safeMessageField(options.note, 300);
  const bn = language === 'bn';
  const lines: string[] = [
    bn ? 'নমস্কার, কাঞ্চন সাইকেল স্টোর্স। আমার পছন্দের তালিকা পাঠাচ্ছি:' : 'Hello Kanchan Cycle Stores. Here is my shortlist:',
    '',
  ];
  entries.forEach((entry, index) => {
    const productName = bn ? entry.nameBn : entry.nameEn;
    const price = entry.price === null
      ? (bn ? 'দাম জানতে চাই' : 'price to confirm')
      : `${bn ? '₹' : '₹'}${localNumber(entry.price, language)}`;
    const qty = localDigits(String(entry.qty), language);
    lines.push(`${localDigits(String(index + 1), language)}. ${productName} — ${price} × ${qty}`);
  });
  const priced = entries.filter(entry => entry.price !== null);
  const pending = priced.length !== entries.length;
  const total = priced.reduce((sum, entry) => sum + (entry.price || 0) * entry.qty, 0);
  lines.push('');
  if (!pending) lines.push(`${bn ? 'মোট (যাচাই করা দাম)' : 'Total (verified prices)'}: ₹${localNumber(total, language)}`);
  else lines.push(bn ? 'কিছু জিনিসের দাম দোকান থেকে নিশ্চিত করে জানাবেন।' : 'Please confirm the prices of the items marked above.');
  if (name.trim()) lines.push(`${bn ? 'আমার নাম' : 'My name'}: ${name.trim().slice(0, 80)}`);
  if (area.trim()) lines.push(`${bn ? 'এলাকা' : 'Area'}: ${area.trim().slice(0, 80)}`);
  if (note.trim()) lines.push(`${bn ? 'বিশেষ কথা' : 'Notes'}: ${note.trim().slice(0, 300)}`);
  lines.push('');
  lines.push(bn ? 'স্টক ও দাম দোকান থেকে নিশ্চিত করে জানাবেন। ধন্যবাদ।' : 'Please confirm stock and price. Thank you.');
  if (siteUrl) lines.push('', siteUrl);
  return lines.join('\n');
}

export const shortlistTotal = (entries: ShortlistEntry[]) => entries.reduce((sum, entry) => sum + (entry.price || 0) * entry.qty, 0);
export const shortlistCount = (entries: ShortlistEntry[]) => entries.reduce((sum, entry) => sum + entry.qty, 0);
export const hasUnpriced = (entries: ShortlistEntry[]) => entries.some(entry => entry.price === null);
