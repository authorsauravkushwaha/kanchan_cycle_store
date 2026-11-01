import { shop } from '../config/shop';
import type { Localized } from '../config/shop';

export type CheckSeverity = 'blocker' | 'warning' | 'ready';

export interface LaunchCheck {
  id: string;
  severity: CheckSeverity;
  title: Localized;
  detail: Localized;
  action: Localized;
}

const priced = () => shop.catalog.filter(product => product.price !== null).length;
const stocked = () => shop.catalog.filter(product => product.availability !== null).length;
const catalogPhotos = () => shop.catalog.filter(product => product.photoKind === 'catalogue').length;

/**
 * A plain checklist of everything that still stands between the website and a
 * customer walking into the shop. It is computed from the owner configuration,
 * so it can never drift from what the site actually shows.
 */
export function launchChecks(): LaunchCheck[] {
  const checks: LaunchCheck[] = [];
  const cycles = shop.catalog.length;

  if (!shop.websiteUrl) checks.push({
    id: 'website-url', severity: 'blocker',
    title: { bn: 'ওয়েবসাইটের ঠিকানা নেই', en: 'The website has no address yet' },
    detail: { bn: 'গুগল, হোয়াটসঅ্যাপ বা যেকোনো জায়গা থেকে দোকানের লিংক দেওয়া যাচ্ছে না।', en: 'The shop cannot share a link from Google, WhatsApp or anywhere else.' },
    action: { bn: 'সাইট ডিপ্লয় করার পর src/config/shop.ts-এ websiteUrl বসান।', en: 'After deploying, set websiteUrl in src/config/shop.ts.' },
  });

  if (!shop.seo.indexingEnabled) checks.push({
    id: 'indexing', severity: 'blocker',
    title: { bn: 'সার্চ ইঞ্জিন সাইটটি তালিকাভুক্ত করবে না', en: 'Search engines are told not to list the site' },
    detail: { bn: 'এখন robots.txt সবাইকে নিষেধ করে এবং প্রতিটি পেজ noindex। কেউ গুগলে "সাইকেলের দোকান কোলাঘাট" লিখলে দোকান ওঠবে না।', en: 'robots.txt blocks everyone and every page is noindex. Nobody finds the shop by searching for a bicycle shop in Kolaghat.' },
    action: { bn: 'সব লেখা দেখে নিয়ে seo.indexingEnabled: true করে আবার বিল্ড করুন।', en: 'Read the site, then set seo.indexingEnabled: true and rebuild.' },
  });

  if (!priced()) checks.push({
    id: 'prices', severity: 'blocker',
    title: { bn: 'একটিও সাইকেলের দাম প্রকাশিত নেই', en: 'No cycle has a published price' },
    detail: { bn: `${cycles}টি সাইকেলের প্রতিটিতেই “দাম জানতে যোগাযোগ করুন” দেখা যাচ্ছে। বাজেট ফিল্টার কাজ করে না, আর অনেকে দাম না দেখে ছেড়ে দেয়।`, en: `All ${cycles} cycles show “contact us for price”. The budget filter cannot work and many customers give up when they see no price.` },
    action: { bn: 'দোকানে গিয়ে দাম লিখে দিন — /owner থেকে CSV নামিয়ে Supabase-এ আপলোড করুন।', en: 'Write the shop prices down — export the CSV from /owner and upload it to Supabase.' },
  });

  if (!stocked()) checks.push({
    id: 'stock', severity: 'warning',
    title: { bn: 'কোনো সাইকেলের স্টক নিশ্চিত নয়', en: 'No cycle has a confirmed stock status' },
    detail: { bn: 'দোকানে আসার আগে ফোনে খোঁজ না করেই লোকে চলে আসে না।', en: 'People will not walk over without checking first, because nothing says the cycle is there.' },
    action: { bn: 'স্টক নিশ্চিত সাইকেলগুলো “স্টক আছে” দেখান।', en: 'Mark the cycles you are sure about as “in stock”.' },
  });

  if (!shop.hours.confirmed) checks.push({
    id: 'hours', severity: 'warning',
    title: { bn: 'খোলার সময় নিশ্চিত করা হয়নি', en: 'Opening hours are not confirmed' },
    detail: { bn: 'সময় দেখানো হচ্ছে, তবে গুগলে প্রকাশিত হচ্ছে না এবং সাবেকশনও নেই।', en: 'The times are shown but not published to Google, and nothing tells a visitor that the shop is open right now.' },
    action: { bn: 'সময় মিলিয়ে hours.confirmed: true করুন।', en: 'Check the times and set hours.confirmed: true.' },
  });

  if (!shop.reviews.length) checks.push({
    id: 'reviews', severity: 'warning',
    title: { bn: 'কোনো রিভিউ নেই', en: 'There are no customer reviews' },
    detail: { bn: 'নতুন লোক সাইকেল কেনার আগে অন্য কারো অভিজ্ঞতা দেখতে চায়।', en: 'A first-time buyer wants to read what other customers said before spending money.' },
    action: { bn: 'আসল রিভিউ ও তার লিংক যোগ করুন, নিজে লিখবেন না।', en: 'Add real reviews with their links — never write them yourself.' },
  });

  if (!shop.offers.length) checks.push({
    id: 'offers', severity: 'warning',
    title: { bn: 'কোনো অফার প্রকাশিত নেই', en: 'No offers are published' },
    detail: { bn: '“অফার” দেখে আসা লোক কিছু না পেয়ে চলে যায়।', en: 'People who click “Offers” expecting a discount find nothing and leave.' },
    action: { bn: 'যে অফার সত্যি, সেগুলো verified: true দিয়ে যোগ করুন।', en: 'Add the genuine offers with verified: true.' },
  });

  const cataloguePictures = catalogPhotos();
  if (cataloguePictures > 0) checks.push({
    id: 'photo-kind', severity: 'warning',
    title: { bn: `${cataloguePictures}টি ছবি ব্র্যান্ডের ক্যাটালগ ছবি`, en: `${cataloguePictures} pictures are the brand's catalogue photo` },
    detail: { bn: 'ছবিগুলো এখন “ব্র্যান্ডের ক্যাটালগ ছবি” বলে চিহ্নিত। ক্রেতা ভাবে দোকানে হুবহু ঐ মডেলটাই পাবে।', en: 'They are now labelled as catalogue pictures, so a customer does not expect the shop to hold exactly that model.' },
    action: { bn: 'একবার দোকানে গিয়ে মডেল ও ছবি মিলিয়ে দেখুন।', en: 'Walk the shop once and check each model against its picture.' },
  });

  if (!shop.analytics.endpoint) checks.push({
    id: 'analytics', severity: 'warning',
    title: { bn: 'কোনো এনালিটিক্স নেই', en: 'No analytics are recorded' },
    detail: { bn: 'কোন পাতা থেকে ক্রেতা WhatsApp করছেন, তা জানা যাচ্ছে না।', en: 'There is no way to see which page turns into a WhatsApp enquiry.' },
    action: { bn: 'বিকল্প হলে একটি HTTPS এন্ডপয়েন্ট সেট করুন।', en: 'Optionally set one HTTPS analytics endpoint.' },
  });

  if (!shop.socialLinks.length) checks.push({
    id: 'google-profile', severity: 'warning',
    title: { bn: 'গুগল বিজনেস প্রোফাইল যুক্ত নেই', en: 'No Google Business Profile link' },
    detail: { bn: 'গুগল ম্যাপে দোকান খুঁজে আসা লোকের সবচেয়ে বড় স্রোত।', en: 'Most people who need a bicycle shop today find one through Google Maps.' },
    action: { bn: 'সত্যিকারের প্রোফাইল লিংক socialLinks-এ যোগ করুন।', en: 'Add the genuine profile link to socialLinks.' },
  });

  return checks;
}

export const launchSummary = (checks: LaunchCheck[]) => ({
  blockers: checks.filter(check => check.severity === 'blocker').length,
  warnings: checks.filter(check => check.severity === 'warning').length,
});
