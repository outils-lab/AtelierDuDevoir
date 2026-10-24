/* ═══════════════════════════════════════════════════════════
   Salle d'arcade — outils communs aux questions
   Chaque notion correspond à une fiche du site (même code).
   Une question = un objet :
     t   : 'choice' (boutons) · 'num' (pavé numérique) · 'text' (clavier intégré)
     q   : énoncé (HTML léger) ; pour 'num', {?} marque la case réponse
     a   : bonne réponse (texte ou nombre) ; acc : autres réponses acceptées
     o   : options (choice) ou leurres (pour transformer en choix au CP-CE1)
     e   : explication affichée après une erreur ; [[cle|mot]] crée une bulle
     key : identifiant stable pour les révisions espacées
   ═══════════════════════════════════════════════════════════ */
var ARC = window.ARC = window.ARC || {};
ARC.NOTIONS = ARC.NOTIONS || [];
ARC.CLASSES = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e'];

ARC.R = function(a,b){ return a + Math.floor(Math.random()*(b-a+1)); };
ARC.pick = function(a){ return a[Math.floor(Math.random()*a.length)]; };
ARC.shuffle = function(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; };
ARC.fix = function(n){ return +(+n).toFixed(6); };
ARC.fmt = function(n){ n = ARC.fix(n); var s = String(n); if(Math.abs(n) >= 10000 && s.indexOf('.') < 0) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return s.replace('.', ',').replace('-', '−'); };
ARC.F = function(a,b){ return '<span class="fr"><span>'+a+'</span><span>'+b+'</span></span>'; };
ARC.uniq = function(a){ var s = {}, o = []; a.forEach(function(x){ var k = String(x); if(!s[k]){ s[k] = 1; o.push(x); } }); return o; };

/* Leurres numériques plausibles (pour le CP-CE1 et les questions à choix) */
ARC.leurresNum = function(a, extra){
  var c = (extra || []).slice(), step = Math.abs(a) >= 100 ? 10 : 1;
  if(String(a).indexOf('.') >= 0) step = Math.pow(10, -String(ARC.fix(a)).split('.')[1].length);
  [1,-1,2,-2,10,-10].forEach(function(k){ c.push(ARC.fix(a + k*step)); });
  c = ARC.uniq(c.filter(function(x){ return x !== a && x >= 0; }));
  return ARC.shuffle(c).slice(0, 3);
};

/* Constructeurs */
ARC.num = function(q, a, e, key, x){ return Object.assign({t:'num', q:q, a:ARC.fix(a), e:e, key:key}, x||{}); };
ARC.choice = function(q, a, o, e, key, x){ return Object.assign({t:'choice', q:q, a:a, o:o, e:e, key:key}, x||{}); };
ARC.text = function(q, a, e, key, x){ return Object.assign({t:'text', q:q, a:a, e:e, key:key}, x||{}); };

/* Banque : [énoncé, bonne réponse, [mauvaises réponses], explication] */
ARC.banque = function(code, liste){
  return function(){
    var i = ARC.R(0, liste.length-1), b = liste[i];
    return ARC.choice(b[0], b[1], [b[1]].concat(b[2]), b[3], code+'-'+i);
  };
};

/* Enregistrer une notion : code de fiche, classe, matière, titre, générateur(d) */
ARC.notion = function(code, classe, matiere, titre, gen, x){
  ARC.NOTIONS.push(Object.assign({code:code, classe:classe, matiere:matiere, titre:titre, gen:gen}, x||{}));
};

