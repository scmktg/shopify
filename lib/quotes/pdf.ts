import 'server-only';
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
export function quotePdf(quote: SavedQuote): Buffer {
  const pages: string[][] = [[]];
  let y = 785;
  function line(value: string, size = 10, bold = false, gap = 17) {
    if (y < 70) { pages.push([]); y = 785; }
    pages[pages.length - 1].push('BT /F' + (bold ? '2' : '1') + ' ' + size +
      ' Tf 48 ' + y + ' Td (' + esc(value) + ') Tj ET');
    y -= gap;
  }
  line('ENVIRO AQUA', 22, true, 22);
  line('ABN 24 638 197 734  |  ACN 638 197 734', 9, false, 15);
  line('6/45 Amsterdam Cct, Wyong NSW 2259  |  (02) 8772 8162', 9, false, 15);
  line('info@enviroaqua.com.au  |  www.enviroaqua.com.au', 9, false, 31);
  line('FORMAL PRODUCT QUOTATION', 16, true, 29);
  line('Quote reference: ' + quote.reference, 11, true);
  line('Issued: ' + new Date(quote.created_at).toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }));
  line('Valid until: ' + new Date(quote.expires_at).toLocaleDateString('en-AU', { timeZone: 'Australia/Melbourne' }), 10, false, 25);
  line('Prepared for: ' + quote.organisation, 11, true);
  line('Attention: ' + quote.contact_name);
  line('Email: ' + quote.customer_email);
  line('Delivery postcode: ' + quote.postcode, 10, false, 29);
  line('PRODUCTS', 12, true, 23);
  for (const item of quote.items) {
    for (const part of wrap(item.name + (item.variant === 'Default Title' ? '' : ' / ' + item.variant), 83)) line(part, 10, true, 15);
    line('Quantity: ' + item.quantity + '    Unit: ' + dollars(item.unit_price_cents) +
      '    Line total: ' + dollars(item.unit_price_cents * item.quantity), 10, false, 22);
  }
  line('Product subtotal (AUD): ' + dollars(quote.product_total_cents), 12, true, 29);
  for (const part of [
    'Freight: TO BE CONFIRMED. Freight is not included in the subtotal.',
    'Product pricing is based on Shopify prices at the time of issue.',
    'The final order total, including freight and applicable taxes,',
    'will be confirmed before payment at Shopify checkout.',
    'This document is a quotation, not a tax invoice or proof of payment.',
    'Subject to product availability and the stated validity period.',
    'Purchase orders and invoice terms require separate approval.',
  ]) line(part, 9, false, 15);
  const objects: string[] = [''];
  const push = (s: string) => { objects.push(s); return objects.length - 1; };
  const catalog = push('');
  const pagesId = push('');
  const font = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFont = push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const kids: number[] = [];
  for (const lines of pages) {
    const stream = lines.join('\n') + '\n';
    const contentId = push('<< /Length ' + Buffer.byteLength(stream, 'latin1') + ' >>\nstream\n' + stream + 'endstream');
    kids.push(push('<< /Type /Page /Parent ' + pagesId + ' 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ' + font + ' 0 R /F2 ' + boldFont + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>'));
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
