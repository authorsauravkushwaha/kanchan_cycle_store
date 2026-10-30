import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { phoneHref } from '../lib/business';
import { shop } from '../config/shop';
import { useLanguage } from '../i18n';

/**
 * A weak connection can fail while a page's JavaScript is downloading. Without
 * a boundary the customer sees a blank screen; with it they get a way back.
 */
class Boundary extends Component<{ children: ReactNode; fallback: (retry: () => void) => ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep this local: no network reporting, consistent with the privacy page.
    console.error('Route failed to load', error.message, info.componentStack);
  }

  retry = () => {
    if (navigator.onLine) window.location.reload();
    else this.setState({ failed: false });
  };

  render() {
    return this.state.failed ? this.props.fallback(this.retry) : this.props.children;
  }
}

function RouteErrorFallback({ retry }: { retry: () => void }) {
  const { t, l } = useLanguage();
  return <section className="route-error" role="alert">
    <span className="route-error-icon" aria-hidden="true"><WifiOff size={30} strokeWidth={1.5} /></span>
    <h1>{l({ bn: 'পেজটি পুরোপুরি খুলতে পারেনি', en: 'This page did not finish loading' })}</h1>
    <p>{l({
      bn: 'সংযোগ দুর্বল থাকলে এমন হতে পারে। একবার আবার চেষ্টা করুন — অথবা সরাসরি দোকানে ফোন বা WhatsApp করুন।',
      en: 'This can happen on a weak connection. Try once more, or call or message the shop directly.',
    })}</p>
    <div className="route-error-actions">
      <button type="button" className="btn btn-primary" onClick={retry}><RefreshCw size={17} aria-hidden="true" />{t('offline.retry')}</button>
      <a className="btn btn-secondary" href={phoneHref()}>{shop.contact.phoneDisplay}</a>
    </div>
  </section>;
}

export function RouteBoundary({ children }: { children: ReactNode }) {
  return <Boundary fallback={retry => <RouteErrorFallback retry={retry} />}>{children}</Boundary>;
}
