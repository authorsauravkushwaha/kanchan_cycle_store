import { shop } from '../config/shop';
import type { Product, UseCase } from '../config/shop';
import type { TranslationKey } from '../i18n';

export interface QuizAnswers { rider: string; age: string; height: string; budget: string; use: string; gear: string }
export const emptyAnswers: QuizAnswers = { rider: '', age: '', height: '', budget: '', use: '', gear: '' };
export const quizFields = ['rider', 'age', 'height', 'budget', 'use', 'gear'] as const;
export function validateQuizStep(step: number, answers: QuizAnswers): TranslationKey | null {
  if (step === 0 && !['child', 'student', 'adult', 'commuter'].includes(answers.rider)) return 'quiz.errorRider';
  if (step === 1 && (!/^\d+$/.test(answers.age) || +answers.age < 2 || +answers.age > 100)) return 'quiz.errorAge';
  if (step === 2 && answers.height && (!/^\d+$/.test(answers.height) || +answers.height < 80 || +answers.height > 220)) return 'quiz.errorHeight';
  if (step === 3 && answers.budget !== 'unsure' && !shop.budgets.some(b => b.id === answers.budget)) return 'quiz.errorBudget';
  if (step === 4 && !['school', 'commuting', 'recreation', 'mixed'].includes(answers.use)) return 'quiz.errorUse';
  if (step === 5 && !['geared', 'non-geared', 'unsure'].includes(answers.gear)) return 'quiz.errorGear';
  return null;
}
/** Recommendations never infer price, gearing, stock or sizing from missing data. */
export function recommendProducts(products: Product[], answers: QuizAnswers): Product[] {
  if (quizFields.some((_, step) => validateQuizStep(step, answers))) return [];
  const preferredCategories: Record<string, string[]> = {
    child: ['kids'], student: ['student', 'city', 'geared'], adult: ['city', 'geared', 'premium', 'electric'], commuter: ['city', 'geared', 'premium', 'electric'],
  };
  const budget = shop.budgets.find(b => b.id === answers.budget);
  const candidates = products.filter(product => {
    if (product.kind !== 'cycle' || product.availability === 'out-of-stock') return false;
    if (!preferredCategories[answers.rider]?.includes(product.category)) return false;
    if (budget) {
      if (product.price === null || !Number.isFinite(product.price) || product.price < budget.min) return false;
      if (budget.max !== null && product.price > budget.max) return false;
    }
    if (answers.gear === 'geared' && product.specifications.geared !== true) return false;
    if (answers.gear === 'non-geared' && product.specifications.geared !== false) return false;
    if (answers.height) {
      const range = product.specifications.riderHeightCm;
      if (!range || +answers.height < range.min || +answers.height > range.max) return false;
    }
    return true;
  });
  const score = (product: Product) => Number(product.specifications.intendedUse?.includes(answers.use as UseCase)) * 3
    + Number(product.category === ({ child: 'kids', student: 'student', adult: 'city', commuter: 'city' }[answers.rider])) * 2
    + Number(product.specifications.geared !== null && answers.gear !== 'unsure');
  return candidates.sort((a, b) => score(b) - score(a)).slice(0, 3);
}
export function answerLabel(field: keyof QuizAnswers, value: string): TranslationKey | null {
  if (!value) return null;
  if (field === 'rider') return ({ child: 'quiz.child', student: 'quiz.student', adult: 'quiz.adult', commuter: 'quiz.commutes' } as Record<string, TranslationKey>)[value] || null;
  if (field === 'use') return ({ school: 'quiz.school', commuting: 'quiz.commuting', recreation: 'quiz.recreation', mixed: 'quiz.mixed' } as Record<string, TranslationKey>)[value] || null;
  if (field === 'gear') return ({ geared: 'catalog.geared', 'non-geared': 'catalog.nongeared', unsure: 'quiz.gearUnsure' } as Record<string, TranslationKey>)[value] || null;
  return null;
}
