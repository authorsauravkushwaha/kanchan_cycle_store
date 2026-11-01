import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { asset, shop } from '../config/shop';
import type { Product } from '../config/shop';
import { useLanguage } from '../i18n';
import type { TranslationKey } from '../i18n';

export function SEO({ title, description, descriptionText, product, noindex = false }: { title: string; description: TranslationKey; descriptionText?: string; product?: Product; noindex?: boolean }) {
  const { t, l, language, productName } = useLanguage();
  const { pathname } = useLocation();
  useEffect(() => {
    // Local search needs the town in the title: "সাইকেল | কাঞ্চন সাইকেল স্টোর্স |
    // কোলাঘাট" is what a Kolaghat customer typed into Google.
    const locality = l(shop.address.locality);
    const pageTitle = title.includes(locality) ? `${title} | ${l(shop.name)}` : `${title} | ${l(shop.name)} | ${locality}`;
    document.title = pageTitle;
    const meta = (key: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element); }
      element.content = content;
    };
    const summary = descriptionText?.trim() || t(description);
    meta('description', summary);
    meta('robots', !shop.seo.indexingEnabled || noindex ? 'noindex, follow' : 'index, follow');
    meta('og:title', pageTitle, true); meta('og:description', summary, true);
    meta('og:locale', language === 'bn' ? 'bn_IN' : 'en_IN', true);
    meta('og:type', 'website', true);
    const origin = shop.websiteUrl?.replace(/\/+$/, '');
    const canonicalUrl = origin ? `${origin}${pathname}` : null;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
      canonical.href = canonicalUrl;
      meta('og:url', canonicalUrl, true);
    } else { canonical?.remove(); }
    // The shared picture is always the shop's own photograph of its premises,
    // and it is shared even on a preview domain so a WhatsApp forward still
    // shows the shop instead of a blank card.
    const imageBase = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://example.invalid');
    const imageUrl = new URL(asset(shop.heroPhoto.src), `${imageBase}/`).href;
    meta('og:image', imageUrl, true);
    meta('og:image:alt', l(shop.heroPhoto.alt), true);
    meta('og:image:width', String(shop.heroPhoto.width), true);
    meta('og:image:height', String(shop.heroPhoto.height), true);
    meta('twitter:card', 'summary_large_image');
    meta('twitter:title', pageTitle);
    meta('twitter:description', summary);
    meta('twitter:image', imageUrl);
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org', '@type': 'Store',
      name: shop.name.en, alternateName: shop.name.bn,
      geo: { '@type': 'GeoCoordinates', ...shop.coordinates },
      hasMap: shop.directionsUrl,
      image: imageUrl,
    };
    if (shop.address.confirmed) data.address = { '@type': 'PostalAddress', streetAddress: shop.address.street.en, addressLocality: shop.address.locality.en, addressRegion: shop.address.region.en, postalCode: shop.address.postalCode, addressCountry: shop.address.countryCode };
    if (shop.contact.phone) data.telephone = shop.contact.phone;
    if (origin) data.url = origin;
    if (shop.hours.confirmed) data.openingHoursSpecification = [{ '@type': 'OpeningHoursSpecification', dayOfWeek: shop.hours.days.map(day => `https://schema.org/${day}`), opens: shop.hours.opens, closes: shop.hours.closes }];
    if (shop.socialLinks.length) data.sameAs = shop.socialLinks.map(link => link.url);
    const graph: Record<string, unknown>[] = [data];
    if (product) {
      const item: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Product', name: productName(product), description: language === 'bn' ? product.descriptionBn : product.descriptionEn };
      if (product.brand) item.brand = { '@type': 'Brand', name: product.brand };
      if (origin) item.url = `${origin}/cycles/${encodeURIComponent(product.slug)}`;
      if (product.price !== null && product.availability !== null) item.offers = { '@type': 'Offer', price: product.price, priceCurrency: 'INR', availability: `https://schema.org/${product.availability === 'in-stock' ? 'InStock' : 'OutOfStock'}`, ...(origin ? { url: `${origin}/cycles/${product.slug}` } : {}) };
      graph.push(item);
    }
    let script = document.getElementById('business-structured-data') as HTMLScriptElement | null;
    if (!script) { script = document.createElement('script'); script.id = 'business-structured-data'; script.type = 'application/ld+json'; document.head.append(script); }
    script.textContent = JSON.stringify(graph);
  }, [title, description, product, noindex, pathname, language, t, l, productName]);
  return null;
}
