import type { Workspace, WorkspaceSettings } from './types';
import { defaultAppearance, appearanceErrors } from './workspace-theme';
import { productionTimeZone } from './production-dates';

export const maxBakeryNameLength = 25;
export const deadlineWarningOptions = [15, 30, 60, 120] as const;
export const maxLogoDataLength = 450_000;
export function workspaceIdForName(name: string) {
  const words = name.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  if (words.length > 1 && words.at(-1) === 'bakery') words.pop();
  const slug = words.join('-');
  return `ws-${slug || 'bakery'}`;
}
export function workspaceInitials(name: string) {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  return (
    words.length > 1
      ? words
          .slice(0, 2)
          .map((word) => Array.from(word)[0])
          .join('')
      : Array.from(words[0] ?? 'B')
          .slice(0, 2)
          .join('')
  ).toUpperCase();
}
export function defaultWorkspaceSettings(
  workspace: Workspace,
): WorkspaceSettings {
  return {
    ...workspace,
    initials: workspaceInitials(workspace.name),
    businessEmail: '',
    businessPhone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    },
    timeZone: productionTimeZone,
    timeFormat: '12h',
    weekStartsOn: 1,
    defaultCalendarView: 'month',
    defaultPriority: 'Normal',
    warningMinutes: 60,
    appearance: { ...defaultAppearance },
    reminders: {
      enabled: false,
      timingMinutes: 60,
      types: { upcoming: true, deadline: true, overdue: false },
      recipients: { assigned: true, owner: false },
    },
  };
}
export function validTimeZone(zone: string) {
  if (typeof zone !== 'string' || (zone !== 'UTC' && !zone.includes('/')))
    return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(0);
    return true;
  } catch {
    return false;
  }
}
export function validLogoData(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= maxLogoDataLength &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)
  );
}
export function validateWorkspaceSettings(
  value: WorkspaceSettings,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    value.name.trim().length > maxBakeryNameLength
  )
    errors.name = 'Enter a bakery name (up to 25 characters).';
  if (
    typeof value.businessEmail !== 'string' ||
    (value.businessEmail &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.businessEmail) ||
        value.businessEmail.length > 254))
  )
    errors.businessEmail = 'Enter a valid business email.';
  if (
    typeof value.businessPhone !== 'string' ||
    (value.businessPhone &&
      (!/^[\d+().\s\-#ext]+$/i.test(value.businessPhone) ||
        value.businessPhone.replace(/\D/g, '').length < 6 ||
        value.businessPhone.replace(/\D/g, '').length > 20 ||
        value.businessPhone.length > 40))
  )
    errors.businessPhone =
      'Enter a valid phone number, including country code if needed.';
  for (const key of [
    'line1',
    'line2',
    'city',
    'region',
    'postalCode',
    'country',
  ] as const) {
    const field = value.address?.[key];
    if (typeof field !== 'string' || field.length > 160)
      errors[`address.${key}`] = 'Use up to 160 characters.';
  }
  if (!validTimeZone(value.timeZone))
    errors.timeZone = 'Choose a valid IANA time zone.';
  if (!['12h', '24h'].includes(value.timeFormat))
    errors.timeFormat = 'Choose a time format.';
  if (![0, 1].includes(value.weekStartsOn))
    errors.weekStartsOn = 'Choose Sunday or Monday.';
  if (!['day', 'week', 'month'].includes(value.defaultCalendarView))
    errors.defaultCalendarView = 'Choose a calendar view.';
  if (!['Low', 'Normal', 'High'].includes(value.defaultPriority))
    errors.defaultPriority = 'Choose a task priority.';
  if (
    !(deadlineWarningOptions as readonly number[]).includes(
      value.warningMinutes,
    )
  )
    errors.warningMinutes = 'Choose a warning threshold.';
  if (value.logoDataUrl && !validLogoData(value.logoDataUrl))
    errors.logoDataUrl = 'Choose a valid PNG, JPEG or WebP logo.';
  Object.assign(errors, appearanceErrors(value.appearance));
  Object.assign(errors, reminderErrors(value.reminders));
  return errors;
}

export function reminderErrors(
  value: WorkspaceSettings['reminders'],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (
    !value ||
    typeof value.enabled !== 'boolean' ||
    !value.types ||
    !value.recipients ||
    [
      value.types.upcoming,
      value.types.deadline,
      value.types.overdue,
      value.recipients.assigned,
      value.recipients.owner,
    ].some((flag) => typeof flag !== 'boolean')
  )
    return { reminders: 'Choose valid reminder preferences.' };
  if (![15, 30, 60, 120, 1440].includes(value.timingMinutes))
    errors['reminders.timingMinutes'] = 'Choose a supported reminder timing.';
  if (value.enabled && !Object.values(value.types).some(Boolean))
    errors['reminders.types'] = 'Select at least one reminder type.';
  if (value.enabled && !Object.values(value.recipients).some(Boolean))
    errors['reminders.recipients'] = 'Select at least one recipient.';
  return errors;
}
