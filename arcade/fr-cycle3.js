/* Salle d'arcade — Français CM1, CM2, 6e (une notion par fiche du site) */
(function(){
var A = ARC, CJ = ARC.CJ, R = A.R, pick = A.pick, shuffle = A.shuffle, ch = A.choice, B = A.banque;
function N(code, classe, titre, gen){ A.notion(code, classe, 'fr', titre, gen); }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function homo(code, astuce, opts, items){
  return function(){
    var i = R(0, items.length-1), s = items[i][0], a = items[i][1], debut = /^___/.test(s);
    var c = function(x){ return debut ? cap(x) : x; };
    return ch('<span class="phr">'+s.replace('___','<span class="blank">?</span>')+'</span>', c(a), opts.map(c), astuce+'<br>On écrit : « '+s.replace('___','<b>'+c(a)+'</b>')+' »', code+'-'+i);
  };
}
var S = function(t){ return '<span class="phr">'+t+'</span>'; };

/* ─── Grammaire ─── */
N('G301','CM1','Le groupe nominal : noyau et expansions', B('G301', [
  ['Quel est le [[nom]] noyau ?<br>'+S('le petit chien de ma voisine'),'chien',['voisine','petit'],'Le mot principal, celui qu\'on ne peut pas supprimer, est <b>chien</b>. « petit » et « de ma voisine » le précisent.'],
  ['Quel est le nom noyau ?<br>'+S('une grande maison aux volets bleus'),'maison',['volets','grande'],'Le groupe parle d\'une <b>maison</b> : c\'est le noyau. « aux volets bleus » la précise.'],
  ['Dans « une robe <b>à fleurs</b> », « à fleurs » est…','un complément du nom',['un adjectif','le nom noyau'],'Il commence par une [[preposition]] (à) et complète le nom robe : c\'est un complément du nom.'],
  ['Dans « un chat <b>noir</b> », « noir » est…','un adjectif',['un complément du nom','un déterminant'],'Il dit comment est le chat : c\'est un [[adjectif]].'],
  ['Quel est le nom noyau ?<br>'+S('les jouets en bois de mon frère'),'jouets',['bois','frère'],'Ce sont les <b>jouets</b> dont on parle. « en bois » et « de mon frère » les précisent.'],
  ['Combien d\'expansions dans « un vieux livre de contes » ?','deux',['une','trois'],'« vieux » (adjectif) et « de contes » (complément du nom) : <b>deux</b> expansions.']
]));
N('G302','CM1','COD ou COI', B('G302', [
  ['Léa mange <b>une pomme</b>.','COD',['COI'],'Léa mange quoi ? Une pomme : pas de petit mot entre le verbe et le complément, c\'est un [[cod|COD]].'],
  ['Il parle <b>à son ami</b>.','COI',['COD'],'Il parle à qui ? Le complément commence par « à » : c\'est un [[coi|COI]].'],
  ['Nous regardons <b>le film</b>.','COD',['COI'],'Nous regardons quoi ? Le film : COD.'],
  ['Elle pense <b>à ses vacances</b>.','COI',['COD'],'Elle pense à quoi ? « à » relie le verbe au complément : COI.'],
  ['Tom écrit <b>une lettre</b>.','COD',['COI'],'Tom écrit quoi ? Une lettre : COD.'],
  ['Je me souviens <b>de cette histoire</b>.','COI',['COD'],'Je me souviens de quoi ? « de » : c\'est un COI.'],
  ['Le chat attrape <b>la souris</b>.','COD',['COI'],'Le chat attrape quoi ? La souris : COD.'],
  ['Tu obéis <b>à la maîtresse</b>.','COI',['COD'],'Tu obéis à qui ? COI.']
]));
N('G303','CM2','COD, COI ou complément circonstanciel', B('G303', [
  ['Il lit <b>un roman</b> le soir.','COD',['COI','CC'],'Il lit quoi ? Un roman : [[cod|COD]]. On ne peut pas le déplacer.'],
  ['Il lit un roman <b>le soir</b>.','CC',['COD','COI'],'Il lit quand ? Le soir : [[cc|complément circonstanciel]] de temps. On peut le déplacer : « Le soir, il lit un roman. »'],
  ['Elle téléphone <b>à sa grand-mère</b>.','COI',['COD','CC'],'Elle téléphone à qui ? [[coi|COI]].'],
  ['Les enfants jouent <b>dans la cour</b>.','CC',['COD','COI'],'Où ? Dans la cour : CC de lieu. On peut le supprimer.'],
  ['Nous préparons <b>un gâteau</b>.','COD',['COI','CC'],'Nous préparons quoi ? COD.'],
  ['Il parle <b>de son voyage</b>.','COI',['COD','CC'],'Il parle de quoi ? Le complément est relié par « de » et ne se déplace pas : COI.'],
  ['Elle marche <b>lentement</b>.','CC',['COD','COI'],'Comment ? Lentement : CC de manière.']
]));
N('G304','CM1','Les compléments circonstanciels', B('G304', [
  ['Dans « Il joue <b>dans le jardin</b> », c\'est un CC de…','lieu',['temps','manière'],'Il joue où ? Dans le jardin : [[cc|CC]] de lieu.'],
  ['Dans « <b>Demain</b>, nous partirons », c\'est un CC de…','temps',['lieu','manière'],'Quand ? Demain : CC de temps.'],
  ['Dans « Elle chante <b>avec joie</b> », c\'est un CC de…','manière',['lieu','temps'],'Comment ? Avec joie : CC de manière.'],
  ['Dans « Il dort <b>sous un arbre</b> », c\'est un CC de…','lieu',['manière','temps'],'Où ? Sous un arbre : CC de lieu.'],
  ['Dans « Ils sont arrivés <b>à midi</b> », c\'est un CC de…','temps',['lieu','manière'],'Quand ? À midi : CC de temps.'],
  ['Dans « Il court <b>très vite</b> », c\'est un CC de…','manière',['temps','lieu'],'Comment ? Très vite : CC de manière.']
]));
N('G305','CM2','Voix active ou voix passive', B('G305', [
  ['La souris est mangée par le chat.','voix passive',['voix active'],'Le sujet « la souris » subit l\'action : c\'est la [[voixpassive|voix passive]] (être + participe + par).'],
  ['Le chat mange la souris.','voix active',['voix passive'],'Le sujet « le chat » fait l\'action : voix active.'],
  ['Le gâteau a été préparé par papa.','voix passive',['voix active'],'Le gâteau subit l\'action : voix passive.'],
  ['Les élèves ont préparé un spectacle.','voix active',['voix passive'],'Le sujet fait l\'action : voix active, même avec un temps composé.'],
  ['Quelle phrase dit la même chose que « Le vent emporte les feuilles » ?','Les feuilles sont emportées par le vent.',['Les feuilles emportent le vent.','Le vent est emporté par les feuilles.'],'À la voix passive, le COD devient sujet et le sujet devient complément d\'agent avec « par ».'],
  ['Cette maison a été construite en 1900.','voix passive',['voix active'],'La maison subit l\'action : voix passive. Ici, on ne dit pas par qui.']
]));
N('G306','CM2','Proposition principale et subordonnée', B('G306', [
  ['Quelle est la [[subordonnee|subordonnée]] ?<br>'+S('Je pense que tu as raison.'),'que tu as raison',['Je pense','tu as raison'],'Elle commence par « que » et dépend de « Je pense » : c\'est la subordonnée.'],
  ['Quelle est la principale ?<br>'+S('Quand il pleut, nous restons à la maison.'),'nous restons à la maison',['Quand il pleut','il pleut'],'Elle peut exister seule : c\'est la proposition principale.'],
  ['Combien de [[proposition|propositions]] ?<br>'+S('Le garçon qui court est mon frère.'),'deux',['une','trois'],'Il y a deux verbes conjugués (court, est) : <b>deux</b> propositions.'],
  ['Quelle est la subordonnée ?<br>'+S('Le livre que je lis est passionnant.'),'que je lis',['Le livre','est passionnant'],'Elle commence par « que » et complète le nom livre : c\'est une subordonnée relative.'],
  ['Quelle est la principale ?<br>'+S('Je suis content parce que tu es venu.'),'Je suis content',['parce que tu es venu','tu es venu'],'« Je suis content » peut exister seul : principale.']
]));
N('G307','CM1','Les pronoms relatifs et démonstratifs', B('G307', [
  ['Complète : '+S('Le garçon <span class="blank">?</span> court est mon frère.'),'qui',['que','où'],'Le pronom remplace le sujet du verbe « court » : <b>qui</b>.'],
  ['Complète : '+S('La ville <span class="blank">?</span> j\'habite est petite.'),'où',['qui','que'],'Il s\'agit d\'un lieu : <b>où</b>.'],
  ['Complète : '+S('Le livre <span class="blank">?</span> je lis est drôle.'),'que',['qui','où'],'Le livre est le COD de « je lis » : <b>que</b>.'],
  ['« <b>celui-ci</b> » est un pronom…','démonstratif',['relatif','personnel'],'Il montre quelque chose : c\'est un pronom démonstratif.'],
  ['Dans « la fille <b>qui</b> chante », « qui » est un pronom…','relatif',['démonstratif','personnel'],'Il relie deux propositions et remplace « la fille » : pronom relatif.'],
  ['Complète : '+S('Prends ce crayon, pas <span class="blank">?</span>-là.'),'celui',['celle','ceux'],'Crayon est masculin singulier : <b>celui</b>.']
]));
N('G308','CM1','Les adverbes', B('G308', [
  ['Quel est l\'[[adverbe]] ?<br>'+S('Il court vite.'),'vite',['court','Il'],'<b>vite</b> précise le verbe court et ne change jamais : c\'est un adverbe.'],
  ['Quel est l\'adverbe ?<br>'+S('Elle est très gentille.'),'très',['gentille','est'],'<b>très</b> précise l\'adjectif gentille : adverbe.'],
  ['Quel adverbe vient de « lent » ?','lentement',['lenteur','lentille'],'On part du féminin « lente » et on ajoute -ment : <b>lentement</b>.'],
  ['Quel adverbe vient de « doux » ?','doucement',['douceur','doux'],'Féminin « douce » + -ment : <b>doucement</b>.'],
  ['Quel est l\'adverbe ?<br>'+S('Nous partirons demain.'),'demain',['partirons','Nous'],'<b>demain</b> dit quand : c\'est un adverbe de temps.'],
  ['Quel adverbe vient de « rapide » ?','rapidement',['rapidité','rapides'],'« rapide » + -ment : <b>rapidement</b>.']
]));
N('G309','CM2','Les prépositions', B('G309', [
  ['Quelle est la [[preposition]] ?<br>'+S('Il joue avec son chien.'),'avec',['son','joue'],'<b>avec</b> introduit le complément « son chien » : c\'est une préposition.'],
  ['Quelle est la préposition ?<br>'+S('Le chat dort sous la table.'),'sous',['la','dort'],'<b>sous</b> introduit « la table » : préposition.'],
  ['Quelle est la préposition ?<br>'+S('Elle part pour Paris.'),'pour',['part','Elle'],'<b>pour</b> introduit « Paris » : préposition.'],
  ['Quelle est la préposition ?<br>'+S('Une tasse de chocolat.'),'de',['tasse','Une'],'<b>de</b> relie tasse et chocolat : préposition.'],
  ['Laquelle n\'est PAS une préposition ?','vite',['dans','sur'],'<b>vite</b> est un adverbe. Dans et sur sont des prépositions.']
]));

/* ─── Conjugaison ─── */
var G3 = ['v1','v1s','v2','base','irr'];
N('C301','CM1','L\'imparfait', function(){ return CJ.question(CJ.verbe(G3), 'im', R(0,5), 'C301', Math.random() < .5); });
N('C302','CM1','Le passé composé', function(){ return CJ.question(CJ.verbe(['v1','v2','irr','arriver','tomber','rester','entrer']), 'pc', R(0,5), 'C302', Math.random() < .5); });
N('C304','CM1','Le futur simple', function(){ return CJ.question(CJ.verbe(G3), 'fu', R(0,5), 'C304', Math.random() < .5); });
N('C305','CM2','Le conditionnel présent', function(){ return CJ.question(CJ.verbe(G3), 'co', R(0,5), 'C305', Math.random() < .5); });
N('C306','CM2','Le passé simple', function(d){ return CJ.question(CJ.verbe(G3), 'ps', d >= 3 ? R(0,5) : pick([2,5]), 'C306', Math.random() < .5); });
N('C307','6e','Le subjonctif présent', function(){
  var it = CJ.question(CJ.verbe(['v1','v2','irr']), 'sj', R(0,5), 'C307', Math.random() < .5);
  it.q = it.q.replace('<div class="cj-t">subjonctif présent</div>', '<div class="cj-t">subjonctif présent</div><div class="muted">Il faut…</div>');
  return it;
});
N('C303','CM1','Imparfait ou passé composé', B('C303', [
  [S('Il <span class="blank">?</span> quand le téléphone a sonné.')+'<div class="muted">(dormir)</div>','dormait',['a dormi'],'L\'action dure, elle sert de décor : <b>imparfait</b>. L\'action soudaine (a sonné) est au passé composé.'],
  [S('Hier, nous <span class="blank">?</span> au cinéma.')+'<div class="muted">(aller)</div>','sommes allés',['allions'],'Une action précise et terminée, hier : <b>passé composé</b>.'],
  [S('Quand j\'étais petit, je <span class="blank">?</span> au parc tous les jours.')+'<div class="muted">(jouer)</div>','jouais',['ai joué'],'« tous les jours » : une habitude dans le passé, donc l\'<b>imparfait</b>.'],
  [S('Soudain, la porte <span class="blank">?</span>.')+'<div class="muted">(claquer)</div>','a claqué',['claquait'],'« Soudain » annonce une action brève : <b>passé composé</b>.'],
  [S('Le ciel <span class="blank">?</span> gris ce matin-là.')+'<div class="muted">(être)</div>','était',['a été'],'C\'est une description : <b>imparfait</b>.'],
  [S('Ce matin, Léa <span class="blank">?</span> son vélo.')+'<div class="muted">(réparer)</div>','a réparé',['réparait'],'Une action précise et terminée : <b>passé composé</b>.']
]));
function accordPP(code){ return B(code, [
  [S('Les filles sont <span class="blank">?</span> tôt.')+'<div class="muted">(partir)</div>','parties',['partis','parti'],'Avec l\'[[auxiliaire]] <b>être</b>, le participe s\'accorde avec le sujet « les filles » (féminin pluriel) : <b>parties</b>.'],
  [S('Elles ont <span class="blank">?</span> une pizza.')+'<div class="muted">(manger)</div>','mangé',['mangées','mangés'],'Avec <b>avoir</b>, le participe ne s\'accorde pas avec le sujet : <b>mangé</b>.'],
  [S('Ma sœur est <span class="blank">?</span> à l\'heure.')+'<div class="muted">(arriver)</div>','arrivée',['arrivé','arrivés'],'Avec être, accord avec « ma sœur » (féminin singulier) : <b>arrivée</b>.'],
  [S('Les garçons sont <span class="blank">?</span> dans l\'eau.')+'<div class="muted">(tomber)</div>','tombés',['tombé','tombées'],'Avec être, accord avec « les garçons » (masculin pluriel) : <b>tombés</b>.'],
  [S('Nous avons <span class="blank">?</span> nos devoirs.')+'<div class="muted">(finir)</div>','fini',['finis','finies'],'Avec avoir, pas d\'accord avec le sujet : <b>fini</b>.'],
  [S('La lettre est <span class="blank">?</span> hier.')+'<div class="muted">(arriver)</div>','arrivée',['arrivé','arrivées'],'Avec être, accord avec « la lettre » : <b>arrivée</b>.'],
  [S('Mes cousines ont <span class="blank">?</span> une chanson.')+'<div class="muted">(chanter)</div>','chanté',['chantées','chantés'],'Avec avoir, le participe reste au masculin singulier : <b>chanté</b>.']
]); }
N('C308','CM2','Accord du participe passé : les règles de base', accordPP('C308'));
N('C309','CM2','Accord du participe passé : être ou avoir', accordPP('C309'));

/* ─── Orthographe ─── */
N('O301','CM1','ces, ses, c\'est, s\'est', homo('O301', 'Au singulier : <b>ces</b> → ce/cette (on montre), <b>ses</b> → son/sa (à lui), <b>c\'est</b> → cela est, <b>s\'est</b> se met devant un participe (il s\'est levé).', ['ces','ses',"c'est","s'est"], [
  ['Regarde ___ beaux nuages !','ces'],['Il range ___ affaires.','ses'],['___ mon meilleur ami.',"c'est"],['Elle ___ coupée au doigt.',"s'est"],['___ chaussures sont à qui ?','ces'],['Léa promène ___ chiens.','ses'],['Il ___ levé tôt.',"s'est"],['___ très difficile.',"c'est"]]));
N('O302','CM1','leur ou leurs', homo('O302', '<b>leur</b> devant un verbe veut dire « à eux » et ne prend jamais de s. Devant un nom, il s\'accorde : <b>leurs</b> si le nom est au pluriel.', ['leur','leurs'], [
  ['Je ___ donne un cadeau.','leur'],['Ils promènent ___ chiens.','leurs'],['Elles ont oublié ___ parapluie.','leur'],['Je ___ ai écrit une lettre.','leur'],['Les élèves rangent ___ cahiers.','leurs'],['Nous ___ parlons souvent.','leur']]));
N('O303','CM1','ou ou où', homo('O303', 'Remplace par <b>ou bien</b> : si ça marche, c\'est <b>ou</b>. Sinon, c\'est <b>où</b>, qui indique le lieu ou le moment.', ['ou','où'], [
  ['Tu veux du lait ___ du jus ?','ou'],['___ habites-tu ?','où'],['La ville ___ je suis né est loin.','où'],['Viens lundi ___ mardi.','ou'],['Je ne sais pas ___ est mon stylo.','où'],['Rouge ___ bleu, choisis !','ou']]));
N('O304','CM2','mais ou mes', homo('O304', '<b>mes</b> → mon, ma (à moi). <b>mais</b> veut dire « pourtant » : on peut le remplacer par <b>pourtant</b>.', ['mais','mes'], [
  ['J\'ai rangé ___ jouets.','mes'],['Il fait beau, ___ il fait froid.','mais'],['___ amis arrivent ce soir.','mes'],['Je voulais venir, ___ j\'étais malade.','mais'],['Où sont ___ chaussures ?','mes'],['C\'est loin, ___ on y va à pied.','mais']]));
N('O305','CM2','quand, quant, qu\'en', homo('O305', '<b>quand</b> → lorsque (le moment). <b>quant</b> s\'emploie seulement dans « quant à » (en ce qui concerne). <b>qu\'en</b> = que + en.', ['quand','quant',"qu'en"], [
  ['___ il pleut, je prends un parapluie.','quand'],['___ à moi, je reste ici.','quant'],['Je ne sais pas ___ penser.',"qu'en"],['Dis-moi ___ tu arrives.','quand'],['___ à ton frère, il viendra demain.','quant'],['Il ne parle ___ anglais.',"qu'en"],['___ penses-tu ?',"qu'en"]]));
N('O306','CM1','L\'accord de l\'adjectif qualificatif', function(){
  var NOMS = [['fleur','f'],['robe','f'],['voiture','f'],['maison','f'],['ballon','m'],['chat','m'],['cahier','m'],['jardin','m']];
  var ADJ = [['vert','verte','verts','vertes'],['bleu','bleue','bleus','bleues'],['noir','noire','noirs','noires'],['gris','grise','gris','grises'],['blanc','blanche','blancs','blanches'],['neuf','neuve','neufs','neuves'],['rond','ronde','ronds','rondes']];
  var n = pick(NOMS), a = pick(ADJ), pl = Math.random() < .55, f = n[1] === 'f', forme = a[(f?1:0)+(pl?2:0)], det = pl ? 'des' : (f ? 'une' : 'un');
  var e = '« '+n[0]+' » est '+(f?'féminin':'masculin')+' '+(pl?'pluriel':'singulier')+' : l\'[[adjectif]] s\'accorde en genre et en nombre, <b>'+forme+'</b>.';
  if(a[0] === 'blanc' && f) e += ' Attention : blanc devient blanche au féminin.';
  if(a[0] === 'neuf' && f) e += ' Attention : neuf devient neuve au féminin.';
  return A.text('Accorde l\'adjectif <b>'+a[0]+'</b> :<br>'+det+' '+n[0]+(pl?'s':'')+' <span class="blank">?</span>', forme, e, 'O306-'+n[0]+a[0]+(pl?'p':''), {o:A.uniq(a)});
});
N('O307','CM2','L\'accord du verbe avec un sujet éloigné', B('O307', [
  [S('Les enfants du voisin <span class="blank">?</span> dehors.'),'jouent',['joue'],'Qui est-ce qui joue ? <b>Les enfants</b> (pluriel), pas « le voisin ».'],
  [S('Dans la forêt <span class="blank">?</span> des loups.'),'vivent',['vit'],'Le sujet est après le verbe. Qui est-ce qui vit ? <b>des loups</b>.'],
  [S('La maîtresse les <span class="blank">?</span>.'),'appelle',['appellent'],'« les » n\'est pas le sujet. Qui est-ce qui appelle ? <b>la maîtresse</b>.'],
  [S('Le chien de mes cousins <span class="blank">?</span>.'),'aboie',['aboient'],'Qui est-ce qui aboie ? <b>Le chien</b> (singulier).'],
  [S('Où <span class="blank">?</span> les oiseaux en hiver ?'),'vont',['va'],'Dans une question, le sujet peut être après le verbe : <b>les oiseaux</b> vont.'],
  [S('Chaque élève <span class="blank">?</span> un livre.'),'prend',['prennent'],'« Chaque » veut dire un seul : singulier.'],
  [S('Toi et moi <span class="blank">?</span> au cinéma.'),'allons',['allez','vont'],'Toi et moi = <b>nous</b>.'],
  [S('Les feuilles de l\'arbre <span class="blank">?</span>.'),'tombent',['tombe'],'Qui est-ce qui tombe ? <b>Les feuilles</b>.'],
  [S('Le maître leur <span class="blank">?</span> des devoirs.'),'donne',['donnent'],'« leur » n\'est pas le sujet. Qui donne ? <b>le maître</b>.']
]));
var DOUBLE = [['ba___on','🎈','ll','l','ballon'],['po___e','🍎','mm','m','pomme'],['caro___e','🥕','tt','t','carotte'],['gira___e','🦒','f','ff','girafe'],['le___re','✉️','tt','t','lettre'],['lune___es','👓','tt','t','lunettes'],['mou___on','🐑','t','tt','mouton'],['ca___ard','🦆','n','nn','canard'],['to___ate','🍅','m','mm','tomate'],['tro___ette','🛴','tt','t','trottinette']];
N('O308','CM1','Les consonnes doubles', function(){
  var i = R(0, DOUBLE.length-1), w = DOUBLE[i];
  return ch('Complète : <b>'+w[0].replace('___','<span class="blank">?</span>')+'</b> '+w[1], w[2], [w[2], w[3]], 'On écrit <b>'+w[4]+'</b>. Les consonnes doubles ne s\'entendent pas : il faut retenir l\'orthographe du mot.', 'O308-'+i);
});
N('O309','CM1','Les finales -é, -er, -ez, -ée', B('O309', [
  [S('Il a mang<span class="blank">?</span> sa soupe.'),'é',['er','ez'],'Remplace par <b>vendu</b> : « il a vendu » marche, donc c\'est le participe <b>é</b>.'],
  [S('Je vais mang<span class="blank">?</span>.'),'er',['é','ez'],'Remplace par <b>vendre</b> : « je vais vendre » marche, donc c\'est l\'infinitif <b>er</b>.'],
  [S('Vous jou<span class="blank">?</span> très bien.'),'ez',['er','é'],'Avec <b>vous</b>, le verbe se termine par <b>-ez</b>.'],
  [S('Elle est arriv<span class="blank">?</span> en retard.'),'ée',['é','er'],'Avec être, le participe s\'accorde avec « elle » : <b>ée</b>.'],
  [S('Il faut travaill<span class="blank">?</span>.'),'er',['é','ée'],'« il faut vendre » : infinitif <b>er</b>.'],
  [S('Tu as regard<span class="blank">?</span> le film ?'),'é',['er','ez'],'« tu as vendu » : participe <b>é</b>.'],
  [S('La porte est ferm<span class="blank">?</span>.'),'ée',['é','er'],'Le participe s\'accorde avec « la porte » (féminin) : <b>ée</b>.'],
  [S('Il commence à pleur<span class="blank">?</span>.'),'er',['é','ez'],'« il commence à vendre » : infinitif <b>er</b>.']
]));

/* ─── Lexique ─── */
N('L301','CM1','Les préfixes et suffixes latins et grecs', B('L301', [
  ['Dans « <b>bi</b>cyclette », « bi- » veut dire…','deux',['vélo','rapide'],'« bi- » vient du latin et veut dire <b>deux</b> : une bicyclette a deux roues.'],
  ['Dans « <b>télé</b>phone », « télé- » veut dire…','loin',['voix','image'],'« télé- » veut dire <b>loin</b> : le téléphone porte la voix au loin.'],
  ['Dans « <b>micro</b>scope », « micro- » veut dire…','petit',['grand','loin'],'« micro- » veut dire <b>petit</b>.'],
  ['Dans « <b>hydr</b>avion », « hydr- » veut dire…','eau',['air','feu'],'« hydr- » veut dire <b>eau</b> : un hydravion se pose sur l\'eau.'],
  ['Dans « <b>géo</b>graphie », « géo- » veut dire…','terre',['carte','pays'],'« géo- » veut dire <b>terre</b>.'],
  ['Dans « bio<b>logie</b> », « -logie » veut dire…','étude, science',['vie','livre'],'« -logie » veut dire <b>étude</b>. La biologie est l\'étude de la vie.'],
  ['Dans « <b>auto</b>portrait », « auto- » veut dire…','soi-même',['voiture','vite'],'« auto- » veut dire <b>soi-même</b> : un autoportrait, c\'est un portrait de soi.']
]));
N('L302','CM2','L\'étymologie', B('L302', [
  ['« vélo » est l\'abréviation de…','vélocipède',['vélodrome','véloce'],'On a raccourci <b>vélocipède</b>, un mot du XIXe siècle.'],
  ['« bus » vient du mot…','omnibus',['autobus scolaire','busard'],'Le bus vient de l\'<b>omnibus</b>, une voiture « pour tous » en latin.'],
  ['« dinosaure » veut dire…','lézard terrible',['grand animal','vieux reptile'],'Du grec <em>deinos</em> (terrible) et <em>sauros</em> (lézard).'],
  ['« hippopotame » veut dire…','cheval du fleuve',['gros animal','animal de l\'eau'],'Du grec <em>hippos</em> (cheval) et <em>potamos</em> (fleuve).'],
  ['« métro » est l\'abréviation de…','métropolitain',['métronome','mètre'],'On a raccourci « chemin de fer <b>métropolitain</b> ».'],
  ['« photo » est l\'abréviation de…','photographie',['photocopie','photon'],'<b>photographie</b> : « écrire avec la lumière » en grec.']
]));
N('L303','CM1','Les niveaux de langue', B('L303', [
  ['« bagnole » appartient au langage…','familier',['courant','soutenu'],'On l\'emploie entre amis : langage familier. En langage courant, on dit « voiture ».'],
  ['« demeure » appartient au langage…','soutenu',['familier','courant'],'C\'est un mot recherché pour dire « maison » : langage soutenu.'],
  ['« chaussures » appartient au langage…','courant',['familier','soutenu'],'C\'est le mot de tous les jours : langage courant. En familier, on dit « godasses ».'],
  ['« bouquin » appartient au langage…','familier',['courant','soutenu'],'Familier pour « livre ».'],
  ['Quel mot est du langage soutenu ?','s\'entretenir',['bavarder','tchatcher'],'<b>s\'entretenir</b> est soutenu, bavarder est courant, tchatcher est familier.'],
  ['« J\'ai la trouille » est du langage…','familier',['courant','soutenu'],'Familier pour « j\'ai peur ».']
]));
N('L304','CM2','Métaphore ou comparaison', B('L304', [
  ['« Ses yeux brillent comme des étoiles. »','comparaison',['métaphore'],'Il y a un outil de comparaison, <b>comme</b> : c\'est une comparaison.'],
  ['« Cet homme est un lion. »','métaphore',['comparaison'],'On rapproche l\'homme et le lion sans outil : c\'est une métaphore.'],
  ['« Elle est rapide tel un guépard. »','comparaison',['métaphore'],'L\'outil <b>tel</b> sert à comparer : comparaison.'],
  ['« La mer est un miroir. »','métaphore',['comparaison'],'Pas d\'outil de comparaison : métaphore.'],
  ['« Il est fort comme un bœuf. »','comparaison',['métaphore'],'L\'outil <b>comme</b> : comparaison.'],
  ['« Ce bébé est un ange. »','métaphore',['comparaison'],'Rapprochement direct, sans outil : métaphore.']
]));
N('L305','CM2','Les champs lexicaux', B('L305', [
  ['Quel mot n\'appartient pas au champ lexical de la <b>mer</b> ?','montagne',['vague','plage'],'Vague et plage parlent de la mer, pas <b>montagne</b>.'],
  ['Quel mot appartient au champ lexical de l\'<b>école</b> ?','cartable',['oreiller','casserole'],'Le <b>cartable</b> se rapporte à l\'école.'],
  ['Quel mot n\'appartient pas au champ lexical de la <b>peur</b> ?','joie',['frisson','terreur'],'<b>joie</b> n\'exprime pas la peur.'],
  ['Quel mot appartient au champ lexical du <b>sport</b> ?','arbitre',['pinceau','farine'],'L\'<b>arbitre</b> se rapporte au sport.'],
  ['Quel mot n\'appartient pas au champ lexical de l\'<b>hiver</b> ?','plage',['neige','gel'],'Neige et gel parlent de l\'hiver, pas <b>plage</b>.']
]));
N('L306','CM2','La polysémie', B('L306', [
  ['« La <b>souris</b> de l\'ordinateur ne marche plus. » Ici, souris veut dire…','un objet pour cliquer',['un petit animal','une couleur grise'],'Un mot peut avoir plusieurs sens : c\'est la polysémie. Ici, le contexte parle de l\'ordinateur.'],
  ['« Il a mal à la <b>tête</b>. » Ici, tête veut dire…','une partie du corps',['le premier de la course','le haut d\'un clou'],'Le contexte (avoir mal) indique la partie du corps.'],
  ['« Elle est en <b>tête</b> de la course. » Ici, tête veut dire…','la première place',['une partie du corps','le visage'],'Être en tête, c\'est être le premier.'],
  ['« Le <b>pied</b> de la table est cassé. » Ici, pied veut dire…','le support',['une partie du corps','une unité de mesure'],'Le pied d\'une table la fait tenir debout.'],
  ['« Il a pris une bonne <b>note</b>. » Ici, note veut dire…','un résultat scolaire',['un son de musique','un petit mot écrit'],'Le contexte de l\'école indique une évaluation.']
]));
})();
