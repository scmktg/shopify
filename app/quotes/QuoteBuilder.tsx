'use client';

import { useEffect, useState, type FormEvent } from 'react';

type Variant = { id: string; title: string; availableForSale: boolean; price: { amount: string; currencyCode: string } };
type Product = { id: string; title: string; handle: string; variants: Variant[] };
type Line = { id: string; handle: string; name: string; variant: string; price: number; quantity: number };
type SavedItem = { name: string; variant: string; quantity: number; unit_price_cents: number };
type Quote = { reference: string; organisation: string; contact_name: string; postcode: string; items: SavedItem[]; product_total_cents: number; status: string; created_at: string; expires_at: string; freight_status: string };
const aud = (n: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n);

export function QuoteBuilder() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [poNumber, setPoNumber] = useState('');
  const [poFor, setPoFor] = useState('');
  const [history, setHistory] = useState<Quote[] | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const total = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setProducts([]); setSearching(false); setError(''); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch('/api/quotes/products?q=' + encodeURIComponent(term), {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json() as { products: Product[] };
        if (!controller.signal.aborted) { setProducts(data.products); setError(''); }
      } catch {
        if (!controller.signal.aborted) { setProducts([]); setError('Product search is temporarily unavailable.'); }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

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
      setStep(3);
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

  async function submitPO(reference: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/quotes/' + encodeURIComponent(reference) + '/purchase-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po_number: poNumber }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw Error(data.error || 'Unable to submit purchase order.');
      setNotice('Your purchase order reference has been submitted for review. Invoice terms are subject to Enviro Aqua approval.');
      setPoFor(''); setPoNumber('');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to submit purchase order.'); }
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
    <div className="mx-auto max-w-6xl px-5 py-12 text-zinc-950 md:py-20">
      <div className="mb-11 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Enviro Aqua / Business purchasing</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Formal quotations.</h1>
        <p className="mt-5 text-lg text-zinc-600">Create an official quotation for your school, organisation or business. One advertised price for retail and trade.</p>
      </div>
      <nav aria-label="Quote steps" className="mb-8 grid grid-cols-3 gap-2">
        {(['Select products', 'Your details', 'Download / email'] as const).map((label, index) => {
          const number = (index + 1) as 1 | 2 | 3;
          const accessible = number === 1 || (number === 2 && lines.length > 0) || (number === 3 && Boolean(issued));
          return <button key={label} type="button" disabled={!accessible} aria-current={step === number ? 'step' : undefined}
            onClick={() => setStep(number)}
            className={['rounded-xl border px-2 py-4 text-left text-xs font-medium sm:px-5 sm:text-sm', step === number ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-500', !accessible ? 'opacity-50' : ''].join(' ')}>
            <span className="mr-2 opacity-70">0{number}</span>{label}
          </button>;
        })}
      </nav>
      {step === 1 && <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Step 1 — Select products</h2>
        <p className="mt-2 text-sm text-zinc-500">Search by product name. Results update automatically while you type.</p>
        <label htmlFor="quote-search" className="sr-only">Search products</label>
        <input id="quote-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
          maxLength={80} placeholder="Start typing a product name…" autoComplete="off"
          className="mt-5 w-full rounded-xl border border-zinc-300 px-4 py-3 focus:border-black" />
        <div className="mt-5 space-y-4" aria-live="polite" aria-busy={searching}>
          {searching && <p className="text-sm text-zinc-500">Searching products…</p>}
          {!searching && query.trim().length >= 2 && products.length === 0 &&
            <p className="text-sm text-zinc-500">No matching products found.</p>}
          {!searching && query.trim().length < 2 && <p className="text-sm text-zinc-500">Enter at least two characters to search.</p>}
          {products.map(product => <div key={product.id} className="border-b border-zinc-100 pb-4">
            <p className="font-medium">{product.title}</p>
            <div className="mt-3 flex flex-wrap gap-2">{product.variants.map(variant =>
              <button type="button" key={variant.id} disabled={!variant.availableForSale || variant.price.currencyCode !== 'AUD'}
                onClick={() => add(product, variant)}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm hover:border-black disabled:opacity-40">
                {variant.title === 'Default Title' ? 'Standard' : variant.title} · {aud(Number(variant.price.amount))} +
              </button>)}</div>
          </div>)}
        </div>
        <h3 className="mt-8 text-lg font-semibold">Products in your quote</h3>
        {lines.length === 0 && <p className="mt-3 text-sm text-zinc-500">No products selected.</p>}
        <div className="mt-4 space-y-3">
          {lines.map(line => <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div><p className="font-medium">{line.name}</p><p className="text-sm text-zinc-500">{line.variant} · {aud(line.price)} each</p></div>
            <div className="flex items-center gap-3">
              <button type="button" aria-label={'Decrease ' + line.name} className="h-9 w-9 rounded-lg border border-zinc-300" onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: l.quantity - 1 } : l).filter(l => l.quantity > 0))}>−</button>
              <span>{line.quantity}</span>
              <button type="button" aria-label={'Increase ' + line.name} className="h-9 w-9 rounded-lg border border-zinc-300" onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l))}>+</button>
              <span className="min-w-24 text-right font-medium">{aud(line.price * line.quantity)}</span>
            </div>
          </div>)}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 font-semibold"><span>Product subtotal</span><span>{aud(total)}</span></div>
        <p className="mt-2 text-xs text-zinc-500">Freight is excluded. Prices are verified when the quote is issued.</p>
        <button type="button" disabled={!lines.length} onClick={() => { setError(''); setStep(2); }}
          className="mt-6 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:opacity-40">Continue to your details →</button>
      </section>}
      {step === 2 && <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Step 2 — Your details</h2>
        <p className="mt-2 text-sm text-zinc-500">Enter the organisation and contact details to appear on your quotation.</p>
        <form onSubmit={e => { e.preventDefault(); setError(''); setStep(3); }} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Organisation name *<input required value={organisation} onChange={e => setOrganisation(e.target.value)} maxLength={120} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
          <label className="text-sm">Contact name *<input required value={contact} onChange={e => setContact(e.target.value)} maxLength={100} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
          <label className="text-sm">Email address *<input required type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={160} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
          <label className="text-sm">Delivery postcode *<input required value={postcode} onChange={e => setPostcode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} minLength={4} maxLength={4} inputMode="numeric" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
          <div className="sm:col-span-2 flex flex-wrap gap-3 pt-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-zinc-300 px-5 py-3">← Back to products</button>
            <button type="submit" className="flex-1 rounded-xl bg-black px-5 py-3 font-semibold text-white">Review and generate quote →</button>
          </div>
        </form>
      </section>}
      {step === 3 && <section className="rounded-3xl border border-zinc-200 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Step 3 — Download or email your quote</h2>
        <p className="mt-2 text-zinc-600">Review your details and product total, then generate your formal quotation. A PDF will be sent to your email address.</p>
        <div className="mt-6 rounded-xl bg-zinc-50 p-5 text-sm">
          <p className="font-semibold">{organisation}</p><p>{contact} · {email}</p><p>Delivery postcode: {postcode}</p>
          <p className="mt-4">{lines.reduce((n, l) => n + l.quantity, 0)} product(s) · Product subtotal <strong>{aud(total)}</strong></p>
          <p className="mt-2 text-xs text-zinc-500">Freight is not included; final costs and any tax adjustments are confirmed at checkout.</p>
        </div>
        {!issued ? <>
          <button type="button" onClick={() => setStep(2)} className="mt-6 mr-3 rounded-xl border border-zinc-300 px-5 py-3">← Edit details</button>
          <button type="button" disabled={busy || lines.length === 0} onClick={() => {
            void issue({ preventDefault: () => undefined } as FormEvent);
          }} className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-40">
            {busy ? 'Generating…' : 'Generate and email PDF'}
          </button>
        </> : <div className="mt-6 rounded-xl border border-zinc-200 p-5">
          <p className="font-semibold">Quotation issued: {issued}</p>
          <p className="mt-2 text-sm text-zinc-600">Your PDF has been sent if email delivery succeeded. For a secure online download, verify your email below.</p>
          <button type="button" onClick={() => { setIssued(''); setLines([]); setStep(1); setQuery(''); }} className="mt-4 text-sm underline underline-offset-4">Start another quotation</button>
        </div>}
      </section>}
      {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 text-sm text-zinc-700">{notice}</p>}
      <div className="mt-12"></div>
    </div>
  );
}
