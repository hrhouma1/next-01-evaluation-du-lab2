
```js
// Remplace par ta clé si besoin
const API_KEY = "txti6hU1UXKukjaC1i6XvBYgQ2EF873pTz3y0oDV";

// Appel simple : Astronomy Picture of the Day
fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log("Titre :", data.title);
    console.log("URL :", data.url);
    console.log("Date :", data.date);
    console.log("Explication :", data.explanation);
  })
  .catch(err => console.error("Erreur :", err));
```

Ce code affiche dans la console les informations principales de l’image du jour de la NASA.
