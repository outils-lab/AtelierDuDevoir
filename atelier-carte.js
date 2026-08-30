/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Composant CARTE (v1)
   Cartes SVG cliquables à calques superposables.
   Les frontières sont un calque comme un autre : on peut donc
   poser sur un même fond de terres la France d'aujourd'hui,
   la Gaule romaine ou l'Europe de 1914.

   Dépendances : atelier-carte.css + cartes/<nom>.js
   Exposé : window.AFCarte
     .rendre(ex, i, hote, api)   exercice (modes designer / placer)
     .besoinVerif(ex)            true si le mode réclame « Vérifier »
     .verifier(ex, i)            → points
     .decouverte(conf, hote)     carte de leçon, non notée
     .monterLecons(lecon)        monte les cartes des blocs de leçon
   ═══════════════════════════════════════════════════════════ */
(function () {
'use strict';

var uid = 0;

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s == null ? '' : s;
  return d.innerHTML;
}
function shuffle(a) {
  var r = a.slice(), i, j, t;
  for (i = r.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = r[i]; r[i] = r[j]; r[j] = t; }
  return r;
}
function tab(v) { return Array.isArray(v) ? v : [v]; }
function laCarte(nom) { return (window.CARTES || {})[nom]; }
function calque(C, cle) { return (C && C.calques[cle]) || null; }
function item(C, cle, id) {
  var L = calque(C, cle);
  if (!L) return null;
  for (var k = 0; k < L.items.length; k++) if (L.items[k].id === id) return L.items[k];
  return null;
}
function nomDe(C, cle, id) { var it = item(C, cle, id); return it ? it.nom : id; }

/* Résout le tracé d'une entité (`ref` renvoie vers un autre calque) */
function traceDe(C, it) {
  if (it.ref) {
    var L = calque(C, it.ref);
    return L ? L.items.map(function (x) { return traceDe(C, x); }).join('') : '';
  }
  return it.d || '';
}

/* ═══ RENDU SVG ═══ */

function itemsDe(L, only) {
  if (!only) return L.items;
  return L.items.filter(function (it) { return only.indexOf(it.id) >= 0; });
}

function svgZones(C, L, cle, cible, n, only) {
  var clip = L.clip ? ' clip-path="url(#clip' + n + '-' + L.clip + ')"' : '';
  var h = '<g class="cq cq-' + cle + '"' + clip + '>';
  itemsDe(L, only).forEach(function (it) {
    var d = traceDe(C, it);
    if (!d) return;
    var st = it.style || L.style;
    if (st === 'nation' || st === 'etranger') h += '<path class="cz-halo" d="' + d + '"/>';
    h += '<path class="cz' + (st ? ' cz-' + st : '') + (cible ? ' cible' : '') + '" d="' + d + '"'
       + ' data-id="' + esc(it.id) + '"'
       + (cible ? ' tabindex="0" role="button"' : '') + '/>';
  });
  return h + '</g>';
}

function svgTraces(C, L, cle, cible, n, only) {
  var h = '<g class="cq cq-' + cle + '">';
  itemsDe(L, only).forEach(function (it) {
    h += '<path class="ct' + (L.style ? ' ct-' + L.style : '') + '" id="tr' + n + '-'
       + esc(it.id) + '" d="' + traceDe(C, it) + '"/>';
  });
  if (cible) itemsDe(L, only).forEach(function (it) {
    h += '<path class="ct-hit cible" d="' + traceDe(C, it) + '" data-id="' + esc(it.id)
       + '" tabindex="0" role="button"/>';
  });
  return h + '</g>';
}

function svgPoints(C, L, cle, cible, only) {
  var h = '<g class="cq cq-' + cle + '">';
  itemsDe(L, only).forEach(function (it) {
    var r = it.rang === 1 ? 6.5 : (it.rang === 2 ? 5 : 4);
    h += '<circle class="cp-dot' + (it.rang === 1 ? ' cap' : '') + '" cx="' + it.x
       + '" cy="' + it.y + '" r="' + r + '"/>';
  });
  if (cible) itemsDe(L, only).forEach(function (it) {
    h += '<circle class="cp-hit cible" cx="' + it.x + '" cy="' + it.y + '" r="17" '
       + 'data-id="' + esc(it.id) + '" tabindex="0" role="button"/>';
  });
  return h + '</g>';
}

function svgCalque(C, cle, cible, n, only) {
  var L = calque(C, cle);
  if (!L) return '';
  if (L.type === 'traces') return svgTraces(C, L, cle, cible, n, only);
  if (L.type === 'points') return svgPoints(C, L, cle, cible, only);
  return svgZones(C, L, cle, cible, n, only);
}

function svgClips(C, n) {
  var h = '';
  Object.keys(C.calques).forEach(function (cle) {
    var L = C.calques[cle];
    if (!L.masque) return;
    h += '<clipPath id="clip' + n + '-' + cle + '">'
       + L.items.map(function (it) { return '<path d="' + traceDe(C, it) + '"/>'; }).join('')
       + '</clipPath>';
  });
  return h;
}

function svgBoussole(vb) {
  return '<g class="c-boussole" transform="translate(' + (vb[2] - 44) + ',34)">'
    + '<circle r="17"/><path class="aig" d="M0 -13 4.5 3 0 0.5 -4.5 3Z"/>'
    + '<text y="-19">N</text></g>';
}

function svgEchelle(vb, C) {
  var e = C.echelle, L, lib;
  if (e) { L = e.px; lib = e.label; }
  else { L = Math.round(100 / (C.kmParPx || 1.87)); lib = '100 km'; }
  return '<g class="c-echelle" transform="translate(22,' + (vb[3] - 24) + ')">'
    + '<path d="M0 0h' + L + 'M0 -5v10M' + L + ' -5v10"/>'
    + '<text x="' + (L / 2) + '" y="-9">' + lib + '</text></g>';
}

/* conf : {carte, affiche:[], cible, noms:[], boussole, echelle} */
function svgCarte(conf) {
  var C = laCarte(conf.carte);
  if (!C) return '<p class="carte-err">Carte « ' + esc(conf.carte) + ' » introuvable.</p>';
  var n = ++uid;
  var vb = C.viewBox.split(/\s+/).map(Number);
  var h = '<svg class="carte-svg" data-uid="' + n + '" viewBox="' + C.viewBox + '" '
        + 'preserveAspectRatio="xMidYMid meet" role="img">'
        + '<defs>' + svgClips(C, n) + '</defs>'
        + '<rect class="carte-eau" x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2]
        + '" height="' + vb[3] + '"'
        + (C.fond ? ' style="fill:' + C.fond + '"' : '') + '/>';
  var Lc = conf.cible ? calque(C, conf.cible) : null;
  if (Lc && Lc.dessous) h += svgCalque(C, conf.cible, true, n, conf.seulement);
  (conf.affiche || ['mers', 'terres']).forEach(function (cle) {
    if (cle !== conf.cible) h += svgCalque(C, cle, false, n);
  });
  if (Lc && !Lc.dessous) h += svgCalque(C, conf.cible, true, n, conf.seulement);
  if (conf.boussole !== false) h += svgBoussole(vb);
  if (conf.echelle !== false) h += svgEchelle(vb, C);
  return h + '<g class="carte-etiq"></g></svg>';
}

/* ═══ ÉTIQUETTES ═══ */
function lignes(txt) {
  if (txt.length <= 13) return [txt];
  var mid = txt.length / 2, best = -1, i, c;
  for (i = 1; i < txt.length - 1; i++) {
    c = txt.charAt(i);
    if (c === ' ' || c === '-') {
      if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
    }
  }
  if (best < 0) return [txt];
  return [txt.slice(0, txt.charAt(best) === '-' ? best + 1 : best), txt.slice(best + 1)];
}

function ancre(svg, C, cle, id) {
  var L = calque(C, cle), it = item(C, cle, id), n = svg.getAttribute('data-uid');
  if (!it || !L) return null;
  if (it.lx != null) return { x: it.lx, y: it.ly };
  if (L.type === 'points') return { x: it.x + 10, y: it.y + 5, gauche: true };
  if (L.type === 'traces') {
    var p = svg.querySelector('#tr' + n + '-' + id);
    if (p && p.getTotalLength) {
      var q = p.getPointAtLength(p.getTotalLength() * (it.pos || 0.55));
      return { x: q.x, y: q.y - 8 };
    }
  }
  /* Aucun repli sur « le premier tracé venu » : mieux vaut pas d'étiquette qu'une
     étiquette posée sur la mauvaise entité. */
  var e = svg.querySelector('.cq-' + cle + ' [data-id="' + id + '"]');
  if (!e || !e.getBBox) return null;
  var b = e.getBBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 + 5 };
}

