# Suite du Guide NextAuth.js v4 - Étapes 11 à 20

## Étape 11 : Formulaire d'inscription - Permettre aux utilisateurs de créer un compte

### Qu'est-ce qu'un formulaire d'inscription ?
**Analogie simple :** C'est comme le formulaire d'inscription à la bibliothèque - vous donnez vos informations personnelles pour obtenir une carte de membre qui vous permettra d'emprunter des livres.

### Localisation du fichier
**Où créer ce fichier ?**
- Chemin exact : `components/auth/SignUpForm.tsx`
- **Pourquoi dans `components/auth/` ?** → Pour organiser tous les composants d'authentification ensemble
- **Pourquoi `.tsx` ?** → Extension TypeScript + JSX (mélange de JavaScript et HTML)

### Code complet avec explications exhaustives

```typescript
// ============================================
// DÉCLARATION DU TYPE DE COMPOSANT
// ============================================
"use client"
// Explication : Cette ligne OBLIGATOIRE indique à Next.js que ce composant 
// s'exécute côté CLIENT (dans le navigateur), pas sur le serveur.
// Pourquoi ? Parce qu'on utilise des états (useState) et des interactions utilisateur
// qui ne peuvent pas fonctionner côté serveur.

// ============================================
// IMPORTATION DES OUTILS NÉCESSAIRES
// ============================================
import { useState } from "react"
// Explication : useState = hook React pour gérer l'état (les données qui changent)
// Analogie : C'est comme avoir une ardoise magique où on peut écrire et effacer
// en temps réel selon les actions de l'utilisateur

import { signIn } from "next-auth/react"
// Explication : signIn = fonction NextAuth pour connecter un utilisateur
// Cette fonction va contacter notre API d'authentification et créer une session
// Analogie : C'est comme valider son ticket d'entrée à un concert

import { useRouter } from "next/navigation"
// Explication : useRouter = hook Next.js pour naviguer entre les pages
// Permet de rediriger l'utilisateur après inscription réussie
// Analogie : C'est comme un GPS interne qui peut emmener l'utilisateur ailleurs

// ============================================
// FONCTION PRINCIPALE DU COMPOSANT
// ============================================
export default function SignUpForm() {
  // Explication : export default = rendre ce composant disponible pour import ailleurs
  // function = déclaration d'une fonction JavaScript classique
  // SignUpForm = nom du composant (toujours en PascalCase pour les composants React)

  // ============================================
  // ÉTATS DU FORMULAIRE (VARIABLES QUI CHANGENT)
  // ============================================
  // Analogie : Les états sont comme des cases mémoire où on stocke temporairement
  // ce que l'utilisateur tape dans les champs du formulaire

  const [name, setName] = useState("")
  // Explication ligne par ligne :
  // - const = déclaration d'une constante (ne change jamais de référence)
  // - [name, setName] = destructuration - on récupère 2 éléments du tableau retourné par useState
  // - name = variable qui CONTIENT la valeur actuelle (ex: "Jean Dupont")
  // - setName = fonction pour MODIFIER la valeur de name
  // - useState("") = initialise l'état avec une chaîne vide
  // Analogie : name = ce qui est écrit sur l'ardoise, setName = l'effaceur/crayon pour changer

  const [email, setEmail] = useState("")
  // Même principe que name, mais pour l'adresse email de l'utilisateur

  const [password, setPassword] = useState("")
  // État pour le mot de passe saisi (sera crypté avant envoi au serveur)

  const [confirmPassword, setConfirmPassword] = useState("")
  // État pour la confirmation du mot de passe 
  // Permet de vérifier que l'utilisateur n'a pas fait de faute de frappe

  const [loading, setLoading] = useState(false)
  // État boolean (vrai/faux) pour savoir si une opération est en cours
  // Analogie : C'est comme un voyant "En cours" sur une machine à laver
  // false = pas en cours, true = opération en cours (affichage d'un spinner)

  const [error, setError] = useState("")
  // État pour stocker un éventuel message d'erreur
  // Si vide ("") = pas d'erreur, sinon contient le texte de l'erreur à afficher

  const [success, setSuccess] = useState("")
  // État pour stocker un message de succès
  // Utilisé pour confirmer à l'utilisateur que l'inscription a réussi
  
  const router = useRouter()
  // Explication : Création d'un objet router pour naviguer entre les pages
  // router.push("/") = aller à la page d'accueil
  // router.refresh() = recharger la page actuelle

  // ============================================
  // FONCTION DE SOUMISSION DU FORMULAIRE
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    // Explication ligne par ligne de la déclaration :
    // - const handleSubmit = déclaration d'une fonction constante
    // - async = cette fonction est asynchrone (peut attendre des réponses serveur)
    // - (e: React.FormEvent) = paramètre e de type React.FormEvent (événement de formulaire)
    // Analogie : handleSubmit = le "chef d'orchestre" qui va coordonner toute l'inscription

    // ============================================
    // ÉTAPE 1 : PRÉPARATION ET NETTOYAGE
    // ============================================
    e.preventDefault()
    // Explication : preventDefault() empêche le comportement par défaut du formulaire
    // Sans ça, la page se rechargerait automatiquement lors de la soumission
    // Analogie : C'est comme dire "Stop !" à un comportement automatique non désiré

    setLoading(true)
    // Explication : On active l'état "en cours de traitement"
    // Cela va afficher un spinner/texte "Chargement..." à l'utilisateur
    // Analogie : On allume le voyant "En cours" de la machine

    setError("")
    // Explication : On efface tout ancien message d'erreur
    // Cela évite d'afficher une erreur précédente qui ne correspond plus
    // Analogie : On nettoie l'ardoise des erreurs avant de commencer

    setSuccess("")
    // Explication : On efface tout ancien message de succès
    // Pour la même raison que l'erreur - on repart sur une base propre

    // ============================================
    // ÉTAPE 2 : VALIDATION CÔTÉ CLIENT
    // ============================================
    // Analogie : Avant d'envoyer un courrier, on vérifie qu'il est bien écrit
    
    if (password !== confirmPassword) {
      // Explication : !== signifie "n'est pas égal à"
      // On compare les deux mots de passe saisis par l'utilisateur
      // Si ils sont différents, c'est probablement une erreur de frappe
      
      setError("Les mots de passe ne correspondent pas")
      // On affiche un message d'erreur clair et en français
      
      setLoading(false)
      // On désactive l'état "chargement" puisqu'on arrête le processus
      
      return
      // return = sortir immédiatement de la fonction, ne pas continuer
      // Analogie : C'est comme dire "Stop, on ne continue pas !"
    }

    if (password.length < 6) {
      // Explication : .length = propriété qui donne la longueur d'une chaîne
      // < 6 = inférieur à 6 caractères
      // Vérification de sécurité minimale pour éviter des mots de passe trop courts
      
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setLoading(false)
      return
      // Même logique que l'erreur précédente : arrêter et informer l'utilisateur
    }

    // ============================================
    // ÉTAPE 3 : COMMUNICATION AVEC LE SERVEUR
    // ============================================
    try {
      // Explication : try/catch = mécanisme pour gérer les erreurs
      // try = "essaie de faire ceci"
      // catch = "si ça échoue, fait cela"
      // Analogie : C'est comme avoir un filet de sécurité sous un trapéziste

      // ----------------------------------------
      // Envoi de la demande d'inscription au serveur
      // ----------------------------------------
      const response = await fetch("/api/auth/signup", {
        // Explication ligne par ligne :
        // - fetch() = fonction JavaScript pour faire des requêtes HTTP
        // - "/api/auth/signup" = URL de notre API d'inscription
        // - await = attendre la réponse avant de continuer
        // Analogie : C'est comme envoyer une lettre recommandée et attendre l'accusé de réception

        method: "POST",
        // Explication : "POST" = type de requête HTTP pour CRÉER quelque chose
        // Autres types : GET (lire), PUT (modifier), DELETE (supprimer)
        // Analogie : POST = "Je veux AJOUTER quelque chose dans votre système"

        headers: {
          "Content-Type": "application/json",
        },
        // Explication : headers = en-têtes HTTP qui décrivent la requête
        // "Content-Type": "application/json" = "Je vous envoie du JSON"
        // JSON = format de données structuré et lisible
        // Analogie : C'est comme mettre un autocollant sur un colis "Fragile - Verre"

        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        }),
        // Explication ligne par ligne :
        // - body = contenu de la requête (les données qu'on envoie)
        // - JSON.stringify() = convertir un objet JavaScript en texte JSON
        // - name.trim() = enlever les espaces au début et à la fin
        // - email.toLowerCase().trim() = mettre en minuscules ET enlever les espaces
        // - password = on envoie le mot de passe tel quel (sera crypté côté serveur)
        // Analogie : C'est comme préparer soigneusement le contenu d'une enveloppe
      })

      const data = await response.json()
      // Explication : 
      // - response.json() = convertir la réponse du serveur depuis JSON vers objet JavaScript
      // - await = attendre que la conversion soit terminée
      // - data = variable qui va contenir la réponse du serveur
      // Analogie : C'est comme ouvrir la lettre de réponse qu'on a reçue

      if (!response.ok) {
        // Explication :
        // - response.ok = propriété boolean qui indique si la requête a réussi
        // - !response.ok = si la requête a ÉCHOUÉ
        // - Les codes 200-299 = succès, 400-499 = erreur client, 500-599 = erreur serveur
        
        throw new Error(data.error || "Erreur lors de l'inscription")
        // Explication :
        // - throw = déclencher une erreur volontairement
        // - new Error() = créer un objet erreur
        // - data.error || "Erreur..." = utiliser le message du serveur OU un message par défaut
        // Analogie : C'est comme lever un drapeau rouge pour dire "Il y a un problème !"
      }

      // ----------------------------------------
      // Si on arrive ici, l'inscription a réussi !
      // ----------------------------------------
      setSuccess("Compte créé avec succès ! Connexion en cours...")
      // Afficher un message positif à l'utilisateur
      
      // ----------------------------------------
      // Connexion automatique après inscription
      // ----------------------------------------
      const result = await signIn("credentials", {
        // Explication :
        // - signIn() = fonction NextAuth pour connecter un utilisateur
        // - "credentials" = utiliser l'authentification par email/mot de passe
        // - await = attendre que la connexion soit terminée
        
        email: email.toLowerCase().trim(),
        // Même nettoyage que lors de l'inscription (cohérence)
        
        password,
        // Le mot de passe saisi (pas besoin de le re-crypter)
        
        redirect: false,
        // Explication : redirect: false = ne pas rediriger automatiquement
        // On veut contrôler nous-mêmes où l'utilisateur va ensuite
      })

      if (result?.error) {
        // Explication :
        // - result?.error = vérifier si result existe ET s'il a une propriété error
        // - ? = opérateur de chaîne optionnelle (évite les erreurs si result est null)
        
        setError("Compte créé mais erreur de connexion")
        // Message d'erreur spécifique : inscription OK mais connexion KO
      } else {
        // Si la connexion a réussi
        router.push("/")
        // Explication : rediriger vers la page d'accueil
        
        router.refresh()
        // Explication : recharger la page pour mettre à jour l'interface
        // (pour afficher le nom de l'utilisateur dans le menu par exemple)
      }
    } catch (error: any) {
      // Explication du catch :
      // - catch = "si quelque chose a mal tourné dans le try"
      // - error: any = paramètre qui contient les détails de l'erreur
      // - any = type TypeScript qui accepte n'importe quoi (pas idéal mais pratique ici)
      
      setError(error.message)
      // Afficher le message d'erreur à l'utilisateur
      // error.message = texte descriptif de l'erreur
    } finally {
      // Explication du finally :
      // - finally = "dans tous les cas, même si ça a marché ou échoué"
      // - Ce bloc s'exécute TOUJOURS, succès ou échec
      
      setLoading(false)
      // Désactiver l'état "chargement" dans tous les cas
      // Analogie : Éteindre le voyant "En cours" quand c'est terminé
    }
  }

  // ============================================
  // FONCTION D'INSCRIPTION VIA OAUTH (Google/GitHub)
  // ============================================
  const handleProviderSignUp = async (provider: "google" | "github") => {
    // Explication de la déclaration :
    // - provider: "google" | "github" = le paramètre ne peut être que "google" OU "github"
    // - | = opérateur union en TypeScript (soit l'un, soit l'autre)
    // Analogie : C'est comme avoir 2 boutons différents qui font la même chose

    setLoading(true)
    // Activer l'état chargement (même logique que pour le formulaire principal)

    try {
      await signIn(provider, { callbackUrl: "/" })
      // Explication :
      // - signIn(provider, ...) = utiliser le provider OAuth spécifié
      // - callbackUrl: "/" = après connexion réussie, rediriger vers la page d'accueil
      // - await = attendre que l'authentification soit terminée
      // Analogie : "Je clique sur le bouton Google/GitHub et j'attends la confirmation"

    } catch (error) {
      // Si l'authentification OAuth échoue
      setError(`Erreur avec ${provider}`)
      // Explication : 
      // - `` = template literal (permet d'injecter des variables dans une chaîne)
      // - ${provider} = injecter la valeur de provider dans le message
      // Résultat : "Erreur avec google" ou "Erreur avec github"

      setLoading(false)
      // Désactiver le chargement seulement en cas d'erreur
      // (si succès, la page se recharge automatiquement donc pas besoin)
    }
  }

  // ============================================
  // INTERFACE UTILISATEUR (JSX/HTML)
  // ============================================
  return (
    // Explication : return = ce que le composant va afficher à l'écran
    // Tout ce qui suit est du JSX (mélange de JavaScript et HTML)
    
    <div className="space-y-6">
      {/* 
      Explication ligne par ligne :
      - <div> = conteneur HTML principal
      - className = équivalent de "class" en HTML normal (mais en JavaScript)
      - "space-y-6" = classe Tailwind CSS qui ajoute un espacement vertical de 6 unités
      - Analogie : C'est comme mettre des espaceurs entre chaque section d'un document
      */}

      {/* ============================================
          SECTION 1 : MESSAGES D'ERREUR ET SUCCÈS
          ============================================ */}

      {/* Affichage conditionnel du message d'erreur */}
      {error && (
        /* 
        Explication : 
        - {error && (...)} = affichage conditionnel
        - Si error contient du texte = afficher le bloc
        - Si error est vide ("") = ne rien afficher
        - && = opérateur ET logique
        Analogie : "SI il y a un message d'erreur, ALORS l'afficher"
        */
        
        <div className="rounded-md bg-red-50 p-4">
          {/* 
          Explication des classes Tailwind :
          - rounded-md = coins arrondis moyens
          - bg-red-50 = fond rouge très clair (presque rose)
          - p-4 = padding (espacement intérieur) de 4 unités
          Analogie : C'est comme une note autocollante rouge pâle avec du texte
          */}
          
          <div className="text-sm text-red-800">{error}</div>
          {/* 
          Explication :
          - text-sm = taille de police petite
          - text-red-800 = couleur de texte rouge foncé (lisible sur fond rouge clair)
          - {error} = afficher le contenu de la variable error
          */}
        </div>
      )}

      {/* Affichage conditionnel du message de succès */}
      {success && (
        /* Même logique que pour l'erreur, mais en vert */
        
        <div className="rounded-md bg-green-50 p-4">
          {/* 
          - bg-green-50 = fond vert très clair
          Analogie : Note autocollante verte pour les bonnes nouvelles
          */}
          
          <div className="text-sm text-green-800">{success}</div>
          {/* 
          - text-green-800 = texte vert foncé sur fond vert clair
          */}
        </div>
      )}

      {/* ============================================
          SECTION 2 : FORMULAIRE D'INSCRIPTION
          ============================================ */}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* 
        Explication ligne par ligne :
        - <form> = élément HTML pour créer un formulaire
        - className="space-y-6" = espacement vertical entre les champs
        - onSubmit={handleSubmit} = quand le formulaire est soumis, exécuter handleSubmit
        - handleSubmit = référence vers notre fonction (pas d'appel immédiat !)
        Analogie : C'est comme brancher un bouton sur une machine - on dit "quand on appuie, faire ceci"
        */}
        {/* ----------------------------------------
            CHAMP 1 : NOM COMPLET
            ---------------------------------------- */}
        <div>
          {/* Container pour le champ nom */}
          
          <label htmlFor="name" className="sr-only">
            Nom complet
          </label>
          {/* 
          Explication du label :
          - <label> = étiquette associée à un champ de formulaire
          - htmlFor="name" = lie cette étiquette au champ avec id="name" (accessibilité)
          - className="sr-only" = "screen reader only" = visible seulement pour les lecteurs d'écran
          - Pourquoi sr-only ? Le placeholder fait office d'étiquette visuelle
          - Analogie : C'est comme un étiquetage invisible pour les personnes malvoyantes
          */}
          
          <input
            id="name"
            {/* 
            - id="name" = identifiant unique de ce champ
            - Doit correspondre au htmlFor du label ci-dessus
            */}
            
            name="name"
            {/* 
            - name="name" = nom du champ pour l'envoi au serveur
            - Utilisé aussi par les navigateurs pour l'auto-complétion
            */}
            
            type="text"
            {/* 
            - type="text" = champ de texte libre
            - Autres types : email, password, number, tel, etc.
            */}
            
            required
            {/* 
            - required = champ obligatoire (validation HTML native)
            - Le navigateur empêchera la soumission si vide
            - Analogie : C'est comme un astérisque rouge sur un formulaire papier
            */}
            
            value={name}
            {/* 
            - value={name} = la valeur affichée dans le champ
            - Liée à notre state "name" défini plus haut
            - C'est ce qui fait que React "contrôle" ce champ
            */}
            
            onChange={(e) => setName(e.target.value)}
            {/* 
            Explication ligne par ligne :
            - onChange = événement déclenché quand l'utilisateur tape
            - (e) => = fonction arrow qui reçoit l'événement
            - e.target = l'élément HTML qui a déclenché l'événement (notre input)
            - e.target.value = la nouvelle valeur tapée par l'utilisateur
            - setName(...) = mettre à jour notre state avec cette nouvelle valeur
            Analogie : À chaque fois que l'utilisateur tape, on met à jour notre "ardoise mémoire"
            */}
            
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            {/* 
            Explication détaillée des classes Tailwind (style visuel) :
            - relative = positionnement relatif
            - block = affichage en bloc (prend toute la largeur)
            - w-full = largeur 100%
            - appearance-none = enlever le style par défaut du navigateur
            - rounded-md = coins arrondis moyens
            - border border-gray-300 = bordure grise claire
            - px-3 py-2 = padding horizontal 3, vertical 2
            - text-gray-900 = texte gris très foncé (presque noir)
            - placeholder-gray-500 = texte du placeholder gris moyen
            - focus:z-10 = z-index 10 quand le champ a le focus
            - focus:border-blue-500 = bordure bleue quand focus
            - focus:outline-none = enlever l'outline par défaut
            - focus:ring-blue-500 = anneau bleu autour du champ en focus
            - sm:text-sm = texte petit sur écrans small et plus
            */}
            
            placeholder="Nom complet"
            {/* 
            - placeholder = texte affiché quand le champ est vide
            - Disparaît dès que l'utilisateur commence à taper
            */}
          />
        </div>
        
        {/* ----------------------------------------
            CHAMP 2 : ADRESSE EMAIL
            ---------------------------------------- */}
        <div>
          <label htmlFor="email" className="sr-only">
            Adresse email
          </label>
          {/* Même principe que le label précédent */}
          
          <input
            id="email"
            name="email"
            
            type="email"
            {/* 
            - type="email" = champ spécialement conçu pour les emails
            - Le navigateur va valider automatiquement le format email
            - Sur mobile, affiche un clavier optimisé avec @ et .com
            */}
            
            autoComplete="email"
            {/* 
            - autoComplete="email" = aide les navigateurs/gestionnaires de mots de passe
            - Le navigateur peut proposer des emails déjà saisis ailleurs
            */}
            
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {/* Même logique que pour le nom, mais avec l'état email */}
            
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            {/* Classes identiques pour un style uniforme */}
            
            placeholder="Adresse email"
          />
        </div>
        
        {/* ----------------------------------------
            CHAMP 3 : MOT DE PASSE
            ---------------------------------------- */}
        <div>
          <label htmlFor="password" className="sr-only">
            Mot de passe
          </label>
          
          <input
            id="password"
            name="password"
            
            type="password"
            {/* 
            - type="password" = champ mot de passe
            - Masque automatiquement les caractères saisis (affiche •••••)
            - Plus sécurisé que type="text"
            */}
            
            autoComplete="new-password"
            {/* 
            - autoComplete="new-password" = indique que c'est un NOUVEAU mot de passe
            - Différent de "current-password" (pour la connexion)
            - Aide les gestionnaires de mots de passe à comprendre le contexte
            */}
            
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Mot de passe (min. 6 caractères)"
            {/* 
            - Le placeholder indique les exigences minimales
            - Correspond à notre validation côté client
            */}
          />
        </div>
        
        {/* ----------------------------------------
            CHAMP 4 : CONFIRMATION MOT DE PASSE
            ---------------------------------------- */}
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirmer le mot de passe
          </label>
          
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            {/* Même type que le mot de passe principal */}
            
            autoComplete="new-password"
            {/* Même indication d'auto-complétion */}
            
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            {/* Lié à l'état confirmPassword */}
            
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Confirmer le mot de passe"
          />
        </div>

        {/* ----------------------------------------
            BOUTON DE SOUMISSION DU FORMULAIRE
            ---------------------------------------- */}
        <div>
          <button
            type="submit"
            {/* 
            - type="submit" = indique que ce bouton soumet le formulaire
            - Déclenche automatiquement l'événement onSubmit du <form>
            - Alternative : type="button" (n'affecte pas le formulaire)
            */}
            
            disabled={loading}
            {/* 
            - disabled={loading} = désactiver le bouton si loading est true
            - Empêche l'utilisateur de cliquer plusieurs fois pendant le traitement
            - Analogie : C'est comme "griser" un bouton qui ne doit pas être utilisé
            */}
            
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            {/* 
            Explication détaillée des classes Tailwind :
            - group = permet d'appliquer des styles aux enfants lors du hover
            - relative = positionnement relatif
            - flex = utilise flexbox pour l'alignement
            - w-full = largeur 100%
            - justify-center = centrer le contenu horizontalement
            - rounded-md = coins arrondis moyens
            - border border-transparent = bordure transparente (pour la cohérence)
            - bg-blue-600 = fond bleu moyen
            - py-2 px-4 = padding vertical 2, horizontal 4
            - text-sm = taille de texte petite
            - font-medium = épaisseur de police moyenne
            - text-white = texte blanc (contraste sur fond bleu)
            - hover:bg-blue-700 = fond bleu plus foncé au survol
            - focus:outline-none = pas d'outline par défaut
            - focus:ring-2 focus:ring-blue-500 = anneau bleu en focus
            - focus:ring-offset-2 = décalage de l'anneau
            - disabled:opacity-50 = transparence à 50% si désactivé
            - disabled:cursor-not-allowed = curseur "interdit" si désactivé
            */}
          >
            {loading ? "Création du compte..." : "Créer le compte"}
            {/* 
            Explication de l'affichage conditionnel :
            - {loading ? "..." : "..."} = opérateur ternaire
            - Si loading est true = afficher "Création du compte..."
            - Si loading est false = afficher "Créer le compte"
            - Donne un feedback visuel à l'utilisateur sur l'état du traitement
            */}
          </button>
        </div>
      </form>

      {/* ============================================
          SECTION 3 : SÉPARATEUR VISUEL
          ============================================ */}
      
      <div className="relative">
        {/* 
        Container principal pour le séparateur
        - relative = positionnement relatif (pour les enfants absolute)
        */}
        
        <div className="absolute inset-0 flex items-center">
          {/* 
          - absolute inset-0 = positionner de manière absolue sur toute la surface
          - flex items-center = flexbox avec centrage vertical
          - Ce div contient la ligne de séparation
          */}
          
          <div className="w-full border-t border-gray-300" />
          {/* 
          - w-full = largeur 100%
          - border-t = bordure en haut seulement
          - border-gray-300 = couleur de bordure grise claire
          - Résultat : une ligne horizontale grise
          */}
        </div>
        
        <div className="relative flex justify-center text-sm">
          {/* 
          - relative = par rapport à son conteneur
          - flex justify-center = flexbox centré horizontalement
          - text-sm = texte petit
          - Ce div contient le texte qui "coupe" la ligne
          */}
          
          <span className="px-2 bg-gray-50 text-gray-500">Ou créer un compte avec</span>
          {/* 
          - px-2 = padding horizontal pour espacer du bord
          - bg-gray-50 = fond gris très clair (masque la ligne)
          - text-gray-500 = texte gris moyen
          - Le fond masque visuellement la ligne pour créer l'effet de séparation
          */}
        </div>
      </div>

      {/* ============================================
          SECTION 4 : BOUTONS D'AUTHENTIFICATION OAUTH
          ============================================ */}
      
      <div className="space-y-3">
        {/* 
        Container pour les boutons OAuth
        - space-y-3 = espacement vertical de 3 unités entre les boutons
        */}
        
        {/* ----------------------------------------
            BOUTON GOOGLE
            ---------------------------------------- */}
        <button
          type="button"
          {/* 
          - type="button" = bouton simple (ne soumet pas le formulaire)
          - Différent du bouton submit précédent
          */}
          
          onClick={() => handleProviderSignUp("google")}
          {/* 
          Explication de onClick :
          - onClick = événement déclenché lors du clic
          - () => = fonction arrow sans paramètres
          - handleProviderSignUp("google") = appeler notre fonction avec "google"
          - Les guillemets sont nécessaires car c'est une chaîne de caractères
          */}
          
          disabled={loading}
          {/* Même logique que le bouton principal : désactiver pendant le chargement */}
          
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          {/* 
          Explication des classes spécifiques aux boutons OAuth :
          - inline-flex = flexbox en ligne (au lieu de block)
          - border border-gray-300 = bordure grise (pas transparente)
          - shadow-sm = ombre légère
          - bg-white = fond blanc (pas bleu comme le bouton principal)
          - text-gray-500 = texte gris (pas blanc)
          - hover:bg-gray-50 = fond gris très clair au survol
          - Style plus subtil que le bouton principal pour hiérarchiser l'importance
          */}
        >
          <span>Google</span>
          {/* 
          Simple texte "Google"
          Enveloppé dans <span> pour une structure cohérente
          */}
        </button>

        {/* ----------------------------------------
            BOUTON GITHUB
            ---------------------------------------- */}
        <button
          type="button"
          onClick={() => handleProviderSignUp("github")}
          {/* Même principe que Google mais avec "github" */}
          
          disabled={loading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          {/* Classes identiques au bouton Google pour un style cohérent */}
        >
          <span>GitHub</span>
        </button>
      </div>
    </div>
  )
  // Fin du return (fin de l'interface utilisateur)
}
// Fin du composant SignUpForm
```

