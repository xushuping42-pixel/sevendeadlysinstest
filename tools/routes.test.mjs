import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {sins} from '../src/data.mjs';
test('the complete quiz is mounted between the ribbon and the character lineup',async()=>{
 const html=await readFile('dist/index.html','utf8');
 assert.equal((html.match(/id="quiz-app"/g)||[]).length,1);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.indexOf('class="ribbon"')<html.indexOf('id="quiz"'));
 assert.ok(html.indexOf('id="quiz"')<html.indexOf('id="meet"'));
 assert.equal(html.includes('href="/quiz/"'),false);
 assert.ok(html.includes('href="/#quiz"'));
});
test('old quiz content is removed and permanent redirects are emitted',async()=>{
 await assert.rejects(access('dist/quiz/index.html'));
 const redirects=await readFile('dist/_redirects','utf8');
 assert.match(redirects,/^\/quiz\/ \/#quiz 301$/m);
 assert.match(redirects,/^\/quiz \/#quiz 301$/m);
 const map=await readFile('dist/sitemap.xml','utf8');
 assert.equal((map.match(/<loc>/g)||[]).length,8);
 assert.ok(map.includes('<loc>https://sevendeadlysinstest.xyz/</loc>'));
 assert.equal(map.includes('/quiz/'),false);assert.equal(map.includes('/result/'),false);
});
test('result retake and friend links return to the home quiz',async()=>{
 const source=await readFile('src/result.mjs','utf8');
 assert.ok(source.includes('href="/?new=1#quiz"'));
 assert.ok(source.includes('${location.origin}/#quiz'));
 assert.equal(source.includes('href="/quiz/"'),false);
});

test('all seven guides are indexable, linked from home, and have distinct editorial content',async()=>{
 const home=await readFile('dist/index.html','utf8'),map=await readFile('dist/sitemap.xml','utf8');
 const titles=new Set(),descriptions=new Set(),distinctions=new Set();
 for(const sin of sins){
  const route=`/sins/${sin.id}/`,html=await readFile(`dist${route}index.html`,'utf8');
  assert.ok(home.includes(`href="${route}"`),`Home must link directly to ${route}`);
  assert.ok(map.includes(`<loc>https://sevendeadlysinstest.xyz${route}</loc>`));
  assert.ok(html.includes(`rel="canonical" href="https://sevendeadlysinstest.xyz${route}"`));
  assert.equal(html.includes('noindex'),false);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('<h1>'+sin.name+'<span>.</span></h1>'));
  assert.equal((html.match(/<details>/g)||[]).length,2);
  for(const other of sins.filter(other=>other.id!==sin.id))assert.ok(html.includes(`href="/sins/${other.id}/"`));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema['@type'],'BreadcrumbList');
  assert.equal(schema.itemListElement.at(-1).item,'https://sevendeadlysinstest.xyz'+route);
  titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
  distinctions.add(html.match(/id="difference"[^]*?<h2>(.*?)<\/h2>/)[1]);
 }
 assert.equal(titles.size,7);assert.equal(descriptions.size,7);assert.equal(distinctions.size,7);
});

test('guide local links, fragment targets, and assets resolve in the built site',async()=>{
 const origin='https://sevendeadlysinstest.xyz';
 for(const sin of sins){
  const route=`/sins/${sin.id}/`,html=await readFile(`dist${route}index.html`,'utf8');
  for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const url=new URL(href,origin+route);
   if(url.origin!==origin)continue;
   const file='dist'+url.pathname+(url.pathname.endsWith('/')?'index.html':'');
   await access(file);
   if(url.hash){const target=await readFile(file,'utf8');assert.ok(target.includes(`id="${url.hash.slice(1)}"`),`${route}: missing ${href}`);}
  }
 }
});
