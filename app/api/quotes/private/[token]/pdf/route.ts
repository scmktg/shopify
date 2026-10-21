import {NextRequest,NextResponse} from 'next/server';
import {quoteDb,tokenDigest,type SavedQuote} from '@/lib/quotes/server';
import {authorizeQuote} from '@/lib/quotes/lookup-session';
import {validQuoteSignature,quoteAccessSignature} from '@/lib/quotes/signed-link';
import {quoteDocumentHtml} from '@/lib/quotes/document-html';
import sharp from 'sharp';
import {styledQuotePdf} from '@/lib/quotes/styled-pdf';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const {token}=await params;
  let rows:SavedQuote[]=[];
  if(/^EA-Q-(?:[A-F0-9]{16}|\d{4,})$/.test(token)){
   if(!await authorizeQuote(token)&&!validQuoteSignature(token,request.nextUrl.searchParams.get('access')))return new NextResponse('Not found',{status:404});
   rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&reference=eq.'+encodeURIComponent(token)+'&limit=1');
  }else if(/^[A-Za-z0-9_-]{43}$/.test(token)){
   rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&access_token_digest=eq.'+tokenDigest(token)+'&limit=1');
  }else return new NextResponse('Not found',{status:404});
  const saved=rows[0];if(!saved)return new NextResponse('Not found',{status:404});
  const quote=request.nextUrl.searchParams.get('document')==='quote'?{...saved,invoice_reference:null,invoice_status:null,invoice_created_at:null}:saved;
  const url=new URL('/quotes/view/'+encodeURIComponent(quote.reference),request.nextUrl.origin);
  url.searchParams.set('tab',quote.invoice_reference?'invoice':'quote');
  url.searchParams.set('access',quoteAccessSignature(quote.reference));
  const logo=await readFile(join(process.cwd(),'public','logo.webp'));
  const html=quoteDocumentHtml(quote,url.toString(),'data:image/webp;base64,'+logo.toString('base64'));
  if(request.nextUrl.searchParams.get('format')==='html')return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",'X-Content-Type-Options':'nosniff'}});
  const logoPng=await sharp(logo).png().toBuffer();
  const bytes=await styledQuotePdf(quote,url.toString(),logoPng);
  return new NextResponse(new Uint8Array(bytes),{headers:{
   'Content-Type':'application/pdf',
   'Content-Disposition':'attachment; filename="'+(quote.invoice_reference||quote.reference)+'.pdf"',
   'Cache-Control':'private, no-store',
   'Referrer-Policy':'no-referrer',
   'X-Content-Type-Options':'nosniff'
  }});
 }catch(error){console.error('[quotes] PDF generation failed',error);return new NextResponse('Unable to generate document',{status:503});}
}
