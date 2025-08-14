```js
 {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && products.length === 0 && (
        <p>Aucun produit.</p>
      )}
```

Il faut comprendre deux choses :

1. **Le sens du `&&` en JavaScript pur**
2. **Comment React l’utilise pour afficher conditionnellement**

---

## **1. En JavaScript pur**

Le `&&` est l’opérateur **ET logique**.
Il fonctionne comme en maths : il est **vrai** uniquement si les deux conditions sont vraies.

```js
true && true   // true
true && false  // false
false && true  // false
false && false // false
```

Mais en JavaScript, il retourne **la première valeur fausse** rencontrée, ou la dernière si tout est vrai.

Exemples :

```js
"Bonjour" && 123     // 123
false && "Salut"     // false
true && "Salut"      // "Salut"
```

---

## **2. En React**

Dans JSX, on exploite ce comportement :

* Si la condition est **faux**, React n’affiche rien.
* Si la condition est **vrai**, React affiche ce qu’il y a après.

```jsx
{isLoggedIn && <p>Bienvenue !</p>}
```

* Si `isLoggedIn` est `true` → `<p>Bienvenue !</p>` s’affiche.
* Si `isLoggedIn` est `false` → rien ne s’affiche.

---

## **3. Simplement**

Tu peux utiliser cette phrase :

> **"En React, `condition && élément` veut dire : Si la condition est vraie, on affiche l’élément. Sinon, on n’affiche rien."**

Et leur montrer **un mini schéma de vérité** :

| Condition | Résultat affiché    |
| --------- | ------------------- |
| true      | élément (affiché)   |
| false     | rien (affiche vide) |



<br/>


# Enchaîner ?

En React, tu peux enchaîner plusieurs conditions avec `&&` **avant** l’affichage.
Ça veut dire : *toutes les conditions doivent être vraies pour que l’élément s’affiche*.

---

### Exemple

```jsx
{isLoggedIn && hasPermission && <p>Bienvenue dans l’espace admin</p>}
```

**Explication :**

* **Si** `isLoggedIn` est vrai **et** `hasPermission` est vrai → le texte s’affiche.
* **Sinon** → rien ne s’affiche.

---

### Cas avec trois conditions

```jsx
{isLoggedIn && hasPermission && !isBanned && <p>Bienvenue dans l’espace admin</p>}
```

* L’utilisateur doit :

  1. Être connecté (`isLoggedIn`)
  2. Avoir la permission (`hasPermission`)
  3. Ne pas être banni (`!isBanned`)
* Si **une seule** de ces conditions est fausse → rien ne s’affiche.

---

💡 **Simple** :

> On met plusieurs conditions séparées par `&&`.
> Si elles sont toutes vraies, React affiche le contenu.
> Si une seule est fausse, React n’affiche rien.



