import { NextRequest, NextResponse } from 'next/server';
import { normaliseEmail, quoteDb, type SavedQuote } from '@/lib/quotes/server';
import { setQuoteLookup } from '@/lib/quotes/lookup-session';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const generic=()=>NextResponse.json({error:'No quotation found matching those details.'},{status:404,headers:{'Cache-Control':'no-store'}});
 try{
  const body=await request.json() as {reference?:string;email?:string;kind?:'quote'|'invoice'};
  const supplied=String(body.reference||'').trim().toUpperCase();
  const kind=body.kind==='invoice'?'invoice':'quote';
  const reference=kind==='invoice'?supplied.replace(/^EA-INV-/,'EA-Q-'):supplied;
  const email=normaliseEmail(String(body.email||''));
  if(!/^EA-Q-[A-F0-9]{16}$/.test(reference)||email.length>160||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return generic();
  if(kind==='invoice'&&!/^EA-INV-[A-F0-9]{16}$/.test(supplied))return generic();
  const rows=await quoteDb<Pick<SavedQuote,'reference'|'invoice_reference'>[]>('quotes','GET','select=reference,invoice_reference&reference=eq.'+encodeURIComponent(reference)+'&customer_email=eq.'+encodeURIComponent(email)+'&limit=1');
  if(!rows.length||(kind==='invoice'&&rows[0].invoice_reference!==supplied))return generic();
  await setQuoteLookup(reference);
  return NextResponse.json({url:'/quotes/view/'+reference+(kind==='invoice'?'?tab=invoice':'?tab=quote')},{headers:{'Cache-Control':'no-store'}});
 }catch{return generic();}
}
