# Cours théorique : Authentification, Autorisation et NextAuth.js - Fondements conceptuels

**Objectif de ce cours :** Comprendre les concepts fondamentaux de l'authentification et de l'autorisation dans le développement web moderne, et saisir pourquoi NextAuth.js a été créé pour résoudre des problèmes réels.

**Public cible :** Étudiants débutants en développement web
**Prérequis :** Notions de base du web (HTTP, cookies, sessions)
**Durée estimée :** 45-60 minutes de lecture

## Introduction : Pourquoi la sécurité web est-elle cruciale ?

Dans le monde numérique d'aujourd'hui, chaque application web doit répondre à deux questions fondamentales :
1. **Qui êtes-vous ?** (Authentification)
2. **Que pouvez-vous faire ?** (Autorisation)

Ces questions semblent simples, mais leur implémentation correcte est l'un des défis les plus complexes du développement web moderne.

**Analogie du monde physique :** Imaginez un immeuble de bureaux sécurisé. À l'entrée, le vigile vérifie votre identité avec votre carte d'identité (authentification). Une fois votre identité confirmée, il consulte la liste des autorisations pour savoir à quels étages vous pouvez accéder (autorisation).

## Chapitre 1 : L'authentification - "Qui êtes-vous ?"

### Définition et concepts fondamentaux

**L'authentification** est le processus par lequel un système vérifie l'identité d'un utilisateur. C'est la réponse à la question : "Êtes-vous vraiment qui vous prétendez être ?"

**Analogie :** C'est comme montrer votre passeport à la douane. Le douanier vérifie que la photo correspond à votre visage, que le document n'est pas falsifié, et que les informations sont cohérentes.

### Les trois piliers de l'authentification

L'authentification repose sur trois types de preuves, appelés "facteurs d'authentification" :

#### 1. Quelque chose que vous savez (Knowledge)
- **Mots de passe** : Le plus courant, mais aussi le plus vulnérable
- **Code PIN** : Variante numérique du mot de passe
- **Questions secrètes** : "Quel est le nom de votre premier animal de compagnie ?"

**Avantages :** Simple à implémenter, familier aux utilisateurs
**Inconvénients :** Peut être oublié, volé, deviné, ou cracké par force brute

#### 2. Quelque chose que vous possédez (Possession)
- **Téléphone mobile** : Codes SMS, applications d'authentification
- **Carte à puce** : Cartes bancaires, badges d'entreprise
- **Token matériel** : Clés USB sécurisées, générateurs de codes

**Avantages :** Plus difficile à voler qu'un mot de passe
**Inconvénients :** Peut être perdu, volé, ou ne pas fonctionner (batterie, réseau)

#### 3. Quelque chose que vous êtes (Inherence)
- **Empreintes digitales** : Uniques à chaque individu
- **Reconnaissance faciale** : Analyse des caractéristiques du visage
- **Reconnaissance vocale** : Analyse des patterns de la voix
- **Scan de l'iris** : Extrêmement précis mais coûteux

**Avantages :** Très difficile à falsifier ou voler
**Inconvénients :** Coûteux, peut changer (blessure), problèmes de vie privée

### L'évolution historique de l'authentification web

#### Ère 1 : Authentification basique (1990s)
```
Navigateur → Serveur : "Je veux accéder à /admin"
Serveur → Navigateur : "401 Unauthorized - Qui êtes-vous ?"
Navigateur → Utilisateur : [Popup] "Login/Password ?"
Utilisateur → Navigateur : "admin / password123"
Navigateur → Serveur : "Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM="
Serveur → Navigateur : "200 OK - Voici /admin"
```

**Problèmes :** 
- Mot de passe transmis en base64 (facilement décodable)
- Impossible de se déconnecter proprement
- Interface utilisateur primitive

#### Ère 2 : Sessions et cookies (2000s)
```
1. Utilisateur remplit formulaire login
2. Serveur vérifie identifiants
3. Serveur crée une session (ID unique)
4. Serveur renvoie cookie avec session ID
5. Navigateur envoie cookie automatiquement sur chaque requête
```

**Avantages :** Sécurisé, contrôle total, logout possible
**Inconvénients :** Difficile à scaler, sessions stockées serveur, CSRF

#### Ère 3 : Single Sign-On et OAuth (2010s)
```
Votre App → "Se connecter avec Google"
User → Redirection vers Google
Google → User : "Autorisez-vous MyApp ?"
User → Google : "Oui"
Google → Votre App : "Voici un code d'autorisation"
Votre App → Google : "Échange le code contre un token"
Google → Votre App : "Voici le token + infos utilisateur"
```

**Révolution :** Plus besoin de gérer les mots de passe utilisateur !

