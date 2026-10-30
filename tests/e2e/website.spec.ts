import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fixtureProducts } from '../fixtures';

async function useTestCatalog(page: Page) {
  await page.route('**/src/config/shop.ts*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    const body = source.replace('catalog: [],', `catalog: ${JSON.stringify(fixtureProducts)},`);
    if (body === source) throw new Error('Test catalog injection point was not found.');
    await route.fulfill({ response, body });
  });
}
const text = async (href: string | null | Promise<string | null>) => new URL((await href)!).searchParams.get('text') || '';

test('Bengali is the default; English and reload persistence work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('h1')).toContainText('আপনার যাত্রা শুরু হোক সঠিক সাইকেলে');
  await page.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('Every Journey Begins With the Right Bicycle.');
  await expect(page.locator('.desktop-nav')).toContainText('Repair & service');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('Every Journey Begins With the Right Bicycle.');
});

test('all public routes, unique titles, footer links and 404 work', async ({ page }) => {
  const routes = [['/', 'আপনার যাত্রা শুরু হোক সঠিক সাইকেলে'], ['/cycles', 'পছন্দের সাইকেল'], ['/accessories', 'সাইকেলের অ্যাক্সেসরিজ'], ['/services', 'সাইকেলের সমস্যার'], ['/recommendation', 'কোন সাইকেলটি'], ['/offers', 'সঠিক পছন্দ'], ['/about', 'পরিচয় হোক'], ['/contact', 'কাছের দোকানেই'], ['/privacy', 'গোপনীয়তার নীতি'], ['/list', 'আমার পছন্দের তালিকা']];
  const titles = new Set<string>();
  for (const [path, heading] of routes) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText(heading);
    titles.add(await page.title());
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(titles.size).toBe(routes.length);
  await page.goto('/no-such-page');
  await expect(page.locator('h1')).toContainText('এই পথটা');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await page.getByRole('link', { name: 'হোমপেজে ফিরুন' }).click();
  await expect(page.locator('h1')).toContainText('আপনার যাত্রা শুরু হোক সঠিক সাইকেলে');
  await page.locator('.site-footer').getByRole('link', { name: 'গোপনীয়তার নীতি' }).click();
  await expect(page.locator('h1')).toHaveText('গোপনীয়তার নীতি');
});

test('category links, empty catalog, phone, directions and embedded map are correct', async ({ page }) => {
  await page.goto('/');
  for (const category of ['kids', 'student', 'city', 'geared', 'electric']) {
    await page.goto('/');
    await page.locator(`.category-card[href="/cycles?category=${category}"]`).click();
    await expect(page).toHaveURL(new RegExp(`category=${category}`));
    await expect(page.getByLabel('সাইকেলের ধরন', { exact: true })).toHaveValue(category);
    await expect(page.getByRole('heading', { name: 'পছন্দের সাইকেলটি দোকানে খুঁজুন' })).toBeVisible();
  }
  await page.goto('/cycles');
  await expect(page.locator('.empty-state')).toContainText('অনলাইন তালিকা এখনও প্রকাশ করা হয়নি');
  await page.goto('/contact');
  await expect(page.locator('.contact-phone')).toHaveAttribute('href', 'tel:+917076884950');
  const directions = page.locator('.contact-card a[href*="google.com/maps"]').first();
  await expect(directions).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=22.4452382%2C87.8751764');
  await expect(page.locator('.map-frame iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Google মানচিত্র লোড করুন' }).click();
  const map = page.locator('.map-frame iframe');
  await expect(map).toHaveAttribute('src', /22\.4452382,87\.8751764/);
  await expect(map).toHaveAttribute('title', /Google মানচিত্র/);
  // The supplied 9 AM–9 PM hours are shown, but explicitly marked unconfirmed.
  await expect(page.locator('.contact-hours')).toContainText('সকাল ৯টা');
  await expect(page.locator('.contact-hours')).toContainText('চূড়ান্ত নিশ্চিতকরণ সাপেক্ষে');
  const structured = JSON.parse((await page.locator('#business-structured-data').textContent())!);
  expect(structured[0]['@type']).toBe('Store');
  expect(structured[0].telephone).toBe('+917076884950');
  expect(structured[0].openingHoursSpecification).toBeUndefined();
  expect(structured[0].aggregateRating).toBeUndefined();
});

