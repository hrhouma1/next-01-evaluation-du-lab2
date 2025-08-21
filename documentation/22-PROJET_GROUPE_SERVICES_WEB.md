# Projet de groupe - Création de services web avec documentation Swagger

## Objectif du projet

Chaque groupe doit concevoir, développer et documenter un service web REST complet de leur choix, puis le présenter publiquement à la classe.

## Organisation des groupes

### Formation des équipes
- 3 à 4 étudiants par groupe
- Répartition des rôles obligatoire :
  - **Chef de projet** : Coordination et présentation finale
  - **Développeur backend** : Création des endpoints REST
  - **Architecte API** : Documentation Swagger et schémas
  - **Testeur** : Validation et préparation des démos

### Timeline du projet
- **Choix du sujet** : 15 minutes
- **Développement** : 2 heures
- **Préparation présentation** : 15 minutes
- **Présentations** : 5 minutes par groupe + 2 minutes questions

## Sujets de services web suggérés

### Option 1 : Gestion d'utilisateurs
**Entité :** User (id, email, firstName, lastName, role, createdAt)
**Endpoints à créer :**
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/[id]` - Détail d'un utilisateur
- `PUT /api/users/[id]` - Modifier un utilisateur
- `DELETE /api/users/[id]` - Supprimer un utilisateur
- `GET /api/users/search` - Rechercher par email ou nom

### Option 2 : Système de tâches
**Entité :** Task (id, title, description, status, priority, dueDate, createdAt)
**Endpoints à créer :**
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/[id]` - Modifier une tâche
- `PATCH /api/tasks/[id]/status` - Changer le statut
- `GET /api/tasks/by-priority` - Tâches par priorité
- `GET /api/tasks/overdue` - Tâches en retard

### Option 3 : Gestion d'événements
**Entité :** Event (id, title, description, date, location, maxParticipants, createdAt)
**Endpoints à créer :**
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `GET /api/events/upcoming` - Événements à venir
- `GET /api/events/by-date` - Événements par période
- `PUT /api/events/[id]` - Modifier un événement
- `DELETE /api/events/[id]` - Supprimer un événement

### Option 4 : Système de commandes
**Entité :** Order (id, customerName, items, totalAmount, status, orderDate)
**Endpoints à créer :**
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/[id]` - Détail d'une commande
- `PATCH /api/orders/[id]/status` - Changer le statut
- `GET /api/orders/by-status` - Commandes par statut
- `GET /api/orders/statistics` - Statistiques des ventes

### Option 5 : Gestion de bibliothèque
**Entité :** Book (id, title, author, isbn, genre, available, publishedDate)
**Endpoints à créer :**
- `GET /api/books` - Liste des livres
- `POST /api/books` - Ajouter un livre
- `GET /api/books/search` - Rechercher par titre/auteur
- `GET /api/books/available` - Livres disponibles
- `PATCH /api/books/[id]/borrow` - Emprunter un livre
- `PATCH /api/books/[id]/return` - Retourner un livre

### Option libre
Les groupes peuvent proposer leur propre sujet avec validation du formateur.

## Structure de projet à respecter

### 1. Modèle de données (Prisma)
Fichier : `prisma/schema.prisma`
- Ajouter votre modèle après le modèle Product existant
- Respecter les conventions de nommage
- Ajouter les index si nécessaire

Exemple pour User :
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  firstName String
  lastName  String
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### 2. Structure des fichiers API
```
app/api/[votre-entite]/
├── route.ts (GET, POST)
├── [id]/
│   └── route.ts (GET, PUT, DELETE)
├── search/
│   └── route.ts (GET avec paramètres)
└── [autres-endpoints]/
    └── route.ts
```

### 3. Configuration Swagger
Modifier `lib/swagger.ts` pour ajouter vos schémas :
```typescript
VotreEntite: {
  type: 'object',
  required: ['champs obligatoires'],
  properties: {
    // Définir tous les champs avec types et exemples
  }
},
VotreEntiteInput: {
  type: 'object',
  required: ['champs pour création'],
  properties: {
    // Champs pour création/modification
  }
}
```

## Important : Gestion de la base de données

### Modifications du schema Prisma
Chaque groupe va ajouter son modèle dans `prisma/schema.prisma`. 

**Attention :** Tous les groupes travaillent sur le même projet, donc :
- **Ne supprimez jamais** le modèle Product existant
- **Ajoutez seulement** votre nouveau modèle à la fin du fichier
- **Coordonnez-vous** avec les autres groupes si vous modifiez le fichier en même temps

### Étapes obligatoires après modification du schema
```bash
# Toujours dans cet ordre après avoir modifié schema.prisma
1. npx prisma generate    # Génère le client TypeScript
2. npx prisma db push     # Applique les changements à la base de données  
3. npm run dev           # Redémarre le serveur
```

### Vérification de la base de données
Utilisez `npx prisma studio` pour :
- Voir votre nouvelle table créée
- Vérifier la structure des données
- Tester l'insertion de données manuellement

## Spécifications techniques

### Validation des données
Chaque endpoint doit inclure :
- Validation des paramètres d'entrée
- Messages d'erreur explicites en français
- Codes de statut HTTP appropriés
- Gestion des cas d'erreur

### Format de réponse standardisé
Toutes les réponses doivent suivre le format :
```json
{
  "success": true/false,
  "data": /* données ou null */,
  "message": "Message descriptif"
}
```

Pour les erreurs :
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

### Documentation Swagger obligatoire
Chaque endpoint doit être documenté avec :
- Summary et description en français
- Tags pour l'organisation
- Paramètres d'entrée documentés
- Schémas de réponse avec références
- Exemples concrets et réalistes
- Codes d'erreur documentés

Format JSDoc requis :
```typescript
/**
 * @swagger
 * /api/votre-endpoint:
 *   methode:
 *     summary: Description courte
 *     description: Description détaillée
 *     tags:
 *       - Nom du tag
 *     parameters: # Si nécessaire
 *     requestBody: # Pour POST/PUT
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               # Structure de réponse
 *             examples:
 *               # Exemples concrets
 */
