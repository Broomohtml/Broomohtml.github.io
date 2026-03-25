# Finance App — Version Log

---

## Convenzione versioni

| Tipo di modifica | Incremento |
|---|---|
| Fix UI/UX, piccole migliorie, layout | +0.1 (es. 2.0 → 2.1) |
| Nuove feature, nuove sezioni, nuovi sistemi | +1.0 (es. 2.1 → 3.0) |

---

## Come fare il push

```bash
git add .
git commit -m "vX.X — breve descrizione"
git push
```

> Dopo il push ricordati di cambiare lo stato da `⏳ NON PUSHATO` a `✅ PUSHATO` in questo file.

---

## v3.0 — 2026-03-25

**Stato: `✅ PUSHATO`**

### Modifiche

#### Architettura multi-pagina
- L'app era una SPA con tutte le view in `index.html`; ora ogni sezione è una pagina HTML separata
- `index.html` → Home
- `entrate.html` → Entrate
- `pockets.html` → Pocket
- `dashboard.html` → Dashboard
- `partner.html` → Partner
- `profile.html` → Profilo
- `settings.html` → Impostazioni

#### Navigazione
- Sostituita la funzione `showView()` con `goTo(page)` (navigazione tramite `window.location.href`)
- Aggiunta `goBack()` per le pagine secondarie (usa `window.history.back()`)
- Il menu hamburger usa `hamburgerGo(page)` → chiude il menu e naviga

#### `app.js` — init page-aware
- Il `DOMContentLoaded` ora legge `data-page` dal body e inizializza solo i componenti rilevanti
- Le funzioni di render hanno guard `if (!container) return` per essere sicure su ogni pagina

#### Service Worker
- Cache aggiornata: `finance-v6` → `finance-v7`
- Aggiunge alle cache tutte le nuove pagine HTML

---

## v2.1 — 2026-03-24

**Stato: `✅ PUSHATO`**

### Modifiche

#### Icona Home nella navbar
- Cambiata da emoji `🏠` a simbolo unicode `⌂` per allinearsi visivamente a `€` (Entrate) e `▣` (Pocket)

#### Modali — pulsante ✕ per chiudere
- Aggiunto pulsante ✕ in alto a destra in tutti i modali (pocket, entrata, hamburger)
- Il drag-to-dismiss dal handle rimane attivo come alternativa

#### Pocket — Drag to Reorder
- Nella tab Pocket ogni card ha un handle `⠿` sul lato sinistro
- Tieni premuto il handle e trascina per riordinare i pocket
- L'ordine viene salvato e rispecchiato anche nella Home
- Touch-action `none` sul handle per evitare conflitti con lo scroll

#### Pocket — Disattivazione
- Ogni pocket nella tab Pocket ha un pulsante `●/○` sul lato destro
- Tap su `●` → disattiva il pocket (diventa grigio e `○`)
- Pocket inattivi: non compaiono nella Home, non conteggiati in Allocato/Libero/Dashboard
- Tap su `○` → riattiva
- Stato salvato nel campo `active` di ogni pocket in `fx_pockets`

#### Dashboard
- Aggiunto accesso dal menu hamburger (voce "Dashboard")
- Pocket ordinati per percentuale decrescente (es. Affitto 28% → Gaming 8%)
- Solo pocket attivi vengono mostrati e conteggiati

#### Dashboard — top card ristrutturata
- Rimossa la card separata "Entrate mensili totali"
- Nuovo layout: **Entrate** a sinistra · **Libero** a destra (stessa riga, stile summary card)
- Barra stackata colorata sotto la riga

#### Service Worker
- Cache aggiornata: `finance-v5` → `finance-v6`

### Chiave localStorage aggiornata
| Chiave | Contenuto |
|---|---|
| `fx_pockets` | Array pocket — aggiunto campo `active: boolean` |

---

## v2.0 — 2026-03-24

**Stato: `⏳ NON PUSHATO`**

### Modifiche

#### Layout & Scroll
- Body ora è flex column con `overflow: hidden` → header e navbar rimangono fissi, solo il contenuto centrale scrolla
- Rimossa `position: sticky` dall'header e `position: fixed` dalla navbar, ora sono flex children nativi
- Effetto app nativo su iPhone: niente più scroll del footer

#### Home
- Rimossa la sezione "Entrate mensili" con il tasto `+`
- Rinominato "Scarto" → **Libero**
- La summary card ora mostra solo **Allocato** e **Libero** + barra percentuale
- Tap sulla summary card → apre la Dashboard

#### Dashboard (nuova tab)
- Accessibile toccando la summary card nella Home
- Barra stackata colorata con la proporzione di ogni pocket sul reddito
- Lista pocket con barre orizzontali, percentuale e importo

#### Navigazione
- Icona Entrate: `↑` → `€` (monospace)
- Icona Home: `◈` → `🏠`
- Icona Pocket: invariata `▣`

#### Modali — Drag to Dismiss
- Trascinare il handle (linea in cima al modale) verso il basso chiude il modale
- Soglia: 80px di trascinamento → chiude con animazione
- Sotto soglia: il modale torna su con snap

#### Partner
- Rimosso il campo di inserimento del proprio stipendio
- Il reddito personale viene letto automaticamente da `totalEntrate()`
- Il nome viene letto dal Profilo
- Fix iOS zoom: tutti gli input ora hanno `font-size: 16px`

#### Profilo (nuova tab nel menu hamburger)
- Nome, data di nascita, posizione lavorativa
- Il nome inserito qui appare nel tab Partner come "Tu"
- Dati salvati in `localStorage` con chiave `fx_profile`

#### Service Worker
- Cache aggiornata: `finance-v4` → `finance-v5`

### Chiavi localStorage aggiornate
| Chiave | Contenuto |
|---|---|
| `fx_pockets` | Array pocket |
| `fx_entrate_list` | Array entrate |
| `fx_partner` | `{ nameB, amtB }` (rimosso amtA, ora auto) |
| `fx_profile` | `{ name, birthdate, job }` |

---

## v1.0 — 2026-03-23

**Stato: `✅ PUSHATO`**

- Riscrittura completa da zero in dark mode
- Sistema pocket stile Revolut (budget fissi mensili, no transazioni)
- Tab bar: Entrate · Home · Pocket
- Hamburger menu: Partner + Impostazioni
- Partner: calcolo % di contribuzione per spese comuni
- Modali bottom sheet per creare/modificare pocket ed entrate
- Migrazione da vecchio `fx_entrate` (intero) a `fx_entrate_list` (array)
- Service worker `finance-v4` con cache corretta (fix percorsi `/finance-app/`)
- PWA installabile su iPhone via Safari
