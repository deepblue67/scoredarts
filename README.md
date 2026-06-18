# ScoreDarts

Application web/PWA de comptage de points pour flechettes.

Version actuelle : `V20260618 13H05`

Cette application permet de jouer principalement aux modes :

- `301`
- `501`
- `Cricket`
- `Autour du monde`

Le mode `301` est devenu le mode prioritaire de l'application : l'interface a ete retravaillee pour mettre en avant le score restant, le checkout conseille, le surlignage de la cible et un affichage adapte PC/iPhone/iPad.

## Objectif De Ce README

Ce fichier sert de memo technique et fonctionnel.

Il doit permettre :

- de comprendre comment l'application fonctionne
- de savoir a quoi sert chaque fichier
- de savoir quels fichiers pousser sur GitHub
- de reprendre plus facilement le projet plus tard
- de permettre a Codex de retrouver rapidement le contexte lors d'une future session de maintenance

## Etat General De La Refonte

L'application etait initialement concentree dans peu de fichiers. Elle a ete refactorisee en plusieurs modules plus lisibles :

- logique applicative generale
- logique de scoring
- stockage local
- composants UI
- modes de jeu separes
- service worker/PWA
- tests de regression

Les objectifs prioritaires qui ont ete traites :

- rendre l'application plus stable
- rendre le code plus maintenable
- separer les responsabilites
- supprimer Babel au runtime
- rendre React local au projet
- ameliorer le mode `301`
- ajouter une selection de 10 themes dans les reglages
- renforcer la lisibilite des themes : bordures, textes secondaires et surfaces
- ajouter une cible agrandie plein ecran pour faciliter la saisie sur mobile
- verifier les 5 layouts principaux : PC, iPhone portrait, iPhone paysage, iPad portrait, iPad paysage

## Structure Du Projet

```text
ScoreDarts/
  index.html
  app.js
  ui.js
  scoring.js
  storage.js
  game01.js
  game-cricket.js
  game-around.js
  sw.js
  manifest.json
  README.md

  assets/
    apple-touch-icon.png
    icon.svg

  vendor/
    react.production.min.js
    react-dom.production.min.js

  tests/
    scoring-regression.js
    storage-regression.js
    scoring-regression.html
    ui-regression.html
```

## Fichiers Principaux

### `index.html`

Role :

- point d'entree HTML
- charge les scripts dans le bon ordre
- contient les styles globaux et les media queries
- enregistre le service worker
- affiche une erreur visible si un script echoue au chargement

Ordre de chargement important :

```html
<script src="./vendor/react.production.min.js"></script>
<script src="./vendor/react-dom.production.min.js"></script>
<script src="./storage.js"></script>
<script src="./scoring.js"></script>
<script src="./ui.js"></script>
<script src="./game01.js"></script>
<script src="./game-cricket.js"></script>
<script src="./game-around.js"></script>
<script src="./app.js" defer></script>
```

`app.js` est charge en `defer`, car il doit attendre que `<div id="root"></div>` existe avant de monter React.

### `app.js`

Role :

- contient la racine React `App`
- gere les ecrans principaux
- gere la navigation interne
- gere le theme visuel actif
- gere la reprise d'une partie sauvegardee
- declare la version courante de l'application
- declare les constantes globales partagees

Version actuelle :

```js
var APP_VERSION = "V20260618 13H05";
```

Ecrans geres :

- accueil
- reprise de partie
- configuration des joueurs/equipes
- partie
- statistiques
- reglages

Modes lances depuis `App` :

- `Game301` pour `301` et `501`
- `GameCricket` pour Cricket
- `GameAround` pour Autour du monde

Themes :

- les themes sont declares dans `THEMES` dans `app.js`
- `makeTheme(themeId)` renvoie la palette active
- `normalizeThemeId(value)` garde la compatibilite avec les anciennes valeurs `true`/`false`
- la page d'accueil ne propose plus de bouton clair/sombre
- le choix de theme se fait dans `SettingsScreen`
- les themes actuels sont : Classique nuit, Classique clair, Graphite, Ocean, Foret, Cerise, Royal, Solaire, Neon, Vintage
- les palettes doivent garder un contraste suffisant entre `bg`, `surface`, `card`, `inputBg`, `border`, `text` et `muted`
- `muted` reste utilise pour les textes secondaires, mais il doit rester lisible sur mobile

