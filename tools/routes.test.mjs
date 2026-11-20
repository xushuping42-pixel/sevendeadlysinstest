import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
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
 assert.equal((map.match(/<loc>/g)||[]).length,1);
 assert.ok(map.includes('<loc>https://sevendeadlysinstest.xyz/</loc>'));
 assert.equal(map.includes('/quiz/'),false);assert.equal(map.includes('/result/'),false);
});
test('result retake and friend links return to the home quiz',async()=>{
 const source=await readFile('src/result.mjs','utf8');
 assert.ok(source.includes('href="/?new=1#quiz"'));
 assert.ok(source.includes('${location.origin}/#quiz'));
 assert.equal(source.includes('href="/quiz/"'),false);
});