#### Ère 4 : JWT et authentification moderne (2020s)
```json
{
  "header": {"alg": "HS256", "typ": "JWT"},
  "payload": {
    "user_id": "12345",
    "email": "user@example.com",
    "exp": 1640995200,
    "iat": 1640908800
  },
  "signature": "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

**Avantages :** Stateless, scalable, standard industry
**Défis :** Sécurité complexe, gestion de l'expiration

## Chapitre 2 : L'autorisation - "Que pouvez-vous faire ?"

### Définition et différences clés

**L'autorisation** est le processus qui détermine ce qu'un utilisateur authentifié est autorisé à faire dans le système.

**Différence fondamentale :**
- **Authentification** : "Vous êtes Jean Dupont" ✓
- **Autorisation** : "Jean Dupont peut-il supprimer cette facture ?" 🤔

**Analogie approfondie :** Dans un hôpital :
- **Badge d'identification** = Authentification ("Je suis Dr. Martin")
- **Couleur/niveau du badge** = Autorisation ("En tant que chirurgien, j'ai accès au bloc opératoire mais pas à la pharmacie")

### Modèles d'autorisation classiques

#### 1. Contrôle d'accès discrétionnaire (DAC)
Le propriétaire de la ressource décide qui y a accès.

**Exemple concret :** 
- Jean crée un document → Jean est propriétaire
- Jean peut donner accès à Marie et Paul
- Marie et Paul ne peuvent pas donner accès à d'autres

**Analogie :** Votre maison - vous décidez qui peut entrer

#### 2. Contrôle d'accès obligatoire (MAC)
L'administrateur système définit les règles d'accès.

**Exemple concret :**
- Documents classifiés : "Secret", "Confidentiel", "Public"
- Utilisateurs ont des niveaux d'habilitation
- Règle : Niveau utilisateur ≥ Niveau document requis

**Analogie :** Sécurité militaire - les règles sont définies par la hiérarchie

#### 3. Contrôle d'accès basé sur les rôles (RBAC)
Les autorisations sont groupées en rôles.

```
Rôle "Éditeur" :
- Peut créer des articles
- Peut modifier ses articles
- Peut voir tous les articles

Rôle "Administrateur" :
- Toutes les permissions de "Éditeur"
- Peut supprimer n'importe quel article
- Peut gérer les utilisateurs
```

**Avantages :** Simple à gérer, scalable
**Inconvénients :** Peut devenir rigide

#### 4. Contrôle d'accès basé sur les attributs (ABAC)
Décisions basées sur des attributs multiples.

```javascript
Règle : "Un médecin peut voir un dossier patient SI :
- Le médecin est assigné au patient OU
- C'est une urgence ET le médecin est de garde OU
- Le médecin est chef de service"
```

**Avantages :** Très flexible, précis
**Inconvénients :** Complexe à implémenter et déboguer

### Implémentation technique de l'autorisation

#### Approche 1 : Vérification au niveau route
```javascript
app.get('/admin/users', requireRole('admin'), (req, res) => {
  // Seuls les admins peuvent accéder
})
```

#### Approche 2 : Vérification au niveau ressource
```javascript
async function deletePost(postId, userId) {
  const post = await getPost(postId)
  
  if (post.authorId !== userId && !isAdmin(userId)) {
    throw new UnauthorizedError("Vous ne pouvez pas supprimer ce post")
  }
  
  await deletePostFromDB(postId)
}
```

#### Approche 3 : Middleware d'autorisation
```javascript
function checkPermission(resource, action) {
  return async (req, res, next) => {
    const hasPermission = await userCan(req.user, action, resource)
    if (hasPermission) {
      next() // Continuer
    } else {
      res.status(403).json({error: "Permission denied"})
    }
  }
}
```

## Chapitre 3 : Les défis de l'authentification moderne

### La complexité croissante du paysage web

#### 1. Multiplicité des méthodes d'authentification
Les utilisateurs modernes attendent de pouvoir se connecter avec :
- Email/mot de passe traditionnel
- Google, Facebook, Apple, Microsoft (OAuth)
- Téléphone (SMS)
- Magic links (liens par email)
- Authentification à deux facteurs (2FA)

**Défi technique :** Comment implémenter et maintenir tous ces systèmes ?

#### 2. Sécurité vs. Expérience utilisateur
```
Plus sécurisé              Plus pratique
    ↑                          ↓
[MFA + Captcha]  ←→  [Connexion automatique]
```

**Dilemme :** Les mesures de sécurité rendent souvent l'expérience utilisateur plus friction.

#### 3. Conformité et réglementations
- **RGPD (Europe)** : Droit à l'oubli, consentement explicite
- **CCPA (Californie)** : Transparence sur l'utilisation des données
- **HIPAA (Santé US)** : Protection des données médicales

### Problèmes techniques spécifiques

#### 1. Gestion des sessions
**Questions complexes :**
- Où stocker les sessions ? (Mémoire, base de données, Redis)
- Combien de temps garder une session active ?
- Comment gérer les sessions sur plusieurs serveurs ?
- Que faire si l'utilisateur ferme son navigateur ?

#### 2. Sécurité des mots de passe
```javascript
// ❌ JAMAIS faire ça
const password = "password123"
database.save({ password: password })

// ✅ Correct
const bcrypt = require('bcrypt')
const hashedPassword = await bcrypt.hash(password, 12)
database.save({ password: hashedPassword })
```

**Complexités :**
- Choix de l'algorithme de hachage (bcrypt, argon2, scrypt)
- Coût de calcul (sécurité vs performance)
- Gestion du salt (sel cryptographique)

#### 3. Protection contre les attaques

**Attaque par force brute :**
```
Attaquant essaie :
password123, 123456, password, admin, user...
```
**Solution :** Rate limiting, comptes temporairement bloqués

**Attaques par timing :**
```javascript
// ❌ Vulnérable - temps de réponse révèle si l'utilisateur existe
async function login(email, password) {
  const user = await findUser(email)
  if (!user) return false  // Réponse rapide
  
  return await bcrypt.compare(password, user.password)  // Réponse lente
}

// ✅ Sécurisé - temps constant
async function login(email, password) {
  const user = await findUser(email)
  const hash = user ? user.password : "$2b$12$dummy.hash.for.timing"
  const isValid = await bcrypt.compare(password, hash)
  
  return user && isValid
}
```

## Chapitre 4 : L'émergence de NextAuth.js

### Le contexte historique : 2020-2021

#### L'état du développement React/Next.js
En 2020, l'écosystème React connaît une explosion :
- **Next.js** devient le framework de référence pour React
- **JAMstack** (JavaScript, APIs, Markup) gagne en popularité
- **Applications full-stack** remplacent les SPAs simples

**Problème :** Comment ajouter l'authentification à ces nouvelles architectures ?

#### Solutions existantes et leurs limitations

**1. Auth0**
```javascript
import { useAuth0 } from '@auth0/auth0-react'

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0()
  // ...
}
```

**Avantages :** Service géré, très sécurisé, support excellent
**Inconvénients :** Coûteux (28€/mois pour 1000 utilisateurs), vendor lock-in

**2. Firebase Auth**
```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const auth = getAuth()
signInWithEmailAndPassword(auth, email, password)
```

**Avantages :** Gratuit jusqu'à 10k utilisateurs/mois, bien intégré
**Inconvénients :** Vendor lock-in Google, moins flexible

**3. Passport.js**
```javascript
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      // Logique d'authentification
    })
  }
))
```

**Avantages :** Très flexible, beaucoup de stratégies
**Inconvénients :** Complexe à configurer, orienté Express.js

**4. Solutions maison**
```javascript
// Implémentation custom typique
app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.cookie('token', token)
    res.json({ success: true })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})