/* ═══ Bulles de définition (uniquement dans les explications) ═══ */
ARC.GLO = {
  verbe:{mot:'verbe', def:"Le mot qui dit ce que l'on fait ou ce qui se passe : <em>il court</em>, <em>elle chante</em>."},
  sujet:{mot:'sujet', def:"Celui qui fait l'action. On le trouve en demandant « Qui est-ce qui… ? » devant le verbe."},
  infinitif:{mot:'infinitif', def:"Le verbe tel qu'on le trouve dans le dictionnaire, non conjugué : <em>chanter</em>, <em>finir</em>."},
  radical:{mot:'radical', def:"La partie du verbe qui reste quand on enlève la terminaison : <em>chant</em>-er."},
  terminaison:{mot:'terminaison', def:"La fin du verbe, qui change selon la personne et le temps : chant-<em>ons</em>."},
  auxiliaire:{mot:'auxiliaire', def:"Le verbe <em>être</em> ou <em>avoir</em> qui aide à former un temps composé : <em>j'ai</em> mangé."},
  participe:{mot:'participe passé', def:"La forme du verbe après l'auxiliaire : mangé, fini, pris."},
  determinant:{mot:'déterminant', def:"Le petit mot placé devant le nom : <em>le</em>, <em>une</em>, <em>mes</em>, <em>ce</em>."},
  nom:{mot:'nom', def:"Le mot qui désigne une personne, un animal, une chose ou une idée : <em>chat</em>, <em>école</em>."},
  adjectif:{mot:'adjectif', def:"Le mot qui dit comment est le nom : un chat <em>noir</em>, une <em>petite</em> maison."},
  pronom:{mot:'pronom', def:"Un petit mot qui remplace un nom : <em>il</em>, <em>elle</em>, <em>le</em>, <em>leur</em>."},
  homophone:{mot:'homophones', def:"Des mots qui se prononcent pareil mais qui s'écrivent différemment : <em>a</em> et <em>à</em>."},
  cod:{mot:'COD', def:"Complément d'objet direct : il répond à « quoi ? » ou « qui ? » juste après le verbe, sans petit mot entre les deux."},
  coi:{mot:'COI', def:"Complément d'objet indirect : il répond à « à qui ? », « de quoi ? »… et commence par un petit mot comme <em>à</em> ou <em>de</em>."},
  cc:{mot:'complément circonstanciel', def:"Il dit où, quand ou comment se passe l'action. On peut souvent le déplacer ou le supprimer."},
  preposition:{mot:'préposition', def:"Un petit mot invariable qui introduit un complément : <em>à</em>, <em>de</em>, <em>dans</em>, <em>sur</em>, <em>avec</em>."},
  adverbe:{mot:'adverbe', def:"Un mot invariable qui précise un verbe ou un adjectif : <em>vite</em>, <em>très</em>, <em>lentement</em>."},
  proposition:{mot:'proposition', def:"Un morceau de phrase organisé autour d'un verbe conjugué."},
  subordonnee:{mot:'subordonnée', def:"Une proposition qui dépend d'une autre et ne peut pas exister seule. Elle commence souvent par <em>qui</em>, <em>que</em>, <em>quand</em>…"},
  synonyme:{mot:'synonyme', def:"Un mot qui veut dire presque la même chose : <em>content</em> et <em>joyeux</em>."},
  antonyme:{mot:'antonyme', def:"Un mot de sens contraire : <em>grand</em> et <em>petit</em>."},
  prefixe:{mot:'préfixe', def:"Un morceau ajouté au début d'un mot pour en changer le sens : <em>re</em>faire, <em>dé</em>faire."},
  suffixe:{mot:'suffixe', def:"Un morceau ajouté à la fin d'un mot : jardin<em>ier</em>, lent<em>ement</em>."},
  famille:{mot:'famille de mots', def:"Des mots construits à partir du même radical : <em>dent</em>, <em>dentiste</em>, <em>dentifrice</em>."},
  voixpassive:{mot:'voix passive', def:"Le sujet subit l'action : <em>La souris est mangée par le chat.</em>"},
  subjonctif:{mot:'subjonctif', def:"Le mode du souhait, de l'obligation ou du doute : <em>il faut que tu viennes</em>."},
  numerateur:{mot:'numérateur', def:"Le nombre du haut d'une fraction : combien de parts on prend."},
  denominateur:{mot:'dénominateur', def:"Le nombre du bas d'une fraction : en combien de parts égales on coupe."},
  perimetre:{mot:'périmètre', def:"La longueur du tour d'une figure."},
  aire:{mot:'aire', def:"La surface à l'intérieur d'une figure, comptée en carrés."},
  hypotenuse:{mot:'hypoténuse', def:"Le côté le plus long d'un triangle rectangle, en face de l'angle droit."},
  quotient:{mot:'quotient', def:"Le résultat d'une division."},
  produit:{mot:'produit', def:"Le résultat d'une multiplication."},
  relatif:{mot:'nombre relatif', def:"Un nombre avec un signe : positif (+3) ou négatif (−3)."},
  mediane:{mot:'médiane', def:"La valeur du milieu quand on range les valeurs dans l'ordre."},
  moyenne:{mot:'moyenne', def:"La somme de toutes les valeurs divisée par le nombre de valeurs."}
};
/* [[cle|mot]] → bulle ; [[cle]] → bulle avec le mot du glossaire */
ARC.bulles = function(html){
  return String(html||'').replace(/\[\[([a-z]+)(?:\|([^\]]+))?\]\]/g, function(_, k, m){
    var g = ARC.GLO[k]; if(!g) return m || k;
    return '<span class="gl" data-t="'+k+'">'+(m || g.mot)+'</span>';
  });
};

