import {createHmac,timingSafeEqual} from 'node:crypto';
const key=process.env.QUOTES_LINK_SIGNING_KEY;
export function quoteAccessSignature(reference:string){
 if(!key)throw new Error('Quote access not configured');
 return createHmac('sha256',key).update('quote-pdf-link:v1:'+reference).digest('hex');
}
export function validQuoteSignature(reference:string,signature:string|null){
 if(!signature||!/^[a-f0-9]{64}$/.test(signature)||!/^EA-Q-(?:[A-F0-9]{16}|\d{4,})$/.test(reference)||!key)return false;
 const a=Buffer.from(signature,'hex'),b=Buffer.from(quoteAccessSignature(reference),'hex');
 return timingSafeEqual(a,b);
}
