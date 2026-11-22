import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyticsUrl,startAnalytics} from '../src/analytics.mjs';

function environment(url='https://sevendeadlysinstest.xyz/result/#v1:100,0,0,0,0,0,0'){
 const appended=[];
 return {win:{location:new URL(url)},doc:{referrer:'https://www.google.com/search?q=private',createElement:()=>({}),head:{appendChild:node=>appended.push(node)}},appended};
}
test('result fragments and non-campaign query values never enter analytics URLs',()=>{
 assert.equal(analyticsUrl('https://sevendeadlysinstest.xyz/result/?scores=100&email=someone#v1:100,0,0,0,0,0,0'),'https://sevendeadlysinstest.xyz/result/');
 assert.equal(analyticsUrl('https://sevendeadlysinstest.xyz/quiz/?utm_source=google&utm_medium=cpc&new=1#private'),'https://sevendeadlysinstest.xyz/quiz/?utm_source=google&utm_medium=cpc');
 assert.equal(analyticsUrl('javascript:alert(1)'),'');
});
test('local preview, unknown domains and missing measurement IDs never load Google',()=>{
 for(const url of ['http://127.0.0.1:4173/','http://localhost:4173/','https://preview.example/']){
  const env=environment(url);assert.equal(startAnalytics({...env,measurementId:'G-TEST123456'}),false);assert.equal(env.appended.length,0);
 }
 const env=environment();assert.equal(startAnalytics({...env,measurementId:''}),false);assert.equal(env.appended.length,0);
});
test('production loads one tag, configures one pageview and strips score/referrer data',()=>{
 const env=environment();assert.equal(startAnalytics({...env,measurementId:'G-TEST123456'}),true);assert.equal(startAnalytics({...env,measurementId:'G-TEST123456'}),false);
 assert.equal(env.appended.length,1);assert.match(env.appended[0].src,/gtag\/js\?id=G-TEST123456$/);
 const commands=env.win.dataLayer.map(item=>Array.from(item));
 assert.equal(commands.filter(item=>item[0]==='config').length,1);
 assert.equal(commands.filter(item=>item[0]==='event'&&item[1]==='page_view').length,0);
 const config=commands.find(item=>item[0]==='config')[2];
 assert.equal(config.page_location,'https://sevendeadlysinstest.xyz/result/');assert.equal(config.page_referrer,'https://www.google.com/search');
 assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);
 assert.equal(JSON.stringify(commands).includes('v1:'),false);
});
test('every generated page includes the shared analytics module exactly once',async()=>{
 for(const route of ['dist/index.html','dist/result/index.html','dist/seven-deadly-sins/index.html','dist/results-guide/index.html','dist/how-it-works/index.html','dist/about/index.html','dist/privacy/index.html','dist/contact/index.html',...['pride','greed','lust','envy','gluttony','wrath','sloth'].map(id=>`dist/sins/${id}/index.html`)]){
  const html=await readFile(route,'utf8');assert.equal((html.match(/src="\/assets\/analytics\.mjs"/g)||[]).length,1,route);
 }
});