```

## Critères d'évaluation

### Code fonctionnel (40 points)
- Endpoints accessibles et fonctionnels (10 points)
- Validation des données correcte (10 points)
- Gestion d'erreurs appropriée (10 points)
- Respect des conventions REST (10 points)

### Documentation Swagger (35 points)
- Schémas bien définis (10 points)
- Documentation JSDoc complète (15 points)
- Exemples réalistes et variés (10 points)

### Présentation (25 points)
- Clarté de l'explication (10 points)
- Démonstration fonctionnelle (10 points)
- Réponses aux questions (5 points)

### Points bonus (5 points)
- Originalité du concept
- Fonctionnalités avancées
- Tests exceptionnels dans Swagger

## Format de présentation

### Durée : 5 minutes par groupe

### Structure obligatoire :
1. **Présentation du concept** (1 minute)
   - Quel service web avez-vous créé ?
   - Quelle est l'utilité de ce service ?
   - Quels sont les endpoints principaux ?

2. **Démonstration technique** (3 minutes)
   - Montrer l'interface Swagger (`/api-docs`)
   - Tester 2-3 endpoints en direct avec "Try it out"
   - Expliquer la structure des données
   - Montrer les exemples et schémas

3. **Questions et discussion** (1 minute)
   - Répondre aux questions de la classe
   - Expliquer les choix techniques

### Support de présentation
- Utiliser exclusivement l'interface Swagger UI
- Pas de PowerPoint ou autres supports
- Démonstration en direct obligatoire

## Instructions de développement

### Étape 1 : Planification (15 minutes)
1. Choisir le sujet et valider avec le formateur
2. Répartir les rôles dans l'équipe
3. Définir la liste des endpoints à créer
4. Dessiner rapidement la structure des données

### Étape 2 : Mise en place (20 minutes)
1. **Développeur backend** : 
   - Modifier `prisma/schema.prisma` (ajouter votre modèle)
   - Exécuter `npx prisma generate` (génère le client)
   - Exécuter `npx prisma db push` (applique à la base de données)
2. **Architecte API** : Préparer les schémas dans `lib/swagger.ts`
3. **Chef de projet** : Créer la structure de dossiers
4. **Testeur** : Vérifier la base de données avec `npx prisma studio`

### Étape 3 : Développement (80 minutes)
1. Créer les endpoints un par un
2. Ajouter la documentation Swagger au fur et à mesure
3. Tester chaque endpoint dans `/api-docs`
4. Valider les schémas et exemples

### Étape 4 : Finalisation (20 minutes)
1. Tests complets de tous les endpoints
2. Vérification de la documentation
3. Préparation de la démonstration
4. Répartition des rôles pour la présentation

### Étape 5 : Présentation (5 minutes par groupe)

## Ressources et aide

### Documentation de référence
- Exemples dans `app/api/products/` pour la structure
- Schémas dans `lib/swagger.ts` pour les formats
- Document 21 pour les patterns de code
- Interface `/api-docs` pour les tests

### Support technique
- Lever la main pour les questions bloquantes
- Consulter les autres groupes pour l'entraide
- Redémarrer le serveur après chaque modification majeure

### Commandes utiles
```bash
# Après modification du schema Prisma (OBLIGATOIRE dans cet ordre)
npx prisma generate          # Génère le client Prisma
npx prisma db push           # Applique les modifications à la base de données

# Redémarrer le serveur après les modifications Prisma
npm run dev

# Vérifier les erreurs de build
npm run build

# Si problème avec la base de données
npx prisma studio            # Interface visuelle de la base de données
```

## Ordre de passage des présentations

Les groupes passeront dans l'ordre de fin de développement. Le premier groupe prêt passe en premier.

## Livrables finaux

A la fin du projet, chaque groupe doit avoir :
1. Code source complet et fonctionnel
2. Documentation Swagger accessible via `/api-docs`
3. Tests réussis pour tous les endpoints
4. Présentation effectuée devant la classe

Cette approche permet à chaque groupe de créer quelque chose d'unique tout en appliquant les mêmes compétences techniques et de documentation.
