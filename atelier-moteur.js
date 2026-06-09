/* ═══════════════════════════════════════════════════════════════
   L'Atelier du Devoir — Moteur JS Universel v1.0
   Couvre : Cycle 2 · Cycle 3 · Cycle 4 · Dictées
   Toutes matières · Tous types d'exercices

   Usage : <script src="../atelier-moteur.js"></script>
   Requiert : FICHE_CONFIG, G1, G2, FREE_POOL dans la fiche
   ═══════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════
   VARIABLES GLOBALES
   ════════════════════════════════════════ */
var score = 0, g1Idx = 0, g2Idx = 0;
var f1Exs = [], f2Exs = [], f1Done = 0, f2Done = 0;
var _cb = {};
var _g1tries = 0, _g2tries = 0;
/* Conjugaison C3 */
var conjScore = 0, conjTotal = 0;
/* Dictée */
var dicteeScore = 0, dicteeVoice = null;

/* ════════════════════════════════════════
   UTILITAIRES
   ════════════════════════════════════════ */
function shuffle(a) {
  var b = a.slice();
  for (var i = b.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = b[i]; b[i] = b[j]; b[j] = t;
  }
  return b;
}

function addPt(n) {
  score += (n || 1);
  var el = document.getElementById('score-display');
  if (el) el.textContent = score;
}

function scrollToEl(el, delay) {
  setTimeout(function() {
    var hH = (document.querySelector('.header') || { offsetHeight: 0 }).offsetHeight;
    var r = el.getBoundingClientRect();
    window.scrollTo({ top: window.pageYOffset + r.top - hH - 16, behavior: 'smooth' });
  }, delay || 150);
}

/* ════════════════════════════════════════
   NAVIGATION PHASES
   ════════════════════════════════════════ */
function updSteps(n) {
  var steps = document.querySelectorAll('.step');
  steps.forEach(function(s, i) {
    s.classList.remove('active', 'done');
    if (i < n) s.classList.add('done');
    else if (i === n) s.classList.add('active');
  });
}

