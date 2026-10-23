/* Salle d'arcade — Français CP, CE1, CE2 (une notion par fiche du site) */
(function(){
var A = ARC, CJ = ARC.CJ, R = A.R, pick = A.pick, shuffle = A.shuffle, ch = A.choice, B = A.banque;
function N(code, classe, titre, gen){ A.notion(code, classe, 'fr', titre, gen); }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ─── CP ─── */
var PHRASES_CP = ['Le chat dort.','Léo mange une pomme.','Il pleut.','Maman lit un livre.','Le chien court vite.','Nina joue au ballon.','Papa fait un gâteau.','Le bébé rit.','Tom range sa chambre.','La lune brille.','Le train arrive.','Je bois du lait.'];
N('G01','CP','La phrase : majuscule et point', function(){
  var i = R(0, PHRASES_CP.length-1), p = PHRASES_CP[i];
  var sansMaj = p.charAt(0).toLowerCase() + p.slice(1), sansPoint = p.slice(0,-1);
  return ch('Quelle phrase est bien écrite ?', p, [p, sansMaj, sansPoint], 'Une phrase commence par une <b>majuscule</b> et se termine par un <b>point</b>.', 'G01-'+i, {big:false});
});
var PROPRES = ['Paris','Léa','Médor','Lucas','France','Marseille','Nina','Minou'], COMMUNS = ['un chien','une table','une ville','une fille','une maison','un ballon','une fleur','une école'];
N('G04','CP','Nom commun ou nom propre', function(){
  var propre = Math.random() < .5, gn = pick(propre ? PROPRES : COMMUNS), m = propre ? gn : gn.split(' ')[1];
  return ch('« <b>'+m+'</b> » est un…', propre ? 'nom propre' : 'nom commun', ['nom propre','nom commun'],
    propre ? '<b>'+m+'</b> est le nom d\'une personne, d\'un animal ou d\'un lieu précis : c\'est un nom propre. Il commence toujours par une majuscule.'
           : '<b>'+m+'</b> désigne n\'importe quel objet ou être de cette sorte : c\'est un nom commun. On peut dire « '+gn+' ».', 'G04-'+m);
});
var GENRE = [['table','f'],['chaise','f'],['vélo','m'],['pomme','f'],['livre','m'],['fleur','f'],['camion','m'],['maison','f'],['ballon','m'],['tortue','f'],['lapin','m'],['poupée','f'],['crayon','m'],['voiture','f'],['gâteau','m'],['robe','f']];
N('G05','CP','Masculin ou féminin', function(){
  var i = R(0, GENRE.length-1), w = GENRE[i], f = w[1] === 'f';
  return ch('On dit <b>un</b> ou <b>une</b> ?<br><span class="blank">?</span> '+w[0], f ? 'une' : 'un', ['un','une'],
    'On dit <b>'+(f?'une':'un')+' '+w[0]+'</b> : « '+w[0]+' » est un nom '+(f?'féminin':'masculin')+'.', 'G05-'+i);
});
var NOMBRE = [['le chat','s'],['les chats','p'],['une fleur','s'],['des fleurs','p'],['la poule','s'],['les poules','p'],['un ballon','s'],['des ballons','p'],['mon livre','s'],['mes livres','p'],['des souris','p'],['une souris','s']];
N('G06','CP','Singulier ou pluriel', function(){
  var i = R(0, NOMBRE.length-1), w = NOMBRE[i], pl = w[1] === 'p';
  var e = pl ? 'Le petit mot <b>'+w[0].split(' ')[0]+'</b> montre qu\'il y en a plusieurs : c\'est le pluriel.' : 'Le petit mot <b>'+w[0].split(' ')[0]+'</b> montre qu\'il n\'y en a qu\'un : c\'est le singulier.';
  if(/souris/.test(w[0])) e += ' Attention, « souris » finit toujours par un s : il faut regarder le petit mot devant.';
  return ch('« <b>'+w[0]+'</b> », c\'est…', pl ? 'pluriel' : 'singulier', ['singulier','pluriel'], e, 'G06-'+i);
});
var VERBES_CP = [['Le chien court.','court'],['Léa chante.','chante'],['Le bébé dort.','dort'],['Tom saute.','saute'],['Papa cuisine.','cuisine'],['Le chat mange.','mange'],['Nina dessine.','dessine'],['Le loup hurle.','hurle'],['Je lis.','lis'],['Les oiseaux volent.','volent']];
N('G13','CP','Trouver le verbe', function(){
  var i = R(0, VERBES_CP.length-1), b = VERBES_CP[i], mots = b[0].replace('.','').split(' ');
  return ch('Quel est le verbe ?<br><span class="phr">'+b[0]+'</span>', b[1], A.uniq(mots), 'Le [[verbe]] dit ce que l\'on fait. On peut dire « hier, … » devant la phrase : c\'est le mot qui change. Ici : <b>'+b[1]+'</b>.', 'G13-'+i);
});
var FEM = [['ami','amie'],['voisin','voisine'],['cousin','cousine'],['marchand','marchande'],['petit','petite'],['grand','grande'],['gris','grise'],['blond','blonde']];
N('O01','CP','La marque du féminin : le -e', function(){
  var i = R(0, FEM.length-1), w = FEM[i];
  return ch('Au féminin, « '+w[0]+' » devient…', w[1], [w[1], w[0], w[0]+'s'], 'Au féminin, on ajoute souvent un <b>-e</b> à la fin : '+w[0]+' → <b>'+w[1]+'</b>.', 'O01-'+i);
});
var PLUR = ['chat','ballon','fleur','arbre','livre','poule','pomme','vélo','crayon','fille'];
N('O02','CP','La marque du pluriel : le -s', function(){
  var w = pick(PLUR);
  return ch('un '+w+' → des <span class="blank">?</span>', w+'s', [w+'s', w, w+'e'], 'Au pluriel, on ajoute un <b>-s</b> à la fin du nom : des <b>'+w+'s</b>. Il ne s\'entend pas, mais il s\'écrit.', 'O02-'+w);
});

/* ─── CE1 ─── */
N('G02','CE1','Phrase déclarative ou interrogative', B('G02', [
  ['« Est-ce que tu viens au parc ? »','interrogative',['déclarative'],'Elle pose une question et se termine par un <b>?</b> : c\'est une phrase interrogative.'],
  ['« Mon frère a sept ans. »','déclarative',['interrogative'],'Elle donne une information et se termine par un point : c\'est une phrase déclarative.'],
  ['« Où est ton cartable ? »','interrogative',['déclarative'],'Elle pose une question et se termine par un <b>?</b> : c\'est une phrase interrogative.'],
  ['« Il fait beau aujourd\'hui. »','déclarative',['interrogative'],'Elle raconte quelque chose et se termine par un point : c\'est une phrase déclarative.'],
  ['« Veux-tu du chocolat ? »','interrogative',['déclarative'],'Elle pose une question : c\'est une phrase interrogative.'],
  ['« Le chat dort sur le lit. »','déclarative',['interrogative'],'Elle donne une information : c\'est une phrase déclarative.'],
  ['« Quand part le train ? »','interrogative',['déclarative'],'Elle pose une question et se termine par un <b>?</b> : c\'est une phrase interrogative.']
]));
N('G03','CE1','Phrase exclamative ou impérative', B('G03', [
  ['« Range ta chambre. »','impérative',['exclamative'],'Elle donne un ordre : c\'est une phrase impérative.'],
  ['« Quelle belle journée ! »','exclamative',['impérative'],'Elle montre un sentiment fort (la joie, la surprise) : c\'est une phrase exclamative.'],
  ['« Ferme la porte, s\'il te plaît. »','impérative',['exclamative'],'Elle demande de faire quelque chose : c\'est une phrase impérative.'],
  ['« Comme tu as grandi ! »','exclamative',['impérative'],'Elle exprime la surprise : c\'est une phrase exclamative.'],
  ['« Viens ici tout de suite ! »','impérative',['exclamative'],'Elle donne un ordre, même si elle finit par un point d\'exclamation : c\'est une phrase impérative.'],
  ['« Que ce gâteau est bon ! »','exclamative',['impérative'],'Elle exprime un sentiment : c\'est une phrase exclamative.'],
  ['« Lave-toi les mains. »','impérative',['exclamative'],'Elle donne un ordre : c\'est une phrase impérative.']
]));
var ART = [['arbre','m',1],['école','f',1],['chat','m'],['table','f'],['oiseau','m',1],['maison','f'],['ami','m',1],['vélo','m'],['étoile','f',1],['lune','f'],['ours','m',1],['jardin','m']];
N('G07','CE1','Les articles le, la, l\', les', function(){
  var i = R(0, ART.length-1), w = ART[i], plur = Math.random() < .25;
  var a = plur ? 'les' : w[2] ? "l'" : w[1] === 'f' ? 'la' : 'le';
  var mot = plur ? w[0] + (/s$/.test(w[0]) ? '' : w[0] === 'oiseau' ? 'x' : 's') : w[0];
  var e = plur ? 'Il y en a plusieurs : on écrit <b>les</b>.' : w[2] ? 'Devant une voyelle, <b>le</b> ou <b>la</b> devient <b>l\'</b> : l\''+w[0]+'.' : 'On dit <b>'+a+' '+w[0]+'</b> : c\'est un nom '+(w[1]==='f'?'féminin':'masculin')+'.';
  return ch('Choisis l\'article :<br><span class="blank">?</span> '+mot, a, ['le','la',"l'",'les'], e, 'G07-'+i+(plur?'p':''));
});
var GN_ART = [['une pomme','une','indéfini'],['le cartable','le','défini'],['des billes','des','indéfini'],['la maîtresse','la','défini'],['un renard','un','indéfini'],['les nuages','les','défini'],['l\'avion',"l'",'défini'],['une souris','une','indéfini']];
N('G08','CE1','Articles définis et indéfinis', function(){
  var i = R(0, GN_ART.length-1), w = GN_ART[i];
  return ch('Dans « '+w[0]+' », <b>'+w[1]+'</b> est un article…', w[2], ['défini','indéfini'], 'Les articles définis sont <b>le, la, l\', les</b>. Les articles indéfinis sont <b>un, une, des</b>.', 'G08-'+i);
});
var ADJ_GN = [['un gros chien','gros'],['une robe rouge','rouge'],['un petit lapin','petit'],['une maison blanche','blanche'],['un vieux château','vieux'],['une jolie fleur','jolie'],['un ciel bleu','bleu'],['une soupe chaude','chaude']];
N('G09','CE1','L\'adjectif qualificatif', function(){
  var i = R(0, ADJ_GN.length-1), w = ADJ_GN[i], mots = w[0].split(' ');
  return ch('Quel est l\'adjectif dans « '+w[0]+' » ?', w[1], mots, 'L\'[[adjectif]] dit comment est le nom. Comment est-il ? <b>'+w[1]+'</b>.', 'G09-'+i);
});
/* Accord dans le groupe nominal : nom + adjectif placé après */
var NOMS_GN = [['fleur','f'],['robe','f'],['voiture','f'],['chemise','f'],['ballon','m'],['chat','m'],['crayon','m'],['pantalon','m'],['pomme','f'],['nuage','m']];
var ADJ = [['vert','verte','verts','vertes'],['bleu','bleue','bleus','bleues'],['noir','noire','noirs','noires'],['rond','ronde','ronds','rondes'],['gris','grise','gris','grises'],['joli','jolie','jolis','jolies'],['grand','grande','grands','grandes']];
function accordGN(code, texte){
  return function(){
    var n = pick(NOMS_GN), a = pick(ADJ), pl = Math.random() < .55, f = n[1] === 'f';
    var forme = a[(f?1:0) + (pl?2:0)], det = pl ? 'des' : (f ? 'une' : 'un');
    var avant = (a[0] === 'joli' || a[0] === 'grand');
    var gn = avant ? det+' <span class="blank">?</span> '+n[0]+(pl?'s':'') : det+' '+n[0]+(pl?'s':'')+' <span class="blank">?</span>';
    var e = '« '+n[0]+' » est '+(f?'féminin':'masculin')+' et '+(pl?'pluriel':'singulier')+' : l\'[[adjectif]] s\'accorde, on écrit <b>'+forme+'</b>.';
    var it = ch('Accorde l\'adjectif <b>'+a[0]+'</b> :<br>'+gn, forme, A.uniq(a), e, code+'-'+n[0]+a[0]+(pl?'p':''));
    if(texte){ it.t = 'text'; }
    return it;
  };
}
N('G10','CE1','L\'accord dans le groupe nominal', accordGN('G10', false));
N('G12','CE1','Les pronoms personnels sujets', B('G12', [
  ['Remplace « <b>Léa et moi</b> » par un pronom.','nous',['vous','ils'],'Quand je parle de moi avec quelqu\'un d\'autre, je dis <b>nous</b>.'],
  ['Remplace « <b>le chat</b> » par un pronom.','il',['elle','ils'],'« Le chat » est masculin singulier : <b>il</b>.'],
  ['Remplace « <b>les filles</b> » par un pronom.','elles',['ils','elle'],'« Les filles » est féminin pluriel : <b>elles</b>.'],
  ['Remplace « <b>Tom et Léo</b> » par un pronom.','ils',['elles','nous'],'Plusieurs garçons : <b>ils</b>.'],
  ['Remplace « <b>toi et ton frère</b> » par un pronom.','vous',['nous','ils'],'Quand je parle à plusieurs personnes, je dis <b>vous</b>.'],
  ['Remplace « <b>ma mère</b> » par un pronom.','elle',['il','elles'],'« Ma mère » est féminin singulier : <b>elle</b>.'],
  ['Remplace « <b>les oiseaux</b> » par un pronom.','ils',['elles','il'],'« Les oiseaux » est masculin pluriel : <b>ils</b>.']
]));
N('G14','CE1','Trouver le sujet du verbe', B('G14', [
  ['Quel est le [[sujet]] ?<br><span class="phr">Le petit chat boit du lait.</span>','Le petit chat',['du lait','boit'],'Qui est-ce qui boit ? <b>Le petit chat</b>. C\'est le sujet.'],
  ['Quel est le sujet ?<br><span class="phr">Mes cousins arrivent ce soir.</span>','Mes cousins',['ce soir','arrivent'],'Qui est-ce qui arrive ? <b>Mes cousins</b>.'],
  ['Quel est le sujet ?<br><span class="phr">Dans la cour, les enfants jouent.</span>','les enfants',['Dans la cour','jouent'],'Qui est-ce qui joue ? <b>les enfants</b>. Le sujet n\'est pas toujours au début.'],
  ['Quel est le sujet ?<br><span class="phr">Léa range ses jouets.</span>','Léa',['ses jouets','range'],'Qui est-ce qui range ? <b>Léa</b>.'],
  ['Quel est le sujet ?<br><span class="phr">Le vent souffle fort.</span>','Le vent',['fort','souffle'],'Qui est-ce qui souffle ? <b>Le vent</b>.'],
  ['Quel est le sujet ?<br><span class="phr">Ce matin, papa prépare le petit déjeuner.</span>','papa',['Ce matin','le petit déjeuner'],'Qui est-ce qui prépare ? <b>papa</b>.']
]));
N('G15','CE1','L\'accord sujet-verbe', B('G15', [
  ['Les enfants <span class="blank">?</span> dans le jardin.','jouent',['joue'],'Le sujet « les enfants » est au pluriel : le verbe prend <b>-ent</b>.'],
  ['Le chien <span class="blank">?</span> la balle.','attrape',['attrapent'],'Le sujet « le chien » est au singulier : <b>attrape</b>.'],
  ['Mes amies <span class="blank">?</span> une chanson.','chantent',['chante'],'Le sujet « mes amies » est au pluriel : <b>chantent</b>.'],
  ['Tu <span class="blank">?</span> un dessin.','dessines',['dessine','dessinent'],'Avec <b>tu</b>, le verbe finit par -s : tu dessines.'],
  ['Nous <span class="blank">?</span> au parc.','marchons',['marche','marchez'],'Avec <b>nous</b>, le verbe finit par -ons.'],
  ['Les oiseaux <span class="blank">?</span> haut.','volent',['vole'],'Le sujet « les oiseaux » est au pluriel : <b>volent</b>.'],
  ['Ma sœur <span class="blank">?</span> un livre.','regarde',['regardent'],'Le sujet « ma sœur » est au singulier : <b>regarde</b>.']
]));
N('C01','CE1','L\'infinitif et le verbe conjugué', function(){
  var v = CJ.verbe(['v1','v2']), f = CJ.formes(v,'pr');
  return ch('Quel verbe est à l\'[[infinitif]] ?', v, [v, f[2], f[5]], '<b>'+v+'</b> n\'est pas conjugué : on le trouve ainsi dans le dictionnaire. Il ne change pas selon la personne.', 'C01-'+v);
});
N('C02','CE1','Le présent de être et avoir', function(){
  var v = pick(['être','avoir']), p = R(0,5); return CJ.question(v, 'pr', p, 'C02', Math.random() < .5);
});
N('C03','CE1','Le présent des verbes en -er', function(){ return CJ.question(CJ.verbe(['v1']), 'pr', R(0,5), 'C03', Math.random() < .5); });
N('O03','CE1','Féminin ou pluriel', B('O03', [
  ['Dans « des <b>amies</b> », la fin <b>-es</b> marque…','le féminin et le pluriel',['le féminin seulement','le pluriel seulement'],'Le <b>-e</b> marque le féminin et le <b>-s</b> marque le pluriel : amie<b>s</b>.'],
  ['Dans « des <b>amis</b> », la fin <b>-s</b> marque…','le pluriel seulement',['le féminin seulement','le féminin et le pluriel'],'Il n\'y a pas de <b>-e</b> : c\'est masculin. Le <b>-s</b> marque le pluriel.'],
  ['Dans « une <b>amie</b> », la fin <b>-e</b> marque…','le féminin seulement',['le pluriel seulement','le féminin et le pluriel'],'Il n\'y en a qu\'une : pas de -s. Le <b>-e</b> marque le féminin.'],
  ['Dans « des <b>voisines</b> », la fin <b>-es</b> marque…','le féminin et le pluriel',['le pluriel seulement','le féminin seulement'],'Voisin + <b>e</b> (féminin) + <b>s</b> (pluriel).'],
  ['Dans « des <b>cousins</b> », la fin <b>-s</b> marque…','le pluriel seulement',['le féminin et le pluriel','le féminin seulement'],'Cousin + <b>s</b> : c\'est le pluriel d\'un nom masculin.']
]));
var SON_S = [['poi___on','🐟','ss','poisson'],['le___on','📖','ç','leçon'],['gar___on','👦','ç','garçon'],['___iseaux','✂️','c','ciseaux'],['ta___e','☕','ss','tasse'],['___itron','🍋','c','citron'],['gla___on','🧊','ç','glaçon'],['___erise','🍒','c','cerise'],['___alade','🥗','s','salade'],['___erpent','🐍','s','serpent']];
N('O04','CE1','Le son [s] : s, ss, c, ç', function(){
  var i = R(0, SON_S.length-1), w = SON_S[i];
  var e = {ss:'Entre deux voyelles, il faut <b>ss</b> pour faire [s] : un seul s ferait [z].', 'ç':'Devant a, o, u, le c fait [k] : on ajoute une cédille, <b>ç</b>, pour faire [s].', c:'Devant e, i, y, la lettre <b>c</b> fait [s].', s:'En début de mot, on écrit souvent <b>s</b>.'}[w[2]];
  return ch('Complète : <b>'+w[0].replace('___','<span class="blank">?</span>')+'</b> '+w[1], w[2], ['s','ss','c','ç'], e+' On écrit <b>'+w[3]+'</b>.', 'O04-'+i);
});
var SZ = [['maison','z'],['poisson','s'],['rose','z'],['valise','z'],['chemise','z'],['danse','s'],['cousin','z'],['coussin','s'],['poison','z'],['salade','s'],['tasse','s'],['oiseau','z']];
N('O05','CE1','Le son [s] ou le son [z]', function(){
  var i = R(0, SZ.length-1), w = SZ[i], z = w[1] === 'z';
  var e = z ? 'Un <b>s</b> seul entre deux voyelles se prononce [z] : '+w[0]+'.' : (/ss/.test(w[0]) ? 'Le <b>ss</b> entre deux voyelles se prononce toujours [s].' : 'Ici le s n\'est pas entre deux voyelles : il se prononce [s].');
  return ch('Dans « <b>'+w[0]+'</b> », le s se prononce…', z ? '[z] comme zèbre' : '[s] comme serpent', ['[s] comme serpent','[z] comme zèbre'], e, 'O05-'+i);
});
var SON_K = [['___oala','🐨','k','koala'],['___anard','🦆','c','canard'],['___arotte','🥕','c','carotte'],['___atre','4️⃣','qu','quatre'],['___iwi','🥝','k','kiwi'],['re___in','🦈','qu','requin'],['bou___et','💐','qu','bouquet'],['___ochon','🐷','c','cochon'],['___angourou','🦘','k','kangourou']];
N('O06','CE1','Le son [k] : c, k, qu', function(){
  var i = R(0, SON_K.length-1), w = SON_K[i];
  var e = {c:'Devant a, o, u, la lettre <b>c</b> fait [k].', qu:'On écrit souvent <b>qu</b> devant e et i, et dans quatre, quand, qui…', k:'Le <b>k</b> est rare : on le trouve surtout dans des mots venus d\'autres langues.'}[w[2]];
  return ch('Complète : <b>'+w[0].replace('___','<span class="blank">?</span>')+'</b> '+w[1], w[2], ['c','k','qu'], e+' On écrit <b>'+w[3]+'</b>.', 'O06-'+i);
});
var GJ = [['girafe','j'],['gâteau','g'],['orange','j'],['gomme','g'],['gilet','j'],['guitare','g'],['bougie','j'],['légume','g'],['genou','j'],['figue','g'],['gare','g'],['nageur','j']];
N('O07','CE1','Le son [g] ou le son [j]', function(){
  var i = R(0, GJ.length-1), w = GJ[i], j = w[1] === 'j';
  return ch('Dans « <b>'+w[0]+'</b> », le g se prononce…', j ? '[j] comme jupe' : '[g] comme gare', ['[g] comme gare','[j] comme jupe'],
    'Devant <b>e, i, y</b>, le g se prononce [j]. Devant <b>a, o, u</b>, il se prononce [g]. Et <b>gu</b> devant e ou i fait [g].', 'O07-'+i);
});
var MUET = [['petit','t','petite'],['grand','d','grande'],['lait','t','laitier'],['dent','t','dentiste'],['gros','s','grosse'],['blanc','c','blanche'],['long','g','longue'],['vert','t','verte'],['rond','d','ronde'],['froid','d','froide'],['tapis','s','tapisser'],['sport','t','sportif']];
N('O08','CE1','Les lettres muettes en fin de mot', function(){
  var i = R(0, MUET.length-1), w = MUET[i], cons = A.uniq(w[0].replace(/[aeiouéè]/g,'').split('')).filter(function(c){ return c !== w[1]; });
  var o = A.uniq([w[1]].concat(cons, ['s','t','d'])).slice(0,3);
  return ch('Dans « <b>'+w[0]+'</b> », quelle lettre muette est à la fin ?', w[1], o, 'On l\'entend dans un mot de la même famille : <b>'+w[2]+'</b>.', 'O08-'+i);
});

/* ─── CE2 ─── */
N('G11','CE2','L\'accord dans le groupe nominal', accordGN('G11', true));
N('C04','CE2','Le présent des verbes en -ir', function(){ return CJ.question(CJ.verbe(['v2']), 'pr', R(0,5), 'C04', Math.random() < .5); });
N('C05','CE2','Le présent des verbes irréguliers', function(){ return CJ.question(pick(['aller','faire','dire','venir','prendre','pouvoir','vouloir','voir','partir','mettre']), 'pr', R(0,5), 'C05', Math.random() < .5); });
N('C06','CE2','Le passé composé', function(){ var v = Math.random() < .7 ? CJ.verbe(['v1']) : pick(['finir','avoir','être','faire','prendre']); return CJ.question(v, 'pc', R(0,5), 'C06', Math.random() < .5); });
N('C07','CE2','Le futur simple', function(){ return CJ.question(Math.random() < .7 ? CJ.verbe(['v1','v2']) : pick(['être','avoir','aller','faire']), 'fu', R(0,5), 'C07', Math.random() < .5); });
N('C08','CE2','Passé composé ou futur', function(){
  var v = CJ.verbe(['v1']), p = R(0,5), pc = CJ.compose(v,'pc',p,false), fu = CJ.formes(v,'fu')[p], passe = Math.random() < .5, pr = CJ.pronom(p,false,passe?pc:fu);
  var phr = (passe ? 'Hier, ' : 'Demain, ') + pr + '<span class="blank">?</span>';
  return ch('Complète avec <b>'+v+'</b> :<br>'+phr, passe ? pc : fu, [pc, fu], passe ? '« Hier » parle du passé : on utilise le passé composé, <b>'+pc+'</b>.' : '« Demain » parle de l\'avenir : on utilise le futur, <b>'+fu+'</b>.', 'C08-'+v+p+(passe?'p':'f'));
});
/* Homophones (même astuce que les fiches : on remplace par un autre mot) */
function homo(code, astuce, opts, items){
  return function(){
    var i = R(0, items.length-1), s = items[i][0], a = items[i][1], debut = /^___/.test(s);
    var c = function(x){ return debut ? cap(x) : x; };
    var phrase = s.replace('___', '<span class="blank">?</span>');
    var juste = s.replace('___', '<b>'+c(a)+'</b>');
    return ch('<span class="phr">'+phrase+'</span>', c(a), opts.map(c), astuce+'<br>On écrit : « '+juste+' »', code+'-'+i);
  };
}
var H_A = [['Il ___ un vélo rouge.','a'],['Je vais ___ la piscine.','à'],['Elle ___ mangé une pomme.','a'],['Nous partons ___ midi.','à'],['Mon frère ___ peur du noir.','a'],['C\'est une tasse ___ café.','à'],['Tom ___ oublié son sac.','a'],['Ils jouent ___ cache-cache.','à'],['Léa ___ dix ans.','a'],['Il pense ___ ses vacances.','à']];
var H_ET = [['Le chat ___ noir.','est'],['Paul ___ Léa jouent.','et'],['Il ___ parti tôt.','est'],['Du pain ___ du fromage.','et'],['La porte ___ fermée.','est'],['Il court ___ il saute.','et'],['Où ___ ma trousse ?','est'],['Il est grand ___ fort.','et'],['Mon cahier ___ propre.','est']];
var H_ON = [['Ils ___ gagné le match.','ont'],['___ va au parc ?','on'],['Les élèves ___ fini.','ont'],['Demain, ___ part en vacances.','on'],['Mes parents ___ une voiture.','ont'],['___ ne court pas dans le couloir.','on'],['Les oiseaux ___ faim.','ont'],['Quand ___ a fini, on peut jouer.','on']];
var H_SON = [['Ils ___ en retard.','sont'],['Elle range ___ cartable.','son'],['Les fleurs ___ belles.','sont'],['Il a perdu ___ stylo.','son'],['Où ___ mes clés ?','sont'],['Il appelle ___ chien.','son'],['Mes amis ___ gentils.','sont']];
var T_A = 'Remplace par <b>avait</b> : si la phrase marche, c\'est <b>a</b> (verbe avoir). Sinon, c\'est <b>à</b>.';
var T_ET = 'Remplace par <b>était</b> : si ça marche, c\'est <b>est</b> (verbe être). Si on peut dire <b>et puis</b>, c\'est <b>et</b>.';
var T_ON = 'Remplace par <b>avaient</b> : si ça marche, c\'est <b>ont</b> (verbe avoir). Si on peut mettre <b>il</b>, c\'est <b>on</b>.';
var T_SON = 'Remplace par <b>étaient</b> : si ça marche, c\'est <b>sont</b> (verbe être). Si on peut dire <b>mon</b>, c\'est <b>son</b>.';
N('O09','CE2','Les homophones a et à', homo('O09', T_A, ['a','à'], H_A));
N('O10','CE2','Les homophones est et et', homo('O10', T_ET, ['et','est'], H_ET));
N('O11','CE2','Les homophones on et ont', homo('O11', T_ON, ['on','ont'], H_ON));
N('O12','CE2','Les homophones son et sont', homo('O12', T_SON, ['son','sont'], H_SON));
N('O13','CE2','Les quatre homophones : bilan', function(){
  return pick([homo('O13a', T_A, ['a','à'], H_A), homo('O13b', T_ET, ['et','est'], H_ET), homo('O13c', T_ON, ['on','ont'], H_ON), homo('O13d', T_SON, ['son','sont'], H_SON)])();
});
N('L01','CE2','Les familles de mots', B('L01', [
  ['Quel mot est de la même [[famille]] que « dent » ?','dentiste',['danse','dans'],'<b>dentiste</b> est construit sur le radical <b>dent</b>. « Danse » se prononce presque pareil mais n\'a rien à voir.'],
  ['Quel mot est de la même famille que « terre » ?','terrain',['tirer','tête'],'<b>terrain</b> est construit sur <b>terre</b>.'],
  ['Quel mot est de la même famille que « fleur » ?','fleuriste',['fleuve','flèche'],'<b>fleuriste</b> : celui qui vend des fleurs.'],
  ['Quel mot est de la même famille que « jardin » ?','jardinier',['jarre','jaune'],'<b>jardinier</b> : celui qui s\'occupe du jardin.'],
  ['Quel mot est de la même famille que « lait » ?','laitier',['laid','laisser'],'<b>laitier</b> vient de <b>lait</b>. « Laid » se prononce pareil, mais ce n\'est pas le même sens.'],
  ['Quel mot est de la même famille que « chant » ?','chanteur',['champ','chat'],'<b>chanteur</b> : celui qui chante.'],
  ['Quel mot n\'est PAS de la famille de « mer » ?','mère',['marin','maritime'],'<b>mère</b> se prononce comme mer, mais ce n\'est pas le même sens. Marin et maritime parlent de la mer.']
]));
N('L02','CE2','Radical, préfixe et suffixe', B('L02', [
  ['Dans « <b>re</b>faire », « re- » est…','un préfixe',['un suffixe','le radical'],'Il est placé <b>avant</b> le radical : c\'est un [[prefixe|préfixe]]. Il veut dire « encore ».'],
  ['Dans « jardin<b>ier</b> », « -ier » est…','un suffixe',['un préfixe','le radical'],'Il est placé <b>après</b> le radical : c\'est un [[suffixe]].'],
  ['Quel est le [[radical]] de « dentiste » ?','dent',['iste','denti'],'On enlève le suffixe -iste : il reste <b>dent</b>.'],
  ['Que veut dire le préfixe <b>dé-</b> dans « défaire » ?','le contraire',['encore','avant'],'Défaire, c\'est le contraire de faire.'],
  ['Dans « <b>im</b>possible », « im- » veut dire…','pas',['très','encore'],'Impossible, c\'est « pas possible ».'],
  ['Quel est le radical de « chanteur » ?','chant',['eur','chante'],'On enlève le suffixe -eur : il reste <b>chant</b>.']
]));
var SYN = [['content','joyeux',['triste','fatigué']],['rapide','vite',['lent','grand']],['commencer','débuter',['finir','arrêter']],['maison','habitation',['jardin','rue']],['peur','frayeur',['courage','joie']],['beau','joli',['laid','petit']],['parler','discuter',['écouter','se taire']]];
var ANT = [['grand','petit',['haut','gros']],['chaud','froid',['tiède','brûlant']],['ouvrir','fermer',['entrer','pousser']],['jour','nuit',['matin','soleil']],['monter','descendre',['grimper','sauter']],['propre','sale',['net','neuf']],['gagner','perdre',['jouer','réussir']]];
N('L03','CE2','Les synonymes', function(){ var i = R(0,SYN.length-1), w = SYN[i]; return ch('Quel est le [[synonyme]] de « <b>'+w[0]+'</b> » ?', w[1], [w[1]].concat(w[2]), '<b>'+w[1]+'</b> veut dire presque la même chose que « '+w[0]+' ».', 'L03-'+i); });
N('L04','CE2','Les antonymes', function(){ var i = R(0,ANT.length-1), w = ANT[i]; return ch('Quel est le contraire de « <b>'+w[0]+'</b> » ?', w[1], [w[1]].concat(w[2]), '<b>'+w[1]+'</b> est l\'[[antonyme]] du mot « '+w[0]+' » : il veut dire le contraire.', 'L04-'+i); });
N('L05','CE2','Synonymes ou antonymes', function(){
  var syn = Math.random() < .5, l = syn ? SYN : ANT, i = R(0,l.length-1), w = l[i];
  return ch('« <b>'+w[0]+'</b> » et « <b>'+w[1]+'</b> » sont…', syn ? 'des synonymes' : 'des antonymes', ['des synonymes','des antonymes'], syn ? 'Ils veulent dire presque la même chose : ce sont des [[synonyme|synonymes]].' : 'Ils veulent dire le contraire : ce sont des [[antonyme|antonymes]].', 'L05-'+(syn?'s':'a')+i);
});
N('L06','CE2','Famille de mots ou synonymes', B('L06', [
  ['« fleur » et « fleuriste » sont…','de la même famille',['des synonymes'],'Ils ont le même radical <b>fleur</b>, mais ils ne veulent pas dire la même chose.'],
  ['« content » et « joyeux » sont…','des synonymes',['de la même famille'],'Ils veulent dire presque la même chose, mais ils n\'ont pas le même radical.'],
  ['« dent » et « dentiste » sont…','de la même famille',['des synonymes'],'Même radical <b>dent</b> : même famille.'],
  ['« voiture » et « automobile » sont…','des synonymes',['de la même famille'],'Même sens, radicaux différents : ce sont des synonymes.'],
  ['« chanter » et « chanson » sont…','de la même famille',['des synonymes'],'Même radical <b>chant</b> : même famille.'],
  ['« peur » et « frayeur » sont…','des synonymes',['de la même famille'],'Même sens, radicaux différents : synonymes.']
]));
var DICO = ['abeille','balle','cabane','dragon','école','fusée','girafe','hibou','igloo','jouet','koala','lune','maison','neige','orange','pirate','reine','sapin','tortue','usine','vache','zèbre','banane','bateau','biscuit','carte','cerise','citron'];
N('L07','CE2','Utiliser le dictionnaire', function(d){
  var mots = shuffle(DICO).slice(0, 3), tri = mots.slice().sort(function(a,b){ return a.localeCompare(b,'fr'); });
  if(d >= 2){ var l = pick(['ba','ca','ci']), pool = DICO.filter(function(m){ return m.indexOf(l.charAt(0)) === 0; }); if(pool.length >= 3){ mots = shuffle(pool).slice(0,3); tri = mots.slice().sort(function(a,b){ return a.localeCompare(b,'fr'); }); } }
  var memeLettre = tri[0].charAt(0) === tri[1].charAt(0);
  return ch('Quel mot vient en premier dans le dictionnaire ?', tri[0], mots, 'Les mots sont rangés dans l\'ordre de l\'alphabet. '+(memeLettre ? 'Ils commencent par la même lettre : on regarde la deuxième, puis la troisième.' : 'On regarde la première lettre.')+' Ordre : '+tri.join(', ')+'.', 'L07-'+tri.join('-'));
});
})();
