import 'server-only';
import {createHash} from 'node:crypto';
const url=process.env.QUOTES_SUPABASE_URL,key=process.env.QUOTES_SUPABASE_SERVICE_ROLE_KEY;
export async function claimQuoteLimit(identity:string,max:number,seconds:number):Promise<boolean>{
 if(!url||!key)throw new Error('Quote rate limiting unavailable');
 const bucket=createHash('sha256').update(identity).digest('hex');
 const response=await fetch(url+'/rest/v1/rpc/claim_quote_limit',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_bucket:bucket,p_max:max,p_seconds:seconds}),cache:'no-store'});
 if(!response.ok)throw new Error('Quote rate limiting unavailable');
 return (await response.json())===true;
}
