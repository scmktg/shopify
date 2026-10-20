'use client';
import { useEffect, useState, useTransition } from 'react';
import { searchProducts } from '@/lib/shopify/queries/searchProducts';
import Image from 'next/image';
import { createCart, estimateQuoteShipping } from '@/lib/shopify/cart';
import { addMultipleToCart } from '@/lib/shopify/addMultipleToCart';

type Variant = { id:string; title:string; availableForSale:boolean; price:{amount:string;currencyCode:string} };
type Product = { id:string; title:string; handle:string; image:{url:string;altText:string|null}|null; variants:Variant[] };
type Line = { id:string; handle:string; title:string; variant:string; quantity:number; cents:number };
const aud=(cents:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(cents/100);
const dateIn=(days:number)=>{const d=new Date();d.setDate(d.getDate()+days);return d.toLocaleDateString('en-AU',{timeZone:'Australia/Melbourne',day:'2-digit',month:'long',year:'numeric'});};

export function QuoteDownloadBuilder(){
 const [step,setStep]=useState<1|2|3>(1);
 const [search,setSearch]=useState(''); const [results,setResults]=useState<Product[]>([]);
 const [isPending,startTransition]=useTransition();
 const [lines,setLines]=useState<Line[]>([]); const [organisation,setOrganisation]=useState('');
 const [contact,setContact]=useState('');const [email,setEmail]=useState('');
 const [street,setStreet]=useState('');const [suburb,setSuburb]=useState('');const [state,setState]=useState('');const [postcode,setPostcode]=useState('');const [abn,setAbn]=useState('');
 const [notes,setNotes]=useState(''); const [reference,setReference]=useState(()=> 'EA-'+Date.now().toString(36).toUpperCase());
 const [savedUrl,setSavedUrl]=useState('');const [saveBusy,setSaveBusy]=useState(false);const [saveError,setSaveError]=useState('');
 useEffect(()=>{setSavedUrl('');},[lines,organisation,contact,email,street,suburb,state,postcode,abn]);
 const subtotal=lines.reduce((s,l)=>s+l.cents*l.quantity,0);
 const productGst=Math.round(subtotal/11);
 const [checkoutBusy,setCheckoutBusy]=useState(false);
 const [checkoutError,setCheckoutError]=useState('');
 const [shipping,setShipping]=useState<number|null>(null);const [shippingError,setShippingError]=useState('');const [shippingBusy,setShippingBusy]=useState(false);
 const [shippingKey,setShippingKey]=useState('');
 const addressValid=street.trim().length>2&&suburb.trim().length>1&&Boolean(state)&&/^\d{4}$/.test(postcode);
 const quoteKey=[street.trim(),suburb.trim(),state,postcode,...lines.map(l=>l.id+':'+l.quantity)].join('|');
 const shippingCurrent=shippingKey===quoteKey;
 const freight=shippingCurrent?shipping:null;
 const total=freight===null?null:subtotal+freight;
 const includedGst=productGst+(freight===null?0:Math.round(freight/11));
 async function saveQuote(){
  if(!valid||saveBusy)return;
  setSaveBusy(true);setSaveError('');
  try{
   const response=await fetch('/api/quotes/private',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({organisation,contact,email,street,suburb,state,postcode,abn,items:lines.map(l=>({handle:l.handle,variantId:l.id,quantity:l.quantity}))})});
   const data=await response.json() as {reference?:string;url?:string;error?:string};
   if(!response.ok||!data.url||!data.reference)throw new Error(data.error||'Unable to save quotation.');
   setReference(data.reference);setSavedUrl(data.url);setStep(3);
  }catch(error){setSaveError(error instanceof Error?error.message:'Unable to save quotation.');}finally{setSaveBusy(false);}
 }
 async function proceedToCheckout(){
  if(!valid||checkoutBusy)return;
  setCheckoutBusy(true);setCheckoutError('');
  try{
   // Use a separate Shopify cart so existing browsing-cart items cannot alter the quotation.
   const created=await createCart();
   const cart=await addMultipleToCart(created.id,lines.map(l=>({variantId:l.id,quantity:l.quantity})));
   if(!cart.checkoutUrl)throw new Error('Checkout link unavailable');
   window.location.assign(cart.checkoutUrl);
  }catch{setCheckoutError('Unable to start Shopify checkout. Please try again.');setCheckoutBusy(false);}
 }

 async function checkShipping(){setShippingBusy(true);setShippingError('');setShipping(null);setShippingKey('');try{const result=await estimateQuoteShipping(lines.map(l=>({variantId:l.id,quantity:l.quantity})),{street,city:suburb,provinceCode:state,postcode});if(result.ok&&result.options[0]){setShipping(Math.round(Number(result.options[0].estimatedCost.amount)*100));setShippingKey(quoteKey);}else setShippingError(result.error||'Shipping unavailable.');}catch{setShippingError('Unable to retrieve Shopify delivery fee.');}finally{setShippingBusy(false);}}
 useEffect(()=>{
  const trimmed=search.trim();
  if(trimmed.length<2){setResults([]);return;}
  // Same Shopify predictive search action and eight-result limit as navbar SearchBar.
  // Ignore obsolete responses so a previous search cannot replace a newer query.
  let active=true;
  const handle=window.setTimeout(()=>{
   startTransition(()=>{
    void (async()=>{
     try{
      const next=await searchProducts(trimmed,8);
      if(active)setResults(next.map(product=>({
       id:product.id,title:product.title,handle:product.handle,
       image:product.featuredImage?{url:product.featuredImage.url,altText:product.featuredImage.altText}:null,
       variants:product.variants.map(variant=>({
        id:variant.id,title:variant.title,availableForSale:variant.availableForSale,price:variant.price,
       })),
      })));
     }catch{if(active)setResults([]);}
    })();
   });
  },300);
  return()=>{active=false;window.clearTimeout(handle);};
 },[search]);

 function add(product:Product,variant:Variant){
  const price=Number(variant.price.amount);if(!variant.availableForSale||variant.price.currencyCode!=='AUD'||!Number.isFinite(price)||price<0)return;
  setLines(prev=>{const found=prev.find(x=>x.id===variant.id);return found?prev.map(x=>x.id===variant.id?{...x,quantity:Math.min(x.quantity+1,99)}:x):[...prev,{id:variant.id,title:product.title,variant:variant.title,quantity:1,handle:product.handle,cents:Math.round(price*100)}];});
  setSearch('');
  setResults([]);
 }
 function change(id:string,n:number){setLines(prev=>prev.map(x=>x.id===id?{...x,quantity:Math.min(99,Math.max(0,n))}:x).filter(x=>x.quantity>0));}
 const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())&&organisation.trim().length>0&&contact.trim().length>0&&lines.length>0&&addressValid&&(!abn.trim()||/^\d{11}$/.test(abn.replace(/\s/g,'')));
 return <div className="mx-auto max-w-7xl px-4 py-10 text-zinc-950 sm:px-6">
  <div className="quote-editor mb-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">ENVIRO AQUA / SELF-SERVICE QUOTATIONS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Need a Quote?</h1><p className="mt-3 text-sm">Already have a quotation? <a href="/quotes/find" className="font-semibold underline underline-offset-4">Find Your Quote →</a></p><p className="mt-3 max-w-3xl text-zinc-600">Add products, enter your organisation details and download your quotation immediately. Suitable for schools, government and business purchasing approval. Valid for 14 days. No account required.</p></div>
  <div className="quote-layout grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.9fr)]">
   <section className="quote-editor space-y-7"><nav aria-label="Quotation progress" className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"><ol className="grid grid-cols-3 gap-2">{(['Products','Your details','Download'] as const).map((label,index)=>{const n=(index+1) as 1|2|3;return <li key={label}><button type="button" onClick={()=>setStep(n)} aria-current={step===n?'step':undefined} aria-label={'Go to '+label} className={['flex w-full items-center gap-2 rounded-xl px-2 py-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:px-3',step===n?'bg-zinc-950 text-white':step>n?'bg-zinc-100 text-zinc-900':'text-zinc-400'].join(' ')}><span className={['flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',step===n?'bg-white text-black':step>n?'bg-black text-white':'border border-zinc-300'].join(' ')}>{step>n?'✓':n}</span><span className="min-w-0 text-xs font-semibold sm:text-sm">{label}</span></button></li>})}</ol><div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-black transition-all" style={{width:(step/3*100)+'%'}}/></div></nav>
    {step===1&&<>
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Step 1 of 3 / Add products</h2><label htmlFor="quote-product-search" className="mt-4 block text-sm font-medium">Search our product catalogue</label><input id="quote-product-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product name" maxLength={80} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/>
    <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">{isPending&&results.length===0&&<p className="text-sm text-zinc-500">Searching…</p>}{!isPending&&search.trim().length>=2&&results.length===0&&<p className="text-sm text-zinc-500">No results for “{search.trim()}”.</p>}
    {results.map(p=><div key={p.id} className="rounded-xl border border-zinc-200 p-3"><div className="flex items-center gap-3">{p.image&&<div className="relative h-16 w-16 shrink-0"><Image src={p.image.url} alt={p.image.altText||p.title} fill sizes="64px" className="object-contain"/></div>}<strong className="text-sm">{p.title}</strong></div><div className="mt-3 flex flex-wrap gap-2">{p.variants.map(v=><button type="button" key={v.id} disabled={!v.availableForSale||v.price.currencyCode!=='AUD'} onClick={()=>add(p,v)} className="rounded-lg border border-zinc-300 px-3 py-2 text-left text-xs hover:border-black disabled:opacity-40">+ {v.title==='Default Title'?'Add product':v.title} · {aud(Math.round(Number(v.price.amount)*100))}</button>)}</div></div>)}</div>
    <div className="mt-5 space-y-3">{lines.length===0?<p className="text-sm text-zinc-500">No products added yet.</p>:lines.map(l=><div key={l.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3"><div className="min-w-0"><p className="text-sm font-semibold">{l.title}</p>{l.variant!=='Default Title'&&<p className="text-xs text-zinc-500">{l.variant}</p>}<p className="text-xs text-zinc-500">{aud(l.cents)} each</p></div><div className="flex shrink-0 items-center gap-2"><button aria-label={'Decrease '+l.title} onClick={()=>change(l.id,l.quantity-1)} className="rounded border px-2 py-1">−</button><span className="min-w-5 text-center">{l.quantity}</span><button aria-label={'Increase '+l.title} onClick={()=>change(l.id,l.quantity+1)} disabled={l.quantity>=99} className="rounded border px-2 py-1">+</button><strong className="ml-2 text-sm">{aud(l.cents*l.quantity)}</strong></div></div>)}</div><div className="mt-4 flex justify-between font-semibold"><span>Product total (AUD)</span><span>{aud(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm"><span>Shipping fee</span><span>{freight===null?'Calculated at next step':aud(freight)}</span></div>{total!==null&&<div className="mt-2 flex justify-between border-t pt-3 text-lg font-bold"><span>Estimated total</span><span>{aud(total)}</span></div>}</div>
    <button type="button" disabled={!lines.length} onClick={()=>setStep(2)} className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white disabled:opacity-40">Next: Your details →</button></>}
    {step===2&&<div className="rounded-3xl border border-zinc-200 p-5 sm:p-7"><h2 className="text-xl font-semibold">Step 2 of 3 / Your details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{([[organisation,setOrganisation,'Organisation name *'],[contact,setContact,'Contact name *'],[email,setEmail,'Email address *'],[abn,setAbn,'ABN (optional)']] as const).map(([value,setValue,label])=><label key={label} className="text-sm font-medium">{label}<input value={value} onChange={e=>setValue(label.includes('ABN')?e.target.value.replace(/[^\d\s]/g,''):e.target.value)} maxLength={label.includes('ABN')?14:160} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/></label>)}</div><div className="mt-6 border-t border-zinc-200 pt-5"><h3 className="font-semibold">Delivery address *</h3><p className="mt-1 text-sm text-zinc-500">Required for shipping calculation</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm sm:col-span-2">Street address *<input required value={street} onChange={e=>setStreet(e.target.value)} maxLength={180} autoComplete="shipping street-address" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/></label><label className="text-sm">Suburb *<input required value={suburb} onChange={e=>setSuburb(e.target.value)} maxLength={90} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/></label><label className="text-sm">State *<div className="relative"><select required value={state} onChange={e=>setState(e.target.value)} className="mt-2 w-full appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-11 text-zinc-950 shadow-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"><option value="">Select state</option>{['NSW','ACT','VIC','QLD','SA','WA','TAS','NT'].map(v=><option key={v} value={v}>{v}</option>)}</select><svg aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg></div></label><label className="text-sm">Postcode *<input required value={postcode} onChange={e=>setPostcode(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4} inputMode="numeric" pattern="[0-9]{4}" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/></label></div></div><div className="mt-4"><button type="button" disabled={shippingBusy||!lines.length||!addressValid} onClick={()=>void checkShipping()} className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold disabled:opacity-40">{shippingBusy?'Checking Shopify shipping…':'Calculate & Add Shipping'}</button><p className="mt-2 text-xs text-zinc-500">Calculated for all selected products and quantities using your full delivery address. Recalculate whenever products, quantities or postcode change.</p>{shippingError&&<p role="alert" className="mt-2 text-sm text-red-700">{shippingError}</p>}</div><label className="mt-4 block text-sm font-medium">Notes (optional)<textarea rows={2} value={notes} maxLength={500} onChange={e=>setNotes(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"/></label><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={()=>setStep(1)} className="rounded-xl border border-zinc-300 px-5 py-3">← Back</button><button type="button" onClick={()=>void saveQuote()} disabled={saveBusy} className="flex-1 rounded-xl bg-black px-5 py-3 font-semibold text-white disabled:opacity-40">{saveBusy?"Generating quote…":"Generate Quote →"}</button></div>{!valid&&<p className="mt-3 text-sm text-amber-800">To generate your quote, enter an organisation name, contact name, valid email and complete Australian delivery address. If supplied, the ABN must contain 11 digits.</p>}{saveError&&<p role="alert" className="mt-3 text-sm text-red-700">{saveError}</p>}</div>}
    {step===3&&<div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"><h2 className="mb-3 text-xl font-semibold">Step 3 of 3 / Download quote</h2><p className="mb-4 text-sm text-zinc-600">Your quotation must be generated and saved before downloading. Review the saved quotation below.</p><button onClick={()=>window.print()} disabled={!valid||!savedUrl} className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white disabled:opacity-40">Download saved quote / Save as PDF ↗</button><div className="mt-5 border-t border-zinc-200 pt-5"><h3 className="text-sm font-semibold">Ready to place your order?</h3><p className="mt-2 text-sm text-zinc-600">Convert the products on this quotation into an order and continue to our secure Shopify checkout for payment. Your tax invoice is issued through our normal sales process after purchase. Final shipping and totals are shown at checkout.</p>{savedUrl?<a href={savedUrl} className="mt-4 block w-full rounded-xl border border-black bg-white px-5 py-3 text-center font-semibold text-black hover:bg-zinc-100">View Saved Quote &amp; Convert to Invoice →</a>:<button type="button" disabled={!valid||saveBusy} onClick={()=>void saveQuote()} className="mt-4 w-full rounded-xl border border-black bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-100 disabled:opacity-40">{saveBusy?'Saving quotation…':'Save Quotation & Get Private Link →'}</button>}{saveError&&<p role="alert" className="mt-2 text-sm text-red-700">{saveError}</p>}{savedUrl&&<div className="mt-4 rounded-xl bg-zinc-100 p-4 text-sm"><p className="font-semibold">Your saved quotation access</p><p className="mt-2">Reference: <strong>{reference}</strong></p><p className="mt-2">To return later, use this reference and your email address on Find Your Quote.</p><a href="/quotes/find" className="mt-3 inline-block font-semibold underline underline-offset-4">Find Your Quote →</a><p className="mt-2 text-xs text-zinc-600">No account or verification email is needed.</p></div>}{checkoutError&&<p role="alert" className="mt-2 text-sm text-red-700">{checkoutError}</p>}</div><p className="mt-3 text-xs text-zinc-500">Use your browser’s “Save as PDF” option. Save your quotation first to download it. No email is sent; you can find your quote later using its reference and your email address. The reference is for this download only, not a registered quotation number.</p><button type="button" onClick={()=>setStep(2)} className="mt-4 text-sm font-medium underline underline-offset-4">← Edit details</button></div>}
   </section>
   <aside className="quote-print-surface relative self-start lg:sticky lg:top-24">{!savedUrl&&<div aria-label="Preview only – not yet generated" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-2xl print:hidden"><span className="-rotate-45 text-[clamp(3.2rem,9vw,8rem)] font-black tracking-[.1em] text-zinc-500/30">PREVIEW</span></div>}<div className="quote-paper min-h-[650px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7"><header className="flex items-start justify-between border-b-2 border-black pb-4"><div><Image src="/logo.webp" alt="Enviro Aqua" width={190} height={65} className="h-auto w-[150px] object-contain sm:w-[170px]" unoptimized/><div className="mt-3 space-y-0.5 text-[10px] leading-[1.45] text-zinc-600 sm:text-[11px]"><p>6/45 Amsterdam Circuit, Wyong NSW 2259</p><p>(02) 8772 8162</p><p>info@enviroaqua.com.au</p><p>www.enviroaqua.com.au</p><p>ABN: 24 638 197 734</p></div></div><div className="text-right"><span className="block text-xs font-semibold tracking-widest">QUOTATION</span><span className="mt-2 block text-xs font-medium text-zinc-600">{reference}</span></div></header>
   <div className="mt-6 flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold tracking-wider text-zinc-500">PREPARED FOR</p><p className="mt-2 text-xs font-semibold">{organisation}</p><p className="text-xs">{contact}</p>{email&&<p className="text-xs">{email}</p>}{abn&&<p className="text-xs">ABN: {abn}</p>}<div className="mt-3"><p className="text-xs font-semibold text-zinc-500">DELIVERY TO</p><p className="text-xs">{street}</p><p className="text-xs">{suburb} {state} {postcode}</p></div></div><div className="text-xs"><p><span className="text-zinc-500">Reference:</span> {reference}</p><p className="mt-1"><span className="text-zinc-500">Date:</span> {dateIn(0)}</p><p className="mt-1"><span className="text-zinc-500">Valid until:</span> {dateIn(14)}</p></div></div>
   <table className="mt-7 w-full table-fixed border-collapse text-left text-[11px] leading-[1.4]"><thead><tr className="border-b-2 border-zinc-800 text-xs"><th className="w-[49%] py-2 pr-3">PRODUCT</th><th className="w-[10%] py-2 text-center">QTY</th><th className="w-[19%] py-2 text-center">UNIT</th><th className="w-[22%] py-2 text-center">TOTAL</th></tr></thead><tbody>{lines.map(l=><tr key={l.id} className="border-b border-zinc-200"><td className="break-words py-2.5 pr-3 align-middle">{l.title}{l.variant!=='Default Title'&&<span className="block text-xs text-zinc-500">{l.variant}</span>}</td><td className="py-2.5 text-center align-middle">{l.quantity}</td><td className="py-2.5 text-center align-middle">{aud(l.cents)}</td><td className="py-2.5 text-center align-middle font-semibold">{aud(l.cents*l.quantity)}</td></tr>)}</tbody></table>
   <div className="mt-4 flex justify-end"><div className="w-full max-w-xs border-t-2 border-black pt-3"><div className="flex justify-between text-xs"><span>Products</span><span>{aud(subtotal)}</span></div><div className="mt-2 flex justify-between text-xs"><span>Shipping fee</span><span>{freight===null?"Pending calculation":aud(freight)}</span></div><div className="mt-2 flex justify-between text-xs"><span>Included GST (products{freight===null?'': ' + shipping'})</span><span>{freight===null?aud(productGst):aud(includedGst)}</span></div><div className="mt-3 flex justify-between border-t border-zinc-300 pt-2 text-base font-bold"><span>{total===null?"Product total (incl. GST)":"Estimated total (incl. GST)"}</span><span>{aud(total??subtotal)}</span></div></div></div>
   {notes&&<div className="mt-8"><p className="text-xs font-semibold tracking-wider text-zinc-500">NOTES</p><p className="mt-2 whitespace-pre-line text-sm">{notes}</p></div>}
   <div className="mt-8 border-t border-zinc-200 pt-3 text-[10px] leading-relaxed text-zinc-600"><p className="mt-2">To proceed with your quotation, visit www.enviroaqua.com.au or contact us with your quotation reference. Payment and final delivery charges are confirmed through checkout.</p><p className="mt-3 font-semibold">www.enviroaqua.com.au</p></div>
   </div></aside>
  </div>
  <style jsx global>{`@media print { @page { size: A4; margin: 12mm; } html,body { background:#fff!important; } body * { visibility:hidden!important; } .quote-print-surface,.quote-print-surface * { visibility:visible!important; } .quote-print-surface { position:absolute!important; top:0!important; left:0!important; width:100%!important; margin:0!important; } .quote-paper { border:0!important;box-shadow:none!important;padding:0!important;min-height:0!important; } .quote-print-surface table { page-break-inside:auto; } .quote-print-surface tr { break-inside:avoid; } } `}</style>
 </div>;
}
