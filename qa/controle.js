#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   L'Atelier du Devoir — Contrôle automatique des fiches
   Usage :
     node qa/controle.js                 → tout le site
     node qa/controle.js fiches/fiche_O12_….html …   → seulement ces fiches
     options : --rapport rapport.md (écrit le rapport en markdown)
               --json (sortie JSON)  --strict (les « à revoir » font aussi échouer)
   Code de sortie : 1 s'il reste au moins une ERREUR (ou un « à revoir » en --strict).
   Aucune dépendance : Node 18+ suffit.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

/* ─── Arguments ─── */
const args = process.argv.slice(2);
const opt = { rapport: null, json: false, strict: false, fichiers: [] };
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--rapport') opt.rapport = args[++i];
  else if (args[i] === '--json') opt.json = true;
  else if (args[i] === '--strict') opt.strict = true;
  else opt.fichiers.push(args[i]);
}
const RACINE = path.resolve(__dirname, '..');
const lire = p => fs.readFileSync(path.join(RACINE, p), 'utf8');
const existe = p => { try { return fs.statSync(path.join(RACINE, p)).isFile(); } catch (e) { return false; } };

/* ─── Collecte des anomalies ─── */
const rapport = {};          // fichier → [{niv, regle, msg}]
function note(fichier, niv, regle, msg) {
  (rapport[fichier] = rapport[fichier] || []).push({ niv, regle, msg });
}
const E = 'ERREUR', R = 'À REVOIR';

/* ─── Référentiels ─── */
const NIVEAUX = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
const rang = n => NIVEAUX.indexOf(n);
const niveauPrincipal = n => String(n || '').split(/[\/_ ]/)[0];
const cycleDe = n => { const r = rang(niveauPrincipal(n)); return r < 0 ? 0 : r <= 2 ? 2 : r <= 5 ? 3 : 4; };

const H_MUET = 'habit habiter habitant habitude habituel haleine hameçon harmonie hélice hélicoptère herbe héros hésiter heure heureux heureuse heureusement hier hippopotame hirondelle histoire hiver homme honnête hôpital horizon horloge horrible hôtel huile huit huître humain humeur humide hygiène hymne hypothèse hexagone hectare hémisphère hérisson'.split(' ');
// « huit » : on dit « le huit », « de huit » — h aspiré par usage, retiré plus bas
const H_ASPIRE_USAGE = ['huit', 'héros', 'hérisson'];
const EXCEPTIONS_VOYELLE = /^(un|une|onze|onzième|oui|ouistiti|ouate|yaourt|yoga|yo-yo|yéti|uhlan)$/i;
const MOTS_INTERDITS = { hazard: 'anglais (hasard)', lizard: 'anglais (lézard)', guitar: 'anglais (guitare)', silk: 'anglais', codex: 'hors lexique enfant', faquir: 'orthographe : fakir', cartacal: "n'existe pas", weekend: 'week-end' };
const SANS_ACCENT = { ecole: 'école', eleve: 'élève', eleves: 'élèves', frere: 'frère', deja: 'déjà', tete: 'tête', meme: 'même', flute: 'flûte', foret: 'forêt', fenetre: 'fenêtre', bateaux: null, tres: 'très', apres: 'après' };
const PLAFOND_MOTS = { CP: 40, CE1: 40, CE2: 60, CM1: 100, CM2: 100, '6e': 100, '5e': 150, '4e': 150, '3e': 150 };
const PLAFOND_MATIERE = { 'Mathématiques': 60, 'Géographie': 50, 'Anglais': 40 };

/* ─── Outils texte ─── */
function sansBalises(h) {
  return String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}
