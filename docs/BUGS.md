# Bug noti — Finance App

## BUG-01 — Nav position sbagliata al lancio della PWA

**Stato**: risolto con splash screen (workaround UX, non fix tecnico)

**Sintomo**: quando la PWA si apre dalla schermata Home, la nav appare troppo alta con una banda scura visibile sotto. Dopo un tocco fisico si sposta nella posizione corretta.

**Causa root**: iOS non assesta il viewport al lancio — né con timeout, né con touch sintetici. Il viewport si finalizza solo al primo gesto fisico reale dell'utente.

**Cosa abbiamo provato e perché non funzionava**:

| Tentativo | Problema |
|---|---|
| `body { overflow: hidden }` + nav flex child | Nav relativa al body (più corto dello schermo), gap visibile |
| `position: fixed; bottom: env(safe-area-inset-bottom)` dentro `overflow:hidden` body | iOS: fixed relativo al body, non al viewport |
| `overflow: clip` sul body | Identico a `overflow: hidden` su iOS WebKit |
| `overscroll-behavior: none` | Bloccava anche lo scroll interno alla lista |
| `height: 100dvh` diretto | dvh non assestato al lancio su iOS PWA |
| `body { position: fixed; inset: 0 }` | Rompeva il layout generale |
| Splash con timeout fisso (650ms) + `setAppHeight()` | visualViewport.height ancora sbagliato dopo 650ms |
| Touch sintetici (`dispatchEvent(new TouchEvent(...))`) | iOS li ignora, non triggera il ricalcolo viewport |

**Soluzione adottata (v4.2.0)**:
- Splash screen con "Scorri verso il basso per aprire"
- Il gesto di swipe è un tocco fisico reale → iOS assesta il viewport
- `setAppHeight()` viene chiamata subito dopo lo swipe → `--app-height` corretto
- L'utente non vede mai il layout "rotto"
- `touchmove` sulla splash ha `preventDefault()` per evitare che il body rubber-bandi durante lo swipe

**Nota tecnica**: la causa non era il *tempo* ma la *mancanza di interazione fisica*. iOS trattiene il ricalcolo del viewport finché l'utente non tocca realmente lo schermo — nessun approccio programmatico può sostituirlo.

---

## BUG-02 — [template per futuri bug]

**Stato**:
**Sintomo**:
**Causa root**:
**Workaround attuale**:
