// ── CONSTANTS ──
const POCKET_COLORS = [
  '#7C3AED', '#A78BFA', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#06B6D4',
];

const DEFAULT_POCKETS = [
  { id: 'affitto',   name: 'Affitto',      emoji: '🏠', amount: 400, color: '#7C3AED', active: true },
  { id: 'emergenze', name: 'Emergenze',    emoji: '🚨', amount: 250, color: '#EF4444', active: true },
  { id: 'spesa',     name: 'Spesa & Casa', emoji: '🛒', amount: 450, color: '#10B981', active: true },
  { id: 'gaming',    name: 'Gaming',       emoji: '🎮', amount: 150, color: '#F59E0B', active: true },
  { id: 'rossana',   name: 'Rossana',      emoji: '💜', amount: 150, color: '#EC4899', active: true },
];

const DEFAULT_ENTRATE = [
  { id: 'stipendio', name: 'Stipendio', emoji: '💼', amount: 1800, color: '#7C3AED' },
];

// ── STATE ──
function loadState() {
  let entrate;
  const savedList = localStorage.getItem('fx_entrate_list');
  if (savedList) {
    entrate = JSON.parse(savedList);
  } else {
    const oldVal = parseInt(localStorage.getItem('fx_entrate') || '0');
    entrate = oldVal > 0
      ? [{ id: 'stipendio', name: 'Stipendio', emoji: '💼', amount: oldVal, color: '#7C3AED' }]
      : JSON.parse(JSON.stringify(DEFAULT_ENTRATE));
  }

  // Ensure all pockets have the `active` field (migration from older saves)
  const rawPockets = JSON.parse(localStorage.getItem('fx_pockets') || JSON.stringify(DEFAULT_POCKETS));
  const pockets = rawPockets.map(p => ({ active: true, ...p }));

  const partner = JSON.parse(localStorage.getItem('fx_partner') || JSON.stringify({ nameB: '', amtB: 0 }));
  const profile = JSON.parse(localStorage.getItem('fx_profile') || '{}');

  return { pockets, entrate, partner, profile };
}

function saveState() {
  localStorage.setItem('fx_pockets',      JSON.stringify(state.pockets));
  localStorage.setItem('fx_entrate_list', JSON.stringify(state.entrate));
  localStorage.setItem('fx_partner',      JSON.stringify(state.partner));
  localStorage.setItem('fx_profile',      JSON.stringify(state.profile));
}

let state = loadState();
let editingPocketId   = null;
let editingEntrataId  = null;
let selectedPocketColor  = POCKET_COLORS[0];
let selectedEntrataColor = POCKET_COLORS[0];

// ── HELPERS ──
function fmtInt(n) {
  return '€' + Math.round(n).toLocaleString('it-IT');
}

