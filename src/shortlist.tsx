import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from './config/shop';
import { SHORTLIST_KEY, SHORTLIST_LIMIT, entryFromProduct, parseShortlist, shortlistCount } from './lib/shortlist';
import type { ShortlistEntry } from './lib/shortlist';

interface ShortlistValue {
  entries: ShortlistEntry[];
  count: number;
  has: (id: string) => boolean;
  add: (product: Product) => 'added' | 'exists' | 'full';
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const ShortlistContext = createContext<ShortlistValue | null>(null);

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ShortlistEntry[]>(() => {
    try { return parseShortlist(localStorage.getItem(SHORTLIST_KEY)); } catch { return []; }
  });

  useEffect(() => {
    try {
      if (entries.length) localStorage.setItem(SHORTLIST_KEY, JSON.stringify(entries));
      else localStorage.removeItem(SHORTLIST_KEY);
    } catch { /* Private browsing: the list still works for this visit. */ }
  }, [entries]);

  const add = useCallback((product: Product): 'added' | 'exists' | 'full' => {
    let result: 'added' | 'exists' | 'full' = 'added';
    setEntries(current => {
      if (current.some(entry => entry.id === product.id)) { result = 'exists'; return current; }
      if (current.length >= SHORTLIST_LIMIT) { result = 'full'; return current; }
      return [...current, entryFromProduct(product)];
    });
    return result;
  }, []);

  const remove = useCallback((id: string) => setEntries(current => current.filter(entry => entry.id !== id)), []);
  const setQty = useCallback((id: string, qty: number) => setEntries(current => current.map(entry =>
    entry.id === id ? { ...entry, qty: Math.min(9, Math.max(1, Math.round(qty))) } : entry)), []);
  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo<ShortlistValue>(() => ({
    entries,
    count: shortlistCount(entries),
    has: id => entries.some(entry => entry.id === id),
    add, remove, setQty, clear,
  }), [entries, add, remove, setQty, clear]);

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const value = useContext(ShortlistContext);
  if (!value) throw new Error('useShortlist must be used inside ShortlistProvider');
  return value;
}
