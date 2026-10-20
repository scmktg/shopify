import { PDFDocument, StandardFonts, rgb, degrees, PDFName, PDFString } from 'pdf-lib';
import type { SavedQuote } from './server';

const money=(n:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(n/100);
const date=(v:string)=>new Date(v).toLocaleDateString('en-AU',{timeZone:'Australia/Sydney'});
const black=rgb(.09,.09,.11),grey=rgb(.34,.34,.38),light=rgb(.86,.86,.88),white=rgb(1,1,1);
const plain=(s:unknown)=>String(s??'').normalize('NFKD').replace(/[^\x20-\x7E]/g,'?');
export async function styledQuotePdf(q:SavedQuote,link:string,logoPng:Buffer):Promise<Uint8Array>{
 const doc=await PDFDocument.create();
 doc.setTitle((q.invoice_reference?'Invoice ':'Quotation ')+(q.invoice_reference||q.reference));doc.setAuthor('Enviro Aqua');
 const normal=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const logo=await doc.embedPng(logoPng);
 const W=595.28,H=841.89,L=45,R=550;
 let page=doc.addPage([W,H]),y=H-45;
 const line=(text:string,x:number,top:number,size=9,isBold=false,color=black,opts?:{right?:number})=>{
  const font=isBold?bold:normal;const value=plain(text);let xx=x;
  if(opts?.right!==undefined)xx=opts.right-font.widthOfTextAtSize(value,size);
  page.drawText(value,{x:xx,y:H-top-size,size,font,color});
 };
 const hline=(top:number,x=L,end=R,thickness=1,color=light)=>page.drawLine({start:{x,y:H-top},end:{x:end,y:H-top},thickness,color});
 const wrap=(v:string,maxW:number,size=9,isBold=false)=>{
  const font=isBold?bold:normal,parts=plain(v).split(/\s+/);const result:string[]=[];let current='';
  for(const part of parts){const test=current?current+' '+part:part;if(font.widthOfTextAtSize(test,size)>maxW&&current){result.push(current);current=part;}else current=test;}
  if(current)result.push(current);return result;
 };
 const header=()=>{
  page.drawImage(logo,{x:L,y:H-94,width:160,height:48});
  ['6/45 Amsterdam Circuit, Wyong NSW 2259','(02) 8772 8162','info@enviroaqua.com.au','www.enviroaqua.com.au','ABN: 24 638 197 734'].forEach((t,i)=>line(t,L,105+i*12,8.5,false,grey));
  line(q.invoice_reference?'INVOICE':'QUOTATION',R-185,49,12,true,black,{right:R});
  line(q.invoice_reference||q.reference,R-250,72,8.5,false,grey,{right:R});
  if(q.invoice_reference)line(q.invoice_status==='paid'?'PAID':'UNPAID',R-110,92,10,true,q.invoice_status==='paid'?rgb(.09,.48,.21):rgb(.6,.12,.12),{right:R});
  hline(186,L,R,1.5,black);
 };
 const next=()=>{page=doc.addPage([W,H]);header();return 218;};
 header();let top=209;
 line('PREPARED FOR',L,top,9,true,grey);
 line(q.organisation,L,top+19,10,true);
 line(q.contact_name,L,top+37,9);
 line(q.customer_email,L,top+52,9);
 let cy=top+69;
 const a=q.delivery_address;
 if(a){line('DELIVERY TO',L,cy+10,9,true,grey);cy+=27;for(const row of [a.street,a.suburb+' '+a.state+' '+a.postcode,...(a.abn?['Customer ABN: '+a.abn]:[])]){for(const part of wrap(row,260)){line(part,L,cy,9);cy+=14;}}}
 line('Reference: '+q.reference,340,top,8.5,false,grey,{right:R});
 line('Issued: '+date(q.invoice_created_at||q.created_at),340,top+17,8.5,false,grey,{right:R});
 if(!q.invoice_reference)line('Valid until: '+date(q.expires_at),340,top+34,8.5,false,grey,{right:R});
 top=Math.max(cy+29,357);
 const tableHeader=()=>{
  line('PRODUCT',L,top,9,true);line('QTY',348,top,9,true);line('UNIT',424,top,9,true);line('TOTAL',R-38,top,9,true);
  hline(top+23,L,R,1.6,black);top+=36;
 };
 tableHeader();
 for(const item of q.items){
  const parts=[...wrap(item.name,283,9),...(item.variant==='Default Title'?[]:wrap(item.variant,283,8))];
  const height=Math.max(32,parts.length*13+12);
  if(top+height>690){top=next();tableHeader();}
  parts.forEach((part,i)=>line(part,L,top+i*13,i<parts.length-1?9:9,false,i===0?black:grey));
  line(String(item.quantity),348,top,9);
  line(money(item.unit_price_cents),390,top,9,false,black,{right:460});
  line(money(item.quantity*item.unit_price_cents),466,top,9,true,black,{right:R});
  hline(top+height-5);top+=height;
 }
 if(top+190>730)top=next();
 const tx=329;hline(top+10,tx,R,1.5,black);top+=28;
 const totalRow=(label:string,value:string,isBold=false)=>{line(label,tx,top,isBold?10.5:9,isBold,isBold?black:grey);line(value,475,top,isBold?10.5:9,isBold,black,{right:R});top+=24;};
 totalRow('Products',money(q.product_total_cents));
 totalRow('Shipping fee',q.freight_cents==null?'Pending':money(q.freight_cents));
 totalRow('Included GST',money(q.included_gst_cents??Math.round(q.product_total_cents/11)));
 hline(top,tx,R);top+=12;
 totalRow('Total incl. GST',money(q.product_total_cents+(q.freight_cents??0)),true);
 top=Math.max(top+23,645);if(top+88>H-45)top=next();
 const button=(q.invoice_reference?(q.invoice_status==='paid'?'VIEW PAID INVOICE':'PAY INVOICE'):'CONVERT TO INVOICE');
 page.drawRectangle({x:L,y:H-(top+46),width:R-L,height:46,color:black});
 const btnSize=12;const textWidth=bold.widthOfTextAtSize(button+'  >',btnSize);
 page.drawText(button+'  >',{x:L+(R-L-textWidth)/2,y:H-top-29,font:bold,size:btnSize,color:white});
 const linkAction=doc.context.obj({S:PDFName.of('URI'),URI:PDFString.of(link)});
 const annotation=doc.context.obj({Type:PDFName.of('Annot'),Subtype:PDFName.of('Link'),Rect:[L,H-top-46,R,H-top],Border:[0,0,0],A:linkAction});
 page.node.addAnnot(doc.context.register(annotation));
 line('Click to open your saved document on enviroaqua.com.au',L+104,top+59,8,false,grey);
 if(q.invoice_reference&&q.invoice_status!=='paid')page.drawText('UNPAID',{x:135,y:400,size:73,font:bold,color:rgb(.9,.9,.92),rotate:degrees(33)});
 return doc.save();
}
