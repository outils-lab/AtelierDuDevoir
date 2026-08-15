/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Moteur de fiches (v2)
   Usage : définir window.FICHE puis inclure ce script.
   Types d'exercices : qcm · drag · classify · saisie · jugement · conjtable
   ═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

var F = window.FICHE;
if(!F){ console.error('FICHE non définie'); return; }

var score = 0, TOTAL = 0, phaseCourante = 0;
var etats = [];   // état par exercice

/* ── Utilitaires ── */
function esc(s){ var d=document.createElement('div'); d.textContent = s==null?'':s; return d.innerHTML; }
function shuffle(a){
  var r = a.slice();
  for(var i=r.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=r[i];r[i]=r[j];r[j]=t; }
  return r;
}
function ns(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s*([.,;:!?])\s*/g,'$1').replace(/\s+/g,' ').trim();
}
function el(id){ return document.getElementById(id); }

/* Comparaison stricte pour les mots accentués distinctifs (à/a, ou/où…) */
function memeReponse(saisi, attendu, strict){
  var s = (saisi||'').trim().toLowerCase(), a = (attendu||'').trim().toLowerCase();
  if(strict) return s === a;
  return ns(s) === ns(a);
}

function niveau(pct){
  if(pct>=90) return 'Brillant \u2B50';
  if(pct>=80) return 'Bien maîtrisé \u{1F4AA}';
  if(pct>=50) return 'En cours \u{1F4DA}';
  return 'À retravailler \u{1F501}';
}

/* ── Calcul du total ── */
F.exercices.forEach(function(ex){
  ex.pts = ex.pts || (ex.items ? ex.items.length : 0);
  TOTAL += ex.pts;
});


/* ═══ CLAVIER VIRTUEL (anti écriture intuitive sur mobile) ═══ */
var TACTILE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
var kbCible = null;

var KB_LETTRES = [
  ['a','z','e','r','t','y','u','i','o','p'],
  ['q','s','d','f','g','h','j','k','l','m'],
  ['w','x','c','v','b','n','é','è','à','ç']
];
var KB_CHIFFRES = [
  ['1','2','3','4','5'],
  ['6','7','8','9','0']
];

function clavierHTML(mode){
  var rows = (mode === 'chiffres') ? KB_CHIFFRES : KB_LETTRES;
  var h = '<div class="kb-info">Utilise ce clavier \u{1F447}</div>';
  rows.forEach(function(r){
    h += '<div class="kb-row">'
       + r.map(function(k){ return '<button type="button" class="kb-k" data-k="'+k+'">'+k+'</button>'; }).join('')
       + '</div>';
  });
  h += '<div class="kb-row">'
     + '<button type="button" class="kb-k wide" data-k=" ">espace</button>'
     + '<button type="button" class="kb-k wide" data-k="-">tiret</button>'
     + '<button type="button" class="kb-k wide del" data-k="__del">\u232B effacer</button>'
     + '</div>';
  return h;
}


function lireVal(e){ return e.tagName === 'INPUT' ? e.value : (e.dataset.val || ''); }
function ecrireVal(e, v){
  if(e.tagName === 'INPUT'){ e.value = v; }
  else { e.dataset.val = v; e.textContent = v || ''; e.classList.toggle('vide', !v); }
}
function estDesactive(e){ return e.disabled || e.dataset.off === '1'; }

