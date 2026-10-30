import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../src/i18n';
import { ShortlistProvider } from '../src/shortlist';
import { ProductCard } from '../src/components/ProductCard';
import { fixtureProducts } from './fixtures';
describe('honest product cards', () => {
  it('shows contact-for-price and contact-for-stock, never zero or in-stock', () => {
    render(<MemoryRouter><LanguageProvider><ShortlistProvider><ProductCard product={fixtureProducts[1]} /></ShortlistProvider></LanguageProvider></MemoryRouter>);
    expect(screen.getByText('দাম জানতে যোগাযোগ করুন')).toBeInTheDocument();
    expect(screen.getByText('স্টক জানতে যোগাযোগ করুন')).toBeInTheDocument();
    expect(screen.queryByText('স্টক আছে')).not.toBeInTheDocument();
    const enquiry = screen.getByRole('link', { name: /দাম ও স্টক জানতে চাই/ });
    const href = new URL(enquiry.getAttribute('href')!);
    expect(href.pathname).toBe('/917076884950');
    expect(href.searchParams.get('text')).toContain(fixtureProducts[1].nameBn);
    expect(href.searchParams.get('text')).toContain('/cycles/test-kids');
    expect(enquiry).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it('formats verified Indian prices and keeps unverified stock explicit', () => {
    render(<MemoryRouter><LanguageProvider><ShortlistProvider><ProductCard product={fixtureProducts[0]} /></ShortlistProvider></LanguageProvider></MemoryRouter>);
    const expected = new Intl.NumberFormat('bn-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(5499);
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.getByText('স্টক জানতে যোগাযোগ করুন')).toBeInTheDocument();
  });
});
