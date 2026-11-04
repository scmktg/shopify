'use client';

import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CatalogFilterGroup,
  CatalogFilterState,
} from '@/lib/catalog/filters';

interface CatalogFiltersProps {
  groups: ReadonlyArray<CatalogFilterGroup>;
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  resultCount: number;
  hasMore?: boolean;
  disabled?: boolean;
}

function countActive(state: CatalogFilterState): number {
  return Object.values(state).reduce((sum, values) => sum + values.length, 0);
}

function updateGroup(
  state: CatalogFilterState,
  group: CatalogFilterGroup,
  optionValue: string,
): CatalogFilterState {
  const current = state[group.id] ?? [];
  const selected = current.includes(optionValue);

  if (!group.multiple) {
    if (selected) {
      const next = { ...state };
      delete next[group.id];
      return next;
    }
    return { ...state, [group.id]: [optionValue] };
  }

  const nextValues = selected
    ? current.filter((value) => value !== optionValue)
    : [...current, optionValue];

  if (nextValues.length === 0) {
    const next = { ...state };
    delete next[group.id];
    return next;
  }

  return { ...state, [group.id]: nextValues };
}

function FilterGroups({
  groups,
  value,
  onChange,
  disabled,
}: Pick<CatalogFiltersProps, 'groups' | 'value' | 'onChange' | 'disabled'>) {
  return (
    <div className="divide-y divide-gray-100">
      {groups.map((group) => {
        const selectedCount = (value[group.id] ?? []).length;
        return (
          <details
            key={group.id}
            className="group/filter py-1"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-gray-900 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                {group.label}
                {selectedCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-100 px-1 text-[11px] font-semibold text-sky-800">
                    {selectedCount}
                  </span>
                )}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-open/filter:rotate-180" aria-hidden="true" />
            </summary>
            <div className="space-y-1 pb-4">
              {group.options.map((option) => {
                const checked = (value[group.id] ?? []).includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${checked ? 'bg-sky-50 font-medium text-sky-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <input
                      type={group.multiple ? 'checkbox' : 'radio'}
                      name={group.multiple ? undefined : group.id}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onChange(updateGroup(value, group, option.value))}
                      className="h-4 w-4 shrink-0 accent-sky-700"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
              {selectedCount > 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const next = { ...value };
                    delete next[group.id];
                    onChange(next);
                  }}
                  className="mt-2 px-3 text-xs font-medium text-sky-800 hover:underline disabled:opacity-50"
                >
                  Clear {group.label.toLowerCase()}
                </button>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function CatalogFilters({
  groups,
  value,
  onChange,
  resultCount,
  hasMore = false,
  disabled = false,
}: CatalogFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = useMemo(() => countActive(value), [value]);

  const clearAll = () => onChange({});

  if (groups.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        disabled={disabled}
        aria-expanded={mobileOpen}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 disabled:opacity-60"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-100 px-1 text-xs text-sky-800">
            {activeCount}
          </span>
        )}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="absolute inset-y-0 right-0 flex w-[min(94vw,420px)] flex-col bg-white shadow-2xl"
          >
            <header className="flex min-h-20 flex-none items-center justify-between border-b border-gray-100 px-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Refine results</h2>
                <p className="text-xs text-black/55">
                  {resultCount}{hasMore ? '+' : ''} {resultCount === 1 && !hasMore ? 'product' : 'products'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <FilterGroups
                groups={groups}
                value={value}
                onChange={onChange}
                disabled={disabled}
              />
            </div>

            <footer className="flex-none border-t border-gray-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={activeCount === 0 || disabled}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue-hover"
                >
                  Show {resultCount}{hasMore ? '+' : ''}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

interface ActiveFilterChipsProps {
  groups: ReadonlyArray<CatalogFilterGroup>;
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  disabled?: boolean;
}

export function ActiveFilterChips({
  groups,
  value,
  onChange,
  disabled = false,
}: ActiveFilterChipsProps) {
  const chips = groups.flatMap((group) =>
    (value[group.id] ?? []).map((selected) => {
      const option = group.options.find((candidate) => candidate.value === selected);
      return option ? { group, option } : null;
    }),
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map(({ group, option }) => (
        <button
          key={`${group.id}:${option.value}`}
          type="button"
          disabled={disabled}
          onClick={() => onChange(updateGroup(value, group, option.value))}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-60"
        >
          {option.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
