import {monster} from './monsters.mjs';
import {resultProfile,encodeScores} from './state.mjs';
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=4;ctx.stroke();}}
function fit(ctx,text,max,size,family='Georgia'){while(size>24){ctx.font=`bold ${size}px ${family}`;if(ctx.measureText(text).width<=max)break;size-=2;}return size;}
function wrapped(ctx,text,x,y,max,lineHeight){let line='';for(const word of text.split(' ')){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>max&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word;}else line=test;}if(line)ctx.fillText(line,x,y);return y;}
async function artwork(id){const blob=new Blob([monster(id)],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);try{const image=new Image();image.src=url;await image.decode();return image;}finally{URL.revokeObjectURL(url);}}
export function resultLink(scores){return `${location.origin}/result/#${encodeScores(scores)}`;}
export async function createShareCard(scores){
 const profile=resultProfile(scores),top=profile.leaders;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser cannot create an image.');
 const ink='#30272b',color=profile.kind==='single'?top[0].color:'#D4C5E9';
 ctx.fillStyle='#F7F3E8';ctx.fillRect(0,0,1080,1350);
 roundRect(ctx,70,72,950,1212,28,ink);roundRect(ctx,50,50,950,1212,28,color,ink);
 ctx.textAlign='center';ctx.fillStyle=ink;ctx.font='bold 28px Arial';ctx.fillText('SEVEN LITTLE SINS',525,119);
 ctx.font='20px Arial';ctx.fillText('YOUR SEVEN-SIN PERSONALITY PROFILE',525,161);
 const images=await Promise.all(top.map(s=>artwork(s.id)));
 if(top.length===1)ctx.drawImage(images[0],280,190,490,460);
 else{
  const columns=top.length<=3?top.length:4,rows=Math.ceil(top.length/columns),size=top.length<=3?260:200;
  for(let i=0;i<images.length;i++){const row=Math.floor(i/columns),items=Math.min(columns,images.length-row*columns),start=(1050-items*size)/2;ctx.drawImage(images[i],start+(i%columns)*size,225+row*205,size,size);}
  ctx.font='bold 23px Arial';ctx.fillText(profile.kind==='even'?'ALL SEVEN, EVENLY MATCHED':'JOINT LEADING TENDENCIES',525,660);
 }
 const name=profile.kind==='single'?`${top[0].name}.`:profile.kind==='even'?'The Even Ensemble':'Shared Spotlight';
 fit(ctx,name,820,profile.kind==='single'?110:78);ctx.fillText(name,525,750);
 const subtitle=profile.kind==='single'?top[0].title:profile.kind==='even'?'A little of everything. A whole lot of you.':top.map(s=>s.name).join(' + ');
 ctx.font='bold 31px Arial';wrapped(ctx,subtitle,525,810,800,42);
 const quote=profile.kind==='single'?`“${top[0].quote}”`:profile.kind==='even'?'“One label? That was never going to be enough.”':'“Some personalities prefer a shared spotlight.”';
 ctx.font='italic 42px Georgia';wrapped(ctx,quote,525,945,780,59);
 ctx.strokeStyle='#30272b70';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(120,1135);ctx.lineTo(930,1135);ctx.stroke();
 ctx.font='bold 29px Arial';ctx.fillText('sevendeadlysinstest.xyz',525,1192);
 ctx.font='19px Arial';ctx.fillText('For fun & self-reflection. You’re more than a result.',525,1232);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The image could not be created.')),'image/png'));
}
export async function downloadShareCard(scores){
 const blob=await createShareCard(scores),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='my-seven-little-sins.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
