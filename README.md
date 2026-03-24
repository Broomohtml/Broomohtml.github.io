# 💜 Finance App

App PWA personale per gestire entrate, uscite e spese condivise.

## 🚀 Come avviarla in locale (VS Code)

1. Apri la cartella `finance-app` in VS Code
2. Installa l'estensione **Live Server** (Ritwick Dey)
3. Click destro su `index.html` → **Open with Live Server**
4. L'app si apre nel browser → premi `F12` e clicca l'icona 📱 per vedere la versione mobile

---

## 📱 Come installarla su iPhone

### 1. Carica su GitHub Pages (gratis)
1. Crea un account su [github.com](https://github.com)
2. Crea un nuovo repository (es. `finance-app`)
3. Carica tutti i file della cartella
4. Vai in **Settings → Pages → Source: main branch**
5. GitHub ti darà un link tipo: `https://tuonome.github.io/finance-app`

### 2. Installa su iPhone
1. Apri Safari sul tuo iPhone
2. Vai al link GitHub Pages
3. Tocca il pulsante **Condividi** (quadrato con freccia su)
4. Scorri e tocca **"Aggiungi a schermata Home"**
5. ✅ L'app appare come un'icona, si apre a schermo intero!

---

## 🗂️ Struttura file

```
finance-app/
├── index.html      → Struttura e layout dell'app
├── style.css       → Stile visivo (viola, minimale)
├── app.js          → Tutta la logica e i dati
├── manifest.json   → Configurazione PWA
├── sw.js           → Service Worker (funziona offline)
└── README.md       → Queste istruzioni
```

---

## ✏️ Come modificare le categorie

Apri `app.js` e modifica l'array `DEFAULT_CATEGORIES` in cima al file:

```js
const DEFAULT_CATEGORIES = [
  { id: 'affitto', name: 'Affitto', emoji: '🏠', budget: 400 },
  // aggiungi o modifica qui...
];
```

## 💰 Come modificare stipendio/risparmi

Sempre in `app.js`, cerca:
```js
cashflow: JSON.parse(localStorage.getItem('fx_cashflow') || JSON.stringify({ entrate: 1800, risparmi: 1400 })),
```

## 👥 Come modificare la divisione partner

```js
const PARTNER_CONFIG = { bruno: 0.9, rossana: 0.1 };
// Bruno = 90%, Rossana = 10%
```

---

## 📦 Tecnologie usate

- HTML / CSS / JavaScript puro
- Chart.js (grafici)
- Font: DM Sans + DM Mono (Google Fonts)
- Service Worker (offline)
- localStorage (dati salvati sul dispositivo)
