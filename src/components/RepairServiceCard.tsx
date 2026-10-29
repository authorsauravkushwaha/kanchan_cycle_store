import { Check, CircleDashed, Cog, Disc3, Link2, RefreshCw, Wrench } from 'lucide-react';
import { shop } from '../config/shop';
import type { Service } from '../config/shop';
import { useLanguage } from '../i18n';
import { WhatsAppButton } from './UI';
const icons = { puncture: CircleDashed, brakes: Disc3, chain: Link2, general: Wrench, gears: Cog, tyres: RefreshCw };
export function RepairServiceCard({ service, detailed = false }: { service: Service; detailed?: boolean }) {
  const { t, l, price, language } = useLanguage();
  const Icon = icons[service.id as keyof typeof icons] || Wrench;
  const message = language === 'bn' ? `নমস্কার, কাঞ্চন সাইকেল স্টোর্সে ${l(service.name)} পরিষেবা কি পাওয়া যাচ্ছে? খরচ ও বিস্তারিত জানাবেন?` : `Hello, is ${l(service.name)} available at Kanchan Cycle Stores? Could you tell me the cost and details?`;
  return <article className={`service-card ${detailed ? 'service-card-detailed' : ''}`}><div className="service-card-top"><span className="service-icon"><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span><h3>{l(service.name)}</h3>{service.confirmed && <span className="service-confirmed"><Check size={13} aria-hidden="true" />{l({ bn: 'যাচাই করা', en: 'Confirmed' })}</span>}</div>{detailed && <p className="service-description">{l(service.description)}</p>}<p className="service-price">{service.price !== null ? price(service.price) : t('common.priceUnconfirmed')}</p>{detailed && !service.confirmed && <p className="service-status">{t('common.serviceUnconfirmed')}</p>}<WhatsAppButton variant="text" className="service-enquiry" message={message} serviceId={service.id} placement="service-card">{t('action.repair')}<span className="sr-only"> — {l(service.name)}</span></WhatsAppButton></article>;
}
export function ServiceList({ detailed = false }: { detailed?: boolean }) { return <div className={detailed ? 'services-grid' : 'service-chips'}>{shop.services.map(service => <RepairServiceCard key={service.id} service={service} detailed={detailed} />)}</div>; }