```

**Problèmes récurrents :**
- Réinventer la roue à chaque projet
- Erreurs de sécurité fréquentes
- Maintenance complexe
- Pas de standards

### La vision de NextAuth.js

#### Les besoins identifiés

**1. Spécifiquement pour Next.js**
- Intégration native avec les API routes
- Support du Server-Side Rendering (SSR)
- Optimisé pour le déploiement Vercel

**2. Sécurité par défaut**
- Configurations sécurisées out-of-the-box
- Protection contre les attaques communes
- Standards de l'industrie respectés

**3. Flexibilité maximale**
- Providers OAuth (Google, GitHub, etc.)
- Base de données au choix
- Personnalisation poussée

**4. Developer Experience**
- Configuration minimale pour commencer
- TypeScript native
- Documentation excellente

#### La philosophie de conception

**Principe 1 : "Secure by default"**
```javascript
// NextAuth configure automatiquement :
// - Cookies sécurisés (httpOnly, secure, sameSite)
// - Protection CSRF
// - Rotation des secrets
// - Validation des tokens
```

**Principe 2 : "Convention over configuration"**
```javascript
// Minimal setup
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  ]
})
```

**Principe 3 : "Extensible architecture"**
```javascript
export default NextAuth({
  providers: [/* ... */],
  adapter: PrismaAdapter(prisma),    // Votre base de données
  callbacks: {                      // Votre logique custom
    async session({ session, token }) {
      // Personnalisation des sessions
    }
  }
})
```

## Chapitre 5 : NextAuth.js - Authentification ou Autorisation ?

### Analyse des capacités de NextAuth.js

#### Fonctionnalités d'authentification ✅

**1. Vérification d'identité**
```javascript
// NextAuth vérifie automatiquement
const session = await getServerSession(authOptions)
if (session) {
  // L'utilisateur est authentifié
  console.log(`Bonjour ${session.user.name}`)
}
```

**2. Gestion des providers**
```javascript
providers: [
  EmailProvider({ /* Magic links */ }),
  GoogleProvider({ /* OAuth Google */ }),
  CredentialsProvider({ /* Email/password */ }),
]
```

**3. Gestion des sessions**
```javascript
// Session JWT ou base de données
session: {
  strategy: "jwt",  // ou "database"
  maxAge: 30 * 24 * 60 * 60, // 30 jours
}
```

#### Fonctionnalités d'autorisation ⚠️ (Limitées)

**Ce que NextAuth fait :**
```javascript
// Callbacks pour enrichir les sessions
callbacks: {
  async session({ session, token }) {
    session.user.role = token.role  // Ajouter le rôle
    return session
  }
}
```

**Ce que NextAuth ne fait PAS :**
- Gestion des permissions granulaires
- Contrôle d'accès basé sur les ressources
- Workflow d'approbation
- Hiérarchies de rôles complexes

### Verdict : NextAuth.js est principalement un outil d'AUTHENTIFICATION

#### Domaine principal : Authentification ✅
- **Qui êtes-vous ?** → NextAuth excelle
- Connexion/déconnexion
- Gestion multi-providers
- Sessions sécurisées
- Intégration base de données

#### Domaine secondaire : Autorisation basique ⚠️
- **Que pouvez-vous faire ?** → Support limité
- Rôles utilisateur simples
- Sessions enrichies
- Callbacks personnalisables

#### Ce qui reste à votre charge : Autorisation avancée 🔴
```javascript
// Vous devez implémenter
function checkPermission(user, resource, action) {
  if (action === 'delete' && resource === 'post') {
    return user.role === 'admin' || user.id === post.authorId
  }
  // Votre logique d'autorisation
}
```

### Positionnement dans l'écosystème

```
Architecture typique avec NextAuth.js :

NextAuth.js           Votre Code              Base de données
    ↓                     ↓                        ↓
[Authentification] → [Autorisation] → [Contrôle d'accès]
    ↓                     ↓                        ↓
"Qui es-tu ?"        "Que peux-tu faire ?"    "Accès accordé/refusé"
```

## Chapitre 6 : L'écosystème moderne de l'authentification

### Comparaison avec les alternatives

#### NextAuth.js vs Auth0
| Aspect | NextAuth.js | Auth0 |
|--------|-------------|--------|
| **Coût** | Gratuit + hosting | 23€/mois pour 7k utilisateurs |
| **Contrôle** | Total | Limité |
| **Sécurité** | Très bonne | Excellente |
| **Complexité** | Moyenne | Faible |
| **Vendor lock-in** | Non | Oui |

#### NextAuth.js vs Firebase Auth
| Aspect | NextAuth.js | Firebase Auth |
|--------|-------------|---------------|
| **Base de données** | Votre choix | Firestore obligatoire |
| **Providers** | Très flexible | Limité à Google |
| **Customization** | Maximale | Moyenne |
| **Intégration Next.js** | Native | Possible mais friction |

### Tendances futures

#### 1. Authentification passwordless
```javascript
// Magic links, SMS, Push notifications
EmailProvider({
  server: process.env.EMAIL_SERVER,
  from: process.env.EMAIL_FROM
})
```

#### 2. Web3 et blockchain
```javascript
// Connexion avec wallet crypto
providers: [
  {
    id: "ethereum",
    name: "Ethereum",
    type: "oauth",
    // Configuration Web3
  }
]
```

#### 3. Biométrie web
```javascript
// WebAuthn API pour empreintes/Face ID
if (window.PublicKeyCredential) {
  // Authentification biométrique native
}
```

## Conclusion : Pourquoi NextAuth.js répond à un besoin réel

### Synthèse des besoins comblés

#### 1. Complexité maîtrisée
**Avant NextAuth.js :**
```javascript
// 200+ lignes pour une auth basique sécurisée
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
// ... configuration complexe
```

**Avec NextAuth.js :**
```javascript
// 10 lignes pour la même fonctionnalité
export default NextAuth({
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
  })]
})
```

#### 2. Sécurité garantie
- Protection CSRF automatique
- Cookies sécurisés par défaut
- Validation de tokens
- Rotation des secrets

#### 3. Écosystème Next.js
- SSR natif
- API routes intégrées
- TypeScript support
- Déploiement Vercel optimisé

### Limites et solutions complémentaires

#### Ce que NextAuth.js ne fait pas
1. **Autorisation granulaire** → Utilisez Casbin, CASL
2. **Gestion des rôles complexes** → Implémentation custom
3. **Audit des accès** → Logs personnalisés
4. **Workflow d'approbation** → Logique métier

#### Architecture recommandée
```
Layer 1: NextAuth.js (Authentification)
    ↓
