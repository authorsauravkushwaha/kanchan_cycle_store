import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from './config/shop';
import { cacheIsFresh, fetchLiveCatalog, initialCatalog, inventoryConfigured, mergeCatalog } from './lib/inventory';

interface CatalogValue {
  products: Product[];
  cycles: Product[];
  accessories: Product[];
  /** True only while a live request is in flight. The UI never blocks on it. */
  loading: boolean;
  /** A cached catalogue is being shown because the network is unavailable. */
  stale: boolean;
  configured: boolean;
  refresh: () => void;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const initial = useRef(initialCatalog());
  const [products, setProducts] = useState<Product[]>(initial.current.products);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(initial.current.source === 'cache');
  const abort = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!inventoryConfigured) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    try {
      const live = await fetchLiveCatalog(controller.signal);
      if (controller.signal.aborted) return;
      if (live) {
        setProducts(mergeCatalog(live));
        setStale(false);
      }
    } catch {
      if (!controller.signal.aborted) setStale(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!inventoryConfigured) return;
    const cached = initial.current.source === 'cache';
    if (!cached || !cacheIsFresh(initial.current)) void refresh();
    const onOnline = () => void refresh();
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
      abort.current?.abort();
    };
  }, [refresh]);

  const value = useMemo<CatalogValue>(() => ({
    products,
    cycles: products.filter(product => product.kind === 'cycle'),
    accessories: products.filter(product => product.kind === 'accessory'),
    loading, stale, configured: inventoryConfigured, refresh: () => void refresh(),
  }), [products, loading, stale, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider');
  return value;
}
