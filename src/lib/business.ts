import { shop } from '../config/shop';

export const whatsappHref = (message: string): string | null => {
  const number = shop.contact.whatsapp.replace(/\D/g, '');
  if (!/^[1-9]\d{9,14}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
export const phoneHref = () => `tel:${shop.contact.phone}`;
export const productUrl = (slug: string) => {
  const base = shop.websiteUrl || `${window.location.origin}${import.meta.env.BASE_URL}`;
  return `${base.replace(/\/+$/, '')}/cycles/${encodeURIComponent(slug)}`;
};

export type AnalyticsEvent = 'whatsapp_click' | 'phone_click' | 'directions_click' | 'product_enquiry_click' | 'repair_enquiry_submit' | 'quiz_complete' | 'source_shared' | 'shortlist_add' | 'shortlist_share' | 'install_prompt';
/** No analytics requests by default. Consent is explicit; enquiry content is never sent. */
export function track(event: AnalyticsEvent, context?: { productId?: string; serviceId?: string; placement?: string }) {
  if (!shop.analytics.endpoint) return;
  try {
    if (localStorage.getItem('kanchan-analytics-consent') !== 'granted') return;
    const endpoint = new URL(shop.analytics.endpoint);
    if (endpoint.protocol !== 'https:') return;
    const payload = JSON.stringify({ event, ...context, path: window.location.pathname });
    navigator.sendBeacon(endpoint.href, new Blob([payload], { type: 'application/json' }));
  } catch { /* Analytics must never interfere with an enquiry. */ }
}
export function analyticsConsent(value: 'granted' | 'denied') {
  try { localStorage.setItem('kanchan-analytics-consent', value); } catch { /* Storage is optional. */ }
}
