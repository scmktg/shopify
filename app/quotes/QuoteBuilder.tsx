'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';

type Variant = { id: string; title: string; availableForSale: boolean; price: { amount: string; currencyCode: string } };
type Product = { id: string; title: string; handle: string; image: { url: string; altText: string | null } | null; variants: Variant[] };
type Line = { id: string; handle: string; name: string; variant: string; price: number; quantity: number };
type SavedItem = { name: string; variant: string; quantity: number; unit_price_cents: number };
type Quote = { reference: string; organisation: string; contact_name: string; postcode: string; items: SavedItem[]; product_total_cents: number; status: string; created_at: string; expires_at: string; freight_status: string };
const displayVariant = (title: string) => title.trim().toLowerCase() === 'default title' ? '' : title;
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

  function adjustQuantity(id: string, delta: number) {
    setLines(current => current.map(line => line.id === id
      ? { ...line, quantity: Math.min(99, line.quantity + delta) } : line
    ).filter(line => line.quantity > 0));
  }

  async function issue() {
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
    <div className="mx-auto max-w-7xl px-4 py-10 text-zinc-950 sm:px-6 md:py-16">
      <div className="mb-9 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Enviro Aqua / Business purchasing</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Need a Quote Fast?</h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600">Simply add your desired products, enter your organisation details and our system will automatically generate you a quote. Perfect for schools, government and corporate organisations. Quotes are valid for 14 days and can be converted into a purchase online. If you have any questions or require more information, please don\u0027t hesitate to give us a call on <a className="font-semibold text-zinc-950 underline underline-offset-4" href="tel:+61287728162">(02) 8772 8162</a> or send us an email to <a className="font-semibold text-zinc-950 underline underline-offset-4" href="mailto:info@enviroaqua.com.au">info@enviroaqua.com.au</a>.</p>
      </div>
      <nav aria-label="Quote steps" className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
        {(['Select products', 'Your details', 'Download / email'] as const).map((label, index) => {
          const number = (index + 1) as 1 | 2 | 3;
          const accessible = number === 1 || (number === 2 && lines.length > 0) || (number === 3 && Boolean(issued));
          return <button key={label} type="button" disabled={!accessible} aria-current={step === number ? 'step' : undefined}
            onClick={() => setStep(number)}
            className={['rounded-2xl border px-3 py-4 text-left text-xs font-semibold transition-colors sm:px-6 sm:py-5 sm:text-base', step === number ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-500', !accessible ? 'opacity-50' : ''].join(' ')}>
            <span className="mr-2 opacity-70">0{number}</span>{label}
          </button>;
        })}
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div className="min-w-0">
      {step === 1 && <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold">Step 1 — Select products</h2>
        <p className="mt-2 text-sm text-zinc-500">Search by product name. Results update automatically while you type.</p>
        <label htmlFor="quote-search" className="sr-only">Search products</label>
        <input id="quote-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
          maxLength={80} placeholder="Start typing a product name…" autoComplete="off"
          className="mt-5 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-5 py-4 text-base outline-none transition focus:border-black focus:bg-white focus:ring-2 focus:ring-zinc-200" />
        <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1" aria-live="polite" aria-busy={searching}>
          {searching && <p className="text-sm text-zinc-500">Searching products…</p>}
          {!searching && query.trim().length >= 2 && products.length === 0 &&
            <p className="text-sm text-zinc-500">No matching products found.</p>}
          {!searching && query.trim().length < 2 && <p className="text-sm text-zinc-500">Enter at least two characters to search.</p>}
          {products.map(product => <div key={product.id} className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:shadow-sm">
            <div className="flex items-center gap-4"><div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 sm:h-28 sm:w-28">{product.image ? <Image src={product.image.url} alt={product.image.altText || product.title} fill sizes="(min-width: 640px) 112px, 96px" className="object-contain p-1.5" /> : <span className="flex h-full items-center justify-center text-xs text-zinc-400">No image</span>}</div><div className="min-w-0"><p className="text-sm font-semibold leading-snug sm:text-base">{product.title}</p><p className="mt-1 text-xs text-zinc-500">Choose an option below to add it to your quote</p></div></div>
            <div className="mt-3 flex flex-wrap gap-2">{product.variants.map(variant =>
              <button type="button" key={variant.id} disabled={!variant.availableForSale || variant.price.currencyCode !== 'AUD'}
                onClick={() => add(product, variant)}
                className="rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-left text-sm font-medium transition hover:border-black hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-40">
                {variant.title === 'Default Title' ? 'Standard' : variant.title} · {aud(Number(variant.price.amount))} +
              </button>)}</div>
          </div>)}
        </div>
        <h3 className="mt-8 text-lg font-semibold lg:hidden">Products in your quote</h3>
        {lines.length === 0 && <p className="mt-3 text-sm text-zinc-500">No products selected.</p>}
        <div className="mt-4 space-y-3 lg:hidden">
          {lines.map(line => <div key={line.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div><p className="font-medium">{line.name}</p><p className="text-sm text-zinc-500">{displayVariant(line.variant) ? displayVariant(line.variant) + ' · ' : ''}{aud(line.price)} each</p></div>
            <div className="flex items-center gap-3">
              <button type="button" aria-label={'Decrease ' + line.name} className="h-9 w-9 rounded-lg border border-zinc-300" onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: l.quantity - 1 } : l).filter(l => l.quantity > 0))}>−</button>
              <span>{line.quantity}</span>
              <button type="button" aria-label={'Increase ' + line.name} className="h-9 w-9 rounded-lg border border-zinc-300" onClick={() => setLines(list => list.map(l => l.id === line.id ? { ...l, quantity: Math.min(99, l.quantity + 1) } : l))}>+</button>
              <span className="min-w-24 text-right font-medium">{aud(line.price * line.quantity)}</span>
            </div>
          </div>)}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 font-semibold lg:hidden"><span>Product subtotal</span><span>{aud(total)}</span></div>
        <p className="mt-2 text-xs text-zinc-500">Freight is excluded. Prices are verified when the quote is issued.</p>
        <button type="button" disabled={!lines.length} onClick={() => { setError(''); setStep(2); }}
          className="mt-6 w-full rounded-xl bg-black px-5 py-4 font-semibold text-white disabled:opacity-40">Continue to your details →</button>
      </section>}
      {step === 2 && <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
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
      {step === 3 && <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
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
            void issue();
          }} className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-40">
            {busy ? 'Generating…' : 'Generate and email PDF'}
          </button>
        </> : <div className="mt-6 rounded-xl border border-zinc-200 p-5">
          <p className="font-semibold">Quotation issued: {issued}</p>
          <p className="mt-2 text-sm text-zinc-600">Your PDF has been sent if email delivery succeeded. For a secure online download, verify your email below.</p>
          <button type="button" onClick={() => { setIssued(''); setLines([]); setStep(1); setQuery(''); }} className="mt-4 text-sm underline underline-offset-4">Start another quotation</button>
        </div>}
      </section>}
      </div>
      <aside className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm lg:sticky lg:top-28 sm:p-6" aria-label="Quotation summary">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Quote summary</h2><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600">{lines.reduce((n, l) => n + l.quantity, 0)} items</span></div>
        <p className="mt-1 text-sm text-zinc-500">Your selection stays here as you continue.</p>
        <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto">
          {lines.length === 0 ? <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">Selected products will appear here.</div> :
          lines.map(line => <div key={line.id} className="border-b border-zinc-200 pb-4 text-sm"><p className="font-semibold leading-snug">{line.name}</p>{displayVariant(line.variant) && <p className="mt-1 text-zinc-500">{displayVariant(line.variant)}</p>}<div className="mt-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><button type="button" aria-label={"Decrease quantity of " + line.name} onClick={() => adjustQuantity(line.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg hover:border-black">−</button><span className="min-w-5 text-center font-semibold" aria-live="polite">{line.quantity}</span><button type="button" aria-label={"Increase quantity of " + line.name} disabled={line.quantity >= 99} onClick={() => adjustQuantity(line.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-lg hover:border-black disabled:opacity-40">+</button></div><strong>{aud(line.quantity * line.price)}</strong></div><p className="mt-1 text-xs text-zinc-500">{aud(line.price)} each</p></div>)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-zinc-300 pt-5 text-base font-semibold"><span>Product subtotal</span><span>{aud(total)}</span></div>
        <p className="mt-3 text-xs leading-relaxed text-zinc-500">Freight is not included. Final charges are confirmed at checkout.</p>
      </aside>
      </div>
      {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-5 text-sm text-zinc-700">{notice}</p>}
      <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="saved-quotes-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="saved-quotes-title" className="text-2xl font-semibold">Already have a quotation?</h2><p className="mt-2 text-sm text-zinc-600">Verify your email to view previous quotes, download PDFs or proceed to checkout.</p></div>
          <button type="button" onClick={loadHistory} disabled={busy} className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium hover:border-black disabled:opacity-40">View saved quotes →</button>
        </div>
        <form onSubmit={sendLogin} className="mt-6 flex flex-wrap gap-3">
          <label htmlFor="quote-login" className="sr-only">Email address for saved quotations</label>
          <input id="quote-login" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3" />
          <button disabled={busy} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Email secure access link</button>
        </form>
        {history && <div className="mt-6 space-y-3">
          <label className="block text-sm">Search quotations<input type="search" value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search reference or organisation" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" /></label>
          {history.length === 0 && <p className="text-sm text-zinc-500">No quotations were found for this verified account.</p>}
          {history.filter(q => (q.reference + ' ' + q.organisation).toLowerCase().includes(historySearch.toLowerCase())).map(quote => <article key={quote.reference} className="rounded-2xl border border-zinc-200 p-4 sm:p-5">
            <div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{quote.reference}</p><p className="mt-1 text-sm text-zinc-500">{quote.organisation} · {new Date(quote.created_at).toLocaleDateString('en-AU')}</p></div><strong>{aud(quote.product_total_cents / 100)}</strong></div>
            <p className="mt-2 text-xs text-zinc-500">Status: {quote.status.replaceAll('_', ' ')} · Expires {new Date(quote.expires_at).toLocaleDateString('en-AU')} · Freight not included</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold"><a className="underline underline-offset-4" href={'/api/quotes/' + encodeURIComponent(quote.reference) + '/pdf'}>Download PDF</a>
            {quote.status !== 'purchased' && quote.status !== 'cancelled' && Date.parse(quote.expires_at) > Date.now() && <>
              <button type="button" disabled={busy} onClick={() => checkout(quote.reference)} className="underline underline-offset-4 disabled:opacity-40">Proceed to checkout</button>
              <button type="button" onClick={() => setPoFor(poFor === quote.reference ? '' : quote.reference)} className="underline underline-offset-4">Submit purchase order</button>
            </>}</div>
            {poFor === quote.reference && <form onSubmit={e => { e.preventDefault(); void submitPO(quote.reference); }} className="mt-4 flex flex-wrap gap-2">
              <label htmlFor={'po-' + quote.reference} className="sr-only">Purchase order reference</label><input id={'po-' + quote.reference} required value={poNumber} onChange={e => setPoNumber(e.target.value)} maxLength={80} placeholder="Purchase order reference" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm" />
              <button disabled={busy} className="rounded-xl bg-black px-4 py-3 text-sm text-white">Send for review</button><p className="w-full text-xs text-zinc-500">Purchase orders are reviewed manually. Invoice terms are not automatic.</p>
            </form>}
          </article>)}
        </div>}
      </section>
    </div>
  );
}