test('real catalog UI filters, searches, sorts and creates product enquiries', async ({ page }) => {
  await useTestCatalog(page);
  await page.goto('/cycles');
  await expect(page.locator('.product-card')).toHaveCount(3);
  await page.getByLabel('সাইকেল খুঁজুন', { exact: true }).fill('শিশুদের');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card')).toContainText('পরীক্ষামূলক শিশুদের সাইকেল');
  await expect(page.locator('.product-card')).toContainText('দাম জানতে যোগাযোগ করুন');
  await expect(page.locator('.product-card')).toContainText('স্টক জানতে যোগাযোগ করুন');
  await page.getByRole('button', { name: 'ফিল্টার মুছুন' }).click();
  await page.getByLabel('আপনার বাজেট', { exact: true }).selectOption('5000-10000');
  await expect(page).toHaveURL(/budget=5000-10000/);
  await expect(page).not.toHaveURL(/q=/);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card')).toContainText('সিটি');
  await page.getByRole('button', { name: 'ফিল্টার মুছুন' }).click();
  await page.getByLabel('গিয়ারের পছন্দ', { exact: true }).selectOption('non-geared');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'ফিল্টার মুছুন' }).click();
  await page.getByLabel('সাজিয়ে দেখুন', { exact: true }).selectOption('price-desc');
  await expect(page.locator('.product-card h3').last()).toContainText('শিশুদের');
  await page.getByLabel('সাজিয়ে দেখুন', { exact: true }).selectOption('price-asc');
  await expect(page.locator('.product-card h3').first()).toContainText('সিটি');
  const enquiry = page.locator('.product-card a[target="_blank"]').first();
  expect(await text(enquiry.getAttribute('href'))).toContain('পরীক্ষামূলক সিটি সাইকেল');
  expect(await text(enquiry.getAttribute('href'))).toContain('/cycles/test-city');
  await page.locator('.product-card h3 a').first().click();
  await expect(page.locator('h1')).toHaveText('পরীক্ষামূলক সিটি সাইকেল');
  await expect(page.locator('.stock-label')).toContainText('স্টক জানতে');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('পরীক্ষামূলক সিটি সাইকেল');
  await page.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Test City Bicycle');
  expect(await text(page.locator('.product-detail-enquiry a').getAttribute('href'))).toContain('Test City Bicycle');
  await page.goto('/cycles?category=student');
  await expect(page.getByRole('heading', { name: 'No matches this time' })).toBeVisible();
});

test('a phone visitor can save cycles to a list and send one WhatsApp enquiry', async ({ page }) => {
  await useTestCatalog(page);
  await page.goto('/cycles');
  const cards = page.locator('.product-card');
  await cards.nth(0).getByRole('button', { name: 'তালিকায় রাখুন' }).click();
  await expect(cards.nth(0).getByRole('button', { name: /তালিকায় যোগ হয়েছে/ })).toBeVisible();
  await cards.nth(1).getByRole('button', { name: 'তালিকায় রাখুন' }).click();
  await expect(page.locator('.site-header .list-badge')).toHaveText('2');
  await page.locator('.site-header a[href="/list"]').click();
  await expect(page).toHaveURL(/\/list$/);
  await expect(page.locator('.list-item')).toHaveCount(2);
  await expect(page.locator('.list-total')).toContainText('দোকান থেকে জানতে হবে');
  await page.getByLabel('আপনার নাম (ঐচ্ছিক)').fill('পরীক্ষা কুমার');
  const link = page.locator('.list-whatsapp');
  const message = await text(link.getAttribute('href'));
  expect(message).toContain('পরীক্ষামূলক সিটি সাইকেল');
  expect(message).toContain('পরীক্ষামূলক শিশুদের সাইকেল');
  expect(message).toContain('পরীক্ষা কুমার');
  expect(message).toContain('দাম জানতে চাই');
  await page.reload();
  await expect(page.locator('.list-item')).toHaveCount(2);
  // The list lives only on this phone; no personal data is written to storage.
  const stored = JSON.stringify(await page.evaluate(() => ({ ...localStorage })));
  expect(stored).not.toContain('পরীক্ষা কুমার');
  await page.getByRole('button', { name: 'তালিকা মুছুন' }).click();
  await expect(page.getByRole('heading', { name: 'তালিকা এখন খালি' })).toBeVisible();
});

