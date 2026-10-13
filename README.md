# HelpDeskPro

Système de tickets support avec suivi des délais de résolution (SLA) : le personnel enregistre les demandes des clients, l'admin les répartit entre les agents, les agents les traitent, et chacun voit d'un coup d'œil ce qui est en retard.

Application PERN : **PostgreSQL · Express · React (Vite) · Node.js**, en TypeScript de bout en bout.

## Fonctionnalités

- **Connexion** par e-mail et mot de passe ; session de 8 heures dans un cookie `httpOnly`.
- **Tableau de bord** : total des tickets, ouverts, en cours, en retard (SLA), top 5 des agents, tickets récents.
- **Liste des tickets** : filtres par statut, priorité et agent assigné, recherche dans le titre ou la description, pagination. Les filtres sont dans l'URL (lien partageable, bouton retour).
- **Fiche d'un ticket** : description, commentaires, changement de statut, assignation, suivi SLA (échéance, état), modification et suppression.
- **Règles métier** : cycle de vie `open → in_progress → resolved → closed` avec réouverture, ticket fermé figé, permissions admin / agent, SLA calculé selon la priorité (haute 4 h, moyenne 24 h, basse 72 h).
- **Bonus** : documentation Swagger de l'API, pagination côté serveur.

## Documentation

| Document | Contenu |
|---|---|
| [docs/CONCEPTION.md](docs/CONCEPTION.md) | Modèle de données (ERD), clés primaires et étrangères, contraintes, index, règles métier, API et gestion des erreurs |
| [server/prisma/migrations/…/migration.sql](server/prisma/migrations/20261013214935_init/migration.sql) | Script SQL de création de la base (tables, enums, clés, contraintes CHECK, index dont trigram) |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Design system de l'interface : couleurs, typographie, composants, rédaction. Version visuelle : [DESIGN-SYSTEM.html](docs/DESIGN-SYSTEM.html), à ouvrir dans un navigateur |
| Swagger | http://localhost:3000/api/docs (JSON : `/api/docs.json`), une fois l'API lancée |

## Stack

| Partie | Technologies |
|---|---|
| Base de données | PostgreSQL (extension `pg_trgm` pour la recherche), Prisma 7 (schéma, migrations, seed) |
| API (`server/`) | Node.js, Express 5, TypeScript, Zod (validation), JWT + bcrypt, helmet, CORS, rate limiting, Swagger UI |
| Front (`client/`) | React 19, Vite, TypeScript, React Router, TanStack Query + axios, react-hook-form + Zod, Tailwind CSS v4, sonner |

## Prérequis

- Node.js 22 ou plus récent
- PostgreSQL 14 ou plus récent, avec un utilisateur autorisé à créer une base

## Installation et lancement

### 1. API

```bash
cd server
npm install
cp .env.example .env      # puis renseigner DATABASE_URL et JWT_SECRET
npm run db:generate       # génère le client Prisma
npm run db:migrate        # crée la base helpdeskpro et applique la migration
npm run db:seed           # 1 admin, 2 agents, 10 tickets, 20 commentaires
npm run dev               # API sur http://localhost:3000
```

### 2. Front

Dans un second terminal :

```bash
cd client
npm install
cp .env.example .env
npm run dev               # application sur http://localhost:5173
```

Le front doit tourner sur le port **5173** : c'est l'origine autorisée par l'API (`CLIENT_URL`, utilisée par CORS et par la protection CSRF).

## Comptes de test

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Admin | admin@helpdeskpro.ma | `Admin123!` |
| Agent | youssef@helpdeskpro.ma | `Agent123!` |
| Agent | sara@helpdeskpro.ma | `Agent123!` |

L'admin répartit les tickets (assignation) et peut tout faire ; un agent voit tous les tickets, modifie ceux qu'il a créés ou qui lui sont assignés, et change le statut de ses tickets assignés.

## Variables d'environnement

**`server/.env`**

| Variable | Exemple | Rôle |
|---|---|---|
| `NODE_ENV` | `development` | `production` active le cookie `Secure` |
| `PORT` | `3000` | Port de l'API |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/helpdeskpro` | Connexion PostgreSQL |
| `CLIENT_URL` | `http://localhost:5173` | Origine du front autorisée (CORS et contrôle d'origine) |
| `JWT_SECRET` | 32 caractères aléatoires minimum | Signature des jetons de session |

Les variables sont validées au démarrage : l'API refuse de démarrer si l'une d'elles manque ou est invalide.

**`client/.env`**

| Variable | Exemple | Rôle |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Adresse de l'API |

## Scripts

| Dossier | Commande | Effet |
|---|---|---|
| `server` | `npm run dev` | API en mode développement (rechargement automatique) |
| `server` | `npm run build` puis `npm start` | Compilation TypeScript puis lancement en production |
| `server` | `npm run typecheck` | Vérification des types |
| `server` | `npm run db:migrate` / `db:deploy` | Applique les migrations (développement / production) |
| `server` | `npm run db:seed` | Insère les données de test |
| `server` | `npm run db:reset` | Recrée la base à vide (supprime toutes les données) |
| `client` | `npm run dev` | Front en mode développement |
| `client` | `npm run build` | Vérification des types et build de production dans `client/dist` |

## Structure du dépôt

```
docs/                     Conception (ERD, contraintes, règles) et design system
server/
  prisma/                 Schéma, migration SQL, seed
  src/
    modules/              Une fonctionnalité par dossier : auth, users, dashboard, tickets, comments
                          (routes → controller → service, schémas Zod)
    middlewares/          Authentification, rôles, contrôle d'origine, erreurs
    docs/openapi.ts       Documentation Swagger (OpenAPI 3.1)
client/
  src/
    pages/                Connexion, tableau de bord, liste et fiche des tickets
    components/           Mise en page, panneaux du ticket, formulaire, dialogue, badges
    lib/                  Client API, hooks TanStack Query, schémas Zod, règles des tickets
```
