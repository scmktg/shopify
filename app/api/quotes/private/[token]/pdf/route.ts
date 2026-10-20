import {NextRequest,NextResponse} from 'next/server';
import {quoteDb,tokenDigest,type SavedQuote} from '@/lib/quotes/server';
import {authorizeQuote} from '@/lib/quotes/lookup-session';
import {validQuoteSignature,quoteAccessSignature} from '@/lib/quotes/signed-link';
import {quotePdf} from '@/lib/quotes/pdf';
export const runtime='nodejs';
export async function GET(request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const {token}=await params;
  let rows:SavedQuote[]=[];
  if(/^EA-Q-[A-F0-9]{16}$/.test(token)){
   if(!await authorizeQuote(token)&&!validQuoteSignature(token,request.nextUrl.searchParams.get('access')))return new NextResponse('Not found',{status:404});
   rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&reference=eq.'+encodeURIComponent(token)+'&limit=1');
  }else if(/^[A-Za-z0-9_-]{43}$/.test(token)){
   rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&access_token_digest=eq.'+tokenDigest(token)+'&limit=1');
  }else return new NextResponse('Not found',{status:404});
  const quote=rows[0];if(!quote)return new NextResponse('Not found',{status:404});
  const url=new URL('/quotes/view/'+encodeURIComponent(quote.reference),request.nextUrl.origin);
  url.searchParams.set('access',quoteAccessSignature(quote.reference));
  const bytes=quotePdf(quote,url.toString());
  return new NextResponse(new Uint8Array(bytes),{headers:{
   'Content-Type':'application/pdf',
   'Content-Disposition':'attachment; filename="'+(quote.invoice_reference||quote.reference)+'.pdf"',
   'Cache-Control':'private, no-store',
   'Referrer-Policy':'no-referrer',
   'X-Content-Type-Options':'nosniff'
  }});
 }catch{return new NextResponse('Unable to generate document',{status:503});}
}
