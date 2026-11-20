import {sins} from './data.mjs';
import {monster} from './monsters.mjs';
const dialog=document.createElement('dialog');
dialog.className='character-dialog';
document.body.append(dialog);
function showCharacter(s,preview=false){
 dialog.innerHTML=`<button class="dialog-close" aria-label="Close preview">×</button><div class="dialog-character" style="--card:${s.color}">${monster(s.id)}<span class="eyebrow">${preview?'ILLUSTRATIVE RESULT · DESIGN PREVIEW':'MEET THE LITTLE TROUBLEMAKER'}</span><h2>${s.name}.</h2><span class="dialog-title">${s.title}</span><blockquote>“${s.quote}”</blockquote></div><div class="dialog-copy"><p>${preview?'A peek at your future result card. The full quiz will follow this homepage design review.':s.intro}</p>${preview?'':`<p><strong>The good energy:</strong> ${s.strength}</p>`}<button class="button dialog-done">${preview?'Meet the seven':'Quite the character'} <span aria-hidden="true">✦</span></button></div>`;
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.dialog-done').addEventListener('click',()=>{dialog.close();if(preview)document.querySelector('#meet').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});
 dialog.showModal();
}
document.querySelectorAll('[data-character]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();const sin=sins.find(s=>s.id===el.dataset.character);if(sin)showCharacter(sin);}));
document.querySelectorAll('[data-preview]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();showCharacter(sins[6],true);}));
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
