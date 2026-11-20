import assert from 'node:assert/strict';
for(const route of ['/quiz','/quiz/','/quiz/?new=1']){
 const response=await fetch('http://127.0.0.1:4173'+route,{redirect:'manual'});
 const expected=route.includes('?')?'/?new=1#quiz':'/#quiz';
 assert.equal(response.status,301);
 assert.equal(response.headers.get('location'),expected);
 console.log(`${route} -> ${response.status} ${expected}`);
}
const home=await fetch('http://127.0.0.1:4173/');
const html=await home.text();
assert.equal(home.status,200);
assert.ok(html.indexOf('class="ribbon"')<html.indexOf('id="quiz"'));
assert.ok(html.indexOf('id="quiz"')<html.indexOf('id="meet"'));
assert.equal((await fetch('http://127.0.0.1:4173/result/')).status,200);
console.log('Home quiz placement, redirect query preservation and result route passed.');