### `game01.js`

Role :

- contient toute la logique UI et gameplay des modes `301` et `501`
- utilise la logique pure de score depuis `scoring.js`
- sauvegarde automatiquement la partie en cours
- gere les tours, les lancers, le bust, la victoire et l'historique

Ameliorations specifiques au mode `301` :

- score restant beaucoup plus visible
- checkout conseille sous 170
- premier objectif de checkout mis en avant
- surlignage de la zone recommandee sur la cible, par exemple `D20`
- alerte pour les restes dangereux en double out, notamment le reste a `1`
- historique court des derniers tours dans les layouts paysage/PC
- tableau de bord en paysage

Fonctions importantes :

- `buildInit()`
- `isValidFinish(th)`
- `checkoutTargets(plan)`
- `checkoutState()`
- `commitTurn(th, isWin)`
- `handleScore(td)`
- `handleBustDone()`
- `resetGame()`

Regles gerees :

- mode simple
- mode double out

### `game-cricket.js`

Role :

- contient toute la logique UI et gameplay du Cricket
- gere la fermeture des secteurs
- gere les points en surplus quand l'adversaire n'a pas ferme le secteur
- detecte le gagnant
- sauvegarde la partie en cours

Secteurs Cricket :

```js
[20, 19, 18, 17, 16, 15, 25]
```

Dans l'UI, `25` est affiche comme `Bull`.

### `game-around.js`

Role :

- contient toute la logique UI et gameplay du mode `Autour du monde`
- gere la progression des joueurs dans une sequence de cibles
- gere le sens de jeu montant ou descendant
- gere la variante `Doubles seuls`
- gere la bulle finale optionnelle
- sauvegarde automatiquement la partie en cours

Parametres disponibles :

- sens du jeu : `1 vers 20` ou `20 vers 1`
- segments acceptes : `Tout segment` ou `Doubles seuls`
- bulle finale : `Sans bulle`, `Bull rouge`, `Toute bulle`

Exemples de sequences :

```text
1, 2, 3, ... 20, Bull
20, 19, 18, ... 1, Bull
1, 2, 3, ... 20
```

Le mode utilise aussi le surlignage de cible via `highlightTargets`.

### `ui.js`

Role :

- contient les composants React reutilisables
- ne contient pas la logique metier principale
- fournit les composants utilises par `app.js`, `game01.js` et `game-cricket.js`

Composants principaux exportes dans `DartsUI` :

- `DartBoard`
- `ThrowDots`
- `BustOverlay`
- `ActionButtons`
- `QuitModal`
- `ConfirmModal`
- `HistoryDrawer`
- `GameLayout`
- `ResumeScreen`
- `WinScreen`
- `SettingsScreen`
- `StatsScreen`
- `HomeScreen`
- `SetupScreen`
- `ScorePanel`
- `CricketPanel`

`DartBoard` accepte maintenant deux types de surlignage :

- `highlightSectors` : surligne des secteurs entiers, utilise notamment par Cricket
- `highlightTargets` : surligne une zone precise, utilise par le 301 pour des cibles comme `D20`, `T20`, `Bull`

Exemples de `highlightTargets` :

```js
["d20"]
["t20", "d10"]
["bull"]
```

`GameLayout` ajoute aussi une action de confort autour de `DartBoard` :

- une icone loupe `+` permet d'ouvrir la cible en plein ecran
- une icone loupe `-` permet de revenir a l'affichage normal
- la saisie reste strictement identique : meme `DartBoard`, memes callbacks, memes regles de score
- cette option est disponible dans les modes `301`, `501`, `Cricket` et `Autour du monde`

### `scoring.js`

Role :

- contient la logique pure de calcul des scores
- ne depend pas de React
- peut etre teste independamment

Objet global expose :

```js
DartsScoring
```

Responsabilites :

- appliquer un tour de `301/501`
- calculer les statistiques d'un tour
- calculer les statistiques d'un bust
- construire une entree d'historique pour une partie `01`
- appliquer un tour de Cricket
- calculer les scores Cricket
- detecter le vainqueur Cricket

Le fait d'avoir cette logique separee rend les tests plus simples et evite de melanger calcul metier et UI.

