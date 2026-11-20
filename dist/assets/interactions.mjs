import {sins} from './data.mjs';
import {monster} from './monsters.mjs';
const dialog=document.createElement('dialog');
dialog.className='character-dialog';dialog.id='homepage-dialog';
dialog.setAttribute('aria-labelledby','dialog-heading');dialog.setAttribute('aria-describedby','dialog-description');
document.body.append(dialog);
let trigger=null;
function closeDialog(){
 document.documentElement.classList.remove('dialog-open');dialog.close();
 if(trigger?.isConnected)trigger.focus({preventScroll:true});
}
function openDialog(content,source){
 trigger=source;
 dialog.innerHTML=`<button type="button" class="dialog-close" aria-label="Close preview" autofocus>×</button>${content}`;
 dialog.querySelector('.dialog-close').addEventListener('click',closeDialog);
 dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',closeDialog));
 if(!dialog.open)dialog.showModal();
 document.documentElement.classList.add('dialog-open');
}
function showCharacter(s,preview=false,source=trigger){
 const index=sins.indexOf(s);
 openDialog(`<div class="dialog-character" style="--card:${s.color}">${monster(s.id)}<span class="eyebrow">${preview?'ILLUSTRATIVE RESULT · NOT YOUR RESULT':'MEET THE LITTLE TROUBLEMAKER'}</span><h2 id="dialog-heading">${s.name}.</h2><span class="dialog-title">${s.title}</span><blockquote>“${s.quote}”</blockquote></div><div class="dialog-copy"><p id="dialog-description">${preview?'This is an illustrative character card. Answer the 21 questions to get your own seven-sin profile and downloadable result.':s.intro}</p>${preview?'<p><a href="/quiz/">Take the quiz for your personal result</a></p>':`<p><strong>The good energy:</strong> ${s.strength}</p><p><strong>A little balance:</strong> ${s.challenge}</p>`}<div class="dialog-navigation"><button type="button" class="quiet-button" data-previous>Previous character</button><span>${index+1} / ${sins.length}</span><button type="button" class="quiet-button" data-next>Next character</button></div><button type="button" class="button" data-close-dialog>Back to the page <span aria-hidden="true">✦</span></button></div>`,source);
 dialog.querySelector('[data-previous]').addEventListener('click',()=>{showCharacter(sins[(index+6)%7],false,source);dialog.querySelector('[data-previous]').focus();});
 dialog.querySelector('[data-next]').addEventListener('click',()=>{showCharacter(sins[(index+1)%7],false,source);dialog.querySelector('[data-next]').focus();});
}
document.addEventListener('click',event=>{
 if(!(event.target instanceof Element))return;
 const character=event.target.closest('[data-character]');
 if(character){const sin=sins.find(s=>s.id===character.dataset.character);if(sin){event.preventDefault();showCharacter(sin,false,character);}return;}
 const preview=event.target.closest('[data-preview]');
 if(preview){event.preventDefault();showCharacter(sins[6],true,preview);return;}
 const privacy=event.target.closest('[data-privacy]');
 if(privacy){
  event.preventDefault();
  openDialog(`<div class="privacy-dialog"><span class="eyebrow">A LITTLE TRANSPARENCY</span><h2 id="dialog-heading">Your privacy.</h2><p id="dialog-description">Quiz answers are scored in your browser. We do not submit your answers or scores to a quiz server.</p><h3>Saved in this tab.</h3><p>Your progress and latest result are saved in session storage, so refreshing does not erase an unfinished attempt. Start over to clear that attempt. Closing the tab clears this storage. If storage is unavailable, the quiz still works, but progress may be lost on refresh.</p><h3>Sharing is your choice.</h3><p>A result link contains all seven scores in its URL fragment, after #. Anyone with the link can view them; this is not encryption. URL fragments are not normally sent to the hosting server. Downloaded PNG cards show your leading characters without the score chart. Cards are generated on your device.</p><h3>Ordinary website requests.</h3><p>This site adds no analytics, advertising scripts, tracking cookies, accounts, or email forms. Hosting services process ordinary request information such as IP addresses, paths, and browser headers to deliver the site.</p><button type="button" class="button" data-close-dialog>Got it <span aria-hidden="true">✦</span></button></div>`,privacy);
  return;
 }
 const scoring=event.target.closest('[data-scoring]'),item=document.querySelector('#score-faq');
 if(scoring&&item){event.preventDefault();item.open=true;item.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});item.querySelector('summary').focus({preventScroll:true});}
});
dialog.addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);
 const first=controls[0],last=controls.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();});
dialog.addEventListener('close',()=>document.documentElement.classList.remove('dialog-open'));
const menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('#main-navigation');
function closeMenu(){menuButton?.setAttribute('aria-expanded','false');menu?.classList.remove('is-open');}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open);});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!menu?.contains(event.target)&&!menuButton?.contains(event.target))closeMenu();});
matchMedia('(min-width:561px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
