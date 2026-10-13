# HelpDeskPro — Design system « Registre »

Ce document décrit l'apparence et le ton de chaque écran. **Référence visuelle** : ouvrir [DESIGN-SYSTEM.html](DESIGN-SYSTEM.html) dans un navigateur pour voir les couleurs, la typographie, les composants et les six écrans de référence, remplis avec les données du seed. Le front applique ce document.

**L'idée** : le registre du support, version moderne. Un fond de cahier ligné avec sa marge rouge, les titres imprimés en police monospace, les statuts tamponnés comme sur papier, des angles nets et une seule ombre « encre » sur ce que l'on presse.

---

## 1. Couleurs

Thème clair uniquement.

| Jeton | Valeur | Usage |
|---|---|---|
| `paper` | `#F4F5F8` | Fond de page, sous les lignes du cahier |
| `card` | `#FDFDFE` | Tableaux, formulaires, panneaux, dialogues |
| `ink` | `#1A1B2E` | Texte, bordure des boutons, ombre encre |
| `pencil` | `#5C5F73` | Texte secondaire, statuts au repos |
| `line` | `#E1E3EA` | Séparateurs de lignes, bordure des cartes |
| `field` | `#8F92A6` | Bordure des champs au repos |
| `main` | `#6050DC`, survol `#4F40C4`, teinte `#EEEBFD` | Bouton principal, menu actif, onglet actif, page courante, focus |
| `main-text` | `#3F35B5` | Liens, petit texte dans la couleur principale, tampon « En cours » |
| `ruling` | `main` à 9 %, une ligne toutes les 24 px | Les lignes du cahier |
| `margin` | `#C63434` à 45 %, à 30 px du bord gauche | La marge rouge |
| `green` | `#13703F` | Terminé |
| `red` | `#B42318` | À traiter maintenant, danger |

### Une couleur = un sens

