'use client';

import { Filter, X } from 'lucide-react';
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
}: Omit<CatalogFiltersProps, 'resultCount'>) {
  return (
    <div className="divide-y divide-gray-200">
      {groups.map((group) => (
        <fieldset key={group.id} className="py-5 first:pt-0">
          <legend className="text-sm font-semibold text-black">
            {group.label}
          </legend>
          <div className="mt-3 space-y-2.5">
            {group.options.map((option) => {
              const checked = (value[group.id] ?? []).includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-2.5 text-sm text-black/80"
                >
                  <input
                    type={group.multiple ? 'checkbox' : 'radio'}
                    name={group.multiple ? undefined : group.id}
                    checked={checked}
                    disabled={disabled}
                    onChange={() =>
                      onChange(updateGroup(value, group, option.value))
                    }
                    className="mt-0.5 h-4 w-4 accent-black"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function CatalogFilters({
  groups,
  value,
  onChange,
  resultCount,
  disabled = false,
}: CatalogFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = useMemo(() => countActive(value), [value]);

  const clearAll = () => onChange({});

  if (groups.length === 0) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-black hover:border-black"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[11px] text-white">
              {activeCount}
            </span>
          )}
        </button>
        <span className="text-xs tabular-nums text-black/60">
          {resultCount} {resultCount === 1 ? 'product' : 'products'}
        </span>
      </div>

      <aside className="hidden lg:block lg:w-60 lg:flex-none">
        <div className="sticky top-28 rounded border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-black">Filter</h2>
              <p className="mt-0.5 text-xs text-black/55">
                {resultCount} {resultCount === 1 ? 'product' : 'products'}
              </p>
            </div>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                disabled={disabled}
                className="text-xs font-medium text-brand-blue hover:underline disabled:opacity-50"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterGroups
            groups={groups}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
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
            className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-white shadow-xl"
          >
            <header className="flex h-16 flex-none items-center justify-between border-b border-gray-200 px-4">
              <div>
                <h2 className="text-base font-semibold text-black">Filters</h2>
                <p className="text-xs text-black/55">
                  {resultCount} {resultCount === 1 ? 'product' : 'products'}
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
                  className="rounded border border-black px-4 py-3 text-sm font-semibold text-black disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded bg-brand-blue px-4 py-3 text-sm font-semibold text-white hover:bg-brand-blue-hover"
                >
                  Show {resultCount}
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
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map(({ group, option }) => (
        <button
          key={`${group.id}:${option.value}`}
          type="button"
          disabled={disabled}
          onClick={() => onChange(updateGroup(value, group, option.value))}
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {option.label}
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
