/* ═══════════════════════════════════════════════════════════
   Salle d'arcade — les six jeux
   Cascade, Serpent, Quatre Couleurs et Dames : repris de la version précédente.
   Memory et Ugo : nouveaux.
   Chaque jeu reçoit un nombre de vies (ou de parties) et rend la main à ARCADE.retour().
   ═══════════════════════════════════════════════════════════ */
(function(){
const $ = s => document.querySelector(s);
const R = ARC.R, pick = ARC.pick, shuffle = ARC.shuffle;
const show = id => ARCADE.show(id);
const P = () => ARCADE.stats();
const save = () => ARCADE.sauver();
const home = () => ARCADE.retour();

/* ---------- Cascade : jeu de blocs ---------- */
const GW=10,GH=20;
const SHP={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const PCOL={I:'#3fd0e8',O:'#ffd23f',T:'#b06bff',S:'#4fd17a',Z:'#ff5a5f',J:'#4f7dff',L:'#ff9a3c'};
let B=null,CELL=24;
const emptyGrid=()=>Array.from({length:GH},()=>Array(GW).fill(null));
function gameStart(lives){
  B={grid:emptyGrid(),lives,max:lives,score:0,lines:0,level:1,elapsed:0,prev:0,bag:[],cur:null,next:null,last:0,paused:false,alive:true};
  show('game');sizeBoard();B.next=takeP();spawnP();hud();$('#gOver').hidden=true;
  B.last=performance.now();requestAnimationFrame(loop);
}
function sizeBoard(){
  const w=Math.min($('.app').clientWidth-36,420),h=window.innerHeight-250;
  CELL=Math.max(14,Math.floor(Math.min(w/GW,h/GH)));
  const c=$('#gBoard'),d=window.devicePixelRatio||1;
  c.width=CELL*GW*d;c.height=CELL*GH*d;c.style.width=CELL*GW+'px';c.style.height=CELL*GH+'px';
  c.getContext('2d').setTransform(d,0,0,d,0,0);
}
function takeP(){if(!B.bag.length)B.bag=shuffle(Object.keys(SHP));const k=B.bag.pop();return{k,m:SHP[k].map(r=>r.slice()),x:0,y:0}}
function hit(m,x,y){for(let r=0;r<m.length;r++)for(let c=0;c<m[r].length;c++)if(m[r][c]){const X=x+c,Y=y+r;if(X<0||X>=GW||Y>=GH)return true;if(Y>=0&&B.grid[Y][X])return true}return false}
function spawnP(){B.cur=B.next;B.next=takeP();B.cur.x=Math.floor((GW-B.cur.m[0].length)/2);B.cur.y=B.cur.k==='I'?-1:0;drawNext();if(hit(B.cur.m,B.cur.x,B.cur.y))loseLife()}
const rotM=m=>m.map((r,i)=>r.map((_,j)=>m[m.length-1-j][i]));
function act(a){
  if(!B||B.paused||!B.alive)return;const p=B.cur;
  if(a==='left'&&!hit(p.m,p.x-1,p.y))p.x--;
  if(a==='right'&&!hit(p.m,p.x+1,p.y))p.x++;
  if(a==='rot'){const m=rotM(p.m);for(const dx of [0,-1,1,-2,2])if(!hit(m,p.x+dx,p.y)){p.m=m;p.x+=dx;break}}
  if(a==='down'){if(!hit(p.m,p.x,p.y+1)){p.y++;B.score+=1;B.last=performance.now()}else lockP()}
  if(a==='drop'){let d=0;while(!hit(p.m,p.x,p.y+1)){p.y++;d++}B.score+=d*2;lockP()}
  draw();hud();
}
function lockP(){
  const p=B.cur;let top=false;
  p.m.forEach((r,ri)=>r.forEach((v,ci)=>{if(v){const Y=p.y+ri;if(Y<0)top=true;else B.grid[Y][p.x+ci]=p.k}}));
  if(top)return loseLife();
  let n=0;for(let r=GH-1;r>=0;r--){if(B.grid[r].every(Boolean)){B.grid.splice(r,1);B.grid.unshift(Array(GW).fill(null));n++;r++}}
  if(n){B.lines+=n;B.score+=[0,100,300,500,800][n]*B.level}
  spawnP();hud();
}
function loseLife(){
  B.lives--;B.paused=true;hud();
  if(B.lives>0)over(`Encore ${B.lives} vie !`,`Score : ${B.score}. Le plateau repart à zéro, ton score est gardé.`,'Continuer',()=>{B.grid=emptyGrid();B.elapsed=Math.max(0,B.elapsed-20000);B.paused=false;$('#gOver').hidden=true;spawnP();B.last=performance.now()});
  else{
    B.alive=false;const p=P();const rec=!p.cascade||B.score>p.cascade;if(rec)p.cascade=B.score;save();
    over('Partie terminée',`Score : <b>${B.score}</b> · ${B.lines} ligne${B.lines>1?'s':''}<br>${rec&&B.score>0?'Nouveau record !':'Record : '+p.cascade}`,'Retour à l\'accueil',()=>{B=null;home()});
  }
}
function over(t,txt,lab,fn){const o=$('#gOver');o.innerHTML=`<h3>${t}</h3><p>${txt}</p><button class="btn" id="gBtn">${lab}</button>`;o.hidden=false;$('#gBtn').onclick=fn}
function hud(){if(!B)return;$('#gLives').innerHTML='♥'.repeat(Math.max(0,B.lives))+`<span class="off">${'♥'.repeat(B.max-Math.max(0,B.lives))}</span>`;$('#gScore').textContent=B.score;$('#gLines').textContent=B.level}
function cell(ctx,x,y,s,col,ghost){
  if(ghost){ctx.strokeStyle=col;ctx.globalAlpha=.45;ctx.lineWidth=2;ctx.strokeRect(x*s+2,y*s+2,s-4,s-4);ctx.globalAlpha=1;return}
  ctx.fillStyle=col;ctx.fillRect(x*s+1,y*s+1,s-2,s-2);
  ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(x*s+1,y*s+1,s-2,Math.max(2,s*.18));
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(x*s+1,y*s+s-1-Math.max(2,s*.14),s-2,Math.max(2,s*.14));
}
function draw(){
  if(!B)return;const c=$('#gBoard'),x=c.getContext('2d'),s=CELL;
  x.fillStyle='#0b1030';x.fillRect(0,0,GW*s,GH*s);
  x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;
  for(let i=1;i<GW;i++){x.beginPath();x.moveTo(i*s+.5,0);x.lineTo(i*s+.5,GH*s);x.stroke()}
  for(let j=1;j<GH;j++){x.beginPath();x.moveTo(0,j*s+.5);x.lineTo(GW*s,j*s+.5);x.stroke()}
  B.grid.forEach((r,ry)=>r.forEach((v,rx)=>{if(v)cell(x,rx,ry,s,PCOL[v])}));
  const p=B.cur;if(!p||!B.alive)return;
  let gy=p.y;while(!hit(p.m,p.x,gy+1))gy++;
  p.m.forEach((r,ri)=>r.forEach((v,ci)=>{if(v&&gy+ri>=0)cell(x,p.x+ci,gy+ri,s,PCOL[p.k],true)}));
  p.m.forEach((r,ri)=>r.forEach((v,ci)=>{if(v&&p.y+ri>=0)cell(x,p.x+ci,p.y+ri,s,PCOL[p.k])}));
}
function drawNext(){
  const c=$('#gNext'),x=c.getContext('2d'),m=B.next.m,s=14;x.clearRect(0,0,64,64);x.fillStyle='#0b1030';x.fillRect(0,0,64,64);
  const rows=m.filter(r=>r.some(Boolean)),w=Math.max(...rows.map(r=>r.length)),ox=(64-w*s)/2,oy=(64-rows.length*s)/2;
  x.save();x.translate(ox,oy);rows.forEach((r,ri)=>r.forEach((v,ci)=>{if(v)cell(x,ci,ri,s,PCOL[B.next.k])}));x.restore();
}
function loop(t){
  if(!B||!B.alive)return;
  const dt=B.prev?t-B.prev:0;B.prev=t;
  if(!B.paused){
    B.elapsed+=Math.min(dt,100);
    const lv=1+Math.floor(B.elapsed/20000);if(lv!==B.level){B.level=lv;hud()}
    /* la vitesse double toutes les 60 s de jeu, et chaque ligne accélère encore un peu */
    const iv=Math.max(50,650*Math.pow(.5,B.elapsed/60000)*Math.pow(.97,B.lines));
    if(t-B.last>iv){B.last=t;const p=B.cur;if(!hit(p.m,p.x,p.y+1))p.y++;else lockP()}}
  draw();requestAnimationFrame(loop);
}
let rep=null,repT=null;
const stopRep=()=>{clearTimeout(repT);clearInterval(rep);rep=repT=null};
document.querySelector('.gctl').addEventListener('pointerdown',e=>{
  const b=e.target.closest('button');if(!b)return;e.preventDefault();stopRep();const a=b.dataset.g;act(a);
  if(a==='left'||a==='right'||a==='down')repT=setTimeout(()=>{rep=setInterval(()=>act(a),a==='down'?45:70)},180);
});
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.querySelector('.gctl').addEventListener(ev,stopRep));
document.addEventListener('keydown',e=>{
  if($('#s-game').hidden||!B)return;
  const m={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rot',' ':'drop'};
  if(m[e.key]){e.preventDefault();act(m[e.key])}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&B&&B.alive&&!B.paused){B.paused=true;over('Pause','Ta partie t\'attend.','Reprendre',()=>{B.paused=false;$('#gOver').hidden=true;B.last=performance.now()})}
});
$('#gQuit').onclick=()=>{if(!B)return home();B.paused=true;over('Arrêter ?','Les vies restantes seront perdues.','Oui, arrêter',()=>{B.lives=1;B.paused=false;loseLife()});
  $('#gOver').insertAdjacentHTML('beforeend','<button class="btn" id="gNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer à jouer</button>');
  $('#gNo').onclick=()=>{B.paused=false;$('#gOver').hidden=true;B.last=performance.now()}};

/* ---------- Quatre Couleurs : jeu de cartes contre l'ordinateur ---------- */
const UC=['r','j','v','b'],UCN={r:'Rouge',j:'Jaune',v:'Vert',b:'Bleu'},UHEX={r:'#e0383e',j:'#f2b705',v:'#27a046',b:'#2563d9'};
const SYM={'+2':'+2',inv:'⇄',pas:'⊘',joker:'★','+4':'+4'};
let U=null,uT=null;
function newDeck(){const d=[];for(const c of UC){d.push({c,v:'0'});for(let i=1;i<=9;i++)d.push({c,v:''+i},{c,v:''+i});for(const a of ['+2','inv','pas'])d.push({c,v:a},{c,v:a})}
  for(let i=0;i<4;i++)d.push({c:'w',v:'joker'},{c:'w',v:'+4'});return shuffle(d).map((x,i)=>Object.assign(x,{id:i}))}
const topC=()=>U.pile[U.pile.length-1];
const canPlay=c=>c.c==='w'||c.c===U.color||c.v===topC().v;
const ORDER={r:0,j:1,v:2,b:3,w:4};
function ccStart(parties){U={parties,played:0};show('cc');ccNewGame()}
function ccNewGame(){
  clearTimeout(uT);
  Object.assign(U,{deck:newDeck(),pile:[],me:[],ai:[],turn:'me',said:false,drawn:null,busy:false,over:false,aiSaid:false});
  for(let i=0;i<5;i++){U.me.push(U.deck.pop());U.ai.push(U.deck.pop())}
  let t;while(true){t=U.deck.pop();if(/^\d$/.test(t.v))break;U.deck.unshift(t)}
  U.pile.push(t);U.color=t.c;$('#ccOver').hidden=true;
  ccMsg('À toi de jouer ! Pose une carte de la même couleur ou du même chiffre.');ccRender();
}
function ccDraw(n,who){const out=[];for(let i=0;i<n;i++){
  if(!U.deck.length){const top=U.pile.pop();U.deck=shuffle(U.pile);U.pile=[top]}
  if(!U.deck.length)break;out.push(U.deck.pop())}U[who].push(...out);return out}
function cardHTML(c,cls,dis){const s=SYM[c.v]||c.v,u=(c.v==='6'||c.v==='9')?' u':'';
  return `<button class="card ${c.c==='w'?'wild':'c-'+c.c} ${cls||''}" data-id="${c.id}"${dis?' disabled':''} aria-label="${c.c==='w'?(c.v==='+4'?'Plus 4':'Joker'):UCN[c.c]+' '+s}"><span class="cn tl${u}">${s}</span><span class="ov"><b class="${u}">${s}</b></span><span class="cn br${u}">${s}</span></button>`}
function ccMsg(h){$('#ccMsg').innerHTML=h}
function ccRender(){
  const p=P();$('#ccInfo').textContent=`${Math.min(U.played+1,U.parties)}/${U.parties}`;$('#ccWins').textContent=p.ccW||0;
  const n=U.ai.length;$('#ccAi').innerHTML='<span class="back-card"><span>4</span></span>'.repeat(Math.min(n,12));
  $('#ccAiLab').innerHTML=`Ordinateur · ${n} carte${n>1?'s':''}${U.aiSaid&&n===1?' <span class="bubble">Dernière carte !</span>':''}`;
  $('#ccTop').innerHTML=cardHTML(topC(),'big',true).replace(' disabled','');
  $('#ccColor').innerHTML=`<i style="background:${UHEX[U.color]}"></i>${UCN[U.color]}`;
  const myTurn=U.turn==='me'&&!U.busy&&!U.over;
  const hand=U.me.slice().sort((a,b)=>ORDER[a.c]-ORDER[b.c]||(a.v>b.v?1:-1));
  const box=$('#ccMe'),avail=box.clientWidth||320,cw=60,m=hand.length;
  let ov=m>1?Math.min(6,(avail-m*cw)/(m-1)):0;const wrap=ov<-(cw-24);
  box.classList.toggle('wrap',wrap);
  box.innerHTML=hand.map((c,i)=>{const ok=myTurn&&canPlay(c)&&(!U.drawn||U.drawn.id===c.id);
    return cardHTML(c,ok?'play':'',!myTurn||!ok).replace('class="card','style="'+(!wrap&&i?`margin-left:${ov}px`:'')+'" class="card')}).join('');
  $('#ccDeck').disabled=!myTurn||!!U.drawn;
  $('#ccLast').hidden=!(myTurn&&U.me.length===2&&!U.said);
  $('#ccPass').hidden=!(myTurn&&U.drawn);
}
$('#ccMe').addEventListener('click',e=>{const b=e.target.closest('.card');if(!b||b.disabled||!U||U.turn!=='me'||U.busy||U.over)return;
  const c=U.me.find(x=>x.id===+b.dataset.id);if(!c||!canPlay(c))return;
  U.me=U.me.filter(x=>x!==c);U.pile.push(c);U.drawn=null;
  if(c.c==='w'){U.busy=true;ccRender();pickColor(col=>{U.busy=false;resolve(c,'me',col)})}
  else resolve(c,'me');
});
function pickColor(fn){U.pickFn=fn;const o=$('#ccOver');o.innerHTML=`<h3>Choisis la couleur</h3><div class="pick">${UC.map(c=>`<button data-c="${c}" style="background:${UHEX[c]}">${UCN[c]}</button>`).join('')}</div>`;o.hidden=false;
  o.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{o.hidden=true;U.pickFn=null;fn(b.dataset.c)})}
function resolve(c,who,col){
  const other=who==='me'?'ai':'me',me=who==='me';let again=false,txt='';
  U.color=c.c==='w'?col:c.c;
  const nm=me?'Tu':'L\'ordinateur';
  if(c.v==='+2'){ccDraw(2,other);again=true;txt=me?'L\'ordinateur pioche 2 cartes et passe son tour.':'Tu pioches 2 cartes et tu passes ton tour.'}
  else if(c.v==='+4'){ccDraw(4,other);again=true;txt=(me?'L\'ordinateur pioche 4 cartes.':'Tu pioches 4 cartes.')+` Couleur : ${UCN[U.color]}.`}
  else if(c.v==='inv'||c.v==='pas'){again=true;txt=me?'L\'ordinateur passe son tour.':'Tu passes ton tour.'}
  else if(c.v==='joker')txt=`${nm} ${me?'choisis':'choisit'} le ${UCN[U.color].toLowerCase()}.`;
  if(me&&U.me.length===1&&!U.said){ccDraw(2,'me');txt+=' Tu as oublié « Dernière carte ! » : tu pioches 2 cartes.'}
  U.said=false;
  if(!U[who].length)return ccEnd(who);
  U.turn=again?who:other;
  if(U.turn==='ai'){U.busy=true;ccMsg(txt||'Au tour de l\'ordinateur…');ccRender();uT=setTimeout(aiTurn,1100)}
  else{U.busy=false;ccMsg((txt?txt+' ':'')+(again&&me?'Tu rejoues !':'À toi de jouer !'));ccRender()}
}
$('#ccDeck').onclick=()=>{if(!U||U.turn!=='me'||U.busy||U.drawn||U.over)return;
  const c=ccDraw(1,'me')[0];U.said=false;
  if(c&&canPlay(c)){U.drawn=c;ccMsg('Tu peux jouer la carte piochée, ou la garder.');ccRender()}
  else{U.turn='ai';U.busy=true;ccMsg('Tu ne peux pas la jouer. Au tour de l\'ordinateur…');ccRender();uT=setTimeout(aiTurn,1100)}};
$('#ccPass').onclick=()=>{if(!U||!U.drawn)return;U.drawn=null;U.turn='ai';U.busy=true;ccMsg('Au tour de l\'ordinateur…');ccRender();uT=setTimeout(aiTurn,1000)};
$('#ccLast').onclick=()=>{if(!U)return;U.said=true;ccMsg('<span class="bubble">Dernière carte !</span> Maintenant, joue.');ccRender()};
function aiChoose(pl){
  const opp=U.me.length,nw=pl.filter(c=>c.c!=='w');
  const cnt={};U.ai.forEach(c=>{if(c.c!=='w')cnt[c.c]=(cnt[c.c]||0)+1});
  if(nw.length){
    if(opp<=2){const a=nw.find(c=>['+2','pas','inv'].includes(c.v));if(a)return a}
    if(opp<=1){const f=pl.find(c=>c.v==='+4');if(f)return f}
    nw.sort((a,b)=>(cnt[b.c]||0)-(cnt[a.c]||0)||(isNaN(b.v)?10:+b.v)-(isNaN(a.v)?10:+a.v));
    return nw[0];
  }
  return pl.find(c=>c.v==='joker')&&opp>3?pl.find(c=>c.v==='joker'):(pl.find(c=>c.v==='+4')||pl[0]);
}
function aiColor(){const cnt={r:0,j:0,v:0,b:0};U.ai.forEach(c=>{if(c.c!=='w')cnt[c.c]++});return UC.slice().sort((a,b)=>cnt[b]-cnt[a])[0]}
function aiPlay(c){U.ai=U.ai.filter(x=>x!==c);U.pile.push(c);U.aiSaid=U.ai.length===1;
  const s=SYM[c.v]||c.v;ccMsg(`L'ordinateur joue ${c.c==='w'?s:s+' '+UCN[c.c].toLowerCase()}.`);
  resolve(c,'ai',c.c==='w'?aiColor():null)}
function aiTurn(){
  if(!U||U.over)return;
  const pl=U.ai.filter(canPlay);
  if(pl.length)return aiPlay(aiChoose(pl));
  const c=ccDraw(1,'ai')[0];ccMsg('L\'ordinateur pioche une carte.');ccRender();
  if(c&&canPlay(c)){uT=setTimeout(()=>aiPlay(c),900)}
  else uT=setTimeout(()=>{U.turn='me';U.busy=false;ccMsg('À toi de jouer !');ccRender()},900);
}
function ccEnd(who){
  U.over=true;U.played++;const p=P();p.ccG=(p.ccG||0)+1;if(who==='me')p.ccW=(p.ccW||0)+1;save();ccRender();
  const more=U.played<U.parties;
  const o=$('#ccOver');o.innerHTML=`<h3>${who==='me'?'Tu as gagné !':'L\'ordinateur a gagné'}</h3><p>Tes victoires : <b>${p.ccW||0}</b> sur ${p.ccG} partie${p.ccG>1?'s':''}</p><button class="btn" id="ccNext">${more?'Partie suivante':'Retour à l\'accueil'}</button>`;o.hidden=false;
  $('#ccNext').onclick=()=>{if(more)ccNewGame();else{U=null;home()}};
}
$('#ccQuit').onclick=()=>{if(!U||U.over){clearTimeout(uT);U=null;return home()}const o=$('#ccOver');
  o.innerHTML=`<h3>Arrêter ?</h3><p>Les parties restantes seront perdues.</p><button class="btn" id="ccYes">Oui, arrêter</button><button class="btn" id="ccNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer à jouer</button>`;o.hidden=false;
  $('#ccYes').onclick=()=>{clearTimeout(uT);U=null;home()};
  $('#ccNo').onclick=()=>{o.hidden=true;if(U.pickFn)pickColor(U.pickFn)};
};

/* ---------- Serpent ---------- */
const SW=15,SH=19,DIRS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
let S=null,SC=20;
function snakeStart(lives){
  S={lives,max:lives,score:0,fruits:0,elapsed:0,prev:0,acc:0,level:1,alive:true,paused:false};
  show('snake');sizeSnake();snakeReset();sHud();$('#sOver').hidden=true;requestAnimationFrame(sLoop);
}
function sizeSnake(){
  const w=Math.min($('.app').clientWidth-36,420),h=window.innerHeight-260;
  SC=Math.max(14,Math.floor(Math.min(w/SW,h/SH)));
  const c=$('#sBoard'),d=window.devicePixelRatio||1;
  c.width=SC*SW*d;c.height=SC*SH*d;c.style.width=SC*SW+'px';c.style.height=SC*SH+'px';c.getContext('2d').setTransform(d,0,0,d,0,0);
}
function snakeReset(){const y=Math.floor(SH/2);S.body=[{x:5,y},{x:4,y},{x:3,y}];S.dir=DIRS.right;S.q=[];S.bonus=null;sFood();S.acc=0}
function sFree(){const occ=new Set(S.body.map(p=>p.x+','+p.y));if(S.food)occ.add(S.food.x+','+S.food.y);if(S.bonus)occ.add(S.bonus.x+','+S.bonus.y);
  let p;do{p={x:R(0,SW-1),y:R(0,SH-1)}}while(occ.has(p.x+','+p.y));return p}
function sFood(){S.food=null;S.food=sFree()}
function turn(name){if(!S||S.paused||!S.alive)return;const d=DIRS[name],last=S.q.length?S.q[S.q.length-1]:S.dir;
  if(d.x===-last.x&&d.y===-last.y)return;if(d.x===last.x&&d.y===last.y)return;if(S.q.length<2)S.q.push(d)}
function sStep(){
  if(S.q.length)S.dir=S.q.shift();
  const h=S.body[0],n={x:h.x+S.dir.x,y:h.y+S.dir.y};
  const eat=n.x===S.food.x&&n.y===S.food.y,bon=S.bonus&&n.x===S.bonus.x&&n.y===S.bonus.y;
  const grow=eat||bon,check=grow?S.body:S.body.slice(0,-1);
  if(n.x<0||n.y<0||n.x>=SW||n.y>=SH||check.some(p=>p.x===n.x&&p.y===n.y))return sCrash();
  S.body.unshift(n);
  if(eat){S.fruits++;S.score+=10*S.level;sFood();if(!S.bonus&&Math.random()<.2){const p=sFree();S.bonus={...p,until:S.elapsed+5000}}}
  else if(bon){S.score+=50*S.level;S.bonus=null}
  else S.body.pop();
  sHud();
}
function sCrash(){
  S.lives--;S.paused=true;sHud();
  if(S.lives>0)sOver(`Encore ${S.lives} vie !`,`Score : ${S.score}. Le serpent repart petit, ton score est gardé.`,'Continuer',()=>{S.elapsed=Math.max(0,S.elapsed-20000);snakeReset();S.paused=false;$('#sOver').hidden=true;sHud()});
  else{S.alive=false;const p=P();const rec=!p.snake||S.score>p.snake;if(rec)p.snake=S.score;save();
    sOver('Partie terminée',`Score : <b>${S.score}</b> · ${S.fruits} fruit${S.fruits>1?'s':''}<br>${rec&&S.score>0?'Nouveau record !':'Record : '+p.snake}`,'Retour à l\'accueil',()=>{S=null;home()})}
}
function sOver(t,txt,lab,fn){const o=$('#sOver');o.innerHTML=`<h3>${t}</h3><p>${txt}</p><button class="btn" id="sBtn">${lab}</button>`;o.hidden=false;$('#sBtn').onclick=fn}
function sHud(){if(!S)return;$('#sLives').innerHTML='♥'.repeat(Math.max(0,S.lives))+`<span class="off">${'♥'.repeat(S.max-Math.max(0,S.lives))}</span>`;$('#sScore').textContent=S.score;$('#sLevel').textContent=S.level;$('#sLen').textContent=S.body?S.body.length:3}
function sLoop(t){
  if(!S||!S.alive)return;
  const dt=S.prev?Math.min(t-S.prev,100):0;S.prev=t;
  if(!S.paused){
    S.elapsed+=dt;S.acc+=dt;
    const lv=1+Math.floor(S.elapsed/20000);if(lv!==S.level){S.level=lv;sHud()}
    if(S.bonus&&S.elapsed>S.bonus.until)S.bonus=null;
    /* 200 ms par case au départ, environ 2 fois plus vite toutes les 80 s, et chaque fruit accélère un peu */
    const iv=Math.max(55,200*Math.pow(.5,S.elapsed/80000)*Math.pow(.985,S.fruits));
    while(S.acc>=iv&&!S.paused&&S.alive){S.acc-=iv;sStep()}
  }
  sDraw(t);requestAnimationFrame(sLoop);
}
function sDraw(t){
  if(!S)return;const x=$('#sBoard').getContext('2d'),s=SC;
  for(let i=0;i<SW;i++)for(let j=0;j<SH;j++){x.fillStyle=(i+j)%2?'#0e1438':'#0b1030';x.fillRect(i*s,j*s,s,s)}
  const f=S.food;x.fillStyle='#ff4d5a';x.beginPath();x.arc(f.x*s+s/2,f.y*s+s/2+1,s*.36,0,7);x.fill();
  x.fillStyle='#4fd17a';x.beginPath();x.ellipse(f.x*s+s*.62,f.y*s+s*.2,s*.14,s*.08,-.6,0,7);x.fill();
  if(S.bonus){const b=S.bonus,pulse=.32+.06*Math.sin(t/120);x.fillStyle='#ffd23f';x.beginPath();x.arc(b.x*s+s/2,b.y*s+s/2,s*pulse,0,7);x.fill();
    x.fillStyle='#0b1030';x.font=`bold ${Math.round(s*.5)}px sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText('★',b.x*s+s/2,b.y*s+s/2+1)}
  S.body.forEach((p,i)=>{const r=s*.22,k=i?1-Math.min(.35,i/S.body.length*.35):1;
    x.fillStyle=i?`rgba(79,209,122,${k})`:'#8ff0b0';
    const px=p.x*s+1,py=p.y*s+1,w=s-2;x.beginPath();x.roundRect?x.roundRect(px,py,w,w,r):x.rect(px,py,w,w);x.fill()});
  const h=S.body[0],d=S.dir,cx=h.x*s+s/2,cy=h.y*s+s/2,ox=d.y?s*.2:0,oy=d.x?s*.2:0,fx=d.x*s*.15,fy=d.y*s*.15;
  x.fillStyle='#0b1030';[[1],[-1]].forEach(([m])=>{x.beginPath();x.arc(cx+ox*m+fx,cy+oy*m+fy,s*.09,0,7);x.fill()});
}
document.querySelector('.dpad').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();turn(b.dataset.d)});
let sw0=null;
$('#sBoard').addEventListener('pointerdown',e=>{sw0={x:e.clientX,y:e.clientY}});
$('#sBoard').addEventListener('pointermove',e=>{if(!sw0)return;const dx=e.clientX-sw0.x,dy=e.clientY-sw0.y;
  if(Math.max(Math.abs(dx),Math.abs(dy))>18){turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));sw0={x:e.clientX,y:e.clientY}}});
['pointerup','pointercancel','pointerleave'].forEach(ev=>$('#sBoard').addEventListener(ev,()=>{sw0=null}));
document.addEventListener('keydown',e=>{if($('#s-snake').hidden||!S)return;const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(m[e.key]){e.preventDefault();turn(m[e.key])}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&S.alive&&!S.paused){S.paused=true;sOver('Pause','Ton serpent t\'attend.','Reprendre',()=>{S.paused=false;$('#sOver').hidden=true})}});
$('#sQuit').onclick=()=>{if(!S)return home();if(!S.alive){S=null;return home()}S.paused=true;
  sOver('Arrêter ?','Les vies restantes seront perdues.','Oui, arrêter',()=>{S.lives=1;S.paused=false;sCrash()});
  $('#sOver').insertAdjacentHTML('beforeend','<button class="btn" id="sNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer à jouer</button>');
  $('#sNo').onclick=()=>{S.paused=false;$('#sOver').hidden=true}};

/* ---------- Jeu de dames contre l'ordinateur ----------
   Règles françaises (dames internationales) : prise obligatoire, prise du plus grand nombre (10x10),
   les pions prennent en avant et en arrière, dames volantes, pions retirés à la fin de la rafle,
   promotion seulement si la rafle se termine sur la dernière ligne. Les blancs (l'enfant) commencent.
   Niveaux : CE2-CM1 = 8x8, ordinateur facile, coups montrés · CM2 = 10x10, réfléchit 3 coups · 6e = 10x10, 5 coups. */
const DDIRS=[[-1,-1],[-1,1],[1,-1],[1,1]];
let DM=null,dTimer=null,dAiT=null;
function dCfg(k){ /* k = rang de la classe : 0 = CP … 8 = 3e */
  if(k <= 2) return {N:8,depth:1,rand:.45,hints:true,major:false};
  if(k <= 4) return {N:10,depth:3,rand:.1,hints:false,major:true};
  var c = [[4,.05],[4,0],[5,.03],[5,0]][Math.min(k,8)-5];
  return {N:10,depth:c[0],rand:c[1],hints:false,major:true};
}
function dNewBoard(N){const b=new Array(N*N).fill(0),rows=N===10?4:3;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++)if((r+c)%2===1){if(r<rows)b[r*N+c]=-1;else if(r>=N-rows)b[r*N+c]=1}return b}
function dGen(b,N,side,major){
  const caps=[],simple=[];
  for(let sq=0;sq<N*N;sq++){const p=b[sq];if(!p||Math.sign(p)!==side)continue;
    const king=Math.abs(p)===2,r0=Math.floor(sq/N),c0=sq%N;
    b[sq]=0;
    const dfs=(pos,path,took)=>{const r=Math.floor(pos/N),c=pos%N;let found=false;
      for(const[dr,dc]of DDIRS){
        if(!king){const r1=r+dr,c1=c+dc,r2=r+2*dr,c2=c+2*dc;
          if(r2<0||r2>=N||c2<0||c2>=N)continue;const i1=r1*N+c1,i2=r2*N+c2;
          if(Math.sign(b[i1])===-side&&!took.includes(i1)&&b[i2]===0){found=true;dfs(i2,path.concat(i2),took.concat(i1))}}
        else{let rr=r+dr,cc=c+dc;
          while(rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr*N+cc]===0){rr+=dr;cc+=dc}
          if(rr<0||rr>=N||cc<0||cc>=N)continue;const ie=rr*N+cc;
          if(Math.sign(b[ie])!==-side||took.includes(ie))continue;
          rr+=dr;cc+=dc;
          while(rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr*N+cc]===0){const il=rr*N+cc;found=true;dfs(il,path.concat(il),took.concat(ie));rr+=dr;cc+=dc}}
      }
      if(!found&&took.length)caps.push({from:sq,path,caps:took});
    };
    dfs(sq,[sq],[]);
    if(!caps.length||true){
      if(!king){for(const dc of[-1,1]){const r=r0-side,c=c0+dc;if(r>=0&&r<N&&c>=0&&c<N&&b[r*N+c]===0)simple.push({from:sq,path:[sq,r*N+c],caps:[]})}}
      else for(const[dr,dc]of DDIRS){let r=r0+dr,c=c0+dc;while(r>=0&&r<N&&c>=0&&c<N&&b[r*N+c]===0){simple.push({from:sq,path:[sq,r*N+c],caps:[]});r+=dr;c+=dc}}
    }
    b[sq]=p;
  }
  if(caps.length){if(!major)return caps;const mx=Math.max(...caps.map(m=>m.caps.length));return caps.filter(m=>m.caps.length===mx)}
  return simple;
}
function dApply(b,N,m){const p=b[m.from];b[m.from]=0;m.caps.forEach(i=>b[i]=0);const to=m.path[m.path.length-1],r=Math.floor(to/N);
  let q=p;if(Math.abs(p)===1&&((p>0&&r===0)||(p<0&&r===N-1)))q=2*p;b[to]=q;return q!==p}
function dEval(b,N){let s=0;for(let i=0;i<b.length;i++){const p=b[i];if(!p)continue;const r=Math.floor(i/N),c=i%N;
  if(p===1)s+=100+(N-1-r)*3+(c>0&&c<N-1?2:0);else if(p===-1)s-=100+r*3+(c>0&&c<N-1?2:0);else s+=p>0?320:-320}return s}
function dSearch(b,N,side,depth,a,be,major,ext){
  const ms=dGen(b,N,side,major);
  if(!ms.length)return -100000-depth;
  if(depth<=0&&(!ms[0].caps.length||ext>=4))return side*dEval(b,N);
  let best=-Infinity;
  for(const m of ms){const nb=b.slice();dApply(nb,N,m);
    const v=-dSearch(nb,N,-side,depth-1,-be,-a,major,depth<=0?ext+1:ext);
    if(v>best)best=v;if(v>a)a=v;if(a>=be)break}
  return best;
}
function dBest(b,N,cfg){
  const ms=dGen(b,N,-1,cfg.major);if(!ms.length)return null;
  if(ms.length===1)return ms[0];
  if(Math.random()<cfg.rand)return pick(ms);
  let best=null,bv=-Infinity;
  for(const m of shuffle(ms)){const nb=b.slice();dApply(nb,N,m);const v=-dSearch(nb,N,1,cfg.depth-1,-Infinity,Infinity,cfg.major,0);if(v>bv){bv=v;best=m}}
  return best;
}
const dCount=(b,s)=>b.filter(p=>Math.sign(p)===s).length;
function damesStart(parties){
  const cfg=dCfg(ARCADE.classeIdx());
  DM={parties,played:0,cfg};show('dames');dNewGame();
}
function dNewGame(){
  clearInterval(dTimer);clearTimeout(dAiT);
  const N=DM.cfg.N;Object.assign(DM,{N,b:dNewBoard(N),turn:1,sel:null,last:[],busy:false,over:false,quiet:0,tLeft:600,paused:false});
  $('#dOver').hidden=true;$('#dBoard').style.gridTemplateColumns=`repeat(${N},1fr)`;
  dLegal();dMsg(N===8?'Tu as les pions blancs : à toi de commencer ! Touche un pion entouré de jaune.':'Tu as les blancs : à toi de commencer ! Rappel : la prise est obligatoire.');
  dRender();
  dTimer=setInterval(()=>{if(!DM||DM.over||DM.paused)return;DM.tLeft-=1;dHud();if(DM.tLeft<=0)dTimeUp()},1000);
}
function dLegal(){DM.legal=dGen(DM.b,DM.N,1,DM.cfg.major)}
function dMsg(t){$('#dMsg').innerHTML=t}
function dHud(){if(!DM)return;const t=Math.max(0,DM.tLeft);$('#dTime').textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;
  $('#dMe').textContent=dCount(DM.b,1);$('#dAi').textContent=dCount(DM.b,-1);$('#dInfo').textContent=`${Math.min(DM.played+(DM.over?0:1),DM.parties)}/${DM.parties}`}
function dRender(){
  const{N,b,sel}=DM,myTurn=DM.turn===1&&!DM.busy&&!DM.over;
  const mustCap=myTurn&&DM.legal.length&&DM.legal[0].caps.length;
  const movable=new Set(myTurn&&(DM.cfg.hints||mustCap)?DM.legal.map(m=>m.from):[]);
  const dests=new Set(myTurn&&sel!=null?DM.legal.filter(m=>m.from===sel).map(m=>m.path[m.path.length-1]):[]);
  let h='';
  for(let i=0;i<N*N;i++){const r=Math.floor(i/N),c=i%N,dark=(r+c)%2===1,p=b[i];
    const cls=['dc'];if(dark)cls.push('k');if(DM.last.includes(i))cls.push('last');if(i===sel)cls.push('sel');if(dests.has(i))cls.push('dest');
    h+=`<div class="${cls.join(' ')}" data-i="${i}">${p?`<span class="pc ${p>0?'w':'b'}${movable.has(i)?' mv':''}">${Math.abs(p)===2?'♛':''}</span>`:''}</div>`}
  $('#dBoard').innerHTML=h;dHud();
}
const dSleep=ms=>new Promise(r=>setTimeout(r,ms));
async function dPlay(m,side){
  DM.busy=true;DM.sel=null;const piece=DM.b[m.from];
  for(let k=1;k<m.path.length;k++){DM.b[m.path[k-1]]=0;DM.b[m.path[k]]=piece;DM.last=[m.path[k-1],m.path[k]];dRender();await dSleep(m.path.length>2?260:160);if(!DM)return}
  DM.b[m.path[m.path.length-1]]=0;DM.b[m.from]=piece;
  const promo=dApply(DM.b,DM.N,m);DM.last=[m.from,m.path[m.path.length-1]];
  DM.quiet=(m.caps.length||Math.abs(piece)===1)?0:DM.quiet+1;
  const n=m.caps.length;
  let txt=side===1?(n?`Bien joué, tu prends ${n} pion${n>1?'s':''} !`:''):(n?`L'ordinateur prend ${n} pion${n>1?'s':''}.`:'');
  if(promo)txt+=side===1?' Ton pion devient une dame : elle peut avancer et reculer de plusieurs cases !':' L\'ordinateur a une dame.';
  DM.turn=-side;DM.busy=false;
  if(dCheckEnd())return;
  if(DM.turn===1){dLegal();const mc=DM.legal[0].caps.length;dMsg((txt?txt+' ':'')+(mc?'<b>Tu dois prendre !</b> Les pions qui peuvent prendre sont entourés de jaune.':'À toi de jouer.'));dRender()}
  else{dMsg((txt?txt+' ':'')+'L\'ordinateur réfléchit…');dRender();dAiT=setTimeout(dAiTurn,380)}
}
function dAiTurn(){if(!DM||DM.over)return;const m=dBest(DM.b,DM.N,DM.cfg);if(!m)return dEnd(1,'L\'ordinateur ne peut plus bouger.');dPlay(m,-1)}
function dCheckEnd(){
  const me=dCount(DM.b,1),ai=dCount(DM.b,-1);
  if(!ai)return dEnd(1,'Tu as pris tous les pions de l\'ordinateur !'),true;
  if(!me)return dEnd(-1,'L\'ordinateur a pris tous tes pions.'),true;
  if(!dGen(DM.b,DM.N,DM.turn,DM.cfg.major).length)return dEnd(-DM.turn,DM.turn===1?'Tu ne peux plus bouger aucun pion.':'L\'ordinateur ne peut plus bouger.'),true;
  if(DM.quiet>=50)return dEnd(0,'Plus aucune prise depuis longtemps.'),true;
  return false;
}
function dTimeUp(){if(DM.over)return;clearTimeout(dAiT);const me=dCount(DM.b,1),ai=dCount(DM.b,-1);
  dEnd(me>ai?1:me<ai?-1:0,`Les 10 minutes sont écoulées : il te reste ${me} pion${me>1?'s':''}, et ${ai} à l'ordinateur.`)}
function dEnd(win,why){
  DM.over=true;clearInterval(dTimer);DM.played++;dMsg('');dRender();
  const p=P();p.dG=(p.dG||0)+1;if(win===1)p.dW=(p.dW||0)+1;save();
  const more=DM.played<DM.parties,o=$('#dOver');
  o.innerHTML=`<h3>${win===1?'Tu as gagné !':win===-1?'L\'ordinateur a gagné':'Match nul'}</h3><p>${why}<br>Tes victoires aux dames : <b>${p.dW||0}</b> sur ${p.dG}</p><button class="btn" id="dNext">${more?'Partie suivante':'Retour à l\'accueil'}</button>`;
  o.hidden=false;$('#dNext').onclick=()=>{if(more)dNewGame();else{DM=null;home()}};
}
$('#dBoard').addEventListener('click',e=>{
  const cell=e.target.closest('.dc');if(!cell||!DM||DM.turn!==1||DM.busy||DM.over)return;
  const i=+cell.dataset.i,p=DM.b[i];
  if(DM.sel!=null){const m=DM.legal.find(x=>x.from===DM.sel&&x.path[x.path.length-1]===i);if(m)return dPlay(m,1)}
  if(p>0){
    if(DM.legal.some(m=>m.from===i)){DM.sel=i;dMsg(DM.legal[0].caps.length?'Touche la case verte pour faire ta prise.':'Touche une case verte pour avancer.')}
    else{DM.sel=null;const mc=DM.legal[0]&&DM.legal[0].caps.length;
      dMsg(mc?(DM.cfg.major?'<b>Tu dois prendre</b>, et prendre le plus de pions possible. Cherche les pions entourés de jaune.':'<b>Tu dois prendre</b> avec un pion entouré de jaune.'):'Ce pion est bloqué. Essaie un autre pion.')}
    dRender();
  }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&DM&&!DM.over&&!DM.paused){DM.paused=true;const o=$('#dOver');
  o.innerHTML='<h3>Pause</h3><p>Le temps est arrêté.</p><button class="btn" id="dRes">Reprendre</button>';o.hidden=false;$('#dRes').onclick=()=>{DM.paused=false;o.hidden=true}}});
$('#dQuit').onclick=()=>{if(!DM||DM.over){clearInterval(dTimer);DM=null;return home()}DM.paused=true;const o=$('#dOver');
  o.innerHTML='<h3>Arrêter ?</h3><p>Les parties restantes seront perdues.</p><button class="btn" id="dYes">Oui, arrêter</button><button class="btn" id="dNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer à jouer</button>';o.hidden=false;
  $('#dYes').onclick=()=>{clearInterval(dTimer);clearTimeout(dAiT);DM=null;home()};
  $('#dNo').onclick=()=>{DM.paused=false;o.hidden=true}};


/* ---------- Memory ---------- */
const MEMO_IMG = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐤','🦆','🐴','🦄','🐝','🐞','🦋','🐢','🐙','🐬','🐳','🐟','🦀','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🍍','🥝','🥕','🌽'];
let MM = null;
function memoryStart(grilles){
  const k = ARCADE.classeIdx(), paires = [6,6,8,8,10,10,12,12,12][k];
  MM = {grilles, faites:0, paires};
  show('memory'); memoNouvelle();
}
function memoNouvelle(){
  const n = MM.paires, imgs = shuffle(MEMO_IMG).slice(0, n), cartes = shuffle(imgs.concat(imgs));
  Object.assign(MM, {cartes, ret:[], trouve:0, coups:0, bloque:false, fini:false});
  const large = Math.min(document.querySelector('.app').clientWidth, 560);
  const cols = n <= 8 ? 4 : (large < 460 ? 4 : (n === 10 ? 5 : 6));
  $('#mGrid').style.gridTemplateColumns = `repeat(${cols},1fr)`;
  $('#mGrid').innerHTML = cartes.map((c,i) => `<button class="mcarte" data-i="${i}" aria-label="Carte ${i+1}"><span class="mi"><span class="mf"></span><span class="md">${c}</span></span></button>`).join('');
  $('#mOver').hidden = true; memoHud();
}
function memoHud(){ $('#mInfo').textContent = `${Math.min(MM.faites+1, MM.grilles)}/${MM.grilles}`; $('#mCoups').textContent = MM.coups; $('#mPaires').textContent = `${MM.trouve}/${MM.paires}`; }
$('#mGrid').addEventListener('click', e => {
  const b = e.target.closest('.mcarte'); if(!b || !MM || MM.bloque || MM.fini) return;
  const i = +b.dataset.i; if(b.classList.contains('ret') || b.classList.contains('ok')) return;
  b.classList.add('ret'); MM.ret.push(i);
  if(MM.ret.length < 2) return;
  MM.coups++; const [a, c] = MM.ret, ba = $(`.mcarte[data-i="${a}"]`), bc = $(`.mcarte[data-i="${c}"]`);
  if(MM.cartes[a] === MM.cartes[c]){ ba.classList.add('ok'); bc.classList.add('ok'); MM.ret = []; MM.trouve++; memoHud(); if(MM.trouve === MM.paires) setTimeout(memoFin, 500); }
  else { MM.bloque = true; memoHud(); setTimeout(() => { ba.classList.remove('ret'); bc.classList.remove('ret'); MM.ret = []; MM.bloque = false; }, 850); }
});
function memoFin(){
  MM.fini = true; MM.faites++;
  const p = P(), cle = 'memo' + MM.paires, rec = !p[cle] || MM.coups < p[cle]; if(rec) p[cle] = MM.coups; save();
  const encore = MM.faites < MM.grilles, o = $('#mOver');
  o.innerHTML = `<h3>Bravo !</h3><p>Grille finie en <b>${MM.coups}</b> coups.<br>${rec ? 'Nouveau record !' : 'Record : ' + p[cle] + ' coups'}</p><button class="btn" id="mNext">${encore ? 'Grille suivante' : 'Retour à la salle'}</button>`;
  o.hidden = false; $('#mNext').onclick = () => { if(encore) memoNouvelle(); else { MM = null; home(); } };
}
$('#mQuit').onclick = () => {
  if(!MM || MM.fini && MM.faites >= MM.grilles){ MM = null; return home(); }
  const o = $('#mOver'); o.innerHTML = '<h3>Arrêter ?</h3><p>Les grilles restantes seront perdues.</p><button class="btn" id="mYes">Oui, arrêter</button><button class="btn" id="mNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer</button>'; o.hidden = false;
  $('#mYes').onclick = () => { MM = null; home(); }; $('#mNo').onclick = () => { o.hidden = true; };
};

/* ---------- Ugo : jeu de plateformes (20 niveaux) ----------
   Ugo grimpe les échelles jusqu'au livre d'or, en haut à droite.
   Le nuage lance des pelotes qui roulent d'étage en étage : il faut sauter par-dessus.
   Un essai se termine si une pelote le touche ou si le temps est écoulé.
   L'enfant reprend toujours au dernier niveau atteint. */
const UW = 320, UH = 420, UPH = 22, UPW = 18, UNIV = 20;
let UG = null, uKeys = {};
function rnd(seed){ let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function ugoNiveau(n){
  const r = rnd(n * 7 + 3), etages = n <= 5 ? 4 : 5, gap = (UH - 70) / etages;
  const floors = []; for(let i=0;i<=etages;i++) floors.push(UH - 18 - i*gap);
  const ladders = [];
  for(let i=0;i<etages;i++){
    const nb = n <= 3 ? 2 : (r() < .5 ? 1 : 2);
    const cote = i % 2 === 0 ? 1 : -1; // les pelotes tombent du côté opposé à l'échelle principale
    const xs = [cote > 0 ? 40 + r()*90 : 190 + r()*90];
    if(nb === 2) xs.push(110 + r()*100);
    xs.forEach(x => ladders.push({x: Math.round(x), y1: floors[i], y2: floors[i+1]}));
  }
  const stars = []; for(let k=0;k<3;k++){ const f = 1 + Math.floor(r()*(etages-1)); stars.push({x: 30 + r()*260, y: floors[f] - 16, pris:false}); }
  return {n, etages, floors, ladders, stars, spawn: Math.max(1.25, 3.4 - n*0.11), vit: 48 + n*3.2, descente: n >= 8 ? Math.min(.45, (n-6)*0.04) : 0, temps: 60};
}
function ugoStart(essais){
  const p = P(); const niv = Math.min(UNIV, p.ugo || 1);
  UG = {essais, max:essais, niv, etoiles:0, actif:true}; show('ugo'); uSize(); ugoCharger(); requestAnimationFrame(uLoop);
}
function ugoCharger(){
  const L = ugoNiveau(UG.niv);
  Object.assign(UG, {L, x:20, y:L.floors[0]-UPH, vx:0, vy:0, sol:true, echelle:null, barils:[], t:0, prochain:1.2, tLeft:L.temps, prev:0, pause:false, fin:false, dir:1, sautes:new Set()});
  $('#uOver').hidden = true; uHud();
}
function uSize(){
  const w = Math.min(document.querySelector('.app').clientWidth - 8, 420), h = window.innerHeight - 300;
  const s = Math.max(0.7, Math.min(w/UW, h/UH)), c = $('#uBoard'), d = window.devicePixelRatio || 1;
  c.width = UW*s*d; c.height = UH*s*d; c.style.width = UW*s+'px'; c.style.height = UH*s+'px'; c.getContext('2d').setTransform(s*d,0,0,s*d,0,0);
}
function uHud(){ if(!UG) return; $('#uLives').innerHTML = '♥'.repeat(Math.max(0,UG.essais)) + `<span class="off">${'♥'.repeat(UG.max-Math.max(0,UG.essais))}</span>`; $('#uNiv').textContent = UG.niv; $('#uTemps').textContent = Math.ceil(Math.max(0,UG.tLeft)); $('#uEtoiles').textContent = UG.etoiles; }
function uEchelleProche(){ const L = UG.L, cx = UG.x + UPW/2, pied = UG.y + UPH; return L.ladders.find(l => Math.abs(cx - l.x) < 12 && pied <= l.y1 + 2 && pied >= l.y2 - 2); }
function uSolSous(y, x){ let best = null; for(const f of UG.L.floors){ if(f >= y - 1 && (best === null || f < best)) best = f; } return best; }
function uStep(dt){
  const L = UG.L;
  UG.t += dt; UG.tLeft -= dt; if(UG.tLeft <= 0) return uPerdu('Le temps est écoulé !');
  // joueur
  const g = uKeys;
  if(UG.echelle){
    const l = UG.echelle; UG.x = l.x - UPW/2;
    if(g.up) UG.y -= 70*dt; if(g.down) UG.y += 70*dt;
    if(UG.y + UPH <= l.y2){ UG.y = l.y2 - UPH; if(!g.up || g.left || g.right){ UG.echelle = null; UG.sol = true; } }
    if(UG.y + UPH >= l.y1){ UG.y = l.y1 - UPH; if(g.down || g.left || g.right){ UG.echelle = null; UG.sol = true; } }
    if((g.left || g.right) && Math.abs(UG.y + UPH - l.y1) > 3 && Math.abs(UG.y + UPH - l.y2) > 3){ /* rester sur l'échelle entre deux étages */ }
  } else {
    UG.vx = (g.left ? -90 : 0) + (g.right ? 90 : 0); if(UG.vx) UG.dir = Math.sign(UG.vx);
    if((g.up || g.down) && UG.sol){ const l = uEchelleProche(); if(l && ((g.up && Math.abs(UG.y+UPH-l.y1) < 4) || (g.down && Math.abs(UG.y+UPH-l.y2) < 4))){ UG.echelle = l; UG.vx = 0; } }
    if(!UG.echelle){
      if(g.jump && UG.sol){ UG.vy = -290; UG.sol = false; g.jump = false; }
      UG.vy += 900*dt; const avant = UG.y + UPH; UG.y += UG.vy*dt; UG.x = Math.max(0, Math.min(UW-UPW, UG.x + UG.vx*dt));
      const sol = uSolSous(avant - 1); if(sol !== null && UG.y + UPH >= sol && avant <= sol + 1 && UG.vy >= 0){ UG.y = sol - UPH; UG.vy = 0; UG.sol = true; } else if(UG.vy > 0) UG.sol = false;
    }
  }
  g.jump = false;
  // étoiles et livre
  L.stars.forEach(s => { if(!s.pris && Math.abs(UG.x+UPW/2 - s.x) < 14 && Math.abs(UG.y+UPH/2 - s.y) < 16){ s.pris = true; UG.etoiles++; uHud(); } });
  const top = L.floors[L.etages]; if(Math.abs(UG.y + UPH - top) < 3 && UG.x > UW - 50) return uGagne();
  // pelotes
  UG.prochain -= dt; if(UG.prochain <= 0){ UG.prochain = L.spawn * (0.8 + Math.random()*0.5); UG.barils.push({x:38, y:top - 7, f:L.etages, dir:1, vy:0, tombe:false, desc:null}); }
  for(const b of UG.barils){
    if(b.desc){ b.y += 80*dt; if(b.y + 7 >= b.desc.y1){ b.y = b.desc.y1 - 7; b.f--; b.desc = null; b.dir = Math.random() < .5 ? -1 : 1; } continue; }
    if(b.tombe){ b.vy += 700*dt; b.y += b.vy*dt; const f = L.floors[b.f]; if(b.y + 7 >= f){ b.y = f - 7; b.tombe = false; b.vy = 0; b.dir *= -1; } continue; }
    b.x += b.dir * L.vit * dt;
    if(L.descente && b.f > 0){ const l = L.ladders.find(l => l.y2 === L.floors[b.f] && Math.abs(l.x - b.x) < 3); if(l){ b.vu = b.vu || {}; const k = l.x + '-' + b.f; if(!b.vu[k]){ b.vu[k] = 1; if(Math.random() < L.descente){ b.desc = l; b.x = l.x; continue; } } } }
    if(b.x < 6 || b.x > UW - 6){ if(b.f === 0){ b.mort = true; continue; } b.f--; b.tombe = true; b.x = Math.max(6, Math.min(UW-6, b.x)); }
  }
  UG.barils = UG.barils.filter(b => !b.mort);
  for(const b of UG.barils){
    const dx = Math.abs(b.x - (UG.x + UPW/2)), dy = Math.abs(b.y - (UG.y + UPH/2));
    if(dx < 13 && dy < 15) return uPerdu('Aïe, une pelote !');
    if(dx < 10 && b.y > UG.y + UPH && b.y - (UG.y + UPH) < 30 && !UG.sautes.has(b)){ UG.sautes.add(b); }
  }
}
function uGagne(){
  UG.pause = true; const p = P();
  const suivant = Math.min(UNIV, UG.niv + 1); if(!p.ugo || suivant > p.ugo) p.ugo = suivant; p.ugoEt = (p.ugoEt||0) + UG.etoiles; save();
  const o = $('#uOver');
  if(UG.niv >= UNIV){ o.innerHTML = '<h3>Tu as fini les 20 niveaux !</h3><p>Ugo a retrouvé tous les livres d\'or. Bravo, champion !</p><button class="btn" id="uBtn">Retour à la salle</button>'; o.hidden = false; $('#uBtn').onclick = () => { UG = null; home(); }; return; }
  o.innerHTML = `<h3>Niveau ${UG.niv} réussi !</h3><p>Ugo a attrapé le livre d'or. Ta progression est enregistrée.</p><button class="btn" id="uBtn">Niveau ${suivant} →</button>`;
  o.hidden = false; $('#uBtn').onclick = () => { UG.niv = suivant; UG.etoiles = 0; ugoCharger(); };
}
function uPerdu(msg){
  UG.pause = true; UG.essais--; uHud(); const o = $('#uOver');
  if(UG.essais > 0){ o.innerHTML = `<h3>${msg}</h3><p>Il te reste ${UG.essais} essai${UG.essais>1?'s':''}. Tu reprends au niveau ${UG.niv}.</p><button class="btn" id="uBtn">Réessayer</button>`; o.hidden = false; $('#uBtn').onclick = () => { ugoCharger(); }; }
  else { UG.actif = false; o.innerHTML = `<h3>${msg}</h3><p>Plus d'essai pour aujourd'hui. La prochaine fois, tu reprendras au niveau <b>${P().ugo || UG.niv}</b>.</p><button class="btn" id="uBtn">Retour à la salle</button>`; o.hidden = false; $('#uBtn').onclick = () => { UG = null; home(); }; }
}
function uDraw(){
  const c = $('#uBoard').getContext('2d'), L = UG.L;
  const gr = c.createLinearGradient(0,0,0,UH); gr.addColorStop(0,'#141a4a'); gr.addColorStop(1,'#0b1030'); c.fillStyle = gr; c.fillRect(0,0,UW,UH);
  // échelles
  c.strokeStyle = '#5ee0f0'; c.lineWidth = 2.5;
  L.ladders.forEach(l => { c.beginPath(); c.moveTo(l.x-7,l.y1); c.lineTo(l.x-7,l.y2); c.moveTo(l.x+7,l.y1); c.lineTo(l.x+7,l.y2); for(let y=l.y1-6;y>l.y2;y-=9){ c.moveTo(l.x-7,y); c.lineTo(l.x+7,y); } c.stroke(); });
  // poutres
  L.floors.forEach((f,i) => { c.fillStyle = '#d9466f'; c.fillRect(0,f,UW,7); c.fillStyle = '#ff8fab'; for(let x=6;x<UW;x+=16) c.fillRect(x,f+2,3,3); });
  // étoiles
  c.font = '15px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  L.stars.forEach(s => { if(!s.pris){ c.fillStyle = '#ffd23f'; uEtoile(c, s.x, s.y, 7); } });
  // livre d'or
  const top = L.floors[L.etages]; c.fillStyle = '#ffd23f'; c.fillRect(UW-34, top-20, 22, 16); c.fillStyle = '#b8860b'; c.fillRect(UW-24, top-20, 2, 16);
  c.fillStyle = 'rgba(255,210,63,.25)'; c.beginPath(); c.arc(UW-23, top-12, 16 + Math.sin(UG.t*4)*2, 0, 7); c.fill();
  // nuage
  c.fillStyle = '#8c94c9'; [[18,top-22,12],[32,top-26,14],[46,top-21,11]].forEach(a => { c.beginPath(); c.arc(a[0],a[1],a[2],0,7); c.fill(); });
  c.fillStyle = '#1b1f4a'; c.fillRect(26,top-27,3,3); c.fillRect(36,top-27,3,3);
  // pelotes
  UG.barils.forEach(b => { c.fillStyle = '#ff9a3c'; c.beginPath(); c.arc(b.x, b.y, 7, 0, 7); c.fill(); c.strokeStyle = '#a94f0e'; c.lineWidth = 1.5; c.beginPath(); c.arc(b.x, b.y, 4, UG.t*6, UG.t*6+3); c.stroke(); });
  // Ugo
  uHibou(c, UG.x, UG.y, UG.dir, UG.echelle, UG.t);
}
function uEtoile(c, x, y, r){ c.beginPath(); for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i%2 ? r*.45 : r; c.lineTo(x + rr*Math.cos(a), y + rr*Math.sin(a)); } c.closePath(); c.fill(); }
function uHibou(c, x, y, dir, grimpe, t){
  const cx = x + UPW/2, cy = y + UPH/2 + 1;
  c.fillStyle = '#8a5a2b'; c.beginPath(); c.ellipse(cx, cy+1, 9, 11, 0, 0, 7); c.fill();
  c.fillStyle = '#c99a5b'; c.beginPath(); c.ellipse(cx, cy+4, 5.5, 6.5, 0, 0, 7); c.fill();
  c.fillStyle = '#8a5a2b'; c.beginPath(); c.moveTo(cx-8,cy-8); c.lineTo(cx-6,cy-15); c.lineTo(cx-3,cy-9); c.fill(); c.beginPath(); c.moveTo(cx+8,cy-8); c.lineTo(cx+6,cy-15); c.lineTo(cx+3,cy-9); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(cx-3.8, cy-4, 3.6, 0, 7); c.arc(cx+3.8, cy-4, 3.6, 0, 7); c.fill();
  c.fillStyle = '#111'; const o = grimpe ? 0 : dir*1.2; c.beginPath(); c.arc(cx-3.8+o, cy-4, 1.7, 0, 7); c.arc(cx+3.8+o, cy-4, 1.7, 0, 7); c.fill();
  c.fillStyle = '#ff9a3c'; c.beginPath(); c.moveTo(cx-2, cy-1); c.lineTo(cx+2, cy-1); c.lineTo(cx, cy+2.5); c.fill();
  const pas = Math.sin(t*14) * (uKeys.left || uKeys.right || grimpe ? 2 : 0);
  c.fillStyle = '#ff9a3c'; c.fillRect(cx-6, y+UPH-1+pas*.3, 4, 2); c.fillRect(cx+2, y+UPH-1-pas*.3, 4, 2);
}
function uLoop(t){
  if(!UG || !UG.actif) return;
  const dt = UG.prev ? Math.min((t - UG.prev)/1000, 0.05) : 0; UG.prev = t;
  if(!UG.pause){ uStep(dt); uHud(); }
  if(UG) uDraw();
  requestAnimationFrame(uLoop);
}
document.querySelector('.uctl').addEventListener('pointerdown', e => { const b = e.target.closest('button'); if(!b) return; e.preventDefault(); uKeys[b.dataset.u] = true; b.setPointerCapture && b.setPointerCapture(e.pointerId); });
['pointerup','pointercancel','lostpointercapture'].forEach(ev => document.querySelector('.uctl').addEventListener(ev, e => { const b = e.target.closest('button'); if(b && b.dataset.u !== 'jump') uKeys[b.dataset.u] = false; }));
document.addEventListener('keydown', e => { if($('#s-ugo').hidden || !UG) return; const m = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'jump'}; if(m[e.key]){ e.preventDefault(); uKeys[m[e.key]] = true; } });
document.addEventListener('keyup', e => { const m = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}; if(m[e.key]) uKeys[m[e.key]] = false; });
document.addEventListener('visibilitychange', () => { if(document.hidden && UG && UG.actif && !UG.pause){ UG.pause = true; const o = $('#uOver'); o.innerHTML = '<h3>Pause</h3><p>Ugo t\'attend.</p><button class="btn" id="uRes">Reprendre</button>'; o.hidden = false; $('#uRes').onclick = () => { UG.pause = false; UG.prev = 0; o.hidden = true; }; } });
$('#uQuit').onclick = () => {
  if(!UG || !UG.actif){ UG = null; return home(); }
  UG.pause = true; const o = $('#uOver'); o.innerHTML = '<h3>Arrêter ?</h3><p>Les essais restants seront perdus. Ton niveau reste enregistré.</p><button class="btn" id="uYes">Oui, arrêter</button><button class="btn" id="uNo" style="background:transparent;color:#fff;border:1px solid #fff">Continuer</button>'; o.hidden = false;
  $('#uYes').onclick = () => { UG.actif = false; UG = null; home(); }; $('#uNo').onclick = () => { UG.pause = false; UG.prev = 0; o.hidden = true; };
};

