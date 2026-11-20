import './interactions.mjs';
if(document.body.dataset.view==='quiz')await import('./quiz.mjs');
if(document.body.dataset.view==='result')await import('./result.mjs');