### `storage.js`

Role :

- centralise l'acces au `localStorage`
- gere les cles de stockage
- encapsule la sauvegarde de partie avec un schema versionne
- reste compatible avec les anciennes sauvegardes lisibles

Objet global expose :

```js
DartsStorage
```

Cles utilisees :

```js
SAVE: "darts_game"
HISTORY: "darts_history"
TEAMS: "darts_teams"
THEME: "darts_theme"
```

`THEME` stocke l'identifiant du theme actif, par exemple :

```js
"classic-dark"
"ocean"
"neon"
```

Les anciennes valeurs booleennes `true` et `false` restent interpretees pour compatibilite : `true` renvoie vers `classic-dark`, `false` vers `classic-light`.

La sauvegarde de partie est enveloppee avec :

```js
{
  __type: "darts-save",
  schemaVersion: 1,
  savedAt: "...",
  data: ...
}
```

Les methodes disponibles :

```js
DartsStorage.get(key)
DartsStorage.set(key, value)
DartsStorage.remove(key)
```

### `sw.js`

Role :

- service worker de la PWA
- met en cache les fichiers de l'application
- permet un fonctionnement hors ligne apres un premier chargement
- supprime les anciens caches quand la version change
- accepte le message `SKIP_WAITING` pour activer une nouvelle version

Version actuelle :

```js
var APP_VERSION = "V20260618 13H05";
```

Important :

- `APP_VERSION` doit etre synchronisee avec celle de `app.js`
- changer cette version force un nouveau cache PWA

Fichiers precaches :

- `index.html`
- `manifest.json`
- icones dans `assets/`
- scripts applicatifs
- React local dans `vendor/`

### `manifest.json`

Role :

- manifeste PWA
- permet l'installation sur mobile
- definit le nom, le theme, le scope et les icones

Nom long :

```json
"name": "Darts Score"
```

Nom court :

```json
"short_name": "Darts"
```

Mode d'affichage :

```json
"display": "standalone"
```

### `assets/`

Contient les icones de l'application :

- `apple-touch-icon.png`
- `icon.svg`

Avant refonte, l'icone Apple etait integree en base64 dans `index.html`.
Elle a ete extraite pour alleger fortement `index.html`.

### `vendor/`

Contient React et ReactDOM en local :

- `react.production.min.js`
- `react-dom.production.min.js`

Babel a ete supprime du runtime.

Avant, l'application dependait de JSX compile dans le navigateur.
Maintenant, les fichiers principaux sont du JavaScript standard charge directement par le navigateur.

### `tests/`

Contient les tests de regression.

Fichiers :

- `scoring-regression.js`
- `storage-regression.js`
- `scoring-regression.html`
- `ui-regression.html`

Ces tests ne sont pas necessaires pour faire fonctionner l'application sur GitHub Pages, mais il est conseille de les conserver dans le repo pour la maintenance.

## Fonctionnement General De L'Application

### Demarrage

1. Le navigateur charge `index.html`.
2. React et ReactDOM sont charges depuis `vendor/`.
3. Les modules applicatifs sont charges :
   - `storage.js`
   - `scoring.js`
   - `ui.js`
   - `game01.js`
   - `game-cricket.js`
   - `game-around.js`
   - `app.js`
4. `app.js` monte React dans :

```html
<div id="root"></div>
```

5. L'application verifie s'il existe une sauvegarde dans `localStorage`.
6. Si une sauvegarde existe, l'ecran de reprise est affiche.
7. Sinon, l'ecran d'accueil est affiche.

### Navigation Interne

L'application n'utilise pas de routeur externe.

Elle gere ses ecrans via un etat React interne dans `App` :

- `home`
- `resume`
- `setup`
- `game`

### Creation D'Une Partie

Depuis l'accueil :

1. choix du mode : `301`, `501` ou `Cricket`
2. ecran de configuration
3. choix/edition des equipes
4. sauvegarde des equipes dans `localStorage`
5. lancement de la partie

### Sauvegarde Automatique

Pendant une partie, l'etat est sauvegarde automatiquement dans :

```text
localStorage["darts_game"]
```

Cela permet de reprendre une partie apres fermeture/rechargement.

