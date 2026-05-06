'use client';

import { useEffect, useState } from 'react';
import { ORDER_CUTOFF } from '@/lib/site-config';

/**
 * Live "Order in Xh Ym for same-day dispatch" countdown.
 *
 * Server-rendered output is intentionally a neutral placeholder
 * ("Order today for fast dispatch") so initial HTML matches across
 * timezones; the real time-aware copy hydrates on mount and refreshes
 * every minute. The cutoff is locked to Australia/Sydney regardless of
 * the visitor's clock.
 */
export function DispatchCountdown() {
  const [copy, setCopy] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCopy(buildDispatchCopy(new Date()));
    tick();
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span>{copy ?? 'Order today for fast dispatch'}</span>;
}

function buildDispatchCopy(now: Date): string {
  const sydney = sydneyParts(now);
  const isWeekend = sydney.weekday === 0 || sydney.weekday === 6;

  if (isWeekend) return 'Order today, dispatched Monday';

  const beforeCutoff =
    sydney.hour < ORDER_CUTOFF.hour ||
    (sydney.hour === ORDER_CUTOFF.hour && sydney.minute < ORDER_CUTOFF.minute);

  if (!beforeCutoff) return 'Order today, dispatched next business day';

  const cutoffMinutesFromMidnight =
    ORDER_CUTOFF.hour * 60 + ORDER_CUTOFF.minute;
  const nowMinutesFromMidnight = sydney.hour * 60 + sydney.minute;
  const totalMinutes = cutoffMinutesFromMidnight - nowMinutesFromMidnight;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const remaining =
    hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(minutes, 1)}m`;
  return `Order in the next ${remaining} for same-day dispatch`;
}

interface SydneyParts {
  weekday: number;
  hour: number;
  minute: number;
}

/**
 * Pull weekday / hour / minute as observed in Australia/Sydney. Using
 * Intl.DateTimeFormat with weekday + hour12:false gives a locale that
 * respects DST without us hand-rolling offset math.
 */
function sydneyParts(now: Date): SydneyParts {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: ORDER_CUTOFF.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekdayShort = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourValue = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minuteValue = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return {
    weekday: WEEKDAY_INDEX[weekdayShort] ?? 1,
    hour: Number.parseInt(hourValue, 10) % 24,
    minute: Number.parseInt(minuteValue, 10),
  };
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};
