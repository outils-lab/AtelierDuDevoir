/* ═══════════════════════════════════════════════════════════
   Salle d'arcade — le cœur
   • Avec un compte : la classe vient du profil de l'enfant, la progression est
     enregistrée dans Supabase (table arcade_profils).
   • Sans compte : partie découverte, on choisit sa classe, rien n'est gardé.
   • Séries de 10 questions adaptées : révisions espacées, erreurs des fiches,
     notions des fiches existantes seulement (de la classe et des classes d'avant).
   • 7 ou 8 bonnes réponses = 1 vie, 9 ou 10 = 2 vies. Réponses trop rapides : ne comptent pas.
   • 3 séries récompensées par jour (réglable dans l'espace parent).
   ═══════════════════════════════════════════════════════════ */
(function(){
'use strict';
var $ = function(s){ return document.querySelector(s); };
var SB_URL = "https://rwqsvrmjjoihuhmvbwuu.supabase.co";
var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXN2cm1qam9paHVobXZid3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjQxNTMsImV4cCI6MjA5OTk0MDE1M30.VtdOnI169-erf48NpxLPCC0th6kHqBcsBuCauOx52HI";
var CLE_ACTIF = 'atelier_enfant_actif';
var CLASSES = ARC.CLASSES, INT = [1,2,4,7,14,30];
var JEUX_LISTE = [
  {id:'cascade', nom:'Cascade', seuil:0, c1:'#3b82f6', c2:'#1e3a8a', unite:'vie'},
  {id:'serpent', nom:'Serpent', seuil:0, c1:'#10b981', c2:'#065f46', unite:'vie'},
  {id:'memory', nom:'Memory', seuil:0, c1:'#8b5cf6', c2:'#4c1d95', unite:'grille'},
  {id:'cartes', nom:'Quatre Couleurs', seuil:5, c1:'#ef4444', c2:'#7f1d1d', unite:'partie'},
  {id:'dames', nom:'Dames', seuil:10, c1:'#c2763a', c2:'#5b3519', unite:'partie'},
  {id:'ugo', nom:'Ugo', seuil:15, c1:'#f59e0b', c2:'#92400e', unite:'essai'}
];
var sb = null;
var S = {mode:'decouverte', enfant:null, K:4, cap:3, fichesOk:0, scores:{}, tableOk:false, vies:0, catalogue:{}};
var D = nouveau();
var SE = null;

function nouveau(){ return {v:1, notions:{}, items:{}, imp:{}, jour:{d:'', r:0}, log:[], j:{}, deb:[]}; }
function jourStr(){ var d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function jourNum(){ var d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset()*60000) / 864e5); }
function idx(c){ var i = CLASSES.indexOf(String(c||'').split('/')[0]); return i < 0 ? 4 : i; }
function esc(s){ var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
function strip(h){ var d = document.createElement('div'); d.innerHTML = h; return (d.textContent || '').replace(/\s+/g,' ').trim(); }
function sansBulles(h){ return String(h||'').replace(/\[\[([a-z]+)(?:\|([^\]]+))?\]\]/g, function(_, k, m){ return m || (ARC.GLO[k] ? ARC.GLO[k].mot : k); }); }
function notionDe(code){ for(var i=0;i<ARC.NOTIONS.length;i++) if(ARC.NOTIONS[i].code === code) return ARC.NOTIONS[i]; return null; }

/* ═══ Écrans ═══ */
function show(id){
  document.querySelectorAll('.screen').forEach(function(s){ s.hidden = s.id !== 's-'+id; });
  var sec = $('#s-'+id); document.body.classList.toggle('mode-nuit', !!(sec && sec.classList.contains('nuit')));
  window.scrollTo(0,0); animerBornes();
}
window.ARCADE = {
  show: show,
  stats: function(){ return D.j; },
  sauver: sauver,
  retour: function(){ accueil(); },
  classeIdx: function(){ return S.K; },
  etat: function(){ return {SE:SE, D:D, S:S}; }
};

/* ═══ Démarrage ═══ */
async function boot(){
  try{ sb = supabase.createClient(SB_URL, SB_KEY); }catch(e){ sb = null; }
  fetch('fiches.json').then(function(r){ return r.json(); }).then(function(d){
    Object.keys(d).forEach(function(cy){ (d[cy]||[]).forEach(function(f){ if(f && f.code) S.catalogue[f.code] = f; }); });
  }).catch(function(){});
  var session = null;
  try{ if(sb){ var s = await sb.auth.getSession(); session = s.data.session; } }catch(e){}
  if(!session) return decouverte();
  var id = null; try{ id = localStorage.getItem(CLE_ACTIF); }catch(e){}
  if(!id){ location.href = 'ma-famille.html'; return; }
  var re = await sb.from('enfants').select('id,prenom,classe').eq('id', id).single();
  if(re.error || !re.data){ try{ localStorage.removeItem(CLE_ACTIF); }catch(e){} location.href = 'ma-famille.html'; return; }
  S.mode = 'compte'; S.enfant = re.data; S.K = idx(re.data.classe);
  var local = null; try{ local = JSON.parse(localStorage.getItem('arcade_'+id) || 'null'); }catch(e){}
  var rp = await sb.from('arcade_profils').select('donnees,series_max_jour').eq('enfant_id', id).maybeSingle();
  if(rp.error){ S.tableOk = false; console.log('Salle d\'arcade : table arcade_profils absente, progression gardée sur cet appareil.', rp.error.message); D = Object.assign(nouveau(), local || {}); }
  else { S.tableOk = true; D = Object.assign(nouveau(), (rp.data && rp.data.donnees) || local || {}); if(rp.data && rp.data.series_max_jour != null) S.cap = rp.data.series_max_jour; }
  var pr = await sb.from('progression').select('*').eq('enfant_id', id).order('fait_le', {ascending:false});
  var lignes = pr.error ? [] : (pr.data || []);
  lignes.forEach(function(l){
    var pct = l.total > 0 ? l.score / l.total : 0;
    if(S.scores[l.fiche_code] == null || pct > S.scores[l.fiche_code]) S.scores[l.fiche_code] = pct;
  });
  S.dernier = {}; lignes.forEach(function(l){ if(S.dernier[l.fiche_code] == null) S.dernier[l.fiche_code] = l.total > 0 ? l.score/l.total : 0; });
  S.fichesOk = Object.keys(S.scores).filter(function(c){ return S.scores[c] >= 0.8; }).length;
  importerErreurs(lignes);
  $('#qui').innerHTML = '👤 '+esc(S.enfant.prenom)+' · '+esc(S.enfant.classe); $('#qui').hidden = false;
  accueil();
}
function decouverte(){
  S.mode = 'decouverte'; D = nouveau();
  $('#classes').innerHTML = CLASSES.map(function(c,i){ var col = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#F59E0B','#3B82F6','#EF4444','#10B981','#EF4444'][i]; return '<button class="cl-btn" data-k="'+i+'" style="color:'+col+';border-color:'+col+'">'+c+'</button>'; }).join('');
  show('classe');
}
$('#classes').addEventListener('click', function(e){
  var b = e.target.closest('.cl-btn'); if(!b) return; S.K = +b.dataset.k;
  $('#qui').innerHTML = 'Découverte · '+CLASSES[S.K]+' <a href="#" id="chgClasse">changer</a>'; $('#qui').hidden = false;
  accueil();
});
document.addEventListener('click', function(e){ if(e.target && e.target.id === 'chgClasse'){ e.preventDefault(); decouverte(); } });

/* Erreurs enregistrées par les fiches → questions à revoir */
function matiereDe(code){
  var n = notionDe(code); if(n) return n.matiere;
  if(/^D[MC]/.test(code)) return 'dictee';
  var f = S.catalogue[code]; if(f) return f.matiere === 'Mathématiques' ? 'maths' : f.matiere === 'Français' ? 'fr' : null;
  return /^M/.test(code) ? 'maths' : /^[GCOL]/.test(code) ? 'fr' : null;
}
function hash(s){ var h = 0; s = String(s); for(var i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
function convertir(e, code){
  if(!e || !e.b) return null;
  var b = Array.isArray(e.b) ? e.b : [e.b], q = String(e.q || '').replace(/_{3,}|…/g, '<span class="blank">?</span>'), ex = e.e || '';
  if(e.t === 'qcm' && e.o && e.o.length > 1) return ARC.choice(q, b[0], e.o, ex, '');
  if(e.t === 'jug' && e.m) return ARC.choice(q || 'Quelle phrase est juste ?', b[0], [b[0], e.m], ex, '');
  if(e.t === 'dictee') return {t:'dict', a:b[0], acc:b, speak:e.l || b[0], e:ex};
  if(e.t === 'saisie' || e.t === 'drag' || e.t === 'conj') return ARC.text(q, b[0], ex, '', {acc:b, o:e.o && e.o.indexOf(b[0]) >= 0 ? e.o.slice(0,4) : null});
  return null;
}
function importerErreurs(lignes){
  var limite = Date.now() - 90*864e5, n = 0;
  lignes.forEach(function(l){
    if(!l.erreurs || !Array.isArray(l.erreurs)) return;
    var cle = l.id || (l.fiche_code + l.fait_le);
    if(D.imp[cle] || new Date(l.fait_le).getTime() < limite) return;
    D.imp[cle] = 1;
    var m = matiereDe(l.fiche_code); if(!m) return;
    l.erreurs.slice(0, 12).forEach(function(e){
      var it = convertir(e, l.fiche_code); if(!it) return;
      var k = 'F-'+l.fiche_code+'-'+hash((e.q||'')+(Array.isArray(e.b)?e.b[0]:e.b));
      D.items[k] = {it:it, b:0, due:jourNum(), n:l.fiche_code, m:m, src:'f'}; n++;
    });
  });
  if(n) sauver();
}

/* ═══ Enregistrement ═══ */
var tSave = null;
function sauver(){ clearTimeout(tSave); tSave = setTimeout(ecrire, 700); }
async function ecrire(){
  if(S.mode !== 'compte') return;
  var ks = Object.keys(D.items); if(ks.length > 160){ ks.sort(function(a,b){ return D.items[b].due - D.items[a].due; }).slice(160).forEach(function(k){ delete D.items[k]; }); }
  if(D.log.length > 150) D.log = D.log.slice(-150);
  try{ localStorage.setItem('arcade_'+S.enfant.id, JSON.stringify(D)); }catch(e){}
  if(!S.tableOk || !sb) return;
  try{
    var r = await sb.from('arcade_profils').upsert({enfant_id:S.enfant.id, donnees:D, maj_le:new Date().toISOString()}, {onConflict:'enfant_id'});
    if(r.error) console.log('Progression non enregistrée :', r.error.message);
  }catch(e){ console.log('Progression non enregistrée :', e); }
}
window.addEventListener('pagehide', function(){ if(tSave){ clearTimeout(tSave); ecrire(); } });

/* ═══ Accueil ═══ */
function quota(){ var j = jourStr(); if(D.jour.d !== j) D.jour = {d:j, r:0}; return D.jour; }
function accueil(){
  SE = null; S.vies = 0;
  var q = quota(), aRevoir = Object.keys(D.items).filter(function(k){ return D.items[k].due <= jourNum(); }).length;
  var prenom = S.mode === 'compte' ? S.enfant.prenom : '';
  var msg = (prenom ? 'Bonjour '+esc(prenom)+' ! ' : 'C\'est parti ! ') + 'Choisis ta matière. Réussis ta série pour gagner des vies et jouer.';
  if(aRevoir) msg += ' J\'ai gardé <b>'+aRevoir+' question'+(aRevoir>1?'s':'')+'</b> à revoir pour toi aujourd\'hui.';
  $('#ugoAccueil').innerHTML = msg;
  var qz = $('#quota');
  if(q.r >= S.cap){ qz.className = 'quota fini'; qz.innerHTML = 'Tu as gagné toutes tes vies pour aujourd\'hui (<b>'+S.cap+'/'+S.cap+'</b>). Tu peux continuer à t\'entraîner !'; }
  else { qz.className = 'quota'; qz.innerHTML = 'Séries qui donnent des vies aujourd\'hui : <b>'+q.r+'/'+S.cap+'</b>'; }
  $('#inviteCompte').hidden = S.mode === 'compte';
  rendreBornes('#bornesAccueil', true);
  show('accueil');
}
document.querySelectorAll('[data-m]').forEach(function(b){ b.addEventListener('click', function(){ lancer(b.dataset.m); }); });
$('#voirSalle').onclick = function(){ salle(0); };

/* ═══ Bornes ═══ */
function debloque(g){
  if(g.seuil === 0) return true;
  if(S.mode !== 'compte') return false;
  if(D.deb.indexOf(g.id) >= 0) return true;
  if(S.fichesOk >= g.seuil){ D.deb.push(g.id); sauver(); return true; }
  return false;
}
function infoJeu(g){
  var j = D.j;
  return {cascade: j.cascade ? 'Record : '+j.cascade : 'Des blocs qui tombent', serpent: j.snake ? 'Record : '+j.snake : 'Mange les pommes', memory: 'Retrouve les paires', cartes: j.ccW ? j.ccW+' victoire'+(j.ccW>1?'s':'') : 'Contre l\'ordinateur', dames: j.dW ? j.dW+' victoire'+(j.dW>1?'s':'') : 'Contre l\'ordinateur', ugo: j.ugo ? 'Niveau '+j.ugo+' / 20' : '20 niveaux'}[g.id];
}
function rendreBornes(sel, mini){
  $(sel).innerHTML = JEUX_LISTE.map(function(g){
    var ok = debloque(g), info, jauge = '';
    if(ok) info = infoJeu(g);
    else if(S.mode !== 'compte') info = 'Avec un compte';
    else { var reste = g.seuil - S.fichesOk; info = 'Encore '+reste+' fiche'+(reste>1?'s':'')+' réussie'+(reste>1?'s':''); jauge = '<div class="b-jauge"><i style="width:'+Math.round(S.fichesOk/g.seuil*100)+'%"></i></div>'; }
    return '<button class="borne'+(ok?'':' verrou')+(ok && S.vies ? ' pret' : '')+'" data-j="'+g.id+'" style="--c1:'+g.c1+';--c2:'+g.c2+'" aria-label="'+g.nom+(ok?'':' (verrouillé)')+'">'
      + '<span class="b-caisse"><span class="b-fronton">'+g.nom+'</span><span class="b-ecran"><canvas class="dm" data-j="'+g.id+'" width="120" height="90"></canvas>'+(ok?'':'<span class="b-cadenas">🔒</span>')+'</span><span class="b-pupitre"><i></i><i></i><i></i></span></span>'
      + '<span class="b-info">'+info+'</span>'+jauge+'</button>';
  }).join('');
  animerBornes();
}
function clicBorne(e){
  var b = e.target.closest('.borne'); if(!b) return;
  var g = JEUX_LISTE.filter(function(x){ return x.id === b.dataset.j; })[0];
  var enSalle = !$('#s-arcade').hidden, cible = enSalle ? $('#salleMsg') : $('#ugoAccueil');
  if(!debloque(g)){
    cible.innerHTML = S.mode !== 'compte' ? 'Ce jeu se débloque avec un compte famille, en réussissant des fiches sur le site.' : '<b>'+g.nom+'</b> se débloque quand tu as réussi <b>'+g.seuil+' fiches</b> à 80 % ou plus sur le site. Tu en as réussi '+S.fichesOk+'.';
    return;
  }
  if(!S.vies){ cible.innerHTML = 'Pour jouer à <b>'+g.nom+'</b>, réussis d\'abord une série : 7 bonnes réponses sur 10 donnent une vie !'; return; }
  var v = S.vies; S.vies = 0; JEUX[g.id](v);
}
$('#bornesAccueil').addEventListener('click', clicBorne);
$('#bornesSalle').addEventListener('click', clicBorne);
var animT = null;
function animerBornes(){
  if(animT) return;
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), dern = 0;
  function tour(t){
    var vis = Array.prototype.filter.call(document.querySelectorAll('canvas.dm'), function(c){ return c.offsetParent; });
    if(!vis.length){ animT = null; return; }
    if(t - dern > 66 || !dern){ dern = t; vis.forEach(function(c){ try{ JEUX.demo(c.dataset.j, c.getContext('2d'), c.width, c.height, calme ? 2 : (t - t0)/1000); }catch(e){} }); }
    animT = calme ? null : requestAnimationFrame(tour);
  }
  animT = requestAnimationFrame(tour);
}
function salle(vies){
  S.vies = vies || 0;
  $('#viesSalle').innerHTML = S.vies ? '♥'.repeat(S.vies) : '';
  $('#salleMsg').innerHTML = S.vies ? 'Tu as <b>'+S.vies+' vie'+(S.vies>1?'s':'')+'</b> : touche un jeu pour jouer !' : 'Réussis une série pour gagner des vies.';
  $('#salleOver').hidden = true;
  rendreBornes('#bornesSalle', false);
  show('arcade');
}
$('#quitSalle').onclick = function(){
  if(!S.vies) return accueil();
  var o = $('#salleOver');
  o.innerHTML = '<h3>Quitter la salle ?</h3><p>Tes vies doivent être jouées maintenant : si tu quittes, elles seront perdues.</p><button class="btn" id="resterSalle">Je reste et je joue</button><button class="btn" id="partirSalle" style="background:transparent;color:#fff;border:1px solid #fff">Quitter quand même</button>';
  o.hidden = false; $('#resterSalle').onclick = function(){ o.hidden = true; }; $('#partirSalle').onclick = function(){ S.vies = 0; accueil(); };
};

/* ═══ Construction d'une série ═══ */
function st(code){ return D.notions[code] || (D.notions[code] = {b:0, due:0, ok:0, ko:0, h:[]}); }
function adapter(it, petit){
  it = Object.assign({}, it);
  if(petit && it.t === 'num'){
    var a = it.a; it.o = [ARC.fmt(a)].concat(ARC.leurresNum(a).map(ARC.fmt)); it.a = ARC.fmt(a); it.t = 'choice'; it.q = it.q.replace('{?}', '<span class="blank">?</span>');
  } else if(petit && it.t === 'text'){
    if(!it.o || it.o.length < 2) return null; it.t = 'choice';
  }
  if(it.t === 'choice') it.o = ARC.uniq(it.o.map(String));
  return it;
}
function poids(n){
  var dist = S.K - idx(n.classe); if(dist < 0) return 0;
  var w = dist === 0 ? 4 : dist === 1 ? 3 : dist === 2 ? 1.2 : 0.3;
  var s = D.notions[n.code];
  if(!s) w *= 1.5; else w *= s.due <= jourNum() ? 2 : 0.5;
  var sc = S.scores[n.code]; if(sc != null){ if(sc < 0.8) w *= 2; else if(sc >= 0.9) w *= 0.8; }
  var der = S.dernier && S.dernier[n.code]; if(der != null && der < 0.5) w *= 1.5;
  return w;
}
function tirer(liste, poidsF){
  var tot = 0, ws = liste.map(function(x){ var w = poidsF(x); tot += w; return w; });
  var r = Math.random() * tot; for(var i=0;i<liste.length;i++){ r -= ws[i]; if(r <= 0) return liste[i]; } return liste[liste.length-1];
}
function construire(m){
  var petit = S.K <= 1, N = m === 'dictee' ? (S.K <= 2 ? 10 : 6) : 10, items = [], vus = {}, parNotion = {};
  function ajouter(it){ if(!it || vus[it.key]) return false; vus[it.key] = 1; items.push(it); parNotion[it.notion] = (parNotion[it.notion]||0) + 1; return true; }
  var dues = Object.keys(D.items).filter(function(k){ var r = D.items[k]; return r.m === m && r.due <= jourNum(); }).sort(function(a,b){ return D.items[a].due - D.items[b].due; });
  for(var i=0; i<dues.length && items.length < Math.min(4, N-3); i++){
    var r = D.items[dues[i]], it = adapter(r.it, petit && r.it.t !== 'dict'); if(!it) continue;
    it.key = dues[i]; it.notion = r.n; it.rev = true; ajouter(it);
  }
  if(m === 'dictee'){
    var codes = Object.keys(ARC.DICTEES).filter(function(c){ var k = idx(ARC.DICTEES[c].n); return k <= S.K && (S.K <= 2 || k >= Math.min(3, S.K) || /^DC/.test(c)); });
    if(!codes.length) codes = Object.keys(ARC.DICTEES).filter(function(c){ return idx(ARC.DICTEES[c].n) <= S.K; });
    var essais = 0;
    while(items.length < N && essais++ < 200 && codes.length){
      var c = tirer(codes, function(c){ var dist = S.K - idx(ARC.DICTEES[c].n); return (dist === 0 ? 4 : dist === 1 ? 3 : 1.2) * ((S.scores[c] != null && S.scores[c] < 0.8) ? 2 : 1); });
      var lst = ARC.DICTEES[c].items, j = ARC.R(0, lst.length-1), x = lst[j];
      ajouter({t:'dict', a:x.r[0], acc:x.r, speak:x.l || x.r[0], key:'D-'+c+'-'+j, notion:c, e:''});
    }
  } else {
    var pool = ARC.NOTIONS.filter(function(n){ return n.matiere === m && idx(n.classe) <= S.K; }), tries = 0;
    while(items.length < N && tries++ < 400 && pool.length){
      var n = tirer(pool, function(n){ return (parNotion[n.code] || 0) >= 2 ? 0.0001 : poids(n); });
      var s = D.notions[n.code], d = s ? 1 + (s.b >= 2 ? 1 : 0) + (s.b >= 4 ? 1 : 0) : 1, it2;
      try{ it2 = n.gen(d); }catch(e){ continue; }
      it2 = adapter(it2, petit); if(!it2) continue;
      it2.notion = n.code; ajouter(it2);
    }
  }
  return ARC.shuffle(items).slice(0, N);
}

/* ═══ Déroulement ═══ */
function lancer(m){
  var q = construire(m); if(!q.length){ $('#ugoAccueil').innerHTML = 'Il n\'y a pas encore de questions pour ta classe dans cette matière.'; return; }
  SE = {m:m, q:q, N:q.length, i:0, score:0, faites:0, erreurs:[], verrou:false};
  $('#s-serie').className = 'screen acc-'+m;
  show('serie'); afficher();
}
function cur(){ return SE.q[SE.i]; }
function slotHtml(it){ return it.t === 'num' ? '<span class="slot" id="slot"></span>' : '<span class="saisie vide" id="saisie"></span>'; }
function afficher(){
  var it = cur(); SE.verrou = false; SE.saisie = ''; SE.accent = false;
  var card = $('#qcard'); card.className = 'qcard'; $('#fb').hidden = true; $('#okmsg').textContent = ''; $('#zoneReponse').hidden = false;
  var n = notionDe(it.notion);
  $('#qtag').textContent = it.rev ? 'À revoir' : (n ? n.titre : (S.catalogue[it.notion] ? S.catalogue[it.notion].titre : (it.t === 'dict' ? 'Dictée' : '')));
  var h = it.vis || '', q = sansBulles(it.q || '');
  if(it.t === 'num'){ h += '<div class="'+(q.length < 40 ? 'qn' : '')+'">'+(q.indexOf('{?}') >= 0 ? q.replace('{?}', slotHtml(it)) : q+'<br>'+slotHtml(it))+'</div>'; }
  else if(it.t === 'text'){ h += /class="blank"/.test(q) ? q.replace(/<span class="blank">\?<\/span>/, slotHtml(it)) : q + '<div>' + slotHtml(it) + '</div>'; }
  else if(it.t === 'dict'){ h += '<div class="dict-zone"><div class="muted">Écoute bien, puis écris '+(/\s/.test(it.a) ? 'la phrase' : 'le mot')+'.</div><div class="dict-btns"><button id="dEcoute">🔊 Écouter</button><button id="dLent">🐢 Lentement</button></div>'+slotHtml(it)+'</div>'; }
  else h += '<div class="'+(q.length < 30 && !/<div|<br/.test(q) ? 'qn' : '')+'">'+q+'</div>';
  $('#qcontenu').innerHTML = h;
  $('#compte').textContent = (Math.min(SE.faites+1, SE.N))+'/'+SE.N;
  $('#progI').style.width = (SE.faites/SE.N*100)+'%';
  var z = $('#zoneReponse');
  if(it.t === 'choice'){
    var o = ARC.shuffle(it.o), longues = o.some(function(x){ return strip(x).length > 14; }), sym = o.every(function(x){ return /^[<>=]$/.test(x); });
    z.innerHTML = '<div class="opts'+(longues?' longues':'')+(S.K <= 1 ? ' petits' : '')+'">'+o.map(function(x){ return '<button class="opt'+(sym?' sym':'')+'" data-v="'+esc(x)+'">'+esc(x).replace(/&lt;br&gt;/g,'<br>')+'</button>'; }).join('')+'</div>';
  } else if(it.t === 'num'){
    z.innerHTML = '<div class="pad'+(it.neg?' neg':'')+'">'+[7,8,9,4,5,6,1,2,3].map(function(k){ return '<button data-k="'+k+'">'+k+'</button>'; }).join('')+'<button data-k=",">,</button><button data-k="0">0</button>'+(it.neg?'<button data-k="−">−</button>':'')+'<button data-k="del" aria-label="Effacer">⌫</button><button class="val" data-k="ok">Valider</button></div>';
  } else {
    var rows = ['azertyuiop','qsdfghjklm','wxcvbn','éèêàçùâîôû'];
    z.innerHTML = '<div class="kb">'+rows.map(function(r,i){ return '<div class="kr">'+r.split('').map(function(c){ return '<button data-k="'+c+'"'+(i===3?' class="ac"':'')+'>'+c+'</button>'; }).join('')+(i===2?'<button data-k="\'">\'</button><button data-k="-">-</button><button data-k="del" class="wk" aria-label="Effacer">⌫</button>':'')+'</div>'; }).join('')
      + (it.t === 'dict' ? '<div class="kr"><button data-k=",">,</button><button data-k=".">.</button><button data-k="?">?</button><button data-k="!">!</button><button data-k="ë" class="ac">ë</button><button data-k="ï" class="ac">ï</button><button data-k="œ" class="ac">œ</button></div>' : '')
      + '<div class="kr"><button data-k="sp" class="sp">espace</button><button data-k="ok" class="ok">Valider</button></div></div>';
  }
  if(it.t === 'dict'){ $('#dEcoute').onclick = function(){ dire(it.speak, false); }; $('#dLent').onclick = function(){ dire(it.speak, true); }; setTimeout(function(){ dire(it.speak, false); }, 350); }
  else if(S.K === 0) setTimeout(function(){ dire(aLire(it), false); }, 300);
  $('#lire').hidden = it.t === 'dict';
  SE.t0 = performance.now();
}
/* Saisie */
$('#zoneReponse').addEventListener('click', function(e){
  if(!SE || SE.verrou) return;
  var b = e.target.closest('button'); if(!b) return;
  if(b.dataset.v != null) return repondre(b.dataset.v, b);
  if(b.dataset.k) touche(b.dataset.k);
});
function touche(k){
  var it = cur(); if(!it || SE.verrou) return;
  if(k === 'ok'){ if(SE.saisie.trim()) repondre(SE.saisie); return; }
  if(k === 'del') SE.saisie = SE.saisie.slice(0,-1);
  else if(k === 'sp'){ if(SE.saisie && !/ $/.test(SE.saisie)) SE.saisie += ' '; }
  else if(it.t === 'num'){
    if(k === ','){ if(SE.saisie.indexOf(',') < 0) SE.saisie = (SE.saisie === '' || SE.saisie === '−' ? SE.saisie+'0' : SE.saisie) + ','; }
    else if(k === '−'){ SE.saisie = SE.saisie.charAt(0) === '−' ? SE.saisie.slice(1) : '−' + SE.saisie; }
    else if(SE.saisie.replace(/[−,]/g,'').length < 9) SE.saisie = (SE.saisie === '0' ? '' : SE.saisie === '−0' ? '−' : SE.saisie) + k;
  }
  else if(SE.saisie.length < 90) SE.saisie += k;
  var el = $('#slot') || $('#saisie'); if(el){ el.textContent = SE.saisie; el.classList.toggle('vide', !SE.saisie); }
}
document.addEventListener('keydown', function(e){
  if(!SE || $('#s-serie').hidden) return;
  if(!$('#fb').hidden){ if(e.key === 'Enter'){ e.preventDefault(); var c = $('#continuer'); if(c) c.click(); } return; }
  if(SE.verrou || e.ctrlKey || e.metaKey || e.altKey) return;
  var it = cur(), k = e.key;
  if(it.t === 'choice'){ var n = parseInt(k, 10), bs = document.querySelectorAll('.opt'); if(n >= 1 && n <= bs.length){ e.preventDefault(); repondre(bs[n-1].dataset.v, bs[n-1]); } return; }
  if(k === 'Enter'){ e.preventDefault(); touche('ok'); return; }
  if(k === 'Backspace'){ e.preventDefault(); touche('del'); return; }
  if(it.t === 'num'){ if(/^[0-9]$/.test(k)) touche(k); else if(k === ',' || k === '.') touche(','); else if(k === '-' && it.neg) touche('−'); return; }
  if(k === ' '){ e.preventDefault(); touche('sp'); return; }
  if(k.length === 1 && /[a-zàâäçéèêëîïôöûùüœ'’\-,.?!]/i.test(k)){ e.preventDefault(); touche(k === '’' ? "'" : k.toLowerCase()); }
});

/* Correction */
function norm(s){ return String(s).normalize('NFC').replace(/[’`]/g,"'").replace(/\s+/g,' ').trim().toLowerCase(); }
function normD(s){ return norm(s).replace(/\s+([,.?!;:])/g,'$1').replace(/[.!?]+$/,'').trim(); }
function sansAcc(s){ return s.normalize('NFD').replace(/[̀-ͯ]/g,''); }
function juste(it, val){
  if(it.t === 'choice') return String(val) === String(it.a);
  if(it.t === 'num'){ var x = parseFloat(String(val).replace(',', '.').replace('−', '-')); return isFinite(x) && Math.abs(x - it.a) < 1e-9; }
  if(it.t === 'dict'){ var v = normD(val); return [it.a].concat(it.acc||[]).some(function(a){ return normD(a) === v; }); }
  var v2 = norm(val), acc = [it.a].concat(it.acc||[]).map(norm);
  if(it.prefix) acc = acc.concat(acc.map(function(a){ return norm(it.prefix+' '+a); }));
  if(acc.indexOf(v2) >= 0) return true;
  if(acc.map(sansAcc).indexOf(sansAcc(v2)) >= 0){ SE.accent = true; return true; }
  return false;
}
function seuilMs(it){
  if(it.t === 'choice') return Math.min(2200, 600 + 8*strip(sansBulles(it.q)).length);
  if(it.t === 'num') return 700;
  return 0;
}
var BRAVO = ['Bravo !','Juste !','Super !','Bien vu !','Excellent !','Oui, c\'est ça !'];
function repondre(val, btn){
  if(SE.verrou) return; SE.verrou = true;
  var it = cur(), dt = performance.now() - SE.t0, ok = juste(it, val), vite = ok && dt < seuilMs(it);
  var card = $('#qcard');
  if(it.t === 'choice') document.querySelectorAll('.opt').forEach(function(o){ if(o.dataset.v === String(it.a) && !vite) o.classList.add('right'); });
  if(ok && !vite){
    if(!it._re){ SE.score++; SE.faites++; } maj(it, true);
    card.classList.add('good'); if(btn) btn.classList.add('right');
    var el = $('#slot') || $('#saisie'); if(el && it.t === 'num') el.textContent = ARC.fmt(it.a);
    $('#okmsg').textContent = SE.accent ? 'Juste, mais attention aux accents : '+it.a : ARC.pick(BRAVO);
    setTimeout(suivante, SE.accent ? 1700 : 750);
    return;
  }
  if(!it._re) SE.faites++;
  var fb = $('#fb'); $('#zoneReponse').hidden = it.t !== 'choice';
  if(vite){
    fb.className = 'fb vite'; fb.innerHTML = '<div class="lab">Trop rapide !</div><div class="pq">Tu as répondu avant d\'avoir eu le temps de lire : cette réponse ne compte pas. Prends le temps de lire chaque question.</div><button class="gros-btn b-bleu" id="continuer">Continuer</button>';
  } else {
    maj(it, false); card.classList.add('bad'); if(btn) btn.classList.add('wrong');
    SE.erreurs.push({it:it, donne:val});
    if(!it._re && SE.q.length < SE.N + 5){ var copie = Object.assign({}, it, {_re:true}); SE.q.push(copie); }
    var rep = it.t === 'num' ? ARC.fmt(it.a) : it.t === 'dict' ? esc(it.a) : esc(strip(String(it.prefix ? it.prefix+' ' : '')+it.a));
    var pq = it.t === 'dict' ? diff(val, it.a) : ARC.bulles(it.e || '');
    fb.className = 'fb'; fb.innerHTML = '<div class="lab">La bonne réponse</div><div class="rep">'+rep+'</div>'+(pq ? '<div class="lab">Pourquoi ?</div><div class="pq">'+pq+'</div>' : '')+'<button class="gros-btn b-bleu" id="continuer">Continuer</button>';
  }
  fb.hidden = false; $('#continuer').onclick = suivante;
  setTimeout(function(){ fb.scrollIntoView({block:'nearest', behavior:'smooth'}); }, 150);
}
function diff(donne, attendu){
  var a = attendu.split(' '), d = normD(donne).split(' ');
  var html = a.map(function(w, i){ return normD(w) === (d[i]||'') || normD(w) === normD(d[i]||'') ? esc(w) : '<span class="faux">'+esc(w)+'</span>'; }).join(' ');
  return 'Tu as écrit : « '+esc(donne)+' ».<br>Les mots soulignés sont à revoir : '+html;
}
function maj(it, ok){
  var s = st(it.notion), j = jourNum();
  s.h.push(ok ? 1 : 0); if(s.h.length > 12) s.h = s.h.slice(-12);
  if(ok){ s.ok++; s.b = Math.min(5, s.b+1); s.due = j + INT[s.b]; }
  else { s.ko++; s.b = Math.max(0, s.b-2); s.due = j + 1; }
  var r = D.items[it.key];
  if(ok && r){ r.b++; if(r.b >= 2) delete D.items[it.key]; else r.due = j + INT[r.b]; }
  if(!ok){
    var garde = {}; ['t','q','a','acc','o','e','vis','prefix','speak','neg'].forEach(function(k){ if(it[k] != null) garde[k] = it[k]; });
    D.items[it.key] = {it:garde, b:0, due:j+1, n:it.notion, m:SE.m, src:'a'};
  }
}
function suivante(){
  SE.i++;
  if(SE.i >= SE.q.length) return finir();
  afficher();
}
$('#quitSerie').onclick = function(){
  if(SE && SE.quitter){ accueil(); return; }
  SE.quitter = true; $('#okmsg').innerHTML = '<span style="color:var(--rouge)">Touche encore ✕ pour arrêter la série (elle ne compte pas).</span>';
  setTimeout(function(){ if(SE){ SE.quitter = false; if(!SE.verrou) $('#okmsg').textContent = ''; } }, 3000);
};

/* ═══ Fin de série ═══ */
function finir(){
  var total = SE.N, sc = SE.score, ratio = sc / total;
  var vies = ratio >= 0.9 ? 2 : ratio >= 0.7 ? 1 : 0, q = quota(), plafond = q.r >= S.cap;
  if(vies && plafond) vies = 0;
  if(vies) q.r++;
  D.log.push({d:jourStr(), m:SE.m, s:sc, n:total});
  sauver();
  $('#tampon').innerHTML = sc+'<small>sur '+total+'</small>';
  var msg;
  if(ratio === 1) msg = 'Parfait, tout est juste ! Tu as vraiment bien travaillé.';
  else if(ratio >= 0.9) msg = 'Excellent ! Il ne manquait presque rien.';
  else if(ratio >= 0.7) msg = 'Bien joué ! Regarde les explications ci-dessous pour progresser encore.';
  else if(ratio >= 0.5) msg = 'Tu es sur la bonne voie. Chaque erreur t\'apprend quelque chose : relis les explications et retente ta chance !';
  else msg = 'Ce n\'est pas grave, on apprend en se trompant. Relis bien les explications : ces questions reviendront pour que tu les maîtrises.';
  $('#ugoRes').innerHTML = msg;
  var rc = $('#recompense');
  if(vies){
    rc.innerHTML = '<div class="recomp"><div class="coeurs">'+'♥'.repeat(vies)+'</div><div><b>Tu gagnes '+vies+' vie'+(vies>1?'s':'')+' !</b><br><span style="opacity:.8">À jouer tout de suite dans la salle d\'arcade.</span></div><button class="gros-btn b-jaune" id="allerJouer">Choisir mon jeu →</button></div>';
    $('#allerJouer').onclick = function(){ salle(vies); };
  } else if(plafond && ratio >= 0.7){
    rc.innerHTML = '<div class="recomp rien">Tu as déjà gagné tes vies aujourd\'hui ('+S.cap+' séries). Tu peux continuer à t\'entraîner : reviens demain pour rejouer !</div>';
  } else {
    rc.innerHTML = '<div class="recomp rien">'+(total === 10 ? '7 bonnes réponses sur 10' : Math.ceil(total*0.7)+' bonnes réponses sur '+total)+' donnent une vie, '+(total === 10 ? '9' : Math.ceil(total*0.9))+' en donnent deux. Retente ta chance !</div>';
  }
  if(S.mode !== 'compte') rc.innerHTML += '<div class="invite" style="margin-top:12px"><b>Envie de garder tes progrès ?</b> Avec un compte famille, tes erreurs reviennent pour que tu les maîtrises, et tu peux débloquer les 6 jeux. <a href="connexion.html">Créer un compte</a></div>';
  var vus = {};
  var errs = SE.erreurs.filter(function(x){ if(vus[x.it.key]) return false; vus[x.it.key] = 1; return true; });
  $('#erreurs').innerHTML = errs.length ? '<h3>À retenir</h3>' + errs.map(function(x){
    var it = x.it, rep = it.t === 'num' ? ARC.fmt(it.a) : esc(it.prefix ? it.prefix+' '+it.a : it.a);
    var qq = it.t === 'dict' ? 'Dictée' : esc(strip(sansBulles(it.q)).replace('{?}','?').slice(0,120));
    return '<div class="err"><div class="q">'+qq+'</div><span class="r">'+rep+'</span></div>';
  }).join('') : '';
  show('resultat');
  SE.fini = true;
}
$('#rejouer').onclick = function(){ var m = SE ? SE.m : 'maths'; lancer(m); };
$('#versAccueil').onclick = function(){ accueil(); };

/* ═══ Lecture à voix haute ═══ */
var voix = null;
function choisirVoix(){
  if(!('speechSynthesis' in window)) return;
  var vs = speechSynthesis.getVoices(), pref = ['Thomas','Amelie','Amélie','Aurelie','Aurélie','Julie'];
  for(var i=0;i<pref.length && !voix;i++) voix = vs.filter(function(v){ return v.name.indexOf(pref[i]) >= 0 && /^fr/i.test(v.lang); })[0] || null;
  if(!voix) voix = vs.filter(function(v){ return /^fr[-_]FR/i.test(v.lang); })[0] || vs.filter(function(v){ return /^fr/i.test(v.lang); })[0] || null;
}
if('speechSynthesis' in window){ choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }
function dire(txt, lent){
  if(!('speechSynthesis' in window) || !txt) return;
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(txt); u.lang = 'fr-FR'; if(voix) u.voice = voix; u.rate = lent ? 0.55 : 0.9;
  var b = $('#lire'); u.onstart = function(){ b.classList.add('parle'); }; u.onend = u.onerror = function(){ b.classList.remove('parle'); };
  setTimeout(function(){ speechSynthesis.speak(u); }, 80);
}
function aLire(it){
  var h = sansBulles(it.q || '').replace(/<span class="fr"><span>([^<]*)<\/span><span>([^<]*)<\/span><\/span>/g, ' $1 sur $2 ');
  var t = strip(h.replace(/<br\s*\/?>/g, '. ').replace(/<\/div>/g, '. '));
  t = t.replace(/\{\?\}/g, ' combien ').replace(/\?(?=\s|$)/g, '?').replace(/×/g,' fois ').replace(/÷/g,' divisé par ').replace(/−/g,' moins ').replace(/=/g,' égale ').replace(/\+/g,' plus ').replace(/</g,' plus petit que ').replace(/>/g,' plus grand que ');
  if(it.t === 'choice' && it.o) t += '. ' + ARC.shuffle(it.o).map(function(o){ return strip(o); }).join(', ou ');
  return t;
}
$('#lire').onclick = function(){ if(SE) dire(aLire(cur()), false); };

/* ═══ Bulles de définition ═══ */
var bulle = $('#bulleDef');
document.addEventListener('click', function(e){
  var g = e.target.closest('.gl');
  if(!g){ bulle.hidden = true; return; }
  var d = ARC.GLO[g.dataset.t]; if(!d) return;
  bulle.innerHTML = '<b>'+d.mot+'</b>'+d.def; bulle.hidden = false;
  var r = g.getBoundingClientRect(), w = bulle.offsetWidth, h = bulle.offsetHeight;
  var x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width/2 - w/2)), y = r.top - h - 8; if(y < 8) y = r.bottom + 8;
  bulle.style.left = x+'px'; bulle.style.top = y+'px';
});
window.addEventListener('scroll', function(){ bulle.hidden = true; }, {passive:true});

boot();
})();