## Étape 12 : Composant de navigation - La barre de menu de votre application

### Qu'est-ce qu'un composant de navigation ?
**Analogie simple :** C'est comme la barre de menu d'un site web - elle contient le logo, les liens vers les différentes pages, et les boutons de connexion/déconnexion.

### Localisation du fichier
**Où créer ce fichier ?**
- Chemin exact : `components/Navigation.tsx`
- **Pourquoi dans `components/` ?** → C'est un composant réutilisable qui sera affiché sur toutes les pages
- **Pourquoi pas d'emboîtement dans un sous-dossier ?** → C'est un composant global, pas spécifique à l'auth

### Code complet avec explications exhaustives

```typescript
// ============================================
// IMPORTATIONS NÉCESSAIRES
// ============================================
import Link from "next/link"
// Explication : Link = composant Next.js pour la navigation optimisée
// Différence avec <a> classique :
// - Link precharge les pages en arrière-plan
// - Navigation côté client (plus rapide)
// - Gestion automatique de l'historique du navigateur
// Analogie : C'est comme un ascenseur express qui va directement au bon étage

import AuthButton from "@/components/auth/AuthButton"
// Explication : AuthButton = notre composant personnalisé pour l'authentification
// Il va afficher différents boutons selon que l'utilisateur est connecté ou non
// @/components = chemin absolu depuis la racine (défini dans tsconfig.json)

// ============================================
// FONCTION PRINCIPALE DU COMPOSANT
// ============================================
export default function Navigation() {
  // Explication : 
  // - export default = rendre ce composant disponible pour import ailleurs
  // - Navigation = nom du composant en PascalCase
  // - Ce composant n'a pas de props = pas de paramètres d'entrée
  // - Analogie : C'est comme une fonction qui ne prend pas de paramètres

  // ============================================
  // INTERFACE UTILISATEUR (JSX/HTML)
  // ============================================
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* 
      Explication de <header> :
      - <header> = élément HTML sémantique pour l'en-tête de page
      - Meilleur pour l'accessibilité et le SEO qu'un simple <div>
      - Les lecteurs d'écran comprennent que c'est la zone de navigation
      
      Classes Tailwind expliquées :
      - bg-white = fond blanc
      - shadow-sm = ombre légère pour donner de la profondeur
      - border-b = bordure en bas seulement
      - border-gray-200 = couleur de bordure grise très claire
      Résultat : une barre blanche avec une ombre et une fine ligne en bas
      */}
      
      <nav className="container mx-auto px-4 py-4">
        {/* 
        Explication de <nav> :
        - <nav> = élément HTML sémantique pour la navigation
        - Indique aux lecteurs d'écran et moteurs de recherche le rôle de cette zone
        
        Classes Tailwind expliquées :
        - container = largeur maximale adaptative selon la taille d'écran
        - mx-auto = marges horizontales automatiques (centrage)
        - px-4 = padding horizontal de 4 unités
        - py-4 = padding vertical de 4 unités
        Résultat : contenu centré avec des espacements internes
        */}
        
        <div className="flex items-center justify-between">
          {/* 
          Container principal pour organiser le contenu en ligne
          - flex = utiliser flexbox pour l'alignement
          - items-center = alignement vertical centré
          - justify-between = répartir l'espace entre les éléments
          Résultat : logo/menu à gauche, boutons auth à droite
          */}
          
          {/* ============================================
              SECTION GAUCHE : LOGO ET NAVIGATION PRINCIPALE
              ============================================ */}
          <div className="flex items-center space-x-8">
            {/* 
            Container pour regrouper logo et liens de navigation
            - flex items-center = alignement horizontal et vertical centré
            - space-x-8 = espacement horizontal de 8 unités entre les enfants
            */}
            
            {/* ----------------------------------------
                LOGO DE L'APPLICATION
                ---------------------------------------- */}
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {/* 
              Explication du Link vers la page d'accueil :
              - href="/" = lien vers la racine du site (page d'accueil)
              - className avec plusieurs classes Tailwind :
                * text-xl = taille de texte extra-large
                * font-bold = police en gras
                * text-gray-900 = couleur gris très foncé (presque noir)
                * hover:text-blue-600 = couleur bleue au survol de la souris
                * transition-colors = animation douce lors du changement de couleur
              Résultat : un titre cliquable qui devient bleu au survol
              */}
              Mon Application
            </Link>
            
            {/* ----------------------------------------
                MENU DE NAVIGATION PRINCIPAL
                ---------------------------------------- */}
            <div className="hidden md:flex space-x-6">
              {/* 
              Container pour les liens de navigation
              - hidden = caché par défaut (écrans petits/mobiles)
              - md:flex = visible en flex sur écrans moyens et plus grands
              - space-x-6 = espacement de 6 unités entre les liens
              Résultat : menu responsive qui s'affiche seulement sur desktop
              */}
              
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {/* 
                Lien vers l'accueil
                - text-gray-600 = gris moyen (moins proéminent que le logo)
                - hover:text-gray-900 = gris foncé au survol
                - transition-colors = animation douce
                Style plus discret que le logo pour hiérarchiser l'information
                */}
                Accueil
              </Link>
              
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {/* 
                Lien vers la page des produits
                - href="/products" = URL de la page des produits
                - Mêmes styles que le lien Accueil pour la cohérence
                */}
                Produits
              </Link>
              
              <Link 
                href="/api-docs" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {/* 
                Lien vers la documentation API
                - href="/api-docs" = URL de la documentation Swagger
                - Utile pour les développeurs qui utilisent votre API
                */}
                API Docs
              </Link>
            </div>
          </div>
          
          {/* ============================================
              SECTION DROITE : BOUTONS D'AUTHENTIFICATION
              ============================================ */}
          <AuthButton />
          {/* 
          Explication :
          - <AuthButton /> = notre composant personnalisé d'authentification
          - Il va afficher différents contenus selon l'état de l'utilisateur :
            * Si pas connecté : boutons "Connexion" et "Inscription"
            * Si connecté : nom de l'utilisateur et bouton "Déconnexion"
          - Ce composant sera créé dans une étape suivante
          - Analogie : C'est comme un panneau d'affichage intelligent qui change automatiquement
          */}
        </div>
      </nav>
    </header>
  )
}

// ============================================
// RÉSUMÉ DE CE QUE FAIT CE COMPOSANT
// ============================================
/*
Structure finale de la navigation :

┌─────────────────────────────────────────────────────────────────────┐
│ [Mon Application]  [Accueil] [Produits] [API Docs]    [Auth Buttons] │
└─────────────────────────────────────────────────────────────────────┘

Fonctionnalités :
1. Logo cliquable qui ramène à l'accueil
2. Menu de navigation responsive (caché sur mobile)
3. Liens optimisés Next.js avec preloading
4. Composant d'authentification qui s'adapte à l'état de l'utilisateur
5. Design cohérent avec des transitions fluides
6. Accessible aux lecteurs d'écran (éléments sémantiques)
*/
```