test('repair form validates in Bengali and prepares a WhatsApp enquiry, not a booking', async ({ page }) => {
  await page.context().route('https://wa.me/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Test WhatsApp interception</title>' }));
  await page.goto('/services?service=brakes#repair-form');
  const form = page.locator('.repair-form');
  await form.getByRole('button', { name: 'বিবরণ WhatsApp-এ পাঠান' }).click();
  await expect(form.getByText('অনুগ্রহ করে আপনার নাম লিখুন', { exact: false })).toBeVisible();
  await expect(form.getByLabel(/আপনার নাম/)).toBeFocused();
  await form.getByLabel(/আপনার নাম/).fill('পরীক্ষা কুমার');
  await form.getByLabel(/যোগাযোগের নম্বর/).fill('7076884950');
  await form.getByLabel(/সাইকেলের ধরন/).selectOption('city');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  await form.getByLabel(/কবে আসতে চান/).fill(date);
  await form.getByLabel(/পছন্দের সময়/).fill('10:30');
  await form.getByLabel(/সমস্যার বিবরণ/).fill('ব্রেক থেকে শব্দ হচ্ছে।');
  await form.getByLabel(/আমাদের কথা কোথায় জেনেছেন/).selectOption('friend');
  const popupEvent = page.waitForEvent('popup');
  const requestEvent = page.context().waitForEvent('request', request => request.url().startsWith('https://wa.me/917076884950'));
  await form.getByRole('button', { name: 'বিবরণ WhatsApp-এ পাঠান' }).click();
  const popup = await popupEvent;
  const request = await requestEvent;
  const message = await text(request.url());
  expect(new URL(request.url()).pathname).toBe('/917076884950');
  for (const value of ['পরীক্ষা কুমার', '7076884950', 'ব্রেক অ্যাডজাস্টমেন্ট', date, '10:30', 'ব্রেক থেকে শব্দ হচ্ছে।', 'পরিচিত কারও কাছ থেকে', 'নিশ্চিত বুকিং নয়']) expect(message).toContain(value);
  await popup.close();
  await expect(page.getByRole('heading', { name: 'আপনার বার্তা তৈরি হয়েছে' })).toBeVisible();
  await expect(page.locator('.form-success')).toContainText('দোকান উত্তর না দেওয়া পর্যন্ত');
  const stored = await page.evaluate(() => ({ ...localStorage }));
  expect(JSON.stringify(stored)).not.toContain('পরীক্ষা কুমার');
  expect(JSON.stringify(stored)).not.toContain('7076884950');
});

test('quiz supports navigation, skipping height, safe empty results and sharing answers', async ({ page }) => {
  await page.goto('/recommendation');
  const quiz = page.locator('.quiz-card');
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await expect(quiz.getByRole('alert')).toContainText('কার জন্য');
  await quiz.getByRole('radio', { name: 'বাচ্চার জন্য' }).check();
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await quiz.getByLabel('আরোহীর বয়স কত?', { exact: true }).fill('8');
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await quiz.getByRole('button', { name: 'উচ্চতা জানি না' }).click();
  await quiz.getByRole('radio', { name: '₹৫,০০০-এর কম' }).check();
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await quiz.getByRole('radio', { name: 'স্কুল বা কলেজে' }).check();
  await quiz.getByRole('button', { name: 'আগের ধাপ' }).click();
  await expect(quiz.getByRole('radio', { name: '₹৫,০০০-এর কম' })).toBeChecked();
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await quiz.getByRole('button', { name: 'পরের ধাপ' }).click();
  await quiz.getByRole('radio', { name: 'গিয়ার ছাড়া', exact: true }).check();
  await quiz.getByRole('button', { name: 'ফলাফল দেখুন' }).click();
  await expect(page.getByRole('heading', { name: 'সঠিক তথ্য ছাড়া সাইকেল বাছছি না' })).toBeVisible();
  await expect(page.locator('.quiz-summary')).toContainText('উচ্চতা জানি না');
  await expect(page.locator('.quiz-result-actions a')).toBeVisible();
  const message = await text(page.locator('.quiz-result-actions a').getAttribute('href'));
  expect(message).toContain('বাচ্চার জন্য'); expect(message).toContain('স্কুল বা কলেজে'); expect(message).toContain('গিয়ার ছাড়া');
  await expect(page.locator('.quiz-results')).toContainText('শুধু বয়সের ভিত্তিতে');
  await page.getByRole('button', { name: 'আবার শুরু করুন' }).click();
  await expect(page.locator('.quiz-card h2')).toHaveText('সাইকেলটি কার জন্য?');
});

