import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  change?: { text: string; direction: 'up' | 'down' | 'flat' };
  changeContext?: string;
}

export function StatCard({ label, value, sublabel, change, changeContext }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-black">{value}</p>
      {sublabel ? (
        <p className="mt-1 text-xs text-gray-500">{sublabel}</p>
      ) : null}
      {change ? (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <ChangeIcon direction={change.direction} />
          <span className={changeColour(change.direction)}>{change.text}</span>
          {changeContext ? (
            <span className="text-gray-500">{changeContext}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ChangeIcon({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') return <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />;
  if (direction === 'down') return <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-gray-500" />;
}

function changeColour(direction: 'up' | 'down' | 'flat'): string {
  if (direction === 'up') return 'text-green-700 font-medium';
  if (direction === 'down') return 'text-red-700 font-medium';
  return 'text-gray-700';
}
