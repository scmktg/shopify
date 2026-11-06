import Link from 'next/link';
import { clsx } from 'clsx';

/** Alternative commercial drinking fountains, matched to active Shopify products. */
const MODELS = [
  {
    handle: 'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
    label: 'Steel Bubbler',
    image: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/yl-600r-round-stainless-steel-drinking-fountain-water-bubbler-front-angle.png?v=1792231320',
  },
  {
    handle: 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
    label: 'Steel Bubbler + Tap',
    image: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/stainless-steel-fountain-bubbler-tap.png?v=1793009157',
  },
  {
    handle: 'commercial-rust-free-filtered-cold-water-bubbler-wm',
    label: 'HDPE Bubbler + Tap',
    image: 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/yl-600p-hdpe-drinking-fountain-water-bubbler-with-tap-front.png?v=1792231482',
  },
] as const;

export function BubblerModelSelector({ currentHandle }: { currentHandle: string }) {
  const selected = MODELS.find((model) => model.handle === currentHandle);
  if (!selected) return null;

  return (
    <fieldset className="mt-5">
      <legend className="w-full text-sm text-neutral-900">
        <span className="font-semibold">Available in 3 designs.</span>{' '}
        <span className="text-neutral-600">
          Currently viewing: <strong className="font-semibold text-neutral-900">{selected.label}</strong>
        </span>
      </legend>
      <div className="mt-2.5 grid max-w-[350px] grid-cols-3 gap-2">
        {MODELS.map((model) => {
          const active = model.handle === currentHandle;
          const className = clsx(
            'flex min-w-0 flex-col items-center gap-1 rounded-md border px-1 py-2 text-center transition-colors',
            active
              ? 'border-neutral-900 bg-neutral-50 ring-1 ring-inset ring-neutral-900'
              : 'border-neutral-200 bg-white hover:border-neutral-500 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
          );
          const body = (
            <>
              <span className="flex h-8 w-full items-center justify-center">
                <img src={model.image} alt="" width={36} height={36} loading="lazy" className="h-8 w-8 object-contain mix-blend-multiply" />
              </span>
              <span className={clsx('text-[11px] font-medium leading-tight', active ? 'text-neutral-950' : 'text-neutral-700')}>
                {model.label.includes(' + Tap') ? (
                  <>
                    {model.label.replace(' + Tap', '')}
                    <span className="block">+ Tap</span>
                  </>
                ) : model.label}
              </span>
            </>
          );
          return active ? (
            <span key={model.handle} aria-current="page" className={className}>{body}</span>
          ) : (
            <Link
              key={model.handle}
              href={`/bubblers-and-coolers/bubblers/${model.handle}`}
              aria-label={`View ${model.label} drinking fountain`}
              className={className}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </fieldset>
  );
}
