import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUp, ArrowUpRight, Bike, Clock3, MapPin, Menu, Phone, X } from 'lucide-react';
import { addressLines, shop } from '../config/shop';
import { useLanguage } from '../i18n';
import type { TranslationKey } from '../i18n';
import { phoneHref, track } from '../lib/business';
import { CallButton, DirectionsButton, Logo, WhatsAppButton } from './UI';

export const navigation: { to: string; key: TranslationKey }[] = [
  { to: '/', key: 'nav.home' }, { to: '/cycles', key: 'nav.cycles' },
  { to: '/accessories', key: 'nav.accessories' }, { to: '/services', key: 'nav.services' },
  { to: '/offers', key: 'nav.offers' }, { to: '/about', key: 'nav.about' }, { to: '/contact', key: 'nav.contact' },
];
function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return <div className="language-switcher" role="group" aria-label={t('nav.language')}>
    <button type="button" lang="bn" aria-pressed={language === 'bn'} onClick={() => setLanguage('bn')}>বাংলা</button>
    <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
  </div>;
}
function MobileNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t, l } = useLanguage();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }
  }, [open]);
  return <dialog ref={ref} id="mobile-navigation" className="mobile-drawer" aria-label={t('nav.menu')} onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="drawer-inner">
      <div className="drawer-top"><span className="drawer-label"><Bike size={23} aria-hidden="true" />{l(shop.name)}</span><button className="icon-button" onClick={onClose} aria-label={t('nav.close')} autoFocus><X size={23} /></button></div>
      <nav aria-label={t('nav.primary')} className="drawer-links">{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose}>{t(item.key)}<ArrowUpRight size={18} aria-hidden="true" /></NavLink>)}</nav>
      <div className="drawer-bottom"><LanguageSwitcher /><WhatsAppButton className="w-full" /><DirectionsButton variant="text" /><a href={phoneHref()} className="drawer-phone" onClick={() => track('phone_click')}><Phone size={16} aria-hidden="true" />{shop.contact.phoneDisplay}</a><p>{shop.hours.confirmed ? l(shop.hours.display) : t('common.hoursPending')}</p></div>
    </div>
  </dialog>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const { t, l } = useLanguage();
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  return <>
    <a className="skip-link" href="#main-content">{t('nav.skip')}</a>
    {shop.announcement.enabled && <div className="announcement"><Link to="/cycles" className="container"><Bike size={14} aria-hidden="true" /><span>{l(shop.announcement.text)}</span><ArrowRight size={13} aria-hidden="true" /></Link></div>}
    <header className="site-header"><div className="container header-inner">
      <Logo />
      <nav className="desktop-nav" aria-label={t('nav.primary')}>{navigation.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'}>{t(item.key)}</NavLink>)}</nav>
      <div className="header-actions"><LanguageSwitcher /><WhatsAppButton variant="small" className="header-whatsapp" placement="header"><span className="header-whatsapp-label">{t('action.whatsappShort')}</span></WhatsAppButton><button className="icon-button mobile-menu-button" aria-label={t('nav.open')} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu size={23} /></button></div>
    </div></header>
    <MobileNavigation open={open} onClose={() => setOpen(false)} />
  </>;
}
function MobileActionBar() {
  const { t } = useLanguage();
  return <nav className="mobile-action-bar" aria-label={t('footer.contact')}>
    <WhatsAppButton variant="text" placement="mobile-action-bar"><span>{t('action.whatsappShort')}</span></WhatsAppButton>
    <CallButton variant="text" short />
    <DirectionsButton variant="text" short />
  </nav>;
}
function Footer() {
  const { t, l, language } = useLanguage();
  return <footer className="site-footer"><div className="container">
    <div className="footer-grid">
      <div className="footer-brand"><Logo light /><p>{t('footer.description')}</p><span className="footer-tagline"><Bike size={19} aria-hidden="true" />{l(shop.tagline)}</span></div>
      <div><h2>{t('footer.explore')}</h2><nav aria-label={t('footer.explore')}>{navigation.filter(item => item.to !== '/').map(item => <Link key={item.to} to={item.to}>{t(item.key)}</Link>)}<Link to="/recommendation">{t('nav.quiz')}</Link></nav></div>
      <div className="footer-contact"><h2>{t('footer.contact')}</h2><a href={phoneHref()} onClick={() => track('phone_click')}><Phone size={16} aria-hidden="true" />{shop.contact.phoneDisplay}</a><p><MapPin size={17} aria-hidden="true" /><span>{addressLines(language).join(', ')}</span></p><DirectionsButton variant="text" short />{shop.contact.email && <a href={`mailto:${shop.contact.email}`}>{shop.contact.email}</a>}</div>
      <div className="footer-hours"><h2>{t('common.hours')}</h2><p className={shop.hours.confirmed ? 'verified-hours' : 'unconfirmed-hours'}><Clock3 size={17} aria-hidden="true" />{l(shop.hours.display)}</p>{!shop.hours.confirmed && <p className="hours-caveat">{l(shop.hours.caveat)}</p>}<p className="footer-hours-note">{t('common.hoursPending')}</p><WhatsAppButton variant="text" placement="footer">{t('action.whatsappShort')}<ArrowUpRight size={15} aria-hidden="true" /></WhatsAppButton>{shop.socialLinks.length > 0 && <div className="footer-socials">{shop.socialLinks.filter(link => /^https:\/\//.test(link.url)).map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>}</div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {l(shop.name)}. {t('footer.rights')}</p><div><Link to="/privacy">{t('footer.privacy')}</Link><Link to="/about#our-shop">{t('footer.photoNote')}</Link><button onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })} className="back-top" aria-label={t('footer.backTop')}><ArrowUp size={17} /></button></div></div>
  </div></footer>;
}
export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      } else window.scrollTo({ top: 0, behavior: 'instant' });
      if (!firstRender.current && !location.hash) document.getElementById('main-content')?.focus({ preventScroll: true });
      firstRender.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return <><Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer /><MobileActionBar /></>;
}
