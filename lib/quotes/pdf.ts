import type { SavedQuote } from './server';

const dollars = (cents: number) => '$' + (cents / 100).toFixed(2);
const ascii = (value: string) => value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '?');
const esc = (value: string) => ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const wrap = (value: string, max = 85): string[] => {
  const words = ascii(value).split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = ''; }
    if (word.length > max) {
      if (line) { lines.push(line); line = ''; }
      for (let i = 0; i < word.length; i += max) lines.push(word.slice(i, i + max));
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
};

// Minimal vector PDF writer; no remotely loaded assets or unsafe HTML.
export function quotePdf(quote: SavedQuote, onlineUrl?: string): Buffer {
  const pages: string[][] = [[]];
  let y = 785;
  function line(value: string, size = 10, bold = false, gap = 17) {
    if (y < 70) { pages.push([]); y = 785; }
    pages[pages.length - 1].push('BT /F' + (bold ? '2' : '1') + ' ' + size +
      ' Tf 48 ' + y + ' Td (' + esc(value) + ') Tj ET');
    y -= gap;
  }
  const invoice=Boolean(quote.invoice_reference);
  line('ENVIRO AQUA',20,true,25);
  line('6/45 Amsterdam Circuit, Wyong NSW 2259',9,false,13);
  line('(02) 8772 8162  |  info@enviroaqua.com.au  |  www.enviroaqua.com.au',9,false,13);
  line('ABN: 24 638 197 734',9,false,26);
  line(invoice?'INVOICE':'QUOTATION',17,true,24);
  line('Reference: '+(quote.invoice_reference||quote.reference),10,true,17);
  line('Issued: '+new Date(quote.invoice_created_at||quote.created_at).toLocaleDateString('en-AU',{timeZone:'Australia/Sydney'}),9);
  if(!invoice)line('Valid until: '+new Date(quote.expires_at).toLocaleDateString('en-AU',{timeZone:'Australia/Sydney'}),9);
  if(invoice)line('Status: '+(quote.invoice_status==='paid'?'PAID':'PAYMENT OUTSTANDING'),10,true);
  y-=12;
  line('PREPARED FOR',9,true,16);
  line(quote.organisation,10,true,16);
  line(quote.contact_name,9);
  line(quote.customer_email,9);
  const addr=quote.delivery_address;
  if(addr){line('DELIVERY TO',9,true);for(const x of wrap(addr.street+', '+addr.suburb+' '+addr.state+' '+addr.postcode,82))line(x,9);
   if(addr.abn)line('Customer ABN: '+addr.abn,9);
  }
  y-=12;line('PRODUCTS',10,true,22);
  for(const item of quote.items){
   for(const part of wrap(item.name+(item.variant==='Default Title'?'':' / '+item.variant),78))line(part,9,true,14);
   line('Qty: '+item.quantity+'    Unit: '+dollars(item.unit_price_cents)+'    Total: '+dollars(item.quantity*item.unit_price_cents),9,false,20);
  }
  y-=8;
  line('Products (incl. GST): '+dollars(quote.product_total_cents),10,true);
  line('Shipping: '+(quote.freight_cents==null?'To be confirmed':dollars(quote.freight_cents)),9);
  line('Included GST: '+dollars(quote.included_gst_cents??Math.round(quote.product_total_cents/11)),9);
  line('TOTAL (incl. GST): '+dollars(quote.product_total_cents+(quote.freight_cents??0)),12,true,26);
  if(invoice&&quote.invoice_status==='paid')line('PAID - Thank you for your payment',12,true,23);
  if(onlineUrl){
   if(y<140){pages.push([]);y=785;}
   line(invoice?'PAY INVOICE ONLINE':'CONVERT TO INVOICE ONLINE',12,true,23);
   line('Click the button above to securely open your saved document.',9);
  }
  const linkPage=pages.length-1;
  const linkY=y+40;
  const objects: string[] = [''];
  const push = (s: string) => { objects.push(s); return objects.length - 1; };
  const catalog = push('');
  const pagesId = push('');
  const font = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFont = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const kids: number[] = [];
  const linkUri=onlineUrl?onlineUrl.replace(/[^\x20-\x7E]/g,''):null;
  const linkAnnot=linkUri?push('<< /Type /Annot /Subtype /Link /Rect [42 '+(linkY-9)+' 510 '+(linkY+18)+'] /Border [0 0 0] /A << /S /URI /URI ('+esc(linkUri)+') >> >>'):null;
  for (const [index,lines] of pages.entries()) {
    if(invoice&&quote.invoice_status!=='paid'&&index===0)lines.unshift('q 0.9 g BT /F2 75 Tf 98 435 Td 0.82 0.57 -0.57 0.82 0 0 Tm (UNPAID) Tj ET Q');
    const stream = lines.join('\n') + '\n';
    const contentId = push('<< /Length ' + Buffer.byteLength(stream, 'latin1') + ' >>\nstream\n' + stream + 'endstream');
    kids.push(push('<< /Type /Page /Parent ' + pagesId + ' 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ' + font + ' 0 R /F2 ' + boldFont + ' 0 R >> >> /Contents ' + contentId + ' 0 R '+(linkAnnot!==null&&index===linkPage?'/Annots ['+linkAnnot+' 0 R] ':'')+'>>'));
  }
  objects[pagesId] = '<< /Type /Pages /Count ' + kids.length + ' /Kids [' + kids.map(i => i + ' 0 R').join(' ') + '] >>';
  objects[catalog] = '<< /Type /Catalog /Pages ' + pagesId + ' 0 R >>';
  let document = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(document, 'latin1'));
    document += i + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }
  const xref = Buffer.byteLength(document, 'latin1');
  document += 'xref\n0 ' + objects.length + '\n0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) document += String(offset).padStart(10, '0') + ' 00000 n \n';
  document += 'trailer\n<< /Size ' + objects.length + ' /Root ' + catalog + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  return Buffer.from(document, 'latin1');
}
