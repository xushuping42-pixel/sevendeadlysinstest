import {mkdir,writeFile,copyFile,readdir,rm,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {sins} from '../src/data.mjs';
import {monster} from '../src/monsters.mjs';
import {quizSection,resultPage} from './function-pages.mjs';
import {sinPages} from './sin-pages.mjs';
const origin='https://sevendeadlysinstest.xyz';
// A changed stylesheet must get a new URL even while a browser's old CSS is fresh.
const stylesheetVersions=Object.fromEntries(await Promise.all(
 ['style.css','homepage.css','quiz.css','sin-guide.css'].map(async name=>
  [name,createHash('sha256').update(await readFile('src/'+name)).digest('hex').slice(0,12)]),
));
function versionStylesheets(html){
 return html.replace(/href="\/assets\/([^"?]+\.css)"/g,(_match,name)=>{
  if(!stylesheetVersions[name])throw new Error('Missing stylesheet version: '+name);
  return `href="/assets/${name}?v=${stylesheetVersions[name]}"`;
 });
}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const button=(text='Reveal my sin',cls='')=>`<a class="button ${cls}" href="/#quiz">${text} <span aria-hidden="true">✦</span></a>`;
const header=()=>`<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="wrap header-inner"><a href="/" class="brand" aria-label="Seven Little Sins home"><span class="brand-icon">${monster('pride')}</span><span>seven little sins<span class="brand-sub">A VERY HUMAN PERSONALITY QUIZ</span></span></a><button type="button" class="menu-toggle" aria-controls="main-navigation" aria-expanded="false" aria-label="Toggle navigation">☰</button><nav id="main-navigation" aria-label="Main navigation"><a href="/#meet">Meet the seven</a><a href="/#how-it-works">How it works</a><a class="nav-quiz" href="/#quiz">Take the test <span>✳</span></a></nav></div></header>`;
const footer=()=>`<footer class="site-footer"><div class="wrap footer-top"><a class="brand" href="/">seven little sins <span class="tiny-star">✳</span></a><p>A little self-discovery. A healthy sense of humor.</p><div><a href="/#how-it-works">Our method</a><a href="/#faq" data-privacy aria-haspopup="dialog" aria-controls="homepage-dialog">Privacy</a><a href="/#meet">About</a></div></div><div class="wrap footer-bottom"><span>© 2026 Seven Little Sins · ${new URL(origin).host}</span><span>For fun & self-reflection. You’re more than a result.</span></div></footer>`;
function shell({title,description,path='/',view='',content,noindex=false}){return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><script type="module" src="/assets/analytics.mjs"></script><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#F7F3E8"><link rel="canonical" href="${origin}${path==='/'?'':path}">${noindex?'<meta name="robots" content="noindex,follow">':''}<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${path}"><meta property="og:site_name" content="Seven Little Sins"><link rel="icon" href="/favicon.ico?v=crown1" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png?v=crown1"><link rel="icon" type="image/svg+xml" sizes="any" href="/assets/favicon.svg?v=crown1"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=crown1"><link rel="manifest" href="/assets/site.webmanifest"><link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/homepage.css"><link rel="stylesheet" href="/assets/quiz.css">${view==='sin'?'<link rel="stylesheet" href="/assets/sin-guide.css">':''}<script type="module" src="/assets/app.mjs"></script>${path==='/'?`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'Seven Little Sins',url:origin+'/'})}</script>`:''}</head><body data-view="${view}">${header()}<main id="main" tabindex="-1">${content}</main>${footer()}<div class="toast" role="status" aria-live="polite"></div></body></html>`;}
const card=(s,i)=>`<a class="sin-card" href="/sins/${s.id}/" style="--card:${s.color};--accent:${s.ink}"><div class="card-heading"><span>${String(i+1).padStart(2,'0')} / THE SEVEN</span><span aria-hidden="true">✦</span></div>${monster(s.id)}<div class="card-copy"><h3>${s.name}</h3><span class="character-name">${s.title}</span><p>${s.line}</p></div><span class="card-bottom">Explore ${s.name.toLowerCase()} <span aria-hidden="true">↗</span></span></a>`;
const faqs=[['What is the 7 Deadly Sins Test?','This is a free, original 21-question quiz about everyday habits. Answer the questions to see your seven scores, leading tendencies, character explanation, and a downloadable PNG card. It is independent and is not the IDRlabs test.'],['Is this about the Seven Deadly Sins anime?','This quiz explores seven traditional personality archetypes. It does not match you to anime characters. Our little monsters are original characters created for this site.'],['How long does the quiz take?','There are 21 short questions. Allow about three to five minutes, and take as much time as you like. You can go back and change an answer before revealing your result.'],['What do the scores actually mean?','Each tendency has three equally weighted questions, scored 0 to 4. Balancing statements are reversed (4 minus the answer). The total out of 12 is divided by 12, multiplied by 100, and rounded. Scores are independent and do not add up to 100. A tie stays a tie. These are not percentiles, validated thresholds, or a moral judgment.'],['Is it free, and do I need an account?','The complete quiz, seven-score result, character explanation, and downloadable result card are free. No account or email address is required.'],['Where do my answers go?','Answers are scored in your browser and saved in this tab’s session storage so you can resume after refreshing. They are not submitted to a quiz server. Result links contain all seven scores after #, so share only if you are comfortable sharing your profile. Open Privacy in the footer for the full explanation.'],['Is the test scientifically validated?','No. These are original entertainment questions, not a validated psychological scale. Use the result as a lighthearted conversation starter, not a diagnosis, moral judgment, or fixed personality label.']];
const faqHTML=faqs.map(([q,a])=>`<details${q==='What do the scores actually mean?'?' id="score-faq"':''}><summary>${q}<span aria-hidden="true">＋</span></summary><p>${a}</p></details>`).join('');
const heroCards=sins.map((s,i)=>`<button type="button" aria-label="Meet ${s.name}: ${s.title}" data-character="${s.id}" aria-haspopup="dialog" aria-controls="homepage-dialog" class="hero-card hc-${i}" style="--card:${s.color};--turn:${[-13,7,-5,10,-9,8,-4][i]}deg"><span class="hero-card-num">0${i+1}</span>${monster(s.id)}<strong>${s.name}</strong></button>`).join('');
const home=`<section class="hero wrap"><div class="hero-copy"><div class="eyebrow"><span class="mini-spark">✳</span> SEVEN FLAWS. ZERO BORING PERSONALITIES.</div><h1>7 Deadly<br>Sins <em>Test.</em><span class="title-spark" aria-hidden="true">✧</span></h1><h2>Which deadly sin are you?</h2><p class="hero-description">A tiny bit prideful? A professional procrastinator?<br class="desktop-break"> Meet the little troublemaker behind your everyday choices.</p><div class="hero-actions">${button()}<span class="hand-note">Be honest.<br>We won’t tell.</span></div><ul class="quiz-facts"><li>21 little confessions</li><li>3–5 minutes</li><li>Free. No signup.</li></ul><p class="homepage-notice">Instant personal results · Your answers stay in this browser.</p></div><div class="hero-art" aria-label="Seven colorful illustrated monster character cards"><span class="art-note">everyone has a little something.</span><span class="floating-star star-one" aria-hidden="true">✳</span>${heroCards}<div class="hero-stamp">100%<span>HUMAN.<br>PROBABLY.</span></div><span class="floating-star star-two" aria-hidden="true">✧</span></div></section>
<div class="ribbon" aria-hidden="true"><div>GOOD PEOPLE. QUESTIONABLE HABITS. <span>✳</span> A LITTLE SELF-DISCOVERY. <span>✳</span> NO HALOS REQUIRED. <span>✳</span> GOOD PEOPLE. QUESTIONABLE HABITS. <span>✳</span></div></div>
${quizSection}
<section class="section wrap" id="meet"><div class="section-heading"><div><div class="eyebrow">THE WHOLE LOVABLE LINEUP</div><h2>Seven sins.<br><em>One very you.</em></h2></div><p>Not villains. Just very human habits<br>with a little extra personality.<br>Go on — meet your potential troublemaker.</p></div><div class="sin-grid">${sins.map(card).join('')}<div class="wild-card"><span class="wild-symbol">?</span><h3>A familiar face?</h3><p>Your obvious pick might not be your strongest tendency.</p><a class="text-link" href="/#quiz">Let your answers decide ✳</a></div></div></section>
<section class="sample-section" id="sample"><div class="wrap sample-layout"><div class="sample-art"><div class="sample-note">A little sneak peek</div><div class="sample-card" style="--card:${sins[6].color}"><div class="card-heading"><span>SEVEN LITTLE SINS</span><span>✦</span></div><div class="sample-label">ILLUSTRATIVE RESULT</div>${monster('sloth')}<span class="eyebrow">YOU GOT</span><h3>Sloth.</h3><p class="sample-title">The Cozy Strategist</p><blockquote>“I have a plan.<br>It starts tomorrow.”</blockquote><div class="sample-card-foot">${new URL(origin).host}</div></div><span class="sample-sticker">a little<br>too relatable.</span></div><div class="sample-copy"><div class="eyebrow">YOUR PERSONALITY, WITH A PLOT TWIST</div><h2>A result worth<br><em>sending to the<br>group chat.</em></h2><p>You’re more interesting than one label. Get your leading sin, the close contenders, and a whole cast of very human tendencies.</p><ul class="check-list"><li>Your own seven-sin profile</li><li>A character with a suspiciously familiar habit</li><li>A free card to save, share, and lovingly debate</li></ul>${button('Find my little troublemaker','button-small')}<p class="fine-print">Example shown. Your answers decide your actual result.</p><button type="button" class="quiet-button" data-preview aria-haspopup="dialog" aria-controls="homepage-dialog">View the sample card</button></div></div></section>
<section class="section wrap how-section" id="how-it-works"><div class="center-heading"><div class="eyebrow">A SHORT TRIP TO SELF-DISCOVERY</div><h2>Confess. Discover. <em>Compare.</em></h2><p>No essays. No email gate. No eternal judgment.</p></div><div class="steps"><article><span class="step-num">01</span><h3>A little honesty.</h3><p>Respond to 21 everyday situations. Think “usual you,” not “job-interview you.”</p></article><article><span class="step-num">02</span><h3>A little revelation.</h3><p>Meet your leading character and see how all seven tendencies show up in your answers.</p></article><article><span class="step-num">03</span><h3>A little friendly chaos.</h3><p>Save your card or invite a friend. Comparing results is half the fun.</p></article></div><a class="text-link" href="/#score-faq" data-scoring>Curious about the scoring? ✳</a></section>
<section class="faq-section wrap section" id="faq"><div class="faq-heading"><div class="eyebrow">BEFORE YOU CONFESS</div><h2>Good<br><em>questions.</em></h2><p>Honest answers. Obviously.</p>${monster('envy')}</div><div class="faq-list">${faqHTML}</div></section>
<section class="last-call wrap"><span aria-hidden="true" class="last-star">✳</span><div><span class="eyebrow">YOUR INNER TROUBLEMAKER IS WAITING</span><h2>Ready to meet <em>yourself?</em></h2><p>Just a few minutes. Maybe a few raised eyebrows.</p></div>${button('Okay, reveal my sin')}</section>`;
const page={path:'/',title:'7 Deadly Sins Test — Which Deadly Sin Are You? | Seven Little Sins',description:'Which deadly sin are you? Take our free 21-question test, discover all seven scores, and download your original character result card. No signup.',view:'home',content:home};
await mkdir('dist/assets',{recursive:true});
const outputRoot=path.resolve('dist');
const oldQuizDirectory=path.resolve(outputRoot,'quiz');
if(oldQuizDirectory!==path.join(outputRoot,'quiz')||!oldQuizDirectory.startsWith(outputRoot+path.sep))throw new Error('Unsafe obsolete quiz path');
await rm(oldQuizDirectory,{recursive:true,force:true});
await writeFile('dist/_redirects','/quiz/ /#quiz 301\n/quiz /#quiz 301\n','utf8');
for(const route of [page,resultPage,...sinPages]){await mkdir('dist'+route.path,{recursive:true});await writeFile('dist'+route.path+'index.html',versionStylesheets(shell(route)));}
for(const name of ['analytics.mjs','app.mjs','interactions.mjs','data.mjs','monsters.mjs','state.mjs','quiz.mjs','result.mjs','share-card.mjs','style.css','homepage.css','quiz.css','sin-guide.css'])await copyFile('src/'+name,'dist/assets/'+name);
await copyFile('src/icons/favicon.ico','dist/favicon.ico');
for(const name of await readdir('src/icons')){
  if(name.endsWith('.ico'))continue;
  await copyFile('src/icons/'+name,'dist/assets/'+name);
}
await copyFile('src/icons/apple-touch-icon.png','dist/apple-touch-icon.png');

// —— sitemap.xml / robots.txt ——
const SITE=origin;
const urls=[
  {loc:`${SITE}/`,priority:'1.0',changefreq:'daily'},
  ...sinPages.map(page=>({loc:SITE+page.path,priority:'0.7',changefreq:'monthly'})),
];
const today=new Date().toISOString().slice(0,10);
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
await writeFile('dist/sitemap.xml',sitemap,'utf8');
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,'utf8');
console.log('Built home, result page, seven character guides, legacy quiz redirects, icons and sitemap.');