/* ---------- Écrans animés des bornes ---------- */
function demo(id, c, w, h, t){
  c.fillStyle = '#05081c'; c.fillRect(0,0,w,h);
  if(id === 'cascade'){
    const s = w/8, cols = ['#3fd0e8','#ffd23f','#b06bff','#4fd17a','#ff5a5f','#4f7dff','#ff9a3c'];
    for(let i=0;i<8;i++) for(let j=0;j<2;j++) if((i+j)%3) { c.fillStyle = cols[(i*3+j)%7]; c.fillRect(i*s+1, h-(j+1)*s+1, s-2, s-2); }
    const y = ((t*1.2) % 1) * (h - 2*s), x = 3*s; c.fillStyle = '#b06bff'; [[0,0],[1,0],[2,0],[1,1]].forEach(p => c.fillRect(x+p[0]*s+1, y+p[1]*s+1, s-2, s-2));
  } else if(id === 'serpent'){
    const s = w/12, n = 6, per = 2*(12-2)+2*(9-2); for(let k=0;k<n;k++){ const p = (Math.floor(t*8) - k + per*10) % per; let x, y; if(p < 10){ x = 1+p; y = 1; } else if(p < 17){ x = 11; y = 1+(p-10); } else if(p < 27){ x = 11-(p-17); y = 8; } else { x = 1; y = 8-(p-27); } c.fillStyle = k ? '#4fd17a' : '#8ff0b0'; c.fillRect(x*s, y*s*(h/w)*1.33, s-1, s-1); }
    c.fillStyle = '#ff4d5a'; c.beginPath(); c.arc(w*.5, h*.5, s*.45, 0, 7); c.fill();
  } else if(id === 'memory'){
    const cw = w/4.6, ch = h/2.6; for(let i=0;i<4;i++) for(let j=0;j<2;j++){ const x = w*.06 + i*(cw+w*.04), y = h*.12 + j*(ch+h*.1), ouvert = Math.floor(t*1.5 + i + j*2) % 5 === 0; c.fillStyle = ouvert ? '#fff' : '#3b4fd1'; c.fillRect(x, y, cw, ch); if(ouvert){ c.font = (ch*.6)+'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(MEMO_IMG[(i+j*4)%10], x+cw/2, y+ch/2+1); } }
  } else if(id === 'cartes'){
    c.fillStyle = '#1f7a4c'; c.fillRect(0,0,w,h); const cols = ['#e0383e','#f2b705','#27a046','#2563d9']; const k = Math.floor(t*1.3);
    for(let i=0;i<4;i++){ const a = (i-1.5)*0.25, cx = w/2 + (i-1.5)*w*.16; c.save(); c.translate(cx, h*.62); c.rotate(a); c.fillStyle = cols[(i+k)%4]; c.fillRect(-w*.09,-h*.28,w*.18,h*.5); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(0,-h*.03,w*.06,h*.14,-.4,0,7); c.fill(); c.restore(); }
  } else if(id === 'dames'){
    const s = w/8; for(let i=0;i<8;i++) for(let j=0;j<6;j++){ c.fillStyle = (i+j)%2 ? '#9b6a43' : '#ecd3ac'; c.fillRect(i*s, j*(h/6), s, h/6); }
    const ph = Math.floor(t) % 4; [[1,0],[3,0],[5,0],[7,0],[0,1],[2,1],[4,1],[6,1]].forEach(p => { c.fillStyle = '#262b45'; c.beginPath(); c.arc(p[0]*s+s/2, p[1]*(h/6)+h/12, s*.36, 0, 7); c.fill(); });
    [[0,5],[2,5],[4,5],[6,5],[1,4],[5,4],[7,4]].concat([[3 - (ph>1?1:0), 4 - (ph>1?1:0)]]).forEach(p => { c.fillStyle = '#efe6d6'; c.beginPath(); c.arc(p[0]*s+s/2, p[1]*(h/6)+h/12, s*.36, 0, 7); c.fill(); });
  } else if(id === 'ugo'){
    for(let i=0;i<3;i++){ c.fillStyle = '#d9466f'; c.fillRect(0, h*(0.92 - i*0.3), w, 4); }
    c.strokeStyle = '#5ee0f0'; c.lineWidth = 1.5; [[w*.7,0],[w*.3,1]].forEach(l => { const y1 = h*(0.92 - l[1]*0.3), y2 = y1 - h*.3; c.beginPath(); c.moveTo(l[0]-4,y1); c.lineTo(l[0]-4,y2); c.moveTo(l[0]+4,y1); c.lineTo(l[0]+4,y2); c.stroke(); });
    const bx = (t*40) % w; c.fillStyle = '#ff9a3c'; c.beginPath(); c.arc(w - bx, h*.62 - 4, 4, 0, 7); c.fill();
    const ux = w*.2 + Math.sin(t*1.5)*w*.12, saut = Math.max(0, Math.sin(t*4))*8;
    c.save(); c.translate(ux - 9*0.9, h*.92 - 22*0.9 - saut); c.scale(.9,.9); uHibou(c, 0, 0, 1, false, t); c.restore();
    c.fillStyle = '#ffd23f'; c.fillRect(w*.8, h*.32 - 12, 12, 9);
  }
}

window.JEUX = {cascade: gameStart, serpent: snakeStart, cartes: ccStart, dames: damesStart, memory: memoryStart, ugo: ugoStart, demo};

})();
