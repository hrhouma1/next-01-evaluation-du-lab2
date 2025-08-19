# Déploiement sur Vercel – Guide étape par étape

Ce guide décrit exactement ce que nous allons faire en classe pour déployer le projet sur Vercel, avec Prisma + PostgreSQL (Neon). Chaque étape inclut les commandes à copier-coller.

---

## 0) Pré‑requis

- Un repository Git (GitHub recommandé) contenant ce projet
- Un compte Vercel: https://vercel.com
- Un compte Neon (PostgreSQL managé): https://neon.tech
- Node.js >= 18 installé en local

---

## 1) Préparer le projet pour la production

1. Vérifier les scripts `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

- Ajouter la clé `postinstall` si absente. Elle garantit que Prisma Client est généré pendant le build Vercel.

2. Valider Tailwind (déjà configuré): `app/layout.tsx` importe `./globals.css`, et `tailwind.config.js` contient `./app/**`, `./components/**`, `./pages/**` dans `content`.

3. Commit & push

```bash
git add -A
git commit -m "chore: ready for Vercel deploy"
git push
```

---

## 2) Configurer la base Neon (PostgreSQL)

1. Créer un projet Neon et récupérer l’URL de connexion (avec `sslmode=require`).
2. Préférer l’URL du **pooler** (connection pooling) pour l’usage serverless.
3. Placer cette URL dans votre `.env.local` en local, puis pousser le schéma Prisma vers Neon:

```bash
# .env.local (exemple)
DATABASE_URL="postgresql://user:pass@ep-xxxxxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Appliquer le schéma au serveur Neon
npx prisma generate
npx prisma db push
```

> Important: exécuter `prisma db push` en local (pas sur Vercel). Cela crée/actualise les tables dans Neon avant votre premier déploiement.

---

## 3) Créer le projet sur Vercel (UI)

1. Aller sur `https://vercel.com` > Login
2. `Add New...` > `Project`
3. Importer votre repo GitHub (celui du projet)
4. Paramètres du Framework: Vercel détecte `Next.js` automatiquement
5. Ajouter la variable d’environnement:
   - `DATABASE_URL` = votre URL Neon (même valeur que local)
6. Lancer `Deploy`

À la fin du build, Vercel fournit une URL de production.

---

## 4) Tester l’application en production

1. Ouvrir l’URL Vercel (ex: `https://votre-projet.vercel.app`)
2. Tester l’API:
   - `GET /api/products`
   - `POST /api/products` (via Postman)
   - `PUT /api/products/[id]`, `DELETE /api/products/[id]`
   - `GET /api/products/count`
3. Tester l’UI:
   - `/products`, `/products/new`, `/products/[id]`, `/products/[id]/edit`

---

## 5) (Option) Déploiement via Vercel CLI

Si vous préférez le CLI:

```bash
# Installer le CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le dossier au projet Vercel
vercel link

# Ajouter la variable env dans Vercel (saisir la valeur quand demandé)
vercel env add DATABASE_URL production

# Déployer
vercel --prod
```

---

## 6) Évolutions du schéma (après déploiement)

1. Modifier `prisma/schema.prisma` (ex: ajouter un champ)
2. Appliquer les changements dans Neon (depuis votre machine):

```bash
npx prisma generate
npx prisma db push
```

3. Commit & push > Vercel reconstruit automatiquement le projet

---

## 7) Dépannage

- Erreur: `Prisma Client not found`
  - Vérifier `"postinstall": "prisma generate"` dans `package.json`
  - Construire en local: `npm ci && npm run build` pour reproduire

- Erreur: `DATABASE_URL` manquant
  - Ajouter la variable dans Vercel > `Settings` > `Environment Variables`
  - Relancer un déploiement

- Erreur: trop de connexions PostgreSQL
  - Utiliser l’URL **pooler** Neon (connection pooling)

- Erreur: `ERR_INVALID_URL` sur `/products/[id]`
  - Le code de détail utilise `headers()` pour construire une URL absolue (ok sur Vercel). Assurez‑vous d’avoir déployé la dernière version.

- Tailwind ne s’applique pas
  - Vérifier `tailwind.config.js` (clé `content` correctement renseignée)
  - `app/globals.css` importé dans `app/layout.tsx`
  - Relancer un build

---

## 8) Checklist finale (production)

- [ ] `DATABASE_URL` renseignée dans Vercel
- [ ] Schéma Prisma appliqué à Neon (`prisma db push` lancé en local)
- [ ] `postinstall: prisma generate` présent
- [ ] APIs testées sur l’URL Vercel
- [ ] UI `/products` testée (créer / éditer / supprimer)

---

## 9) Annexes – commandes utiles

```bash
# Voir la base via Prisma Studio (en local, sur Neon)
npx prisma studio

# Logs Vercel (build, runtime)
vercel logs <url-ou-alias> --prod

# Re-déployer manuellement depuis le CLI
vercel --prod
```

Ce plan vous permet de mener un déploiement Vercel reproductible en classe, en expliquant précisément le rôle de chaque étape.
