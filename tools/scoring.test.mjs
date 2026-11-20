import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sins,questions,scoreAnswers,validScores} from '../src/data.mjs';
import {emptyAttempt,parseAttempt,encodeScores,decodeScores,resultProfile,readSavedResult} from '../src/state.mjs';
test('21 unique questions cover each dimension three times with one reverse item',()=>{
 assert.equal(questions.length,21);assert.equal(new Set(questions.map(q=>q.id)).size,21);
 for(const s of sins){assert.equal(questions.filter(q=>q.sin===s.id).length,3);assert.equal(questions.filter(q=>q.sin===s.id&&q.reverse).length,1);}
});
test('all seven dimensions can independently reach zero and one hundred',()=>{
 for(const target of sins){const answers=questions.map(q=>{const score=q.sin===target.id?4:0;return q.reverse?4-score:score;});assert.deepEqual(scoreAnswers(answers),sins.map(s=>s.id===target.id?100:0));}
 assert.deepEqual(scoreAnswers(questions.map(q=>q.reverse?4:0)),Array(7).fill(0));
 assert.deepEqual(scoreAnswers(questions.map(q=>q.reverse?0:4)),Array(7).fill(100));
});
test('neutral answers preserve a genuine seven-way tie',()=>{
 const scores=scoreAnswers(Array(21).fill(2));assert.deepEqual(scores,Array(7).fill(50));assert.equal(resultProfile(scores).kind,'even');assert.equal(resultProfile(scores).leaders.length,7);
});
test('partial ties keep both leaders and the correct runners-up',()=>{
 const profile=resultProfile([75,0,25,75,0,50,50]);assert.equal(profile.kind,'tie');assert.deepEqual(profile.leaders.map(s=>s.id),['pride','envy']);assert.deepEqual(profile.runnerUps.map(s=>s.id),['wrath','sloth']);
});
test('incomplete, sparse, non-integer and out-of-range answers are rejected',()=>{
 for(const a of [[],Array(21),Array(21).fill(null),Array(21).fill(5),Array(21).fill(-1),Array(21).fill(2.5),Array(21).fill('2')])assert.throws(()=>scoreAnswers(a));
 assert.equal(validScores(Array(7)),false);
});
test('result links round-trip and reject malformed or injected payloads',()=>{
 const scores=[0,8,25,50,75,92,100];assert.deepEqual(decodeScores('#'+encodeScores(scores)),scores);
 for(const value of ['',null,'v2:0,0,0,0,0,0,0','v1:101,0,0,0,0,0,0','v1:-1,0,0,0,0,0,0','v1:1,2','v1:1,2,3,4,5,6,7<script>','v1:NaN,0,0,0,0,0,0'])assert.equal(decodeScores(value),null);
});
test('resume state is validated and a fresh attempt never reuses an answer array',()=>{
 const attempt=emptyAttempt();attempt.index=4;attempt.answers[0]=3;assert.deepEqual(parseAttempt(JSON.stringify(attempt)),attempt);assert.equal(emptyAttempt().answers[0],null);
 for(const value of ['{',JSON.stringify({...attempt,index:21}),JSON.stringify({...attempt,answers:[1]}),JSON.stringify({...attempt,version:2})])assert.equal(parseAttempt(value),null);
 assert.deepEqual(readSavedResult(JSON.stringify({version:1,scores:Array(7).fill(0)})),Array(7).fill(0));assert.equal(readSavedResult('{}'),null);
});