Layer 2: Votre middleware (Autorisation)
    ↓
Layer 3: Votre logique métier (Contrôle d'accès)
```

### Vision d'avenir

NextAuth.js représente l'évolution naturelle de l'authentification web :
- **Simplicité** pour les cas d'usage courants
- **Sécurité** par défaut
- **Flexibilité** pour les besoins avancés
- **Standards** de l'industrie

Il ne révolutionne pas l'authentification, mais **démocratise les bonnes pratiques** en les rendant accessibles à tous les développeurs Next.js.

---

## Exercices de réflexion

1. **Analyse critique :** Quels sont les cas où NextAuth.js ne serait PAS adapté ?

2. **Architecture :** Comment structureriez-vous un système d'autorisation complémentaire à NextAuth.js ?

3. **Sécurité :** Quelles mesures supplémentaires implémenteriez-vous pour une application bancaire ?

4. **Évolution :** Comment NextAuth.js pourrait-il évoluer pour mieux supporter l'autorisation ?

---

**Ce cours théorique vous a préparé à comprendre les concepts fondamentaux. Vous êtes maintenant prêt à plonger dans l'implémentation pratique avec les guides suivants.**

---

# ANNEXES

## Annexe A : Exemples pratiques d'authentification

### A.1 - Authentification par mot de passe (Credentials Provider)

**Cas d'usage :** Application interne d'entreprise, contrôle total des données

```javascript
// Configuration NextAuth.js
CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Mot de passe", type: "password" }
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null
    
    // Recherche utilisateur en base
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    
    if (!user || !user.password) return null
    
    // Vérification du mot de passe haché
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    )
    
    if (!isPasswordValid) return null
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
})
```

**Workflow complet :**
1. Utilisateur saisit email/password sur formulaire
2. NextAuth.js appelle la fonction `authorize()`
3. Recherche de l'utilisateur en base de données
4. Comparaison du mot de passe avec bcrypt
5. Retour des informations utilisateur si valide
6. Création d'une session JWT ou database

**Avantages :**
- Contrôle total sur la logique d'authentification
- Données utilisateur restent sur vos serveurs
- Personnalisation complète du processus

**Inconvénients :**
- Gestion des mots de passe (complexité, oublis)
- Responsabilité sécuritaire complète
- Pas de Single Sign-On

### A.2 - Authentification OAuth (Google Provider)

**Cas d'usage :** Application grand public, expérience utilisateur simplifiée

```javascript
// Configuration NextAuth.js
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile',
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code'
    }
  }
})
```

**Workflow OAuth 2.0 détaillé :**
```
1. User clique "Se connecter avec Google"
   ↓
2. Redirection vers Google avec paramètres :
   https://accounts.google.com/oauth/authorize?
   client_id=YOUR_CLIENT_ID&
   redirect_uri=http://localhost:3000/api/auth/callback/google&
   scope=openid+email+profile&
   response_type=code
   ↓
3. Google affiche page de consentement
   ↓
4. User accepte → Google redirige avec code :
   http://localhost:3000/api/auth/callback/google?code=AUTH_CODE
   ↓
5. NextAuth.js échange le code contre un token :
   POST https://oauth2.googleapis.com/token
   {
     "client_id": "YOUR_CLIENT_ID",
     "client_secret": "YOUR_CLIENT_SECRET",
     "code": "AUTH_CODE",
     "grant_type": "authorization_code"
   }
   ↓
6. Google renvoie access_token + user info
   ↓
7. NextAuth.js crée session avec les données utilisateur
```

**Configuration avancée avec scopes personnalisés :**
```javascript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline', // Pour refresh token
      prompt: 'consent'       // Force le consentement
    }
  }
})
```

### A.3 - Authentification Magic Link (Email Provider)

**Cas d'usage :** Applications modernes, authentification sans mot de passe

```javascript
// Configuration NextAuth.js
EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },
  from: process.env.EMAIL_FROM,
  maxAge: 24 * 60 * 60, // Validité du lien : 24h
})
```

**Template d'email personnalisé :**
```javascript
EmailProvider({
  server: process.env.EMAIL_SERVER,
  from: process.env.EMAIL_FROM,
  sendVerificationRequest: async ({ identifier, url, provider, theme }) => {
    const { host } = new URL(url)
    const transport = nodemailer.createTransporter(provider.server)
    
    await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: `Connexion à ${host}`,
      text: `Cliquez sur ce lien pour vous connecter : ${url}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial;">
          <h1>Connexion sécurisée</h1>
          <p>Cliquez sur le bouton ci-dessous pour vous connecter :</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; 
             background: #0070f3; color: white; text-decoration: none; 
             border-radius: 6px;">
            Se connecter
          </a>
          <p><small>Ce lien expire dans 24 heures.</small></p>
        </div>
      `
    })
  }
})
```

**Workflow Magic Link :**
```
1. User saisit email → soumission formulaire
   ↓
