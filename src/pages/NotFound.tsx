import { Link } from 'react-router-dom';
import { ArrowLeft, Bike, MapPinOff } from 'lucide-react';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
export default function NotFound({ productMissing = false }: { productMissing?: boolean }) {
  const { t } = useLanguage();
  return <><SEO title={productMissing ? t('product.notFound') : '404'} description="seo.notFoundDescription" noindex /><section className="not-found container"><div className="not-found-art" aria-hidden="true"><Bike size={100} strokeWidth={1} /><MapPinOff size={35} strokeWidth={1.4} /></div><p className="eyebrow">404</p><h1>{productMissing ? t('product.notFound') : t('notFound.title')}</h1><p>{t('notFound.text')}</p><div className="empty-actions"><Link className="btn btn-primary" to="/"><ArrowLeft size={18} aria-hidden="true" />{t('notFound.home')}</Link><Link className="btn btn-secondary" to={productMissing ? '/cycles' : '/contact'}>{productMissing ? t('nav.cycles') : t('nav.contact')}</Link></div></section></>;
}