## Étape 13 : Mise à jour du layout principal - L'ossature de votre application

### Qu'est-ce que le layout principal (RootLayout) ?
**Analogie simple :** C'est comme la structure d'une maison - les fondations, les murs porteurs et le toit qui restent identiques dans toutes les pièces. Seul le contenu de chaque pièce (page) change.

### Pourquoi modifier le layout existant ?
- **Ajouter l'authentification** → Rendre la session utilisateur accessible partout
- **Intégrer la navigation** → Afficher le menu sur toutes les pages
- **Structurer visuellement** → Header, contenu principal, footer

### Localisation du fichier
**Fichier à modifier :** `app/layout.tsx` (existe déjà dans votre projet)

### Code complet avec explications exhaustives

```typescript
// ============================================
// IMPORTATIONS NÉCESSAIRES
// ============================================
import type { Metadata } from 'next'
// Explication : Metadata = type TypeScript pour définir les métadonnées HTML
// Utilisé pour le title, description, etc. de votre site
// "type" = on importe seulement le type, pas une valeur

import './globals.css'
// Explication : Importation des styles CSS globaux
// Ces styles s'appliqueront à toutes les pages de l'application
// Contient généralement Tailwind CSS et vos styles personnalisés

import { getServerSession } from "next-auth/next"
// Explication : getServerSession = fonction NextAuth pour récupérer la session côté serveur
// Différent de useSession() qui fonctionne côté client
// Permet de savoir qui est connecté avant même d'afficher la page

import { authOptions } from "@/lib/auth"
// Explication : authOptions = configuration d'authentification que nous avons créée
// Contient les providers, callbacks, etc.
// @/lib/auth fait référence au fichier lib/auth.ts

import AuthSessionProvider from "@/components/providers/SessionProvider"
// Explication : AuthSessionProvider = composant wrapper pour NextAuth
// Rend la session disponible à tous les composants enfants via React Context
// Analogie : C'est comme un système de diffusion d'informations dans l'immeuble

import Navigation from "@/components/Navigation"
// Explication : Navigation = notre composant de navigation créé à l'étape précédente
// Va être affiché en haut de chaque page automatiquement

// ============================================
// MÉTADONNÉES DE L'APPLICATION
// ============================================
export const metadata: Metadata = {
  // Explication : export const = exporter une constante
  // Ces métadonnées sont utilisées par Next.js pour générer les balises HTML

  title: 'Mon Application - Avec Authentification',
  // Explication : Titre qui apparaît dans l'onglet du navigateur
  // Important pour le SEO (référencement Google)
  // Peut être surchargé par des pages individuelles

  description: 'Application avec authentification NextAuth.js',
  // Explication : Description utilisée par les moteurs de recherche
  // Apparaît dans les résultats Google sous le titre
  // Limite recommandée : 150-160 caractères
}

// ============================================
// FONCTION PRINCIPALE DU LAYOUT
// ============================================
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Explication ligne par ligne de la déclaration :
  // - export default = fonction par défaut du fichier
  // - async = fonction asynchrone (peut utiliser await)
  // - RootLayout = nom du composant (PascalCase)
  // - { children } = destructuration du paramètre props
  // - children: React.ReactNode = type TypeScript pour tout élément React
  // - children = le contenu des pages qui vont s'afficher dans ce layout
  // Analogie : children = le mobilier qui change dans chaque pièce de la maison

  // ============================================
  // RÉCUPÉRATION DE LA SESSION CÔTÉ SERVEUR
  // ============================================
  const session = await getServerSession(authOptions)
  // Explication ligne par ligne :
  // - const session = déclaration d'une constante
  // - await = attendre le résultat de la fonction asynchrone
  // - getServerSession(authOptions) = récupérer la session avec notre config
  // - Cette opération se fait côté SERVEUR avant d'envoyer la page au navigateur
  // - session contiendra null (pas connecté) ou les infos utilisateur (connecté)
  // Analogie : C'est comme vérifier les papiers d'identité avant d'entrer dans l'immeuble

  // ============================================
  // STRUCTURE HTML DE L'APPLICATION
  // ============================================
  return (
    <html lang="fr">
      {/* 
      Explication de <html> :
      - lang="fr" = indique que le contenu est en français
      - Important pour l'accessibilité (lecteurs d'écran)
      - Utile pour les moteurs de recherche
      - Les outils de traduction automatique comprennent mieux
      */}
      
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* 
        Explication de <body> et ses classes :
        - min-h-screen = hauteur minimale de 100% de la fenêtre (évite les pages trop courtes)
        - bg-gray-50 = fond gris très clair (plus agréable que blanc pur)
        - text-gray-900 = couleur de texte gris très foncé (bon contraste)
        - antialiased = lissage des polices pour un rendu plus net
        */}
        
        <AuthSessionProvider session={session}>
          {/* 
          Explication du AuthSessionProvider :
          - Enveloppe toute l'application pour partager la session
          - session={session} = passe la session récupérée côté serveur
          - Tous les composants enfants pourront accéder à cette session
          - Évite de refaire l'appel d'API sur chaque page
          Analogie : C'est comme installer un système d'interphone dans tout l'immeuble
          */}
          
          <div className="min-h-screen flex flex-col">
            {/* 
            Container principal pour la mise en page en colonnes
            - min-h-screen = hauteur minimale 100% de l'écran
            - flex flex-col = flexbox en colonne (vertical)
            - Permet d'avoir header/main/footer qui s'empilent verticalement
            */}
            
            {/* ============================================
                HEADER : NAVIGATION GLOBALE
                ============================================ */}
            <Navigation />
            {/* 
            Explication :
            - <Navigation /> = notre composant de navigation
            - Sera affiché en haut de TOUTES les pages automatiquement
            - Contient le logo, menu, et boutons d'authentification
            - Analogie : C'est comme le hall d'entrée d'un immeuble
            */}
            
            {/* ============================================
                MAIN : CONTENU PRINCIPAL VARIABLE
                ============================================ */}
            <main className="flex-1 container mx-auto px-4 py-8">
              {/* 
              Container pour le contenu principal de chaque page
              - <main> = élément sémantique HTML pour le contenu principal
              - flex-1 = prendre tout l'espace disponible (pousse le footer en bas)
              - container = largeur maximale responsive
              - mx-auto = centrage horizontal
              - px-4 py-8 = padding horizontal 4, vertical 8
              */}
              
              {children}
              {/* 
              Explication de {children} :
              - children = contenu spécifique à chaque page
              - C'est ici que s'afficheront page.tsx, about/page.tsx, etc.
              - Next.js injecte automatiquement le bon contenu selon l'URL
              Analogie : C'est l'espace personnalisable de chaque appartement
              */}
            </main>
            
            {/* ============================================
                FOOTER : PIED DE PAGE GLOBAL
                ============================================ */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
              {/* 
              Container pour le pied de page
              - <footer> = élément sémantique HTML
              - bg-gray-800 = fond gris foncé
              - text-white = texte blanc (contraste sur fond sombre)
              - py-8 = padding vertical de 8 unités
              - mt-12 = marge top de 12 unités (sépare du contenu)
              */}
              
              <div className="container mx-auto px-4 text-center">
                {/* 
                Contenu centré du footer
                - container mx-auto = largeur limitée et centrée
                - px-4 = padding horizontal
                - text-center = alignement du texte au centre
                */}
                
                <p>&copy; 2024 Mon Application. Tous droits réservés.</p>
                {/* 
                Copyright standard
                - &copy; = symbole © en HTML
                - Information légale basique
                */}
                
                <p className="text-gray-400 text-sm mt-2">
                  {/* 
                  Sous-titre du footer
                  - text-gray-400 = gris clair (moins visible que le texte principal)
                  - text-sm = taille de texte petite
                  - mt-2 = marge top de 2 unités
                  */}
                  Sécurisée avec NextAuth.js
                </p>
              </div>
            </footer>
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}

// ============================================
// RÉSUMÉ DE LA STRUCTURE FINALE
// ============================================
/*
Structure visuelle de l'application :

┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATION                               │ ← Fixe sur toutes les pages
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                    CONTENU PRINCIPAL                            │ ← Variable selon la page
│                        (children)                               │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        FOOTER                                   │ ← Fixe sur toutes les pages
└─────────────────────────────────────────────────────────────────┘

Fonctionnalités apportées :
1. Session d'authentification accessible partout
2. Navigation uniforme sur toutes les pages
3. Structure responsive et accessible
4. Footer informatif
5. Styles cohérents (Tailwind)
6. Métadonnées SEO optimisées
*/
```

