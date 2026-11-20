// GA4 web-stream Measurement ID for sevendeadlysinstest.xyz.
export const GA4_MEASUREMENT_ID='G-774WEVP8GG';
const productionHosts=new Set(['sevendeadlysinstest.xyz','www.sevendeadlysinstest.xyz']);
const campaignParameters=['utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content','gclid','gbraid','wbraid'];

// Never include result fragments, answers, scores, or arbitrary query parameters.
export function analyticsUrl(value,{campaigns=true}={}){
 try{
  const input=new URL(value);
  if(!['http:','https:'].includes(input.protocol))return '';
  const clean=new URL(input.origin+input.pathname);
  if(campaigns)for(const name of campaignParameters){const item=input.searchParams.get(name);if(item)clean.searchParams.set(name,item.slice(0,200));}
  return clean.href;
 }catch{return '';}
}

export function startAnalytics({measurementId=GA4_MEASUREMENT_ID,win=globalThis.window,doc=globalThis.document}={}){
 if(!win||!doc||!/^G-[A-Z0-9]{6,20}$/.test(measurementId))return false;
 if(!productionHosts.has(win.location.hostname)||win.__sevenLittleSinsGA4||win['ga-disable-'+measurementId]===true)return false;
 const pageLocation=analyticsUrl(win.location.href);
 if(!pageLocation)return false;
 win.__sevenLittleSinsGA4=true;
 win.dataLayer=win.dataLayer||[];
 win.gtag=win.gtag||function(){win.dataLayer.push(arguments);};
 const settings={
  page_location:pageLocation,
  page_referrer:analyticsUrl(doc.referrer,{campaigns:false}),
  allow_google_signals:false,
  allow_ad_personalization_signals:false,
 };
 win.gtag('js',new Date());
 win.gtag('set',settings);
 // One automatic page_view for this page load; do not send another manually.
 win.gtag('config',measurementId,settings);
 const script=doc.createElement('script');
 script.async=true;
 script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(measurementId);
 doc.head.appendChild(script);
 return true;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')startAnalytics();