function goPhase(ph, si) {
  document.querySelectorAll('.phase').forEach(function(p) { p.classList.remove('active'); });
  var el = document.getElementById('phase-' + ph);
  if (el) {
    el.classList.add('active');
    setTimeout(function() { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }
  updSteps(si);
  var dispatch = {
    'g1': initG1, 'g2': initG2,
    'free': initFree1, 'free2': initFree2,
    'bilan': showBilan,
    'conjtable': initConjTable,
    'dictee': initDictee
  };
  if (dispatch[ph]) dispatch[ph]();
}

/* ════════════════════════════════════════
   LEÇON — Révéler blocs progressifs
   ════════════════════════════════════════ */
function revealBloc(n) {
  var b = document.getElementById('bloc-' + n);
  if (!b) return;
  var p = document.getElementById('bloc-' + (n - 1));
  if (p) {
    var btn = p.querySelector('.btn-compris');
    if (btn) { btn.textContent = '✓ Compris !'; btn.disabled = true; btn.style.opacity = '.4'; }
  }
  b.classList.add('revealed');
  scrollToEl(b, 150);
}

/* ════════════════════════════════════════
   QCM GUIDÉ (cycles 2, 3, 4)
   ════════════════════════════════════════ */
function makeQBox(step, si, prefix) {
  var so = shuffle(step.opts.map(function(o, oi) { return { t: o, i: oi }; }));
  var sb = document.createElement('div');
  sb.className = 'q-box' + (si === 0 ? ' active' : '');
  sb.id = prefix + 's' + si;
  sb.innerHTML =
    '<div class="q-num">Question ' + (si + 1) + '</div>' +
    '<div class="q-text">' + step.q + '</div>' +
    '<div class="hint-box" id="' + prefix + 'h' + si + '">💡 ' + step.hint + '</div>' +
    '<div class="opts">' + so.map(function(o) {
      return '<button class="opt" onclick="checkQ(\'' + prefix + '\',' + si + ',' + o.i + ',this)">' + o.t + '</button>';
    }).join('') + '</div>' +
    '<div class="fb" id="' + prefix + 'f' + si + '"></div>';
  return sb;
}

function checkQ(prefix, si, ci, btn) {
  var v = prefix === 'g1' ? G1[g1Idx] : G2[g2Idx];
  var step = v.etapes[si];
  var sb = document.getElementById(prefix + 's' + si);
  var fb = document.getElementById(prefix + 'f' + si);
  var triesId = prefix === 'g1' ? 'tries-g1' : 'tries-g2';
  var tries = prefix === 'g1' ? _g1tries : _g2tries;
  if (sb.classList.contains('correct')) return;

  if (ci === step.ok) {
    btn.classList.add('ok');
    sb.querySelectorAll('.opt').forEach(function(b) { b.disabled = true; });
    sb.classList.add('correct');
    if (tries === 0) {
      fb.className = 'fb show ok';
      fb.innerHTML = '✅ ' + step.expl_ok + ' <span style="font-size:.72rem;color:#065f46">(+1 pt)</span>';
      addPt(1);
    } else {
      fb.className = 'fb show ok';
      fb.innerHTML = '✅ ' + step.expl_ok;
    }
    if (prefix === 'g1') _g1tries = 0; else _g2tries = 0;
    var el = document.getElementById(triesId);
    if (el) el.textContent = '3 essais';
    var nx = document.getElementById(prefix + 's' + (si + 1));
    if (nx) {
      nx.classList.add('active');
      scrollToEl(nx, 350);
    } else {
      var btnId = prefix === 'g1' ? 'btn-g1-to-g2' : 'btn-g2-to-free';
      /* Cycle 3 : si conjugaison présente, aller vers conjtable */
      var cfg = (typeof FICHE_CONFIG !== 'undefined') ? FICHE_CONFIG : {};
      if (prefix === 'g2' && cfg.has_conjtable) btnId = 'btn-g2-to-conjtable';
      setTimeout(function() {
        var b = document.getElementById(btnId);
        if (b) { b.classList.add('show'); scrollToEl(b, 0); }
      }, 550);
    }
  } else {
    btn.classList.add('ko');
    btn.disabled = true;
    if (prefix === 'g1') _g1tries++; else _g2tries++;
    var newTries = prefix === 'g1' ? _g1tries : _g2tries;
    var el = document.getElementById(triesId);
    if (el) el.textContent = (3 - newTries) + ' essai' + (3 - newTries > 1 ? 's' : '');
    fb.className = 'fb show ko';
    if (newTries < 3) {
      fb.innerHTML = '❌ Réessaie ! 💪';
      document.getElementById(prefix + 'h' + si).classList.add('show');
    } else {
      fb.innerHTML = '❌ ' + step.expl_ko;
      var rid = prefix === 'g1' ? 'g1-reset' : 'g2-reset';
      var zid = prefix === 'g1' ? 'g1-zone' : 'g2-zone';
      setTimeout(function() {
        document.getElementById(rid).classList.add('show');
        document.getElementById(zid).innerHTML = '';
        scrollToEl(document.getElementById(rid), 0);
      }, 1400);
    }
  }
}

function initG(which) {
  var isG1 = which === 'g1';
  if (isG1) { g1Idx = Math.floor(Math.random() * G1.length); _g1tries = 0; }
  else { g2Idx = Math.floor(Math.random() * G2.length); _g2tries = 0; }
  var v = isG1 ? G1[g1Idx] : G2[g2Idx];
  var resetEl = document.getElementById(which + '-reset');
  var btnNext = document.getElementById('btn-' + which + '-to-' + (isG1 ? 'g2' : 'free'));
  if (resetEl) resetEl.classList.remove('show');
  if (btnNext) btnNext.classList.remove('show');
  var z = document.getElementById(which + '-zone');
  z.innerHTML = '';
  var box = document.createElement('div');
  box.className = 'guided-box';
  box.innerHTML = '<div class="guided-title">' + v.titre + '<span class="tries-b" id="tries-' + which + '">3 essais</span></div><div id="' + which + '-steps"></div>';
  z.appendChild(box);
  v.etapes.forEach(function(step, si) {
    document.getElementById(which + '-steps').appendChild(makeQBox(step, si, which));
  });
}
function initG1() { initG('g1'); }
function initG2() { initG('g2'); }

/* ════════════════════════════════════════
   EXERCICES LIBRES (tous cycles)
   ════════════════════════════════════════ */
function buildFree(ex, i, prefix, cb) {
  var card = document.createElement('div');
  card.className = 'free-card';
  card.id = prefix + 'c' + i;
  var so = shuffle(ex.opts.map(function(o, oi) { return { t: o, i: oi }; }));
  card.innerHTML =
    '<div class="free-num">Question ' + (i + 1) + '</div>' +
    '<div class="free-q">' + ex.q + '</div>' +
    '<div class="free-opts" id="' + prefix + 'fo' + i + '"></div>' +
    '<div class="free-fb" id="' + prefix + 'ff' + i + '"></div>';
  setTimeout(function() {
    var ba = document.getElementById(prefix + 'fo' + i);
    so.forEach(function(o) {
      var btn = document.createElement('button');
      btn.className = 'free-opt';
      btn.textContent = o.t;
      btn.onclick = function() {
        if (card.classList.contains('done')) return;
        card.classList.add('done');
        ba.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
        var fb = document.getElementById(prefix + 'ff' + i);
        if (o.i === ex.ok) {
          btn.classList.add('ok');
          fb.className = 'free-fb show ok';
          fb.innerHTML = '✅ ' + ex.expl;
          addPt(1);
        } else {
          btn.classList.add('ko');
          ba.querySelectorAll('button').forEach(function(b, bi) {
            if (bi === ex.ok) b.classList.add('reveal');
          });
          fb.className = 'free-fb show ko';
          fb.innerHTML = '❌ ' + ex.expl;
        }
        cb();
      };
      ba.appendChild(btn);
    });
  }, 0);
  return card;
}

function initFreeSet(setNum, pool, usedQs) {
  var filtered = usedQs ? pool.filter(function(e) { return usedQs.indexOf(e.q) < 0; }) : pool;
  var exs = shuffle(filtered.slice()).slice(0, 5);
  var done = 0;
  var prefix = 'f' + setNum;
  var z = document.getElementById('free' + setNum + '-zone');
  z.innerHTML = '';
  exs.forEach(function(ex, i) {
    _cb[prefix + i] = function() {
      done++;
      if (done >= 5) {
        setTimeout(function() {
          var nextId = setNum === 1 ? 'btn-free-to-free2' : 'btn-free2-to-bilan';
          var cfg = (typeof FICHE_CONFIG !== 'undefined') ? FICHE_CONFIG : {};
          if (setNum === 2 && cfg.has_conjtable) nextId = 'btn-free2-to-conjtable';
          var b = document.getElementById(nextId);
          if (b) { b.classList.add('show'); scrollToEl(b, 0); }
        }, 600);
      }
    };
    z.appendChild(buildFree(ex, i, prefix, _cb[prefix + i]));
  });
  return exs;
}
function initFree1() { f1Exs = initFreeSet(1, FREE_POOL, null); }
function initFree2() { f2Exs = initFreeSet(2, FREE_POOL, f1Exs.map(function(e) { return e.q; })); }

/* ════════════════════════════════════════
   CONJUGAISON (Cycle 3)
   buildConjTable(CONJ_DATA) dans la fiche
   ════════════════════════════════════════ */
function nsConj(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function initConjTable() {
  if (typeof CONJ_DATA === 'undefined') return;
  conjScore = 0; conjTotal = 0;
  var z = document.getElementById('conjtable-zone');
  if (!z) return;
  z.innerHTML = '';
  CONJ_DATA.forEach(function(bloc) {
    var card = document.createElement('div');
    card.className = 'conj-card';
    card.style.cssText = 'background:white;border:2px solid var(--acc-pale);border-radius:var(--radius);padding:16px;margin-bottom:14px;';
    var header = '<div style="font-size:.95rem;color:var(--acc);margin-bottom:12px;font-weight:bold;">Conjugue : <em>' + bloc.verbe + '</em> (' + bloc.temps + ')</div>';
    var rows = bloc.formes.map(function(f, idx) {
      conjTotal++;
      return '<div class="conj-row-item" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
        '<span class="conj-pron" style="min-width:120px;color:var(--acc-dark);font-size:.9rem;">' + f.pronom + '</span>' +
        '<input class="conj-input" data-correct="' + f.forme + '" data-idx="' + idx + '" data-bloc="' + bloc.id + '"' +
        ' placeholder="écris ici…" style="flex:1;padding:8px 11px;border:2px solid var(--acc-mid);border-radius:8px;font-size:.95rem;outline:none;"' +
        ' oninput="this.style.borderColor=\'var(--acc-mid)\'">' +
        '</div>';
    }).join('');
    var btnCheck = '<button onclick="verifyConjBloc(\'' + bloc.id + '\')" style="margin-top:8px;padding:10px 22px;border-radius:24px;background:var(--acc);color:white;border:none;cursor:pointer;">Vérifier ✓</button>';
    card.innerHTML = header + rows + btnCheck;
    z.appendChild(card);
  });
}

function verifyConjBloc(blocId) {
  var inputs = document.querySelectorAll('[data-bloc="' + blocId + '"]');
  var allOk = true;
  inputs.forEach(function(inp) {
    var correct = inp.dataset.correct;
    var val = inp.value;
    var acceptees = (typeof CONJ_DATA !== 'undefined') ? getConjAcceptees(correct) : [correct];
    var ok = acceptees.some(function(a) { return nsConj(val) === nsConj(a); });
    inp.classList.remove('ok', 'ko');
    if (ok) {
      inp.classList.add('ok');
      inp.disabled = true;
    } else {
      inp.classList.add('ko');
      allOk = false;
    }
  });
  checkAllConjDone();
}

function getConjAcceptees(forme) {
  /* Les fiches définissent conjAnswers[forme] si besoin (variantes accentuées) */
  if (typeof conjAnswers !== 'undefined' && conjAnswers[forme]) return conjAnswers[forme];
  return [forme];
}

function checkAllConjDone() {
  var all = document.querySelectorAll('.conj-input');
  var allDone = true;
  all.forEach(function(inp) { if (!inp.classList.contains('ok')) allDone = false; });
  if (allDone) {
    var btn = document.getElementById('btn-to-bilan');
    if (btn) { btn.classList.add('show'); scrollToEl(btn, 0); }
  }
}

/* ════════════════════════════════════════
   SAISIE CLAVIER (Cycle 3 — Ex5)
   buildSaisie5(SAISIE_DATA) dans la fiche
   ════════════════════════════════════════ */
function nsSaisie(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

function initSaisie5() {
  if (typeof SAISIE_DATA === 'undefined') return;
  var z = document.getElementById('saisie5-zone');
  if (!z) return;
  z.innerHTML = '';
  SAISIE_DATA.forEach(function(item, i) {
    var card = document.createElement('div');
    card.className = 'saisie-item';
    card.innerHTML =
      '<div class="saisie-phrase"><strong>' + (i + 1) + '.</strong> ' + item.consigne + '</div>' +
      '<input class="saisie-input" placeholder="écris ici…" id="saisie-inp-' + i + '">' +
      '<div class="fb" id="saisie-fb-' + i + '"></div>';
    z.appendChild(card);
  });
  var btn = document.createElement('button');
  btn.className = 'btn-compris';
  btn.style.marginTop = '14px';
  btn.textContent = 'Vérifier mes réponses ✓';
  btn.onclick = verifySaisie5;
  z.appendChild(btn);
}

function verifySaisie5() {
  var pts = 0;
  SAISIE_DATA.forEach(function(item, i) {
    var inp = document.getElementById('saisie-inp-' + i);
    var fb = document.getElementById('saisie-fb-' + i);
    var val = inp ? inp.value : '';
    var ok = item.reponses.some(function(r) { return nsSaisie(val) === nsSaisie(r); });
    if (inp) { inp.classList.remove('ok', 'ko'); inp.classList.add(ok ? 'ok' : 'ko'); inp.disabled = true; }
    if (fb) {
      fb.className = 'fb show ' + (ok ? 'ok' : 'ko');
      fb.innerHTML = ok ? '✅ ' + item.expl_ok : '❌ ' + item.expl_ko;
    }
    if (ok) { pts++; addPt(1); }
  });
  var btn = document.getElementById('btn-saisie5-to-bilan');
  if (btn) { btn.classList.add('show'); scrollToEl(btn, 0); }
}

/* ════════════════════════════════════════
   EXERCICE C — Détection erreur (Cycle 4)
   ════════════════════════════════════════ */
function buildDetectExo(items, containerId, nextBtnId) {
  var z = document.getElementById(containerId);
  if (!z) return;
  z.innerHTML = '';
  var done = 0;
  items.forEach(function(item, idx) {
    var block = document.createElement('div');
    block.className = 'detect-block';
    block.dataset.correct = item.correct;
    block.dataset.idx = idx;
    var shuffledChoices = shuffle(item.choices.slice());
    block.innerHTML =
      '<div class="detect-phrase">' + item.phrase + '</div>' +
      '<div class="detect-opts">' +
      shuffledChoices.map(function(c) {
        return '<button class="detect-btn" data-choice="' + c + '" onclick="checkDetect(' + idx + ',this)">' + c + '</button>';
      }).join('') + '</div>' +
      '<div class="fb" id="detect-fb-' + idx + '"></div>';
    z.appendChild(block);
  });
}

function checkDetect(idx, btn) {
  var block = btn.closest('.detect-block');
  if (block.classList.contains('done')) return;
  block.classList.add('done');
  block.querySelectorAll('.detect-btn').forEach(function(b) { b.disabled = true; });
  var fb = document.getElementById('detect-fb-' + idx);
  var ok = btn.dataset.choice === block.dataset.correct;
  btn.classList.add(ok ? 'ok' : 'ko');
  if (!ok) {
    block.querySelectorAll('.detect-btn').forEach(function(b) {
      if (b.dataset.choice === block.dataset.correct) b.classList.add('ok');
    });
  }
  if (fb) { fb.className = 'fb show ' + (ok ? 'ok' : 'ko'); fb.innerHTML = ok ? '✅ ' + (block.dataset.explok || 'Correct !') : '❌ ' + (block.dataset.explko || 'Incorrect.'); }
  if (ok) addPt(1);
}

/* ════════════════════════════════════════
   EXERCICE H — Jugement (Cycle 4)
   ════════════════════════════════════════ */
function verifyJugement(ji, choice) {
  var block = document.querySelector('[data-jidx="' + ji + '"]');
  if (!block || block.classList.contains('done')) return;
  block.classList.add('done');
  block.querySelectorAll('.jugement-opt').forEach(function(b) { b.style.pointerEvents = 'none'; });
  var ok = choice === block.dataset.correct;
  var chosen = block.querySelector('[data-choice="' + choice + '"]');
  if (chosen) chosen.classList.add(ok ? 'ok' : 'ko');
  if (!ok) {
    var correct = block.querySelector('[data-choice="' + block.dataset.correct + '"]');
    if (correct) correct.classList.add('ok');
  }
  var fb = document.getElementById('jugement-fb-' + ji);
  if (fb) { fb.className = 'fb show ' + (ok ? 'ok' : 'ko'); fb.innerHTML = ok ? '✅ ' + (block.dataset.explok || '') : '❌ ' + (block.dataset.explko || ''); fb.style.display = 'block'; }
  if (ok) addPt(1);
}

/* ════════════════════════════════════════
   DICTÉE (tous cycles)
   ════════════════════════════════════════ */
function ns(s) {
  return (s || '').toLowerCase()
    .replace(/\s*([.,;:!?])\s*/g, '$1')
    .replace(/[.!?]$/, '')
    .replace(/\s+/g, ' ').trim();
}

function initDicteeVoice() {
  if (!window.speechSynthesis) return;
  var pref = ['Thomas', 'Amélie', 'Aurélie', 'Julie'];
  var voices = window.speechSynthesis.getVoices();
  for (var p of pref) {
    var found = voices.find(function(v) { return v.name.indexOf(p) > -1; });
    if (found) { dicteeVoice = found; return; }
  }
  var frFR = voices.find(function(v) { return v.lang === 'fr-FR'; });
  var fr = voices.find(function(v) { return v.lang && v.lang.startsWith('fr'); });
  dicteeVoice = frFR || fr || null;
}

function speak(text, slow) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  setTimeout(function() {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = slow ? 0.28 : 0.55;
    u.pitch = slow ? 0.95 : 1.05;
    if (dicteeVoice) u.voice = dicteeVoice;
    window.speechSynthesis.speak(u);
  }, 80);
}

function initDictee() {
  if (!window.speechSynthesis) return;
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = initDicteeVoice;
  } else {
    initDicteeVoice();
  }
}

function verifyDictee() {
  if (typeof phrasesLues === 'undefined' || typeof phrases === 'undefined') return;
  dicteeScore = 0;
  var total = phrases.length;
  phrases.forEach(function(ref, i) {
    var inp = document.getElementById('dictee-inp-' + i);
    var corr = document.getElementById('dictee-corr-' + i);
    if (!inp) return;
    var val = inp.value;
    var ok = ns(val) === ns(ref);
    inp.classList.remove('ok', 'ko');
    inp.classList.add(ok ? 'ok' : 'ko');
    inp.disabled = true;
    if (corr) {
      corr.innerHTML = ok ? '✅ Parfait !' : '❌ Correction : <em>' + ref + '</em>';
      corr.className = 'dictee-correction show';
    }
    if (ok) { dicteeScore++; addPt(3); }
  });
  var btn = document.getElementById('btn-dictee-to-bilan');
  if (btn) { btn.classList.add('show'); scrollToEl(btn, 0); }
}

/* ════════════════════════════════════════
   BILAN
   ════════════════════════════════════════ */
function showBilan() {
  var cfg = (typeof FICHE_CONFIG !== 'undefined') ? FICHE_CONFIG : {};
  var g1n = (typeof G1 !== 'undefined' && G1[g1Idx]) ? G1[g1Idx].etapes.length : 0;
  var g2n = (typeof G2 !== 'undefined' && G2[g2Idx]) ? G2[g2Idx].etapes.length : 0;
  var freeN = (typeof FREE_POOL !== 'undefined') ? 10 : 0;
  var conjN = (typeof CONJ_DATA !== 'undefined') ? conjTotal : 0;
  var saisieN = (typeof SAISIE_DATA !== 'undefined') ? SAISIE_DATA.length : 0;
  var dicteeN = (typeof phrases !== 'undefined') ? phrases.length * 3 : 0;
  var tot = cfg.total_pts || (g1n + g2n + freeN + conjN + saisieN + dicteeN);

  document.getElementById('bilan-pts').textContent = score;
  document.getElementById('bilan-sur').textContent = '/ ' + tot + ' pts';

  var pct = tot > 0 ? score / tot : 0;
  var t, m;
  if (pct >= .8)      { t = cfg.bilan_top || 'BRAVO ! 🎉';     m = cfg.bilan_top_msg || 'Ugo est super fier de toi ! 🦉⭐'; }
  else if (pct >= .5) { t = cfg.bilan_mid || 'Très bien ! 😊';  m = cfg.bilan_mid_msg || 'Tu progresses bien ! Continue.'; }
  else                { t = cfg.bilan_low || 'Bien essayé ! 💪'; m = cfg.bilan_low_msg || 'Tu peux recommencer !'; }

  document.getElementById('bilan-title').textContent = t;
  document.getElementById('bilan-msg').textContent = m;

  var seuils = [Math.ceil(tot * .33), Math.ceil(tot * .66), Math.ceil(tot * .89)];
  ['etoile1', 'etoile2', 'etoile3'].forEach(function(id, i) {
    var el = document.getElementById(id);
    if (!el) return;
    if (score >= seuils[i]) {
      (function(e, d) { setTimeout(function() { e.classList.add('earned'); }, d); })(el, 300 + i * 450);
    } else {
      el.style.filter = 'grayscale(1)';
    }
  });

  var mg = document.getElementById('memo-grid');
  if (mg && cfg.memo) {
    mg.innerHTML = cfg.memo.map(function(m) {
      return '<div class="memo-item"><strong>' + m.titre + '</strong><span>' + m.contenu + '</span></div>';
    }).join('');
  }

  if (pct >= .5) confetti(cfg.confetti_colors);
}

/* ════════════════════════════════════════
   CONFETTI
   ════════════════════════════════════════ */
function confetti(cols) {
  cols = cols || ['#0369a1', '#7dd3fc', '#059669', '#d97706', '#7c3aed'];
  for (var i = 0; i < 65; i++) {
    var el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText =
      'left:' + Math.random() * 100 + 'vw;' +
      'background:' + cols[Math.floor(Math.random() * cols.length)] + ';' +
      'animation-duration:' + (1.8 + Math.random() * 2.2) + 's;' +
      'animation-delay:' + Math.random() * 1.5 + 's;' +
      'width:' + (7 + Math.random() * 10) + 'px;' +
      'height:' + (7 + Math.random() * 10) + 'px;' +
      'border-radius:' + (Math.random() > .5 ? '50%' : '4px') + ';';
    document.body.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.remove(); }, 5000);
  }
}