Quand une partie est terminee, la sauvegarde courante est supprimee.

### Historique

Les parties terminees sont stockees dans :

```text
localStorage["darts_history"]
```

L'historique sert :

- a l'ecran statistiques
- au resume des parties gagnees
- a l'historique court affiche pendant le mode 301 en paysage/PC

## Mode 301/501

### Objectif

Chaque equipe commence a :

- `301` en mode 301
- `501` en mode 501

Chaque tour contient jusqu'a 3 flechettes.

Le score du tour est soustrait au score restant.

### Bust

Un bust se produit si :

- le joueur descend sous 0
- le joueur atteint 0 sans respecter la regle de fin en double out

Quand il y a bust :

- le tour vaut 0
- le score est restaure
- le tour passe au joueur suivant
- l'evenement est ajoute a l'historique

### Double Out

Si la regle `doubleout` est activee, le joueur doit finir :

- sur un double
- ou sur Bull, considere comme finish valide

### Checkout Intelligent

Une table de checkout existe dans `app.js` via la constante `CHECKOUT`.

Quand le score restant est inferieur ou egal a 170, l'application peut afficher une proposition.

Exemple :

```text
Reste 40 -> D20
```

Le premier objectif est affiche dans un bloc visible.

### Surlignage De La Cible

Quand un checkout est disponible, `game01.js` transforme la suggestion en cibles techniques :

```text
D20 -> d20
T20 -> t20
Bull -> bull
```

Ces cibles sont passees a `DartsUI.DartBoard` via :

```js
highlightTargets: aim.targets
```

La cible met alors en valeur la zone exacte a viser.

### Interface 301

Priorites visuelles :

1. joueur actif
2. score restant
3. 3 cases de lancers
4. checkout conseille
5. cible
6. actions rapides

En portrait iPhone, le bandeau general des scores est masque pour simplifier l'ecran.

La cible peut etre agrandie en plein ecran avec la loupe `+`. C'est uniquement une aide de saisie : les zones cliquees, les surlignages de checkout et les regles de score restent les memes. La loupe `-` ferme la cible agrandie.

En paysage/PC, l'interface devient un tableau de bord :

- colonne gauche : joueurs, score, joueur actif, checkout, historique court, actions
- droite : grande cible

## Mode Cricket

### Objectif

Fermer les secteurs :

```text
20, 19, 18, 17, 16, 15, Bull
```

Un secteur est ferme apres 3 marques :

- simple = 1 marque
- double = 2 marques
- triple = 3 marques

### Points

Si un joueur touche un secteur deja ferme par lui mais pas encore ferme par l'adversaire, il marque des points.

### Victoire

Un joueur gagne s'il a :

- ferme tous les secteurs
- un score au moins egal aux autres joueurs

## Mode Autour Du Monde

### Objectif

Le joueur doit faire le tour du plateau dans l'ordre choisi.

Ordres possibles :

- montant : `1 -> 20`
- descendant : `20 -> 1`

La bulle finale est configurable :

- `Sans bulle`
- `Bull rouge`
- `Toute bulle`

### Segments

Deux variantes sont disponibles :

- `Tout segment` : simple, double ou triple valident le numero
- `Doubles seuls` : seul le double du numero valide la progression

Pour la bulle :

- `Bull rouge` demande la bulle interieure
- `Toute bulle` accepte la bulle exterieure ou interieure

### Tour De Jeu

Chaque joueur lance 3 flechettes.

Si la cible courante est touchee, le joueur avance immediatement a la cible suivante.

Exemple :

```text
Cible courante : 1
Lancers : S1, T2, S3
Progression : le joueur avance jusqu'a 3
```

Si une flechette touche un autre numero que la cible attendue, elle ne fait pas avancer.

### Interface

L'ecran affiche :

- joueur actif
- cible courante
- progression
- variante active
- cible surlignee sur le plateau
- historique court en paysage/PC

## Responsive Design

L'application gere explicitement 5 contextes :

1. PC
2. iPhone portrait
3. iPhone paysage
4. iPad portrait
5. iPad paysage

Les regles sont dans `index.html`.

### PC

Media query :

```css
@media (min-width:1367px)
```

Comportement :

- layout horizontal
- colonne gauche large
- cible grande a droite
- historique court visible
- actions en bas de la colonne gauche

