import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, ClipboardCopy, Download, FileJson, FileSpreadsheet, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { shop } from '../config/shop';
import type { CategoryId } from '../config/shop';
import { useLanguage } from '../i18n';
import { SEO } from '../components/SEO';
import { Notice } from '../components/UI';
import { draftsToCatalogJson, draftsToCsv, emptyDraft, parseDrafts, validateDraft } from '../lib/stockDesk';
import type { DraftProduct } from '../lib/stockDesk';

const DRAFT_KEY = 'kanchan-owner-draft-v1';

/**
 * A device-local stock desk for the owner. It prepares records; publishing is
 * an explicit copy/paste into the Supabase table editor or src/config/shop.ts.
 * It is NOT a secure admin area and says so plainly.
 */
export default function OwnerDesk() {
  const { t, l } = useLanguage();
  const [drafts, setDrafts] = useState<DraftProduct[]>(() => {
    try { return parseDrafts(localStorage.getItem(DRAFT_KEY)); } catch { return []; }
  });
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const persist = (next: DraftProduct[]) => {
    setDrafts(next);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { setStatus(l({ bn: 'সংরক্ষণ করা যায়নি — ফোনের স্টোরেজ ভর্তি হতে পারে।', en: 'Could not save — phone storage may be full.' })); }
  };

  const update = <K extends keyof DraftProduct>(field: K, value: DraftProduct[K]) => {
    setDraft(current => ({ ...current, [field]: value }));
    setErrors([]);
  };

  const save = () => {
    const problems = validateDraft(draft, drafts);
    if (problems.length) { setErrors(problems); return; }
    const normalized: DraftProduct = { ...draft, slug: draft.slug.trim().toLowerCase(), id: draft.id.trim() || draft.slug.trim().toLowerCase() };
    persist(editing ? drafts.map(item => item.key === normalized.key ? normalized : item) : [...drafts, normalized]);
    setDraft(emptyDraft());
    setEditing(false);
    setStatus(l({ bn: 'খসড়া সংরক্ষণ হয়েছে।', en: 'Draft saved.' }));
  };

  const edit = (item: DraftProduct) => {
    setDraft(item); setEditing(true); setErrors([]);
    document.getElementById('stock-form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const remove = (key: string) => persist(drafts.filter(item => item.key !== key));

  const download = (filename: string, contents: string, type: string) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async (contents: string, label: string) => {
    try { await navigator.clipboard.writeText(contents); setStatus(`${label} — ${l({ bn: 'কপি হয়েছে', en: 'copied' })}`); }
    catch { setStatus(l({ bn: 'কপি করা যায়নি। ডাউনলোড করে নিন।', en: 'Could not copy. Use the download button instead.' })); }
  };

  const csv = useMemo(() => draftsToCsv(drafts), [drafts]);
  const json = useMemo(() => draftsToCatalogJson(drafts), [drafts]);

  /* A wrapping <label> keeps every control named for screen readers without
     threading generated ids through a dozen fields. */
  const field = (label: { bn: string; en: string }, node: React.ReactNode, hint?: { bn: string; en: string }) =>
    <label className="field"><span className="field-label">{l(label)}</span>{node}{hint && <small className="field-hint">{l(hint)}</small>}</label>;

  const input = (fieldName: keyof DraftProduct, type: 'text' | 'number' = 'text', placeholder = '') =>
    <input type={type} inputMode={type === 'number' ? 'numeric' : 'text'} value={String(draft[fieldName] ?? '')} placeholder={placeholder} onChange={event => update(fieldName, event.target.value as never)} maxLength={600} />;

  return <>
    <SEO title={l({ bn: 'স্টক ডেস্ক', en: 'Stock desk' })} description="seo.ownerDescription" noindex />
    <section className="page-hero owner-hero"><div className="container">
      <p className="eyebrow"><span />{l({ bn: 'মালিকের জন্য', en: 'FOR THE OWNER' })}</p>
      <h1>{l({ bn: 'স্টক ডেস্ক', en: 'Stock desk' })}</h1>
      <p className="page-hero-description">{l({
        bn: 'ফোন থেকেই সাইকেলের নাম, দাম ও স্টক লিখে রাখুন। শেষে CSV ডাউনলোড করে Supabase-এ আপলোড করুন, অথবা JSON কপি করে ওয়েবসাইটে যোগ করুন।',
        en: 'Prepare product names, prices and stock on your phone. Download the CSV for Supabase, or copy the JSON into the website.',
      })}</p>
    </div></section>
    <section className="section"><div className="container owner-layout">
      <Notice>
        <strong>{l({ bn: 'এই পাতা শুধু এই ফোনে খসড়া রাখে।', en: 'This page only keeps drafts on this phone.' })}</strong>{' '}
        {l({
          bn: 'এটি সুরক্ষিত অ্যাডমিন প্যানেল নয় — পাসওয়ার্ড নেই, তাই ব্যক্তিগত ফোনেই ব্যবহার করুন। সবার জন্য স্টক আপডেট করতে Supabase চালু করুন (SUPABASE.md দেখুন)।',
          en: 'It is not a secure admin panel — there is no password, so use it on your own phone. Turn on Supabase to publish stock to everyone (see SUPABASE.md).',
        })}
      </Notice>

      <div className="owner-stats">
        <div><strong>{drafts.length}</strong><span>{l({ bn: 'খসড়া', en: 'drafts' })}</span></div>
        <div><strong>{drafts.filter(item => item.price.trim()).length}</strong><span>{l({ bn: 'দাম দেওয়া', en: 'with price' })}</span></div>
        <div><strong>{drafts.filter(item => item.availability === 'in-stock').length}</strong><span>{l({ bn: 'স্টকে আছে', en: 'in stock' })}</span></div>
      </div>

      <div className="owner-actions">
        <button type="button" className="btn btn-primary" onClick={() => download('kanchan-products.csv', csv, 'text/csv;charset=utf-8')} disabled={!drafts.length}><FileSpreadsheet size={18} aria-hidden="true" />CSV</button>
        <button type="button" className="btn btn-secondary" onClick={() => download('kanchan-catalog.json', json, 'application/json')} disabled={!drafts.length}><FileJson size={18} aria-hidden="true" />JSON</button>
        <button type="button" className="btn btn-secondary" onClick={() => void copy(csv, 'CSV')} disabled={!drafts.length}><ClipboardCopy size={18} aria-hidden="true" />{l({ bn: 'CSV কপি', en: 'Copy CSV' })}</button>
        <button type="button" className="btn btn-secondary" onClick={() => fileInput.current?.click()}><Upload size={18} aria-hidden="true" />{l({ bn: 'খসড়া আনুন', en: 'Import drafts' })}</button>
        <input ref={fileInput} type="file" accept="application/json,.json" aria-label={l({ bn: 'খসড়া JSON ফাইল বেছে নিন', en: 'Choose a draft JSON file' })} className="sr-only" onChange={async event => {
          const file = event.target.files?.[0];
          if (!file) return;
          const imported = parseDrafts(await file.text());
          if (!imported.length) { setStatus(l({ bn: 'ফাইলটি পড়া যায়নি।', en: 'Could not read that file.' })); return; }
          persist([...drafts, ...imported.filter(item => !drafts.some(existing => existing.slug === item.slug))]);
          setStatus(l({ bn: 'খসড়া যোগ হয়েছে।', en: 'Drafts added.' }));
          event.target.value = '';
        }} />
      </div>
      {status && <p className="inline-success" role="status"><Check size={16} aria-hidden="true" />{status}</p>}

      <form id="stock-form" className="owner-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <h2>{editing ? l({ bn: 'খসড়া সম্পাদনা', en: 'Edit draft' }) : l({ bn: 'নতুন সাইকেল বা জিনিস', en: 'Add a cycle or item' })}</h2>
        <div className="form-grid">
          {field({ bn: 'বাংলা নাম', en: 'Bengali name' }, input('nameBn', 'text', 'স্ট্রাইডার ১৬'))}
          {field({ bn: 'English name', en: 'English name' }, input('nameEn', 'text', 'Stryder 16'))}
          {field({ bn: 'Slug (ইংরেজি, হাইফেন)', en: 'Slug (lowercase, dashes)' }, input('slug', 'text', 'stryder-16'), { bn: 'যেমন stryder-16', en: 'e.g. stryder-16' })}
          {field({ bn: 'ধরন', en: 'Type' }, <select value={draft.kind} onChange={event => update('kind', event.target.value as DraftProduct['kind'])}>
            <option value="cycle">{l({ bn: 'সাইকেল', en: 'Cycle' })}</option>
            <option value="accessory">{l({ bn: 'অ্যাক্সেসরিজ', en: 'Accessory' })}</option>
          </select>)}
          {field({ bn: 'শ্রেণি', en: 'Category' }, <select value={draft.category} onChange={event => update('category', event.target.value as CategoryId)}>
            {shop.categories.map(category => <option key={category.id} value={category.id}>{l(category.name)}</option>)}
          </select>)}
          {field({ bn: 'ব্র্যান্ড', en: 'Brand' }, input('brand', 'text', 'Stryder'))}
          {field({ bn: 'দাম (₹)', en: 'Price (₹)' }, input('price', 'number', '8500'), { bn: 'নিশ্চিত না হলে খালি রাখুন', en: 'Leave empty until confirmed' })}
          {field({ bn: 'স্টক', en: 'Stock' }, <select value={draft.availability} onChange={event => update('availability', event.target.value as DraftProduct['availability'])}>
            <option value="">{l({ bn: 'জানা নেই', en: 'Unknown' })}</option>
            <option value="in-stock">{l({ bn: 'স্টকে আছে', en: 'In stock' })}</option>
            <option value="out-of-stock">{l({ bn: 'স্টকে নেই', en: 'Out of stock' })}</option>
          </select>)}
          {field({ bn: 'চাকার মাপ', en: 'Wheel size' }, input('wheelSize', 'text', '16 in'))}
          {field({ bn: 'ফ্রেমের মাপ', en: 'Frame size' }, input('frameSize', 'text', '16 in'))}
          {field({ bn: 'ব্রেক', en: 'Brakes' }, input('brakes', 'text', 'V-brake'))}
          {field({ bn: 'গিয়ার', en: 'Gears' }, <select value={draft.geared} onChange={event => update('geared', event.target.value as DraftProduct['geared'])}>
            <option value="">{l({ bn: 'জানা নেই', en: 'Unknown' })}</option>
            <option value="false">{l({ bn: 'গিয়ার ছাড়া', en: 'Non-geared' })}</option>
            <option value="true">{l({ bn: 'গিয়ারযুক্ত', en: 'Geared' })}</option>
          </select>)}
          {field({ bn: 'আরোহীর উচ্চতা (সেমি)', en: 'Rider height (cm)' }, <div className="range-inputs"><input type="number" inputMode="numeric" aria-label={l({ bn: 'সর্বনিম্ন উচ্চতা', en: 'Minimum height' })} value={draft.riderHeightMin} placeholder="110" onChange={event => update('riderHeightMin', event.target.value)} /><span aria-hidden="true">–</span><input type="number" inputMode="numeric" aria-label={l({ bn: 'সর্বোচ্চ উচ্চতা', en: 'Maximum height' })} value={draft.riderHeightMax} placeholder="130" onChange={event => update('riderHeightMax', event.target.value)} /></div>)}
          {field({ bn: 'ব্যবহার', en: 'Intended use' }, input('intendedUse', 'text', 'school, commuting'), { bn: 'কমা দিয়ে: school, commuting, recreation, mixed', en: 'Comma separated: school, commuting, recreation, mixed' })}
          {field({ bn: 'ছবির লিংক (ঐচ্ছিক)', en: 'Photo link (optional)' }, input('photoUrl', 'text', 'https://…supabase.co/storage/…'), { bn: 'শুধু নিজের তোলা আসল ছবি, https লিংক', en: 'Only your own real photo on an https link' })}
          <label className="field field-full"><span className="field-label">{l({ bn: 'বাংলা বিবরণ', en: 'Bengali description' })}</span><textarea rows={2} maxLength={600} value={draft.descriptionBn} onChange={event => update('descriptionBn', event.target.value)} /></label>
          <label className="field field-full"><span className="field-label">{l({ bn: 'English description', en: 'English description' })}</span><textarea rows={2} maxLength={600} value={draft.descriptionEn} onChange={event => update('descriptionEn', event.target.value)} /></label>
          <div className="field field-full owner-checks">
            <label className="checkbox-field"><input type="checkbox" checked={draft.featured} onChange={event => update('featured', event.target.checked)} />{l({ bn: 'হোমপেজে দেখান', en: 'Show on the homepage' })}</label>
          </div>
        </div>
        {errors.length > 0 && <ul className="owner-errors" role="alert">{errors.map(error => <li key={error}><AlertTriangle size={15} aria-hidden="true" />{error}</li>)}</ul>}
        <div className="owner-form-actions">
          <button type="submit" className="btn btn-primary"><Plus size={18} aria-hidden="true" />{editing ? l({ bn: 'পরিবর্তন সংরক্ষণ', en: 'Save changes' }) : l({ bn: 'খসড়া যোগ করুন', en: 'Add draft' })}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setDraft(emptyDraft()); setEditing(false); setErrors([]); }}>{t('action.reset')}</button>}
        </div>
      </form>

      <div className="owner-list">
        <h2>{l({ bn: 'খসড়ার তালিকা', en: 'Draft catalogue' })}</h2>
        {drafts.length === 0 ? <p className="muted">{l({ bn: 'এখনও কোনো খসড়া নেই।', en: 'No drafts yet.' })}</p> : <ul>
          {drafts.map(item => <li key={item.key}>
            <div><strong>{item.nameBn || item.nameEn}</strong><span>{item.price ? `₹${item.price}` : l({ bn: 'দাম নেই', en: 'no price' })} · {item.availability === 'in-stock' ? l({ bn: 'স্টকে আছে', en: 'in stock' }) : item.availability === 'out-of-stock' ? l({ bn: 'স্টকে নেই', en: 'out of stock' }) : l({ bn: 'স্টক জানা নেই', en: 'stock unknown' })}</span></div>
            <div className="owner-list-actions"><button type="button" className="icon-button" onClick={() => edit(item)} aria-label={`${l({ bn: 'সম্পাদনা', en: 'Edit' })} ${item.nameEn || item.nameBn}`}><Pencil size={15} /></button><button type="button" className="icon-button" onClick={() => remove(item.key)} aria-label={`${l({ bn: 'মুছুন', en: 'Delete' })} ${item.nameEn || item.nameBn}`}><Trash2 size={15} /></button></div>
          </li>)}
        </ul>}
        {drafts.length > 0 && <button type="button" className="btn btn-text owner-clear" onClick={() => { persist([]); setStatus(l({ bn: 'সব খসড়া মুছে ফেলা হয়েছে।', en: 'All drafts cleared.' })); }}><Trash2 size={15} aria-hidden="true" />{l({ bn: 'সব খসড়া মুছুন', en: 'Clear all drafts' })}</button>}
      </div>

      <div className="owner-guide">
        <h2><Download size={19} aria-hidden="true" />{l({ bn: 'এরপর কী করবেন', en: 'What to do next' })}</h2>
        <ol>
          <li>{l({ bn: 'CSV ডাউনলোড করুন, Supabase ড্যাশবোর্ডে products টেবিলে Import করুন।', en: 'Download the CSV and import it into the products table in the Supabase dashboard.' })}</li>
          <li>{l({ bn: 'অথবা JSON কপি করে src/config/shop.ts-এর catalog-এ বসিয়ে সাইট আবার বিল্ড করুন।', en: 'Or paste the JSON into catalog in src/config/shop.ts and rebuild the site.' })}</li>
          <li>{l({ bn: 'দাম নিশ্চিত না হলে খালি রাখুন — সাইট অনুমান করে দাম দেখাবে না।', en: 'Leave the price empty until it is confirmed — the site never guesses.' })}</li>
        </ol>
        <p className="muted small-note">{l({ bn: 'বিস্তারিত: SUPABASE.md ও OWNER_CHECKLIST.md', en: 'Details: SUPABASE.md and OWNER_CHECKLIST.md' })}</p>
      </div>
    </div></section>
  </>;
}
