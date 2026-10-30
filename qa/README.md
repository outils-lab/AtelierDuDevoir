# Contrôles automatiques des fiches

Deux outils vérifient les fiches. GitHub les lance tout seuls à chaque envoi
(`.github/workflows/controle-fiches.yml`) ; le rapport s'affiche dans l'onglet
**Actions**, sur la page du passage, rubrique **Summary**.

| Outil | Ce qu'il fait | Lancer à la main |
| --- | --- | --- |
| `controle.js` | Applique toutes les règles écrites : langue, scores, émojis, clavier du téléphone, contrôle de lecture, catalogue, salle d'arcade, référencement | `node qa/controle.js` (tout le site) ou `node qa/controle.js fiches/fiche_O12_….html` |
| `robot.py` | Joue chaque fiche au format moteur dans un navigateur, en taille téléphone : partie parfaite, clavier du téléphone, réponses à moitié justes, taille des boutons | `pip install playwright && python -m playwright install chromium`, puis `python3 qa/robot.py` |

**À chaque envoi**, seuls les fichiers envoyés sont contrôlés. Une erreur dans
ces fichiers rend la coche rouge et GitHub envoie un e-mail. Un défaut déjà
présent dans le moteur ou le catalogue, hors de l'envoi, est seulement signalé.

**Chaque lundi**, le rapport complet du site est produit pour information.

**Contre-exemples volontaires.** Une forme fautive écrite exprès dans une fiche
(« on ne dit pas le arbre ») s'ajoute dans `exceptions.json` :

```json
{ "fiches/fiche_G07_articles_definis_CE1.html": ["« Le arbre »"] }
```

Tout message de cette fiche qui contient ce texte est alors ignoré.