## Étape 14 : Pages d'authentification

### Page de connexion

Créez les dossiers et la page de connexion :

```bash
# Créer les dossiers pour les pages d'auth
mkdir -p app/auth/signin
mkdir -p app/auth/signup
```

Créez le fichier `app/auth/signin/page.tsx` :

```typescript
import { Metadata } from "next"
import SignInForm from "@/components/auth/SignInForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Connexion - Mon Application",
  description: "Connectez-vous à votre compte",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
```

### Page d'inscription

Créez le fichier `app/auth/signup/page.tsx` :

```typescript
import { Metadata } from "next"
import SignUpForm from "@/components/auth/SignUpForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Inscription - Mon Application",
  description: "Créez votre compte",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créez votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
```

## Étape 15 : Middleware de protection des routes

Créez le fichier `middleware.ts` à la racine du projet :

```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Pages qui nécessitent une authentification
    const protectedRoutes = [
      "/products/new",
      "/products/.+/edit", // Regex pour /products/123/edit
      "/admin"
    ]
    
    // APIs qui nécessitent une authentification (sauf GET)
    const protectedApiRoutes = [
      "/api/products"
    ]

    // Vérifier si la route courante est protégée
    const isProtectedRoute = protectedRoutes.some(route => {
      const regex = new RegExp(`^${route.replace(/\[.*?\]/g, '[^/]+')}$`)
      return regex.test(pathname)
    })
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Si c'est une route protégée et que l'utilisateur n'est pas connecté
    if (isProtectedRoute && !token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Si c'est une API protégée (POST, PUT, DELETE) et pas de token
    if (isProtectedApiRoute && req.method !== "GET" && !token) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Protection admin pour certaines routes
    const adminOnlyRoutes = ["/admin"]
    const isAdminRoute = adminOnlyRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Configuration des routes à surveiller
export const config = {
  matcher: [
    // Pages protégées
    "/products/new",
    "/products/:id/edit",
    "/admin/:path*",
    // APIs protégées
    "/api/products/:path*"
  ]
}
```

