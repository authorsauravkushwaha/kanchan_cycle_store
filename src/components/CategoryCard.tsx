import { ArrowUpRight, Baby, Bike, Cog, Crown, GraduationCap, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shop } from '../config/shop';
import type { CategoryId } from '../config/shop';
import { useLanguage } from '../i18n';

const categoryIcons: Record<CategoryId, LucideIcon> = {
  kids: Baby, student: GraduationCap, city: Bike, geared: Cog, premium: Crown, electric: Zap,
};
/** Text-only category card: an icon, a number, the category name and a prompt. */
export function CategoryCard({ id, index }: { id: CategoryId; index: number }) {
  const { t, l, number } = useLanguage();
  const category = shop.categories.find(c => c.id === id)!;
  const Icon = categoryIcons[id];
  const to = `/cycles?category=${id}`;
  return <Link to={to} className="category-card">
    <span className="category-icon" aria-hidden="true"><Icon size={24} strokeWidth={1.5} /></span>
    <span className="category-number" aria-hidden="true">{number(index + 1)}</span>
    <span className="category-card-body">
      <h3>{l(category.name)}</h3>
      <p>{l(category.subtitle)}</p>
      <span className="category-link">{category.availabilityConfirmed ? t('category.available') : t('category.ask')}<ArrowUpRight size={15} aria-hidden="true" /></span>
    </span>
  </Link>;
}
