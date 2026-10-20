'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindQuotePage(){
 const router=useRouter();
 const [reference,setReference]=useState('');
 const [accessCode,setAccessCode]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 async function findQuote(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const ref=reference.trim().toUpperCase();
  const code=accessCode.trim();
  if(!/^EA-Q-[A-F0-9]{16}$/.test(ref)||!/^[A-Za-z0-9_-]{43}$/.test(code)){
   setError('Enter your complete quotation reference and private access code.');
   return;
  }
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/quotes/private/'+encodeURIComponent(code),{cache:'no-store'});
   if(!response.ok)throw new Error('We could not find a quotation matching those details.');
   const data=await response.json() as {quote?:{reference?:string}};
   if(data.quote?.reference!==ref)throw new Error('We could not find a quotation matching those details.');
   router.push('/quotes/view/'+encodeURIComponent(code));
  }catch(err){setError(err instanceof Error?err.message:'Unable to find your quotation.');setBusy(false);}
 }
 return <main className="mx-auto max-w-2xl px-4 py-12 text-zinc-950 sm:px-6 sm:py-20">
  <p className="text-xs font-semibold uppercase tracking-[.2em] text-zinc-500">ENVIRO AQUA / QUOTATIONS</p>
  <h1 className="mt-3 text-4xl font-semibold tracking-tight">Find Your Quote</h1>
  <p className="mt-4 max-w-xl text-zinc-600">Already generated a quotation? Enter your quotation reference and private access code to view your saved document, convert it to an invoice or download a PDF. No login required.</p>
  <form onSubmit={e=>void findQuote(e)} className="mt-8 space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
   <label className="block text-sm font-medium" htmlFor="find-quote-reference">Quotation reference
    <input id="find-quote-reference" value={reference} onChange={e=>setReference(e.target.value)} placeholder="EA-Q-XXXXXXXXXXXXXXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={21} required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 uppercase outline-none focus:border-black focus:ring-2 focus:ring-zinc-200"/>
   </label>
   <label className="block text-sm font-medium" htmlFor="find-quote-code">Private access code
    <input id="find-quote-code" value={accessCode} onChange={e=>setAccessCode(e.target.value)} placeholder="Paste your private access code" autoCapitalize="none" autoComplete="off" spellCheck={false} maxLength={43} required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-zinc-200"/>
   </label>
   <p className="text-xs leading-relaxed text-zinc-500">Your access code is the long code at the end of the private link provided when you generated your quotation. Keep it safe: it protects your quotation and invoice details.</p>
   {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
   <button type="submit" disabled={busy} className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50">{busy?'Finding quotation…':'Find My Quote →'}</button>
  </form>
  <p className="mt-6 text-sm text-zinc-600">Need a new quotation? <Link href="/quotes" className="font-semibold text-black underline underline-offset-4">Generate a quote</Link></p>
 </main>;
}