## Étape 16 : Test de l'authentification

Démarrez votre serveur de développement :

```bash
npm run dev
```

Votre application devrait maintenant démarrer sans erreur. Ouvrez votre navigateur et allez sur l'adresse affichée (généralement `http://localhost:3000` ou `http://localhost:3001`).

### Tests à effectuer :

1. **Accueil** : Vérifiez que la navigation affiche "Connexion" et "Inscription"

2. **Inscription** :
   - Allez sur `/auth/signup`
   - Créez un compte avec :
     - Nom : "Test User"
     - Email : "test@example.com"
     - Mot de passe : "test123456"
   - Après inscription, vous devriez être automatiquement connecté

3. **Connexion** :
   - Déconnectez-vous
   - Allez sur `/auth/signin`
   - Connectez-vous avec les identifiants créés

4. **Protection des routes** :
   - Sans connexion, essayez d'aller sur `/products/new`
   - Vous devriez être redirigé vers la page de connexion
   - Après connexion, l'accès devrait être autorisé

## Étape 17 : Protection des APIs existantes (optionnel)

Si vous avez des APIs de produits existantes que vous voulez protéger, ajoutez cette vérification au début de vos fonctions POST, PUT, DELETE :

```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentification requise" },
      { status: 401 }
    )
  }

  // Le reste de votre code existant...
}
```