function poser(svg, C, cle, id, texte, classe, dataK) {
  var a = ancre(svg, C, cle, id);
  if (!a) return null;
  var ls = lignes(texte);
  var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('class', 'etiq ' + (classe || '') + (a.gauche ? ' g' : ''));
  t.setAttribute('x', a.x);
  t.setAttribute('y', ls.length > 1 ? a.y - 11 : a.y);
  if (dataK != null) t.setAttribute('data-k', dataK);
  ls.forEach(function (l, k) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    s.setAttribute('x', a.x);
    if (k) s.setAttribute('dy', '1.05em');
    s.textContent = l;
    t.appendChild(s);
  });
  svg.querySelector('.carte-etiq').appendChild(t);
  return t;
}

function poserCalque(svg, C, cle) {
  var L = calque(C, cle);
  if (!L) return;
  L.items.forEach(function (it) {
    if (it.ref || it.sansNom || !it.nom) return;
    poser(svg, C, cle, it.id, it.nom, 'l-' + cle);
  });
}

/* ═══ EXERCICES ═══ */
var etats = {};

function monter(hote, conf, corps) {
  hote.innerHTML = '<div class="carte-box">' + svgCarte(conf) + '</div>' + (corps || '');
  var svg = hote.querySelector('.carte-svg'), C = laCarte(conf.carte);
  if (svg && C) nomsAffiches(C, conf).forEach(function (cle) { poserCalque(svg, C, cle); });
  return svg;
}