/* ═══ Conjugaison ═══ */
var CJ = ARC.CJ = {};
CJ.PRON = ['je','tu','il','nous','vous','ils'];
CJ.PRON_F = ['je','tu','elle','nous','vous','elles'];
CJ.voy = function(s){ return /^[aeéèêiouyh]/i.test(s); };
CJ.IRR = {
 'être':{pr:['suis','es','est','sommes','êtes','sont'],im:'ét',fu:'ser',pp:'été',aux:'avoir',ps:['fus','fus','fut','fûmes','fûtes','furent'],sj:['sois','sois','soit','soyons','soyez','soient'],ip:['sois','soyons','soyez']},
 'avoir':{pr:['ai','as','a','avons','avez','ont'],im:'av',fu:'aur',pp:'eu',aux:'avoir',ps:['eus','eus','eut','eûmes','eûtes','eurent'],sj:['aie','aies','ait','ayons','ayez','aient'],ip:['aie','ayons','ayez']},
 'aller':{pr:['vais','vas','va','allons','allez','vont'],im:'all',fu:'ir',pp:'allé',aux:'être',ps:['allai','allas','alla','allâmes','allâtes','allèrent'],sj:['aille','ailles','aille','allions','alliez','aillent'],ip:['va','allons','allez']},
 'faire':{pr:['fais','fais','fait','faisons','faites','font'],im:'fais',fu:'fer',pp:'fait',aux:'avoir',ps:['fis','fis','fit','fîmes','fîtes','firent'],sj:['fasse','fasses','fasse','fassions','fassiez','fassent'],ip:['fais','faisons','faites']},
 'dire':{pr:['dis','dis','dit','disons','dites','disent'],im:'dis',fu:'dir',pp:'dit',aux:'avoir',ps:['dis','dis','dit','dîmes','dîtes','dirent'],sj:['dise','dises','dise','disions','disiez','disent'],ip:['dis','disons','dites']},
 'venir':{pr:['viens','viens','vient','venons','venez','viennent'],im:'ven',fu:'viendr',pp:'venu',aux:'être',ps:['vins','vins','vint','vînmes','vîntes','vinrent'],sj:['vienne','viennes','vienne','venions','veniez','viennent'],ip:['viens','venons','venez']},
 'prendre':{pr:['prends','prends','prend','prenons','prenez','prennent'],im:'pren',fu:'prendr',pp:'pris',aux:'avoir',ps:['pris','pris','prit','prîmes','prîtes','prirent'],sj:['prenne','prennes','prenne','prenions','preniez','prennent'],ip:['prends','prenons','prenez']},
 'pouvoir':{pr:['peux','peux','peut','pouvons','pouvez','peuvent'],im:'pouv',fu:'pourr',pp:'pu',aux:'avoir',ps:['pus','pus','put','pûmes','pûtes','purent'],sj:['puisse','puisses','puisse','puissions','puissiez','puissent']},
 'vouloir':{pr:['veux','veux','veut','voulons','voulez','veulent'],im:'voul',fu:'voudr',pp:'voulu',aux:'avoir',ps:['voulus','voulus','voulut','voulûmes','voulûtes','voulurent'],sj:['veuille','veuilles','veuille','voulions','vouliez','veuillent']},
 'voir':{pr:['vois','vois','voit','voyons','voyez','voient'],im:'voy',fu:'verr',pp:'vu',aux:'avoir',ps:['vis','vis','vit','vîmes','vîtes','virent'],sj:['voie','voies','voie','voyions','voyiez','voient'],ip:['vois','voyons','voyez']},
 'partir':{pr:['pars','pars','part','partons','partez','partent'],im:'part',fu:'partir',pp:'parti',aux:'être',ps:['partis','partis','partit','partîmes','partîtes','partirent'],sj:['parte','partes','parte','partions','partiez','partent'],ip:['pars','partons','partez']},
 'mettre':{pr:['mets','mets','met','mettons','mettez','mettent'],im:'mett',fu:'mettr',pp:'mis',aux:'avoir',ps:['mis','mis','mit','mîmes','mîtes','mirent'],sj:['mette','mettes','mette','mettions','mettiez','mettent'],ip:['mets','mettons','mettez']},
 'savoir':{pr:['sais','sais','sait','savons','savez','savent'],im:'sav',fu:'saur',pp:'su',aux:'avoir',ps:['sus','sus','sut','sûmes','sûtes','surent'],sj:['sache','saches','sache','sachions','sachiez','sachent'],ip:['sache','sachons','sachez']},
 'devoir':{pr:['dois','dois','doit','devons','devez','doivent'],im:'dev',fu:'devr',pp:'dû',aux:'avoir',ps:['dus','dus','dut','dûmes','dûtes','durent'],sj:['doive','doives','doive','devions','deviez','doivent']},
 'lire':{pr:['lis','lis','lit','lisons','lisez','lisent'],im:'lis',fu:'lir',pp:'lu',aux:'avoir',ps:['lus','lus','lut','lûmes','lûtes','lurent'],sj:['lise','lises','lise','lisions','lisiez','lisent'],ip:['lis','lisons','lisez']},
 'écrire':{pr:['écris','écris','écrit','écrivons','écrivez','écrivent'],im:'écriv',fu:'écrir',pp:'écrit',aux:'avoir',ps:['écrivis','écrivis','écrivit','écrivîmes','écrivîtes','écrivirent'],sj:['écrive','écrives','écrive','écrivions','écriviez','écrivent'],ip:['écris','écrivons','écrivez']}
};
CJ.V1 = ['chanter','parler','jouer','regarder','aimer','danser','travailler','écouter','donner','trouver','porter','marcher','sauter','crier','dessiner','fermer','gagner','préparer','ranger','raconter','arriver','tomber','rester','entrer','rentrer','monter','passer'];
CJ.V1 = CJ.V1.filter(function(v){ return v !== 'ranger'; });
CJ.V1S = ['manger','nager','ranger','bouger','commencer','lancer','avancer','placer'];
CJ.V2 = ['finir','choisir','grandir','réussir','remplir','obéir','rougir','bâtir','salir','punir'];
CJ.ETRE = {aller:1,venir:1,partir:1,arriver:1,tomber:1,rester:1,entrer:1,rentrer:1,monter:1,passer:0};
CJ.kind = function(v){ return CJ.IRR[v] ? 'irr' : CJ.V2.indexOf(v) >= 0 ? 'v2' : CJ.V1S.indexOf(v) >= 0 ? 'v1s' : 'v1'; };
CJ.soft = function(s){ return /g$/.test(s) ? s+'e' : /c$/.test(s) ? s.slice(0,-1)+'ç' : s; };
CJ.aux = function(v){ return CJ.IRR[v] ? CJ.IRR[v].aux : (CJ.ETRE[v] ? 'être' : 'avoir'); };
CJ.pp = function(v){ return CJ.IRR[v] ? CJ.IRR[v].pp : CJ.kind(v) === 'v2' ? v.slice(0,-2)+'i' : v.slice(0,-2)+'é'; };
/* Formes simples : renvoie un tableau de 6 formes */
CJ.formes = function(v, t){
  var k = CJ.kind(v), s = v.slice(0,-2), d = CJ.IRR[v], i;
  var IMP = ['ais','ais','ait','ions','iez','aient'], FUT = ['ai','as','a','ons','ez','ont'];
  if(t === 'pr'){
    if(d) return d.pr.slice();
    if(k === 'v2') return ['is','is','it','issons','issez','issent'].map(function(e){ return s+e; });
    return ['e','es','e','ons','ez','ent'].map(function(e,j){ return (j===3 && k==='v1s' ? CJ.soft(s) : s)+e; });
  }
  if(t === 'im' || t === 'co'){
    var st;
    if(t === 'co') st = d ? d.fu : v;
    else st = d ? d.im : k === 'v2' ? s+'iss' : s;
    return IMP.map(function(e,j){ return (t==='im' && k==='v1s' && j!==3 && j!==4 ? CJ.soft(s) : st)+e; });
  }
  if(t === 'fu') return FUT.map(function(e){ return (d ? d.fu : v)+e; });
  if(t === 'ps'){
    if(d) return d.ps.slice();
    if(k === 'v2') return ['is','is','it','îmes','îtes','irent'].map(function(e){ return s+e; });
    return ['ai','as','a','âmes','âtes','èrent'].map(function(e,j){ return (k==='v1s' && j!==5 ? CJ.soft(s) : s)+e; });
  }
  if(t === 'sj'){
    if(d) return d.sj.slice();
    if(k === 'v2') return ['isse','isses','isse','issions','issiez','issent'].map(function(e){ return s+e; });
    return ['e','es','e','ions','iez','ent'].map(function(e){ return s+e; });
  }
};
/* Accord du participe avec être */
CJ.accord = function(pp, p, fem){ var pl = p >= 3; if(/[s]$/.test(pp) && !pl) pl = false; return pp + (fem ? 'e' : '') + (pl && !/s$/.test(pp+(fem?'e':'')) ? 's' : ''); };
CJ.compose = function(v, t, p, fem){
  var auxv = CJ.aux(v), a = CJ.formes(auxv, t === 'pc' ? 'pr' : t === 'pqp' ? 'im' : 'fu')[p];
  var pp = CJ.pp(v); if(auxv === 'être') pp = CJ.accord(pp, p, fem);
  return a + ' ' + pp;
};
CJ.pronom = function(p, fem, forme){
  var pr = (fem ? CJ.PRON_F : CJ.PRON)[p];
  if(pr === 'je' && CJ.voy(forme)) return "j'";
  return pr + ' ';
};
CJ.TNOM = {pr:'présent', im:'imparfait', fu:'futur simple', pc:'passé composé', ps:'passé simple', co:'conditionnel présent', sj:'subjonctif présent', pqp:'plus-que-parfait', fa:'futur antérieur'};

