/** Shared navigation styling for all three drinking fountain models. */
export const FOUNTAIN_TAB_LIST_CLASS =
  'flex w-full items-center justify-center gap-8 overflow-x-auto border-b border-black/10 sm:gap-16';

export function fountainTabClass(active: boolean): string {
  return `relative min-h-14 shrink-0 px-1 py-4 text-center text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue sm:flex-none sm:px-0 ${active
    ? 'text-black after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:bg-black'
    : 'text-black/50 hover:text-black'}`;
}