test('mobile drawer is keyboard accessible and bottom actions stay usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'নেভিগেশন মেনু খুলুন' });
  await menu.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'মেনু বন্ধ করুন' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.getByRole('dialog').getByRole('link', { name: 'যোগাযোগ', exact: true }).click();
  await expect(page.locator('h1')).toContainText('কাছের দোকানেই');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const bar = page.locator('.mobile-action-bar');
  await expect(bar).toBeVisible();
  await expect(bar.locator('a')).toHaveCount(4);
  await expect(bar.locator('a').nth(0)).toHaveAttribute('href', /wa\.me\/917076884950/);
  await expect(bar.locator('a').nth(1)).toHaveAttribute('href', 'tel:+917076884950');
  await expect(bar.locator('a').nth(2)).toHaveAttribute('href', /22\.4452382/);
  await expect(bar.locator('a').nth(3)).toHaveAttribute('href', '/list');
  // The install explanation is reachable without the browser's install prompt.
  await page.locator('.site-footer').getByRole('button', { name: 'অ্যাপ হিসেবে রাখুন' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('দোকানটি ফোনে অ্যাপের মতো রাখুন');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('English navigation and localized validation work across the site', async ({ page }) => {
  await page.goto('/');
  await page.locator('.site-header').getByRole('button', { name: 'EN', exact: true }).click();
  const routes = [['/', 'Every Journey Begins With the Right Bicycle.'], ['/cycles', 'Find your kind of bicycle'], ['/accessories', 'Bicycle accessories'], ['/services', 'Tell us what’s playing up'], ['/recommendation', 'What’s your kind of bicycle?'], ['/offers', 'The right choice comes first'], ['/about', 'A little about us'], ['/contact', 'Your local shop is a message away'], ['/privacy', 'Privacy policy']];
  for (const [path, heading] of routes) {
    await page.goto(path);
    await expect(page.locator('h1')).toContainText(heading);
    await expect(page.locator('.site-header')).not.toContainText('যোগাযোগ');
  }
  await page.goto('/services');
  await page.locator('.repair-form').getByRole('button', { name: 'Send details on WhatsApp' }).click();
  await expect(page.locator('.repair-form')).toContainText('Please enter your name');
  await page.goto('/cycles/missing-product');
  await expect(page.locator('h1')).toHaveText('This bicycle couldn’t be found');
});

test('small phones, tablets and desktops have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/cycles', '/list', '/services', '/recommendation', '/contact', '/about']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('primary pages pass automated WCAG A/AA checks on desktop and mobile', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/cycles', '/list', '/services', '/recommendation', '/contact']) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).exclude('iframe').analyze();
      expect(results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), `${path} at ${width}px`).toEqual([]);
    }
  }
});

test('only the uploaded hero image loads and pages do not produce application errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/cycles', '/accessories', '/services', '/recommendation', '/offers', '/about', '/contact', '/privacy']) {
    await page.goto(path);
    await page.locator('h1').waitFor();
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => undefined)));
    });
    const broken = await page.evaluate(() => Array.from(document.images).filter(img => img.complete && img.naturalWidth === 0).map(img => img.src));
    expect(broken, path).toEqual([]);
    // The supplied portrait is the only photograph, shown in the homepage shop story.
    const photographs = await page.evaluate(() => Array.from(document.images)
      .map(img => new URL(img.currentSrc || img.src, location.origin).pathname));
    expect(photographs, path).toEqual(path === '/' ? ['/images/kanchan-store-hero.jpeg'] : []);
  }
  expect(errors).toEqual([]);
});
