"""L'Atelier du Devoir — le robot qui joue les fiches.
Joue chaque fiche au format moteur dans Chromium, en taille téléphone (360 × 740) :
  1. partie parfaite : toutes les bonnes réponses → le score doit atteindre le total, 3 étoiles ;
  2. clavier tactile : chaque réponse à écrire est tapée touche par touche sur le clavier virtuel
     → si une réponse est impossible à taper, c'est une erreur ;
  3. surveille les erreurs JavaScript et tout débordement horizontal de la page.
Usage : python3 qa/robot.py [fiches…]   (sans argument : toutes les fiches au format moteur)
"""
import sys, os, re, json, glob
from playwright.sync_api import sync_playwright

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fichiers = sys.argv[1:] or sorted(glob.glob(os.path.join(RACINE, 'fiches', '*.html')) + glob.glob(os.path.join(RACINE, 'fiches-perso', '*.html')))
fichiers = [f for f in fichiers if 'window.FICHE' in open(f, encoding='utf8').read()]
rapport = {}
def note(f, niv, msg): rapport.setdefault(os.path.relpath(f, RACINE), []).append((niv, msg))

JOUER = r"""
async (mode) => {
  const F = window.FICHE, attendre = ms => new Promise(r => setTimeout(r, ms)), pb = [];
  const deborde = () => document.documentElement.scrollWidth > window.innerWidth + 1;
  const minCible = F.niveau === 'CP' ? 56 : 44, petits = new Set();
  const mesure = (sel, nom) => document.querySelectorAll(sel).forEach(b => { const r = b.getBoundingClientRect(); if (r.height && r.height < minCible) petits.add(nom + ' (' + Math.round(r.height) + ' px)'); });
  const clic = el => { el.dispatchEvent(new MouseEvent('click', {bubbles:true})); };
  // Leçon : questions de contrôle
  for (let b = 0; b < F.lecon.length; b++) {
    const qs = F.lecon[b].questions || [];
    for (let q = 0; q < qs.length; q++) {
      const btn = [...document.querySelectorAll('#cq'+b+'-'+q+' .ctrl-btn')].find(x => x.dataset.v === qs[q].bonne);
      if (!btn) { pb.push(['E', 'bloc '+(b+1)+' Q'+(q+1)+' : bonne réponse introuvable à l\'écran']); continue; }
      clic(btn);
    }
    await attendre(30);
    mesure('#bloc'+b+' .ctrl-btn', 'boutons des questions de contrôle');
    if (deborde()) pb.push(['E', 'bloc '+(b+1)+' : la page déborde en largeur sur téléphone']);
    const suite = document.getElementById('btnbloc'+b) || document.querySelector('#bloc'+b+' .btn-compris');
    if (suite) { if (qs.length && suite.style.display === 'none') pb.push(['E', 'bloc '+(b+1)+' : bouton suivant absent après des réponses justes']); clic(suite); }
    await attendre(30);
  }
  // Exercices
  for (let i = 0; i < F.exercices.length; i++) {
    const ex = F.exercices[i];
    mesure('#ex'+i+' .qcm-btn', 'boutons de QCM'); mesure('#ex'+i+' .chip', 'étiquettes'); mesure('#ex'+i+' .jug-opt', 'phrases à choisir');
    if (mode === 'moitie' && ex.type === 'classify') {
      const chips = [...document.querySelectorAll('#pool'+i+' .chip')], cols = ex.cols.map(c => c.id); let justes = 0;
      chips.forEach((c, k) => { clic(c); const bon = k % 2 === 0; if (bon) justes++; AF.place(i, bon ? c.dataset.cat : cols.find(x => x !== c.dataset.cat)); });
      clic(document.getElementById('verif'+i)); await attendre(450);
      const pts = Number(document.getElementById('sc'+i).textContent);
      if (pts !== justes) pb.push(['E', 'exercice '+(i+1)+' : '+justes+' mots bien classés sur '+chips.length+' donnent '+pts+' point(s) au lieu de '+justes]);
      clic(document.getElementById('next'+i)); await attendre(30); continue;
    }
    if (mode === 'moitie') { clic(document.getElementById('next'+i)); continue; }
    if (ex.type === 'qcm') ex.items.forEach((it, k) => { const b = [...document.querySelectorAll('#q'+i+'-'+k+' .qcm-btn')].find(x => x.dataset.v === it.bonne); b ? clic(b) : pb.push(['E', 'exercice '+(i+1)+' item '+(k+1)+' : bonne option absente']); });
    if (ex.type === 'jugement') ex.items.forEach((it, k) => { const b = document.querySelector('#j'+i+'-'+k+' .jug-opt[data-ok="1"]'); b ? clic(b) : pb.push(['E', 'exercice '+(i+1)+' item '+(k+1)+' : bonne phrase absente']); });
    if (ex.type === 'drag') ex.items.forEach((it, k) => { const c = [...document.querySelectorAll('#pool'+i+' .chip:not(.used)')].find(x => x.dataset.w === it.rep); if (!c) { pb.push(['E', 'exercice '+(i+1)+' : étiquette « '+it.rep+' » introuvable']); return; } clic(c); clic(document.getElementById('dz'+i+'-'+k)); });
    if (ex.type === 'classify') { const chips = [...document.querySelectorAll('#pool'+i+' .chip')]; chips.forEach(c => { clic(c); AF.place(i, c.dataset.cat); }); }
    if (['saisie','dictee','conjtable'].includes(ex.type)) {
      for (let k = 0; k < ex.items.length; k++) {
        const it = ex.items[k], champ = document.getElementById('in'+i+'-'+k), rep = [].concat(it.rep)[0];
        if (!champ) { pb.push(['E', 'exercice '+(i+1)+' item '+(k+1)+' : champ introuvable']); continue; }
        if (mode === 'tactile') {
          clic(champ); await attendre(5);
          // on tape la meilleure forme possible avec les seules touches du clavier
          const touches = new Set([...document.querySelectorAll('#kb-global .kb-k')].map(x => x.dataset.k));
          const reps = [].concat(it.rep); let choisie = null;
          for (const r of reps) { const t = ex.strict ? String(r).toLowerCase() : String(r).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, m => '').normalize('NFC');
            const tapable = [...t].every(ch => touches.has(ch) || touches.has(ch.normalize('NFD')[0]));
            if (tapable) { choisie = t; break; } }
          if (!choisie) { const t = String(reps[0]); const manque = [...new Set([...t.toLowerCase()].filter(ch => !touches.has(ch) && !touches.has(ch.normalize('NFD')[0])))].join(' ');
            pb.push(['E', 'exercice '+(i+1)+' item '+(k+1)+' : « '+t+' » impossible à écrire avec le clavier du téléphone (manque : '+manque+')']); choisie = t.toLowerCase().normalize('NFD').replace(/[^a-zàéèç0-9 -]/g,''); }
          for (const ch of choisie) { const key = [...document.querySelectorAll('#kb-global .kb-k')].find(x => x.dataset.k === ch); if (key) clic(key); }
        } else { champ.value = rep; }
      }
      const v = document.getElementById('verif'+i); if (v) clic(v);
      await attendre(20);
      ex.items.forEach((it, k) => { const c = document.getElementById('in'+i+'-'+k); if (c && c.classList.contains('ko') && mode !== 'tactile') pb.push(['E', 'exercice '+(i+1)+' item '+(k+1)+' : la bonne réponse « '+[].concat(it.rep)[0]+' » est comptée fausse']); });
    }
    if (['drag','classify'].includes(ex.type)) { const v = document.getElementById('verif'+i); if (v) clic(v); }
    await attendre(450);
    if (deborde()) pb.push(['E', 'exercice '+(i+1)+' : la page déborde en largeur sur téléphone']);
    const pts = Number(document.getElementById('sc'+i).textContent);
    if (mode !== 'tactile' && pts !== ex.pts) pb.push(['E', 'exercice '+(i+1)+' : '+pts+' / '+ex.pts+' points avec toutes les bonnes réponses']);
    const nxt = document.getElementById('next'+i);
    if (!nxt || !nxt.classList.contains('show')) pb.push(['E', 'exercice '+(i+1)+' : bouton « suivant » jamais affiché']);
    clic(nxt);
    await attendre(30);
  }
  if (mode === 'moitie') return pb;
  if (petits.size) pb.push(['E', 'cibles trop petites pour un doigt (minimum '+minCible+' px) : '+[...petits].slice(0,3).join(', ')]);
  await attendre(1800);
  const total = F.exercices.reduce((s, e) => s + e.pts, 0);
  const affiche = (document.getElementById('bscore') || {}).textContent || '';
  const etoiles = document.querySelectorAll('.star.earned').length;
  if (mode !== 'tactile') {
    if (affiche.trim() !== total + ' / ' + total) pb.push(['E', 'bilan : « '+affiche+' » au lieu de '+total+' / '+total]);
    if (etoiles !== 3) pb.push(['E', 'bilan : '+etoiles+' étoile(s) allumée(s) sur 3 avec un sans-faute']);
  }
  return pb;
}
"""

