import { NextRequest, NextResponse } from 'next/server';
import { quoteDb, tokenDigest, type SavedQuote } from '@/lib/quotes/server';
import { authorizeQuote } from '@/lib/quotes/lookup-session';
import { validQuoteSignature } from '@/lib/quotes/signed-link';
import { shopifyClient } from '@/lib/shopify/client';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
export const runtime='nodejs';
const noStore={'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'};
const fail=(error:string,status=400)=>NextResponse.json({error},{status,headers:noStore});
async function findPrivateQuote(token:string,access:string|null=null){
 if(/^EA-Q-[A-F0-9]{16}$/.test(token)){
  if(!await authorizeQuote(token)&&!validQuoteSignature(token,access))return null;
  const matches=await quoteDb<SavedQuote[]>('quotes','GET','select=*&reference=eq.'+encodeURIComponent(token)+'&limit=1');
  return matches[0]??null;
 }
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const rows=await quoteDb<SavedQuote[]>('quotes','GET','select=*&access_token_digest=eq.'+tokenDigest(token)+'&limit=1');
 return rows[0]??null;
}
export async function GET(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const quote=await findPrivateQuote((await params).token,_request.nextUrl.searchParams.get('access'));
  if(!quote)return fail('Quotation not found.',404);
  const {access_token_digest,customer_email,...visible}=quote;
  return NextResponse.json({quote:{...visible,customer_email}},{headers:noStore});
 }catch{return fail('Unable to retrieve quotation.',503);}
}
const CREATE_CART=`mutation QuotePayCart($input:CartInput!){cartCreate(input:$input){cart{id checkoutUrl} userErrors{message}}}`;
const ADD_ADDRESS=`mutation QuoteAddress($cartId:ID!,$addresses:[CartSelectableAddressInput!]!){cartDeliveryAddressesAdd(cartId:$cartId,addresses:$addresses){cart{id checkoutUrl} userErrors{message}}}`;
type CartResult={cartCreate:{cart:{id:string;checkoutUrl:string}|null;userErrors:{message:string}[]}};
type AddressResult={cartDeliveryAddressesAdd:{cart:{id:string;checkoutUrl:string}|null;userErrors:{message:string}[]}};
export async function POST(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const quote=await findPrivateQuote((await params).token,_request.nextUrl.searchParams.get('access'));
  if(!quote)return fail('Quotation not found.',404);
  if(quote.status==='cancelled'||Date.parse(quote.expires_at)<=Date.now())return fail('This quotation has expired.',409);
  if(quote.invoice_status==='paid')return fail('Invoice already paid.',409);
  const invoiceReference=quote.invoice_reference||quote.reference.replace('EA-Q-','EA-INV-');
  if(!quote.invoice_reference){
   await quoteDb('quotes','PATCH','id=eq.'+quote.id,{invoice_reference:invoiceReference,invoice_status:'unpaid',invoice_created_at:new Date().toISOString()});
  }
  return NextResponse.json({invoiceReference,status:'unpaid'},{headers:noStore});
 }catch{return fail('Unable to create invoice.',503);}
}
export async function PUT(_request:NextRequest,{params}:{params:Promise<{token:string}>}){
 try{
  const quote=await findPrivateQuote((await params).token,_request.nextUrl.searchParams.get('access'));
  if(!quote)return fail('Invoice not found.',404);
  if(!quote.invoice_reference)return fail('Convert your quotation to an invoice first.',409);
  if(quote.invoice_status==='paid'||quote.status==='purchased')return fail('This invoice has already been paid.',409);
  if(quote.status==='cancelled'||Date.parse(quote.expires_at)<=Date.now())return fail('This quotation has expired.',409);
  for(const item of quote.items){
   const product=await fetchProductByHandle(item.handle),variant=product?.variants.find(v=>v.id===item.variant_id);
   if(!variant?.availableForSale||variant.price.currencyCode!=='AUD'||Math.round(Number(variant.price.amount)*100)!==item.unit_price_cents)
    return fail('Product prices or availability changed. Please generate a new quotation.',409);
  }
  const created=await shopifyClient.request<CartResult>(CREATE_CART,{variables:{input:{
   lines:quote.items.map(i=>({merchandiseId:i.variant_id,quantity:i.quantity})),
   attributes:[{key:'enviro_aqua_quote',value:quote.reference},{key:'enviro_aqua_invoice',value:quote.invoice_reference}],
   buyerIdentity:{email:quote.customer_email,countryCode:'AU'},
  }}});
  const cart=created.data?.cartCreate?.cart;
  if(created.errors||!cart?.id||created.data?.cartCreate?.userErrors?.length)return fail('Checkout is unavailable.',503);
  let checkoutUrl=cart.checkoutUrl;
  const address=quote.delivery_address;
  if(address?.street&&address?.suburb&&address?.state&&address?.postcode){
   const names=quote.contact_name.trim().split(/\s+/);
   const firstName=names.shift()||'',lastName=names.join(' ');
   const updated=await shopifyClient.request<AddressResult>(ADD_ADDRESS,{variables:{cartId:cart.id,addresses:[{
    selected:true,oneTimeUse:true,validationStrategy:'COUNTRY_CODE_ONLY',
    address:{deliveryAddress:{firstName,lastName,company:quote.organisation,address1:address.street,city:address.suburb,provinceCode:address.state,zip:address.postcode,countryCode:'AU'}},
   }]}});
   const delivery=updated.data?.cartDeliveryAddressesAdd;
   if(updated.errors||!delivery?.cart||delivery.userErrors?.length)return fail('Shopify could not prefill the delivery address. Please try again.',503);
   checkoutUrl=delivery.cart.checkoutUrl||checkoutUrl;
  }
  await quoteDb('quotes','PATCH','id=eq.'+quote.id,{invoice_status:'checkout_started',status:'checkout_started',checkout_started_at:new Date().toISOString(),shopify_cart_id:cart.id});
  // Shopify may return the storefront host instead of the actual checkout host.
  const host=process.env.SHOPIFY_CHECKOUT_DOMAIN;
  if(host){const url=new URL(checkoutUrl);url.hostname=host;url.protocol='https:';checkoutUrl=url.toString();}
  return NextResponse.json({checkoutUrl},{headers:noStore});
 }catch{return fail('Unable to start invoice checkout.',503);}
}
