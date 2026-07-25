/* ═══════════════════════════════════════════════════════════
   L'Atelier du Devoir — Enregistrement de la progression
   À inclure dans les fiches, APRÈS le CDN supabase-js :
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="../atelier-progression.js"></script>
   Puis dans showBilan() :
     enregistrerProgression('O11', score, TOTAL_PTS);
   ═══════════════════════════════════════════════════════════ */
(function(){
  var SUPABASE_URL = "https://rwqsvrmjjoihuhmvbwuu.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXN2cm1qam9paHVobXZid3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjQxNTMsImV4cCI6MjA5OTk0MDE1M30.VtdOnI169-erf48NpxLPCC0th6kHqBcsBuCauOx52HI";
  var CLE_ACTIF = "atelier_enfant_actif";
  var sb = null;

  // Chemin racine du site depuis une fiche (fiches/xxx.html → ../)
  function racine(){
    return (window.location.pathname.indexOf('/fiches/') !== -1) ? '../' : '';
  }

  function client(){
    if(sb) return sb;
    if(typeof supabase === 'undefined' || !supabase.createClient) return null;
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return sb;
  }

  // Insère la petite bannière dans la carte de bilan
  function banniere(html, couleur){
    var cible = document.querySelector('.bilan-card') || document.querySelector('.bilan-wrap') || document.body;
    var box = document.getElementById('atelier-progression-box');
    if(!box){
      box = document.createElement('div');
      box.id = 'atelier-progression-box';
      box.style.cssText = "margin-top:16px;border:2.5px solid " + couleur + ";border-radius:14px;"
        + "padding:12px 14px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.88rem;"
        + "line-height:1.6;color:" + couleur + ";background:#fff;text-align:center;";
      cible.appendChild(box);
    } else {
      box.style.borderColor = couleur;
      box.style.color = couleur;
    }
    box.innerHTML = html;
  }

  function invitation(){
    banniere(
      "\u{1F4BE} <strong>Sauvegarde ta progression&nbsp;!</strong><br>"
      + "<a href='" + racine() + "connexion.html' style='color:#3B82F6;font-weight:800;'>Crée un compte famille</a>"
      + " pour garder tes résultats.",
      "#3B82F6"
    );
  }

  /* Fonction publique appelée par les fiches */
  window.enregistrerProgression = async function(ficheCode, score, total){
    try{
      var c = client();
      if(!c){ return; }

      var res = await c.auth.getSession();
      if(!res.data.session){ invitation(); return; }

      var enfantId = localStorage.getItem(CLE_ACTIF);
      if(!enfantId){
        banniere(
          "\u{1F464} <strong>Aucun enfant sélectionné.</strong><br>"
          + "<a href='" + racine() + "ma-famille.html' style='color:#F59E0B;font-weight:800;'>Choisis qui travaille</a>"
          + " pour enregistrer ce résultat.",
          "#F59E0B"
        );
        return;
      }

      // Récupérer le prénom (pour l'affichage) et vérifier que l'enfant existe
      var qEnfant = await c.from('enfants').select('prenom').eq('id', enfantId).single();
      if(qEnfant.error || !qEnfant.data){
        localStorage.removeItem(CLE_ACTIF);
        banniere(
          "\u{1F464} <strong>Profil introuvable.</strong><br>"
          + "<a href='" + racine() + "ma-famille.html' style='color:#F59E0B;font-weight:800;'>Choisis qui travaille</a>.",
          "#F59E0B"
        );
        return;
      }

      var ins = await c.from('progression').insert({
        enfant_id: enfantId,
        fiche_code: ficheCode,
        score: score,
        total: total
      });

      if(ins.error){
        banniere("\u26A0\uFE0F Résultat non enregistré. Vérifie ta connexion internet.", "#EF4444");
        return;
      }

      var pct = total > 0 ? Math.round(score / total * 100) : 0;
      var niveau = pct >= 90 ? "Brillant \u2B50"
                 : pct >= 80 ? "Bien maîtrisé \u{1F4AA}"
                 : pct >= 50 ? "En cours \u{1F4DA}"
                 : "À retravailler \u{1F501}";

      banniere(
        "\u2705 <strong>Résultat enregistré pour " + qEnfant.data.prenom + "&nbsp;!</strong><br>"
        + score + "/" + total + " — " + niveau,
        "#10B981"
      );

    } catch(e){
      // Ne jamais casser la fiche à cause de la sauvegarde
      console.log("Progression non enregistrée :", e);
    }
  };
})();
