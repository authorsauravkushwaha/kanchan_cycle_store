import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Baby, Bike, BriefcaseBusiness, Check, GraduationCap, Mountain, RotateCcw, School, Sparkles, Sun, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { shop } from '../config/shop';
import { useCatalog } from '../inventory';
import { useLanguage } from '../i18n';
import type { TranslationKey } from '../i18n';
import { answerLabel, emptyAnswers, quizFields, recommendProducts, validateQuizStep } from '../lib/quiz';
import type { QuizAnswers } from '../lib/quiz';
import { productUrl, track } from '../lib/business';
import { SEO } from '../components/SEO';
import { Notice, PageHero, WhatsAppButton } from '../components/UI';
import { ProductGrid } from '../components/ProductCard';

function Choice({ name, value, selected, onChange, label, icon: Icon, children }: { name: string; value: string; selected: string; onChange: (value: string) => void; label: string; icon?: LucideIcon; children?: ReactNode }) {
  return <label className={`quiz-choice ${selected === value ? 'choice-selected' : ''}`}><input type="radio" name={name} value={value} checked={selected === value} onChange={() => onChange(value)} /><span className="choice-content">{Icon && <Icon size={26} strokeWidth={1.5} aria-hidden="true" />}<span>{label}{children && <small>{children}</small>}</span></span><span className="choice-check" aria-hidden="true">{selected === value && <Check size={13} strokeWidth={3} />}</span></label>;
}
export default function Recommendation() {
  const { t, l, number, productName } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({ ...emptyAnswers });
  const [error, setError] = useState<TranslationKey | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { products } = useCatalog();
  const matches = step === 6 ? recommendProducts(products, answers) : [];
  const update = (field: keyof QuizAnswers, value: string) => { setAnswers(previous => ({ ...previous, [field]: value })); setError(null); };
  const advance = (skipHeight = false) => {
    const nextAnswers = skipHeight ? { ...answers, height: '' } : answers;
    const nextError = validateQuizStep(step, nextAnswers);
    if (nextError) { setError(nextError); return; }
    setAnswers(nextAnswers); setError(null); setStep(step + 1);
    if (step === 5) track('quiz_complete', { placement: 'recommendation-quiz' });
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const submit = (event: FormEvent) => { event.preventDefault(); advance(); };
  const back = () => { setStep(Math.max(0, step - 1)); setError(null); requestAnimationFrame(() => headingRef.current?.focus()); };
  const reset = () => { setAnswers({ ...emptyAnswers }); setStep(0); setError(null); requestAnimationFrame(() => headingRef.current?.focus()); };
  const titleKeys: TranslationKey[] = ['quiz.rider', 'quiz.age', 'quiz.height', 'quiz.budget', 'quiz.use', 'quiz.gear'];
  const hintKeys: Partial<Record<number, TranslationKey>> = { 1: 'quiz.ageHint', 2: 'quiz.heightHint', 3: 'quiz.budgetHint', 5: 'quiz.gearHint' };
  const summary = quizFields.map(field => {
    const value = answers[field];
    const label = answerLabel(field, value);
    const budget = shop.budgets.find(b => b.id === value);
    const display = label ? t(label) : field === 'age' ? `${number(+value)} ${l({ bn: 'বছর', en: 'years' })}` : field === 'height' ? value ? `${number(+value)} ${l({ bn: 'সেমি', en: 'cm' })}` : t('quiz.skipHeight') : budget ? l(budget.label) : t('quiz.unsureBudget');
    return { field, label: t(titleKeys[quizFields.indexOf(field)]), display };
  });
  const quizMessage = [l({ bn: 'নমস্কার, সাইকেল বেছে নিতে সাহায্য চাই। আমার পছন্দগুলো দিলাম:', en: 'Hello, I’d like some help choosing a bicycle. Here are my preferences:' }), ...summary.map(item => `${item.label} ${item.display}`), matches.length ? `${l({ bn: 'ওয়েবসাইটে দেখা সম্ভাব্য পছন্দ', en: 'Possible matches shown on the website' })}: ${matches.map(p => `${productName(p)} (${productUrl(p.slug)})`).join(', ')}` : '', t('quiz.fit')].filter(Boolean).join('\n');
  return <><SEO title={t('nav.quiz')} description="seo.quizDescription" /><PageHero eyebrow={t('quiz.eyebrow')} title={t('quiz.title')} description={t('quiz.description')} /><section className="section quiz-section"><div className="container">
    {step < 6 ? <div className="quiz-card"><div className="quiz-progress-label"><span>{t('quiz.step', { current: number(step + 1), total: number(6) })}</span><span><Bike size={17} aria-hidden="true" />{t('nav.quiz')}</span></div><div className="quiz-progress" role="progressbar" aria-label={t('quiz.progress')} aria-valuemin={0} aria-valuemax={6} aria-valuenow={step + 1}>{Array.from({ length: 6 }, (_, index) => <span key={index} className={index <= step ? 'progress-active' : ''} />)}</div>
      <form onSubmit={submit} noValidate><h2 className="quiz-question" ref={headingRef} tabIndex={-1}>{t(titleKeys[step])}</h2>{hintKeys[step] && <p className="quiz-hint">{t(hintKeys[step]!)}</p>}
        {step === 0 && <div className="quiz-choices choice-grid">{([{ value: 'child', key: 'quiz.child', icon: Baby }, { value: 'student', key: 'quiz.student', icon: GraduationCap }, { value: 'adult', key: 'quiz.adult', icon: UserRound }, { value: 'commuter', key: 'quiz.commutes', icon: BriefcaseBusiness }] as const).map(choice => <Choice key={choice.value} name="rider" value={choice.value} selected={answers.rider} onChange={value => update('rider', value)} label={t(choice.key)} icon={choice.icon} />)}</div>}
        {(step === 1 || step === 2) && <div className="quiz-measurement"><label htmlFor="quiz-measurement">{t(step === 1 ? 'quiz.age' : 'quiz.height')}{step === 2 && <span className="optional">({t('common.optional')})</span>}</label><div><input id="quiz-measurement" type="number" inputMode="numeric" min={step === 1 ? 2 : 80} max={step === 1 ? 100 : 220} step={1} required={step === 1} value={step === 1 ? answers.age : answers.height} onChange={event => update(step === 1 ? 'age' : 'height', event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'quiz-error' : undefined} placeholder={step === 1 ? '12' : '150'} /><span>{step === 1 ? l({ bn: 'বছর', en: 'years' }) : l({ bn: 'সেমি', en: 'cm' })}</span></div></div>}
        {step === 3 && <div className="quiz-choices">{shop.budgets.map(budget => <Choice key={budget.id} name="budget" value={budget.id} selected={answers.budget} onChange={value => update('budget', value)} label={l(budget.label)} />)}<Choice name="budget" value="unsure" selected={answers.budget} onChange={value => update('budget', value)} label={t('quiz.unsureBudget')} /></div>}
        {step === 4 && <div className="quiz-choices choice-grid">{([{ value: 'school', key: 'quiz.school', icon: School }, { value: 'commuting', key: 'quiz.commuting', icon: BriefcaseBusiness }, { value: 'recreation', key: 'quiz.recreation', icon: Sun }, { value: 'mixed', key: 'quiz.mixed', icon: Mountain }] as const).map(choice => <Choice key={choice.value} name="use" value={choice.value} selected={answers.use} onChange={value => update('use', value)} label={t(choice.key)} icon={choice.icon} />)}</div>}
        {step === 5 && <div className="quiz-choices">{(['geared', 'non-geared', 'unsure'] as const).map(value => <Choice key={value} name="gear" value={value} selected={answers.gear} onChange={gear => update('gear', gear)} label={value === 'geared' ? t('catalog.geared') : value === 'non-geared' ? t('catalog.nongeared') : t('quiz.gearUnsure')} />)}</div>}
        {error && <p className="field-error quiz-error" id="quiz-error" role="alert">{t(error)}</p>}
        <div className="quiz-navigation">{step > 0 ? <button type="button" className="btn btn-secondary" onClick={back}><ArrowLeft size={17} aria-hidden="true" />{t('action.previous')}</button> : <span />}<div>{step === 2 && <button type="button" className="btn btn-text" onClick={() => advance(true)}>{t('quiz.skipHeight')}</button>}<button type="submit" className="btn btn-primary">{step === 5 ? t('quiz.seeResults') : t('action.next')}<ArrowRight size={18} aria-hidden="true" /></button></div></div>
      </form><p className="quiz-privacy">{t('quiz.privacy')}</p></div> : <div className="quiz-results"><div className="quiz-result-heading"><span className="success-icon"><Sparkles size={27} aria-hidden="true" /></span><p className="eyebrow">{t('quiz.completed')}</p><h2 ref={headingRef} tabIndex={-1}>{matches.length ? t('quiz.resultTitle') : t('quiz.noMatchTitle')}</h2><p>{matches.length ? t('quiz.matchText') : t('quiz.noMatchText')}</p></div><div className="quiz-summary"><h3>{t('quiz.summary')}</h3><dl>{summary.map(item => <div key={item.field}><dt>{item.label}</dt><dd>{item.display}</dd></div>)}</dl></div>{matches.length > 0 && <ProductGrid products={matches} />}<Notice>{t('quiz.fit')}</Notice><div className="quiz-result-actions"><WhatsAppButton message={quizMessage} placement="quiz-results">{t('quiz.sendAnswers')}</WhatsAppButton><button className="btn btn-secondary" onClick={reset}><RotateCcw size={17} aria-hidden="true" />{t('action.reset')}</button></div></div>}
  </div></section></>;
}