### iPhone Portrait

Media query :

```css
@media (max-width:767px) and (orientation:portrait)
```

Comportement :

- layout vertical
- score panel general masque
- priorite au joueur actif
- cible sous les actions
- ecran simplifie pour jouer vite

### iPhone Paysage

Media query :

```css
@media (max-height:430px) and (orientation:landscape)
```

Comportement :

- layout horizontal
- colonne gauche compacte
- cible a droite
- historique court visible
- actions visibles en bas
- composants compactes pour eviter le scroll inutile

### iPad Portrait

Media query :

```css
@media (min-width:768px) and (max-width:1024px) and (orientation:portrait)
```

Comportement :

- layout vertical
- cible agrandie
- score panel conserve

### iPad Paysage

Media query :

```css
@media (min-width:768px) and (max-width:1366px) and (min-height:431px) and (orientation:landscape)
```

Comportement :

- layout horizontal
- colonne gauche type tableau de bord
- cible grande a droite
- historique court visible
- actions en bas

## PWA Et Cache

L'application est une PWA.

Elements PWA :

- `manifest.json`
- `sw.js`
- icones dans `assets/`
- cache versionne par `APP_VERSION`

Le service worker :

- precache les fichiers principaux
- sert les fichiers depuis le cache si possible
- tente le reseau si le fichier n'est pas en cache
- fournit une page minimale hors ligne si rien n'est disponible

Quand une nouvelle version est disponible, l'application affiche un prompt :

```text
Nouvelle version disponible.
Mettre a jour
```

## Deploiement GitHub Pages

Pour publier l'application sur GitHub Pages, pousser tout le dossier.

Fichiers et dossiers necessaires au fonctionnement :

- `index.html`
- `app.js`
- `ui.js`
- `scoring.js`
- `storage.js`
- `game01.js`
- `game-cricket.js`
- `game-around.js`
- `sw.js`
- `manifest.json`
- `assets/`
- `vendor/`

Fichiers conseilles pour maintenance :

- `README.md`
- `tests/`

Donc la recommandation est simple :

```text
Pousser tout le contenu du dossier ScoreDarts.
```

## Tests

### Tests De Scoring

Commande :

```powershell
cscript //nologo .\tests\scoring-regression.js
```

Ce test verifie notamment :

- victoire en 01
- statistiques du tour gagnant
- historique du score
- Cricket : fermeture de secteur
- Cricket : points en surplus
- Cricket : detection du gagnant

### Tests De Stockage

Commande :

```powershell
cscript //nologo .\tests\storage-regression.js
```

Ce test verifie notamment :

- lecture des anciennes sauvegardes
- wrapping des nouvelles sauvegardes
- version de schema
- suppression d'une cle

### Tests UI

Commande utilisee pendant la refonte :

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu --no-first-run --disable-extensions --allow-file-access-from-files --user-data-dir='C:\Users\cdesmottes\AppData\Local\Temp\scoredarts-ui' --virtual-time-budget=3000 --dump-dom 'file:///C:/Users/cdesmottes/Documents/ScoreDarts/tests/ui-regression.html'
```

Le test doit afficher :

```text
All UI tests passed
```

### Tests Visuels Effectues Pendant La Refonte

Des smoke tests Playwright ont ete faits sur :

- 301 normal
- 301 avec reprise a 40 points et `D20` conseille/surligne
- Cricket
- Autour du monde
- Autour du monde sans bulle
- PWA via serveur HTTP local
- PC
- iPhone portrait
- iPhone paysage
- iPad portrait
- iPad paysage

Les captures temporaires ont ete supprimees apres verification.

## Points Importants Pour Une Future Maintenance

### Garder Les Versions Synchronisees

Quand une modification fonctionnelle est livree, mettre a jour :

- `APP_VERSION` dans `app.js`
- `APP_VERSION` dans `sw.js`

Exemple :

```js
var APP_VERSION = "V20260618 13H05";
```

Si la version du service worker ne change pas, GitHub Pages ou le navigateur peuvent continuer a servir une ancienne version depuis le cache.

### Ne Pas Reintroduire Babel Au Runtime

Les fichiers actuels sont du JavaScript standard.

Ne pas remettre :

```html
<script type="text/babel">
```

Le chargement `type="text/babel"` pose probleme en local avec `file://` et ajoute une dependance lourde.