2. NextAuth génère token sécurisé + URL unique
   ↓
3. Envoi email avec lien personnalisé
   ↓
4. User clique lien dans email
   ↓
5. NextAuth vérifie token (validité, expiration)
   ↓
6. Si valide → création session automatique
```

## Annexe B : Solutions d'autorisation concrètes

### B.1 - Système d'autorisation simple avec rôles

**Architecture recommandée pour NextAuth.js :**

```javascript
// 1. Extension du schéma Prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String?
  role     UserRole @default(USER)
  // ... autres champs
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

// 2. Extension des types NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
    }
  }
}

// 3. Middleware d'autorisation
// middleware.ts
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const userRole = req.nextauth.token?.role

    // Routes admin uniquement
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect('/unauthorized')
      }
    }

    // Routes modérateur
    if (pathname.startsWith('/moderate')) {
      if (!['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return NextResponse.redirect('/unauthorized')
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// 4. Hook personnalisé pour vérifications
// hooks/useAuthorization.ts
export function useAuthorization() {
  const { data: session } = useSession()

  const hasRole = (role: UserRole) => {
    return session?.user?.role === role
  }

  const hasAnyRole = (roles: UserRole[]) => {
    return roles.includes(session?.user?.role)
  }

  const isAdmin = () => hasAnyRole(['ADMIN', 'SUPER_ADMIN'])
  const canModerate = () => hasAnyRole(['MODERATOR', 'ADMIN', 'SUPER_ADMIN'])

  return { hasRole, hasAnyRole, isAdmin, canModerate }
}
```

### B.2 - Système d'autorisation granulaire avec permissions

**Pour applications complexes nécessitant des permissions fines :**

```javascript
// 1. Modèles Prisma avancés
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  userRoles UserRole[]
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  permissions Permission[]
  userRoles   UserRole[]
}

model Permission {
  id          String @id @default(cuid())
  name        String @unique // Ex: "posts:create", "users:delete"
  resource    String        // Ex: "posts", "users"
  action      String        // Ex: "create", "read", "update", "delete"
  description String?
  roles       Role[]
}

model UserRole {
  id     String @id @default(cuid())
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id])
  role   Role   @relation(fields: [roleId], references: [id])
}

// 2. Service d'autorisation
// lib/authorization.ts
export class AuthorizationService {
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    })

    if (!user) return []

    const permissions = user.userRoles.flatMap(userRole =>
      userRole.role.permissions.map(permission => permission.name)
    )

    return [...new Set(permissions)] // Dédoublonnage
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    return permissions.includes(permission)
  }

  async requirePermission(userId: string, permission: string): Promise<void> {
    const hasPermission = await this.hasPermission(userId, permission)
    if (!hasPermission) {
      throw new Error(`Permission requise: ${permission}`)
    }
  }
}

// 3. Middleware API avec permissions
// middleware/withPermission.ts
export function withPermission(permission: string) {
  return async (req: NextRequest, res: NextResponse) => {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const authService = new AuthorizationService()
    const hasPermission = await authService.hasPermission(
      session.user.id, 
      permission
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: `Permission requise: ${permission}` }, 
        { status: 403 }
      )
    }

    // Continuer vers le handler API
    return null
  }
}

// 4. Utilisation dans les API routes
// app/api/posts/route.ts
export async function POST(request: Request) {
  const permissionCheck = await withPermission('posts:create')(request)
  if (permissionCheck) return permissionCheck

  // Logique de création de post
  const body = await request.json()
  const post = await createPost(body)
  
  return NextResponse.json(post)
}
```

### B.3 - Exemple complet : Système de blog avec autorisation

**Cas pratique : Blog multi-auteurs avec modération**

```javascript
// Définition des permissions
const PERMISSIONS = {
  // Posts
  POSTS_READ_ALL: 'posts:read_all',
  POSTS_READ_OWN: 'posts:read_own',
  POSTS_CREATE: 'posts:create',
  POSTS_UPDATE_OWN: 'posts:update_own',
  POSTS_UPDATE_ALL: 'posts:update_all',
  POSTS_DELETE_OWN: 'posts:delete_own',
  POSTS_DELETE_ALL: 'posts:delete_all',
  POSTS_PUBLISH: 'posts:publish',
  
  // Commentaires
  COMMENTS_READ: 'comments:read',
  COMMENTS_CREATE: 'comments:create',
  COMMENTS_MODERATE: 'comments:moderate',
  
  // Utilisateurs
  USERS_MANAGE: 'users:manage'
}

