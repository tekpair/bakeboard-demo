// New York is the legacy demo default. Callers pass the saved workspace zone.
// Calendar arithmetic uses date keys, never 24-hour increments across DST changes.
export const productionTimeZone = 'America/New_York';

function wallParts(
  value: string | number | Date,
  timeZone = productionTimeZone,
) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)!.value;
  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    hour: part('hour'),
    minute: part('minute'),
  };
}
export function productionDay(
  value: string | number | Date,
  timeZone = productionTimeZone,
) {
  const parts = wallParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function productionDateTimeInput(
  value: string | number | Date,
  timeZone = productionTimeZone,
) {
  const parts = wallParts(value, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
export function productionTime(
  value: string | number | Date,
  timeZone = productionTimeZone,
  timeFormat: '12h' | '24h' = '12h',
) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: timeFormat === '24h' ? 'h23' : 'h12',
  }).format(new Date(value));
}
export function isDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function addCalendarDays(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function addCalendarMonths(key: string, months: number) {
  const date = new Date(`${key}T12:00:00Z`);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.toISOString().slice(0, 10);
}
export function formatCalendarDate(
  key: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(undefined, {
    ...options,
    timeZone: 'UTC',
  }).format(new Date(`${key}T12:00:00Z`));
}
export function calendarWeek(key: string, weekStartsOn: 0 | 1 = 1) {
  const day = new Date(`${key}T12:00:00Z`).getUTCDay();
  const monday = addCalendarDays(key, -((day - weekStartsOn + 7) % 7));
  return Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(monday, index),
  );
}
export function calendarMonth(key: string, weekStartsOn: 0 | 1 = 1) {
  const first = `${key.slice(0, 7)}-01`;
  const last = addCalendarDays(addCalendarMonths(first, 1), -1);
  const start = calendarWeek(first, weekStartsOn)[0];
  const count =
    Math.ceil(
      ((Date.parse(`${last}T12:00Z`) - Date.parse(`${start}T12:00Z`)) /
        86_400_000 +
        1) /
        7,
    ) * 7;
  return Array.from({ length: count }, (_, index) =>
    addCalendarDays(start, index),
  );
}

// Resolve a bakery-local datetime to an instant. A spring-forward gap is invalid;
// a repeated fall-back hour resolves to its first occurrence. Existing unchanged
// timestamps are preserved by the task form, including their original offset.
export function parseProductionDateTime(
  value: string,
  original?: string,
  timeZone = productionTimeZone,
): Date | null {
  if (original && productionDateTimeInput(original, timeZone) === value)
    return new Date(original);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ||
    !isDateKey(value.slice(0, 10))
  )
    return null;
  const naive = Date.parse(`${value}:00Z`);
  if (!Number.isFinite(naive)) return null;
  const candidates = [-86_400_000, 0, 86_400_000]
    .map((shift) => {
      const instant = naive + shift;
      const wall = productionDateTimeInput(instant, timeZone);
      const offset = Date.parse(`${wall}:00Z`) - instant;
      return naive - offset;
    })
    .filter((instant) => productionDateTimeInput(instant, timeZone) === value);
  return candidates.length ? new Date(Math.min(...candidates)) : null;
}
