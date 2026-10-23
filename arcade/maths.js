/* Salle d'arcade — Mathématiques CP → 3e (une notion par fiche du site) */
(function(){
var A = ARC, R = A.R, pick = A.pick, shuffle = A.shuffle, fmt = A.fmt, fix = A.fix, F = A.F, num = A.num, ch = A.choice, B = A.banque;
function N(code, classe, titre, gen){ A.notion(code, classe, 'maths', titre, gen); }
var MOTS = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
function lettres(n){
  if(n < 17) return MOTS[n];
  if(n < 20) return 'dix-'+MOTS[n-10];
  var d = Math.floor(n/10), u = n%10, D = ['','','vingt','trente','quarante','cinquante','soixante','soixante','quatre-vingt','quatre-vingt'];
  if(d === 7 || d === 9){ var r = 10 + u; return D[d] + (d === 7 && u === 1 ? ' et ' : '-') + (r < 17 ? MOTS[r] : 'dix-'+MOTS[r-10]); }
  if(u === 0) return D[d] + (d === 8 ? 's' : '');
  return D[d] + (u === 1 && d !== 8 ? ' et un' : '-'+MOTS[u]);
}
/* ─── Dessins ─── */
var INK = '#1f2b5c';
function svg(w, h, body){ return '<svg class="vis" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img">'+body+'</svg>'; }
function horloge(h, m){
  var b = '<circle cx="60" cy="60" r="54" fill="#fff" stroke="'+INK+'" stroke-width="4"/>';
  for(var i=1;i<=12;i++){ var a = i*Math.PI/6; b += '<text x="'+(60+42*Math.sin(a)).toFixed(1)+'" y="'+(60-42*Math.cos(a)+5).toFixed(1)+'" font-size="13" font-weight="700" text-anchor="middle" fill="'+INK+'">'+i+'</text>'; }
  var am = m*Math.PI/30, ah = ((h%12) + m/60)*Math.PI/6;
  b += '<line x1="60" y1="60" x2="'+(60+26*Math.sin(ah)).toFixed(1)+'" y2="'+(60-26*Math.cos(ah)).toFixed(1)+'" stroke="#e0383e" stroke-width="6" stroke-linecap="round"/>';
  b += '<line x1="60" y1="60" x2="'+(60+40*Math.sin(am)).toFixed(1)+'" y2="'+(60-40*Math.cos(am)).toFixed(1)+'" stroke="#2563d9" stroke-width="4" stroke-linecap="round"/>';
  return svg(120,120, b+'<circle cx="60" cy="60" r="4" fill="'+INK+'"/>');
}
function forme(nom){
  var f = '#bfdbfe', s = 'stroke="'+INK+'" stroke-width="3" fill="'+f+'"';
  var d = {carré:'<rect x="25" y="15" width="70" height="70" '+s+'/>', rectangle:'<rect x="10" y="25" width="100" height="50" '+s+'/>', triangle:'<polygon points="60,12 108,88 12,88" '+s+'/>', cercle:'<circle cx="60" cy="50" r="38" '+s+'/>', losange:'<polygon points="60,8 100,50 60,92 20,50" '+s+'/>'}[nom];
  return svg(120,100,d);
}
function barresFraction(n, d){
  var w = 220/d, b = '';
  for(var i=0;i<d;i++) b += '<rect x="'+(4+i*w).toFixed(1)+'" y="6" width="'+w.toFixed(1)+'" height="40" fill="'+(i<n?'#f59e0b':'#fff')+'" stroke="'+INK+'" stroke-width="2.5"/>';
  return svg(228,52,b);
}
function angle(deg){
  var a = deg*Math.PI/180, x = 30+90*Math.cos(a), y = 90-90*Math.sin(a);
  var b = '<line x1="30" y1="90" x2="130" y2="90" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="90" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'" stroke="'+INK+'" stroke-width="4" stroke-linecap="round"/>';
  b += deg === 90 ? '<rect x="30" y="72" width="18" height="18" fill="none" stroke="#e0383e" stroke-width="2.5"/>' : '<path d="M 55 90 A 25 25 0 0 0 '+(30+25*Math.cos(a)).toFixed(1)+' '+(90-25*Math.sin(a)).toFixed(1)+'" fill="none" stroke="#e0383e" stroke-width="2.5"/>';
  return svg(170,100,b);
}
function droites(type){
  var b;
  if(type === 'parallèles') b = '<line x1="15" y1="30" x2="185" y2="10" stroke="'+INK+'" stroke-width="4"/><line x1="15" y1="75" x2="185" y2="55" stroke="'+INK+'" stroke-width="4"/>';
  else if(type === 'perpendiculaires') b = '<line x1="20" y1="50" x2="180" y2="50" stroke="'+INK+'" stroke-width="4"/><line x1="100" y1="5" x2="100" y2="95" stroke="'+INK+'" stroke-width="4"/><rect x="100" y="34" width="16" height="16" fill="none" stroke="#e0383e" stroke-width="2.5"/>';
  else b = '<line x1="15" y1="20" x2="185" y2="80" stroke="'+INK+'" stroke-width="4"/><line x1="15" y1="70" x2="185" y2="40" stroke="'+INK+'" stroke-width="4"/>';
  return svg(200,100,b);
}
function graphe(lab, val, unite){
  var max = Math.max.apply(null, val), top = Math.ceil(max/5)*5, H = 110, b = '', w = 200/lab.length;
  for(var g=0; g<=top; g+=top/5){ var y = 125 - g/top*H; b += '<line x1="34" y1="'+y.toFixed(1)+'" x2="236" y2="'+y.toFixed(1)+'" stroke="#d9dfeb" stroke-width="1"/><text x="28" y="'+(y+4).toFixed(1)+'" font-size="11" text-anchor="end" fill="'+INK+'">'+g+'</text>'; }
  lab.forEach(function(l,i){ var h = val[i]/top*H, x = 40 + i*w + w*.18; b += '<rect x="'+x.toFixed(1)+'" y="'+(125-h).toFixed(1)+'" width="'+(w*.64).toFixed(1)+'" height="'+h.toFixed(1)+'" fill="#3b82f6" rx="3"/><text x="'+(x+w*.32).toFixed(1)+'" y="141" font-size="11" text-anchor="middle" fill="'+INK+'">'+l+'</text>'; });
  return svg(240,148,b);
}
function tableau(entetes, lignes){
  return '<div class="tblw"><table class="tbl">'+'<tr>'+entetes.map(function(e){ return '<th>'+e+'</th>'; }).join('')+'</tr>'+lignes.map(function(l){ return '<tr>'+l.map(function(c){ return '<td>'+c+'</td>'; }).join('')+'</tr>'; }).join('')+'</table></div>';
}

/* ─── Calcul mental (réutilisé par plusieurs notions) ─── */
function astuceMul(a, b){
  var p = a*b, t = Math.max(a,b), o = Math.min(a,b);
  if(t > 9 || o === 1) return a+' × '+b+' = <b>'+p+'</b>.';
  if(p === 56) return 'Retiens la suite <b>5, 6, 7, 8</b> : 56 = 7 × 8.';
  return {9:'× 9 = × 10 moins une fois : '+o*10+' − '+o+' = <b>'+p+'</b>.', 8:'× 8 = double, double, double : '+o+' → '+o*2+' → '+o*4+' → <b>'+p+'</b>.', 7:'× 7 = × 5 + × 2 : '+o*5+' + '+o*2+' = <b>'+p+'</b>.', 6:'× 6 = × 5 + une fois : '+o*5+' + '+o+' = <b>'+p+'</b>.', 5:'× 5 = la moitié de × 10 : '+o*10+' ÷ 2 = <b>'+p+'</b>.', 4:'× 4 = le double du double : '+o+' → '+o*2+' → <b>'+p+'</b>.', 3:'× 3 = × 2 + une fois : '+o*2+' + '+o+' = <b>'+p+'</b>.', 2:'× 2 = le double : '+o+' + '+o+' = <b>'+p+'</b>.'}[t];
}
function tables(code, liste){
  return function(d){
    var a = pick(liste), b = R(d >= 2 ? 2 : 1, 10), p = a*b, x = Math.random() < .5 ? [a,b] : [b,a];
    if(d >= 3 && Math.random() < .35) return num(x[0]+' × {?} = '+p, x[1], 'Cherche dans la table de '+x[0]+' : '+x[0]+' × <b>'+x[1]+'</b> = '+p+'.', code+'-q'+x[0]+'-'+p);
    return num(x[0]+' × '+x[1]+' = {?}', p, astuceMul(x[0], x[1]), code+'-'+Math.min(a,b)+'x'+Math.max(a,b), {gk:[a,b]});
  };
}
function decomp(a, b){ var T = b - b%10, u = b%10; return u && T ? 'Décompose : '+a+' + '+T+' = '+(a+T)+', puis + '+u+' = <b>'+(a+b)+'</b>.' : a+' + '+b+' = <b>'+(a+b)+'</b>.'; }

/* ═══ CP ═══ */
N('M01','CP','Les nombres jusqu\'à 99', function(d){
  var r = Math.random(), n = R(11, 98);
  if(r < .35) return num('Quel nombre vient juste après <b>'+n+'</b> ?<br>{?}', n+1, 'On ajoute 1 : après '+n+' vient <b>'+(n+1)+'</b>.', 'M01-a'+n);
  if(r < .6) return num('Quel nombre vient juste avant <b>'+n+'</b> ?<br>{?}', n-1, 'On enlève 1 : avant '+n+' vient <b>'+(n-1)+'</b>.', 'M01-b'+n);
  if(r < .8){ var di = Math.floor(n/10), u = n%10; return num(di+' dizaines et '+u+' unités = {?}', n, di+' dizaines = '+di*10+', plus '+u+' unités : <b>'+n+'</b>.', 'M01-d'+n); }
  return ch('Comment s\'écrit « <b>'+lettres(n)+'</b> » ?', String(n), A.uniq([String(n), String((n%10)*10+Math.floor(n/10)), String(n+10 > 99 ? n-10 : n+10)]).filter(function(x){ return +x > 0; }), '« '+lettres(n)+' » s\'écrit <b>'+n+'</b>.', 'M01-l'+n);
});
N('M04','CP','La valeur des chiffres', function(){
  var n = R(12, 98), di = Math.floor(n/10), u = n%10; if(di === u) n++, u = n%10;
  var dz = Math.random() < .5;
  return num('Dans <b>'+n+'</b>, quel est le chiffre des '+(dz?'dizaines':'unités')+' ?<br>{?}', dz ? Math.floor(n/10) : u, 'Le chiffre de gauche compte les dizaines (paquets de 10), celui de droite les unités. Dans '+n+' : '+Math.floor(n/10)+' dizaines et '+u+' unités.', 'M04-'+n+(dz?'d':'u'));
});
N('M05','CP','Comparer et ranger des nombres', function(){
  var a = R(10, 99), b = R(10, 99); if(a === b) b = a + 1;
  if(Math.random() < .5) return ch('Quel nombre est le plus grand ?', String(Math.max(a,b)), [String(a), String(b)], 'On compare d\'abord les dizaines : '+Math.floor(a/10)+' et '+Math.floor(b/10)+(Math.floor(a/10)===Math.floor(b/10)?'. Elles sont égales, alors on compare les unités.':'.')+' Le plus grand est <b>'+Math.max(a,b)+'</b>.', 'M05-'+a+'-'+b);
  var s = a < b ? '<' : '>';
  return ch(a+' <span class="blank">?</span> '+b, s, ['<','>','='], '« &lt; » veut dire « plus petit que », « &gt; » veut dire « plus grand que ». '+a+' est '+(a<b?'plus petit':'plus grand')+' que '+b+'.', 'M05-c'+a+'-'+b, {big:true});
});
N('M06','CP','L\'addition sans retenue', function(d){
  var a = R(1,7)*10 + R(0,5), b = d >= 2 ? R(1, 8-Math.floor(a/10))*10 + R(0, 9-a%10) : R(1, 9-a%10);
  return num(a+' + '+b+' = {?}', a+b, 'On ajoute les unités ('+a%10+' + '+b%10+' = '+(a%10+b%10)+'), puis les dizaines ('+Math.floor(a/10)+' + '+Math.floor(b/10)+' = '+(Math.floor(a/10)+Math.floor(b/10))+') : <b>'+(a+b)+'</b>.', 'M06-'+a+'+'+b);
});
N('M08','CP','La soustraction sans retenue', function(d){
  var a = R(2,9)*10 + R(3,9), b = d >= 2 ? R(1, Math.floor(a/10)-1)*10 + R(0, a%10) : R(1, a%10);
  return num(a+' − '+b+' = {?}', a-b, 'On enlève les unités ('+a%10+' − '+b%10+'), puis les dizaines : <b>'+(a-b)+'</b>. Vérifie : '+(a-b)+' + '+b+' = '+a+'.', 'M08-'+a+'-'+b);
});
N('M18','CP','Les formes géométriques', function(){
  var noms = ['carré','rectangle','triangle','cercle'], n = pick(noms);
  var e = {carré:'4 côtés de la même longueur et 4 coins droits : c\'est un <b>carré</b>.', rectangle:'4 côtés, 4 coins droits, et deux côtés plus longs : c\'est un <b>rectangle</b>.', triangle:'3 côtés et 3 sommets : c\'est un <b>triangle</b>.', cercle:'Une ligne courbe, toute ronde, sans coin : c\'est un <b>cercle</b>.'}[n];
  return ch('Quelle est cette forme ?', n, noms, e, 'M18-'+n, {vis:forme(n)});
});
N('M25','CP','Lire l\'heure : heure et demi-heure', function(){
  var h = R(1,12), m = pick([0,30]), rep = h+' h'+(m?' 30':'');
  var autres = [(h%12+1)+' h'+(m?' 30':''), h+' h'+(m?'':' 30'), (m ? 6 : h)+' h '+(m ? '00' : '30')].filter(function(x){ return x !== rep; });
  return ch('Quelle heure est-il ?', rep, A.uniq([rep].concat(autres)).slice(0,3), 'La petite aiguille (rouge) montre l\'heure, la grande (bleue) les minutes. '+(m ? 'La grande aiguille est sur le 6 : c\'est la demie, <b>'+rep+'</b>.' : 'La grande aiguille est sur le 12 : heure pile, <b>'+rep+'</b>.'), 'M25-'+h+'-'+m, {vis:horloge(h,m)});
});
var JOURS = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'], MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
N('M27','CP','Le calendrier : jours, semaines, mois', function(){
  var r = Math.random();
  if(r < .4){ var i = R(0,6), apres = Math.random() < .6, j = (i + (apres?1:6)) % 7; return ch('Quel jour vient juste '+(apres?'après':'avant')+' <b>'+JOURS[i]+'</b> ?', JOURS[j], A.uniq([JOURS[j], JOURS[(i+2)%7], JOURS[(i+5)%7]]), 'Lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche. '+(apres?'Après':'Avant')+' '+JOURS[i]+' : <b>'+JOURS[j]+'</b>.', 'M27-j'+i+apres); }
  if(r < .75){ var k = R(0,11), m = MOIS[(k+1)%12]; return ch('Quel mois vient juste après <b>'+MOIS[k]+'</b> ?', m, A.uniq([m, MOIS[(k+2)%12], MOIS[(k+11)%12]]), 'L\'ordre des mois : janvier, février, mars… Après '+MOIS[k]+' vient <b>'+m+'</b>.', 'M27-m'+k); }
  return pick([
    function(){ return num('Combien de jours dans une semaine ?<br>{?}', 7, 'Une semaine a <b>7</b> jours, de lundi à dimanche.', 'M27-s'); },
    function(){ return num('Combien de mois dans une année ?<br>{?}', 12, 'Une année a <b>12</b> mois, de janvier à décembre.', 'M27-a'); },
    function(){ return num('Combien de jours dans deux semaines ?<br>{?}', 14, '7 + 7 = <b>14</b> jours.', 'M27-2s'); }
  ])();
});

/* ═══ CE1 ═══ */
N('M02','CE1','Les nombres jusqu\'à 999', function(){
  var n = R(101, 989), c = Math.floor(n/100), di = Math.floor(n/10)%10, u = n%10, r = Math.random();
  if(r < .4) return num(c+' centaines, '+di+' dizaines et '+u+' unités = {?}', n, c+' centaines = '+c*100+', '+di+' dizaines = '+di*10+', '+u+' unités : <b>'+n+'</b>.', 'M02-d'+n);
  if(r < .7){ var q = pick([['centaines',c],['dizaines',di],['unités',u]]); return num('Dans <b>'+n+'</b>, le chiffre des '+q[0]+' est {?}', q[1], 'De gauche à droite : centaines, dizaines, unités. '+n+' : '+c+' centaines, '+di+' dizaines, '+u+' unités.', 'M02-c'+n+q[0]); }
  var plus = pick([1,10,100]); return num(n+' + '+plus+' = {?}', n+plus, 'Ajouter '+plus+', c\'est ajouter 1 au chiffre des '+(plus===1?'unités':plus===10?'dizaines':'centaines')+' : <b>'+(n+plus)+'</b>.', 'M02-p'+n+'-'+plus);
});
N('M07','CE1','L\'addition avec retenue', function(){
  var u1 = R(3,9), u2 = R(10-u1, 9), a = R(1,5)*10+u1, b = R(1,3)*10+u2;
  return num(a+' + '+b+' = {?}', a+b, 'Unités : '+u1+' + '+u2+' = '+(u1+u2)+', on écrit '+(u1+u2-10)+' et on retient 1 dizaine. Dizaines : '+Math.floor(a/10)+' + '+Math.floor(b/10)+' + 1 = '+(Math.floor(a/10)+Math.floor(b/10)+1)+'. Résultat : <b>'+(a+b)+'</b>.', 'M07-'+a+'+'+b);
});
N('M09','CE1','La soustraction avec retenue', function(){
  var u1 = R(0,7), u2 = R(u1+1, 9), a = R(3,9)*10+u1, b = R(1, Math.floor(a/10)-1)*10+u2;
  return num(a+' − '+b+' = {?}', a-b, 'On ne peut pas faire '+u1+' − '+u2+' : on prend une dizaine, '+(u1+10)+' − '+u2+' = '+(u1+10-u2)+'. Résultat : <b>'+(a-b)+'</b>. Vérifie : '+(a-b)+' + '+b+' = '+a+'.', 'M09-'+a+'-'+b);
});
N('M10','CE1','Addition ou soustraction ?', function(){
  var a = R(8,30), b = R(2,7), prenom = pick(['Léa','Tom','Nina','Hugo','Inès','Sacha']), obj = pick(['billes','images','bonbons','cartes']);
  var t = pick([
    ['a '+a+' '+obj+'. Il en gagne '+b+'. Combien en a-t-il maintenant ?', a+b, '+', 'Il <b>gagne</b> : il en a plus qu\'avant, on fait une addition.'],
    ['a '+a+' '+obj+'. Il en donne '+b+'. Combien lui en reste-t-il ?', a-b, '−', 'Il <b>donne</b> : il en a moins, on fait une soustraction.'],
    ['a '+a+' '+obj+'. On lui en offre '+b+'. Combien en a-t-il en tout ?', a+b, '+', '« En tout » et « on lui en offre » : on ajoute, addition.'],
    ['avait '+a+' '+obj+'. Il en a perdu '+b+'. Combien en a-t-il ?', a-b, '−', 'Il en <b>perd</b> : on enlève, soustraction.']
  ]);
  var fille = prenom === 'Léa' || prenom === 'Nina' || prenom === 'Inès';
  var q = prenom+' '+(fille ? t[0].replace('Il ', 'Elle ').replace('-t-il', '-t-elle') : t[0]);
  return num(q+'<br>{?}', t[1], t[3]+' '+a+' '+t[2]+' '+b+' = <b>'+t[1]+'</b>.', 'M10-'+t[2]+a+'-'+b);
});
N('M11','CE1','La multiplication : la notion', function(){
  var n = R(2,5), k = R(2,6), somme = Array(n).fill(k).join(' + ');
  return ch(somme+' = ?', n+' × '+k, A.uniq([n+' × '+k, (n+k)+' × 1', n+' + '+k, (n+1)+' × '+k]), 'On ajoute <b>'+n+' fois</b> le nombre '+k+' : c\'est '+n+' × '+k+' = '+(n*k)+'.', 'M11-'+n+'x'+k);
});
N('M12','CE1','Les tables de 2, 5 et 10', tables('M12', [2,5,10]));
N('M21','CE1','Les solides', B('M21', [
  ['Quel solide a 6 faces carrées toutes pareilles ?','le cube',['le pavé','la sphère'],'Le <b>cube</b> a 6 faces carrées identiques, comme un dé.'],
  ['Quel solide roule dans tous les sens et n\'a aucune face plate ?','la sphère',['le cube','le cylindre'],'La <b>sphère</b> est toute ronde, comme un ballon.'],
  ['Une boîte à chaussures a la forme…','d\'un pavé',['d\'un cube','d\'une sphère'],'Ses faces sont des rectangles : c\'est un <b>pavé</b>.'],
  ['Combien de faces a un cube ?','6',['4','8'],'Un cube a <b>6</b> faces : dessus, dessous et 4 côtés.'],
  ['Une boîte de conserve a la forme…','d\'un cylindre',['d\'une sphère','d\'un pavé'],'Deux disques et un côté qui roule : c\'est un <b>cylindre</b>.'],
  ['Combien de sommets a un cube ?','8',['6','12'],'Un cube a <b>8</b> sommets (les coins).']
]));
function unite(code, choix){ return B(code, choix); }
N('M22','CE1','Mesures de longueur : m, cm, mm', function(d){
  if(Math.random() < .5) return [
    ['La longueur d\'un crayon : 15…','cm',['m','mm'],'Un crayon mesure environ 15 <b>centimètres</b>.'],
    ['La hauteur d\'une porte : 2…','m',['cm','mm'],'Une porte mesure environ 2 <b>mètres</b>.'],
    ['L\'épaisseur d\'une pièce de monnaie : 2…','mm',['cm','m'],'Une pièce est très fine : 2 <b>millimètres</b>.'],
    ['La longueur d\'une cour d\'école : 40…','m',['cm','mm'],'Une cour mesure environ 40 <b>mètres</b>.']
  ].map(function(b,i){ return function(){ return ch(b[0], b[1], [b[1]].concat(b[2]), b[3], 'M22-u'+i); }; })[R(0,3)]();
  var m = R(1,5), c = R(1,4);
  return Math.random() < .5 ? num(m+' m = {?} cm', m*100, '1 m = 100 cm, donc '+m+' m = <b>'+m*100+' cm</b>.', 'M22-m'+m) : num(c+' cm = {?} mm', c*10, '1 cm = 10 mm, donc '+c+' cm = <b>'+c*10+' mm</b>.', 'M22-c'+c);
});
N('M23','CE1','Mesures de masse : kg et g', function(){
  if(Math.random() < .5){ var k = R(1,6); return num(k+' kg = {?} g', k*1000, '1 kg = 1 000 g, donc '+k+' kg = <b>'+(k*1000)+' g</b>.', 'M23-'+k); }
  return [['Un éléphant pèse 5 000…','kg',['g'],'Un éléphant est très lourd : des <b>kilogrammes</b>.'],['Une pomme pèse 150…','g',['kg'],'Une pomme est légère : 150 <b>grammes</b>.'],['Un enfant pèse 30…','kg',['g'],'30 <b>kilogrammes</b>.'],['Une gomme pèse 20…','g',['kg'],'Très léger : 20 <b>grammes</b>.']].map(function(b,i){ return function(){ return ch(b[0], b[1], [b[1]].concat(b[2]), b[3], 'M23-u'+i); }; })[R(0,3)]();
});
N('M26','CE1','Lire l\'heure : quarts et minutes', function(d){
  var h = R(1,12), m = d >= 2 ? R(1,11)*5 : pick([15,30,45]);
  var rep = h+' h '+(m<10?'0'+m:m);
  var autres = [(h%12+1)+' h '+(m<10?'0'+m:m), h+' h '+(60-m < 10 ? '0'+(60-m) : 60-m), (m/5 === h ? h+1 : m/5)+' h '+(h*5 < 10 ? '0'+h*5 : h*5)].filter(function(x){ return x !== rep; });
  return ch('Quelle heure est-il ?', rep, A.uniq([rep].concat(autres)).slice(0,3), 'La petite aiguille (rouge) montre l\'heure : '+h+'. La grande (bleue) est sur le '+(m/5)+' : '+(m/5)+' × 5 = '+m+' minutes. Il est <b>'+rep+'</b>.', 'M26-'+h+'-'+m, {vis:horloge(h,m)});
});
N('M28','CE1','Problèmes additifs', function(){
  var t = pick([
    function(){ var a = R(12,40), b = R(5,25); return num('Dans un bus, il y a '+a+' personnes. À l\'arrêt, '+b+' personnes montent. Combien de personnes y a-t-il maintenant ?<br>{?}', a+b, 'Des personnes montent : on ajoute. '+a+' + '+b+' = <b>'+(a+b)+'</b>.', 'M28-a'+a+'-'+b); },
    function(){ var a = R(30,60), b = R(5,25); return num('Un fermier a '+a+' poules. Il en vend '+b+'. Combien lui en reste-t-il ?<br>{?}', a-b, 'Il en vend : on enlève. '+a+' − '+b+' = <b>'+(a-b)+'</b>.', 'M28-b'+a+'-'+b); },
    function(){ var a = R(10,30), b = R(a+5, 60); return num('Léa a '+a+' images. Elle en veut '+b+'. Combien lui en manque-t-il ?<br>{?}', b-a, 'On cherche ce qu\'il faut ajouter à '+a+' pour faire '+b+' : '+b+' − '+a+' = <b>'+(b-a)+'</b>.', 'M28-c'+a+'-'+b); }
  ]);
  return t();
});

/* ═══ CE2 ═══ */
N('M03','CE2','Les nombres jusqu\'à 9 999', function(){
  var n = R(1001, 9989), mi = Math.floor(n/1000), c = Math.floor(n/100)%10, di = Math.floor(n/10)%10, u = n%10, r = Math.random();
  if(r < .4) return num(mi+' milliers, '+c+' centaines, '+di+' dizaines et '+u+' unités = {?}', n, 'On place chaque chiffre à son rang : <b>'+fmt(n)+'</b>.', 'M03-d'+n);
  if(r < .7){ var q = pick([['milliers',mi],['centaines',c],['dizaines',di]]); return num('Dans <b>'+fmt(n)+'</b>, le chiffre des '+q[0]+' est {?}', q[1], 'De gauche à droite : milliers, centaines, dizaines, unités.', 'M03-c'+n+q[0]); }
  var a = R(1001,9989), b = R(1001,9989); if(a === b) b++;
  return ch(fmt(a)+' <span class="blank">?</span> '+fmt(b), a < b ? '<' : '>', ['<','>','='], 'On compare d\'abord les milliers, puis les centaines, puis les dizaines.', 'M03-x'+a+'-'+b, {big:true});
});
N('M13','CE2','Les tables de 3, 4 et 6', tables('M13', [3,4,6]));
N('M14','CE2','Les tables de 7, 8 et 9', tables('M14', [7,8,9]));
N('M15','CE2','La multiplication posée', function(){
  var a = R(12, 48), b = R(2, 6), d1 = Math.floor(a/10)*10, u = a%10;
  return num(a+' × '+b+' = {?}', a*b, 'Décompose : '+d1+' × '+b+' = '+d1*b+' et '+u+' × '+b+' = '+u*b+'. Total : '+d1*b+' + '+u*b+' = <b>'+a*b+'</b>.', 'M15-'+a+'x'+b);
});
N('M16','CE2','La division : partager', function(){
  var b = R(2,6), q = R(2,9), n = b*q, obj = pick(['bonbons','billes','cartes','crayons']);
  return num('On partage '+n+' '+obj+' entre '+b+' enfants. Combien chacun en reçoit-il ?<br>{?}', q, 'Partager en '+b+' parts égales, c\'est diviser : '+n+' ÷ '+b+' = <b>'+q+'</b>, car '+b+' × '+q+' = '+n+'.', 'M16-'+n+'/'+b);
});
N('M17','CE2','Multiplication ou division ?', function(){
  var a = R(3,8), b = R(3,9);
  return pick([
    function(){ return num('Un paquet contient '+b+' biscuits. Combien de biscuits dans '+a+' paquets ?<br>{?}', a*b, ''+a+' paquets de '+b+' : on multiplie, '+a+' × '+b+' = <b>'+a*b+'</b>.', 'M17-m'+a+'x'+b); },
    function(){ return num('On range '+a*b+' œufs dans des boîtes de '+b+'. Combien de boîtes faut-il ?<br>{?}', a, 'Combien de fois '+b+' dans '+a*b+' ? On divise : '+a*b+' ÷ '+b+' = <b>'+a+'</b>.', 'M17-d'+a*b+'/'+b); }
  ])();
});
N('M19','CE2','Droites parallèles et perpendiculaires', function(){
  var t = pick(['parallèles','perpendiculaires','sécantes']);
  return ch('Ces deux droites sont…', t, ['parallèles','perpendiculaires','sécantes'], {parallèles:'Elles ne se croisent jamais et gardent le même écart : elles sont <b>parallèles</b>.', perpendiculaires:'Elles se coupent en formant un angle droit : elles sont <b>perpendiculaires</b>.', sécantes:'Elles se croisent, mais pas à angle droit : elles sont <b>sécantes</b>.'}[t], 'M19-'+t, {vis:droites(t)});
});
N('M20','CE2','Le périmètre', function(){
  var r = Math.random();
  if(r < .4){ var c = R(2,12); return num('Un carré a des côtés de <b>'+c+' cm</b>. Quel est son périmètre ?<br>{?} cm', 4*c, 'Le périmètre est la longueur du tour : 4 côtés de '+c+' cm, 4 × '+c+' = <b>'+4*c+' cm</b>.', 'M20-c'+c); }
  if(r < .8){ var L = R(5,15), l = R(2, L-1); return num('Un rectangle mesure <b>'+L+' cm</b> sur <b>'+l+' cm</b>. Quel est son périmètre ?<br>{?} cm', 2*(L+l), 'Le tour : '+L+' + '+l+' + '+L+' + '+l+' = <b>'+2*(L+l)+' cm</b>.', 'M20-r'+L+'-'+l); }
  var a = R(3,9), b = R(3,9), c2 = R(3,9); return num('Un triangle a des côtés de '+a+' cm, '+b+' cm et '+c2+' cm. Son périmètre ?<br>{?} cm', a+b+c2, 'On ajoute les trois côtés : '+a+' + '+b+' + '+c2+' = <b>'+(a+b+c2)+' cm</b>.', 'M20-t'+a+b+c2);
});
N('M24','CE2','Mesures de contenance : L et cL', function(){
  if(Math.random() < .55){ var l = R(1,5); return num(l+' L = {?} cL', l*100, '1 L = 100 cL, donc '+l+' L = <b>'+l*100+' cL</b>.', 'M24-'+l); }
  return [['Une bouteille d\'eau contient 1,5…','L',['cL','mL'],'Une grande bouteille : 1,5 <b>litre</b>.'],['Un verre contient 20…','cL',['L','mL'],'Un verre : 20 <b>centilitres</b>.'],['Une baignoire contient 150…','L',['cL','mL'],'Beaucoup d\'eau : 150 <b>litres</b>.'],['Une cuillère contient 5…','mL',['L','cL'],'Très peu : 5 <b>millilitres</b>.']].map(function(b,i){ return function(){ return ch(b[0], b[1], [b[1]].concat(b[2]), b[3], 'M24-u'+i); }; })[R(0,3)]();
});
N('M29','CE2','Problèmes multiplicatifs', function(){
  var a = R(3,9), b = R(4,9), p = pick([2,3,5]);
  return pick([
    function(){ return num('Dans une classe, il y a '+a+' rangées de '+b+' chaises. Combien de chaises en tout ?<br>{?}', a*b, a+' rangées de '+b+' : '+a+' × '+b+' = <b>'+a*b+'</b>.', 'M29-a'+a+'x'+b); },
    function(){ return num('Un cahier coûte '+p+' €. Combien coûtent '+a+' cahiers ?<br>{?} €', a*p, a+' × '+p+' = <b>'+a*p+' €</b>.', 'M29-b'+a+'x'+p); },
    function(){ return num('Une voiture a 4 roues. Combien de roues pour '+a+' voitures ?<br>{?}', 4*a, a+' × 4 = <b>'+4*a+'</b>.', 'M29-c'+a); }
  ])();
});
N('M30','CE2','Lire un tableau et un graphique', function(){
  var lab = ['Lun','Mar','Mer','Jeu','Ven'], val = lab.map(function(){ return R(1,9)*2; }), i = R(0,4), max = Math.max.apply(null,val);
  if(Math.random() < .5) return num('Combien de livres ont été lus le <b>'+['lundi','mardi','mercredi','jeudi','vendredi'][i]+'</b> ?<br>{?}', val[i], 'On lit la hauteur de la barre « '+lab[i]+' » sur l\'échelle de gauche : <b>'+val[i]+'</b>.', 'M30-'+val.join('')+i, {vis:graphe(lab,val)});
  var jour = ['lundi','mardi','mercredi','jeudi','vendredi'][val.indexOf(max)];
  return ch('Quel jour a-t-on lu le plus de livres ?', jour, ['lundi','mardi','mercredi','jeudi','vendredi'].slice(0), 'C\'est la barre la plus haute : <b>'+jour+'</b>.', 'M30-m'+val.join(''), {vis:graphe(lab,val)});
});

/* ═══ CM1 ═══ */
N('M301','CM1','Les grands nombres', function(){
  var n = R(1,9)*1000000 + R(0,999)*1000 + R(0,999), r = Math.random(), s = fmt(n);
  if(r < .5){ var q = pick([['millions',Math.floor(n/1e6)],['centaines de mille',Math.floor(n/1e5)%10],['dizaines de mille',Math.floor(n/1e4)%10],['milliers',Math.floor(n/1e3)%10]]); return num('Dans <b>'+s+'</b>, le chiffre des '+q[0]+' est {?}', q[1], 'On lit par classes de trois chiffres : millions | milliers | unités. '+s+'.', 'M301-'+n+q[0]); }
  var a = Math.floor(n/1000)*1000; return num('Arrondis <b>'+s+'</b> au millier près : {?}', Math.round(n/1000)*1000, 'On regarde le chiffre des centaines : '+(Math.floor(n/100)%10)+(Math.floor(n/100)%10 >= 5 ? ' ≥ 5, on arrondit au millier supérieur' : ' &lt; 5, on garde le millier')+' : <b>'+fmt(Math.round(n/1000)*1000)+'</b>.', 'M301-r'+n);
});
N('M302','CM1','Les fractions : la notion', function(){
  var d = R(2,8), n = R(1,d-1);
  if(Math.random() < .55) return ch('Quelle fraction est coloriée ?', n+'/'+d, A.uniq([n+'/'+d, (d-n)+'/'+d, d+'/'+n, n+'/'+(d+1)]).slice(0,4), 'La bande est coupée en <b>'+d+'</b> parts égales ([[denominateur]]) et <b>'+n+'</b> sont coloriées ([[numerateur]]) : '+n+'/'+d+'.', 'M302-'+n+'/'+d, {vis:barresFraction(n,d)});
  var k = R(2,6), N2 = d*k; return num(F(n,d)+' de '+N2+' = {?}', n*k, 'On partage '+N2+' en '+d+' : '+N2+' ÷ '+d+' = '+k+'. On prend '+n+' parts : '+n+' × '+k+' = <b>'+n*k+'</b>.', 'M302-d'+n+'/'+d+'de'+N2);
});
N('M303','CM1','Comparer des fractions', function(){
  var d = R(3,9), a = R(1,d-1), b = R(1,d-1); if(a === b) b = a === 1 ? 2 : a - 1;
  if(Math.random() < .5) return ch(F(a,d)+' <span class="blank">?</span> '+F(b,d), a < b ? '<' : '>', ['<','>','='], 'Même dénominateur : on compare les numérateurs. '+a+(a<b?' &lt; ':' &gt; ')+b+'.', 'M303-'+a+'-'+b+'/'+d, {big:true});
  var n = R(1,4), x = R(2,5), y = x + R(1,4);
  return ch(F(n,x)+' <span class="blank">?</span> '+F(n,y), '>', ['<','>','='], 'Même numérateur : plus on coupe en parts nombreuses, plus chaque part est petite. Donc '+n+'/'+x+' &gt; '+n+'/'+y+'.', 'M303-n'+n+'/'+x+'-'+y, {big:true});
});
N('M305','CM1','Les nombres décimaux', function(){
  if(Math.random() < .5){ var ip = R(1,99), dp = R(11,99), s = ip+','+dp, q = pick([['dixièmes',Math.floor(dp/10)],['centièmes',dp%10]]); return num('Dans <b>'+s+'</b>, le chiffre des '+q[0]+' est {?}', q[1], 'Après la virgule : le 1er chiffre compte les dixièmes, le 2e les centièmes.', 'M305-'+s+q[0]); }
  var x = R(0,12), p = R(1,9), q2 = R(10,99); if(p*10 === q2) q2++;
  var A1 = x+','+p, B1 = x+','+q2, va = +(x+'.'+p), vb = +(x+'.'+q2); if(Math.random() < .5){ var t = A1; A1 = B1; B1 = t; t = va; va = vb; vb = t; }
  return ch(A1+' <span class="blank">?</span> '+B1, va < vb ? '<' : '>', ['<','>','='], 'Même partie entière : écris-les avec autant de chiffres après la virgule ('+x+','+(String(p).length===1?p+'0':p)+' et '+x+','+q2+'). Un nombre plus long n\'est pas forcément plus grand !', 'M305-c'+A1+B1, {big:true});
});
N('M307','CM1','La division posée', function(){
  var b = R(2,9), q = R(12, 99), n = b*q;
  return num(n+' ÷ '+b+' = {?}', q, 'Cherche combien de fois '+b+' dans '+n+' : '+b+' × '+q+' = '+n+', donc le [[quotient]] est <b>'+q+'</b>.', 'M307-'+n+'/'+b);
});
N('M308','CM1','La multiplication de grands nombres', function(){
  var a = R(12, 99), b = pick([10,20,30,40,50,100,200]);
  return num(a+' × '+b+' = {?}', a*b, b >= 100 ? a+' × '+b/100+' = '+a*b/100+', puis × 100 : <b>'+a*b+'</b>.' : a+' × '+b/10+' = '+a*b/10+', puis × 10 : <b>'+a*b+'</b>.', 'M308-'+a+'x'+b);
});
N('M312','CM1','Périmètre ou aire', function(){
  var L = R(3,9), l = R(2, L);
  return pick([
    function(){ return num('Rectangle de '+L+' cm sur '+l+' cm. Son <b>périmètre</b> ?<br>{?} cm', 2*(L+l), 'Le [[perimetre|périmètre]] est le tour : 2 × ('+L+' + '+l+') = <b>'+2*(L+l)+' cm</b>.', 'M312-p'+L+l); },
    function(){ return num('Rectangle de '+L+' cm sur '+l+' cm. Son <b>aire</b> ?<br>{?} cm²', L*l, 'L\'[[aire]] est la surface : '+L+' × '+l+' = <b>'+L*l+' cm²</b>.', 'M312-a'+L+l); },
    function(){ return ch('Pour savoir combien de mètres de clôture il faut autour d\'un jardin, on calcule…', 'le périmètre', ['le périmètre','l\'aire'], 'La clôture fait le <b>tour</b> du jardin : c\'est le périmètre.', 'M312-c'); },
    function(){ return ch('Pour savoir combien de carrelage il faut pour couvrir un sol, on calcule…', 'l\'aire', ['le périmètre','l\'aire'], 'Le carrelage couvre la <b>surface</b> : c\'est l\'aire.', 'M312-s'); }
  ])();
});
N('M313','CM1','L\'aire du rectangle et du carré', function(){
  if(Math.random() < .4){ var c = R(2,12); return num('Aire d\'un carré de '+c+' cm de côté :<br>{?} cm²', c*c, 'Aire du carré = côté × côté = '+c+' × '+c+' = <b>'+c*c+' cm²</b>.', 'M313-c'+c); }
  var L = R(3,15), l = R(2,9); return num('Aire d\'un rectangle de '+L+' m sur '+l+' m :<br>{?} m²', L*l, 'Aire = longueur × largeur = '+L+' × '+l+' = <b>'+L*l+' m²</b>.', 'M313-r'+L+l);
});
N('M316','CM1','Les angles', function(){
  var t = pick(['aigu','droit','obtus']), deg = t === 'droit' ? 90 : t === 'aigu' ? R(25,70) : R(110,160);
  return ch('Cet angle est…', t, ['aigu','droit','obtus'], {aigu:'Il est plus petit qu\'un angle droit : angle <b>aigu</b>.', droit:'Il forme un coin parfait, comme l\'équerre : angle <b>droit</b>.', obtus:'Il est plus ouvert qu\'un angle droit : angle <b>obtus</b>.'}[t], 'M316-'+t+deg, {vis:angle(deg)});
});
N('M317','CM1','Les triangles', B('M317', [
  ['Un triangle qui a 3 côtés de la même longueur est…','équilatéral',['isocèle','rectangle'],'3 côtés égaux : triangle <b>équilatéral</b>.'],
  ['Un triangle qui a 2 côtés de la même longueur est…','isocèle',['équilatéral','rectangle'],'2 côtés égaux : triangle <b>isocèle</b>.'],
  ['Un triangle qui a un angle droit est…','rectangle',['isocèle','équilatéral'],'Un angle droit : triangle <b>rectangle</b>.'],
  ['Un triangle a des côtés de 5 cm, 5 cm et 3 cm. Il est…','isocèle',['équilatéral','quelconque'],'Deux côtés égaux (5 cm) : <b>isocèle</b>.'],
  ['Combien d\'angles a un triangle ?','3',['4','2'],'Un triangle a <b>3</b> côtés et 3 angles.'],
  ['Un triangle a des côtés de 4 cm, 4 cm et 4 cm. Il est…','équilatéral',['isocèle seulement','rectangle'],'Trois côtés égaux : <b>équilatéral</b>.']
]));
N('M318','CM1','Les quadrilatères', B('M318', [
  ['Un quadrilatère avec 4 angles droits et 4 côtés égaux est…','un carré',['un losange','un rectangle'],'4 angles droits + 4 côtés égaux : c\'est un <b>carré</b>.'],
  ['Un quadrilatère avec 4 côtés égaux mais sans angle droit est…','un losange',['un carré','un rectangle'],'4 côtés égaux, pas d\'angle droit : <b>losange</b>.'],
  ['Un quadrilatère avec 4 angles droits et des côtés opposés égaux est…','un rectangle',['un losange','un trapèze'],'4 angles droits : <b>rectangle</b>.'],
  ['Combien de côtés a un quadrilatère ?','4',['3','5'],'« quadri » veut dire quatre : <b>4</b> côtés.'],
  ['Un carré est aussi…','un rectangle et un losange',['seulement un rectangle','un triangle'],'Il a 4 angles droits (rectangle) et 4 côtés égaux (losange).'],
  ['Un quadrilatère avec seulement deux côtés parallèles est…','un trapèze',['un losange','un carré'],'Deux côtés parallèles seulement : <b>trapèze</b>.']
]));

/* ═══ CM2 ═══ */
N('M304','CM2','Fractions et nombres décimaux', function(){
  var l = [[1,2],[1,4],[3,4],[1,10],[3,10],[7,10],[1,100],[25,100],[1,5],[2,5]], f = pick(l), v = fix(f[0]/f[1]);
  if(Math.random() < .3 && (f[1] === 10 || f[1] === 100)) return num(fmt(v)+' = '+F('{?}', f[1]), f[0], fmt(v)+', c\'est '+f[0]+' '+(f[1]===10?'dixième':'centième')+(f[0]>1?'s':'')+'.', 'M304-r'+f.join('/'));
  return num(F(f[0], f[1])+' = {?}', v, F(f[0],f[1])+' = '+f[0]+' ÷ '+f[1]+' = <b>'+fmt(v)+'</b>.', 'M304-'+f.join('/'));
});
N('M306','CM2','Opérations sur les nombres décimaux', function(){
  var r = Math.random();
  if(r < .35){ var a = R(11,99)/10, b = R(11,99)/10; return num(fmt(a)+' + '+fmt(b)+' = {?}', a+b, 'On aligne les virgules : unités avec unités, dixièmes avec dixièmes. Résultat : <b>'+fmt(a+b)+'</b>.', 'M306-a'+a+b); }
  if(r < .6){ var A1 = R(30,99), B1 = R(11,A1-1); return num(fmt(A1/10)+' − '+fmt(B1/10)+' = {?}', (A1-B1)/10, 'Compte en dixièmes : '+A1+' − '+B1+' = '+(A1-B1)+' dixièmes = <b>'+fmt((A1-B1)/10)+'</b>.', 'M306-s'+A1+B1); }
  var n = R(101,999)/100, f = pick([10,100,1000]), mul = Math.random() < .5, res = mul ? n*f : n/f, k = String(f).length-1;
  return num(fmt(n)+' '+(mul?'×':'÷')+' '+f+' = {?}', res, (mul ? 'Chaque chiffre devient '+f+' fois plus grand : il glisse de '+k+' rang'+(k>1?'s':'')+' vers la gauche' : 'Chaque chiffre devient '+f+' fois plus petit : il glisse de '+k+' rang'+(k>1?'s':'')+' vers la droite')+'. <b>'+fmt(res)+'</b>.', 'M306-p'+n+(mul?'x':'/')+f);
});
N('M309','CM2','La proportionnalité', function(){
  var u = R(2,9), a = R(2,5), b = a * R(2,4), obj = pick(['croissants','cahiers','billets de cinéma','tickets de bus']);
  return num(a+' '+obj+' coûtent '+a*u+' €. Combien coûtent '+b+' '+obj+' ?<br>{?} €', b*u, 'Un seul coûte '+a*u+' ÷ '+a+' = '+u+' €. Donc '+b+' coûtent '+b+' × '+u+' = <b>'+b*u+' €</b>.', 'M309-'+a+u+b);
});
N('M310','CM2','Les tableaux de proportionnalité', function(){
  var k = R(2,9), x = [R(1,5), R(6,10), R(11,15)];
  var i = R(0,2), cells = x.map(function(v,j){ return j === i ? '?' : v*k; });
  return num('Tableau de proportionnalité :'+tableau(['Quantité'].concat(x.map(String)), [['Prix (€)'].concat(cells.map(String))])+'Valeur manquante : {?}', x[i]*k, 'Le prix est toujours '+k+' fois la quantité (coefficient '+k+') : '+x[i]+' × '+k+' = <b>'+x[i]*k+'</b>.', 'M310-'+k+x.join('')+i);
});
N('M314','CM2','L\'aire du triangle et du disque', function(){
  if(Math.random() < .6){ var b = R(2,12)*2, h = R(2,10); return num('Aire d\'un triangle de base '+b+' cm et de hauteur '+h+' cm :<br>{?} cm²', b*h/2, 'Aire du triangle = base × hauteur ÷ 2 = '+b+' × '+h+' ÷ 2 = <b>'+b*h/2+' cm²</b>.', 'M314-t'+b+h); }
  var r = pick([1,2,3,10]); return num('Aire d\'un disque de rayon '+r+' cm (prends π = 3,14) :<br>{?} cm²', fix(3.14*r*r), 'Aire du disque = π × rayon × rayon = 3,14 × '+r+' × '+r+' = <b>'+fmt(3.14*r*r)+' cm²</b>.', 'M314-d'+r);
});
N('M315','CM2','Le volume du pavé droit', function(){
  var L = R(2,8), l = R(2,6), h = R(2,5);
  return num('Volume d\'un pavé de '+L+' cm × '+l+' cm × '+h+' cm :<br>{?} cm³', L*l*h, 'Volume = longueur × largeur × hauteur = '+L+' × '+l+' × '+h+' = <b>'+L*l*h+' cm³</b>.', 'M315-'+L+l+h);
});
N('M319','CM2','Le cercle', function(){
  var r = R(2,15);
  return Math.random() < .5 ? num('Un cercle a un rayon de '+r+' cm. Son diamètre ?<br>{?} cm', 2*r, 'Le diamètre est le double du rayon : 2 × '+r+' = <b>'+2*r+' cm</b>.', 'M319-r'+r) : num('Un cercle a un diamètre de '+2*r+' cm. Son rayon ?<br>{?} cm', r, 'Le rayon est la moitié du diamètre : '+2*r+' ÷ 2 = <b>'+r+' cm</b>.', 'M319-d'+r);
});
N('M320','CM2','Lire et construire des graphiques', function(){
  var lab = ['Foot','Danse','Judo','Tennis'], val = lab.map(function(){ return R(1,10)*2; }), i = R(0,3), j = (i+1+R(0,2))%4;
  if(Math.random() < .5) return num('Combien d\'élèves font du <b>'+lab[i].toLowerCase()+'</b> ?<br>{?}', val[i], 'On lit la hauteur de la barre sur l\'échelle : <b>'+val[i]+'</b>.', 'M320-'+val.join('')+i, {vis:graphe(lab,val)});
  return num('Combien d\'élèves de plus font du '+lab[i].toLowerCase()+' que du '+lab[j].toLowerCase()+' ?<br>{?}', Math.abs(val[i]-val[j]), 'On lit les deux barres ('+val[i]+' et '+val[j]+') et on fait la différence : <b>'+Math.abs(val[i]-val[j])+'</b>.', 'M320-d'+val.join('')+i+j, {vis:graphe(lab,val)});
});

/* ═══ 6e ═══ */
N('M311','6e','Les pourcentages', function(){
  var p = pick([10,20,25,50,75]), base = p === 25 || p === 75 ? R(1,20)*4 : R(1,20)*10;
  return num(p+' % de '+base+' = {?}', base*p/100, p+' %, c\'est '+p+' sur 100. '+(p===50?'C\'est la moitié':p===25?'C\'est le quart':p===75?'C\'est les trois quarts':p===10?'C\'est un dixième':'C\'est deux dixièmes')+' : <b>'+fmt(base*p/100)+'</b>.', 'M311-'+p+'de'+base);
});
N('M321','6e','Moyenne et médiane', function(){
  var n = pick([3,5]), v = []; for(var i=0;i<n;i++) v.push(R(2,18));
  var s = v.reduce(function(a,b){ return a+b; },0); if(s % n){ v[0] += n - s % n; s = v.reduce(function(a,b){ return a+b; },0); }
  if(Math.random() < .5) return num('Notes : '+v.join(' ; ')+'. Quelle est la moyenne ?<br>{?}', s/n, 'On additionne ('+s+') et on divise par le nombre de notes ('+n+') : <b>'+fmt(s/n)+'</b>.', 'M321-m'+v.join('-'));
  var t = v.slice().sort(function(a,b){ return a-b; }); return num('Valeurs : '+v.join(' ; ')+'. Quelle est la médiane ?<br>{?}', t[(n-1)/2], 'On range dans l\'ordre ('+t.join(' ; ')+') et on prend la valeur du milieu : <b>'+t[(n-1)/2]+'</b>.', 'M321-d'+v.join('-'));
});

/* ═══ 5e ═══ */
N('M401','5e','Les nombres relatifs', function(){
  var a = R(-9,9), b = R(-9,9), r = Math.random(), sb = b < 0 ? '('+fmt(b)+')' : fmt(b);
  if(r < .4) return num(fmt(a)+' + '+sb+' = {?}', a+b, 'Ajouter un [[relatif|nombre]] négatif revient à reculer sur la droite graduée. '+fmt(a)+' + '+sb+' = <b>'+fmt(a+b)+'</b>.', 'M401-a'+a+b, {neg:true});
  if(r < .75) return num(fmt(a)+' − '+sb+' = {?}', a-b, 'Soustraire un nombre, c\'est ajouter son opposé : '+fmt(a)+' − '+sb+' = '+fmt(a)+' + '+(-b < 0 ? '('+fmt(-b)+')' : fmt(-b))+' = <b>'+fmt(a-b)+'</b>.', 'M401-s'+a+b, {neg:true});
  if(a === b) b = a - 1;
  return ch(fmt(a)+' <span class="blank">?</span> '+fmt(b), a < b ? '<' : '>', ['<','>','='], 'Sur la droite graduée, le plus petit est le plus à gauche. Entre deux négatifs, le plus petit est celui qui est le plus loin de zéro.', 'M401-c'+a+b, {big:true});
});
N('M404','5e','Les fractions : opérations', function(){
  var d = R(3,9), a = R(1,d-1), b = R(1,d-1), r = Math.random();
  if(r < .5) return num(F(a,d)+' + '+F(b,d)+' = '+F('{?}', d), a+b, 'Même dénominateur : on additionne les numérateurs et on garde le dénominateur. '+a+' + '+b+' = <b>'+(a+b)+'</b>.', 'M404-a'+a+b+d);
  var c = R(2,5), e = R(2,5); return num(F(a,d)+' × '+F(c,e)+' = '+F('{?}', d*e), a*c, 'On multiplie les numérateurs entre eux ('+a+' × '+c+') et les dénominateurs entre eux ('+d+' × '+e+') : '+F(a*c, d*e)+'.', 'M404-m'+a+d+c+e);
});
N('M405','5e','Les expressions littérales', function(){
  var a = R(2,9), b = R(1,9), x = R(1,6);
  if(Math.random() < .55) return num('Calcule <b>'+a+'x + '+b+'</b> pour x = '+x+' :<br>{?}', a*x+b, 'On remplace x par '+x+' : '+a+' × '+x+' + '+b+' = '+a*x+' + '+b+' = <b>'+(a*x+b)+'</b>. (« '+a+'x » veut dire '+a+' × x.)', 'M405-e'+a+b+x);
  var c = R(2,9); return ch('Réduis : <b>'+a+'x + '+c+'x</b>', (a+c)+'x', A.uniq([(a+c)+'x', (a*c)+'x', (a+c)+'x²', (a+c)+'']), 'On compte les x : '+a+' x plus '+c+' x, cela fait <b>'+(a+c)+'x</b>.', 'M405-r'+a+c);
});
N('M410','5e','Les transformations géométriques', B('M410', [
  ['Plier une figure le long d\'une droite pour la retourner, c\'est…','une symétrie axiale',['une translation','une symétrie centrale'],'La figure est retournée comme dans un miroir, par rapport à un axe : symétrie axiale.'],
  ['Faire faire un demi-tour à une figure autour d\'un point, c\'est…','une symétrie centrale',['une symétrie axiale','une translation'],'Un demi-tour autour d\'un point : symétrie centrale.'],
  ['Faire glisser une figure sans la tourner, c\'est…','une translation',['une rotation','une symétrie axiale'],'La figure glisse dans une direction, sans tourner : translation.'],
  ['Faire tourner une figure d\'un certain angle autour d\'un point, c\'est…','une rotation',['une translation','une symétrie axiale'],'On tourne autour d\'un centre : rotation.'],
  ['Une symétrie conserve-t-elle les longueurs ?','oui',['non','seulement les angles'],'Les symétries, translations et rotations conservent les longueurs, les angles et les aires.']
]));
N('M411','5e','Les statistiques : représentations', B('M411', [
  ['Pour montrer la part de chaque réponse dans un total, on utilise plutôt…','un diagramme circulaire',['un tableau de nombres','une droite graduée'],'Le diagramme circulaire montre bien les parts d\'un tout.'],
  ['Dans un diagramme circulaire, la moitié des réponses correspond à un angle de…','180°',['90°','360°'],'Le disque entier fait 360°, la moitié fait <b>180°</b>.'],
  ['Le quart d\'un diagramme circulaire correspond à…','90°',['45°','180°'],'360° ÷ 4 = <b>90°</b>.'],
  ['L\'effectif d\'une valeur, c\'est…','le nombre de fois qu\'elle apparaît',['sa position','la plus grande valeur'],'L\'effectif compte combien de fois une valeur est présente.'],
  ['Sur 20 élèves, 5 font du judo. La fréquence du judo est…','25 %',['5 %','20 %'],'5 sur 20 = 1/4 = <b>25 %</b>.']
]));
N('M412','5e','Les probabilités', function(){
  var r = Math.random();
  if(r < .5){ var k = R(1,5); return ch('On lance un dé à 6 faces. Probabilité d\'obtenir '+(k===1?'un 1':'un nombre inférieur ou égal à '+k)+' ?', k+'/6', A.uniq([k+'/6', '1/'+k, (6-k)+'/6', k+'/'+(k+6)]).slice(0,3), 'Il y a 6 issues possibles et '+k+' favorable'+(k>1?'s':'')+' : la probabilité est <b>'+k+'/6</b>.', 'M412-d'+k); }
  var rouges = R(1,6), bleues = R(1,6), t = rouges+bleues;
  return ch('Une urne contient '+rouges+' boules rouges et '+bleues+' boules bleues. Probabilité de tirer une rouge ?', rouges+'/'+t, A.uniq([rouges+'/'+t, rouges+'/'+bleues, bleues+'/'+t, '1/'+t]).slice(0,3), 'Issues favorables ('+rouges+' rouges) sur issues possibles ('+t+' boules) : <b>'+rouges+'/'+t+'</b>.', 'M412-u'+rouges+bleues);
});

/* ═══ 4e ═══ */
N('M402','4e','Les puissances de 10', function(){
  var r = Math.random(), n = R(1,6);
  if(r < .4) return num('10<sup>'+n+'</sup> = {?}', Math.pow(10,n), '10<sup>'+n+'</sup> s\'écrit 1 suivi de '+n+' zéro'+(n>1?'s':'')+' : <b>'+fmt(Math.pow(10,n))+'</b>.', 'M402-p'+n);
  if(r < .75){ var a = R(11,99)/10, k = R(1,4); return num(fmt(a)+' × 10<sup>'+k+'</sup> = {?}', a*Math.pow(10,k), 'Multiplier par 10<sup>'+k+'</sup> décale la virgule de '+k+' rang'+(k>1?'s':'')+' vers la droite : <b>'+fmt(a*Math.pow(10,k))+'</b>.', 'M402-m'+a+k); }
  var p = R(2,5), q = R(2,5); return num('10<sup>'+p+'</sup> × 10<sup>'+q+'</sup> = 10<sup>{?}</sup>', p+q, 'On ajoute les exposants : '+p+' + '+q+' = <b>'+(p+q)+'</b>.', 'M402-x'+p+q);
});
N('M403','4e','Les racines carrées', function(){
  var n = R(1,15);
  return Math.random() < .7 ? num('√'+n*n+' = {?}', n, 'On cherche le nombre positif qui, multiplié par lui-même, donne '+n*n+' : '+n+' × '+n+' = '+n*n+', donc <b>'+n+'</b>.', 'M403-'+n) : num('('+n+')² = {?}', n*n, n+' × '+n+' = <b>'+n*n+'</b>.', 'M403-c'+n);
});
N('M406','4e','Les équations du premier degré', function(){
  var a = R(2,9), x = R(-5,9), b = R(-9,12), c = a*x + b;
  var eq = a+'x '+(b >= 0 ? '+ '+b : '− '+(-b))+' = '+fmt(c);
  return num('Résous : <b>'+eq+'</b><br>x = {?}', x, (b >= 0 ? 'On enlève '+b : 'On ajoute '+(-b))+' des deux côtés : '+a+'x = '+fmt(c-b)+'. Puis on divise par '+a+' : x = <b>'+fmt(x)+'</b>.', 'M406-'+a+b+x, {neg:true});
});
var TRIPLES = [[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[12,16,20]];
N('M407','4e','Le théorème de Pythagore', function(){
  var t = pick(TRIPLES);
  if(Math.random() < .6) return num('Triangle rectangle : les côtés de l\'angle droit mesurent '+t[0]+' cm et '+t[1]+' cm. L\'hypoténuse mesure ?<br>{?} cm', t[2], 'Pythagore : hypoténuse² = '+t[0]+'² + '+t[1]+'² = '+t[0]*t[0]+' + '+t[1]*t[1]+' = '+t[2]*t[2]+'. Donc hypoténuse = √'+t[2]*t[2]+' = <b>'+t[2]+' cm</b>.', 'M407-h'+t.join('-'));
  return num('Triangle rectangle : hypoténuse '+t[2]+' cm, un côté '+t[0]+' cm. L\'autre côté mesure ?<br>{?} cm', t[1], ''+t[2]+'² − '+t[0]+'² = '+t[2]*t[2]+' − '+t[0]*t[0]+' = '+t[1]*t[1]+'. Donc le côté = √'+t[1]*t[1]+' = <b>'+t[1]+' cm</b>.', 'M407-c'+t.join('-'));
});
N('M408','4e','Le théorème de Thalès', function(){
  var k = pick([2,3,4]), AM = R(2,6), AN = R(2,6), MN = R(2,7);
  return num('(MN) est parallèle à (BC). AM = '+AM+' cm, AB = '+AM*k+' cm, MN = '+MN+' cm. Combien mesure BC ?<br>{?} cm', MN*k, 'Thalès : AM/AB = MN/BC. Le rapport AB/AM vaut '+k+', donc BC = '+MN+' × '+k+' = <b>'+MN*k+' cm</b>.', 'M408-'+k+AM+MN);
});
N('M413','4e','Les probabilités (niveau 2)', function(){
  var p = pick([[1,4],[2,5],[3,10],[1,3],[3,8]]), q = (p[1]-p[0])+'/'+p[1];
  if(Math.random() < .5) return ch('La probabilité qu\'il pleuve demain est '+p[0]+'/'+p[1]+'. Probabilité qu\'il ne pleuve pas ?', q, A.uniq([q, p[0]+'/'+p[1], '1/'+p[1]]), 'Un événement et son contraire ont des probabilités qui s\'ajoutent pour faire 1 : 1 − '+p[0]+'/'+p[1]+' = <b>'+q+'</b>.', 'M413-c'+p.join('/'));
  return ch('On lance deux fois une pièce. Probabilité d\'obtenir deux fois pile ?', '1/4', ['1/4','1/2','2/4'], 'Quatre issues équiprobables (PP, PF, FP, FF), une seule favorable : <b>1/4</b>.', 'M413-pp');
});

/* ═══ 3e ═══ */
N('M409','3e','La trigonométrie', function(){
  var r = Math.random();
  if(r < .5) return [
    ['Dans un triangle rectangle, le cosinus d\'un angle aigu est…','côté adjacent ÷ hypoténuse',['côté opposé ÷ hypoténuse','côté opposé ÷ côté adjacent'],'<b>CAH</b> : Cosinus = Adjacent / Hypoténuse.'],
    ['Dans un triangle rectangle, le sinus d\'un angle aigu est…','côté opposé ÷ hypoténuse',['côté adjacent ÷ hypoténuse','côté adjacent ÷ côté opposé'],'<b>SOH</b> : Sinus = Opposé / Hypoténuse.'],
    ['Dans un triangle rectangle, la tangente d\'un angle aigu est…','côté opposé ÷ côté adjacent',['côté adjacent ÷ hypoténuse','côté opposé ÷ hypoténuse'],'<b>TOA</b> : Tangente = Opposé / Adjacent.']
  ].map(function(b,i){ return function(){ return ch(b[0], b[1], [b[1]].concat(b[2]), b[3]+' Retiens « SOH CAH TOA ».', 'M409-d'+i); }; })[R(0,2)]();
  var h = R(2,10)*2;
  return Math.random() < .5 ? num('Triangle rectangle : hypoténuse '+h+' cm, angle de 60°. Le côté adjacent à cet angle mesure ?<br><span class="muted">(cos 60° = 0,5)</span><br>{?} cm', h/2, 'cos 60° = adjacent ÷ hypoténuse, donc adjacent = '+h+' × 0,5 = <b>'+fmt(h/2)+' cm</b>.', 'M409-c'+h) : num('Triangle rectangle : hypoténuse '+h+' cm, angle de 30°. Le côté opposé à cet angle mesure ?<br><span class="muted">(sin 30° = 0,5)</span><br>{?} cm', h/2, 'sin 30° = opposé ÷ hypoténuse, donc opposé = '+h+' × 0,5 = <b>'+fmt(h/2)+' cm</b>.', 'M409-s'+h);
});
N('M414','3e','Les fonctions : la notion', function(){
  var a = R(-4,5) || 2, b = R(-6,6), x = R(-3,5), fx = a*x + b, expr = (a === 1 ? '' : a === -1 ? '−' : fmt(a))+'x'+(b ? (b > 0 ? ' + '+b : ' − '+(-b)) : '');
  if(Math.random() < .6) return num('f(x) = '+expr+'. Calcule f('+fmt(x)+') :<br>{?}', fx, 'On remplace x par '+fmt(x)+' : f('+fmt(x)+') = '+fmt(a)+' × '+(x < 0 ? '('+fmt(x)+')' : fmt(x))+(b ? (b > 0 ? ' + '+b : ' − '+(-b)) : '')+' = <b>'+fmt(fx)+'</b>. C\'est l\'image de '+fmt(x)+'.', 'M414-'+a+b+x, {neg:true});
  return ch('f(2) = 7. Alors…', '7 est l\'image de 2', ['7 est l\'image de 2','2 est l\'image de 7','7 est l\'antécédent de 2'], 'Le nombre de départ (2) a pour <b>image</b> le résultat (7). 2 est un antécédent de 7.', 'M414-v');
});
N('M415','3e','Fonctions linéaires et affines', function(){
  var a = R(2,7), b = R(1,9), r = Math.random();
  if(r < .45){ var lin = Math.random() < .5; return ch('f(x) = '+a+'x'+(lin?'':' + '+b)+' est une fonction…', lin ? 'linéaire' : 'affine', ['linéaire','affine'], lin ? 'Elle est de la forme f(x) = ax : fonction <b>linéaire</b>. Sa droite passe par l\'origine.' : 'Elle est de la forme f(x) = ax + b avec b ≠ 0 : fonction <b>affine</b>.', 'M415-t'+a+(lin?'':b)); }
  if(r < .75) return num('f(x) = '+a+'x + '+b+'. Quel est le coefficient directeur ?<br>{?}', a, 'Dans f(x) = ax + b, le coefficient directeur est <b>a</b>, le nombre devant x : <b>'+a+'</b>.', 'M415-a'+a+b);
  return num('f(x) = '+a+'x + '+b+'. Quelle est l\'ordonnée à l\'origine ?<br>{?}', b, 'C\'est <b>b</b>, la valeur de f(0) : <b>'+b+'</b>.', 'M415-b'+a+b);
});
})();
