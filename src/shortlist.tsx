import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  // The updater passed to setState runs later, so its result could never be
  // reported back to the customer. Keep a synchronous copy to answer "was it
  // added, is it a duplicate, or is the list already full?" immediately.
  const entriesRef = useRef<ShortlistEntry[]>(entries);
  const commit = useCallback((next: ShortlistEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  useEffect(() => {
    try {
      if (entries.length) localStorage.setItem(SHORTLIST_KEY, JSON.stringify(entries));
      else localStorage.removeItem(SHORTLIST_KEY);
    } catch { /* Private browsing: the list still works for this visit. */ }
  }, [entries]);

  const add = useCallback((product: Product): 'added' | 'exists' | 'full' => {
    const current = entriesRef.current;
    if (current.some(entry => entry.id === product.id)) return 'exists';
    if (current.length >= SHORTLIST_LIMIT) return 'full';
    commit([...current, entryFromProduct(product)]);
    return 'added';
  }, [commit]);

  const remove = useCallback((id: string) => commit(entriesRef.current.filter(entry => entry.id !== id)), [commit]);
  const setQty = useCallback((id: string, qty: number) => commit(entriesRef.current.map(entry =>
    entry.id === id ? { ...entry, qty: Math.min(9, Math.max(1, Math.round(qty))) } : entry)), [commit]);
  const clear = useCallback(() => commit([]), [commit]);

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
