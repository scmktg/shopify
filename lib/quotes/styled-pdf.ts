import PDFDocument from 'pdfkit';
import type {SavedQuote} from './server';
const money=(c:number)=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(c/100);
const date=(v:string)=>new Date(v).toLocaleDateString('en-AU',{timeZone:'Australia/Sydney',day:'2-digit',month:'2-digit',year:'numeric'});
const dark='#18181b',grey='#52525b',light='#e4e4e7';
export async function styledQuotePdf(q:SavedQuote,link:string,logoPng:Buffer):Promise<Buffer>{
 const doc=new PDFDocument({size:'A4',margin:0,autoFirstPage:true,compress:true,info:{Title:(q.invoice_reference?'Invoice ':'Quotation ')+(q.invoice_reference||q.reference),Author:'Enviro Aqua'}});
 const chunks:Buffer[]=[];doc.on('data',(part:Buffer)=>chunks.push(part));
 const done=new Promise<Buffer>((resolve,reject)=>{doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject);});
 const left=45,right=550,w=right-left,top=44;
 const txt=(s:string,x:number,y:number,options:PDFKit.Mixins.TextOptions={})=>doc.text(s,x,y,options);
 const rule=(y:number,width=1,color=light)=>{doc.moveTo(left,y).lineTo(right,y).lineWidth(width).strokeColor(color).stroke();};
 const invoice=Boolean(q.invoice_reference),paid=q.invoice_status==='paid';
 const addHeader=()=>{
  doc.image(logoPng,left,top,{fit:[160,48]});
  doc.fillColor(grey).font('Helvetica').fontSize(8.7);
  ['6/45 Amsterdam Circuit, Wyong NSW 2259','(02) 8772 8162','info@enviroaqua.com.au','www.enviroaqua.com.au','ABN: 24 638 197 734'].forEach((s,i)=>txt(s,left,106+i*12));
  doc.fillColor(dark).font('Helvetica-Bold').fontSize(12).text(invoice?'INVOICE':'QUOTATION',right-180,49,{width:180,align:'right'});
  doc.fillColor(grey).font('Helvetica').fontSize(8).text(q.invoice_reference||q.reference,right-210,70,{width:210,align:'right'});
  if(invoice)doc.font('Helvetica-Bold').fontSize(9).fillColor(paid?'#15803d':'#991b1b').text(paid?'PAID':'UNPAID',right-120,88,{width:120,align:'right'});
  rule(185,1.6,dark);
 };
 const pageNext=()=>{doc.addPage();addHeader();return 213;};
 addHeader();let y=207;
 doc.fillColor(grey).font('Helvetica-Bold').fontSize(9);txt('PREPARED FOR',left,y);
 doc.fillColor(dark).font('Helvetica-Bold').fontSize(10);txt(q.organisation,left,y+18,{width:270});
 let cy=y+35;doc.font('Helvetica').fontSize(9);for(const s of [q.contact_name,q.customer_email]){txt(s,left,cy,{width:255});cy+=15;}
 if(q.delivery_address){cy+=11;doc.fillColor(grey).font('Helvetica-Bold').fontSize(9);txt('DELIVERY TO',left,cy);cy+=16;doc.fillColor(dark).font('Helvetica').fontSize(9);for(const s of [q.delivery_address.street,q.delivery_address.suburb+' '+q.delivery_address.state+' '+q.delivery_address.postcode,...(q.delivery_address.abn?['Customer ABN: '+q.delivery_address.abn]:[])]){txt(s,left,cy,{width:265});cy+=14;}}
 doc.fillColor(grey).font('Helvetica').fontSize(9).text('Reference: '+q.reference,335,y,{width:215,align:'right'});
 doc.text('Issued: '+date(q.invoice_created_at||q.created_at),335,y+16,{width:215,align:'right'});
 if(!invoice)doc.text('Valid until: '+date(q.expires_at),335,y+32,{width:215,align:'right'});
 y=Math.max(cy+30,355);
 const tableHeader=()=>{doc.fillColor(dark).font('Helvetica-Bold').fontSize(9);txt('PRODUCT',left,y);txt('QTY',343,y,{width:36,align:'center'});txt('UNIT',391,y,{width:65,align:'right'});txt('TOTAL',465,y,{width:85,align:'right'});rule(y+24,1.8,dark);y+=33;};
 tableHeader();
 for(const item of q.items){
  const desc=item.name+(item.variant==='Default Title'?'':'\n'+item.variant);
  doc.font('Helvetica').fontSize(9);
  const height=Math.max(31,doc.heightOfString(desc,{width:285,lineGap:2})+14);
  if(y+height>692){y=pageNext();tableHeader();}
  doc.fillColor(dark).font('Helvetica').fontSize(9);txt(desc,left,y,{width:285,lineGap:2});
  txt(String(item.quantity),343,y,{width:36,align:'center'});
  txt(money(item.unit_price_cents),391,y,{width:65,align:'right'});
  doc.font('Helvetica-Bold');txt(money(item.unit_price_cents*item.quantity),465,y,{width:85,align:'right'});
  rule(y+height-7);y+=height;
 }
 if(y+210>745){y=pageNext();}
 const totalX=326,totalW=224;doc.moveTo(totalX,y+12).lineTo(right,y+12).strokeColor(dark).lineWidth(1.8).stroke();y+=27;
 const totalRow=(label:string,value:string,bold=false)=>{doc.fillColor(bold?dark:grey).font(bold?'Helvetica-Bold':'Helvetica').fontSize(bold?11:9);txt(label,totalX,y,{width:143});txt(value,470,y,{width:80,align:'right'});y+=25;};
 totalRow('Products',money(q.product_total_cents));
 totalRow('Shipping fee',q.freight_cents==null?'Pending':money(q.freight_cents));
 totalRow('Included GST',money(q.included_gst_cents??Math.round(q.product_total_cents/11)));
 doc.moveTo(totalX,y).lineTo(right,y).lineWidth(0.8).strokeColor(light).stroke();y+=12;
 totalRow('Total (incl. GST)',money(q.product_total_cents+(q.freight_cents??0)),true);
 y=Math.max(y+20,645);
 if(y+86>760)y=pageNext();
 const label=invoice?(paid?'VIEW PAID INVOICE':'PAY INVOICE'):'CONVERT TO INVOICE';
 doc.roundedRect(left,y,w,44,7).fill(dark);
 doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12).text(label+'  >',left,y+15,{width:w,align:'center',link,underline:false});
 doc.link(left,y,w,44,link);
 doc.fillColor(grey).font('Helvetica').fontSize(8).text('Click to open your saved document on enviroaqua.com.au',left,y+55,{width:w,align:'center'});
 if(invoice&&!paid){doc.save();doc.rotate(-33,{origin:[285,430]});doc.fillColor('#e6e6e8').font('Helvetica-Bold').fontSize(74).text('UNPAID',112,388,{width:370,align:'center'});doc.restore();}
 doc.end();return done;
}
