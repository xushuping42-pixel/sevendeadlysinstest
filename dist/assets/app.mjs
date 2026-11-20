import './interactions.mjs';
if(document.querySelector('#quiz-app'))await import('./quiz.mjs');
if(document.body.dataset.view==='result')await import('./result.mjs');
