import {sins} from './data.mjs';
import {monster} from './monsters.mjs';
const dialog=document.createElement('dialog');
dialog.className='character-dialog';
dialog.id='homepage-dialog';
dialog.setAttribute('aria-labelledby','dialog-heading');
dialog.setAttribute('aria-describedby','dialog-description');
document.body.append(dialog);
let trigger=null;
function openDialog(content,source){
 trigger=source;
 dialog.innerHTML=`<button type="button" class="dialog-close" aria-label="Close preview" autofocus>×</button>${content}`;
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 if(!dialog.open)dialog.showModal();
 document.documentElement.classList.add('dialog-open');
}
function showCharacter(s,preview=false,source=trigger){
 const index=sins.indexOf(s);
 openDialog(`<div class="dialog-character" style="--card:${s.color}">${monster(s.id)}<span class="eyebrow">${preview?'ILLUSTRATIVE RESULT · NOT YOUR RESULT':'MEET THE LITTLE TROUBLEMAKER'}</span><h2 id="dialog-heading">${s.name}.</h2><span class="dialog-title">${s.title}</span><blockquote>“${s.quote}”</blockquote></div><div class="dialog-copy"><p id="dialog-description">${preview?'This is a sample character card. The full quiz is coming later; no answers or scores are collected on this homepage.':s.intro}</p>${preview?'':`<p><strong>The good energy:</strong> ${s.strength}</p>`}<div class="dialog-navigation"><button type="button" class="quiet-button" data-previous>Previous character</button><span>${index+1} / ${sins.length}</span><button type="button" class="quiet-button" data-next>Next character</button></div><button type="button" class="button" data-close-dialog>Back to the lineup <span aria-hidden="true">✦</span></button></div>`,source);
 dialog.querySelector('[data-previous]').addEventListener('click',()=>{showCharacter(sins[(index+6)%7],false,source);dialog.querySelector('[data-previous]').focus();});
 dialog.querySelector('[data-next]').addEventListener('click',()=>{showCharacter(sins[(index+1)%7],false,source);dialog.querySelector('[data-next]').focus();});
}
document.querySelectorAll('[data-character]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();const sin=sins.find(s=>s.id===el.dataset.character);if(sin)showCharacter(sin,false,el);}));
document.querySelectorAll('[data-preview]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();showCharacter(sins[6],true,el);}));
document.querySelector('[data-privacy]')?.addEventListener('click',event=>{
 event.preventDefault();
 openDialog(`<div class="privacy-dialog"><span class="eyebrow">A LITTLE TRANSPARENCY</span><h2 id="dialog-heading">Your privacy.</h2><p id="dialog-description">This homepage does not collect quiz answers, scores, account details, or email addresses.</p><h3>Just a homepage.</h3><p>Character cards and illustrative result previews run in your browser. This version adds no analytics, advertising scripts, tracking cookies, or browser storage.</p><h3>Ordinary website requests.</h3><p>The hosting service may process information such as your IP address, browser headers, and requested files to deliver the page. If the quiz is added later, this notice will be updated to describe its data handling.</p><button type="button" class="button" data-close-dialog>Got it <span aria-hidden="true">✦</span></button></div>`,event.currentTarget);
});
document.querySelector('[data-scoring]')?.addEventListener('click',event=>{
 event.preventDefault();const item=document.querySelector('#score-faq');item.open=true;
 item.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});
 item.querySelector('summary').focus({preventScroll:true});
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('dialog-open');if(trigger?.isConnected)trigger.focus({preventScroll:true});});
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#main-navigation');
function closeMenu(){menuButton?.setAttribute('aria-expanded','false');menu?.classList.remove('is-open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!menu?.contains(event.target)&&!menuButton?.contains(event.target))closeMenu();});
matchMedia('(min-width:561px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