| Famille | Sens | Libellés |
|---|---|---|
| Gris encre | Pas commencé, ou archivé | Ouvert (tampon en pointillés : personne n'y travaille encore), Fermé, SLA dépassé |
| Couleur principale | En route | En cours |
| Vert | Terminé | Résolu, SLA respecté |
| Rouge | À traiter maintenant | En retard |

- Un SLA dépassé est gris, pas rouge : le ticket est terminé, aucune action n'est plus possible. Le rouge signale uniquement ce qui demande d'agir.
- La priorité n'a pas de couleur : trois barres de signal suivies du libellé (Basse, Moyenne, Haute). Un ticket en retard reste ainsi le seul élément rouge d'une liste.

## 2. Typographie

| Rôle | Police | Taille | Graisse |
|---|---|---|---|
| Titre de page | Martian Mono | 22 px | 600 |
| Titre de panneau latéral ou de dialogue | Martian Mono | 16 px | 600 |
| En-tête de tableau, libellé de panneau | Martian Mono, capitales, +0,06 em | 10,5 px | 600 |
| Texte | Public Sans | 14 px | 400 |
| Texte de tableau | Public Sans | 13 px | 400 |
| Libellé, bouton | Public Sans | 13 px | 600 |
| Petit texte, aide, date | Public Sans | 12 px | 400 |
| Tampon | Public Sans, capitales, +0,08 em | 10 px | 700 |
| Grand nombre | Public Sans | 24 px | 700 |

Les chiffres sont à chasse fixe (`tabular-nums`) dans les tableaux et les indicateurs.

**Typographie française** : espace fine insécable (U+202F) avant `? ! : ;` et à l'intérieur des « » ; dates au format `13/10/2026`, heures au format `16:30`, dans le fuseau du navigateur.

## 3. Formes et espacements

| Règle | Valeur |
|---|---|
| Densité | Champs de 36 px, lignes de tableau d'environ 37 px |
| Espacements | 4, 8, 12, 16, 24, 32 px, aucune valeur intermédiaire |
| Angles | 4 px partout, 3 px sur les tampons ; rien d'arrondi ni en forme de pilule |
| Traits | 1 px pour les lignes et les cartes ; 1,5 px pour les boutons, les champs et les tampons ; double trait sous les en-têtes de tableau |
| Profondeur | Aucune ombre floue. Ombre encre décalée de 2 px sur le bouton principal (il s'enfonce au clic), de 3 à 4 px sur le panneau latéral, les dialogues, les notifications et la carte de connexion |
| Focus | Contour de 2 px dans la couleur principale, plus un halo teinté de 3 px autour des champs |
| Lignes du cahier | Seulement sur le fond de page ; cartes, tableaux et formulaires sont posés dessus, en `card` |

## 4. Mise en page

- **Menu à gauche**, 220 px : Tableau de bord, Tickets. En bas, le nom, le rôle (Admin ou Agent) et « Se déconnecter ». Pas de barre en haut.
- **Chaque page commence de la même façon** : le contexte en petit, le titre, l'action principale à droite. L'action principale est le seul bouton violet de l'écran.
- **Quatre pages** : connexion, tableau de bord, liste des tickets, fiche d'un ticket. La fiche montre le contenu à gauche (description, commentaires) et le pilotage à droite (statut, assignation, suivi SLA).
- **La création et la modification d'un ticket** s'ouvrent dans un panneau latéral au-dessus de la page ; **les confirmations** s'ouvrent dans un petit dialogue.
- **Sur téléphone** : le menu passe au-dessus du contenu, les barres d'outils passent à la ligne, les tableaux défilent dans leur cadre.

## 5. Composants

Icônes : Phosphor, graisse regular.

| Composant | Règle |
|---|---|
| Boutons | Principal (violet, ombre encre), secondaire (contour encre), danger (contour rouge ; fond rouge seulement pour le clic final d'une confirmation). Un bouton désactivé dit pourquoi juste en dessous : « Assignez un agent pour changer le statut. » Un bouton en cours d'action dit ce qu'il fait : « Création en cours » |
| Champs | Libellé au-dessus ; aide ou erreur en dessous. Les messages d'erreur de l'API sont déjà en français et s'affichent tels quels |
| Tampons | Statut du ticket et retard SLA, colorés selon les familles du §1 |
| Priorité | Trois barres de signal et le libellé, sans couleur |
| Tableau des tickets | Le titre ouvre la fiche ; le filtre de statut est en onglets ; la recherche, la priorité et l'agent sont au-dessus ; la pagination est en bas, 8 tickets par page |
| Messages | Un succès apparaît en bas à droite pendant 5 secondes ; une erreur reste à côté du champ ou du bouton jusqu'à sa correction |
| États | Vide : une phrase et une action. Chargement : des blocs gris à la forme du contenu. Échec : « Cette page n'a pas pu s'afficher » et « Réessayer » |

## 6. Rédaction

- L'application vouvoie. Phrases courtes, jamais « Veuillez ». Un bouton dit un verbe et ce sur quoi il agit : « Créer le ticket ».
- Ni anglais ni termes techniques (API, serveur, jeton, codes d'erreur).
- **Forme des messages** : un succès dit ce qui s'est passé (« Ticket créé. ») ; une erreur dit ce qui ne va pas, puis quoi faire ; une confirmation pose une question, annonce la conséquence et propose deux boutons explicites (« Garder le ticket », « Oui, supprimer le ticket »).

**Un mot par action :**

| Mot | Usage | Jamais |
|---|---|---|
| Créer le ticket | Valider le panneau de création | Soumettre, Ajouter |
| Enregistrer | Valider la modification d'un ticket | Sauvegarder, Mettre à jour |
| Assigner | Confier le ticket à un agent (admin) | Attribuer, Affecter |
| Retirer l'agent | Désassigner ; un ticket en cours repasse « Ouvert » | Désassigner |
| Passer en cours | Ouvert → En cours | Démarrer, Prendre |
| Marquer résolu | Ouvert ou En cours → Résolu | Terminer, Clôturer |
| Rouvrir | Résolu → En cours | Réactiver |
| Fermer le ticket | Résolu → Fermé, définitif | Archiver, Clôturer |
| Annuler | Fermer un panneau ou un dialogue sans rien changer | Fermer (réservé au ticket) |
| Supprimer le ticket | Admin, ticket ouvert uniquement, après confirmation | Effacer |
| Ajouter le commentaire | Publier un commentaire | Envoyer, Poster |

**Libellés :**

| Objet | Libellés |
|---|---|
| Statut | Ouvert, En cours, Résolu, Fermé |
| SLA | Dans les délais, En retard, Respecté, Dépassé |
| Priorité | Basse, Moyenne, Haute |
| Rôle | Admin, Agent |