function fmtNum(n) {
  return Math.round(n).toLocaleString('it-IT');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function totalEntrate() {
  return state.entrate.reduce((s, e) => s + e.amount, 0);
}

function totalPockets() {
  // Only count active pockets
  return state.pockets
    .filter(p => p.active !== false)
    .reduce((s, p) => s + p.amount, 0);
}

function profileName() {
  return (state.profile && state.profile.name) ? state.profile.name : 'Tu';
}

// ── RENDER SUMMARY (Home) ──
function renderSummary() {
  const allocEl = document.getElementById('summaryAllocato');
  if (!allocEl) return;

  const income = totalEntrate();
  const alloc  = totalPockets();
  const libero = income - alloc;
  const pct    = income > 0 ? Math.min((alloc / income) * 100, 100) : 0;

  allocEl.textContent = fmtInt(alloc);

  const liberoEl = document.getElementById('summaryLibero');
  liberoEl.textContent = fmtInt(Math.abs(libero));
  liberoEl.style.color = libero < 0 ? '#FCA5A5' : 'inherit';

  document.getElementById('summaryBarFill').style.width  = pct + '%';
  document.getElementById('summaryBarLabel').textContent = Math.round(pct) + '% del reddito allocato';
}

// ── RENDER ENTRATE ──
function renderEntrate() {
  const container = document.getElementById('entrateList');
  if (!container) return;
  const count     = document.getElementById('entrateCount');
  const totalEl   = document.getElementById('entrateTotalNum');

  if (totalEl) totalEl.textContent = fmtNum(totalEntrate());

  if (state.entrate.length === 0) {
    if (count) count.textContent = '';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💰</div>
        <div class="empty-state-text">Nessuna entrata</div>
        <div class="empty-state-sub">Premi + per aggiungere stipendio o altre entrate fisse</div>
      </div>`;
    return;
  }

  if (count) count.textContent = state.entrate.length + (state.entrate.length === 1 ? ' entrata' : ' entrate');

  container.innerHTML = state.entrate.map(e => `
    <div class="pocket-card" onclick="openEntrataModal('${e.id}')">
      <div class="pocket-icon pocket-icon--sm" style="background:${e.color}20;color:${e.color}">${e.emoji}</div>
      <div class="pocket-card-info">
        <div class="pocket-card-name">${e.name}</div>
        <div class="pocket-card-sub">Entrata mensile</div>
      </div>
      <span class="pocket-card-amount--inline">${fmtInt(e.amount)}</span>
      <span class="material-symbols-outlined pocket-card-chevron">chevron_right</span>
    </div>
  `).join('');
}

// ── RENDER POCKETS (tab pocket — con drag handle e toggle) ──
function renderPockets() {
  const container = document.getElementById('pocketsList');
  if (!container) return;
  const count     = document.getElementById('pocketsCount');

  if (state.pockets.length === 0) {
    if (count) count.textContent = 'Gestisci i tuoi budget mensili';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💳</div>
        <div class="empty-state-text">Nessun pocket</div>
        <div class="empty-state-sub">Premi + per creare il tuo primo pocket mensile</div>
      </div>`;
    return;
  }

  const activeCount = state.pockets.filter(p => p.active !== false).length;
  if (count) count.textContent = activeCount + (activeCount === 1 ? ' pocket attivo' : ' pocket attivi');

  const isOff = p => p.active === false;

  container.innerHTML = state.pockets.map((p, idx) => `
    <div class="pocket-card pocket-card--full ${isOff(p) ? 'pocket-card--inactive' : ''}"
         data-id="${p.id}" data-idx="${idx}"
         onclick="openPocketModal('${p.id}')">
      <div class="drag-handle" data-idx="${idx}" onclick="event.stopPropagation()">
        <span class="material-symbols-outlined">drag_indicator</span>
      </div>
      <div class="pocket-icon pocket-icon--lg" style="background:${p.color}20;color:${p.color}">${p.emoji}</div>
      <div class="pocket-card-info">
        <div class="pocket-card-name">${p.name}</div>
        <div class="pocket-card-amount--sub">${fmtInt(p.amount)}</div>
      </div>
      <button class="pocket-toggle ${isOff(p) ? 'pocket-toggle--off' : ''}"
              onclick="togglePocket('${p.id}', event)">
        <div class="pocket-toggle-dot"></div>
      </button>
    </div>
  `).join('');

  initDragHandles();
}

// ── RENDER HOME POCKETS (solo attivi, card compatte) ──
function renderHomePockets() {
  const container = document.getElementById('homePocketsList');
  if (!container) return;

  const active = state.pockets.filter(p => p.active !== false);

  if (active.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:28px 20px">
        <div class="empty-state-icon">💳</div>
        <div class="empty-state-text">Nessun pocket attivo</div>
        <div class="empty-state-sub">Vai su Pocket per crearne o attivarne uno</div>
      </div>`;
    return;
  }

  container.innerHTML = active.map(p => `
    <div class="pocket-card" onclick="openPocketModal('${p.id}')">
      <div class="pocket-icon pocket-icon--sm" style="background:${p.color}20;color:${p.color}">${p.emoji}</div>
      <div class="pocket-card-info">
        <div class="pocket-card-name">${p.name}</div>
        <div class="pocket-card-sub">Budget mensile</div>
      </div>
      <span class="pocket-card-amount--inline">${fmtInt(p.amount)}</span>
      <span class="material-symbols-outlined pocket-card-chevron">chevron_right</span>
    </div>
  `).join('');
}

// ── RENDER DASHBOARD ──
function renderDashboard() {
  const income = totalEntrate();
  const alloc  = totalPockets();
  const libero = income - alloc;

  const activePockets = state.pockets.filter(p => p.active !== false);

  // Hero amounts
  const dashIncome = document.getElementById('dashIncome');
  const dashLibero = document.getElementById('dashLibero');
  if (dashIncome) dashIncome.textContent = fmtInt(income);
  if (dashLibero) {
    dashLibero.textContent = fmtInt(Math.abs(libero));
    dashLibero.style.color = libero < 0 ? '#FCA5A5' : 'inherit';
  }

  // Stacked distribution bar
  const bar = document.getElementById('dashStackedBar');
  if (bar) {
    if (income > 0) {
      const segs = activePockets.map(p => {
        const w = Math.min(100, Math.round((p.amount / income) * 100));
        return `<div style="width:${w}%;background:${p.color};height:100%;flex-shrink:0"></div>`;
      });
      // Libero fills remaining space with flex:1 to avoid rounding gaps
      const libroColor = libero > 0 ? 'rgba(255,255,255,0.15)' : 'transparent';
      segs.push(`<div style="flex:1;background:${libroColor};height:100%"></div>`);
      bar.innerHTML = segs.join('');
    } else {
      bar.innerHTML = '';
    }
  }

  const footer = document.getElementById('dashBarFooter');
  if (footer) footer.textContent = `Distribuzione tra ${activePockets.length} pocket attivi`;

  // Pocket list — only active, sorted by amount descending
  const list = document.getElementById('dashPocketList');
  if (!list) return;

  const sorted = activePockets.slice().sort((a, b) => b.amount - a.amount);

  if (sorted.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:28px 24px">
      <div class="empty-state-icon">💳</div>
      <div class="empty-state-text">Nessun pocket attivo</div>
      <div class="empty-state-sub">Vai su Pocket per crearne o attivarne uno</div>
    </div>`;
    return;
  }

  list.innerHTML = sorted.map(p => {
    const pct = income > 0 ? Math.round((p.amount / income) * 100) : 0;
    return `
      <div class="dash-card">
        <div class="dash-card-top">
          <div class="dash-card-left">
            <div class="dash-dot" style="background:${p.color}"></div>
            <span class="dash-card-name">${p.emoji} ${p.name}</span>
          </div>
          <span class="dash-card-amount">${fmtInt(p.amount)}</span>
        </div>
        <div class="dash-card-bar-row">
          <div class="dash-bar-track">
            <div class="dash-bar-fill" style="width:${pct}%;background:${p.color}"></div>
          </div>
          <span class="dash-pct">${pct}%</span>
        </div>
      </div>`;
  }).join('');
}

// ── RENDER PARTNER ──
function renderPartner() {
  const myName = profileName();
  const amtA   = totalEntrate();
  const nameB  = document.getElementById('partnerNameInputB').value.trim() || 'Partner';
  const amtB   = parseInt(document.getElementById('partnerAmtInputB').value) || 0;
  const total  = amtA + amtB;

  const pctA = total > 0 ? Math.round((amtA / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((amtB / total) * 100) : 0;

  document.getElementById('partnerNameA').textContent   = myName;
  document.getElementById('partnerNameB').textContent   = nameB;
  document.getElementById('partnerPctA').textContent    = pctA + '%';
  document.getElementById('partnerPctB').textContent    = pctB + '%';
  document.getElementById('partnerAmtA').textContent    = fmtInt(amtA);
  document.getElementById('partnerAmtB').textContent    = fmtInt(amtB);
  document.getElementById('partnerBarFill').style.width = pctA + '%';

  const myIncomeEl = document.getElementById('partnerMyIncome');
  if (myIncomeEl) myIncomeEl.value = fmtInt(amtA);

  const example = document.getElementById('partnerExample');
  if (example) {
    if (total > 0) {
      example.innerHTML = `
        <div class="partner-inner-text">
          Per ogni <strong>€100</strong> di spesa comune:<br>
          <strong>${myName} paga €${pctA}</strong> · ${nameB} paga €${pctB}
        </div>`;
    } else {
      example.innerHTML = '';
    }
  }

  state.partner = { nameB, amtB };
  saveState();
}

function loadPartnerInputs() {
  const p = state.partner;
  document.getElementById('partnerNameInputB').value = p.nameB || '';
  document.getElementById('partnerAmtInputB').value  = p.amtB  || '';
  renderPartner();
}

// ── PROFILE ──
function loadProfileInputs() {
  const p = state.profile || {};
  document.getElementById('profileName').value      = p.name      || '';
  document.getElementById('profileBirthdate').value = p.birthdate || '';
  document.getElementById('profileJob').value       = p.job       || '';
  updateProfileHero();
}

function saveProfile() {
  state.profile = {
    name:      document.getElementById('profileName').value.trim(),
    birthdate: document.getElementById('profileBirthdate').value,
    job:       document.getElementById('profileJob').value.trim(),
  };
  saveState();
  updateHeaderAvatar();
  updateProfileHero();
  const nameA = document.getElementById('partnerNameA');
  if (nameA) nameA.textContent = profileName();
}

function updateProfileHero() {
  const name = profileName();
  const heroName = document.getElementById('profileHeroName');
  const heroCircle = document.getElementById('profileAvatarCircle');
  if (heroName) heroName.textContent = name;
  if (heroCircle) heroCircle.textContent = name.charAt(0).toUpperCase();
}

function updateHeaderAvatar() {
  const el = document.getElementById('headerAvatar');
  if (!el) return;
  const name = profileName();
  el.textContent = name.charAt(0).toUpperCase();
}

// ── RENDER ALL ──
function renderAll() {
  renderSummary();
  renderHomePockets();
  renderEntrate();
  renderPockets();
  renderDashboard();
}

// ── NAVIGATION ──
function goTo(page) {
  const inPages = window.location.pathname.includes('/pages/');
  if (page === 'home') {
    window.location.href = inPages ? '../index.html' : 'index.html';
  } else {
    window.location.href = inPages ? page + '.html' : 'pages/' + page + '.html';
  }
}

function goBack() {
  window.history.back();
}

// ── HAMBURGER ──
function openHamburger() {
  document.getElementById('hamburgerMenu').classList.add('open');
}

function closeHamburger() {
  document.getElementById('hamburgerMenu').classList.remove('open');
}

function hamburgerGo(page) {
  closeHamburger();
  goTo(page);
}

// ── COLOR SWATCHES ──
function renderColorSwatches(containerId, currentColor, onSelect) {
  document.getElementById(containerId).innerHTML = POCKET_COLORS.map(c => `
    <button class="color-swatch ${c === currentColor ? 'selected' : ''}"
      style="background:${c}" onclick="${onSelect}('${c}')"></button>
  `).join('');
}

// ── POCKET TOGGLE ──
function togglePocket(id, event) {
  event.stopPropagation();
  const p = state.pockets.find(x => x.id === id);
  if (!p) return;
  p.active = p.active === false ? true : false;
  saveState();
  renderPockets();
  renderHomePockets();
  renderSummary();
  renderDashboard();
}

// ── DRAG TO REORDER POCKETS ──
let dragState = null;

function initDragHandles() {
  const container = document.getElementById('pocketsList');
  if (!container) return;
  container.querySelectorAll('.drag-handle').forEach(handle => {
    const idx = parseInt(handle.dataset.idx);
    handle.addEventListener('touchstart', e => startDrag(e, idx), { passive: false });
  });
}

function startDrag(e, idx) {
  e.stopPropagation();

  const container = document.getElementById('pocketsList');
  const cards = Array.from(container.querySelectorAll('.pocket-card'));
  const card  = cards[idx];
  if (!card) return;

  const rect  = card.getBoundingClientRect();
  const touch = e.touches[0];

  // Ghost element that follows the finger
  const ghost = card.cloneNode(true);
  ghost.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    z-index: 9999;
    opacity: 0.92;
    pointer-events: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    border-radius: 16px;
    transition: none;
    background: #252538;
  `;
  document.body.appendChild(ghost);
  card.classList.add('is-dragging');

  dragState = {
    idx,
    ghost,
    card,
    cards,
    startTouchY: touch.clientY,
    startCardTop: rect.top,
    currentTarget: idx,
  };

  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend',  onDragEnd,  { passive: true  });
}

function onDragMove(e) {
  if (!dragState) return;
  e.preventDefault();

  const touch = e.touches[0];
  const dy    = touch.clientY - dragState.startTouchY;

  // Move ghost
  dragState.ghost.style.top = (dragState.startCardTop + dy) + 'px';

  // Find which slot the finger is over
  let target = dragState.idx;
  dragState.cards.forEach((c, i) => {
    if (i === dragState.idx) return;
    const r = c.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (touch.clientY > mid) target = i;
    else if (touch.clientY < mid && i < dragState.idx) target = Math.min(target, i);
  });
  dragState.currentTarget = target;
}

function onDragEnd() {
  if (!dragState) return;
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('touchend',  onDragEnd);

  dragState.ghost.remove();
  dragState.card.classList.remove('is-dragging');

  const { idx, currentTarget } = dragState;
  dragState = null;

  if (currentTarget !== idx) {
    const moved = state.pockets.splice(idx, 1)[0];
    state.pockets.splice(currentTarget, 0, moved);
    saveState();
    renderAll();
  }
}

// ── POCKET MODAL ──
function openPocketModal(id) {
  editingPocketId = id;
  const p = id ? state.pockets.find(x => x.id === id) : null;

  document.getElementById('pocketModalTitle').textContent  = id ? 'Modifica pocket' : 'Nuovo pocket';
  document.getElementById('pocketEmoji').value             = p ? p.emoji  : '';
  document.getElementById('pocketName').value              = p ? p.name   : '';
  document.getElementById('pocketAmount').value            = p ? p.amount : '';
  document.getElementById('pocketDeleteBtn').style.display = id ? 'block' : 'none';

  selectedPocketColor = p ? p.color : POCKET_COLORS[0];
  renderColorSwatches('pocketColorSwatches', selectedPocketColor, 'selectPocketColor');
  updatePocketPreview();
  document.getElementById('pocketModal').classList.add('open');
}

function closePocketModal() {
  document.getElementById('pocketModal').classList.remove('open');
}

function selectPocketColor(color) {
  selectedPocketColor = color;
  renderColorSwatches('pocketColorSwatches', selectedPocketColor, 'selectPocketColor');
  updatePocketPreview();
}

function updatePocketPreview() {
  const emoji  = document.getElementById('pocketEmoji').value  || '💳';
  const name   = document.getElementById('pocketName').value   || 'Pocket';
  const amount = parseInt(document.getElementById('pocketAmount').value) || 0;
  const icon   = document.getElementById('pocketPreviewIcon');
  icon.textContent      = emoji;
  icon.style.background = selectedPocketColor + '22';
  icon.style.color      = selectedPocketColor;
  document.getElementById('pocketPreviewName').textContent   = name;
  document.getElementById('pocketPreviewAmount').textContent = fmtInt(amount) + ' / mese';
}

function savePocket() {
  const emoji  = document.getElementById('pocketEmoji').value.trim() || '💳';
  const name   = document.getElementById('pocketName').value.trim();
  const amount = parseInt(document.getElementById('pocketAmount').value) || 0;
  if (!name) { alert('Inserisci un nome per il pocket'); return; }

  if (editingPocketId) {
    const p = state.pockets.find(x => x.id === editingPocketId);
    if (p) { p.emoji = emoji; p.name = name; p.amount = amount; p.color = selectedPocketColor; }
  } else {
    state.pockets.push({ id: generateId(), emoji, name, amount, color: selectedPocketColor, active: true });
  }
  saveState();
  closePocketModal();
  renderAll();
}

function deletePocketFromModal() {
  if (!editingPocketId) return;
  if (confirm('Eliminare questo pocket?')) {
    state.pockets = state.pockets.filter(p => p.id !== editingPocketId);
    saveState();
    closePocketModal();
    renderAll();
  }
}

// ── ENTRATA MODAL ──
function openEntrataModal(id) {
  editingEntrataId = id;
  const e = id ? state.entrate.find(x => x.id === id) : null;

  document.getElementById('entrataModalTitle').textContent  = id ? 'Modifica entrata' : 'Nuova entrata';
  document.getElementById('entrataEmoji').value             = e ? e.emoji  : '';
  document.getElementById('entrataName').value              = e ? e.name   : '';
  document.getElementById('entrataAmount').value            = e ? e.amount : '';
  document.getElementById('entrataDeleteBtn').style.display = id ? 'block' : 'none';

  selectedEntrataColor = e ? e.color : POCKET_COLORS[0];
  renderColorSwatches('entrataColorSwatches', selectedEntrataColor, 'selectEntrataColor');
  updateEntrataPreview();
  document.getElementById('entrataModal').classList.add('open');
}

function closeEntrataModal() {
  document.getElementById('entrataModal').classList.remove('open');
}

function selectEntrataColor(color) {
  selectedEntrataColor = color;
  renderColorSwatches('entrataColorSwatches', selectedEntrataColor, 'selectEntrataColor');
  updateEntrataPreview();
}

function updateEntrataPreview() {
  const emoji  = document.getElementById('entrataEmoji').value  || '💼';
  const name   = document.getElementById('entrataName').value   || 'Entrata';
  const amount = parseInt(document.getElementById('entrataAmount').value) || 0;
  const icon   = document.getElementById('entrataPreviewIcon');
  icon.textContent      = emoji;
  icon.style.background = selectedEntrataColor + '22';
  icon.style.color      = selectedEntrataColor;
  document.getElementById('entrataPreviewName').textContent   = name;
  document.getElementById('entrataPreviewAmount').textContent = fmtInt(amount) + ' / mese';
}

function saveEntrata() {
  const emoji  = document.getElementById('entrataEmoji').value.trim() || '💼';
  const name   = document.getElementById('entrataName').value.trim();
  const amount = parseInt(document.getElementById('entrataAmount').value) || 0;
  if (!name) { alert('Inserisci una causale'); return; }

  if (editingEntrataId) {
    const e = state.entrate.find(x => x.id === editingEntrataId);
    if (e) { e.emoji = emoji; e.name = name; e.amount = amount; e.color = selectedEntrataColor; }
  } else {
    state.entrate.push({ id: generateId(), emoji, name, amount, color: selectedEntrataColor });
  }
  saveState();
  closeEntrataModal();
  renderAll();
}

function deleteEntrataFromModal() {
  if (!editingEntrataId) return;
  if (confirm('Eliminare questa entrata?')) {
    state.entrate = state.entrate.filter(e => e.id !== editingEntrataId);
    saveState();
    closeEntrataModal();
    renderAll();
  }
}

// ── SETTINGS ──
function confirmClearAll() {
  if (confirm('Eliminare tutti i dati? Questa azione non può essere annullata.')) {
    state.pockets = [];
    state.entrate = [];
    saveState();
    goTo('home');
  }
}

// ── DRAG TO DISMISS MODALS ──
function setupDragToDismiss(overlayId, closeFunc) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  const sheet  = overlay.querySelector('.modal-sheet');
  const handle = sheet && sheet.querySelector('.modal-handle');
  if (!sheet || !handle) return;

  let startY  = 0;
  let active  = false;

  handle.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    active = true;
    sheet.style.transition  = 'none';
    sheet.style.willChange  = 'transform';
  }, { passive: true });

  handle.addEventListener('touchmove', e => {
    if (!active) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });

  handle.addEventListener('touchend', e => {
    if (!active) return;
    active = false;
    const dy = e.changedTouches[0].clientY - startY;
    sheet.style.transition = 'transform 0.25s ease';
    if (dy > 80) {
      sheet.style.transform = 'translateY(100%)';
      setTimeout(() => {
        closeFunc();
        sheet.style.transform  = '';
        sheet.style.transition = '';
        sheet.style.willChange = '';
      }, 240);
    } else {
      sheet.style.transform = '';
      setTimeout(() => {
        sheet.style.transition = '';
        sheet.style.willChange = '';
      }, 250);
    }
    startY = 0;
  }, { passive: true });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAvatar();

  // Setup modals that exist on this page
  if (document.getElementById('pocketModal')) {
    document.getElementById('pocketModal').addEventListener('click', e => { if (e.target === e.currentTarget) closePocketModal(); });
    setupDragToDismiss('pocketModal', closePocketModal);
  }
  if (document.getElementById('entrataModal')) {
    document.getElementById('entrataModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeEntrataModal(); });
    setupDragToDismiss('entrataModal', closeEntrataModal);
  }
  if (document.getElementById('hamburgerMenu')) {
    document.getElementById('hamburgerMenu').addEventListener('click', e => { if (e.target === e.currentTarget) closeHamburger(); });
    setupDragToDismiss('hamburgerMenu', closeHamburger);
  }

  // Page-specific init
  const page = document.body.dataset.page || 'home';
  if (page === 'home') {
    renderSummary();
    renderHomePockets();
  } else if (page === 'entrate') {
    renderEntrate();
  } else if (page === 'pockets') {
    renderPockets();
  } else if (page === 'dashboard') {
    renderDashboard();
  } else if (page === 'partner') {
    loadPartnerInputs();
  } else if (page === 'profile') {
    loadProfileInputs();
  }
});
