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
 if(/^EA-Q-(?:[A-F0-9]{16}|\d{4,})$/.test(token)){
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
const FETCH_CART=`query ExistingQuoteCheckout($id:ID!){cart(id:$id){id checkoutUrl}}`;
const ADD_ADDRESS=`mutation QuoteAddress($cartId:ID!,$addresses:[CartSelectableAddressInput!]!){cartDeliveryAddressesAdd(cartId:$cartId,addresses:$addresses){cart{id checkoutUrl deliveryGroups(first:10){nodes{id deliveryOptions{handle title deliveryMethodType estimatedCost{amount currencyCode}}}}} userErrors{message}}}`;
const SELECT_DELIVERY=`mutation QuoteSelectDelivery($cartId:ID!,$selectedDeliveryOptions:[CartSelectedDeliveryOptionInput!]!){cartSelectedDeliveryOptionsUpdate(cartId:$cartId,selectedDeliveryOptions:$selectedDeliveryOptions){cart{id checkoutUrl deliveryGroups(first:10){nodes{selectedDeliveryOption{handle}}}} userErrors{message}}}`;
type CartResult={cartCreate:{cart:{id:string;checkoutUrl:string}|null;userErrors:{message:string}[]}};
type DeliveryOption={handle:string;title:string|null;deliveryMethodType:string;estimatedCost:{amount:string;currencyCode:string}};
type DeliveryGroup={id:string;deliveryOptions:DeliveryOption[]};
type AddressResult={cartDeliveryAddressesAdd:{cart:{id:string;checkoutUrl:string;deliveryGroups:{nodes:DeliveryGroup[]}}|null;userErrors:{message:string}[]}};
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
  if(quote.shopify_order_id)return fail('An order has already been placed for this invoice. Please follow your order confirmation or contact Enviro Aqua.',409);
  if(quote.status==='cancelled'||Date.parse(quote.expires_at)<=Date.now())return fail('This quotation has expired.',409);
  // Reuse an already-created checkout instead of generating additional carts.
  if(quote.invoice_status==='checkout_started'&&quote.shopify_cart_id){
   const existing=await shopifyClient.request<{cart:{checkoutUrl:string}|null}>(FETCH_CART,{variables:{id:quote.shopify_cart_id}});
   if(existing.data?.cart?.checkoutUrl){
    const checkout=new URL(existing.data.cart.checkoutUrl);
    const host=process.env.SHOPIFY_CHECKOUT_DOMAIN;if(host){checkout.hostname=host;checkout.protocol='https:';}
    return NextResponse.json({checkoutUrl:checkout.toString(),reused:true},{headers:noStore});
   }
   return fail('Existing checkout is no longer available. Please contact Enviro Aqua for assistance.',409);
  }
  if(quote.invoice_status==='checkout_started'){
   return fail('Checkout is being prepared. Please try again shortly.',409);
  }
  for(const item of quote.items){
   const product=await fetchProductByHandle(item.handle),variant=product?.variants.find(v=>v.id===item.variant_id);
   if(!variant?.availableForSale||variant.price.currencyCode!=='AUD'||Math.round(Number(variant.price.amount)*100)!==item.unit_price_cents)
    return fail('Product prices or availability changed. Please generate a new quotation.',409);
  }
  const reserved=await quoteDb<{id:string}[]>('quotes','PATCH','id=eq.'+quote.id+'&invoice_status=eq.unpaid&shopify_cart_id=is.null&select=id',{invoice_status:'checkout_started',status:'checkout_started',checkout_started_at:new Date().toISOString()},'return=representation');
  if(!reserved.length)return fail('Checkout has already been started. Please refresh the page.',409);
  let checkoutReady=false;
  try{
  const created=await shopifyClient.request<CartResult>(CREATE_CART,{variables:{input:{
   lines:quote.items.map(i=>({merchandiseId:i.variant_id,quantity:i.quantity})),
   attributes:[{key:'enviro_aqua_quote',value:quote.reference},{key:'enviro_aqua_invoice',value:quote.invoice_reference},...(quote.shipping_selection?[{key:'enviro_aqua_delivery_method',value:quote.shipping_selection.deliveryMethodType},{key:'enviro_aqua_delivery_option',value:quote.shipping_selection.title}]:[])],
   buyerIdentity:{email:quote.customer_email,countryCode:'AU'},
  }}});
  const cart=created.data?.cartCreate?.cart;
  if(created.errors||!cart?.id||created.data?.cartCreate?.userErrors?.length)return fail('Checkout is unavailable.',503);
  await quoteDb('quotes','PATCH','id=eq.'+quote.id,{shopify_cart_id:cart.id});
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
   const choice=quote.shipping_selection;
   if(choice){
    const groups=delivery.cart.deliveryGroups.nodes;
    if(groups.length!==1)return fail('The delivery options for this order have changed. Please contact Enviro Aqua for an updated quote.',409);
    const match=groups[0].deliveryOptions.find(o=>
      o.title===choice.title&&o.deliveryMethodType===choice.deliveryMethodType&&
      o.estimatedCost.currencyCode==='AUD'&&Math.round(Number(o.estimatedCost.amount)*100)===choice.costCents
    );
    if(!match)return fail('Your quoted delivery or pickup option is no longer available at the agreed price. Please request an updated quote.',409);
    const selected=await shopifyClient.request<{cartSelectedDeliveryOptionsUpdate:{cart:{checkoutUrl:string;deliveryGroups:{nodes:Array<{selectedDeliveryOption:{handle:string}|null}>}}|null;userErrors:{message:string}[]}}>(SELECT_DELIVERY,{variables:{cartId:cart.id,selectedDeliveryOptions:[{deliveryGroupId:groups[0].id,deliveryOptionHandle:match.handle}]}});
    if(selected.errors||selected.data?.cartSelectedDeliveryOptionsUpdate.userErrors.length||selected.data?.cartSelectedDeliveryOptionsUpdate.cart?.deliveryGroups.nodes[0]?.selectedDeliveryOption?.handle!==match.handle)
      return fail('Shopify could not retain the selected delivery option. Please contact Enviro Aqua.',409);
    checkoutUrl=selected.data.cartSelectedDeliveryOptionsUpdate.cart.checkoutUrl||checkoutUrl;
   }
  }
  // Shopify may return the storefront host instead of the actual checkout host.
  const host=process.env.SHOPIFY_CHECKOUT_DOMAIN;
  if(host){const url=new URL(checkoutUrl);url.hostname=host;url.protocol='https:';checkoutUrl=url.toString();}
  checkoutReady=true;
  return NextResponse.json({checkoutUrl},{headers:noStore});
  }finally{
   if(!checkoutReady)await quoteDb('quotes','PATCH','id=eq.'+quote.id+'&shopify_cart_id=is.null&invoice_status=eq.checkout_started',{invoice_status:'unpaid',status:'issued',checkout_started_at:null});
  }
 }catch{return fail('Unable to start invoice checkout.',503);}
}
