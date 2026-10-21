import { NextRequest, NextResponse } from 'next/server';
import { fetchProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { estimateQuoteShipping } from '@/lib/shopify/cart';
import { newAccessToken, newQuoteReference, normaliseEmail, quoteDb, quoteDbConfigured, tokenDigest } from '@/lib/quotes/server';

export const runtime = 'nodejs';
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:NextRequest){
 if(!quoteDbConfigured())return fail('Quote storage is not configured.',503);
 const size=Number(request.headers.get('content-length')||0);
 if(size>16000)return fail('Request too large.',413);
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return fail('Invalid request.');}
 const email=normaliseEmail(String(body.email||''));
 const organisation=String(body.organisation||'').trim();
 const contact=String(body.contact||'').trim();
 const street=String(body.street||'').trim();
 const suburb=String(body.suburb||'').trim();
 const state=String(body.state||'').trim();
 const postcode=String(body.postcode||'').trim();
 const abn=String(body.abn||'').replace(/\s/g,'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>160||!organisation||organisation.length>120||!contact||contact.length>100||street.length<3||street.length>180||suburb.length<2||suburb.length>90||!['NSW','ACT','VIC','QLD','SA','WA','TAS','NT'].includes(state)||!/^\d{4}$/.test(postcode)||Boolean(abn&&!/^\d{11}$/.test(abn)))return fail('Please complete all required customer and delivery fields.');
 if(!Array.isArray(body.items)||body.items.length<1||body.items.length>20)return fail('Choose between 1 and 20 products.');
 const selected: {handle:string;variantId:string;quantity:number}[]=[];
 for(const raw of body.items){
  if(!raw||typeof raw!=='object')return fail('Invalid product.');
  const row=raw as Record<string,unknown>;
  const handle=String(row.handle||''),variantId=String(row.variantId||''),quantity=Number(row.quantity);
  if(!/^[a-z0-9-]{2,160}$/.test(handle)||!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)||!Number.isInteger(quantity)||quantity<1||quantity>99)return fail('Invalid product.');
  selected.push({handle,variantId,quantity});
 }
 if(new Set(selected.map(v=>v.variantId)).size!==selected.length)return fail('Duplicate product variants.');
 try{
  const recent=await quoteDb<{id:string}[]>('quotes','GET','select=id&customer_email=eq.'+encodeURIComponent(email)+'&created_at=gte.'+encodeURIComponent(new Date(Date.now()-3600000).toISOString())+'&limit=31');
  if(recent.length>=30)return fail('Quote generation limit reached for this email address. Please try again later.',429);
  const items=[];
  for(const row of selected){
   const product=await fetchProductByHandle(row.handle);
   const variant=product?.variants.find(v=>v.id===row.variantId);
   if(!product||!variant||!variant.availableForSale||variant.price.currencyCode!=='AUD')return fail('One selected product is unavailable.');
   const unit=Math.round(Number(variant.price.amount)*100);
   if(!Number.isSafeInteger(unit)||unit<0)return fail('Invalid product price.');
   items.push({handle:product.handle,variant_id:variant.id,name:product.title,variant:variant.title,quantity:row.quantity,unit_price_cents:unit});
  }
  const total=items.reduce((sum,item)=>sum+item.unit_price_cents*item.quantity,0);
  // Shipping estimates are informational. Never trust the price submitted by a browser.
  // Checkout always recalculates its own shipping and taxes.
  const estimated=await estimateQuoteShipping(items.map(i=>({variantId:i.variant_id,quantity:i.quantity})),{street,city:suburb,provinceCode:state,postcode});
  if(!estimated.ok||!estimated.options.length)return fail('Shipping must be successfully calculated before a quotation can be generated. Please check your delivery address and try again.',422);
  const requested=body.shippingSelection;
  if(!requested||typeof requested!=='object')return fail('Please select an available shipping or pickup option.',422);
  const choice=requested as Record<string,unknown>;
  const matching=estimated.options.find(o=>o.title===choice.title&&o.deliveryMethodType===choice.deliveryMethodType&&Math.round(Number(o.estimatedCost.amount)*100)===Number(choice.costCents));
  if(!matching)return fail('Your selected delivery option is no longer available at this price. Please recalculate shipping.',409);
  const shippingSelection={title:matching.title||'Delivery',deliveryMethodType:matching.deliveryMethodType,costCents:Math.round(Number(matching.estimatedCost.amount)*100)};
  const freight=shippingSelection.costCents;
  if(!Number.isSafeInteger(freight)||freight<0)return fail('Unable to confirm a valid shipping fee. Please try again.',422);
  const token=newAccessToken(),reference=await newQuoteReference();
  const rows=await quoteDb<{id:string}[]>('quotes','POST','select=id',[{
   reference,access_token_digest:tokenDigest(token),customer_email:email,organisation,contact_name:contact,postcode,items,
   delivery_address:{street,suburb,state,postcode,abn:abn||null},shipping_selection:shippingSelection,product_total_cents:total,freight_cents:freight,included_gst_cents:Math.round(total/11)+(Math.round(freight/11)),
   freight_status:'confirmed',status:'issued',
  }],'return=representation');
  if(!rows[0])throw new Error('Save failed');
  return NextResponse.json({reference,url:'/quotes/view/'+token},{status:201,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }catch{return fail('Unable to save quotation.',503);}
}