/* Explication courte : pourquoi cette forme */
CJ.pourquoi = function(v, t, p, fem){
  var k = CJ.kind(v), s = v.slice(0,-2), d = CJ.IRR[v], f = CJ.formes(v, t === 'pc' || t === 'pqp' || t === 'fa' ? 'pr' : t);
  var liste = function(fs){ return fs.map(function(x,j){ return CJ.pronom(j, false, x) + x; }).join(', '); };
  if(t === 'pr'){
    if(d) return '<b>'+v+'</b> est un [[verbe]] irrégulier : il s\'apprend par cœur. Au présent : '+liste(d.pr)+'.';
    if(k === 'v2') return '<b>'+v+'</b> fait « nous '+s+'issons » : c\'est un verbe du 2e groupe. [[terminaison|Terminaisons]] : -is, -is, -it, -issons, -issez, -issent.';
    var h = '<b>'+v+'</b> finit par -er : 1er groupe. Au présent, les [[terminaison|terminaisons]] sont -e, -es, -e, -ons, -ez, -ent.';
    if(k === 'v1s' && p === 3) h += ' Devant -ons, on écrit <b>'+CJ.soft(s)+'</b> pour garder le bon son.';
    if(p === 5) h += ' Le -ent ne s\'entend pas, mais il s\'écrit !';
    return h;
  }
  if(t === 'im'){
    if(v === 'être') return 'À l\'imparfait, être a un [[radical]] spécial : <b>ét-</b>, puis -ais, -ais, -ait, -ions, -iez, -aient.';
    var nous = CJ.formes(v,'pr')[3];
    return 'Imparfait : on part de « nous '+nous+' », on enlève -ons, puis on ajoute -ais, -ais, -ait, -ions, -iez, -aient. Les mêmes terminaisons pour tous les verbes.';
  }
  if(t === 'fu'){
    if(d && d.fu !== v) return 'Au futur, <b>'+v+'</b> a un radical spécial : <b>'+d.fu+'-</b>, puis -ai, -as, -a, -ons, -ez, -ont.';
    return 'Futur : on garde l\'[[infinitif]] <b>'+(/re$/.test(v) ? v.slice(0,-1) : v)+'</b> et on ajoute -ai, -as, -a, -ons, -ez, -ont.';
  }
  if(t === 'co') return 'Conditionnel présent : le radical du futur (<b>'+(d ? d.fu : v)+'-</b>) et les terminaisons de l\'imparfait : -ais, -ais, -ait, -ions, -iez, -aient.';
  if(t === 'ps'){
    if(d) return 'Au passé simple, <b>'+v+'</b> s\'apprend par cœur : '+liste(d.ps)+'.';
    if(k === 'v2') return 'Verbes en -ir du 2e groupe au passé simple : -is, -is, -it, -îmes, -îtes, -irent.';
    return 'Verbes en -er au passé simple : -ai, -as, -a, -âmes, -âtes, -èrent.';
  }
  if(t === 'sj'){
    if(d) return 'Au [[subjonctif]], <b>'+v+'</b> est irrégulier : '+d.sj.map(function(x,j){ var pr = CJ.pronom(j, false, x); return (/^il/.test(pr) ? "qu'" : 'que ') + pr + x; }).join(', ')+'.';
    return 'Subjonctif présent : on part de « ils '+CJ.formes(v,'pr')[5]+' », on enlève -ent, puis -e, -es, -e, -ions, -iez, -ent.';
  }
  var auxv = CJ.aux(v), nomT = {pc:'au présent', pqp:'à l\'imparfait', fa:'au futur'}[t];
  var h2 = CJ.TNOM[t].charAt(0).toUpperCase()+CJ.TNOM[t].slice(1)+' = [[auxiliaire]] <b>'+auxv+'</b> '+nomT+' + [[participe]] <b>'+CJ.pp(v)+'</b>.';
  if(auxv === 'être') h2 += ' Avec être, le participe s\'accorde avec le sujet.';
  return h2;
};
/* Question de conjugaison */
CJ.question = function(v, t, p, code, fem){
  var forme = (t === 'pc' || t === 'pqp' || t === 'fa') ? CJ.compose(v, t, p, fem) : CJ.formes(v, t)[p];
  var pr = CJ.pronom(p, fem, forme);
  var autres = [];
  if(t === 'pc' || t === 'pqp' || t === 'fa'){ for(var j=0;j<6;j++) if(j!==p) autres.push(CJ.compose(v, t, j, fem)); }
  else autres = CJ.formes(v, t).filter(function(x,j){ return j !== p; });
  if(t === 'pr' && CJ.kind(v) === 'v1') autres.push(v.slice(0,-2)+(p===5?'e':'ent'));
  autres = ARC.uniq(autres).filter(function(x){ return x !== forme; });
  var pron = (t === 'sj' ? (/^(il|elle)/.test(pr.trim()) ? "qu'" : 'que ') : '') + pr.trim();
  var q = '<div class="cj-t">'+CJ.TNOM[t]+'</div><div class="cj-v">'+v+'</div><div class="cj-l">'+pron+' <span class="blank">?</span></div>';
  var acc = [forme, (pr.trim()==="j'" ? "j'" : pr) + forme];
  if((t === 'pc' || t === 'pqp' || t === 'fa') && CJ.aux(v) === 'être' && p !== 2 && p !== 5){
    var autreG = CJ.compose(v, t, p, !fem); acc.push(autreG, pr + autreG);
  }
  return ARC.text(q, forme, CJ.pourquoi(v, t, p, fem), code+'-'+t+'-'+v+'-'+p+(fem?'f':''), {o:[forme].concat(ARC.shuffle(autres).slice(0,3)), acc:acc, prefix:pron});
};
CJ.verbe = function(groupes){
  var pool = [];
  groupes.forEach(function(g){ pool = pool.concat(g === 'v1' ? CJ.V1 : g === 'v1s' ? CJ.V1S : g === 'v2' ? CJ.V2 : g === 'base' ? ['être','avoir','aller','faire'] : g === 'irr' ? Object.keys(CJ.IRR) : [g]); });
  return ARC.pick(pool);
};