function activerClavier(inp, kb){
  if(inp.dataset.fige === '1') return;
  if(kbCible) kbCible.classList.remove('kb-cible');
  kbCible = inp;
  inp.classList.add('kb-cible');
  kb.classList.add('on');
  setTimeout(function(){ kb.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 120);
}

/* Remplace l'input par un faux champ (div) : aucun clavier système possible */
function transformerEnFauxChamp(inp, kb){
  var d = document.createElement('div');
  d.className = 'faux-champ';
  d.id = inp.id;
  d.dataset.val = '';
  d.dataset.ph = inp.getAttribute('placeholder') || 'écris ici…';
  var mx = inp.getAttribute('maxlength');
  if(mx) d.dataset.max = mx;
  d.style.width = inp.style.width || '150px';
  d.textContent = d.dataset.ph;
  d.classList.add('vide');
  d.addEventListener('click', function(){ activerClavier(d, kb); });
  inp.parentNode.replaceChild(d, inp);
  return d;
}

function majFauxChamp(d){
  if(d.dataset.val === ''){ d.textContent = d.dataset.ph; d.classList.add('vide'); }
  else { d.textContent = d.dataset.val; d.classList.remove('vide'); }
}

function brancherClavier(inp, kb){
  inp.addEventListener('click', function(){
    if(estDesactive(inp)) return;
    activerClavier(inp, kb);
  });
  if(kb.dataset.pret === '1') return;
  kb.dataset.pret = '1';
  kb.addEventListener('click', function(ev){
    var b = ev.target.closest('.kb-k');
    if(!b || !kbCible || estDesactive(kbCible)) return;
    ev.preventDefault();
    var k = b.dataset.k, v = lireVal(kbCible);
    if(k === '__del') ecrireVal(kbCible, v.slice(0,-1));
    else {
      var max = kbCible.dataset.max;
      if(max && v.length >= parseInt(max,10)) return;
      ecrireVal(kbCible, v + k);
    }
  });
}


function champSaisie(i, ii, largeur, maxlen){
  var id = 'in'+i+'-'+ii;
  if(TACTILE){
    return '<div class="faux-input vide" id="'+id+'" '
         + (maxlen ? 'data-max="'+maxlen+'" ' : '')
         + 'data-val="" style="width:'+largeur+';"></div>';
  }
  return '<input type="text" id="'+id+'" placeholder="écris ici…" '
       + (maxlen ? 'maxlength="'+maxlen+'" data-max="'+maxlen+'" ' : '')
       + 'style="width:'+largeur+';" autocomplete="off" autocorrect="off" '
       + 'autocapitalize="off" spellcheck="false" data-lpignore="true">';
}

function monterClavier(ex, i){
  setTimeout(function(){
    var kb = el('kb'+i);
    if(!kb) return;
    ex.items.forEach(function(it,ii){
      var inp = el('in'+i+'-'+ii);
      if(inp) brancherClavier(inp, kb);
    });
  }, 0);
}


/* ═══ DICTÉE : synthèse vocale ═══ */
var voixFR = null;
function chargerVoix(){
  if(!window.speechSynthesis) return;
  var vs = speechSynthesis.getVoices();
  var pref = ['Thomas','Amélie','Aurélie','Julie'];
  for(var i=0;i<pref.length;i++){
    for(var j=0;j<vs.length;j++){
      if(vs[j].name.indexOf(pref[i]) !== -1){ voixFR = vs[j]; return; }
    }
  }
  for(var k=0;k<vs.length;k++){ if(vs[k].lang === 'fr-FR'){ voixFR = vs[k]; return; } }
  for(var m=0;m<vs.length;m++){ if(vs[m].lang.indexOf('fr') === 0){ voixFR = vs[m]; return; } }
}
if(window.speechSynthesis){
  chargerVoix();
  speechSynthesis.onvoiceschanged = chargerVoix;
}
function dire(texte, lent){
  if(!window.speechSynthesis) return;
  speechSynthesis.cancel();
  setTimeout(function(){
    var u = new SpeechSynthesisUtterance(texte);
    if(voixFR) u.voice = voixFR;
    u.lang = 'fr-FR';
    u.rate = lent ? 0.28 : 0.55;
    u.pitch = lent ? 0.95 : 1.05;
    speechSynthesis.speak(u);
  }, 80);
}
window.AFdire = dire;

/* ═══ CONSTRUCTION DE LA PAGE ═══ */
function construire(){
  var accent2 = F.accent2 || F.accent;
  var st = document.createElement('style');
  st.textContent = ':root{--accent:'+F.accent+';--accent-light:'+(F.accentLight||'#f8fafc')
                 + ';--accent-mid:'+(F.accentMid||'#e2e8f0')+';--accent2:'+accent2+';}';
  document.head.appendChild(st);
  if(F.niveau === 'CP') document.body.classList.add('cp');
  if(F.cycle === 4) document.body.classList.add('c4');

  var h = '';

  /* Header */
  h += '<header class="site-header"><a href="../'+esc(F.retour)+'">&#8592; '
     + esc(F.retourLabel || F.niveau) + '</a><span>L\'Atelier du Devoir</span></header>';

  /* Phase 0 : accroche + leçon */
  h += '<div id="phase0" class="phase active">';
  h += '<div class="accroche"><div class="accroche-inner"><span class="ugo-big">\u{1F989}</span>'
     + '<div class="accroche-text"><h1>'+F.titre+'</h1><p>'+F.ugoIntro+'</p></div></div>'
     + '<div class="meta-tags">'
     + '<span class="meta-tag">'+esc(F.niveau)+'</span>'
     + '<span class="meta-tag">'+esc(F.categorie||F.matiere)+'</span>'
     + '<span class="meta-tag">'+esc(F.duree||'15 min')+'</span>'
     + '<span class="meta-tag">'+TOTAL+' pts</span></div></div>';

  h += '<div class="lecon-wrap">';
  F.lecon.forEach(function(b,i){
    h += '<div id="bloc'+i+'" class="lecon-block'+(i===0?' revealed':'')+'">'
       + '<h2>'+b.titre+'</h2>'
       + (b.analogie ? '<div class="analogie">'+b.analogie+'</div>' : '')
       + b.html;
    if(b.ugo) h += '<div class="ugo-bubble"><span class="ugo-icon">\u{1F989}</span><span>Ugo : '+b.ugo+'</span></div>';
    var dernier = (i === F.lecon.length-1);
    if(b.questions && b.questions.length){
      h += '<div class="ctrl" id="ctrl'+i+'">'
         + '<div class="ctrl-titre">\u{1F50E} Vérifions que tu as bien lu</div>'
         + '<div class="ctrl-sous">La leçon reste juste au-dessus : tu peux la relire.</div>'
         + b.questions.map(function(q,qi){
             return '<div class="ctrl-q" id="cq'+i+'-'+qi+'">'
               + '<div class="ctrl-txt">'+q.q+'</div><div class="ctrl-opts">'
               + shuffle(q.options).map(function(o){
                   return '<button class="ctrl-btn" data-v="'+esc(o)+'" '
                        + 'onclick="AF.ctrl('+i+','+qi+',this)">'+o+'</button>';
                 }).join('')
               + '</div><div class="fb" id="cfb'+i+'-'+qi+'"></div></div>';
           }).join('')
         + '<div class="ctrl-bilan" id="cbil'+i+'"></div></div>';
      h += '<button class="btn-compris" id="btnbloc'+i+'" style="display:none;" onclick="'
         + (dernier?'AF.startEx()':'AF.revealBloc('+(i+1)+')')+'">'
         + (dernier
              ? (F.cycle === 4 ? '\u2713 Leçon comprise — Aux exercices' : 'Aux exercices ! \u{1F4AA}')
              : (F.cycle === 4 ? 'Bloc suivant \u2192' : 'J\'ai compris ! \u2192'))
         + '</button></div>';
    } else {
      h += '<button class="btn-compris" onclick="'+(dernier?'AF.startEx()':'AF.revealBloc('+(i+1)+')')+'">'
         + (dernier
              ? (F.cycle === 4 ? '\u2713 Leçon comprise — Aux exercices' : 'Aux exercices ! \u{1F4AA}')
              : (F.cycle === 4 ? 'Bloc suivant \u2192' : 'J\'ai compris ! \u2192'))
         + '</button></div>';
    }
  });
  h += '</div></div>';

  /* Phases exercices */
  F.exercices.forEach(function(ex,i){
    var n = i+1, dernier = (i === F.exercices.length-1);
    h += '<div id="phase'+n+'" class="phase"><div class="ex-wrap">'
       + '<div class="ex-header"><h2>Exercice '+n+' — '+esc(ex.titre)+'</h2>'
       + '<p>'+esc(ex.consigne)+'</p></div>'
       + '<div class="score-bar">Score : <span id="sc'+i+'">0</span> / '+ex.pts+' pts</div>'
       + '<div id="ex'+i+'"></div>';
    if(ex.type==='drag'||ex.type==='classify'||ex.type==='saisie'||ex.type==='conjtable'||ex.type==='dictee')
      h += '<button class="btn-verif" id="verif'+i+'" onclick="AF.verifier('+i+')">Vérifier \u2713</button>';
    h += '<button class="btn-suite" id="next'+i+'" onclick="'
       + (dernier ? 'AF.bilan()' : 'AF.goPhase('+(n+1)+')') + '">'
       + (dernier ? 'Voir mon bilan \u{1F3C6}' : 'Exercice suivant \u2192') + '</button>'
       + '</div></div>';
  });

  /* Bilan */
  h += '<div id="phase'+(F.exercices.length+1)+'" class="phase"><div class="bilan-wrap"><div class="bilan-card">'
     + '<div style="font-size:2.2rem;">\u{1F3C6}</div>'
     + '<div class="stars"><span class="star" id="star1">\u2B50</span>'
     + '<span class="star" id="star2">\u2B50</span><span class="star" id="star3">\u2B50</span></div>'
     + '<div class="score-big" id="bscore">0 / '+TOTAL+'</div>'
     + '<div class="bilan-msg" id="bmsg"></div>'
     + '<div class="memo"><h3>\u{1F4D6} À retenir</h3><p>'+F.memo+'</p></div>'
     + '<button class="btn-retry" onclick="location.reload()">\u{1F504} Recommencer</button>'
     + '</div></div></div>';

  h += '<div class="print-bar"><button class="print-btn" onclick="AF.printLecon()">\u{1F4D6} Leçon</button>'
     + '<button class="print-btn" onclick="AF.printEx()">\u{1F4DD} Exercices</button></div>';

  document.body.innerHTML = h;
  F.exercices.forEach(function(ex,i){ rendre(ex,i); });
}

/* ═══ RENDU DES EXERCICES ═══ */
function rendre(ex, i){
  var c = el('ex'+i);
  etats[i] = {faits:0, verifie:false, pts:0, sel:null, place:{}};

  if(ex.type === 'qcm'){
    c.innerHTML = ex.items.map(function(q,qi){
      var opts = shuffle(q.options);
      var large = opts.some(function(o){ return o.length > 18; });
      return '<div class="qcm-card" id="q'+i+'-'+qi+'">'
        + '<div class="question'+(q.phrase?' phrase-ex':'')+'">'+(q.phrase||q.q)+'</div>'
        + (q.phrase && q.q ? '<div class="question">'+q.q+'</div>' : '')
        + '<div class="qcm-options'+(large?' col1':'')+'">'
        + opts.map(function(o){
            return '<button class="qcm-btn" data-v="'+esc(o)+'" onclick="AF.qcm('+i+','+qi+',this)">'+o+'</button>';
          }).join('')
        + '</div><div class="fb" id="fb'+i+'-'+qi+'"></div></div>';
    }).join('');
  }

  else if(ex.type === 'drag'){
    var pool = ex.pool ? shuffle(ex.pool) : shuffle(ex.items.map(function(x){return x.rep;}));
    c.innerHTML = '<div class="pool" id="pool'+i+'">'
      + pool.map(function(w,wi){
          return '<button class="chip" data-w="'+esc(w)+'" onclick="AF.pick('+i+',this)">'+esc(w)+'</button>';
        }).join('') + '</div><div class="drag-list">'
      + ex.items.map(function(it,ii){
          return '<div class="drag-item">'
            + (it.avant ? '<span class="txt">'+it.avant+'</span>' : '')
            + '<span class="drop-zone" id="dz'+i+'-'+ii+'" onclick="AF.drop('+i+','+ii+')">…</span>'
            + (it.apres ? '<span class="txt">'+it.apres+'</span>' : '')
            + '<div class="expl" id="ex'+i+'-'+ii+'"></div></div>';
        }).join('') + '</div>';
  }

  else if(ex.type === 'classify'){
    c.innerHTML = '<div class="cls-wrap">'
      + ex.cols.map(function(col){
          return '<div class="cls-col" style="border-color:'+col.couleur+';background:'+col.fond+';" '
            + 'onclick="AF.place('+i+',\''+col.id+'\')">'
            + '<h4 style="color:'+col.couleur+';">'+col.nom+'</h4>'
            + '<div class="cls-zone" id="col'+i+'-'+col.id+'"></div></div>';
        }).join('') + '</div>'
      + '<div class="cls-pool" id="pool'+i+'">'
      + shuffle(ex.items).map(function(it,ii){
          return '<button class="chip" data-cat="'+esc(it.cat)+'" data-i="'+ii+'" onclick="AF.pick('+i+',this)">'
               + esc(it.mot)+'</button>';
        }).join('') + '</div><div class="fb" id="fbg'+i+'"></div>';
  }

  else if(ex.type === 'saisie'){
    c.innerHTML = ex.items.map(function(it,ii){
      return '<div class="saisie-item"><div class="phrase">'+it.phrase+'</div>'
        + champSaisie(i, ii, (ex.large?'100%':'150px'), ex.maxlen)
        + '<div class="expl" id="ex'+i+'-'+ii+'"></div></div>';
    }).join('') + (TACTILE ? '<div class="kb" id="kb'+i+'">'+clavierHTML(ex.clavier||'lettres')+'</div>' : '');
    if(TACTILE) monterClavier(ex, i);
  }

  else if(ex.type === 'jugement'){
    c.innerHTML = ex.items.map(function(it,ii){
      var opts = shuffle([{t:it.bonne,ok:true},{t:it.mauvaise,ok:false}]);
      return '<div class="jug-card" id="j'+i+'-'+ii+'"><div class="question">'+it.consigne+'</div>'
        + opts.map(function(o){
            return '<div class="jug-opt" data-ok="'+(o.ok?'1':'0')+'" onclick="AF.jug('+i+','+ii+',this)">'
                 + o.t+'</div>';
          }).join('')
        + '<div class="fb" id="fb'+i+'-'+ii+'"></div></div>';
    }).join('');
  }

  else if(ex.type === 'dictee'){
    c.innerHTML = ex.items.map(function(it,ii){
      return '<div class="saisie-item dictee-item">'
        + '<div class="dictee-head"><span class="dictee-num">' + (ii+1) + '</span>'
        + '<button type="button" class="btn-ecoute" onclick="AF.ecouter(' + i + ',' + ii + ',false)">'
        + '\u{1F50A} Écouter</button>'
        + '<button type="button" class="btn-ecoute lent" onclick="AF.ecouter(' + i + ',' + ii + ',true)">'
        + '\u{1F422} Lentement</button></div>'
        + champSaisie(i, ii, '100%', null)
        + '<div class="expl" id="ex'+i+'-'+ii+'"></div></div>';
    }).join('') + (TACTILE ? '<div class="kb" id="kb'+i+'">'+clavierHTML('lettres')+'</div>' : '');
    if(TACTILE) monterClavier(ex, i);
  }

  else if(ex.type === 'conjtable'){
    c.innerHTML = ex.items.map(function(it,ii){
      return '<div class="saisie-item"><div class="phrase"><strong>'+esc(it.pronom)+'</strong></div>'
        + champSaisie(i, ii, '200px', null)
        + '<div class="expl" id="ex'+i+'-'+ii+'"></div></div>';
    }).join('') + (TACTILE ? '<div class="kb" id="kb'+i+'">'+clavierHTML('lettres')+'</div>' : '');
    if(TACTILE) monterClavier(ex, i);
  }
}

/* ═══ INTERACTIONS ═══ */
var AF = {};

AF.revealBloc = function(n){
  var b = el('bloc'+n); if(b) b.classList.add('revealed');
  var p = el('bloc'+(n-1));
  if(p){ var btn = p.querySelector('.btn-compris'); if(btn) btn.style.display='none'; }
  setTimeout(function(){ b.scrollIntoView({behavior:'smooth',block:'start'}); },150);
};

AF.goPhase = function(n){
  document.querySelectorAll('.phase').forEach(function(p){ p.classList.remove('active'); });
  var ph = el('phase'+n); ph.classList.add('active');
  phaseCourante = n;
  setTimeout(function(){ ph.scrollIntoView({behavior:'smooth',block:'start'}); },150);
};

AF.startEx = function(){ AF.goPhase(1); };


/* ═══ Questions de contrôle de lecture ═══ */
var ctrlEtat = {};

AF.ctrl = function(bi, qi, btn){
  var card = el('cq'+bi+'-'+qi);
  if(card.dataset.done) return;
  card.dataset.done = '1';
  var q = F.lecon[bi].questions[qi];
  card.querySelectorAll('.ctrl-btn').forEach(function(b){
    b.disabled = true;
    if(b.dataset.v === q.bonne) b.classList.add('correct');
  });
  var bon = (btn.dataset.v === q.bonne);
  if(!bon) btn.classList.add('wrong');
  var fb = el('cfb'+bi+'-'+qi);
  fb.innerHTML = (bon ? '\u2705 ' : '\u274C ') + (q.expl || '');
  fb.className = 'fb show ' + (bon ? 'ok' : 'ko');

  if(!ctrlEtat[bi]) ctrlEtat[bi] = {ok:0, ko:0, total:F.lecon[bi].questions.length};
  ctrlEtat[bi][bon ? 'ok' : 'ko']++;

  var e = ctrlEtat[bi];
  if(e.ok + e.ko === e.total){
    var bil = el('cbil'+bi);
    if(e.ko === 0){
      bil.innerHTML = '\u{1F389} <strong>Parfait !</strong> Tu as bien lu la leçon.';
      bil.className = 'ctrl-bilan ok show';
      el('btnbloc'+bi).style.display = 'block';
    } else {
      var cible = (bi === 0) ? 0 : bi - 1;
      var txt = (bi === 0)
        ? 'Relis ce bloc attentivement, puis réessaie.'
        : 'Relis le bloc précédent, puis reviens ici.';
      bil.innerHTML = '\u{1F4D6} <strong>' + e.ko + ' réponse' + (e.ko>1?'s':'')
        + ' à revoir.</strong><br>' + txt
        + '<br><button class="ctrl-retry" onclick="AF.reprendre('+bi+','+cible+')">'
        + '\u21BA Relire et réessayer</button>';
      bil.className = 'ctrl-bilan ko show';
    }
  }
};

AF.reprendre = function(bi, cible){
  // Réinitialiser les questions du bloc ET remélanger les options
  // (sinon l'enfant retient juste la position du bouton vert précédent)
  ctrlEtat[bi] = null;
  var b = F.lecon[bi];
  b.questions.forEach(function(q,qi){
    var card = el('cq'+bi+'-'+qi);
    card.dataset.done = '';
    var opts = card.querySelector('.ctrl-opts');
    opts.innerHTML = shuffle(q.options).map(function(o){
      return '<button class="ctrl-btn" data-v="'+esc(o)+'" '
           + 'onclick="AF.ctrl('+bi+','+qi+',this)">'+o+'</button>';
    }).join('');
    el('cfb'+bi+'-'+qi).className = 'fb';
  });
  el('cbil'+bi).className = 'ctrl-bilan';
  // Remonter au bloc demandé
  var d = el('bloc'+cible);
  if(d) setTimeout(function(){ d.scrollIntoView({behavior:'smooth',block:'start'}); }, 150);
};

AF.qcm = function(i, qi, btn){
  var card = el('q'+i+'-'+qi);
  if(card.dataset.done) return;
  card.dataset.done = '1';
  var ex = F.exercices[i], q = ex.items[qi];
  card.querySelectorAll('.qcm-btn').forEach(function(b){
    b.disabled = true;
    if(b.dataset.v === q.bonne) b.classList.add('correct');
  });
  var fb = el('fb'+i+'-'+qi), bon = (btn.dataset.v === q.bonne);
  if(bon){ score++; etats[i].pts++; el('sc'+i).textContent = etats[i].pts; }
  else btn.classList.add('wrong');
  fb.innerHTML = (bon?'\u2705 ':'\u274C ') + q.expl;
  fb.className = 'fb show ' + (bon?'ok':'ko');
  etats[i].faits++;
  if(etats[i].faits === ex.items.length)
    setTimeout(function(){ el('next'+i).classList.add('show'); },400);
};

AF.jug = function(i, ii, div){
  var card = el('j'+i+'-'+ii);
  if(card.dataset.done) return;
  card.dataset.done = '1';
  var ex = F.exercices[i], it = ex.items[ii];
  card.querySelectorAll('.jug-opt').forEach(function(o){
    o.style.pointerEvents = 'none';
    if(o.dataset.ok === '1') o.classList.add('correct');
  });
  var bon = (div.dataset.ok === '1');
  if(bon){ score++; etats[i].pts++; el('sc'+i).textContent = etats[i].pts; }
  else div.classList.add('wrong');
  var fb = el('fb'+i+'-'+ii);
  fb.innerHTML = (bon?'\u2705 ':'\u274C ') + it.expl;
  fb.className = 'fb show ' + (bon?'ok':'ko');
  etats[i].faits++;
  if(etats[i].faits === ex.items.length)
    setTimeout(function(){ el('next'+i).classList.add('show'); },400);
};

AF.pick = function(i, chip){
  if(etats[i].verifie) return;
  el('pool'+i).querySelectorAll('.chip').forEach(function(c){ c.classList.remove('selected'); });
  chip.classList.add('selected');
  etats[i].sel = chip;
};

AF.drop = function(i, ii){
  var s = etats[i].sel;
  if(!s || etats[i].verifie) return;
  var dz = el('dz'+i+'-'+ii);
  var anc = etats[i].place[ii];
  if(anc) anc.classList.remove('used');
  dz.textContent = s.dataset.w;
  dz.classList.add('filled');
  etats[i].place[ii] = s;
  s.classList.add('used'); s.classList.remove('selected');
  etats[i].sel = null;
};

AF.place = function(i, colId){
  var s = etats[i].sel;
  if(!s || etats[i].verifie) return;
  var idx = s.dataset.i;
  var old = el('tag'+i+'-'+idx);
  if(old) old.remove();
  var tag = document.createElement('div');
  tag.className = 'cls-tag'; tag.id = 'tag'+i+'-'+idx;
  tag.textContent = s.textContent;
  el('col'+i+'-'+colId).appendChild(tag);
  etats[i].place[idx] = {col:colId, cat:s.dataset.cat};
  s.classList.add('used'); s.classList.remove('selected');
  etats[i].sel = null;
};


AF.ecouter = function(i, ii, lent){
  var ex = F.exercices[i];
  var t = ex.items[ii].lu || ex.items[ii].rep;
  dire(t, lent);
};

AF.verifier = function(i){
  if(etats[i].verifie) return;
  etats[i].verifie = true;
  var ex = F.exercices[i], pts = 0;

  if(ex.type === 'drag'){
    ex.items.forEach(function(it,ii){
      var dz = el('dz'+i+'-'+ii), ee = el('ex'+i+'-'+ii);
      var mis = etats[i].place[ii] ? etats[i].place[ii].dataset.w : '';
      var bon = (mis === it.rep);
      if(bon){ pts++; dz.classList.add('ok'); }
      else dz.classList.add('ko');
      ee.innerHTML = (bon?'\u2705 ':'\u274C Réponse : '+esc(it.rep)+'. ') + it.expl;
      ee.className = 'expl show ' + (bon?'ok':'ko');
    });
  }

  else if(ex.type === 'classify'){
    var justes = 0;
    Object.keys(etats[i].place).forEach(function(k){
      var p = etats[i].place[k], tag = el('tag'+i+'-'+k);
      if(p.col === p.cat){
        justes++;
        if(tag){ tag.style.background='var(--vert-bg)'; tag.style.borderColor='var(--vert)';
                 tag.style.color='var(--vert-txt)'; }
      } else if(tag){
        tag.style.background='var(--rouge-bg)'; tag.style.borderColor='var(--rouge)';
        tag.style.color='var(--rouge)';
      }
    });
    pts = Math.round(justes / ex.items.length * ex.pts);
    var fbg = el('fbg'+i);
    fbg.innerHTML = (justes===ex.items.length ? '\u2705 Parfait ! Tout est bien rangé !'
                    : '\u274C '+justes+' mots sur '+ex.items.length+' bien placés.');
    fbg.className = 'fb show ' + (justes===ex.items.length?'ok':'ko');
  }

  else if(ex.type === 'saisie' || ex.type === 'conjtable' || ex.type === 'dictee'){
    ex.items.forEach(function(it,ii){
      var inp = el('in'+i+'-'+ii), ee = el('ex'+i+'-'+ii);
      if(inp.tagName === 'INPUT') inp.disabled = true; else inp.dataset.off = '1';
      var attendus = Array.isArray(it.rep) ? it.rep : [it.rep];
      var saisi = lireVal(inp);
      var bon = attendus.some(function(a){ return memeReponse(saisi, a, ex.strict); });
      if(bon){ pts++; inp.classList.add('ok'); }
      else inp.classList.add('ko');
      ee.innerHTML = (bon?'\u2705 ':'\u274C Réponse : '+esc(attendus[0])+'. ') + (it.expl||'');
      ee.className = 'expl show ' + (bon?'ok':'ko');
    });
  }

  score += pts; etats[i].pts = pts;
  el('sc'+i).textContent = pts;
  el('verif'+i).disabled = true;
  setTimeout(function(){ el('next'+i).classList.add('show'); },400);
};

AF.bilan = function(){
  AF.goPhase(F.exercices.length+1);
  el('bscore').textContent = score+' / '+TOTAL;
  var pct = TOTAL>0 ? score/TOTAL*100 : 0;
  var msgs = {
    'Brillant \u2B50':'Brillant \u2B50 '+(F.msgBrillant||'Tu maîtrises parfaitement !'),
    'Bien maîtrisé \u{1F4AA}':'Bien maîtrisé \u{1F4AA} Excellent travail !',
    'En cours \u{1F4DA}':'En cours \u{1F4DA} Continue, tu progresses !',
    'À retravailler \u{1F501}':'À retravailler \u{1F501} Relis la leçon et réessaie !'
  };
  el('bmsg').textContent = msgs[niveau(pct)];

  var seuils = [Math.ceil(TOTAL*0.33), Math.ceil(TOTAL*0.66), Math.ceil(TOTAL*0.89)];
  ['star1','star2','star3'].forEach(function(id,k){
    var e = el(id);
    if(score >= seuils[k]){
      (function(elem,d){ setTimeout(function(){
        elem.classList.add('earned'); elem.style.animation='starPop .4s ease'; }, d); })(e, 300+k*400);
    }
  });

  if(score >= Math.ceil(TOTAL*0.5)) confettis();
  if(typeof enregistrerProgression === 'function')
    enregistrerProgression(F.code, score, TOTAL);
};

function confettis(){
  var cols = [F.accent, '#fbbf24', '#16a34a', '#db2777', '#8b5cf6'];
  for(var k=0;k<40;k++){
    (function(d,c,l){
      setTimeout(function(){
        var e = document.createElement('div');
        e.style.cssText = 'position:fixed;top:-10px;left:'+l+'%;width:8px;height:8px;background:'
          + c + ';border-radius:50%;pointer-events:none;z-index:9999;animation:fall '
          + (1.2+Math.random()) + 's ease-in forwards;';
        document.body.appendChild(e);
        setTimeout(function(){ e.remove(); }, 2200);
      }, d);
    })(k*60, cols[k%cols.length], Math.random()*100);
  }
}

/* ── Impression ── */
AF.printLecon = function(){
  var w = window.open('','_blank');
  var css = 'body{font-family:sans-serif;padding:22px;font-size:13px;line-height:1.6;}'
          + 'h1,h2{color:'+F.accent+';} .exemple,.astuce{background:#f6f8fa;padding:8px 12px;'
          + 'border-radius:6px;margin:6px 0;} table{border-collapse:collapse;margin:8px 0;}'
          + 'th,td{border:1px solid #ddd;padding:5px 9px;}';
  w.document.write('<html><head><title>Leçon '+F.code+'</title><style>'+css+'</style></head><body>');
  w.document.write('<h1>'+F.titre+' — '+F.niveau+'</h1>');
  F.lecon.forEach(function(b){ w.document.write('<h2>'+b.titre+'</h2>'+b.html); });
  w.document.write('<h2>À retenir</h2><p>'+F.memo+'</p></body></html>');
  w.document.close(); w.print();
};

AF.printEx = function(){
  var w = window.open('','_blank');
  var css = 'body{font-family:sans-serif;padding:22px;font-size:13px;line-height:1.7;}'
          + 'h1,h2{color:'+F.accent+';} .it{margin:9px 0;}'
          + '.bl{display:inline-block;width:80px;border-bottom:2px solid #333;margin:0 4px;}';
  w.document.write('<html><head><title>Exercices '+F.code+'</title><style>'+css+'</style></head><body>');
  w.document.write('<h1>Exercices — '+F.titre+'</h1>');
  F.exercices.forEach(function(ex,i){
    w.document.write('<h2>Ex '+(i+1)+' — '+ex.titre+'</h2>');
    (ex.items||[]).forEach(function(it,ii){
      var t = it.phrase || it.q || it.consigne || ((it.avant||'') + ' ____ ' + (it.apres||'')) || it.mot || it.pronom || '';
      var o = it.options ? ' &nbsp; [ ' + it.options.join(' / ') + ' ]' : '';
      w.document.write('<div class="it">'+(ii+1)+'. '+String(t).replace(/<[^>]+>/g,'')+o+'</div>');
    });
  });
  w.document.write('</body></html>');
  w.document.close(); w.print();
};

window.AF = AF;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', construire);
else construire();
})();
