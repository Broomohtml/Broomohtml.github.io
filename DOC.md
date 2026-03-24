<!--
COMANDI PER PUBBLICARE UNA NUOVA VERSIONE:
  git add .
  git commit -m "New UI and UX"
  git push
-->

# 💜 Finance App — Documentazione Progetto

## 🔗 Link utili
- **App live:** https://broomohtml.github.io
- **Repository GitHub:** https://github.com/Broomohtml/Broomohtml.github.io
- **Live Server locale:** http://127.0.0.1:5500

---

## 📱 Come installare su iPhone
1. Apri **Safari** (non Chrome)
2. Vai su `https://broomohtml.github.io`
3. Tocca il pulsante **Condividi** (quadrato con freccia ↑)
4. Tocca **"Aggiungi a schermata Home"**
5. Nome: **Finance** → Aggiungi

> ✅ L'icona sulla home si aggiorna automaticamente ad ogni push. Non serve reinstallarla.

---

## 🗂️ Struttura file

```
finance-app/
├── index.html       → Struttura e layout dell'app
├── style.css        → Stile visivo (dark mode, viola)
├── app.js           → Tutta la logica e i dati
├── manifest.json    → Configurazione PWA
├── sw.js            → Service Worker (funziona offline)
└── DOC.md           → Questo file
```

---

## 📌 Cos'è questa app

Un **budget planner mensile** ispirato ai pocket di Revolut.
Non traccia transazioni precise: serve solo a vedere come viene diviso lo stipendio ogni mese tra voci fisse (affitto, cibo, gaming, ecc.).

---

## ✏️ Modifiche comuni

### Cambiare i pocket di default
In `app.js`, modifica l'array in cima al file:
```js
const DEFAULT_POCKETS = [
  { id: 'affitto', name: 'Affitto', emoji: '🏠', amount: 400, color: '#7C3AED' },
  { id: 'emergenze', name: 'Emergenze', emoji: '🚨', amount: 250, color: '#EF4444' },
  ...
];
```

### Cambiare lo stipendio di default
In `app.js`, cerca:
```js
entrate: parseInt(localStorage.getItem('fx_entrate') || '1800'),
```
Cambia `1800` con il tuo importo.

### Cambiare colore principale
In `style.css`, cerca:
```css
--violet: #7C3AED;
```

---

## 🎨 Scelte estetiche
- **Font:** DM Sans + DM Mono
- **Tema:** Dark mode (sfondo `#0D0D14`)
- **Colore principale:** Viola `#7C3AED`
- **Valuta:** Euro €

---

## 💾 Come funzionano i dati
I dati sono salvati nel **localStorage** del telefono/browser:
- ✅ Funziona offline
- ✅ Nessun server necessario
- ⚠️ I dati sono legati al dispositivo (non sincronizzati tra telefono e PC)

Chiavi localStorage usate:
| Chiave | Contenuto |
|---|---|
| `fx_pockets` | Array dei pocket con nome, emoji, importo, colore |
| `fx_entrate` | Importo mensile delle entrate (intero) |

---

## 🚀 Sezioni dell'app
| Sezione | Descrizione |
|---|---|
| ◈ Pocket | Riepilogo entrate/allocato/scarto + lista pocket |
| ⚙ Impostazioni | Modifica stipendio, elimina tutti i pocket |

---

## 🛠️ Tecnologie usate
- HTML / CSS / JavaScript puro
- Font: DM Sans + DM Mono (Google Fonts)
- Service Worker (offline, cache `finance-v3`)
- localStorage (dati salvati sul dispositivo)
- GitHub Pages (hosting gratuito)