function norm(s) {
  return sansBalises(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
const motsDe = s => norm(s).split(/[ ']+/).filter(Boolean);
function similarite(a, b) {
  const A = new Set(motsDe(a)), B = new Set(motsDe(b));
  if (A.size < 3 || B.size < 3) return 0;
  let c = 0; A.forEach(m => { if (B.has(m)) c++; });
  return c / Math.max(A.size, B.size);
}
// Texte explicatif d'un bloc : on retire exemples, tableaux, schémas, grilles de comparaison
function texteExplicatif(html) {
  const exclus = /(exemple|tbl|conj-grid|conj-col|compare-grid|compare-card|schema|frise|carte)/;
  let out = '', pile = [], i = 0;
  const re = /<(\/?)([a-z0-9]+)([^>]*)>/gi; let m, dernier = 0;
  const masque = () => pile.some(x => x);
  while ((m = re.exec(html))) {
    if (!masque()) out += html.slice(dernier, m.index) + ' ';
    dernier = re.lastIndex;
    const tag = m[2].toLowerCase(), ferme = m[1] === '/', attrs = m[3];
    if (/^(br|img|hr|input|meta|link)$/.test(tag) || /\/$/.test(attrs)) continue;
    if (ferme) { pile.pop(); continue; }
    const cls = (attrs.match(/class\s*=\s*["']([^"']*)["']/) || [])[1] || '';
    pile.push(tag === 'table' || tag === 'svg' || exclus.test(cls));
  }
  if (!masque()) out += html.slice(dernier);
  return sansBalises(out);
}
function emojisRecents(s) {
  const out = [];
  for (const ch of String(s)) { const c = ch.codePointAt(0); if (c >= 0x1FAA8 && c <= 0x1FAFF) out.push(ch + ' U+' + c.toString(16).toUpperCase()); }
  return out;
}
function controleLangue(fichier, texte, ou) {
  // Les balises deviennent un séparateur « ¦ » : un mot mis en valeur (<b>que</b> est…) relève
  // du métalangage et ne doit pas déclencher l'élision.
  const t = ' ' + String(texte || '').replace(/<[^>]*>/g, '¦').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ') + ' ';
  // Élisions
  const re = /(^|[\s(\[>])(le|la|de|ce|ne|se|je|me|te|que|si)\s+([aeiouyàâäéèêëîïôöûùüœæhAEIOUYÀÂÉÈÊÎÔÛH][\wàâäéèêëîïôöûùüÿœæ-]*)/gi;
  let m;
  while ((m = re.exec(t))) {
    const det = m[2].toLowerCase(), mot = m[3], ml = mot.toLowerCase();
    if (/[«"“]\s*$/.test(t.slice(Math.max(0, m.index - 3), m.index + m[1].length))) continue; // forme fautive citée exprès
    if (det === 'si' && !/^(il|ils)$/.test(ml)) continue;
    if (ml[0] === 'h') {
      if (H_MUET.includes(ml) && !H_ASPIRE_USAGE.includes(ml)) note(fichier, E, 'élision', `${ou} : « ${m[2]} ${mot} » (h muet)`);
      continue;
    }
    if (EXCEPTIONS_VOYELLE.test(ml)) continue;
    if (/^(et|ou|à|en)$/.test(ml) && det !== 'si') continue; // métalangage : « le ou la », « je et tu »
    if ([...mot].length === 1) continue;                // lettre citée : « le a de… »
    if (/^[A-ZÀ-Ý]/.test(mot) && det === det.toLowerCase()) continue; // nom propre ou début de liste
    if (det === 'la' && /^(une)$/.test(ml)) continue;
    note(fichier, E, 'élision', `${ou} : « ${m[2]} ${mot} »`);
  }
  // Mots interdits et accents oubliés
  motsDe(texte).forEach(w => {
    if (MOTS_INTERDITS[w]) note(fichier, E, 'mot faux', `${ou} : « ${w} » — ${MOTS_INTERDITS[w]}`);
  });
  const brut = sansBalises(texte);
  (brut.toLowerCase().match(/[a-zà-ÿœæ]+/g) || []).forEach(w => { if (SANS_ACCENT[w]) note(fichier, R, 'accent', `${ou} : « ${w} » → ${SANS_ACCENT[w]} ?`); });
  if (/ {2,}/.test(String(texte).replace(/<[^>]*>/g, ''))) {/* espaces doubles : bénin */ }
  emojisRecents(texte).forEach(x => note(fichier, E, 'émoticône illisible', `${ou} : ${x} (≥ U+1FAA8 → carré vide sur certains appareils)`));
}

/* ═══════════════════════════════════════════════════════════════════
   1. CONTRÔLES DU MOTEUR ET DES FICHIERS PARTAGÉS
   ═══════════════════════════════════════════════════════════════════ */
const MOTEUR = existe('atelier-fiche.js') ? lire('atelier-fiche.js') : '';
const CSS = existe('atelier-fiche.css') ? lire('atelier-fiche.css') : '';
function controleMoteur() {
  const f = 'atelier-fiche.js';
  if (!MOTEUR) return note(f, E, 'moteur', 'fichier absent');
  if (!/function noterErreur/.test(MOTEUR)) note(f, E, 'moteur', 'noterErreur absent : moteur antérieur à octobre 2026');
  if (!/enregistrerProgression\(F\.code,\s*score,\s*TOTAL,\s*erreursFiche\)/.test(MOTEUR)) note(f, E, 'moteur', "enregistrerProgression n'envoie pas les erreurs (4e argument)");
  if (!/AF\.ctrl/.test(MOTEUR)) note(f, E, 'moteur', 'questions de contrôle absentes (AF.ctrl)');
  if (/\.stars\s*\{[^}]*grayscale/.test(CSS)) note('atelier-fiche.css', E, 'étoiles', 'grayscale sur .stars au lieu de .star');
  if (/\.ctrl/.test(MOTEUR) && !/\.ctrl/.test(CSS)) note('atelier-fiche.css', E, 'moteur', 'le moteur affiche des questions de contrôle (.ctrl) mais le CSS en ligne n\'a aucun style pour elles : CSS périmé');
  if (/class="gl"|\.gl\b/.test(MOTEUR) === false && GLOSSAIRE_UTILISE) note(f, E, 'glossaire', 'des fiches utilisent glossaire:{…} mais le moteur en ligne ne gère pas les bulles');
  if (existe('atelier-progression.js')) {
    const p = lire('atelier-progression.js');
    if (!/currentScript/.test(p)) note('atelier-progression.js', E, 'chemins', "racine() ne se base pas sur l'emplacement du script : version antérieure à octobre 2026, liens cassés depuis fiches-perso/");
    if (!/erreurs/.test(p)) note('atelier-progression.js', E, 'moteur', 'colonne erreurs non envoyée');
  } else note('atelier-progression.js', E, 'moteur', 'fichier absent');
}
let GLOSSAIRE_UTILISE = false;

/* ═══════════════════════════════════════════════════════════════════
   2. CONTRÔLES D'UNE FICHE AU FORMAT MOTEUR (window.FICHE)
   ═══════════════════════════════════════════════════════════════════ */
function extraireFiche(html, fichier) {
  const m = html.match(/<script>\s*(window\.FICHE\s*=[\s\S]*?)<\/script>/);
  if (!m) return null;
  try { new vm.Script(m[1]); } catch (e) { note(fichier, E, 'syntaxe JS', e.message); return false; }
  const ctx = { window: {} };
  try { vm.runInNewContext(m[1], ctx, { timeout: 1000 }); } catch (e) { note(fichier, E, 'syntaxe JS', e.message); return false; }
  return { F: ctx.window.FICHE, source: m[1] };
}

const ACCENTS_FICHES = {};     // cycle → [{couleur, fichier}]
const DESCRIPTIONS = {};       // description meta → [fichiers]

function controleTitreMeta(fichier, html, niveau) {
  const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  if (!t) note(fichier, R, 'référencement', '<title> absent');
  else {
    const L = [...t.trim()].length;
    if (L < 55 || L > 60) note(fichier, R, 'référencement', `<title> de ${L} caractères (55-60 attendus) : « ${t.trim()} »`);
    if (/\b[A-Z]{1,3}\d{2,3}\b/.test(t)) note(fichier, R, 'référencement', '<title> contient un code de fiche');
    if (/\bfiche\b/i.test(t)) note(fichier, R, 'référencement', '<title> contient le mot « fiche »');
    if (/atelier du devoir/i.test(t)) note(fichier, R, 'référencement', '<title> contient le nom du site');
    if (/imprimer|pdf/i.test(t)) note(fichier, E, 'référencement', '<title> promet un imprimable / PDF');
    if (niveau && !niveau.split(/[\/_ ]/).some(n => t.includes(n))) note(fichier, R, 'référencement', `<title> sans le niveau (${niveau})`);
  }
  const d = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1];
  if (!d) note(fichier, R, 'référencement', 'meta-description absente');
  else {
    const L = [...d].length;
    if (L < 140 || L > 155) note(fichier, R, 'référencement', `meta-description de ${L} caractères (140-155 attendus)`);
    (DESCRIPTIONS[d] = DESCRIPTIONS[d] || []).push(fichier);
  }
}

function controleFicheMoteur(fichier, html, F, source) {
  const ou = c => c;
  const niv = niveauPrincipal(F.niveau), r = rang(niv), cyc = cycleDe(F.niveau);
  const base = path.basename(fichier);

  /* Identité, nom de fichier, chargements */
  ['code', 'niveau', 'matiere', 'titre', 'retour', 'lecon', 'memo', 'exercices'].forEach(k => { if (F[k] == null) note(fichier, E, 'structure', `champ ${k} absent`); });
  if (r < 0) note(fichier, E, 'structure', `niveau inconnu : ${F.niveau}`);
  const mNom = base.match(/^fiche_([A-Z0-9]+)_([a-z0-9_]+)\.html$/i);
  if (!mNom) note(fichier, R, 'nommage', 'nom de fichier hors convention fiche_<CODE>_<description>_<NIVEAU>.html');
  else if (mNom[1] !== F.code) note(fichier, E, 'nommage', `code du fichier (${mNom[1]}) ≠ code de la fiche (${F.code})`);
  if (F.retour && !/^(cp|ce1|ce2|cm1|cm2|6e|5e|4e|3e|passage-secret)\.html$/.test(F.retour)) note(fichier, R, 'navigation', `retour vers ${F.retour} (page de classe en minuscules attendue)`);
  if (!/src=["']\.\.\/atelier-progression\.js["']/.test(html)) note(fichier, E, 'progression', 'atelier-progression.js non chargé : score non enregistré');
  if (!/supabase-js/.test(html)) note(fichier, E, 'progression', 'client Supabase non chargé');
  if (!/src=["']\.\.\/atelier-fiche\.js["']/.test(html)) note(fichier, E, 'moteur', 'atelier-fiche.js non chargé');
  if (cyc === 4 && F.cycle !== 4) note(fichier, E, 'cycle 4', 'cycle:4 manquant');
  if (cyc === 4 && !/Playfair/.test(html)) note(fichier, R, 'cycle 4', 'polices Lato + Playfair non chargées');
  if (F.accent) (ACCENTS_FICHES[cyc] = ACCENTS_FICHES[cyc] || []).push({ c: F.accent.toLowerCase(), f: fichier });
  if (!/^dictée/i.test(F.categorie || '') && !/^D[MC]\d/.test(F.code || '')) controleTitreMeta(fichier, html, F.niveau);
  else controleTitreMeta(fichier, html, F.niveau);

  /* Entités HTML dans les champs affichés en texte brut (textContent / esc) */
  const champsTexte = [['niveau', F.niveau], ['categorie', F.categorie], ['duree', F.duree]];
  (F.exercices || []).forEach((ex, i) => {
    champsTexte.push([`exercice ${i + 1} titre`, ex.titre], [`exercice ${i + 1} consigne`, ex.consigne]);
    (ex.pool || []).forEach(w => champsTexte.push([`exercice ${i + 1} pool`, w]));
    (ex.items || []).forEach(it => { if (ex.type === 'classify') champsTexte.push([`exercice ${i + 1} mot`, it.mot]); if (it.pronom) champsTexte.push([`exercice ${i + 1} pronom`, it.pronom]); if (ex.type === 'drag') champsTexte.push([`exercice ${i + 1} réponse`, it.rep]); });
  });
  champsTexte.forEach(([k, v]) => {
    if (typeof v === 'string' && /&(#x?[0-9a-f]+|[a-z]+);|<[a-z]/i.test(v)) note(fichier, E, 'entité/HTML affiché en clair', `${k} : « ${v} » (affiché tel quel par le moteur)`);
  });

  /* Langue + émoticônes sur toutes les chaînes de la fiche */
  const toutes = [];
  (function parcours(o, chemin) {
    if (typeof o === 'string') toutes.push([chemin, o]);
    else if (Array.isArray(o)) o.forEach((x, i) => parcours(x, chemin + '[' + i + ']'));
    else if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (k !== 'accent' && !/^accent/.test(k)) parcours(o[k], chemin ? chemin + '.' + k : k); });
  })(F, '');
  toutes.forEach(([c, s]) => { if (!/^(retour|code|niveau)$/.test(c)) controleLangue(fichier, s, c); });
  // Séquences \u{…} recevables uniquement dans les chaînes JS (le moteur les interprète) — rien à signaler.

  /* Leçon : blocs, questions de contrôle, plafonds, glossaire */
  const blocs = F.lecon || [];
  if (blocs.length < 2 || blocs.length > 5) note(fichier, R, 'leçon', `${blocs.length} blocs (cible 3 à 4)`);
  const nbQ = r >= 0 && r <= 2 ? 2 : 3;
  let plafond = PLAFOND_MOTS[niv] || 100;
  if (PLAFOND_MATIERE[F.matiere]) plafond = Math.min(plafond, PLAFOND_MATIERE[F.matiere]);
  let cumul = '';
  const glo = F.glossaire || {}, gloVus = {};
  if (F.glossaire) GLOSSAIRE_UTILISE = true;
  const questionsControle = [];
  blocs.forEach((b, bi) => {
    const nom = `bloc ${bi + 1}`;
    cumul += ' ' + [b.titre, b.analogie, b.html, b.ugo].join(' ');
    const mots = texteExplicatif(b.html || '').split(/\s+/).filter(w => /[a-zà-ÿ]/i.test(w)).length;
    if (mots > plafond * 1.15) note(fichier, R, 'longueur', `${nom} : ${mots} mots de texte explicatif (plafond ${plafond})`);
    if (cyc === 4 && !b.analogie) note(fichier, R, 'cycle 4', `${nom} : analogie absente`);
    const qs = b.questions || [];
    if (!qs.length) note(fichier, /^D[MC]\d/.test(F.code) ? R : E, 'contrôle de lecture', `${nom} : aucune question de contrôle`);
    else if (qs.length !== nbQ) note(fichier, R, 'contrôle de lecture', `${nom} : ${qs.length} questions (${nbQ} attendues en ${niv})`);
    qs.forEach((q, qi) => {
      const id = `${nom} Q${qi + 1}`;
      questionsControle.push({ id, texte: q.q + ' ' + q.bonne });
      if (!q.options || q.options.indexOf(q.bonne) < 0) note(fichier, E, 'contrôle de lecture', `${id} : la bonne réponse n'est pas dans les options — bloc impossible à passer`);
      if (q.options && new Set(q.options).size !== q.options.length) note(fichier, E, 'contrôle de lecture', `${id} : options en double`);
      if (q.options && (q.options.length < 2 || q.options.length > 3)) note(fichier, R, 'contrôle de lecture', `${id} : ${q.options.length} options (2 à 3)`);
      if (!q.expl) note(fichier, R, 'contrôle de lecture', `${id} : pas d'explication`);
      // Réponse trouvable dans les blocs déjà lus
      const lu = ' ' + norm(cumul) + ' ';
      const cles = motsDe(q.bonne).filter(w => w.length >= 4 && !/^(avec|sans|dans|pour|leur|elle|elles|sont|cette|plus|moins|tout|tous|deux|trois|quatre)$/.test(w));
      if (/^(oui|non|vrai|faux)$/i.test(String(q.bonne).trim())) return;
      const absents = cles.filter(w => !lu.includes(w.slice(0, Math.max(4, Math.min(w.length, w.length > 6 ? w.length - 2 : w.length)))));
      const motCourt = motsDe(q.bonne).length && !cles.length && !lu.includes(' ' + norm(q.bonne) + ' ');
      if ((cles.length && absents.length > cles.length / 2) || motCourt)
        note(fichier, R, 'contrôle de lecture', `${id} : « ${sansBalises(q.bonne)} » introuvable dans les blocs déjà lus`);
    });
    // Glossaire
    const tags = [...String(b.html || '').matchAll(/data-t=["']([^"']+)["']/g)].map(x => x[1]);
    const tagsTout = tags.concat([...String(b.analogie || '').matchAll(/data-t=["']([^"']+)["']/g)].map(x => x[1]));
    if (tagsTout.length > 3) note(fichier, R, 'glossaire', `${nom} : ${tagsTout.length} bulles (3 maximum)`);
    tagsTout.forEach(k => {
      if (!glo[k]) note(fichier, E, 'glossaire', `${nom} : bulle « ${k} » sans définition dans glossaire`);
      if (gloVus[k]) note(fichier, R, 'glossaire', `${nom} : « ${k} » balisé une 2e fois`);
      gloVus[k] = 1;
    });
  });
  [...String(F.memo || '').matchAll(/data-t=["']([^"']+)["']/g)].forEach(x => { if (!glo[x[1]]) note(fichier, E, 'glossaire', `mémo : bulle « ${x[1]} » sans définition`); gloVus[x[1]] = 1; });
  Object.keys(glo).forEach(k => {
    if (!gloVus[k]) note(fichier, R, 'glossaire', `définition « ${k} » jamais utilisée`);
    if (glo[k].voir && /\b[A-Z]{1,3}\d{2,3}\b|\.html/.test(glo[k].voir)) note(fichier, E, 'glossaire', `« ${k} » : voir doit nommer un thème, pas un code ni un fichier`);
  });
  if (/data-t=/.test(JSON.stringify(F.exercices || []))) note(fichier, E, 'glossaire', 'bulle dans les exercices (peut donner la réponse)');

  /* Exercices */
  const exs = F.exercices || [];
  if (!exs.length) note(fichier, E, 'exercices', 'aucun exercice');
  const itemsTextes = [];
  exs.forEach((ex, i) => {
    const nom = `exercice ${i + 1} (${ex.type})`;
    const items = ex.items || [];
    if (!items.length) return note(fichier, E, 'exercices', `${nom} : aucun item`);
    if (!['qcm', 'drag', 'classify', 'saisie', 'jugement', 'conjtable', 'dictee'].includes(ex.type)) note(fichier, E, 'exercices', `${nom} : type inconnu`);
    if (r === 0 && ['saisie', 'conjtable'].includes(ex.type)) note(fichier, E, 'niveau', `${nom} : aucune saisie au CP`);
    if (ex.pts != null && ex.type !== 'classify' && ex.pts !== items.length) note(fichier, R, 'score', `${nom} : pts:${ex.pts} pour ${items.length} items`);
    items.forEach((it, ii) => {
      const id = `${nom} item ${ii + 1}`;
      const enonce = it.phrase || it.q || it.consigne || ((it.avant || '') + ' ___ ' + (it.apres || '')) || it.mot || '';
      if (ex.type === 'qcm') {
        if (!it.options || it.options.indexOf(it.bonne) < 0) note(fichier, E, 'exercices', `${id} : bonne réponse absente des options`);
        if (it.options && new Set(it.options).size !== it.options.length) note(fichier, E, 'exercices', `${id} : options en double`);
        if (r === 0 && it.options && it.options.length > 2) note(fichier, R, 'niveau', `${id} : ${it.options.length} options au CP (2 maximum)`);
        if (r === 1 && it.options && it.options.length > 3) note(fichier, R, 'niveau', `${id} : ${it.options.length} options en CE1 (3 maximum)`);
        itemsTextes.push({ id, texte: enonce + ' ' + it.bonne });
      } else if (ex.type === 'jugement') {
        if (!it.bonne || !it.mauvaise) note(fichier, E, 'exercices', `${id} : bonne ou mauvaise manquante`);
        if (norm(it.bonne) === norm(it.mauvaise)) note(fichier, E, 'exercices', `${id} : les deux phrases sont identiques`);
        itemsTextes.push({ id, texte: (it.consigne || '') + ' ' + it.bonne });
      } else if (ex.type === 'drag') {
        if (!it.rep) note(fichier, E, 'exercices', `${id} : réponse vide`);
        itemsTextes.push({ id, texte: enonce.replace('___', it.rep || '') });
      } else if (ex.type === 'classify') {
        const cols = (ex.cols || []).map(c => c.id);
        if (cols.indexOf(it.cat) < 0) note(fichier, E, 'exercices', `${id} : catégorie « ${it.cat} » inexistante`);
      } else if (['saisie', 'conjtable', 'dictee'].includes(ex.type)) {
        const reps = Array.isArray(it.rep) ? it.rep : [it.rep];
        if (!reps.length || reps.some(x => !x || !String(x).trim())) note(fichier, E, 'exercices', `${id} : réponse attendue vide`);
        if (ex.maxlen && reps.some(x => [...String(x)].length > ex.maxlen)) note(fichier, E, 'exercices', `${id} : réponse « ${reps[0]} » plus longue que maxlen (${ex.maxlen}) — impossible à écrire`);
        // Réponse écrivable avec le clavier virtuel du téléphone (le seul clavier sur tactile)
        const touches = new Set(((ex.clavier === 'chiffres') ? '0123456789' : 'azertyuiopqsdfghjklmwxcvbnéèàç') + ' -');
        const forme = x => ex.strict ? String(x).trim().toLowerCase()
          : String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*([.,;:!?])\s*/g, '$1').replace(/\s+/g, ' ').trim();
        if (reps.length && !reps.some(x => [...forme(x)].every(c => touches.has(c)))) {
          const manque = [...new Set([...forme(reps[0])].filter(c => !touches.has(c)))].join(' ');
          note(fichier, E, 'clavier du téléphone', `${id} : « ${reps[0]} » impossible à écrire sur téléphone (manque : ${manque})`);
        }
        if (r === 1 && ex.type === 'saisie' && reps.some(x => [...String(x)].length > 3)) note(fichier, R, 'niveau', `${id} : saisie de plus de 3 caractères en CE1`);
        if (r === 2 && ex.type === 'saisie' && reps.some(x => String(x).trim().split(/\s+/).length > 2)) note(fichier, R, 'niveau', `${id} : saisie de plus de 2 mots en CE2`);
        if (ex.type === 'dictee') {
          if (it.lu && /œ/.test(it.lu)) note(fichier, R, 'dictée', `${id} : ligature œ dans lu (écrire oe)`);
        }
        if (ex.type === 'saisie') itemsTextes.push({ id, texte: String(it.phrase || '').replace(/_{2,}/, reps[0] || '') });
      }
      /* Indice révélateur et reconstitution du mot (exercices à trous) */
      const trou = String(it.phrase || it.avant || '');
      const repsTxt = (Array.isArray(it.rep) ? it.rep : [it.rep || it.bonne]).filter(Boolean).map(String);
      if (/_{2,}/.test(trou + (it.apres || '')) && repsTxt.length) {
        const ligne = sansBalises((it.phrase || ((it.avant || '') + ' ___ ' + (it.apres || '')))).toLowerCase();
        const lettresCollees = /[a-zà-ÿ]_{2,}|_{2,}[a-zà-ÿ]/i.test(ligne);
        if (lettresCollees) {
          const mm = ligne.match(/([a-zà-ÿ]*)_{2,}([a-zà-ÿ]*)/i);
          const motCible = mm[1] + repsTxt[0].toLowerCase() + mm[2];
          if (motCible.length >= 3 && new RegExp('(^|[^a-zà-ÿ])' + motCible + '([^a-zà-ÿ]|$)').test(ligne.replace(mm[0], ' '))) note(fichier, E, 'indice révélateur', `${id} : le mot « ${motCible} » est écrit en clair dans l'item`);
          if (/\?/.test(mm[0])) note(fichier, E, 'indice révélateur', `${id} : « ? » à l'emplacement de la lettre`);
          if (it.expl) {
            const e = norm(it.expl);
            const autre = (e.match(new RegExp('\\b' + norm(mm[1]) + '[a-z]+' + norm(mm[2]) + '\\b')) || [])[0];
            if (autre && !e.includes(norm(motCible)) && mm[1].length + mm[2].length >= 2) note(fichier, R, 'mot reconstitué', `${id} : blanc + réponse donnent « ${motCible} », l'explication parle de « ${autre} »`);
          }
        } else {
          repsTxt.forEach(rp => {
            const rn = norm(rp);
            if (rn.length >= 4 && (' ' + norm(ligne.replace(/_{2,}/, ' ')) + ' ').includes(' ' + rn + ' ')) note(fichier, E, 'indice révélateur', `${id} : la réponse « ${rp} » apparaît déjà dans l'item`);
          });
        }
      }
    });
    if (ex.type === 'drag') {
      const pool = (ex.pool || items.map(x => x.rep)).slice();
      items.forEach((it, ii) => { const k = pool.indexOf(it.rep); if (k < 0) note(fichier, E, 'exercices', `${nom} item ${ii + 1} : « ${it.rep} » manque dans le pool`); else pool.splice(k, 1); });
    }
    if (ex.type === 'classify') {
      if (ex.pts != null && ex.pts !== items.length) note(fichier, E, 'score classification', `${nom} : pts:${ex.pts} pour ${items.length} mots → score arrondi incohérent (1 mot = 1 point)`);
      if ((ex.cols || []).length > 2) note(fichier, R, 'mobile', `${nom} : ${(ex.cols || []).length} colonnes, à vérifier sur 360 px`);
    }
  });
  if (cyc === 4 && exs.length && exs[exs.length - 1].type !== 'jugement' && !/^DC/.test(F.code)) note(fichier, R, 'cycle 4', 'la fiche ne finit pas par un exercice de jugement');
  if (exs.length && exs[exs.length - 1].type === 'qcm') note(fichier, R, 'pédagogie', 'dernier exercice en QCM (finir par une production)');

  /* Doublons : exercices entre eux, et exercices ↔ questions de contrôle */
  for (let a = 0; a < itemsTextes.length; a++) {
    for (let b = a + 1; b < itemsTextes.length; b++) {
      if (itemsTextes[a].id.split(' item')[0] === itemsTextes[b].id.split(' item')[0]) continue;
      const s = similarite(itemsTextes[a].texte, itemsTextes[b].texte);
      if (s >= 0.8) note(fichier, R, 'doublon', `${itemsTextes[a].id} ≈ ${itemsTextes[b].id} (${Math.round(s * 100)} % de mots communs)`);
    }
    questionsControle.forEach(q => {
      const s = similarite(itemsTextes[a].texte, q.texte);
      if (s >= 0.75) note(fichier, R, 'doublon contrôle', `${itemsTextes[a].id} ≈ ${q.id} (${Math.round(s * 100)} %)`);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   3. ANCIENNES FICHES (sans moteur) : contrôles par motifs
   ═══════════════════════════════════════════════════════════════════ */
function controleFicheAncienne(fichier, html) {
  note(fichier, R, 'format', 'ancien format (sans window.FICHE) : contrôles limités, migration vers le moteur conseillée');
  const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  try { new vm.Script(scripts); } catch (e) { note(fichier, E, 'syntaxe JS', e.message); }
  if (/scoreSnap/.test(scripts)) note(fichier, E, 'score', 'motif scoreSnap interdit (affichage faux si le parcours change)');
  if (/\.stars\s*\{[^}]*grayscale/.test(html)) note(fichier, E, 'étoiles', 'grayscale sur .stars : étoiles grises définitivement');
  if (/style\.filter\s*=\s*['"]grayscale\(1/.test(scripts) && !/location\.reload/.test(html) && /recommenc|restart|reset|rejouer/i.test(html) && !/style\.filter\s*=\s*['"]['"]/.test(scripts)) note(fichier, E, 'étoiles', "style.filter='grayscale' en inline : l'étoile ne se rallume plus après Recommencer");
  if (/Math\.round\(\s*\w+\s*\/\s*2\s*\)/.test(scripts)) note(fichier, R, 'score classification', 'Math.round(x/2) : score divisé (1 item = 1 point)');
  if (/data-expl\s*=/.test(html)) note(fichier, E, 'données', "data-expl : texte rédigé dans un attribut HTML (casse sur les apostrophes)");
  if (/onclick=["'][^"']*<(strong|em|b)\b/.test(html)) note(fichier, E, 'données', 'HTML passé dans un onclick');
  if (!/enregistrerProgression/.test(html)) note(fichier, E, 'progression', 'score jamais enregistré (enregistrerProgression absent)');
  if (/href=["']\.\.\/(6-9ans|9-12ans|12-15ans)\.html/.test(html)) note(fichier, R, 'navigation', 'retour vers une page cycle au lieu de la page de classe');
  if (/\/\/[^\n]*on ne m[ée]lange pas/i.test(scripts)) note(fichier, E, 'exercices', 'pool volontairement non mélangé');
  // Entités HTML dans des chaînes JS affectées par textContent
  const tc = [...scripts.matchAll(/textContent\s*=\s*(['"])((?:\\.|(?!\1).)*)\1/g)].filter(m => /&(#x?[0-9a-f]+|[a-z]+);/i.test(m[2]));
  tc.forEach(m => note(fichier, E, 'entité affichée en clair', `textContent = « ${m[2].slice(0, 60)} »`));
  const niveau = (path.basename(fichier).match(/_(CP|CE1|CE2|CM1|CM2|6e|5e|4e|3e)(_|\.html)/) || [])[1];
  controleTitreMeta(fichier, html, niveau);
  // Langue : texte visible + chaînes JS
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  controleLangue(fichier, visible, 'page');
  const chaines = [...scripts.matchAll(/(['"])((?:\\.|(?!\1)[^\n])*?)\1/g)].map(m => m[2]).filter(s => / /.test(s));
  chaines.forEach(s => controleLangue(fichier, s.replace(/\\'/g, "'"), 'script'));
}

/* ═══════════════════════════════════════════════════════════════════
   4. CATALOGUE (fiches.json, passage-secret.json) ET SALLE D'ARCADE
   ═══════════════════════════════════════════════════════════════════ */
function controleCatalogue() {
  const f = 'fiches.json';
  let J;
  try { J = JSON.parse(lire(f)); } catch (e) { return note(f, E, 'JSON', 'fichier illisible : ' + e.message); }
  const codes = {}, fichiersRef = new Set();
  Object.keys(J).forEach(cyc => (J[cyc] || []).forEach(x => {
    const id = x.code || x.id;
    if (codes[id]) note(f, R, 'catalogue', `code ${id} présent deux fois`);
    codes[id] = x;
    if (x.fichier) fichiersRef.add(x.fichier);
    if (x.niveau && rang(niveauPrincipal(x.niveau)) < 0) note(f, E, 'catalogue', `${id} : niveau « ${x.niveau} » inconnu (n'apparaît sur aucune page de classe)`);
    if (x.disponible) {
      if (!x.fichier) note(f, E, 'catalogue', `${id} : disponible sans nom de fichier`);
      else if (!existe(x.fichier)) note(f, E, 'catalogue', `${id} : ${x.fichier} introuvable (lien mort, casse comprise)`);
      else {
        const c = (path.basename(x.fichier).match(/^fiche_([A-Z0-9]+)_/i) || [])[1];
        if (c && c !== x.code) note(f, E, 'catalogue', `${id} : le fichier porte le code ${c}`);
      }
    }
    if (x.fichier && /fiches-perso\//.test(x.fichier)) note(f, E, 'passage secret', `${id} : leçon personnelle inscrite dans le catalogue public`);
  }));
  if (!opt.fichiers.length && fs.existsSync(path.join(RACINE, 'fiches'))) fs.readdirSync(path.join(RACINE, 'fiches')).filter(n => n.endsWith('.html')).forEach(n => {
    if (!fichiersRef.has('fiches/' + n)) note(f, R, 'catalogue', `fiches/${n} n'est référencée nulle part (fiche invisible sur le site)`);
  });
  if (existe('passage-secret.json')) {
    try {
      const P = JSON.parse(lire('passage-secret.json'));
      const liste = Array.isArray(P) ? P : (P.fiches || Object.values(P).flat());
      liste.forEach(x => { if (x && x.fichier && !existe(x.fichier)) note('passage-secret.json', E, 'passage secret', `${x.code} : ${x.fichier} introuvable`); });
    } catch (e) { note('passage-secret.json', E, 'JSON', 'illisible : ' + e.message); }
  }
  return codes;
}

function controleArcade(codes, seulement) {
  const dossier = path.join(RACINE, 'arcade');
  if (!fs.existsSync(dossier)) return;
  const ctx = { window: {}, console, Math, Object, Array, String, Number, JSON, setTimeout() {}, document: { addEventListener() {} } };
  ctx.window = ctx; vm.createContext(ctx);
  for (const n of ['outils.js', 'fr-cycle2.js', 'fr-cycle3.js', 'fr-cycle4.js', 'maths.js']) {
    if (!fs.existsSync(path.join(dossier, n))) continue;
    try { vm.runInContext(fs.readFileSync(path.join(dossier, n), 'utf8'), ctx, { filename: n, timeout: 5000 }); }
    catch (e) { note('arcade/' + n, E, 'syntaxe JS', e.message); return; }
  }
  const ARC = ctx.ARC; if (!ARC || !ARC.NOTIONS) return note('arcade/outils.js', E, 'arcade', 'ARC.NOTIONS introuvable');
  const GLO = ARC.GLO || {};
  const vues = new Set();
  ARC.NOTIONS.forEach(no => {
    if (seulement && !seulement.has(no.code)) return;
    const f = 'arcade/' + (no.matiere === 'maths' || no.matiere === 'math' ? 'maths.js' : 'fr (' + no.code + ')');
    vues.add(no.code);
    const cles = new Set(); let pb = 0;
    for (let k = 0; k < 300 && pb < 3; k++) {
      let q; try { q = no.gen({}); } catch (e) { note(f, E, 'arcade', `${no.code} : le générateur plante (${e.message})`); break; }
      if (!q) { note(f, E, 'arcade', `${no.code} : question vide`); break; }
      cles.add(q.key);
      const txt = JSON.stringify(q);
      if (/undefined|NaN/.test(txt)) { pb++; note(f, E, 'arcade', `${no.code} : undefined/NaN dans « ${sansBalises(q.q).slice(0, 60)} »`); }
      if (q.t === 'choice') {
        if (!q.o || q.o.map(String).indexOf(String(q.a)) < 0) { pb++; note(f, E, 'arcade', `${no.code} : bonne réponse absente des options`); }
        if (q.o && new Set(q.o.map(String)).size !== q.o.length) { pb++; note(f, E, 'arcade', `${no.code} : option en double (« ${sansBalises(q.q).slice(0, 50)} »)`); }
      }
      if (/\[\[/.test(q.q || '')) note(f, R, 'arcade', `${no.code} : bulle [[…]] dans l'énoncé (retirée à l'affichage, mais interdite par la règle)`);
      [...String(q.e || '').matchAll(/\[\[([^|\]]+)/g)].forEach(m => { if (!GLO[m[1]]) { pb++; note(f, E, 'arcade', `${no.code} : bulle « ${m[1]} » absente de ARC.GLO`); } });
      if (k < 40) { controleLangue(f, q.q || '', no.code + ' énoncé'); controleLangue(f, q.e || '', no.code + ' explication'); }
      if (!q.e) { pb++; note(f, R, 'arcade', `${no.code} : question sans explication`); }
    }
    if (cles.size < 4) note(f, R, 'arcade', `${no.code} : seulement ${cles.size} question(s) différente(s) (4 minimum)`);
    if (codes && !codes[no.code]) note(f, R, 'arcade', `${no.code} : aucune fiche de ce code dans fiches.json`);
  });
  // Chaque fiche de français ou de maths en ligne doit avoir sa notion
  if (codes && !seulement) Object.values(codes).forEach(x => {
    if (!x.disponible) return;
    if (!/^(Français|Mathématiques)$/.test(x.matiere)) return;
    if (/^D[MC]\d/.test(x.code)) return;              // dictées : arcade/dictees.js
    if (!vues.has(x.code)) note('arcade', R, 'arcade', `${x.code} (${x.niveau}) : fiche en ligne sans questions dans la salle d'arcade`);
  });
  // Dédoublonne les messages répétés (un même défaut trouvé 300 fois)
}

/* ═══════════════════════════════════════════════════════════════════
   5. LANCEMENT
   ═══════════════════════════════════════════════════════════════════ */
function lister() {
  if (opt.fichiers.length) return opt.fichiers.map(f => path.relative(RACINE, path.resolve(f)));
  const out = [];
  ['fiches', 'fiches-perso'].forEach(d => {
    const p = path.join(RACINE, d);
    if (fs.existsSync(p)) fs.readdirSync(p).filter(n => /\.html$/.test(n)).sort().forEach(n => out.push(d + '/' + n));
  });
  return out;
}

const cibles = lister();
cibles.filter(f => /\.html$/.test(f)).forEach(fichier => {
  if (!existe(fichier)) return note(fichier, E, 'fichier', 'introuvable');
  const html = lire(fichier);
  const r = extraireFiche(html, fichier);
  if (r === false) return;
  if (r && r.F) controleFicheMoteur(fichier, html, r.F, r.source);
  else controleFicheAncienne(fichier, html);
});
controleMoteur();
const codes = controleCatalogue();
if (!opt.fichiers.length || cibles.some(f => /^arcade\//.test(f))) controleArcade(codes, null);
else controleArcade(null, new Set(cibles.map(f => (path.basename(f).match(/^fiche_([A-Z0-9]+)_/i) || [])[1]).filter(Boolean)));

// Couleurs d'accent identiques dans un même cycle
Object.keys(ACCENTS_FICHES).forEach(c => {
  const vu = {};
  ACCENTS_FICHES[c].forEach(x => { (vu[x.c] = vu[x.c] || []).push(path.basename(x.f).split('_')[1]); });
  Object.keys(vu).forEach(col => { if (vu[col].length > 1) note('couleurs', R, 'couleur', `cycle ${c} : ${col} partagé par ${vu[col].join(', ')}`); });
});
// Meta-descriptions dupliquées
Object.keys(DESCRIPTIONS).forEach(d => { if (DESCRIPTIONS[d].length > 1) DESCRIPTIONS[d].forEach(f => note(f, R, 'référencement', 'meta-description identique à une autre fiche')); });

/* ─── Envoi partiel (GitHub, à chaque envoi) ───
   Un défaut des fichiers partagés (moteur, CSS, catalogue) qui ne font pas partie de l'envoi
   est signalé, mais ne fait pas échouer le contrôle : il existait avant cet envoi. */
if (opt.fichiers.length) {
  ['atelier-fiche.js', 'atelier-fiche.css', 'atelier-progression.js', 'fiches.json', 'passage-secret.json', 'couleurs'].forEach(f => {
    if (!rapport[f] || cibles.includes(f)) return;
    rapport[f].forEach(x => { if (x.niv === E) { x.niv = R; x.msg += ' (déjà présent, hors de cet envoi)'; } });
  });
}

/* ─── Exceptions validées par Romain (qa/exceptions.json) ───
   { "fiches/fiche_G07_articles_definis_CE1.html": ["Le arbre", "La oiseau"] }
   Tout message de cette fiche contenant l'un de ces textes est ignoré.
   Sert aux contre-exemples volontaires (« on ne dit pas le arbre »). */
let EXC = {}, nbIgnores = 0;
try { EXC = JSON.parse(fs.readFileSync(path.join(__dirname, 'exceptions.json'), 'utf8')); } catch (e) {}

/* ─── Dédoublonnage et sortie ─── */
let nbE = 0, nbR = 0;
Object.keys(rapport).forEach(f => {
  const vus = new Set(), ign = EXC[f] || [];
  rapport[f] = rapport[f].filter(x => { const k = x.niv + x.regle + x.msg; if (vus.has(k)) return false; vus.add(k); return true; })
    .filter(x => { if (ign.some(t => x.msg.includes(t))) { nbIgnores++; return false; } return true; });
  if (!rapport[f].length) { delete rapport[f]; return; }
  rapport[f].forEach(x => x.niv === E ? nbE++ : nbR++);
});

if (opt.json) { console.log(JSON.stringify({ erreurs: nbE, a_revoir: nbR, rapport }, null, 1)); }
else {
  const lignes = [];
  lignes.push(`# Contrôle des fiches — ${new Date().toISOString().slice(0, 10)}`, '');
  lignes.push(`${cibles.filter(f => /\.html$/.test(f)).length} fiches contrôlées · **${nbE} erreur(s)** · ${nbR} point(s) à revoir` + (nbIgnores ? ` · ${nbIgnores} exception(s) validée(s) ignorée(s)` : ''), '');
  const ordre = Object.keys(rapport).sort((a, b) => {
    const ea = rapport[a].some(x => x.niv === E), eb = rapport[b].some(x => x.niv === E);
    return ea === eb ? a.localeCompare(b) : ea ? -1 : 1;
  });
  ordre.forEach(f => {
    const l = rapport[f];
    const e = l.filter(x => x.niv === E).length;
    lignes.push(`## ${f} — ${e} erreur(s), ${l.length - e} à revoir`);
    l.sort((a, b) => (a.niv === E ? 0 : 1) - (b.niv === E ? 0 : 1)).forEach(x => lignes.push(`- ${x.niv === E ? '❌' : '⚠️'} ${x.regle} : ${x.msg}`));
    lignes.push('');
  });
  const txt = lignes.join('\n');
  if (opt.rapport) fs.writeFileSync(opt.rapport, txt);
  console.log(opt.rapport ? `${nbE} erreur(s), ${nbR} à revoir — rapport : ${opt.rapport}` : txt);
}
process.exit(nbE || (opt.strict && nbR) ? 1 : 0);
