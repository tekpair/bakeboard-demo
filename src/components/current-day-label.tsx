'use client';

import { useEffect, useState } from 'react';
import { useWorkspacePreferences } from './demo-session';
import { formatCalendarDate } from '@/lib/production-dates';
import { Clock3 } from 'lucide-react';

function greetingFor(date: Date, timeZone: string) {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h23',
    }).format(date),
  );
  if (hour < 5 || hour >= 22) return 'Goodnight';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function CurrentDayLabel({
  greetingName,
  date,
}: {
  greetingName?: string;
  date?: string;
}) {
  const preferences = useWorkspacePreferences();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  const day = date
    ? formatCalendarDate(date, options)
    : new Intl.DateTimeFormat(undefined, {
        ...options,
        timeZone: preferences.timeZone,
      }).format(now);

  return (
    <>
      <p className="date-label">
        <Clock3 size={14} aria-hidden="true" />
        <time dateTime={date ?? now.toISOString()} suppressHydrationWarning>
          {day}
        </time>
      </p>
      {greetingName && (
        <h1 suppressHydrationWarning>
          {greetingFor(now, preferences.timeZone)}, {greetingName}
        </h1>
      )}
    </>
  );
}
