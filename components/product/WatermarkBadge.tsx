import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { WatermarkStatus } from '@/types/product';

type Tone = 'positive' | 'neutral' | 'warning' | 'negative';

interface BadgeState {
  label: string;
  tone: Tone;
  icon: LucideIcon | null;
}

const STATE: Record<WatermarkStatus, BadgeState> = {
  certified: {
    label: 'WaterMark Certified',
    tone: 'positive',
    icon: ShieldCheck,
  },
  pending: {
    label: 'WaterMark Certification Pending',
    tone: 'warning',
    icon: ShieldAlert,
  },
  not_required: {
    label: 'WaterMark not required',
    tone: 'neutral',
    icon: null,
  },
  not_certified: {
    label: 'Not WaterMark certified — for off-mains use only',
    tone: 'negative',
    icon: ShieldX,
  },
};

const TONE_CLASS: Record<Tone, string> = {
  // Brand-blue tint for the compliance-positive case.
  positive: 'bg-brand-blue-light text-brand-blue border-brand-blue/30',
  // Gray for the unconcerned 'not required' case.
  neutral: 'bg-gray-50 text-black/70 border-gray-200',
  // Amber for in-progress certification — a justified deviation
  // from the white/black/blue palette per docs/05 because compliance
  // signalling needs an unmistakable visual cue.
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  // Red for the explicit-warning case (off-mains only).
  negative: 'bg-red-50 text-red-900 border-red-200',
};

interface WatermarkBadgeProps {
  status: WatermarkStatus;
  className?: string;
}

export function WatermarkBadge({ status, className }: WatermarkBadgeProps) {
  const state = STATE[status];
  const Icon = state.icon;
  return (
    <div
      role="status"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-semibold ${TONE_CLASS[state.tone]} ${className ?? ''}`}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span>{state.label}</span>
    </div>
  );
}
