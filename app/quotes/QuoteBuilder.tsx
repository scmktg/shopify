'use client';

import { useState, type FormEvent } from 'react';
import { useCart } from '@/components/cart/CartProvider';

type Variant = { id: string; title: string; availableForSale: boolean; price: { amount: string; currencyCode: string } };
type Product = { id: string; title: string; handle: string; variants: Variant[] };
type Line = { id: string; name: string; variant: string; price: number; quantity: number };

const aud = (amount: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);

export function QuoteBuilder() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [organisation, setOrganisation] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, isReady } = useCart();

  const subtotal = lines.reduce((total, item) => total + item.price * item.quantity, 0);

  async function search(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await fetch('/api/quotes/products?q=' + encodeURIComponent(query.trim()));
      if (!response.ok) throw new Error('Search is temporarily unavailable.');
      const payload = await response.json() as { products: Product[] };
      setResults(payload.products);
    } catch {
      setError('Unable to search Shopify products. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function add(product: Product, variant: Variant) {
    const price = Number(variant.price.amount);
    if (!variant.availableForSale || variant.price.currencyCode !== 'AUD' || !Number.isFinite(price)) return;
    setAdded(false);
    setLines((current) => {
      const found = current.find((line) => line.id === variant.id);
      return found
        ? current.map((line) => line.id === variant.id ? { ...line, quantity: Math.min(line.quantity + 1, 99) } : line)
        : [...current, { id: variant.id, name: product.title, variant: variant.title, price, quantity: 1 }];
    });
  }

  async function addToCart() {
    setError('');
    setAdding(true);
    try {
      for (const line of lines) await addItem(line.id, line.quantity);
      setAdded(true);
    } catch {
      setError('Unable to add all items to your cart. Please review your cart before purchasing.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 text-zinc-950 md:py-20">
      <div className="mb-12 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Enviro Aqua / Business purchasing</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Formal quotations.</h1>
        <p className="mt-5 text-lg text-zinc-600">Prepare a product estimate for school, government or business purchasing approval. Our website prices apply equally to retail and trade customers.</p>
      </div>

      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950" role="status">
        <strong>Quotation portal preview.</strong> This page currently prepares a printable estimate and lets you add selected items to your Shopify cart. Official numbered quotations, email delivery, secure saved quote history and purchase-order submissions are not yet enabled. A printable estimate is not an issued formal quote.
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-8">
          <div className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">1. Select products</h2>
            <form onSubmit={search} className="mt-5 flex gap-3">
              <label htmlFor="quote-search" className="sr-only">Search products</label>
              <input id="quote-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bubblers, filters and more" maxLength={80} className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
              <button disabled={searching || query.trim().length < 2} className="rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-50">{searching ? 'Searching…' : 'Search'}</button>
            </form>
            <div className="mt-5 space-y-4" aria-live="polite">
              {results.length === 0 && !searching && <p className="text-sm text-zinc-500">Search the Enviro Aqua catalogue to select products and variants.</p>}
              {results.map((product) => (
                <div key={product.id} className="border-b border-zinc-100 pb-4">
                  <h3 className="font-medium">{product.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button key={variant.id} type="button" disabled={!variant.availableForSale || variant.price.currencyCode !== 'AUD'} onClick={() => add(product, variant)} className="rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm hover:border-black disabled:cursor-not-allowed disabled:opacity-40">
                        {variant.title === 'Default Title' ? 'Standard' : variant.title} · {aud(Number(variant.price.amount))} <span aria-hidden>+</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">2. Organisation details</h2>
            <p className="mt-2 text-sm text-zinc-500">These details are used only for the estimate shown in your browser. They are not saved or emailed.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">Organisation<input value={organisation} onChange={(e) => setOrganisation(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Contact name<input value={contact} onChange={(e) => setContact(e.target.value)} maxLength={100} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Delivery postcode<input value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} inputMode="numeric" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">3. Your estimate</h2>
            <p className="mt-2 text-sm text-zinc-500">Live Shopify catalogue prices. Final pricing, freight, tax and availability are confirmed at checkout.</p>
            <div className="mt-6 space-y-5">
              {lines.length === 0 && <p className="text-sm text-zinc-500">No products selected yet.</p>}
              {lines.map((line) => (
                <div key={line.id} className="border-b border-zinc-100 pb-4">
                  <p className="font-medium">{line.name}</p>
                  <p className="text-sm text-zinc-500">{line.variant}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={'Decrease quantity of ' + line.name} className="h-8 w-8 rounded-lg border border-zinc-300" onClick={() => setLines((list) => list.map((item) => item.id === line.id ? { ...item, quantity: item.quantity - 1 } : item).filter((item) => item.quantity > 0))}>−</button>
                      <span className="min-w-5 text-center">{line.quantity}</span>
                      <button type="button" aria-label={'Increase quantity of ' + line.name} className="h-8 w-8 rounded-lg border border-zinc-300" onClick={() => setLines((list) => list.map((item) => item.id === line.id ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item))}>+</button>
                    </div>
                    <span className="font-medium">{aud(line.price * line.quantity)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-zinc-200 pt-5 text-lg font-semibold"><span>Product total</span><span>{aud(subtotal)}</span></div>
              <p className="text-xs leading-5 text-zinc-500">Product prices are displayed as returned by Shopify. Freight and any tax adjustments are not calculated in this estimate. This draft is not a price guarantee.</p>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            <button onClick={addToCart} disabled={!lines.length || !isReady || adding} className="mt-6 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:opacity-40">{adding ? 'Adding items…' : 'Add items to shopping cart'}</button>
            {added && <p role="status" className="mt-3 text-sm text-emerald-700">Items added. Open your shopping cart to review and checkout.</p>}
            <p className="mt-5 text-xs text-zinc-500">Saved quotations and downloadable official PDFs will be available once the secure quotation service is connected.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
