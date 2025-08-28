

## 1) Bloc utilitaire (colle une fois dans la console)

```js
// RENSEIGNE ICI TA CLÉ (ou garde "DEMO_KEY" pour tester vite)
const API_KEY = "DEMO_KEY";

// Petits helpers pour des appels concis
const qs = (params = {}) =>
  new URLSearchParams({ api_key: API_KEY, ...params }).toString();

const getJSON = async (url, params = {}) => {
  const res = await fetch(`${url}?${qs(params)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  return res.json();
};

// Affiche joliment des images dans la page depuis la console
const showImages = (urls = []) => {
  const wrap = document.createElement("div");
  wrap.style = "position:fixed;inset:0;overflow:auto;background:#0008;padding:24px;z-index:999999";
  const grid = document.createElement("div");
  grid.style = "display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px";
  urls.forEach(u => { const img = new Image(); img.src = u; img.style = "width:100%;border-radius:12px"; grid.append(img); });
  wrap.append(grid);
  wrap.addEventListener("click", () => wrap.remove());
  document.body.append(wrap);
  console.log("Images affichées (clique le fond pour fermer).");
};
```



## 2) APOD (Astronomy Picture of the Day)

### a) L’image du jour

```js
const apod = await getJSON("https://api.nasa.gov/planetary/apod", { thumbs: true });
console.log(apod); // métadonnées
showImages([apod.hdurl || apod.url || apod.thumbnail_url]);
```

### b) Une date précise (ex. 2024-08-01)

```js
const apod2024 = await getJSON("https://api.nasa.gov/planetary/apod", {
  date: "2024-08-01",
  thumbs: true
});
console.table({ title: apod2024.title, date: apod2024.date, media: apod2024.media_type });
showImages([apod2024.hdurl || apod2024.url || apod2024.thumbnail_url]);
```



## 3) Mars Rover Photos (Curiosity, sol 1000)

```js
const mars = await getJSON("https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos", {
  sol: 1000, // jour martien
  camera: "NAVCAM", // optionnel
  page: 1
});
console.log(`Trouvé ${mars.photos.length} photos`);
console.table(mars.photos.slice(0, 10).map(p => ({
  id: p.id, earth_date: p.earth_date, camera: p.camera.full_name
})));
showImages(mars.photos.slice(0, 24).map(p => p.img_src));
```



## 4) Notes éclair

* Pour passer en **production**, remplace `API_KEY = "DEMO_KEY"` par **ta clé** (évite de l’exposer dans du code public).
* La plupart des navigateurs permettent `await` directement dans la console.
* En cas d’erreur `HTTP 429`, tu as dépassé le quota — réessaie plus tard ou utilise ta clé perso.

