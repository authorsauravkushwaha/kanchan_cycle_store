import type { TranslationKey } from '../i18n';
export interface RepairFields { name: string; phone: string; bikeType: string; service: string; date: string; time: string; details: string; source: string }
export const emptyRepair: RepairFields = { name: '', phone: '', bikeType: '', service: '', date: '', time: '', details: '', source: '' };
export function localToday(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/[\s()\-]/g, '');
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
export function validateRepair(fields: RepairFields, today = localToday()): Partial<Record<keyof RepairFields, TranslationKey>> {
  const errors: Partial<Record<keyof RepairFields, TranslationKey>> = {};
  if (Array.from(fields.name.trim()).length < 2 || fields.name.length > 100) errors.name = 'form.errorName';
  const phone = normalizePhone(fields.phone);
  if (!/^\+?[1-9]\d{9,14}$/.test(phone)) errors.phone = 'form.errorPhone';
  if (!fields.bikeType) errors.bikeType = 'form.errorBike';
  if (!fields.service) errors.service = 'form.errorService';
  if (!validDate(fields.date) || fields.date < today) errors.date = 'form.errorDate';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(fields.time)) errors.time = 'form.errorTime';
  return errors;
}
