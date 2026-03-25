# Finance App — Documentazione

## Link utili
- **App live:** https://broomohtml.github.io
- **Repository:** https://github.com/Broomohtml/Broomohtml.github.io
- **Live Server locale:** http://127.0.0.1:5500

---

## Struttura file

```
finance-app/
│
├── index.html              → Home (root — obbligatorio per PWA)
├── manifest.json           → Configurazione PWA (root)
├── sw.js                   → Service Worker (root)
│
├── pages/                  → Pagine secondarie
│   ├── entrate.html
│   ├── pockets.html
│   ├── dashboard.html
│   ├── partner.html
│   ├── profile.html
│   └── settings.html
│
├── assets/                 → Stili e script
│   ├── app.js              → Tutta la logica (state, render, navigazione)
│   └── style.css           → Stile visivo globale
│
├── Stitch/                 → Design di riferimento
│   ├── home_optimized_layout/
│   ├── entrate_monthly_income/
│   ├── pocket_management/
│   ├── dashboard_analysis/
│   ├── partner_joint_budget_fixed/
│   ├── profilo_user_details/
│   ├── impostazioni_danger_zone/
│   └── design_system/
│
├── _archive/               → File vecchi / non usati
├── DOC.md                  → Documentazione completa
├── README.md               → Guida rapida
└── version.md              → Changelog
```

---

## REGOLA STITCH — DA RISPETTARE SEMPRE

> **Per qualsiasi modifica visiva a una pagina, la fonte di verità è la cartella `Stitch/` corrispondente.**

### Mappatura pagina → cartella Stitch

| Pagina | Cartella Stitch |
|--------|----------------|
| `index.html` | `Stitch/home_optimized_layout/` |
| `entrate.html` | `Stitch/entrate_monthly_income/` |
| `pockets.html` | `Stitch/pocket_management/` |
| `dashboard.html` | `Stitch/dashboard_analysis/` |
| `partner.html` | `Stitch/partner_joint_budget_fixed/` |
| `profile.html` | `Stitch/profilo_user_details/` |
| `settings.html` | `Stitch/impostazioni_danger_zone/` |
| Token/colori globali | `Stitch/design_system/` |

### Cosa fa Claude quando tocca una pagina

1. **Legge `Stitch/<pagina>/code.html`** — è il riferimento visivo assoluto
2. **Estrae layout, classi CSS, struttura HTML** da quel file
3. **Adatta il codice**: sostituisce Tailwind/classi Stitch con le classi del `style.css` del progetto (o aggiunge le classi mancanti)
4. **Collega la logica**: mantiene tutti gli `id`, `onclick`, e funzioni JS esistenti
5. **Non inventa niente visivamente** — il risultato finale deve essere identico a `screen.png` nella stessa cartella

### Cosa NON fa Claude

- Non cambia la logica in `app.js` se non è necessario per il funzionamento della pagina
- Non cambia il look se l'utente non ha chiesto una modifica visiva
- Non usa Tailwind nell'output finale (il progetto usa CSS custom in `style.css`)

---

## Navigazione (multi-page)

L'app è composta da pagine HTML separate. La navigazione avviene con:

```js
goTo('home')       // → index.html
goTo('entrate')    // → entrate.html
goTo('pockets')    // → pockets.html
goTo('dashboard')  // → dashboard.html
goTo('partner')    // → partner.html
goTo('profile')    // → profile.html
goTo('settings')   // → settings.html
goBack()           // → window.history.back()
```

Ogni pagina ha `data-page="<nome>"` sul `<body>` — usato da `app.js` per l'init page-aware.

---

## Dati (localStorage)

| Chiave | Contenuto |
|--------|-----------|
| `fx_pockets` | Array pocket `{ id, name, emoji, amount, color, active }` |
| `fx_entrate_list` | Array entrate `{ id, name, emoji, amount, color }` |
| `fx_partner` | `{ nameB, amtB }` |
| `fx_profile` | `{ name, birthdate, job }` |

---

## Installazione su iPhone

1. Apri **Safari** → `https://broomohtml.github.io`
2. Tocca **Condividi** → **Aggiungi a schermata Home**
3. L'icona si aggiorna ad ogni push, non serve reinstallare

---

## Come pubblicare

```bash
git add .
git commit -m "vX.X — descrizione"
git push
```

Poi aggiorna `version.md`: cambia lo stato da `⏳ NON PUSHATO` a `✅ PUSHATO`.
