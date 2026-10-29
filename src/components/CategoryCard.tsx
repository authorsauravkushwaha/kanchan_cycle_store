import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../config/shop';
import type { CategoryId } from '../config/shop';
import { useLanguage } from '../i18n';
import { Photo } from './UI';

export function CategoryCard({ id, index }: { id: CategoryId; index: number }) {
  const { t, l, number } = useLanguage();
  const category = shop.categories.find(c => c.id === id)!;
  const to = id === 'accessories' ? '/accessories' : `/cycles?category=${id}`;
  return <Link to={to} className="category-card">
    <Photo image={category.image} sizes="(max-width: 600px) 44vw, (max-width: 1000px) 30vw, 200px" className="category-photo"><span className="category-number" aria-hidden="true">{number(index + 1)}</span></Photo>
    <div className="category-card-body"><h3>{l(category.name)}</h3><p>{l(category.subtitle)}</p><span className="category-link">{category.availabilityConfirmed ? t('category.available') : t('category.ask')}<ArrowUpRight size={15} aria-hidden="true" /></span></div>
  </Link>;
}
