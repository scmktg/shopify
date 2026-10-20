import {NextRequest,NextResponse} from 'next/server';
import {quoteDb,tokenDigest,type SavedQuote} from '@/lib/quotes/server';
import {authorizeQuote} from '@/lib/quotes/lookup-session';
import {validQuoteSignature,quoteAccessSignature} from '@/lib/quotes/signed-link';
import {quoteDocumentHtml} from '@/lib/quotes/document-html';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
export const runtime='nodejs';
export const maxDuration=60;
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
  const logo=await readFile(join(process.cwd(),'public','logo.webp'));
  const html=quoteDocumentHtml(quote,url.toString(),'data:image/webp;base64,'+logo.toString('base64'));
  if(request.nextUrl.searchParams.get('format')==='html')return new NextResponse(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'",'X-Content-Type-Options':'nosniff'}});
  const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--disable-setuid-sandbox'],executablePath:await chromium.executablePath(),headless:true});
  let bytes:Uint8Array;
  try{
   const page=await browser.newPage();
   await page.setContent(html,{waitUntil:'load'});
   bytes=await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});
  }finally{await browser.close();}
  return new NextResponse(new Uint8Array(bytes),{headers:{
   'Content-Type':'application/pdf',
   'Content-Disposition':'attachment; filename="'+(quote.invoice_reference||quote.reference)+'.pdf"',
   'Cache-Control':'private, no-store',
   'Referrer-Policy':'no-referrer',
   'X-Content-Type-Options':'nosniff'
  }});
 }catch(error){console.error('[quotes] PDF generation failed',error);return new NextResponse('Unable to generate document',{status:503});}
}