## Étape 18 : Configuration OAuth (optionnel)

### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez `http://localhost:3000/api/auth/callback/google` aux URIs de redirection autorisées
6. Copiez Client ID et Client Secret dans votre `.env`

### GitHub OAuth

1. Allez sur [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Authorization callback URL : `http://localhost:3000/api/auth/callback/github`
4. Copiez App ID et Client Secret dans votre `.env`

## Étape 19 : Débogage et résolution de problèmes

### Problèmes courants :

1. **Erreur "Module not found"** :
   ```bash
   # Réinstallez les dépendances
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Erreur Prisma** :
   ```bash
   # Régénérez le client
   npx prisma generate
   npx prisma db push
   ```

3. **Session non persistante** :
   - Vérifiez que `NEXTAUTH_SECRET` est bien défini
   - Vérifiez que la base de données est accessible

4. **OAuth ne fonctionne pas** :
   - Vérifiez que les variables d'environnement sont correctes
   - Vérifiez les URLs de callback

## Étape 20 : Commit de votre travail

Une fois que tout fonctionne :

```bash
# Ajouter tous les fichiers
git add -A

# Commiter les changements
git commit -m "feat: implement NextAuth.js v4 authentication system

- Add email/password authentication with bcrypt hashing
- Add Google and GitHub OAuth providers
- Add user registration and login pages
- Add protected routes and API endpoints
- Add role-based access control (user/admin)
- Add responsive authentication UI components
- Add session management and middleware protection"

# Pousser la branche (optionnel)
git push origin feature/nextauth-implementation
```

## Félicitations !

Vous venez d'implémenter un système d'authentification complet avec NextAuth.js v4. Votre application dispose maintenant de :

- Authentification multi-fournisseurs (email/mot de passe, Google, GitHub)
- Protection automatique des routes sensibles
- APIs sécurisées avec contrôle d'accès
- Interface utilisateur adaptative
- Gestion des rôles utilisateurs
- Sessions sécurisées

La suite de la documentation se trouve dans les autres fichiers de ce dossier pour les configurations avancées et le débogage.
