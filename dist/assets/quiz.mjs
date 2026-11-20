import {questions,scoreAnswers} from './data.mjs';
import {monster} from './monsters.mjs';
import {QUIZ_KEY,RESULT_KEY,emptyAttempt,parseAttempt,encodeScores} from './state.mjs';
const app=document.querySelector('#quiz-app');
let attempt=emptyAttempt();
let storageAvailable=true;
let resumed=false;
try{
 const attemptUrl=new URL(location.href);
 if(attemptUrl.searchParams.get('new')==='1'){sessionStorage.removeItem(QUIZ_KEY);attemptUrl.searchParams.delete('new');history.replaceState(null,'',attemptUrl.pathname+attemptUrl.search+attemptUrl.hash);}
 else{const saved=parseAttempt(sessionStorage.getItem(QUIZ_KEY));if(saved){attempt=saved;resumed=saved.answers.some(v=>v!==null);}}
}catch{storageAvailable=false;}
const choices=[['○','Not like me'],['◔','A little like me'],['◑','Somewhat like me'],['◕','Mostly like me'],['●','Very like me']];
function persist(){try{sessionStorage.setItem(QUIZ_KEY,JSON.stringify(attempt));}catch{storageAvailable=false;}}
function completed(){return attempt.answers.filter(v=>v!==null).length;}
function updateProgress(){
 const count=completed();
 app.querySelector('[data-count]').textContent=`${count} of 21 answered`;
 app.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',String(count));
 app.querySelector('.quiz-progress>span').style.width=`${count/21*100}%`;
}
function render(focus=false){
 const q=questions[attempt.index];
 app.innerHTML=`${resumed?'<div class="resume-notice" role="status">Welcome back. Your progress in this tab has been restored.</div>':''}<div class="quiz-progress-head"><span>Question ${attempt.index+1} of ${questions.length}</span><span data-count></span></div><div class="quiz-progress" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="21" aria-valuenow="${completed()}"><span></span></div><section class="quiz-card" aria-labelledby="question-title"><span class="eyebrow">A LITTLE HONESTY · SITUATION ${String(attempt.index+1).padStart(2,'0')}</span><h3 id="question-title" tabindex="-1">${q.scene}</h3><p class="quiz-statement">${q.text}</p><fieldset class="answer-fieldset"><legend>How much does this sound like your usual self?</legend><div class="answer-options">${choices.map(([icon,label],i)=>`<label class="answer-option"><input type="radio" name="answer" value="${i}" ${attempt.answers[attempt.index]===i?'checked':''}><span aria-hidden="true">${icon}</span><span>${label}</span></label>`).join('')}</div></fieldset><div class="quiz-controls"><button type="button" class="quiet-button" data-back ${attempt.index===0?'disabled':''}>Previous question</button><button type="button" class="button" data-next ${attempt.answers[attempt.index]===null?'disabled':''}>${attempt.index===20?'Reveal my result':'Next question'} <span aria-hidden="true">✦</span></button></div><p class="quiz-helper">No right answers. Choose the response that fits most often.</p><p class="quiz-error" role="alert"></p></section><div class="quiz-under">${monster('sloth')}<span>${storageAvailable?'Progress is saved in this tab. No account needed.':'Progress stays on this page. Refreshing may clear it.'}</span></div><div class="restart-area"><button type="button" class="quiet-button" data-restart>Start over</button><span class="restart-confirm" hidden>Clear your answers? <button type="button" class="quiet-button" data-confirm-restart>Yes, start fresh</button><button type="button" class="quiet-button" data-cancel-restart>Keep my progress</button></span></div>`;
 updateProgress();
 app.querySelectorAll('input[name="answer"]').forEach(input=>input.addEventListener('change',()=>{
  attempt.answers[attempt.index]=Number(input.value);persist();updateProgress();app.querySelector('[data-next]').disabled=false;
 }));
 app.querySelector('[data-back]').addEventListener('click',()=>{if(attempt.index>0){attempt.index--;persist();resumed=false;render(true);}});
 app.querySelector('[data-next]').addEventListener('click',()=>{
  if(attempt.answers[attempt.index]===null)return;
  if(attempt.index<20){attempt.index++;persist();resumed=false;render(true);return;}
  try{
   const scores=scoreAnswers(attempt.answers);
   try{sessionStorage.setItem(RESULT_KEY,JSON.stringify({version:1,scores}));}catch{}
   location.assign(`/result/#${encodeScores(scores)}`);
  }catch{app.querySelector('[role="alert"]').textContent='Please answer every question before revealing your result.';}
 });
 app.querySelector('[data-restart]').addEventListener('click',()=>{app.querySelector('.restart-confirm').hidden=false;app.querySelector('[data-confirm-restart]').focus();});
 app.querySelector('[data-cancel-restart]').addEventListener('click',()=>{app.querySelector('.restart-confirm').hidden=true;app.querySelector('[data-restart]').focus();});
 app.querySelector('[data-confirm-restart]').addEventListener('click',()=>{attempt=emptyAttempt();resumed=false;persist();render(true);});
 if(focus){app.querySelector('#question-title').focus({preventScroll:true});app.scrollIntoView({behavior:'instant',block:'start'});}
}
render();
