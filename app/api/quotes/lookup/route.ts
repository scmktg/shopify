import { NextRequest, NextResponse } from 'next/server';
import { normaliseEmail, quoteDb, type SavedQuote } from '@/lib/quotes/server';
import { setQuoteLookup } from '@/lib/quotes/lookup-session';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const generic=()=>NextResponse.json({error:'No quotation found matching those details.'},{status:404,headers:{'Cache-Control':'no-store'}});
 try{
  const body=await request.json() as {reference?:string;email?:string};
  const reference=String(body.reference||'').trim().toUpperCase();
  const email=normaliseEmail(String(body.email||''));
  if(!/^EA-Q-[A-F0-9]{16}$/.test(reference)||email.length>160||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return generic();
  const rows=await quoteDb<SavedQuote[]>('quotes','GET','select=reference&reference=eq.'+encodeURIComponent(reference)+'&customer_email=eq.'+encodeURIComponent(email)+'&limit=1');
  if(!rows.length)return generic();
  await setQuoteLookup(reference);
  return NextResponse.json({url:'/quotes/view/'+reference},{headers:{'Cache-Control':'no-store'}});
 }catch{return generic();}
}
