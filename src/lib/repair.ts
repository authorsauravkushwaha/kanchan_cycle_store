import { shop } from '../config/shop';
import type { TranslationKey } from '../i18n';

export interface RepairFields { name: string; phone: string; bikeType: string; service: string; date: string; time: string; details: string; source: string }
export const emptyRepair: RepairFields = { name: '', phone: '', bikeType: '', service: '', date: '', time: '', details: '', source: '' };

/** Bound work before trimming or running a regular expression on user input. */
const FIELD_LIMITS: Record<keyof RepairFields, number> = {
  name: 100, phone: 22, bikeType: 40, service: 40, date: 10, time: 5, details: 1000, source: 20,
};
const ERROR_KEYS: Record<keyof RepairFields, TranslationKey> = {
  name: 'form.errorName', phone: 'form.errorPhone', bikeType: 'form.errorBike', service: 'form.errorService',
  date: 'form.errorDate', time: 'form.errorTime', details: 'form.errorDetails', source: 'form.errorSource',
};
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function localToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function normalizePhone(phone: string): string {
  // Callers normally validate first; keep this exported helper safe on its own too.
  if (typeof phone !== 'string' || phone.length > FIELD_LIMITS.phone) return '';
  return phone.trim().replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/[\s()\-]/g, '');
}

export function validDate(value: string): boolean {
  if (typeof value !== 'string' || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateRepair(fields: RepairFields, today = localToday()): Partial<Record<keyof RepairFields, TranslationKey>> {
  const errors: Partial<Record<keyof RepairFields, TranslationKey>> = {};
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return { ...ERROR_KEYS };
  }

  // Even if a caller bypasses TypeScript, never process unexpected value types.
  const keys = Object.keys(emptyRepair) as (keyof RepairFields)[];
  for (const key of keys) {
    if (typeof fields[key] !== 'string') errors[key] = ERROR_KEYS[key];
  }
  if (Object.keys(errors).length) return errors;

  // Reject oversized inputs before trim(), normalization or regex work. The UI's
  // maxLength is only a convenience; this is the actual client-side boundary.
  for (const key of keys) {
    if (fields[key].length > FIELD_LIMITS[key]) errors[key] = ERROR_KEYS[key];
  }

  if (!errors.name && (Array.from(fields.name.trim()).length < 2 || CONTROL_CHARS.test(fields.name))) errors.name = ERROR_KEYS.name;
  if (!errors.phone && !/^\+?[1-9]\d{9,14}$/.test(normalizePhone(fields.phone))) errors.phone = ERROR_KEYS.phone;
  if (!errors.bikeType && fields.bikeType !== 'other' && !shop.categories.some(category => category.id === fields.bikeType)) errors.bikeType = ERROR_KEYS.bikeType;
  if (!errors.service && !shop.services.some(service => service.id === fields.service)) errors.service = ERROR_KEYS.service;
  if (!errors.date && (!validDate(fields.date) || fields.date < today)) errors.date = ERROR_KEYS.date;
  if (!errors.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.time)) errors.time = ERROR_KEYS.time;
  if (!errors.details && CONTROL_CHARS.test(fields.details)) errors.details = ERROR_KEYS.details;
  if (!errors.source && fields.source && !['google', 'friend', 'passing', 'social', 'other'].includes(fields.source)) errors.source = ERROR_KEYS.source;
  return errors;
}
