# Leçons du passage secret

Les fiches de ce dossier sont **personnelles** : elles ne concernent qu'un enfant
de la famille et ne sont accessibles que depuis le compte autorisé, via
`passage-secret.html`.

Elles ne figurent **jamais** dans `fiches.json` — elles apparaîtraient sinon sur
les pages de classe publiques. Leur index est `passage-secret.json`, à la racine.

Codes réservés : `P` suivi de trois chiffres (P001, P002, …).

## Clavier intégré (obligatoire)

Chaque fiche de ce dossier charge `../atelier-clavier.js` juste avant `</body>` :

```html
<script src="../atelier-clavier.js"></script>
</body>
```

Sur téléphone et tablette, il remplace le clavier du système (qui propose la fin
des mots et donne donc la réponse) par un clavier maison : chiffres, lettres,
Maj, accents, ponctuation, effacer et Valider (= touche Entrée). Tous les champs
texte et zones de texte sont pris en charge, même créés après le chargement.
Sur ordinateur, rien ne change.
