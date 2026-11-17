/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Clavier intégré pour les fiches autonomes
   (passage secret, fiches-perso/)

   Sur téléphone et tablette, le clavier du système propose la fin des mots
   (« vac » → « vacances ») : c'est donner la réponse à l'enfant. Ce script
   remplace ce clavier par un clavier maison, sans suggestion, avec :
   chiffres, lettres, Maj, accents, ponctuation, effacer et Valider.

   Usage : <script src="../atelier-clavier.js"></script> juste avant </body>.
   Rien d'autre à prévoir : tous les champs texte de la page, même créés plus
   tard par le script de la fiche, sont pris en charge. Sur ordinateur, rien
   ne change (vrai clavier).
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var TACTILE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if(!TACTILE) return;

  var SEL = 'input[type="text"], input:not([type]), input[type="search"], textarea';
  var cible = null, maj = false;

  /* ── Styles ── */
  var st = document.createElement('style');
  st.textContent =
    '.ak{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#eef2f7;border-top:2px solid #cbd5e1;'
  + 'padding:6px 4px calc(8px + env(safe-area-inset-bottom));box-shadow:0 -6px 20px rgba(15,23,42,.15);'
  + 'display:none;font-family:"Nunito",system-ui,sans-serif;user-select:none;-webkit-user-select:none;}'
  + '.ak.on{display:block;}'
  + '.ak-info{display:flex;justify-content:space-between;align-items:center;padding:0 6px 5px;font-size:.78rem;font-weight:700;color:#64748b;}'
  + '.ak-fermer{border:none;background:none;font:inherit;font-weight:800;color:#475569;padding:4px 6px;}'
  + '.ak-r{display:flex;justify-content:center;gap:4px;margin:4px 0;}'
  + '.ak-k{flex:1;min-width:0;max-width:52px;height:44px;border:2px solid #cbd5e1;border-radius:9px;background:#fff;'
  + 'font:inherit;font-size:1.1rem;font-weight:800;color:#1e293b;display:flex;flex-direction:column;align-items:center;'
  + 'justify-content:center;line-height:1;padding:0;touch-action:manipulation;}'
  + '.ak-k:active{transform:scale(.93);background:#e2e8f0;}'
  + '.ak-k small{font-size:.52rem;font-weight:800;color:#64748b;margin-top:3px;}'
  + '.ak-chif .ak-k{height:38px;background:#f8fafc;}'
  + '.ak-acc .ak-k{background:#fff8eb;border-color:#fde3b0;color:#a96500;}'
  + '.ak-pon .ak-k{font-size:1.25rem;font-weight:900;}'
  + '.ak-maj{max-width:64px;flex:1.4;}'
  + '.ak-maj.on{background:#3b82f6;border-color:#3b82f6;color:#fff;}'
  + '.ak-maj.on small{color:#dbeafe;}'
  + '.ak-esp{max-width:none;flex:4;font-size:.95rem;}'
  + '.ak-del{max-width:none;flex:1.6;background:#fee2e2;border-color:#fca5a5;color:#b91c1c;font-size:.95rem;}'
  + '.ak-ok{max-width:none;flex:2;background:#16a34a;border-color:#16a34a;color:#fff;font-size:.95rem;}'
  + '.ak-cible{outline:3px solid #3b82f6 !important;outline-offset:2px;}';
  document.head.appendChild(st);

  /* ── Construction du clavier ── */
  var LIGNES = [
    {cls:'ak-chif', t:['1','2','3','4','5','6','7','8','9','0']},
    {t:['a','z','e','r','t','y','u','i','o','p']},
    {t:['q','s','d','f','g','h','j','k','l','m']},
    {maj:true, t:['w','x','c','v','b','n','\'','-']},
    {cls:'ak-acc', t:['é','è','ê','à','ç','ù','â','î','ô','œ']},
    {cls:'ak-pon', t:[[',','virgule'],['.','point'],['?',''],['!',''],[':',''],['/',''],['+',''],['=','']]}
  ];
  var kb = document.createElement('div');
  kb.className = 'ak';
  kb.setAttribute('aria-label', 'Clavier');
  var h = '<div class="ak-info"><span>Utilise ce clavier 👇</span><button type="button" class="ak-fermer" data-k="__fermer">✕ Fermer</button></div>';
  LIGNES.forEach(function(l){
    h += '<div class="ak-r ' + (l.cls || '') + '">';
    if(l.maj) h += '<button type="button" class="ak-k ak-maj" data-k="__maj" aria-label="Majuscule">⇧<small>Maj</small></button>';
    l.t.forEach(function(k){
      var c = Array.isArray(k) ? k[0] : k, lib = Array.isArray(k) ? k[1] : '';
      var lettre = /^[a-zà-ÿœ]$/.test(c);
      h += '<button type="button" class="ak-k' + (lettre ? ' ak-lt' : '') + '" data-k="' + (c === '\'' ? '&#39;' : c) + '">'
         + c + (lib ? '<small>' + lib + '</small>' : '') + '</button>';
    });
    h += '</div>';
  });
  h += '<div class="ak-r"><button type="button" class="ak-k ak-esp" data-k=" ">espace</button>'
     + '<button type="button" class="ak-k ak-del" data-k="__del">⌫ effacer</button>'
     + '<button type="button" class="ak-k ak-ok" data-k="__ok">Valider ✓</button></div>';
  kb.innerHTML = h;

  function monter(){ if(!kb.parentNode) document.body.appendChild(kb); }

  function majTouches(){
    kb.querySelectorAll('.ak-lt').forEach(function(b){ b.textContent = maj ? b.dataset.k.toUpperCase() : b.dataset.k; });
    kb.querySelector('.ak-maj').classList.toggle('on', maj);
  }

  /* ── Champs : plus jamais le clavier du système ── */
  function preparer(el){
    if(el.dataset.ak) return;
    el.dataset.ak = '1';
    el.setAttribute('inputmode', 'none');
    el.setAttribute('readonly', 'readonly');
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
  }
  function scanner(racine){
    if(racine.matches && racine.matches(SEL)) preparer(racine);
    if(racine.querySelectorAll) racine.querySelectorAll(SEL).forEach(preparer);
  }

  function ouvrir(el){
    if(el.disabled) return;
    monter();
    if(cible && cible !== el) cible.classList.remove('ak-cible');
    cible = el;
    el.classList.add('ak-cible');
    kb.classList.add('on');
    document.body.style.paddingBottom = (kb.offsetHeight + 10) + 'px';
    setTimeout(function(){
      var r = el.getBoundingClientRect(), haut = window.innerHeight - kb.offsetHeight;
      if(r.bottom > haut - 12 || r.top < 10) window.scrollBy({top: r.top - haut / 2 + r.height / 2, behavior: 'smooth'});
    }, 60);
  }
  function fermer(){
    kb.classList.remove('on');
    if(cible) cible.classList.remove('ak-cible');
    cible = null;
    document.body.style.paddingBottom = '';
  }

  function ecrire(v){
    var max = parseInt(cible.getAttribute('maxlength'), 10);
    if(max > 0 && v.length > max) return;
    cible.value = v;
    cible.dispatchEvent(new Event('input', {bubbles: true}));
  }

  /* ── Touches ── */
  kb.addEventListener('click', function(e){
    var b = e.target.closest('.ak-k, .ak-fermer');
    if(!b) return;
    e.preventDefault();
    var k = b.dataset.k;
    if(k === '__fermer') return fermer();
    if(k === '__maj'){ maj = !maj; majTouches(); return; }
    if(!cible || !document.body.contains(cible)){ fermer(); return; }
    if(cible.disabled) return;
    var v = cible.value;
    if(k === '__del') return ecrire(v.slice(0, -1));
    if(k === '__ok'){
      var ev = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true});
      cible.dispatchEvent(ev);
      cible.dispatchEvent(new Event('change', {bubbles: true}));
      return;
    }
    if(maj && /^[a-zà-ÿœ]$/.test(k)){ k = k.toUpperCase(); maj = false; majTouches(); }
    if(/^[,.?!:]$/.test(k)) v = v.replace(/ $/, '');
    ecrire(v + k);
  });
  // Le clavier ne doit jamais voler le focus au champ
  kb.addEventListener('mousedown', function(e){ e.preventDefault(); });

  document.addEventListener('focusin', function(e){
    if(e.target.matches && e.target.matches(SEL)){ preparer(e.target); ouvrir(e.target); }
  });
  document.addEventListener('click', function(e){
    if(e.target.matches && e.target.matches(SEL)){ preparer(e.target); ouvrir(e.target); return; }
    if(kb.contains(e.target)) return;
    // Un bouton de la fiche (Vérifier…) garde le clavier ouvert si le champ est encore là
    if(cible && !document.body.contains(cible)) fermer();
  });

  function demarrer(){
    scanner(document.body);
    new MutationObserver(function(ms){
      var nouveaux = [];
      ms.forEach(function(m){ m.addedNodes.forEach(function(n){
        if(n.nodeType !== 1) return;
        scanner(n);
        if(n.matches && n.matches(SEL)) nouveaux.push(n);
        if(n.querySelectorAll) n.querySelectorAll(SEL).forEach(function(x){ nouveaux.push(x); });
      }); });
      if(cible && (!document.body.contains(cible) || cible.disabled)){
        // La question suivante a remplacé la précédente : le clavier passe au nouveau champ
        var suite = nouveaux.filter(function(x){ return !x.disabled && x.offsetParent !== null; })[0];
        if(suite) ouvrir(suite); else fermer();
      }
    }).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['disabled']});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
