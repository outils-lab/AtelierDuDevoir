/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Badges de progression sur les pages de classe
   À inclure en fin de page, APRÈS le CDN supabase-js :
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="atelier-badges.js"></script>
   Ajoute : bandeau "qui travaille", leçons assignées, badges de score.
   Ne fait rien si personne n'est connecté (mode découverte intact).
   ═══════════════════════════════════════════════════════════ */
(function(){
  var SUPABASE_URL = "https://rwqsvrmjjoihuhmvbwuu.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXN2cm1qam9paHVobXZid3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjQxNTMsImV4cCI6MjA5OTk0MDE1M30.VtdOnI169-erf48NpxLPCC0th6kHqBcsBuCauOx52HI";
  var CLE_ACTIF = "atelier_enfant_actif";

  var sb = null, progParFiche = {}, assignCodes = [], mapFichierCode = {}, prenom = null;

  function css(){
    if(document.getElementById('atelier-badges-css')) return;
    var s = document.createElement('style');
    s.id = 'atelier-badges-css';
    s.textContent = [
      '.ab-bandeau{max-width:1100px;margin:14px auto 0;padding:0 16px;font-family:Nunito,sans-serif;}',
      '.ab-qui{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#fff;border:2.5px solid #8B5CF6;',
      '  border-radius:16px;padding:11px 16px;font-weight:800;font-size:.92rem;color:#2C3E50;}',
      '.ab-qui a{color:#8B5CF6;font-weight:800;text-decoration:underline;font-size:.85rem;}',
      '.ab-qui.alerte{border-color:#F59E0B;}',
      '.ab-qui.alerte a{color:#F59E0B;}',
      '.ab-assign{background:#fff;border:2.5px solid #F59E0B;border-radius:16px;padding:14px 16px;margin-top:10px;}',
      '.ab-assign h3{font-family:Nunito,sans-serif;font-weight:900;font-size:1rem;color:#b45309;margin:0 0 9px;}',
      '.ab-assign-list{display:flex;flex-wrap:wrap;gap:8px;}',
      '.ab-chip{display:inline-block;background:#fffbeb;border:2px solid #F59E0B;border-radius:12px;',
      '  padding:8px 13px;font-weight:800;font-size:.85rem;color:#92400e;text-decoration:none;}',
      '.ab-chip:hover{background:#fef3c7;}',
      '.ab-badge{display:inline-block;border-radius:20px;padding:3px 10px;font-family:Nunito,sans-serif;',
      '  font-weight:800;font-size:.72rem;margin-top:6px;white-space:nowrap;}',
      '.ab-r{background:#fee2e2;color:#b91c1c;} .ab-o{background:#fef3c7;color:#b45309;}',
      '.ab-v{background:#d1fae5;color:#047857;} .ab-p{background:#ede9fe;color:#6d28d9;}',
      '.ab-todo{background:#fff7ed;color:#c2410c;border:1px dashed #F59E0B;}',
      '.fiche-card{position:relative;}',
      '.ab-coin{position:absolute;top:8px;right:8px;font-size:1rem;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function niveau(pct){
    if(pct >= 90) return {t:'Brillant \u2B50', c:'ab-p'};
    if(pct >= 80) return {t:'Bien maîtrisé \u{1F4AA}', c:'ab-v'};
    if(pct >= 50) return {t:'En cours \u{1F4DA}', c:'ab-o'};
    return {t:'À retravailler \u{1F501}', c:'ab-r'};
  }

  function pointInsertion(){
    return document.querySelector('.matieres') || document.querySelector('main.main') || document.body;
  }

  function afficherBandeau(html, classe){
    var box = document.getElementById('ab-bandeau');
    if(!box){
      box = document.createElement('div');
      box.id = 'ab-bandeau';
      box.className = 'ab-bandeau';
      var pi = pointInsertion();
      pi.parentNode.insertBefore(box, pi);
    }
    box.innerHTML = html;
  }

  function decorerCartes(){
    var cartes = document.querySelectorAll('.fiche-card');
    cartes.forEach(function(c){
      if(c.dataset.abFait) return;
      var href = c.getAttribute('href');
      if(!href) return;
      var code = mapFichierCode[href];
      if(!code) return;
      c.dataset.abFait = '1';

      var assigné = assignCodes.indexOf(code) !== -1;
      var d = progParFiche[code];

      if(assigné){
        var coin = document.createElement('span');
        coin.className = 'ab-coin';
        coin.textContent = '\u{1F4DA}';
        coin.title = "Un adulte t'a préparé cette leçon";
        c.appendChild(coin);
      }
      var b = document.createElement('span');
      if(d){
        var pct = Math.round(d.score / d.total * 100);
        var n = niveau(pct);
        b.className = 'ab-badge ' + n.c;
        b.textContent = '\u2713 ' + d.score + '/' + d.total + ' — ' + n.t;
      } else if(assigné){
        b.className = 'ab-badge ab-todo';
        b.textContent = '\u{1F4DA} À faire';
      } else {
        return;
      }
      var top = c.querySelector('.card-top');
      if(top && top.parentNode) top.parentNode.insertBefore(b, top.nextSibling);
      else c.appendChild(b);
    });
  }

  async function demarrer(){
    if(typeof supabase === 'undefined' || !supabase.createClient) return;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    var s = await sb.auth.getSession();
    if(!s.data.session) return;           // mode découverte : on ne touche à rien

    css();

    var enfantId = localStorage.getItem(CLE_ACTIF);
    if(!enfantId){
      afficherBandeau('<div class="ab-qui alerte">\u{1F464} Aucun enfant sélectionné '
        + '<a href="ma-famille.html">Choisir qui travaille</a></div>');
      return;
    }

    var re = await sb.from('enfants').select('prenom').eq('id', enfantId).single();
    if(re.error || !re.data){
      localStorage.removeItem(CLE_ACTIF);
      afficherBandeau('<div class="ab-qui alerte">\u{1F464} Profil introuvable '
        + '<a href="ma-famille.html">Choisir qui travaille</a></div>');
      return;
    }
    prenom = re.data.prenom;

    // Progression (dernier essai par fiche)
    var rp = await sb.from('progression').select('*').eq('enfant_id', enfantId)
                     .order('fait_le', {ascending:false});
    (rp.data || []).forEach(function(p){
      if(!progParFiche[p.fiche_code]) progParFiche[p.fiche_code] = p;
    });

    // Assignations en attente
    var ra = await sb.from('assignations').select('fiche_code,statut').eq('enfant_id', enfantId)
                     .in('statut', ['a_faire','a_refaire']);
    assignCodes = (ra.data || []).map(function(a){ return a.fiche_code; });

    // Carte fichier -> code (depuis fiches.json)
    try{
      var r = await fetch('fiches.json');
      var data = await r.json();
      ['6-9ans','9-12ans','12-15ans'].forEach(function(cy){
        (data[cy] || []).forEach(function(f){
          if(f && f.fichier && f.code) mapFichierCode[f.fichier] = f.code;
        });
      });
    } catch(e){ /* sans fiches.json, pas de badge sur les cartes */ }

    // Bandeau du haut
    var html = '<div class="ab-qui">\u{1F464} <strong>' + prenom + '</strong> travaille en ce moment '
             + '<a href="ma-famille.html">changer d\'enfant</a></div>';

    if(assignCodes.length){
      var chips = assignCodes.map(function(code){
        var lien = null;
        for(var k in mapFichierCode){ if(mapFichierCode[k] === code){ lien = k; break; } }
        var libelle = code + (progParFiche[code] ? ' \u2713' : '');
        return lien ? '<a class="ab-chip" href="' + lien + '">' + libelle + '</a>'
                    : '<span class="ab-chip">' + libelle + '</span>';
      }).join('');
      html += '<div class="ab-assign"><h3>\u{1F4DA} Un adulte t\'a préparé ' 
            + (assignCodes.length > 1 ? 'des leçons' : 'une leçon') + '</h3>'
            + '<div class="ab-assign-list">' + chips + '</div></div>';
    }
    afficherBandeau(html);

    // Décorer les cartes (elles sont générées en asynchrone)
    decorerCartes();
    var obs = new MutationObserver(decorerCartes);
    obs.observe(document.body, {childList:true, subtree:true});
    setTimeout(decorerCartes, 600);
    setTimeout(decorerCartes, 1500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', demarrer);
  } else { demarrer(); }
})();
