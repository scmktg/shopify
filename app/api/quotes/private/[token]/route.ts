import { NextRequest, NextResponse } from 'next/server';
import { quoteDb, tokenDigest, type SavedQuote } from '@/lib/quotes/server';
import { shopifyClient } from '@/lib/shopify/client';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
export const runtime='nodejs';
const noStore={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
const fail=(error:string,status=400)=>NextResponse.json({error},{status,headers:noStore});
async function find(token:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&access_token_digest=eq.'+tokenDigest(token)+'&limit=1');
 return rows[0]??null;
}
export async function GET(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const quote=await find((await params).token);
  if(!quote)return fail('Quotation not found.',404);
  const {access_token_digest,customer_email,...visible}=quote;
  return NextResponse.json({quote:{...visible,customer_email}},{headers:noStore});
 }catch{return fail('Unable to retrieve quotation.',503);}
}
const CREATE_CART=`mutation QuotePayCart($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl} userErrors{message}}}`;
type CartResult={cartCreate:{cart:{id:string;checkoutUrl:string}|null;userErrors:{message:string}[]}};
export async function POST(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const quote=await find((await params).token);
  if(!quote)return fail('Quotation not found.',404);
  if(quote.invoice_status==='paid'||quote.status==='purchased')return fail('This invoice has already been paid.',409);
  if(quote.status==='cancelled'||Date.parse(quote.expires_at)<=Date.now())return fail('This quotation has expired. Please generate a new quotation.',409);
  // Re-check live Shopify prices and availability before payment; never charge a stale quote silently.
  for(const item of quote.items){
   const product=await fetchProductByHandle(item.handle), variant=product?.variants.find(v=>v.id===item.variant_id);
   if(!variant?.availableForSale||variant.price.currencyCode!=='AUD'||Math.round(Number(variant.price.amount)*100)!==item.unit_price_cents)
    return fail('Product price or availability has changed. Please create a new quotation.',409);
  }
  const invoiceReference=quote.invoice_reference||quote.reference.replace('EA-Q-','EA-INV-');
  const result=await shopifyClient.request<CartResult>(CREATE_CART,{variables:{input:{
   lines:quote.items.map(i=>({merchandiseId:i.variant_id,quantity:i.quantity})),
   attributes:[{key:'enviro_aqua_quote',value:quote.reference},{key:'enviro_aqua_invoice',value:invoiceReference}],
   buyerIdentity:{email:quote.customer_email,countryCode:'AU'},
  }}});
  const cart=result.data?.cartCreate?.cart;
  if(result.errors||!cart?.checkoutUrl||result.data?.cartCreate?.userErrors?.length)return fail('Checkout is unavailable. Please try again.',503);
  await quoteDb('quotes','PATCH','id=eq.'+quote.id,{
   invoice_reference:invoiceReference,invoice_status:'checkout_started',invoice_created_at:quote.invoice_created_at||new Date().toISOString(),
   status:'checkout_started',checkout_started_at:new Date().toISOString(),shopify_cart_id:cart.id,
  });
  return NextResponse.json({invoiceReference,checkoutUrl:cart.checkoutUrl},{headers:noStore});
 }catch{return fail('Unable to convert quotation to an invoice.',503);}
}
