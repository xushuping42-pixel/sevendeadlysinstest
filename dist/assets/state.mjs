import {questions,sins,validScores,leaders} from './data.mjs';
export const QUIZ_KEY='seven-little-sins.quiz.v1';
export const RESULT_KEY='seven-little-sins.result.v1';
export function emptyAttempt(){return {version:1,index:0,answers:Array(questions.length).fill(null)};}
export function parseAttempt(raw){
 try{const value=JSON.parse(raw);if(value?.version!==1||!Number.isInteger(value.index)||value.index<0||value.index>=questions.length||!Array.isArray(value.answers)||value.answers.length!==questions.length||!Array.from(value.answers).every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<=4)))return null;return {version:1,index:value.index,answers:[...value.answers]};}catch{return null;}
}
export function encodeScores(scores){if(!validScores(scores))throw new Error('Invalid scores');return `v1:${scores.join(',')}`;}
export function decodeScores(fragment){
 if(typeof fragment!=='string')return null;
 const token=fragment.replace(/^#/,'');
 if(!/^v1:\d{1,3}(,\d{1,3}){6}$/.test(token))return null;
 const scores=token.slice(3).split(',').map(Number);
 return validScores(scores)?scores:null;
}
export function readSavedResult(raw){try{const value=JSON.parse(raw);return value?.version===1&&validScores(value.scores)?value.scores:null;}catch{return null;}}
export function resultProfile(scores){
 const top=leaders(scores);
 const maximum=Math.max(...scores);
 const remaining=scores.filter(v=>v<maximum);
 const next=remaining.length?Math.max(...remaining):null;
 return {kind:top.length===7?'even':top.length>1?'tie':'single',leaders:top,maximum,runnerUps:next===null?[]:sins.filter((s,i)=>scores[i]===next)};
}
