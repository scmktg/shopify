'use client';

import { useState, type FormEvent } from 'react';

type Variant = { id: string; title: string; availableForSale: boolean; price: { amount: string; currencyCode: string } };
type Product = { id: string; title: string; handle: string; variants: Variant[] };
type Line = { id: string; handle: string; name: string; variant: string; price: number; quantity: number };
type SavedItem = { name: string; variant: string; quantity: number; unit_price_cents: number };
type Quote = { reference: string; organisation: string; contact_name: string; postcode: string; items: SavedItem[]; product_total_cents: number; status: string; created_at: string; expires_at: string; freight_status: string };
const aud = (n: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

export function QuoteBuilder() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [organisation, setOrganisation] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [postcode, setPostcode] = useState('');
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [issued, setIssued] = useState('');
  const [history, setHistory] = useState<Quote[] | null>(null);
  const total = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  async function findProducts(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await fetch('/api/quotes/products?q=' + encodeURIComponent(query.trim()), { cache: 'no-store' });
      if (!response.ok) throw Error();
      const data = await response.json() as { products: Product[] };
      setProducts(data.products);
    } catch { setError('Product search is currently unavailable.'); }
    finally { setSearching(false); }
  }

  function add(product: Product, variant: Variant) {
    const price = Number(variant.price.amount);
    if (!variant.availableForSale || variant.price.currencyCode !== 'AUD' || !Number.isFinite(price)) return;
    setLines((current) => {
      const found = current.find(l => l.id === variant.id);
      return found ? current.map(l => l.id === variant.id ? { ...l, quantity: Math.min(l.quantity + 1, 99) } : l)
        : [...current, { id: variant.id, handle: product.handle, name: product.title, variant: variant.title, price, quantity: 1 }];
    });
  }

  async function issue(event: FormEvent) {
    event.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisation, contact_name: contact, email, postcode,
          items: lines.map(l => ({ handle: l.handle, variant_id: l.id, quantity: l.quantity })),
        }),
      });
      const data = await response.json() as { reference?: string; error?: string; delivery?: string };
      if (!response.ok && response.status !== 202) throw Error(data.error || 'Could not issue quotation.');
      if (!data.reference) throw Error('Could not issue quotation.');
      setIssued(data.reference);
      setNotice(data.delivery === 'sent'
        ? 'Your official quotation has been issued and its reference emailed to you.'
        : 'Your quotation was saved but email delivery could not be confirmed. Contact us with your reference.');
      setHistory(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not issue quotation.'); }
    finally { setBusy(false); }
  }

  async function sendLogin(event: FormEvent) {
    event.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      const response = await fetch('/api/quotes/auth/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw Error('Unable to send verification email.');
      setNotice('If your address is valid, a secure sign-in link will arrive shortly. Check your inbox.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to send verification email.'); }
    finally { setBusy(false); }
  }

  async function loadHistory() {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/quotes/history', { cache: 'no-store' });
      if (response.status === 401) throw Error('Please verify your email address to access your saved quotations.');
      if (!response.ok) throw Error('Unable to retrieve quotation history.');
      const data = await response.json() as { quotes: Quote[] };
      setHistory(data.quotes);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to retrieve quotations.'); }
    finally { setBusy(false); }
  }

  async function checkout(reference: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/quotes/' + encodeURIComponent(reference) + '/checkout', { method: 'POST' });
      const data = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !data.checkoutUrl) throw Error(data.error || 'Unable to start checkout.');
      // Checkout always remains with Shopify; do not mark purchased until webhook confirmation.
      window.location.assign(data.checkoutUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start checkout.'); setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 text-zinc-950 md:py-20">
      <div className="mb-11 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Enviro Aqua / Business purchasing</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Formal quotations.</h1>
        <p className="mt-5 text-lg text-zinc-600">Create an official quotation for your school, organisation or business. One advertised price for retail and trade.</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">01 / Find your products</h2>
            <form onSubmit={findProducts} className="mt-5 flex gap-3">
              <label htmlFor="quote-search" className="sr-only">Find a product</label>
              <input id="quote-search" value={query} onChange={e => setQuery(e.target.value)} maxLength={80} placeholder="Search bubblers, filters and more" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 focus:border-black" />
              <button disabled={searching || query.trim().length < 2} className="rounded-xl bg-black px-5 py-3 font-medium text-white disabled:opacity-40">{searching ? 'Searching…' : 'Search'}</button>
            </form>
            <div className="mt-5 space-y-4" aria-live="polite">
              {products.length === 0 && <p className="text-sm text-zinc-500">Search our catalogue to add products and variants.</p>}
              {products.map(product => <div key={product.id} className="border-b border-zinc-100 pb-4">
                <p className="font-medium">{product.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">{product.variants.map(variant =>
                  <button type="button" key={variant.id} disabled={!variant.availableForSale || variant.price.currencyCode !== 'AUD'} onClick={() => add(product, variant)}
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-sm hover:border-black disabled:opacity-40">
                    {variant.title === 'Default Title' ? 'Standard' : variant.title} · {aud(Number(variant.price.amount))} +
                  </button>)}
                </div>
              </div>)}
            </div>
          </section>
          <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">02 / Customer information</h2>
            <p className="mt-2 text-sm text-zinc-500">We use these details to prepare your quote and securely identify your records.</p>
            <form id="quote-issue-form" onSubmit={issue} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">Organisation name *<input required value={organisation} onChange={e => setOrganisation(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Contact name *<input required value={contact} onChange={e => setContact(e.target.value)} maxLength={100} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Email address *<input required type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={160} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
              <label className="text-sm">Delivery postcode *<input required value={postcode} onChange={e => setPostcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} minLength={4} maxLength={4} inputMode="numeric" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
            </form>
          </section>
          <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">03 / My quotations</h2>
            <p className="mt-2 text-sm text-zinc-500">Verify your email to view your saved quotations, download PDFs and convert an active quote to a Shopify checkout.</p>
            <form onSubmit={sendLogin} className="mt-5 flex flex-wrap gap-3">
              <label htmlFor="quote-login" className="sr-only">Email to access quotations</label>
              <input id="quote-login" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3" />
              <button disabled={busy} className="rounded-xl border border-zinc-900 px-5 py-3 font-medium disabled:opacity-40">Email secure link</button>
            </form>
            <button type="button" onClick={loadHistory} disabled={busy} className="mt-4 text-sm font-medium underline underline-offset-4 disabled:opacity-40">View my saved quotations →</button>
            {history && <div className="mt-5 space-y-4">
              {history.length === 0 && <p className="text-sm text-zinc-500">No quotations associated with this verified email.</p>}
              {history.map(quote => <article key={quote.reference} className="rounded-xl border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="font-semibold">{quote.reference}</p><p className="text-sm text-zinc-500">{quote.organisation} · {new Date(quote.created_at).toLocaleDateString('en-AU')}</p></div>
                  <p className="font-semibold">{aud(quote.product_total_cents / 100)}</p>
                </div>
                <p className="mt-2 text-xs text-zinc-500">Status: {quote.status.replaceAll('_', ' ')} · Valid until {new Date(quote.expires_at).toLocaleDateString('en-AU')} · Freight pending</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                  <a className="underline underline-offset-4" href={'/api/quotes/' + encodeURIComponent(quote.reference) + '/pdf'}>Download PDF</a>
                  {quote.status !== 'purchased' && quote.status !== 'cancelled' && Date.parse(quote.expires_at) > Date.now() &&
                    <button type="button" onClick={() => checkout(quote.reference)} disabled={busy} className="underline underline-offset-4 disabled:opacity-40">Proceed to checkout →</button>}
                </div>
              </article>)}
            </div>}
          </section>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold">Your quotation</h2>
            <p className="mt-2 text-sm text-zinc-500">Selected product prices. Freight will be confirmed separately at checkout.</p>
            <div className="mt-6 space-y-5">
              {lines.length === 0 && <p className="text-sm text-zinc-500">Add a product to get started.</p>}
              {lines.map(line => <div key={line.id} className="border-b border-zinc-100 pb-4">
                <p className="font-medium">{line.name}</p><p className="text-sm text-zinc-500">{line.variant}</p>
                <div className="mt-3 flex items-center justify-between gap-3"><div className="flex items-center gap-3">
                  <button type="button" aria-label={'Decrease ' + line.name} onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: l.quantity - 1 } : l).filter(l => l.quantity > 0))} className="h-8 w-8 rounded-lg border border-zinc-300">−</button>
                  <span>{line.quantity}</span>
                  <button type="button" aria-label={'Increase ' + line.name} onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l))} className="h-8 w-8 rounded-lg border border-zinc-300">+</button>
                </div><span className="font-semibold">{aud(line.price * line.quantity)}</span></div>
              </div>)}
              <div className="flex justify-between border-t border-zinc-200 pt-5 text-lg font-semibold"><span>Product subtotal</span><span>{aud(total)}</span></div>
              <p className="text-xs leading-relaxed text-zinc-500">Prices are revalidated when a quote is issued. Freight and any final tax adjustments are confirmed at checkout. Quotation validity: 14 days. A quotation is not an invoice.</p>
            </div>
            <button type="submit" form="quote-issue-form" disabled={!lines.length || busy || Boolean(issued)} className="mt-6 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:opacity-40">
              {busy ? 'Please wait…' : issued ? 'Quotation issued' : 'Issue formal quotation'}
            </button>
            {issued && <div className="mt-4 rounded-xl bg-zinc-100 p-4 text-sm">
              <p className="font-semibold">{issued}</p>
              <p className="mt-2">For secure PDF download and online checkout, verify your email in the My quotations section.</p>
              <button type="button" onClick={() => { setIssued(''); setLines([]); setNotice(''); }} className="mt-3 underline underline-offset-4">Start another quotation</button>
            </div>}
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="mt-4 text-sm text-zinc-700">{notice}</p>}
          </section>
        </aside>
      </div>
    </main>
  );
}
