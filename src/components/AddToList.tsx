import { useEffect, useState } from 'react';
import { Check, Heart, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../config/shop';
import { useLanguage } from '../i18n';
import { track } from '../lib/business';
import { useShortlist } from '../shortlist';

/**
 * The single most useful sales control on the site for a phone visitor:
 * collect the cycles they like, then send them all to the shop at once.
 */
export function AddToList({ product, variant = 'secondary', className = '', short = false }: {
  product: Product; variant?: 'secondary' | 'text' | 'primary'; className?: string; short?: boolean;
}) {
  const { t, l } = useLanguage();
  const { add, has, remove } = useShortlist();
  const [notice, setNotice] = useState<string | null>(null);
  const saved = has(product.id);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (saved) {
    return <div className={`added-state ${className}`}>
      <button type="button" className="btn btn-secondary btn-compact added-button" aria-pressed="true" onClick={() => { remove(product.id); setNotice(t('list.removed')); }}>
        <Check size={16} aria-hidden="true" /><span>{short ? t('list.nav') : t('list.added')}</span>
      </button>
      <Link to="/list" className="added-link"><ListChecks size={15} aria-hidden="true" />{t('list.nav')}</Link>
      <span className="sr-only" role="status" aria-live="polite">{notice || ''}</span>
    </div>;
  }

  return <div className={`add-to-list ${className}`}>
    <button type="button" className={`btn btn-${variant === 'text' ? 'text' : variant} ${variant === 'text' ? '' : 'btn-compact'}`} onClick={() => {
      const result = add(product);
      setNotice(result === 'added' ? t('list.added') : result === 'exists' ? t('list.added') : l({ bn: 'তালিকা ভর্তি হয়েছে (২০টি)', en: 'Your list is full (20 items)' }));
      if (result === 'added') track('shortlist_add', { productId: product.id, placement: 'product' });
    }}>
      <Heart size={16} aria-hidden="true" /><span>{short ? t('list.add') : t('list.add')}</span>
    </button>
    <span className="sr-only" role="status" aria-live="polite">{notice || ''}</span>
  </div>;
}
