import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
const NAME='ea_quote_lookup';
const key=process.env.QUOTES_LINK_SIGNING_KEY;
const ttl=60*60*12;
const sign=(body:string)=>createHmac('sha256',key||'').update(body).digest('hex');
export async function authorizeQuote(reference:string){
 if(!key)return false;
 const raw=(await cookies()).get(NAME)?.value;
 if(!raw)return false;
 const [ref,expires,mac]=raw.split('.');
 if(ref!==reference||!expires||!mac||!/^EA-Q-[A-F0-9]{16}$/.test(ref)||Number(expires)<Math.floor(Date.now()/1000))return false;
 const expected=sign(ref+'.'+expires);
 const a=Buffer.from(mac,'utf8'),b=Buffer.from(expected,'utf8');
 return a.length===b.length&&timingSafeEqual(a,b);
}
export async function setQuoteLookup(reference:string){
 if(!key)throw new Error('Quote lookup not configured');
 const expires=Math.floor(Date.now()/1000)+ttl;
 const body=reference+'.'+expires;
 (await cookies()).set(NAME,body+'.'+sign(body),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/quotes',maxAge:ttl});
}