/* Les étendues d'eau servent de repère permanent : dès qu'un calque « mers » est
   affiché, ses noms le sont aussi — sauf quand c'est justement ce qu'il faut trouver. */
function nomsAffiches(C, conf) {
  var n = (conf.noms || []).slice();
  ['mers', 'eaux'].forEach(function (cle) {
    if (C.calques[cle] && (conf.affiche || []).indexOf(cle) >= 0
        && conf.cible !== cle && n.indexOf(cle) < 0) n.push(cle);
  });
  return n;
}

function conf(ex) {
  return { carte: ex.carte, affiche: ex.affiche, cible: ex.cible, noms: ex.noms,
           seulement: ex.seulement, boussole: ex.boussole, echelle: ex.echelle };
}

/* ── designer : une question → un clic sur la carte ── */
function rendreDesigner(ex, i, hote, api) {
  var st = etats[i] = { k: 0, verrou: false, faits: 0 };
  var C = laCarte(ex.carte);
  var svg = monter(hote, conf(ex),
    '<div class="carte-fb fb" id="cfb' + i + '"></div>'
    + '<button class="btn-suite carte-next" type="button" id="cnx' + i + '">'
    + 'Question suivante \u2192</button>');
  hote.insertAdjacentHTML('afterbegin', '<div class="carte-q" id="cq' + i + '"></div>');
  if (!svg) return;

  function question() {
    var it = ex.items[st.k];
    document.getElementById('cq' + i).innerHTML =
      '<span class="carte-num">' + (st.k + 1) + ' / ' + ex.items.length + '</span>' + it.q;
    var fb = document.getElementById('cfb' + i);
    fb.className = 'carte-fb fb'; fb.innerHTML = '';
    document.getElementById('cnx' + i).classList.remove('show');
    st.verrou = false;
  }

  function repondre(id) {
    if (st.verrou) return;
    st.verrou = true;
    var it = ex.items[st.k], bons = tab(it.rep), bon = bons.indexOf(id) >= 0;
    var choisi = svg.querySelector('.cible[data-id="' + id + '"]');
    if (choisi) choisi.classList.add(bon ? 'ok' : 'ko');
    if (!bon) {
      var sol = svg.querySelector('.cible[data-id="' + bons[0] + '"]');
      if (sol) sol.classList.add('solution');
    }
    poser(svg, C, ex.cible, bons[0], nomDe(C, ex.cible, bons[0]), bon ? 'l-ok' : 'l-sol');
    var fb = document.getElementById('cfb' + i);
    fb.innerHTML = (bon ? '\u2705 ' : '\u274C ') + (it.expl || '');
    fb.className = 'carte-fb fb show ' + (bon ? 'ok' : 'ko');
    if (bon && api) api.point(i);
    st.faits++;
    if (st.k < ex.items.length - 1) document.getElementById('cnx' + i).classList.add('show');
    else if (api) api.avancer(i, ex.items.length);
  }

  hote.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('.cible');
    if (c) { repondre(c.getAttribute('data-id')); return; }
    if (e.target.id === 'cnx' + i) {
      svg.querySelectorAll('.ko,.solution').forEach(function (z) {
        z.classList.remove('ko', 'solution');
      });
      svg.querySelectorAll('.etiq.l-sol').forEach(function (z) { z.remove(); });
      st.k++; question();
    }
  });
  hote.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList
        && e.target.classList.contains('cible')) {
      e.preventDefault(); repondre(e.target.getAttribute('data-id'));
    }
  });
  question();
}