/* ════════════════════════════════════════
   INIT PAGE (depuis FICHE_CONFIG)
   ════════════════════════════════════════ */
function initPage() {
  var cfg = (typeof FICHE_CONFIG !== 'undefined') ? FICHE_CONFIG : {};
  /* Couleurs CSS */
  var r = document.documentElement.style;
  if (cfg.acc)      r.setProperty('--acc',      cfg.acc);
  if (cfg.acc_pale) r.setProperty('--acc-pale', cfg.acc_pale);
  if (cfg.acc_mid)  r.setProperty('--acc-mid',  cfg.acc_mid);
  if (cfg.acc_dark) r.setProperty('--acc-dark', cfg.acc_dark);
  if (cfg.acc_pale) document.body.style.background = cfg.acc_pale;

  /* Titre page */
  var pt = document.getElementById('page-title');
  if (pt) pt.textContent = (cfg.code || '') + (cfg.titre ? ' — ' + cfg.titre : '') + " | L'Atelier du Devoir";

  /* Accroche cycle 2 */
  ['fiche-icon', 'fiche-titre', 'fiche-soustitre'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (id === 'fiche-icon') el.textContent = cfg.icon || '🔢';
    if (id === 'fiche-titre') el.textContent = cfg.titre || '';
    if (id === 'fiche-soustitre') el.textContent = cfg.soustitre || '';
  });

  /* Metas */
  var metas = document.getElementById('fiche-metas');
  if (metas) (cfg.metas || []).forEach(function(m) {
    var span = document.createElement('span');
    span.className = 'meta-tag';
    span.textContent = m;
    metas.appendChild(span);
  });

  /* Leçon */
  var lc = document.getElementById('lecon-content');
  if (lc && cfg.lecon_html) lc.innerHTML = cfg.lecon_html;

  /* Messages phases */
  var msgs = { 'g1-intro': cfg.g1_intro, 'g2-intro': cfg.g2_intro, 'g1-reset-msg': cfg.g1_reset, 'g2-reset-msg': cfg.g2_reset };
  Object.keys(msgs).forEach(function(id) {
    if (!msgs[id]) return;
    var el = document.getElementById(id);
    if (el) el.innerHTML = msgs[id];
  });
}

document.addEventListener('DOMContentLoaded', initPage);