### Attention Aux Globals

Le projet n'utilise pas de bundler.

Les modules communiquent via des variables globales :

- `DartsStorage`
- `DartsScoring`
- `DartsUI`
- `Game301`
- `GameCricket`
- `GameAround`
- `App`

L'ordre de chargement dans `index.html` est donc important.

### React Est Local

React et ReactDOM sont dans `vendor/`.

Cela evite de dependre d'un CDN et rend l'application plus fiable si elle est ouverte dans un contexte limite.

### Le Dossier `tests/` Est Utile

Il n'est pas necessaire pour l'utilisateur final, mais il faut le conserver dans GitHub.

Il permet de verifier rapidement qu'une modification ne casse pas :

- le scoring
- le stockage
- les composants UI principaux

## Historique Des Grandes Etapes De Refonte

### Audit Initial

Constats :

- trop de logique concentree dans peu de fichiers
- dependances CDN/runtime peu robustes
- stockage local non centralise
- service worker perfectible
- logique metier difficile a tester
- UI responsive a clarifier

### Refactorisation De Base

Actions :

- creation de `scoring.js`
- creation de `storage.js`
- creation de `ui.js`
- extraction de `game01.js`
- extraction de `game-cricket.js`
- extraction de `app.js`
- ajout de `game-around.js` pour le mode Autour du monde

### Stabilisation

Actions :

- ajout de tests de scoring
- ajout de tests de stockage
- ajout de tests UI
- suppression de Babel au runtime
- React local dans `vendor/`
- startup error handler dans `index.html`

### PWA

Actions :

- amelioration du service worker
- cache versionne
- prompt de mise a jour
- ajout de `manifest.json`
- extraction des icones dans `assets/`
- allegement fort de `index.html`

### Responsive

Actions :

- clarification des 5 contextes :
  - PC
  - iPhone portrait
  - iPhone paysage
  - iPad portrait
  - iPad paysage
- verification sans debordement horizontal
- cible visible dans chaque contexte

### Gameplay 301

Actions :

- gros score restant
- checkout intelligent
- surlignage de la zone de checkout
- tableau de bord paysage/PC
- historique court pendant la partie
- actions rapides en bas en paysage
- ecran portrait iPhone simplifie

## Idees Possibles Pour La Suite

Pistes futures :

- ameliorer les textes et accents si necessaire
- ajouter plus de tests Playwright automatises
- ajouter un mode entrainement checkout
- ajouter des statistiques pendant la partie :
  - moyenne par volee
  - meilleur tour
  - darts jouees
  - checkout rates/reussis
- ajouter des profils joueurs persistants
- ajouter un bouton d'export/import de donnees
- ajouter un mode plein ecran
- convertir un jour vers Vite/React moderne si le projet grossit beaucoup

## Reprise Rapide Pour Codex

Si ce projet est repris plus tard, commencer par lire :

1. `README.md`
2. `index.html`
3. `app.js`
4. `game01.js`
5. `ui.js`
6. `scoring.js`
7. `storage.js`

Avant de modifier :

1. verifier la version dans `app.js` et `sw.js`
2. identifier si la modification concerne :
   - UI commune -> `ui.js`
   - mode 301/501 -> `game01.js`
   - Cricket -> `game-cricket.js`
   - Autour du monde -> `game-around.js`
   - scoring pur -> `scoring.js`
   - stockage -> `storage.js`
   - responsive/PWA -> `index.html` ou `sw.js`
3. apres modification, lancer les tests :

```powershell
cscript //nologo .\tests\scoring-regression.js
cscript //nologo .\tests\storage-regression.js
```

Puis verifier visuellement au moins :

- iPhone portrait
- iPhone paysage
- iPad paysage
- PC

## Resume Court

ScoreDarts est maintenant une PWA React sans build, organisee en modules JavaScript simples.

Le mode 301 est le mode prioritaire :

- score restant central
- checkout conseille
- cible adaptee au checkout
- layout responsive en 5 formats
- tableau de bord en paysage/PC

Pour deployer :

```text
Pousser tout le dossier ScoreDarts sur GitHub.
```

