'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindQuotePage(){
 const router=useRouter();
 const [reference,setReference]=useState('');
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function findQuote(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const ref=reference.trim().toUpperCase();
  if(!/^EA-Q-[A-F0-9]{16}$/.test(ref)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError('Enter your quotation reference and email address.');return;}
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/quotes/lookup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:ref,email:email.trim()})});
   const data=await response.json() as {url?:string;error?:string};
   if(!response.ok||!data.url)throw new Error(data.error||'We could not find a quotation matching those details.');
   router.push(data.url);
  }catch(err){setError(err instanceof Error?err.message:'Unable to find your quotation.');setBusy(false);}
 }
 return <main className="mx-auto max-w-2xl px-4 py-12 text-zinc-950 sm:px-6 sm:py-20">
  
  <h1 className="mt-3 text-4xl font-semibold tracking-tight">Find Your Quote</h1>
  <p className="mt-4 max-w-xl text-zinc-600">Already generated a quote? Enter your reference and email address to view, download or convert to an invoice.</p>
  <form onSubmit={e=>void findQuote(e)} className="mt-8 space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
   <label className="block text-sm font-medium" htmlFor="find-quote-reference">Quotation reference
    <input id="find-quote-reference" value={reference} onChange={e=>setReference(e.target.value)} placeholder="EA-Q-XXXXXXXXXXXXXXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={21} required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 uppercase outline-none focus:border-black focus:ring-2 focus:ring-zinc-200"/>
   </label>
   <label className="block text-sm font-medium" htmlFor="find-quote-email">Email address
    <input id="find-quote-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@organisation.com.au" autoComplete="email" maxLength={160} required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-zinc-200"/>
   </label>
   <p className="text-xs leading-relaxed text-zinc-500">Use the email address entered when the quotation was generated. No login or verification code is required.</p>
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
   <button type="submit" disabled={busy} className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50">{busy?'Finding quotation…':'Find My Quote →'}</button>
  </form>
  <p className="mt-6 text-sm text-zinc-600">Need a new quotation? <Link href="/quotes" className="font-semibold text-black underline underline-offset-4">Generate a quote</Link></p>
 </main>;
}