/* ── placer : étiquettes à poser sur la carte, puis « Vérifier » ── */
function rendrePlacer(ex, i, hote) {
  var C = laCarte(ex.carte);
  var st = etats[i] = { sel: null, place: {}, verifie: false };
  var chips = shuffle(ex.items.map(function (it, k) {
    return { k: k, t: it.etiquette || nomDe(C, ex.cible, tab(it.rep)[0]) };
  }));
  var svg = monter(hote, conf(ex), '<div class="carte-fb fb" id="cfb' + i + '"></div>');
  hote.insertAdjacentHTML('afterbegin',
    '<div class="pool carte-pool">'
    + chips.map(function (c) {
        return '<button type="button" class="chip" data-k="' + c.k + '">' + esc(c.t) + '</button>';
      }).join('') + '</div>');
  if (!svg) return;

  hote.addEventListener('click', function (e) {
    if (st.verifie) return;
    var ch = e.target.closest && e.target.closest('.chip');
    if (ch) {
      hote.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('selected'); });
      ch.classList.add('selected');
      st.sel = ch;
      return;
    }
    var z = e.target.closest && e.target.closest('.cible');
    if (!z || !st.sel) return;
    var k = st.sel.getAttribute('data-k');
    var vieux = svg.querySelector('.etiq[data-k="' + k + '"]');
    if (vieux) vieux.remove();
    st.place[k] = z.getAttribute('data-id');
    poser(svg, C, ex.cible, st.place[k], st.sel.textContent, 'l-pose', k);
    st.sel.classList.add('used');
    st.sel.classList.remove('selected');
    st.sel = null;
  });
}

/* ── découverte : carte de leçon, non notée ── */
function decouverte(cf, hote) {
  if (typeof hote === 'string') hote = document.getElementById(hote);
  if (!hote) return;
  var id = hote.id + '-i';
  var svg = monter(hote, cf, '<div class="carte-info" id="' + id + '">'
    + (cf.invite || 'Touche la carte pour explorer.') + '</div>');
  var C = laCarte(cf.carte);
  if (!svg || !C) return;
  hote.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.cible');
    if (!z) return;
    svg.querySelectorAll('.cible.actif').forEach(function (a) { a.classList.remove('actif'); });
    z.classList.add('actif');
    var k = z.getAttribute('data-id');
    document.getElementById(id).innerHTML = '<strong>' + esc(nomDe(C, cf.cible, k)) + '</strong>'
      + ((cf.infos && cf.infos[k]) ? ' \u2014 ' + cf.infos[k] : '');
  });
}

/* ═══ API ═══ */
window.AFCarte = {
  besoinVerif: function (ex) { return ex.mode === 'placer'; },

  rendre: function (ex, i, hote, api) {
    if (ex.mode === 'placer') rendrePlacer(ex, i, hote);
    else rendreDesigner(ex, i, hote, api);
  },

  verifier: function (ex, i) {
    var st = etats[i];
    if (!st || st.verifie) return 0;
    st.verifie = true;
    var C = laCarte(ex.carte);
    var svg = document.querySelector('#ex' + i + ' .carte-svg');
    var pts = 0, total = ex.items.length;
    ex.items.forEach(function (it, k) {
      var mis = st.place[k], bons = tab(it.rep), bon = bons.indexOf(mis) >= 0;
      var lab = svg.querySelector('.etiq[data-k="' + k + '"]');
      if (bon) { pts++; if (lab) lab.classList.add('l-ok'); return; }
      if (lab) lab.classList.add('l-ko');
      var sol = svg.querySelector('.cible[data-id="' + bons[0] + '"]');
      if (sol) sol.classList.add('solution');
      poser(svg, C, ex.cible, bons[0], nomDe(C, ex.cible, bons[0]), 'l-sol');
    });
    var fb = document.getElementById('cfb' + i);
    fb.innerHTML = (pts === total)
      ? '\u2705 Carte compl\u00e8te : tout est \u00e0 sa place !'
      : '\u274C ' + pts + ' \u00e9tiquette' + (pts > 1 ? 's' : '') + ' sur ' + total
        + ' bien plac\u00e9' + (pts > 1 ? 'es' : 'e') + '. Les bonnes r\u00e9ponses sont sur la carte.';
    fb.className = 'carte-fb fb show ' + (pts === total ? 'ok' : 'ko');
    return pts;
  },

  decouverte: decouverte,

  monterLecons: function (lecon) {
    (lecon || []).forEach(function (b, i) {
      if (b.carte) decouverte(b.carte, 'cartelecon' + i);
    });
  }
};
})();