// Configuration des rôles
const ROLES_CONFIG = {
  READER: [
    PERMISSIONS.POSTS_READ_ALL,
    PERMISSIONS.COMMENTS_READ,
    PERMISSIONS.COMMENTS_CREATE
  ],
  
  AUTHOR: [
    ...ROLES_CONFIG.READER,
    PERMISSIONS.POSTS_CREATE,
    PERMISSIONS.POSTS_READ_OWN,
    PERMISSIONS.POSTS_UPDATE_OWN,
    PERMISSIONS.POSTS_DELETE_OWN
  ],
  
  EDITOR: [
    ...ROLES_CONFIG.AUTHOR,
    PERMISSIONS.POSTS_UPDATE_ALL,
    PERMISSIONS.POSTS_PUBLISH,
    PERMISSIONS.COMMENTS_MODERATE
  ],
  
  ADMIN: [
    ...ROLES_CONFIG.EDITOR,
    PERMISSIONS.POSTS_DELETE_ALL,
    PERMISSIONS.USERS_MANAGE
  ]
}

// Composant avec autorisation contextuelle
function PostActions({ post, currentUserId }) {
  const { hasPermission } = useAuthorization()
  
  const canEdit = hasPermission(PERMISSIONS.POSTS_UPDATE_ALL) ||
    (hasPermission(PERMISSIONS.POSTS_UPDATE_OWN) && post.authorId === currentUserId)
    
  const canDelete = hasPermission(PERMISSIONS.POSTS_DELETE_ALL) ||
    (hasPermission(PERMISSIONS.POSTS_DELETE_OWN) && post.authorId === currentUserId)
    
  const canPublish = hasPermission(PERMISSIONS.POSTS_PUBLISH)

  return (
    <div className="post-actions">
      {canEdit && (
        <button onClick={() => editPost(post.id)}>
          Modifier
        </button>
      )}
      
      {canDelete && (
        <button onClick={() => deletePost(post.id)} className="danger">
          Supprimer
        </button>
      )}
      
      {canPublish && !post.published && (
        <button onClick={() => publishPost(post.id)} className="primary">
          Publier
        </button>
      )}
    </div>
  )
}
```

## Annexe C : Quiz d'évaluation des connaissances

### Section 1 : Concepts fondamentaux (20 points)

**Question 1.1 (4 points)**
Expliquez la différence entre authentification et autorisation en donnant un exemple concret du monde physique.

**Réponse attendue :**
- Authentification = vérification d'identité ("Qui êtes-vous ?")
- Autorisation = contrôle d'accès ("Que pouvez-vous faire ?")
- Exemple : Carte d'identité à l'aéroport (auth) vs billet d'avion pour embarquer (authz)

**Question 1.2 (4 points)**
Citez et expliquez brièvement les trois facteurs d'authentification.

**Réponse attendue :**
1. Quelque chose que vous savez (mot de passe, PIN)
2. Quelque chose que vous possédez (téléphone, carte)
3. Quelque chose que vous êtes (biométrie)

**Question 1.3 (4 points)**
Pourquoi l'authentification basique HTTP n'est-elle plus recommandée ?

**Réponse attendue :**
- Encodage base64 facilement décodable
- Pas de chiffrement par défaut
- Impossible de se déconnecter
- Interface utilisateur primitive
- Vulnérable aux attaques man-in-the-middle

**Question 1.4 (4 points)**
Qu'est-ce que le Single Sign-On (SSO) et quel problème résout-il ?

**Réponse attendue :**
- SSO = authentification unique pour plusieurs services
- Problème résolu : éviter de retaper identifiants sur chaque service
- Exemple : Google/Microsoft pour accéder à plusieurs applications

**Question 1.5 (4 points)**
Expliquez ce qu'est un JWT et ses avantages par rapport aux sessions traditionnelles.

**Réponse attendue :**
- JWT = JSON Web Token, token auto-contenu signé
- Avantages : stateless, scalable, pas de stockage serveur
- Format : header.payload.signature

### Section 2 : Sécurité et bonnes pratiques (25 points)

**Question 2.1 (5 points)**
Pourquoi ne faut-il jamais stocker les mots de passe en clair ? Quelle est la bonne pratique ?

**Réponse attendue :**
- Risque en cas de fuite de données
- Bonne pratique : hachage avec sel (bcrypt, argon2)
- Le hachage est irréversible (fonction à sens unique)

**Question 2.2 (5 points)**
Qu'est-ce qu'une attaque par force brute et comment s'en protéger ?

**Réponse attendue :**
- Attaque : tester massivement des combinaisons login/password
- Protection : rate limiting, captcha, blocage temporaire de compte
- Exemple de rate limiting : 3 tentatives max par 15 minutes

**Question 2.3 (5 points)**
Expliquez ce qu'est une attaque CSRF et comment NextAuth.js nous protège.

**Réponse attendue :**
- CSRF = Cross-Site Request Forgery
- Attaque : site malveillant fait des requêtes à votre nom
- Protection NextAuth : tokens CSRF automatiques, vérification origine

**Question 2.4 (5 points)**
Pourquoi les cookies de session doivent-ils être configurés avec httpOnly et secure ?

**Réponse attendue :**
- httpOnly : empêche l'accès JavaScript (protection XSS)
- secure : transmission uniquement en HTTPS
- sameSite : protection contre CSRF

**Question 2.5 (5 points)**
Qu'est-ce qu'une attaque par timing et comment l'éviter ?

**Réponse attendue :**
- Analyse des temps de réponse pour déduire des informations
- Exemple : réponse rapide si utilisateur n'existe pas
- Solution : temps de traitement constant (dummy hash)

### Section 3 : NextAuth.js spécifique (30 points)

**Question 3.1 (6 points)**
NextAuth.js résout principalement quel aspect de la sécurité : authentification ou autorisation ? Justifiez votre réponse.

**Réponse attendue :**
- Principalement AUTHENTIFICATION
- Gère : providers, sessions, tokens, cookies sécurisés
- Autorisation : support limité (rôles simples via callbacks)
- Permissions granulaires : à implémenter soi-même

**Question 3.2 (6 points)**
Quels sont les trois types de providers supportés par NextAuth.js ? Donnez un exemple de chaque.

**Réponse attendue :**
1. OAuth : GoogleProvider, GitHubProvider, FacebookProvider
2. Email : EmailProvider (magic links)
3. Credentials : CredentialsProvider (email/password custom)

**Question 3.3 (6 points)**
Expliquez la différence entre les stratégies de session "jwt" et "database" dans NextAuth.js.

**Réponse attendue :**
- JWT : token auto-contenu, stateless, pas de DB pour chaque requête
- Database : session stockée en base, plus sécurisé, révocation possible
- JWT : meilleur pour performance, Database : meilleur pour contrôle

**Question 3.4 (6 points)**
À quoi servent les callbacks jwt() et session() dans la configuration NextAuth.js ?

**Réponse attendue :**
- jwt() : exécuté à la création/mise à jour du token JWT
- session() : exécuté quand la session est récupérée côté client
- Utilité : enrichir les données (ajouter rôle, permissions)

**Question 3.5 (6 points)**
Comment protéger une API route Next.js avec NextAuth.js ? Donnez le code.

**Réponse attendue :**
```javascript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return Response.json({error: "Non authentifié"}, {status: 401})
  }
  
  // Logique protégée
}
```

### Section 4 : Architecture et cas pratiques (25 points)

**Question 4.1 (8 points)**
Concevez l'architecture d'autorisation pour une application de gestion de projets avec les rôles suivants : Développeur, Chef de projet, Administrateur système. Définissez les permissions de chaque rôle.

**Réponse attendue :**
- Développeur : voir projets assignés, modifier tâches assignées, commenter
- Chef de projet : créer/modifier projets, assigner tâches, voir rapports équipe
- Administrateur système : gérer utilisateurs, accès complet, configuration globale

**Question 4.2 (8 points)**
Dans quels cas NE recommanderiez-vous PAS NextAuth.js ? Proposez des alternatives.

**Réponse attendue :**
- Applications enterprise complexes → Auth0, Okta
- Besoins d'autorisation très granulaires → Casbin + NextAuth
- Applications mobiles natives → Firebase Auth
- Microservices → Solution centralisée comme Keycloak

**Question 4.3 (9 points)**
Décrivez étape par étape le workflow OAuth 2.0 quand un utilisateur clique "Se connecter avec Google".

**Réponse attendue :**
1. Redirection vers Google avec client_id
2. Utilisateur consent sur Google
3. Google redirige avec code d'autorisation
4. NextAuth échange code contre access_token
5. NextAuth récupère profil utilisateur
6. Création session locale
7. Redirection vers application

### Barème et évaluation

**Total : 100 points**

**Notation :**
- 90-100 : Excellente maîtrise des concepts
- 80-89 : Bonne compréhension, quelques lacunes mineures
- 70-79 : Compréhension correcte, révisions nécessaires
- 60-69 : Compréhension partielle, formation supplémentaire recommandée
- <60 : Bases à revoir, support pédagogique nécessaire

**Critères d'évaluation :**
- Précision technique des réponses
- Utilisation appropriée du vocabulaire
- Exemples concrets et pertinents
- Compréhension des enjeux de sécurité
- Capacité à justifier les choix architecturaux

**Conseils pour réussir :**
1. Relisez attentivement le cours théorique
2. Pratiquez avec les exemples de code fournis
3. Testez les configurations sur un projet réel
4. Consultez la documentation officielle NextAuth.js
5. Posez des questions spécifiques sur les points non compris
