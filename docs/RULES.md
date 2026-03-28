# Finance App — Regole di sviluppo

## Design

- **Reference visivo**: Revolut dark. Per ogni dubbio di design, chiediti "come lo farebbe Revolut?"
- **Tema**: sempre dark, mai light mode
- **Colore primario**: viola (`#7B2FFF`) con varianti `--violet-2` e `--violet-3`
- **Layout**: edge-to-edge iOS — lo sfondo va dietro la Dynamic Island, gli elementi UI stanno sotto di essa
- **Font**: `Inter` per testi, `DM Mono` solo per numeri e importi
- **Cartella Stitch**: ignorata completamente, non è più la fonte di verità

## Token CSS

Usare sempre le variabili definite in `:root` in `assets/style.css`. Non inventare colori o valori inline.

```
--bg / --surface-1 / --surface-2 / --surface-3
--violet / --violet-2 / --violet-3 / --violet-soft / --violet-glow
--text-1 / --text-2 / --text-3
--border
--r-sm / --r-md / --r-lg / --r-xl
```

## Architettura

- **Multi-page HTML**: ogni pagina è un file `.html` separato. Niente SPA, niente routing JS.
- **Nav e header**: scritti inline in ogni pagina (no JS injection). La consistenza è garantita dal CSS condiviso.
- **`assets/style.css`**: unico file CSS globale. Nessun CSS inline nelle pagine eccetto colori dinamici passati da JS.
- **`assets/app.js`**: non toccare mai le funzioni JS. Il design cambia solo HTML e CSS.

## Layout iOS

- `body`: `height: 100dvh; display: flex; flex-direction: column; overflow: hidden`
- `.main-content`: `flex: 1; overflow-y: auto`
- `.bottom-nav`: flex child del body (NON `position: fixed`), `margin-bottom: max(12px, env(safe-area-inset-bottom))`
- `.app-header`: `padding-top: calc(env(safe-area-inset-top, 0px) + 12px)` per stare sotto la Dynamic Island
- `.modal-sheet`: `padding-bottom: max(32px, env(safe-area-inset-bottom))`, `max-height: 92dvh`

## Versionamento

- **Formato**: `major.minor.patch` — es. `v3.5.3`
- **Patch** (`.patch`): fix visivi minori, correzioni bug
- **Minor** (`.minor`): nuove feature o pagine complete
- **Major**: redesign completo o cambio architettura
- La versione è mostrata in `pages/profile.html` come `Finance vX.X.X`
- Ogni push aggiorna il numero di versione e il cache SW (`finance-vN`)

## Workflow

- **Test sempre su device reale** via push su GitHub. L'inspect > mobile del browser non rispecchia Safari iOS.
- **Una pagina alla volta**: si completa e si perfeziona una pagina prima di passare alla prossima.
- **Ordine pagine**: Home → Entrate → Pockets → Dashboard → Partner → Profile → Settings
- **Push frequente**: ogni modifica visiva significativa va pushata per testare su iPhone.

## Componenti condivisi

Questi elementi devono essere **identici** su tutte le pagine:

| Componente | Classe CSS | Note |
|---|---|---|
| Header | `.app-header` | menu + titolo + avatar |
| Nav bottom | `.bottom-nav` + `.nav-item` | 3 tab: Entrate, Home, Pocket |
| Cards | `.pocket-card` | struttura identica ovunque |
| Modali | `.modal-overlay` + `.modal-sheet` | stesso stile su tutte le pagine |
| Hamburger | `.hamburger-items` | stesso menu su tutte le pagine |

## Archivio versioni

- Le versioni precedenti vengono archiviate in cartelle `version_X_X_X/`
- Queste cartelle sono in `.gitignore` e non vengono pushate
- Attuale: `version_1_0_0/` contiene il vecchio design pre-v3.5.3

## Cosa NON fare

- Non usare `position: fixed` sul nav (causa bug di posizionamento su iOS Safari)
- Non usare `min-height: -webkit-fill-available` (inconsistente tra pagine)
- Non inventare nuovi componenti per ogni pagina — riusare quelli esistenti
- Non modificare `assets/app.js` per ragioni di design
- Non testare solo su desktop — pushare e verificare su iPhone
