## **Contexte**

Cette partie de code affiche une liste de produits (`products`).
Chaque produit est représenté par un élément `<li>` qui contient :

1. Le nom du produit (cliquable, lien vers sa page)
2. Son prix
3. Un bouton pour modifier
4. Un bouton pour supprimer

---

## **Explication ligne par ligne**

```jsx
{products.map((p) => (
```

* **`products`** : c’est un tableau d’objets (chaque objet est un produit avec `id`, `name`, `price`, etc.).
* **`.map()`** : c’est une méthode JavaScript qui **parcourt un tableau** et **retourne un nouveau tableau**.
  Ici, pour chaque produit `p`, on retourne un élément JSX `<li>...</li>` qui sera affiché à l’écran.
* Les **parenthèses** après `=>` signifient qu’on retourne directement du JSX (pas besoin d’écrire `return`).

---

```jsx
<li key={p.id} className="flex items-center justify-between border p-3 rounded">
```

* `<li>` : élément de liste HTML.
* **`key={p.id}`** : en React, la prop `key` est **obligatoire** quand on génère une liste.
  Elle sert à identifier chaque élément de manière unique pour optimiser le rendu.
* **`className="..."`** : classes TailwindCSS pour mettre en forme l’élément (`flex`, `border`, `padding`, etc.).

---

```jsx
<div>
  <Link className="font-medium underline" href={`/products/${p.id}`}>{p.name}</Link>
  <div className="text-sm text-gray-600">{p.price.toFixed(2)} $</div>
</div>
```

* Premier bloc `<div>` :

  * **Nom du produit** : affiché dans un lien `<Link>` qui mène à la page `/products/{id}`.
  * **Prix** : affiché avec deux décimales (`p.price.toFixed(2)`) suivi du symbole `$`.

---

```jsx
<div className="flex items-center gap-3">
  <Link className="underline" href={`/products/${p.id}/edit`}>Modifier</Link>
  <button onClick={() => handleDelete(p.id)} className="text-red-700">Supprimer</button>
</div>
```

* Deuxième bloc `<div>` : les **actions** sur le produit.

  * **Modifier** : lien vers `/products/{id}/edit`.
  * **Supprimer** : bouton qui appelle `handleDelete(p.id)` quand on clique dessus (avec l’`id` du produit).

---

```jsx
</li>
))}
```

* Fermeture du `<li>` et fin de la boucle `.map()`.
* Chaque produit du tableau devient **un élément de liste complet** dans le DOM.

---

## **Simple**

> "On parcourt le tableau `products` avec `.map()`.
> Pour chaque produit `p`, on crée un élément `<li>` avec :
>
> * Son nom cliquable
> * Son prix
> * Un lien pour modifier
> * Un bouton pour supprimer
>   React a besoin d’une `key` unique (`p.id`) pour suivre les éléments."



