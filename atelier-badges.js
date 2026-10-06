/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Badges de résultats sur les pages de classe
   Déjà appelé en bas de cp.html … 3e.html, APRÈS le CDN supabase-js.

   Affiche, pour l'enfant actif :
     · sur chaque carte de fiche déjà travaillée, son MEILLEUR score
     · sur chaque onglet de matière, le nombre de fiches faites sur le total

   Aucun affichage si personne n'est connecté ou si aucun enfant n'est
   sélectionné : un visiteur ne doit pas voir une page couverte de zéros.
   ═══════════════════════════════════════════════════════════ */
(function(){
  var SUPABASE_URL = "https://rwqsvrmjjoihuhmvbwuu.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXN2cm1qam9paHVobXZid3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjQxNTMsImV4cCI6MjA5OTk0MDE1M30.VtdOnI169-erf48NpxLPCC0th6kHqBcsBuCauOx52HI";
  var CLE_ACTIF = "atelier_enfant_actif";

  var MEILLEURS = null;   // { code: {score, total, pct} }
  var sb = null;

  function client(){
    if(sb) return sb;
    if(typeof supabase === 'undefined' || !supabase.createClient) return null;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return sb;
  }

  /* ── Styles ───────────────────────────────────────────── */
  function injecterStyles(){
    if(document.getElementById('atelier-badges-css')) return;
    var s = document.createElement('style');
    s.id = 'atelier-badges-css';
    s.textContent =
      '.badge-score{padding:2px 9px;border-radius:50px;font-size:.68rem;'
      + 'font-weight:800;color:#fff;white-space:nowrap;letter-spacing:.2px;}'
      + '.fiche-card.deja-faite{position:relative;}'
      + '.fiche-card.deja-faite::before{content:"";position:absolute;left:0;top:14px;'
      + 'bottom:14px;width:4px;border-radius:0 4px 4px 0;background:var(--bs,#CBD5E1);}'
      + '.mat-tab .count.avec-score{font-variant-numeric:tabular-nums;}';
    document.head.appendChild(s);
  }

  /* ── Couleur selon le niveau de maîtrise ──────────────── */
  function couleur(pct){
    if(pct >= 90) return '#10B981';   // Brillant
    if(pct >= 80) return '#3B82F6';   // Bien maîtrisé
    if(pct >= 50) return '#F59E0B';   // En cours
    return '#94A3B8';                 // À retravailler
  }

  /* ── Extraire le code depuis le nom de fichier ────────── */
  /* fiches/fiche_O12_homophones_son_sont_CE2.html → O12            */
  function codeDepuisLien(href){
    if(!href) return null;
    var m = href.match(/fiche_([A-Za-z]+\d+[A-Za-z]*)_/);
    return m ? m[1].toUpperCase() : null;
  }

  /* ── Charger les meilleurs scores de l'enfant actif ───── */
  async function charger(){
    var c = client();
    if(!c) return null;

    var res = await c.auth.getSession();
    if(!res.data.session) return null;

    var enfantId = localStorage.getItem(CLE_ACTIF);
    if(!enfantId) return null;

    var q = await c.from('progression')
                   .select('fiche_code, score, total')
                   .eq('enfant_id', enfantId);
    if(q.error || !q.data) return null;

    var best = {};
    q.data.forEach(function(l){
      if(!l.fiche_code || !l.total) return;
      var pct = Math.round(l.score / l.total * 100);
      var code = String(l.fiche_code).toUpperCase();
      /* On garde le MEILLEUR passage, jamais le dernier :
         refaire une fiche pour s'amuser ne doit pas effacer un bon score. */
      if(!best[code] || pct > best[code].pct){
        best[code] = { score: l.score, total: l.total, pct: pct };
      }
    });
    return best;
  }

  /* ── Poser les badges sur les cartes ──────────────────── */
  function appliquerCartes(){
    if(!MEILLEURS) return;
    var cartes = document.querySelectorAll('a.fiche-card[href]');
    cartes.forEach(function(carte){
      if(carte.dataset.badgePose === '1') return;

      var code = codeDepuisLien(carte.getAttribute('href'));
      if(!code) return;
      var r = MEILLEURS[code];
      if(!r) return;

      var zone = carte.querySelector('.card-badges');
      if(!zone) return;

      var col = couleur(r.pct);
      var b = document.createElement('span');
      b.className = 'badge-score';
      b.style.background = col;
      b.textContent = r.score + '/' + r.total;
      b.title = 'Meilleur résultat : ' + r.pct + ' %';
      zone.appendChild(b);

      carte.classList.add('deja-faite');
      carte.style.setProperty('--bs', col);
      carte.dataset.badgePose = '1';
    });
  }

  /* ── Compteurs des onglets : faites / total ───────────── */
  function appliquerOnglets(){
    if(!MEILLEURS) return;
    ['fr','ma','sc','hi','ge','an'].forEach(function(id){
      var sec = document.getElementById('mat-' + id);
      var tab = document.getElementById('tab-' + id);
      if(!sec || !tab) return;

      var cartes = sec.querySelectorAll('a.fiche-card[href]');
      if(cartes.length === 0) return;

      var faites = 0;
      cartes.forEach(function(carte){
        var code = codeDepuisLien(carte.getAttribute('href'));
        if(code && MEILLEURS[code]) faites++;
      });

      var el = tab.querySelector('.count');
      if(el){
        /* Fraction et non pourcentage : le premier chiffre ne recule jamais
           quand de nouvelles fiches sont publiées. */
        el.textContent = faites + '/' + cartes.length;
        el.classList.add('avec-score');
      }
    });
  }

  function appliquer(){
    appliquerCartes();
    appliquerOnglets();
  }

  /* ── Démarrage ────────────────────────────────────────── */
  /* Les cartes sont construites par loadFiches(), en asynchrone :
     on observe le <main> pour poser les badges dès qu'elles existent. */
  async function init(){
    try{
      injecterStyles();
      MEILLEURS = await charger();
      if(!MEILLEURS) return;

      appliquer();

      var main = document.querySelector('main');
      if(!main) return;
      var t = null;
      new MutationObserver(function(){
        clearTimeout(t);
        t = setTimeout(appliquer, 60);
      }).observe(main, { childList: true, subtree: true });

    } catch(e){
      /* Ne jamais casser la page de classe à cause des badges */
      console.log('Badges non affichés :', e);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
