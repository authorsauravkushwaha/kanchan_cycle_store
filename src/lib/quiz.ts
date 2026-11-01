import { shop } from '../config/shop';
import type { Product, UseCase } from '../config/shop';
import type { TranslationKey } from '../i18n';

export interface QuizAnswers { rider: string; age: string; height: string; budget: string; use: string; gear: string }
export const emptyAnswers: QuizAnswers = { rider: '', age: '', height: '', budget: '', use: '', gear: '' };
export const quizFields = ['rider', 'age', 'height', 'budget', 'use', 'gear'] as const;
export function validateQuizStep(step: number, answers: QuizAnswers): TranslationKey | null {
  if (!answers || typeof answers !== 'object') return 'quiz.errorRider';
  if (step === 0 && !['child', 'student', 'adult', 'commuter'].includes(answers.rider)) return 'quiz.errorRider';
  // Number inputs have no reliable maxlength; cap the string before regex work.
  if (step === 1 && (typeof answers.age !== 'string' || answers.age.length > 3 || !/^\d+$/.test(answers.age) || +answers.age < 2 || +answers.age > 100)) return 'quiz.errorAge';
  if (step === 2 && answers.height && (typeof answers.height !== 'string' || answers.height.length > 3 || !/^\d+$/.test(answers.height) || +answers.height < 80 || +answers.height > 220)) return 'quiz.errorHeight';
  if (step === 3 && answers.budget !== 'unsure' && !shop.budgets.some(b => b.id === answers.budget)) return 'quiz.errorBudget';
  if (step === 4 && !['school', 'commuting', 'recreation', 'mixed'].includes(answers.use)) return 'quiz.errorUse';
  if (step === 5 && !['geared', 'non-geared', 'unsure'].includes(answers.gear)) return 'quiz.errorGear';
  return null;
}

export type QuizPending = 'budget' | 'gear' | 'height';
export interface QuizMatch {
  product: Product;
  /** 'unconfirmed' = the shop still has to confirm price, gearing or sizing. */
  status: 'confirmed' | 'unconfirmed';
  pending: QuizPending[];
}

const preferredCategories: Record<string, string[]> = {
  child: ['kids'], student: ['student', 'city', 'geared'], adult: ['city', 'geared', 'premium', 'electric'], commuter: ['city', 'geared', 'premium', 'electric'],
};
const primaryCategory: Record<string, string> = { child: 'kids', student: 'student', adult: 'city', commuter: 'city' };

/**
 * Recommendations never infer price, gearing, stock or sizing from missing data.
 * A cycle whose data is not confirmed yet is still offered — it is simply
 * marked as "the shop has to confirm this" instead of being silently dropped.
 * Dropping it told the customer the shop had nothing to offer.
 */
export function recommendMatches(products: Product[], answers: QuizAnswers): QuizMatch[] {
  if (quizFields.some((_, step) => validateQuizStep(step, answers))) return [];
  const budget = shop.budgets.find(b => b.id === answers.budget) ?? null;
  const candidates: QuizMatch[] = [];
  for (const product of products) {
    if (product.kind !== 'cycle' || product.availability === 'out-of-stock') continue;
    if (!preferredCategories[answers.rider]?.includes(product.category)) continue;
    const pending: QuizPending[] = [];
    if (budget) {
      // An unknown price cannot rule a cycle out — it only needs confirming.
      if (product.price === null || !Number.isFinite(product.price) || product.price < 0) pending.push('budget');
      else if (product.price < budget.min) continue;
      else if (budget.max !== null && product.price > budget.max) continue;
    }
    if (answers.gear !== 'unsure') {
      if (product.specifications.geared === null) pending.push('gear');
      else if (answers.gear === 'geared' && product.specifications.geared !== true) continue;
      else if (answers.gear === 'non-geared' && product.specifications.geared !== false) continue;
    }
    if (answers.height) {
      const range = product.specifications.riderHeightCm;
      if (!range) pending.push('height');
      else if (+answers.height < range.min || +answers.height > range.max) continue;
    }
    candidates.push({ product, status: pending.length ? 'unconfirmed' : 'confirmed', pending });
  }
  const score = (match: QuizMatch) => {
    const product = match.product;
    return Number(product.specifications.intendedUse?.includes(answers.use as UseCase)) * 3
      + Number(product.category === primaryCategory[answers.rider]) * 2
      + Number(product.specifications.geared !== null && answers.gear !== 'unsure')
      - match.pending.length * 2;
  };
  return candidates.sort((a, b) => score(b) - score(a)).slice(0, 3);
}

/** The cycles to show. Identical to `recommendMatches`, minus the detail. */
export function recommendProducts(products: Product[], answers: QuizAnswers): Product[] {
  return recommendMatches(products, answers).map(match => match.product);
}

export function answerLabel(field: keyof QuizAnswers, value: string): TranslationKey | null {
  if (!value) return null;
  if (field === 'rider') return ({ child: 'quiz.child', student: 'quiz.student', adult: 'quiz.adult', commuter: 'quiz.commutes' } as Record<string, TranslationKey>)[value] || null;
  if (field === 'use') return ({ school: 'quiz.school', commuting: 'quiz.commuting', recreation: 'quiz.recreation', mixed: 'quiz.mixed' } as Record<string, TranslationKey>)[value] || null;
  if (field === 'gear') return ({ geared: 'catalog.geared', 'non-geared': 'catalog.nongeared', unsure: 'quiz.gearUnsure' } as Record<string, TranslationKey>)[value] || null;
  return null;
}
