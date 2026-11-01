import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../src/i18n';
import { ShortlistProvider } from '../src/shortlist';
import { ProductCard } from '../src/components/ProductCard';
import { fixtureProducts } from './fixtures';
describe('honest product cards', () => {
  it('shows contact-for-price, never a zero price or a made-up stock status', () => {
    render(<MemoryRouter><LanguageProvider><ShortlistProvider><ProductCard product={fixtureProducts[1]} /></ShortlistProvider></LanguageProvider></MemoryRouter>);
    expect(screen.getByText('দাম জানতে যোগাযোগ করুন')).toBeInTheDocument();
    expect(screen.queryByText('স্টক আছে')).not.toBeInTheDocument();
    expect(screen.queryByText('এখন স্টকে নেই')).not.toBeInTheDocument();
    // The stock line is only repeated when the shop confirmed a status, so the
    // catalogue does not look empty. The enquiry button asks for both.
    expect(screen.queryByText('স্টক জানতে যোগাযোগ করুন')).not.toBeInTheDocument();
    const enquiry = screen.getByRole('link', { name: /দাম ও স্টক জানতে চাই/ });
    const href = new URL(enquiry.getAttribute('href')!);
    expect(href.pathname).toBe('/917076884950');
    expect(href.searchParams.get('text')).toContain(fixtureProducts[1].nameBn);
    expect(href.searchParams.get('text')).toContain('/cycles/test-kids');
    expect(enquiry).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('formats verified Indian prices and states a confirmed stock status', () => {
    render(<MemoryRouter><LanguageProvider><ShortlistProvider><ProductCard product={fixtureProducts[0]} /></ShortlistProvider></LanguageProvider></MemoryRouter>);
    const expected = new Intl.NumberFormat('bn-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(5499);
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.queryByText('স্টক জানতে যোগাযোগ করুন')).not.toBeInTheDocument();
  });
  it('shows the confirmed out-of-stock status instead of hiding the cycle', () => {
    render(<MemoryRouter><LanguageProvider><ShortlistProvider><ProductCard product={fixtureProducts[2]} /></ShortlistProvider></LanguageProvider></MemoryRouter>);
    expect(screen.getByText('এখন স্টকে নেই')).toBeInTheDocument();
  });
});
