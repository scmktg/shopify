'use client';

import { Clock3, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ORDER_CUTOFF, ORDER_CUTOFF_DISPLAY } from '@/lib/site-config';

interface DispatchState {
  headline: string;
  detail: string;
  urgent: boolean;
}

/**
 * Prominent, time-aware dispatch incentive shown immediately below
 * the primary buy controls. The countdown is based on Australia/Sydney
 * so it remains accurate for the Wyong dispatch cutoff regardless of
 * the shopper's own device timezone.
 */
export function DispatchCountdown() {
  const [state, setState] = useState<DispatchState | null>(null);

  useEffect(() => {
    const tick = () => setState(buildDispatchState(new Date()));
    tick();
    const id = window.setInterval(tick, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const current =
    state ?? {
      headline: `Order before ${ORDER_CUTOFF_DISPLAY}`,
      detail: 'for same-day dispatch from Wyong NSW',
      urgent: false,
    };

  return (
    <div
      className={
        current.urgent
          ? 'mt-3 rounded-lg border border-brand-blue/30 bg-brand-blue-light px-4 py-3'
          : 'mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'
      }
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={
            current.urgent
              ? 'mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white text-brand-blue shadow-sm'
              : 'mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white text-black/60'
          }
        >
          {current.urgent ? (
            <Clock3 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Truck className="h-4 w-4" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-black">
            {current.headline}
          </p>
          <p className="mt-0.5 text-xs text-black/65">{current.detail}</p>
        </div>

        {current.urgent && (
          <span className="ml-auto flex-none rounded-full bg-brand-blue px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Ships today
          </span>
        )}
      </div>
    </div>
  );
}

function buildDispatchState(now: Date): DispatchState {
  const sydney = sydneyParts(now);
  const isSaturday = sydney.weekday === 6;
  const isSunday = sydney.weekday === 0;

  if (isSaturday || isSunday) {
    return {
      headline: 'Order now for Monday dispatch',
      detail: 'Your order will be queued for the next business-day dispatch from Wyong NSW.',
      urgent: false,
    };
  }

  const beforeCutoff =
    sydney.hour < ORDER_CUTOFF.hour ||
    (sydney.hour === ORDER_CUTOFF.hour && sydney.minute < ORDER_CUTOFF.minute);

  if (!beforeCutoff) {
    return {
      headline: 'Order now for next-business-day dispatch',
      detail: `Same-day dispatch cutoff is ${ORDER_CUTOFF_DISPLAY} AEST/AEDT from Wyong NSW.`,
      urgent: false,
    };
  }

  const cutoffMinutesFromMidnight =
    ORDER_CUTOFF.hour * 60 + ORDER_CUTOFF.minute;
  const nowMinutesFromMidnight = sydney.hour * 60 + sydney.minute;
  const totalMinutes = cutoffMinutesFromMidnight - nowMinutesFromMidnight;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const remaining =
    hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(minutes, 1)}m`;

  return {
    headline: `Order within ${remaining}`,
    detail: 'Complete your order before the cutoff for same-day dispatch from Wyong NSW.',
    urgent: true,
  };
}

interface SydneyParts {
  weekday: number;
  hour: number;
  minute: number;
}

function sydneyParts(now: Date): SydneyParts {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: ORDER_CUTOFF.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekdayShort = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const hourValue = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minuteValue = parts.find((part) => part.type === 'minute')?.value ?? '00';

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
