import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {sins} from '../src/data.mjs';
import {createHash} from 'node:crypto';
import {resultExamples,workedExample} from './content-pages.mjs';
import {decodeScores,resultProfile} from '../src/state.mjs';
const contentRoutes=['/seven-deadly-sins/','/results-guide/','/how-it-works/'];
const siteRoutes=['/about/','/privacy/','/contact/'];
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
 assert.equal((map.match(/<loc>/g)||[]).length,14);
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
 for(const route of [...sins.map(s=>`/sins/${s.id}/`),...contentRoutes,...siteRoutes]){
  const html=await readFile(`dist${route}index.html`,'utf8');
  for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const url=new URL(href,origin+route);
   if(url.origin!==origin)continue;
   const file='dist'+url.pathname+(url.pathname.endsWith('/')?'index.html':'');
   await access(file);
   if(url.hash&&url.pathname==='/result/'){assert.ok(decodeScores(url.hash),'Invalid example result link');}else if(url.hash){const target=await readFile(file,'utf8');assert.ok(target.includes(`id="${url.hash.slice(1)}"`),`${route}: missing ${href}`);}
  }
 }
});

test('all pages request content-versioned stylesheets instead of stale cached CSS URLs',async()=>{
 const styles=['style.css','homepage.css','quiz.css','sin-guide.css','content-guide.css'];
 const versions=new Map(await Promise.all(styles.map(async name=>[
  name,createHash('sha256').update((await readFile('src/'+name,'utf8')).replace(/\r\n/g,'\n')).digest('hex').slice(0,12),
 ])));
 for(const file of ['dist/index.html','dist/result/index.html',...sins.map(s=>`dist/sins/${s.id}/index.html`),...[...contentRoutes,...siteRoutes].map(route=>`dist${route}index.html`)]){
  const html=await readFile(file,'utf8');
  const links=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(links.length,file.includes('/sins/')||[...contentRoutes,...siteRoutes].some(route=>file===`dist${route}index.html`)?4:3);
  for(const link of links){
   const url=new URL(link,'https://sevendeadlysinstest.xyz');
   const name=url.pathname.split('/').at(-1);
   assert.equal(url.searchParams.get('v'),versions.get(name),`${file}: stale URL for ${name}`);
   assert.deepEqual(await readFile('dist'+url.pathname),await readFile('src/'+name));
  }
 }
});


test('the three editorial guides are discoverable static pages with unique metadata',async()=>{
 const home=await readFile('dist/index.html','utf8'),map=await readFile('dist/sitemap.xml','utf8');
 const titles=new Set(),descriptions=new Set();
 for(const route of contentRoutes){
  const html=await readFile('dist'+route+'index.html','utf8');
  assert.ok(home.includes('href="'+route+'"'),'Missing home entry: '+route);
  assert.ok(map.includes('<loc>https://sevendeadlysinstest.xyz'+route+'</loc>'));
  assert.ok(html.includes('rel="canonical" href="https://sevendeadlysinstest.xyz'+route+'"'));
  assert.equal(html.includes('noindex'),false);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('data-view="content"'));
  titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
  for(const other of contentRoutes)assert.ok(html.includes('href="'+other+'"'));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.itemListElement.at(-1).item,'https://sevendeadlysinstest.xyz'+route);
 }
 assert.equal(titles.size,3);assert.equal(descriptions.size,3);
});

test('published example profiles use valid scores and resolve to the displayed result type',async()=>{
 const html=await readFile('dist/results-guide/index.html','utf8');
 const possibleScores=new Set(Array.from({length:13},(_,raw)=>Math.round(raw/12*100)));
 const links=[...html.matchAll(/href="\/result\/#(v1:[0-9,]+)"/g)].map(match=>match[1]);
 assert.equal(links.length,3);
 for(const [index,example] of resultExamples.entries()){
  assert.deepEqual(decodeScores(links[index]),example.scores);
  assert.equal(resultProfile(example.scores).kind,example.id);
  for(const value of example.scores)assert.ok(possibleScores.has(value));
 }
 assert.deepEqual(resultProfile(resultExamples[1].scores).leaders.map(s=>s.id),['pride','envy']);
});

test('the method page worked example matches the quiz reverse-scoring calculation',async()=>{
 assert.deepEqual(workedExample.rows.map(row=>row.points),[3,3,2]);
 assert.equal(workedExample.rows.filter(row=>row.reverse).length,1);
 assert.equal(workedExample.total,8);assert.equal(workedExample.score,67);
 const html=await readFile('dist/how-it-works/index.html','utf8');
 assert.ok(html.includes('4 − 1 = 3'));assert.ok(html.includes('67 / 100'));
 const resultSource=await readFile('src/result.mjs','utf8');
 assert.ok(resultSource.includes('href="/results-guide/"'));
});


test('project information pages are standalone, reachable from every footer, and indexable',async()=>{
 const map=await readFile('dist/sitemap.xml','utf8');
 const files=['dist/index.html','dist/result/index.html',...sins.map(s=>'dist/sins/'+s.id+'/index.html'),...[...contentRoutes,...siteRoutes].map(route=>'dist'+route+'index.html')];
 const titles=new Set();
 for(const route of siteRoutes){
  const html=await readFile('dist'+route+'index.html','utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical" href="https://sevendeadlysinstest.xyz'+route+'"'));
  assert.ok(map.includes('<loc>https://sevendeadlysinstest.xyz'+route+'</loc>'));
  assert.equal(html.includes('noindex'),false);
  for(const other of siteRoutes)assert.ok(html.includes('href="'+other+'"'));
  titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
 }
 assert.equal(titles.size,3);
 for(const file of files){
  const html=await readFile(file,'utf8'),footer=html.match(/<footer\b[^]*?<\/footer>/)[0];
  for(const route of siteRoutes)assert.ok(footer.includes('href="'+route+'"'),file+': missing information link');
  assert.equal(footer.includes('data-privacy'),false);
 }
 const interactions=await readFile('src/interactions.mjs','utf8');
 assert.equal(interactions.includes("closest('[data-privacy]')"),false);
});

test('contact links compose messages to the supplied inbox without a non-working web form',async()=>{
 const html=await readFile('dist/contact/index.html','utf8');
 const emails=[...html.matchAll(/href="(mailto:[^"]+)"/g)].map(match=>new URL(match[1]));
 assert.equal(emails.length,4);
 const subjects=new Set();let multilineDrafts=0;
 for(const url of emails){
  assert.equal(decodeURIComponent(url.pathname),'xsanmei1@gmail.com');
  const subject=url.searchParams.get('subject');assert.ok(subject.startsWith('Seven Little Sins'));
  subjects.add(subject);
  const body=url.searchParams.get('body');
  if(body){assert.ok(body.includes('\n'));assert.equal(body.includes('v1:'),false);multilineDrafts++;}
 }
 assert.equal(subjects.size,4);assert.equal(multilineDrafts,3);
 assert.equal(/<form\b/.test(html),false);
 for(const route of ['/about/','/privacy/']){
  const page=await readFile('dist'+route+'index.html','utf8');
  assert.ok(page.includes('mailto:xsanmei1@gmail.com'));
 }
});
