/* Salle d'arcade — Français 5e, 4e, 3e (une notion par fiche du site) */
(function(){
var A = ARC, CJ = ARC.CJ, R = A.R, pick = A.pick, ch = A.choice, B = A.banque;
function N(code, classe, titre, gen){ A.notion(code, classe, 'fr', titre, gen); }
var S = function(t){ return '<span class="phr">'+t+'</span>'; };

/* ─── Grammaire ─── */
N('G401','5e','Coordination et subordination', B('G401', [
  ['Dans '+S('Il pleut, mais nous sortons.')+' les propositions sont…','coordonnées',['juxtaposées','subordonnées'],'Elles sont reliées par la conjonction de coordination <b>mais</b> : propositions coordonnées.'],
  ['Dans '+S('Il pleut ; nous restons à l\'intérieur.')+' les propositions sont…','juxtaposées',['coordonnées','subordonnées'],'Elles sont séparées par un point-virgule, sans mot de liaison : juxtaposées.'],
  ['Dans '+S('Nous restons à l\'intérieur parce qu\'il pleut.')+' « parce qu\'il pleut » est…','une proposition subordonnée',['une proposition coordonnée','une proposition indépendante'],'Elle commence par « parce que » et dépend de la principale : c\'est une [[subordonnee|subordonnée]].'],
  ['Quelle conjonction de coordination exprime la conséquence ?','donc',['mais','or'],'Mais, ou, et, <b>donc</b>, or, ni, car : <b>donc</b> introduit une conséquence.'],
  ['Dans '+S('Je travaille et tu te reposes.')+' les propositions sont…','coordonnées',['juxtaposées','subordonnées'],'Reliées par <b>et</b> : coordonnées.']
]));
N('G402','5e','Les propositions subordonnées relatives', B('G402', [
  ['Complète : '+S('Le film <span class="blank">?</span> je t\'ai parlé passe ce soir.'),'dont',['que','où'],'On dit « parler <b>de</b> quelque chose » : le pronom relatif qui remplace « de + nom » est <b>dont</b>.'],
  ['Complète : '+S('La maison <span class="blank">?</span> nous vivons est ancienne.'),'où',['dont','que'],'Il s\'agit d\'un lieu : <b>où</b>.'],
  ['Complète : '+S('Le livre <span class="blank">?</span> tu lis est passionnant.'),'que',['dont','qui'],'Le livre est COD de « tu lis » : <b>que</b>.'],
  ['Quel est l\'antécédent dans '+S('La fille qui chante est ma voisine.')+' ?','La fille',['ma voisine','chante'],'L\'antécédent est le nom que le pronom relatif remplace : <b>la fille</b>.'],
  ['Complète : '+S('C\'est l\'ami <span class="blank">?</span> je compte le plus.'),'sur qui',['dont','que'],'On dit « compter <b>sur</b> quelqu\'un » : <b>sur qui</b>.'],
  ['Quelle est la subordonnée relative dans '+S('Les fleurs que tu as cueillies sentent bon.')+' ?','que tu as cueillies',['Les fleurs','sentent bon'],'Elle commence par le pronom relatif <b>que</b> et complète le nom fleurs.']
]));
N('G403','4e','Les propositions subordonnées conjonctives', B('G403', [
  ['Dans '+S('Je veux que tu viennes.')+' « que tu viennes » est une subordonnée…','conjonctive complétive',['relative','circonstancielle de temps'],'Elle complète le verbe « veux » et commence par la conjonction <b>que</b> : conjonctive complétive (elle est COD).'],
  ['Dans '+S('Quand il arrivera, nous partirons.')+' la subordonnée exprime…','le temps',['la cause','le but'],'<b>Quand</b> introduit une circonstancielle de temps.'],
  ['Dans '+S('Il se dépêche pour que nous ne soyons pas en retard.')+' la subordonnée exprime…','le but',['la cause','la conséquence'],'<b>Pour que</b> introduit le but.'],
  ['Dans '+S('Puisque tu es là, aide-moi.')+' la subordonnée exprime…','la cause',['le but','la concession'],'<b>Puisque</b> introduit la cause.'],
  ['Dans '+S('Bien qu\'il soit fatigué, il continue.')+' la subordonnée exprime…','la concession',['la cause','le temps'],'<b>Bien que</b> introduit une concession : un obstacle qui n\'empêche pas l\'action.'],
  ['Quelle différence entre « que » relatif et « que » conjonction ?','le relatif a un antécédent',['la conjonction remplace un nom','ils sont identiques'],'Le pronom relatif remplace un nom (son antécédent). La conjonction « que » ne remplace rien : elle relie.']
]));
N('G404','5e','Discours direct et discours indirect', B('G404', [
  ['Il dit : « Je suis fatigué. » → au discours indirect :','Il dit qu\'il est fatigué.',['Il dit que je suis fatigué.','Il dit qu\'il était fatigué hier.'],'On supprime les guillemets, on ajoute « que » et le pronom change : je → <b>il</b>.'],
  ['Elle demande : « Viens-tu ? » → au discours indirect :','Elle demande si je viens.',['Elle demande que je viens.','Elle demande viens-tu.'],'Une question fermée devient « <b>si</b> » au discours indirect.'],
  ['Il a dit : « Je partirai demain. » → au discours indirect :','Il a dit qu\'il partirait le lendemain.',['Il a dit qu\'il partira demain.','Il a dit que je partirai demain.'],'Le verbe introducteur est au passé : le futur devient conditionnel et « demain » devient « <b>le lendemain</b> ».'],
  ['Laquelle est au discours direct ?','Elle s\'écrie : « Quelle chance ! »',['Elle s\'écrie qu\'elle a de la chance.','Elle dit sa chance.'],'Le discours direct rapporte les paroles exactes, entre guillemets.'],
  ['Il demande : « Où vas-tu ? » → au discours indirect :','Il demande où je vais.',['Il demande si je vais.','Il demande où vas-tu.'],'Le mot interrogatif reste (<b>où</b>), mais l\'inversion du sujet disparaît.']
]));

/* ─── Conjugaison ─── */
var G4 = ['v1','v1s','v2','irr','arriver','tomber','rester','entrer'];
N('C401','5e','Le plus-que-parfait', function(){ return CJ.question(CJ.verbe(G4), 'pqp', R(0,5), 'C401', Math.random() < .5); });
N('C402','4e','Le futur antérieur', function(){ return CJ.question(CJ.verbe(G4), 'fa', R(0,5), 'C402', Math.random() < .5); });
N('C403','4e','La concordance des temps', B('C403', [
  [S('Il disait qu\'il <span class="blank">?</span> le lendemain.')+'<div class="muted">(venir)</div>','viendrait',['viendra','vient'],'Le verbe principal est au passé : le futur dans le passé s\'exprime au <b>conditionnel présent</b>.'],
  [S('Elle pensait qu\'il <span class="blank">?</span> déjà parti.')+'<div class="muted">(être)</div>','était',['est','sera'],'Action antérieure à un moment passé : plus-que-parfait, « il <b>était</b> parti ».'],
  [S('Je sais qu\'il <span class="blank">?</span> demain.')+'<div class="muted">(arriver)</div>','arrivera',['arriverait','arrivait'],'Le verbe principal est au présent : le futur garde le <b>futur</b>.'],
  [S('Il a affirmé qu\'il <span class="blank">?</span> malade.')+'<div class="muted">(être)</div>','était',['est','sera'],'Principale au passé, action simultanée : <b>imparfait</b>.'],
  [S('Nous croyions que tu <span class="blank">?</span> la veille.')+'<div class="muted">(partir)</div>','étais parti',['partiras','partais'],'Action antérieure dans le passé : plus-que-parfait.']
]));
N('C404','4e','Le subjonctif : emplois', B('C404', [
  [S('Bien qu\'il <span class="blank">?</span>, nous sortirons.')+'<div class="muted">(pleuvoir)</div>','pleuve',['pleut','pleuvra'],'<b>Bien que</b> est toujours suivi du [[subjonctif]].'],
  [S('Je pense qu\'il <span class="blank">?</span> raison.')+'<div class="muted">(avoir)</div>','a',['ait','aura eu'],'« Je pense que » exprime une certitude : on garde l\'<b>indicatif</b>.'],
  [S('Il faut que tu <span class="blank">?</span> tes devoirs.')+'<div class="muted">(faire)</div>','fasses',['fais','feras'],'« Il faut que » exprime une obligation : subjonctif, <b>que tu fasses</b>.'],
  [S('Je veux qu\'elle <span class="blank">?</span> à l\'heure.')+'<div class="muted">(venir)</div>','vienne',['vient','viendra'],'La volonté (« je veux que ») appelle le subjonctif.'],
  [S('Avant que tu ne <span class="blank">?</span>, écoute-moi.')+'<div class="muted">(partir)</div>','partes',['pars','partiras'],'<b>Avant que</b> est suivi du subjonctif.']
]));
N('C405','5e','La voix passive', B('C405', [
  ['Transforme à la [[voixpassive|voix passive]] : '+S('Le chat poursuit la souris.'),'La souris est poursuivie par le chat.',['Le chat est poursuivi par la souris.','La souris poursuit le chat.'],'Le COD devient sujet, le verbe devient « être + participe passé » accordé, et le sujet devient complément d\'agent.'],
  ['Transforme à la voix passive : '+S('Les pompiers ont éteint l\'incendie.'),'L\'incendie a été éteint par les pompiers.',['L\'incendie est éteint par les pompiers.','Les pompiers ont été éteints par l\'incendie.'],'Le temps est conservé : passé composé → « <b>a été</b> éteint ».'],
  ['À quel temps est le verbe dans '+S('La lettre sera envoyée demain.')+' ?','futur de la voix passive',['présent de la voix passive','futur de la voix active'],'L\'auxiliaire être est au futur (sera) : futur de la voix passive.'],
  ['Quel est le complément d\'agent ?<br>'+S('Ce tableau a été peint par Monet.'),'par Monet',['Ce tableau','a été peint'],'Le complément d\'agent indique qui fait l\'action : <b>par Monet</b>.'],
  ['Quelle phrase est à la voix passive ?','Le match a été gagné par l\'équipe.',['L\'équipe a gagné le match.','L\'équipe est contente du match.'],'« a été gagné par » : le sujet subit l\'action.']
]));

/* ─── Orthographe ─── */
N('O401','5e','Les accords complexes dans le groupe nominal', B('O401', [
  ['Complète : '+S('des robes <span class="blank">?</span>')+'<div class="muted">(bleu clair)</div>','bleu clair',['bleues claires','bleus clairs'],'Un adjectif de couleur composé reste <b>invariable</b> : des robes bleu clair.'],
  ['Complète : '+S('des chaussures <span class="blank">?</span>')+'<div class="muted">(marron)</div>','marron',['marrons','marronnes'],'Une couleur qui vient d\'un nom (le marron, le fruit) reste invariable.'],
  ['Complète : '+S('deux heures et <span class="blank">?</span>')+'<div class="muted">(demi)</div>','demie',['demi','demies'],'Après le nom, « demi » s\'accorde en genre seulement : heure est féminin, donc <b>demie</b>.'],
  ['Complète : '+S('une <span class="blank">?</span>-heure')+'<div class="muted">(demi)</div>','demi',['demie','demis'],'Devant le nom, avec un trait d\'union, « demi » reste <b>invariable</b>.'],
  ['Complète : '+S('des fleurs <span class="blank">?</span>')+'<div class="muted">(rose)</div>','roses',['rose','rosent'],'Exception : rose, mauve, pourpre, fauve et écarlate <b>s\'accordent</b>.'],
  ['Complète : '+S('Ils marchent <span class="blank">?</span>-pieds.')+'<div class="muted">(nu)</div>','nu',['nus','nue'],'Devant le nom, avec un trait d\'union, « nu » reste invariable : <b>nu-pieds</b>.']
]));
N('O402','4e','Le participe passé : cas difficiles', B('O402', [
  [S('Les fleurs que j\'ai <span class="blank">?</span> sont belles.')+'<div class="muted">(cueillir)</div>','cueillies',['cueilli','cueillis'],'Avec avoir, le participe s\'accorde avec le COD placé <b>avant</b> : « que » = les fleurs (féminin pluriel).'],
  [S('J\'ai <span class="blank">?</span> des fleurs.')+'<div class="muted">(cueillir)</div>','cueilli',['cueillies','cueillis'],'Le COD est placé après le verbe : pas d\'accord.'],
  [S('Elles se sont <span class="blank">?</span> les mains.')+'<div class="muted">(laver)</div>','lavé',['lavées','lavés'],'Le COD « les mains » est après le verbe : le participe reste <b>invariable</b>.'],
  [S('Elles se sont <span class="blank">?</span>.')+'<div class="muted">(laver)</div>','lavées',['lavé','lavés'],'Elles ont lavé qui ? « se » (elles-mêmes), placé avant : accord, <b>lavées</b>.'],
  [S('Ces livres, je les ai <span class="blank">?</span>.')+'<div class="muted">(lire)</div>','lus',['lu','lues'],'« les » (les livres) est COD placé avant : accord au masculin pluriel.'],
  [S('Des occasions, il en a <span class="blank">?</span> beaucoup.')+'<div class="muted">(manquer)</div>','manqué',['manquées','manqués'],'Avec le pronom « en », le participe reste invariable.']
]));
N('O403','5e','tout, tous, toute, toutes', B('O403', [
  [S('<span class="blank">?</span> les élèves sont présents.'),'Tous',['Tout','Toutes'],'Devant « les élèves » (masculin pluriel), le déterminant s\'accorde : <b>Tous</b>.'],
  [S('Elle est <span class="blank">?</span> étonnée.'),'tout',['toute','tous'],'« tout » veut dire « tout à fait » : c\'est un adverbe. Devant une voyelle, il reste invariable.'],
  [S('Elle est <span class="blank">?</span> petite.'),'toute',['tout','toutes'],'Adverbe devant un adjectif féminin commençant par une consonne : il s\'accorde, <b>toute</b>.'],
  [S('Il a mangé <span class="blank">?</span> la tarte.'),'toute',['tout','toutes'],'Déterminant devant « la tarte » (féminin singulier) : <b>toute</b>.'],
  [S('Les filles sont venues, <span class="blank">?</span> étaient ravies.'),'toutes',['tous','tout'],'Pronom qui remplace « les filles » : <b>toutes</b>.'],
  [S('Il a passé <span class="blank">?</span> son temps à lire.'),'tout',['tous','toute'],'Déterminant devant un nom masculin singulier : <b>tout</b>.']
]));
N('O404','5e','quel(s), quelle(s) ou qu\'elle(s)', B('O404', [
  [S('<span class="blank">?</span> belle journée !'),'Quelle',['Qu\'elle','Quel'],'On ne peut pas remplacer par « qu\'il » : c\'est le déterminant, accordé avec journée (féminin) : <b>Quelle</b>.'],
  [S('Je crois <span class="blank">?</span> viendra.'),'qu\'elle',['quelle','quel'],'On peut dire « je crois qu\'<b>il</b> viendra » : c\'est que + elle, <b>qu\'elle</b>.'],
  [S('<span class="blank">?</span> livres préfères-tu ?'),'Quels',['Quelles','Qu\'elles'],'Déterminant accordé avec livres (masculin pluriel) : <b>Quels</b>.'],
  [S('Il faut <span class="blank">?</span> partent tôt.'),'qu\'elles',['quelles','quels'],'« qu\'ils partent » marche : c\'est que + elles.'],
  [S('<span class="blank">?</span> est ta couleur préférée ?'),'Quelle',['Qu\'elle','Quel'],'Couleur est féminin : <b>Quelle</b>.'],
  [S('<span class="blank">?</span> âge as-tu ?'),'Quel',['Quelle','Qu\'elle'],'Âge est masculin : <b>Quel</b>.']
]));

/* ─── Lexique ─── */
N('L401','5e','Les figures de style', B('L401', [
  ['« Ce garçon est une fusée. »','une métaphore',['une comparaison','une hyperbole'],'On rapproche le garçon d\'une fusée sans outil de comparaison : métaphore.'],
  ['« Le vent hurle dans la nuit. »','une personnification',['une métaphore','une litote'],'Le vent reçoit une action humaine (hurler) : personnification.'],
  ['« J\'ai attendu cent ans ! »','une hyperbole',['une litote','une antithèse'],'Le temps est volontairement exagéré : hyperbole.'],
  ['« Ce n\'est pas mauvais. » (pour dire que c\'est très bon)','une litote',['une hyperbole','une métaphore'],'On dit moins pour faire entendre plus : litote.'],
  ['« Il est noir comme le charbon. »','une comparaison',['une métaphore','une personnification'],'Il y a un outil de comparaison, <b>comme</b>.'],
  ['« Paris, ville de lumière et d\'ombre » rapproche deux idées contraires : c\'est…','une antithèse',['une hyperbole','une litote'],'Lumière et ombre s\'opposent : antithèse.']
]));
N('L402','5e','Les registres de langue', B('L402', [
  ['« Je me suis vautré en vélo. » relève du registre…','familier',['courant','soutenu'],'« se vautrer » est familier. En courant : « je suis tombé ».'],
  ['« Je vous saurais gré de me répondre. » relève du registre…','soutenu',['courant','familier'],'« savoir gré » est une tournure soutenue.'],
  ['« Peux-tu me prêter ton livre ? » relève du registre…','courant',['soutenu','familier'],'Vocabulaire et syntaxe ordinaires : registre courant.'],
  ['Quelle phrase est soutenue ?','Il s\'en est allé à la tombée du jour.',['Il s\'est barré le soir.','Il est parti le soir.'],'« s\'en aller », « la tombée du jour » : vocabulaire recherché.'],
  ['« T\'as vu ce film ? » relève du registre…','familier',['courant','soutenu'],'« T\'as » et l\'absence d\'inversion : familier.']
]));
N('L403','4e','L\'argumentation : thèse et arguments', B('L403', [
  ['La thèse, c\'est…','l\'opinion que l\'on défend',['un exemple précis','une conclusion chiffrée'],'La thèse est l\'idée défendue. Les arguments la justifient et les exemples les illustrent.'],
  ['« Selon l\'Organisation mondiale de la santé, il faut bouger chaque jour. » C\'est un argument…','d\'autorité',['affectif','d\'expérience'],'On s\'appuie sur une source reconnue : argument d\'autorité.'],
  ['« Le vélo ne rejette aucun gaz, donc il protège l\'air. » C\'est un argument…','logique',['d\'autorité','affectif'],'Il s\'appuie sur un raisonnement : argument logique.'],
  ['« À Copenhague, la moitié des habitants vont travailler à vélo. » C\'est…','un exemple',['une thèse','un connecteur'],'Un cas précis qui illustre un argument : un exemple.'],
  ['Quel connecteur introduit une concession ?','certes',['donc','car'],'« <b>Certes</b>…, mais… » reconnaît une idée adverse avant de la dépasser.']
]));
N('L404','4e','Les connecteurs logiques', B('L404', [
  ['« La route est glissante, <b>donc</b> il faut ralentir. » Le connecteur exprime…','la conséquence',['la cause','l\'opposition'],'<b>donc</b> introduit une conséquence.'],
  ['« Il a réussi <b>parce qu\'</b>il a travaillé. » Le connecteur exprime…','la cause',['le but','la conséquence'],'<b>parce que</b> introduit une cause.'],
  ['« Il est fatigué ; <b>pourtant</b>, il continue. » Le connecteur exprime…','l\'opposition',['la cause','l\'addition'],'<b>pourtant</b> marque une opposition.'],
  ['« Il s\'entraîne <b>afin de</b> gagner. » Le connecteur exprime…','le but',['la cause','la conséquence'],'<b>afin de</b> introduit un but.'],
  ['« <b>De plus</b>, ce sport est bon pour la santé. » Le connecteur exprime…','l\'addition',['l\'opposition','la cause'],'<b>de plus</b> ajoute un argument.'],
  ['Quel connecteur exprime la conséquence ?','c\'est pourquoi',['car','néanmoins'],'<b>c\'est pourquoi</b> introduit une conséquence. « car » exprime la cause, « néanmoins » l\'opposition.']
]));
})();