with sync_playwright() as p:
    nav = p.chromium.launch()
    for f in fichiers:
        modes = ('parfait', 'tactile') + (('moitie',) if "type:'classify'" in open(f, encoding='utf8').read() or 'type:"classify"' in open(f, encoding='utf8').read() else ())
        for mode in modes:
            ctx = nav.new_context(viewport={'width': 360, 'height': 740}, has_touch=(mode == 'tactile'), is_mobile=(mode == 'tactile'))
            pg = ctx.new_page()
            erreurs_js = []
            pg.on('pageerror', lambda e: erreurs_js.append(str(e)))
            pg.route(re.compile(r'^https?://'), lambda r: r.abort())   # aucun réseau : on teste la fiche seule
            pg.goto('file://' + os.path.abspath(f))
            pg.wait_for_timeout(300)
            try:
                deja = [m for _, m in rapport.get(os.path.relpath(f, RACINE), [])]
                for niv, msg in pg.evaluate(JOUER, mode):
                    if msg in deja: continue   # déjà vu en partie parfaite
                    note(f, 'ERREUR', ({'tactile': '[clavier du téléphone] ', 'moitie': '[réponses à moitié justes] '}.get(mode, '')) + msg)
            except Exception as e:
                note(f, 'ERREUR', f'partie interrompue ({mode}) : {str(e).splitlines()[0][:160]}')
            for e in erreurs_js:
                if 'supabase' not in e.lower(): note(f, 'ERREUR', 'erreur JavaScript : ' + e[:160])
            ctx.close()
    nav.close()

n = sum(len(v) for v in rapport.values())
print(f'{len(fichiers)} fiches jouées · {n} problème(s)')
for f, l in sorted(rapport.items()):
    vus = []
    for niv, msg in l:
        if msg not in vus: vus.append(msg)
    print(f'\n## {f}')
    for m in vus: print('- ❌', m)
sys.exit(1 if n else 0)
