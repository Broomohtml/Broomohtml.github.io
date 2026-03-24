// ── CONSTANTS ──
const POCKET_COLORS = [
  '#7C3AED', '#A78BFA', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#06B6D4',
];

const DEFAULT_POCKETS = [
  { id: 'affitto',   name: 'Affitto',      emoji: '🏠', amount: 400, color: '#7C3AED' },
  { id: 'emergenze', name: 'Emergenze',    emoji: '🚨', amount: 250, color: '#EF4444' },
  { id: 'spesa',     name: 'Spesa & Casa', emoji: '🛒', amount: 450, color: '#10B981' },
  { id: 'gaming',    name: 'Gaming',       emoji: '🎮', amount: 150, color: '#F59E0B' },
  { id: 'rossana',   name: 'Rossana',      emoji: '💜', amount: 150, color: '#EC4899' },
];

const DEFAULT_ENTRATE = [
  { id: 'stipendio', name: 'Stipendio', emoji: '💼', amount: 1800, color: '#7C3AED' },
];

// ── STATE ──
function loadState() {
  // Migrazione: se esiste il vecchio fx_entrate (intero) lo converte
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

  const partner = JSON.parse(localStorage.getItem('fx_partner') || JSON.stringify({ nameA: '', amtA: 0, nameB: '', amtB: 0 }));

  return {
    pockets: JSON.parse(localStorage.getItem('fx_pockets') || JSON.stringify(DEFAULT_POCKETS)),
    entrate,
    partner,
  };
}

function saveState() {
  localStorage.setItem('fx_pockets',      JSON.stringify(state.pockets));
  localStorage.setItem('fx_entrate_list', JSON.stringify(state.entrate));
  localStorage.setItem('fx_partner',      JSON.stringify(state.partner));
}

let state = loadState();
let currentView = 'home';
let editingPocketId   = null;
let editingEntrataId  = null;
let selectedPocketColor  = POCKET_COLORS[0];
let selectedEntrataColor = POCKET_COLORS[0];

// ── HELPERS ──
function fmtInt(n) {
  return '€' + Math.round(n).toLocaleString('it-IT');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function totalEntrate() {
  return state.entrate.reduce((s, e) => s + e.amount, 0);
}

function totalPockets() {
  return state.pockets.reduce((s, p) => s + p.amount, 0);
}

// ── RENDER SUMMARY (Home) ──
function renderSummary() {
  const income = totalEntrate();
  const alloc  = totalPockets();
  const scarto = income - alloc;
  const pct    = income > 0 ? Math.min((alloc / income) * 100, 100) : 0;

  document.getElementById('summaryIncome').textContent  = fmtInt(income);
  document.getElementById('summaryAllocato').textContent = fmtInt(alloc);

  const scartoEl = document.getElementById('summaryScarto');
  scartoEl.textContent   = fmtInt(Math.abs(scarto));
  scartoEl.style.color   = scarto < 0 ? '#FCA5A5' : 'inherit';

  document.getElementById('summaryBarFill').style.width  = pct + '%';
  document.getElementById('summaryBarLabel').textContent = Math.round(pct) + '% del reddito allocato';
}

// ── RENDER ENTRATE ──
function renderEntrate() {
  const container = document.getElementById('entrateList');
  const count     = document.getElementById('entrateCount');

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
      <div class="pocket-icon" style="background:${e.color}22;color:${e.color}">${e.emoji}</div>
      <div class="pocket-card-info">
        <div class="pocket-card-name">${e.name}</div>
      </div>
      <div class="pocket-card-amount">${fmtInt(e.amount)}</div>
      <div class="pocket-card-arrow">›</div>
    </div>
  `).join('');
}

// ── RENDER POCKETS ──
function renderPockets() {
  const container = document.getElementById('pocketsList');
  const count     = document.getElementById('pocketsCount');

  if (state.pockets.length === 0) {
    if (count) count.textContent = '';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💳</div>
        <div class="empty-state-text">Nessun pocket</div>
        <div class="empty-state-sub">Premi + per creare il tuo primo pocket mensile</div>
      </div>`;
    return;
  }

  if (count) count.textContent = state.pockets.length + ' pocket';

  container.innerHTML = state.pockets.map(p => `
    <div class="pocket-card" onclick="openPocketModal('${p.id}')">
      <div class="pocket-icon" style="background:${p.color}22;color:${p.color}">${p.emoji}</div>
      <div class="pocket-card-info">
        <div class="pocket-card-name">${p.name}</div>
      </div>
      <div class="pocket-card-amount">${fmtInt(p.amount)}</div>
      <div class="pocket-card-arrow">›</div>
    </div>
  `).join('');
}

// ── RENDER PARTNER ──
function renderPartner() {
  const nameA = document.getElementById('partnerNameInputA').value.trim() || 'Tu';
  const nameB = document.getElementById('partnerNameInputB').value.trim() || 'Partner';
  const amtA  = parseInt(document.getElementById('partnerAmtInputA').value) || 0;
  const amtB  = parseInt(document.getElementById('partnerAmtInputB').value) || 0;
  const total = amtA + amtB;

  const pctA = total > 0 ? Math.round((amtA / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((amtB / total) * 100) : 0;

  document.getElementById('partnerNameA').textContent = nameA;
  document.getElementById('partnerNameB').textContent = nameB;
  document.getElementById('partnerPctA').textContent  = pctA + '%';
  document.getElementById('partnerPctB').textContent  = pctB + '%';
  document.getElementById('partnerAmtA').textContent  = fmtInt(amtA);
  document.getElementById('partnerAmtB').textContent  = fmtInt(amtB);
  document.getElementById('partnerBarFill').style.width = pctA + '%';

  const example = document.getElementById('partnerExample');
  if (total > 0) {
    example.innerHTML = `
      <div class="partner-example-text">
        Per ogni <strong>€100</strong> di spesa comune:<br>
        ${nameA} paga <strong>${fmtInt(pctA)}</strong> · ${nameB} paga <strong>${fmtInt(pctB)}</strong>
      </div>`;
  } else {
    example.innerHTML = '';
  }

  // Salva
  state.partner = { nameA, amtA, nameB, amtB };
  saveState();
}

function loadPartnerInputs() {
  const p = state.partner;
  document.getElementById('partnerNameInputA').value = p.nameA || '';
  document.getElementById('partnerAmtInputA').value  = p.amtA  || '';
  document.getElementById('partnerNameInputB').value = p.nameB || '';
  document.getElementById('partnerAmtInputB').value  = p.amtB  || '';
  renderPartner();
}

// ── RENDER ALL ──
function renderAll() {
  renderSummary();
  renderEntrate();
  renderPockets();
}

// ── NAVIGATION ──
function showView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');

  // Aggiorna nav solo per le 3 tab principali
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`[data-view="${view}"]`);
  if (navBtn) navBtn.classList.add('active');

  // FAB: visibile solo su entrate e pockets
  const fab = document.getElementById('fabAdd');
  fab.style.display = (view === 'entrate' || view === 'pockets') ? 'flex' : 'none';

  if (view === 'partner') loadPartnerInputs();
}

function onFabClick() {
  if (currentView === 'entrate') openEntrataModal(null);
  else if (currentView === 'pockets') openPocketModal(null);
}

// ── HAMBURGER ──
function openHamburger() {
  document.getElementById('hamburgerMenu').classList.add('open');
}

function closeHamburger() {
  document.getElementById('hamburgerMenu').classList.remove('open');
}

function hamburgerGo(view) {
  closeHamburger();
  showView(view);
}

// ── COLOR SWATCHES ──
function renderColorSwatches(containerId, currentColor, onSelect) {
  document.getElementById(containerId).innerHTML = POCKET_COLORS.map(c => `
    <button class="color-swatch ${c === currentColor ? 'selected' : ''}"
      style="background:${c}" onclick="${onSelect}('${c}')"></button>
  `).join('');
}

// ── POCKET MODAL ──
function openPocketModal(id) {
  editingPocketId = id;
  const p = id ? state.pockets.find(x => x.id === id) : null;

  document.getElementById('pocketModalTitle').textContent   = id ? 'Modifica pocket' : 'Nuovo pocket';
  document.getElementById('pocketEmoji').value              = p ? p.emoji  : '';
  document.getElementById('pocketName').value               = p ? p.name   : '';
  document.getElementById('pocketAmount').value             = p ? p.amount : '';
  document.getElementById('pocketDeleteBtn').style.display  = id ? 'block' : 'none';

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
    state.pockets.push({ id: generateId(), emoji, name, amount, color: selectedPocketColor });
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

  document.getElementById('entrataModalTitle').textContent   = id ? 'Modifica entrata' : 'Nuova entrata';
  document.getElementById('entrataEmoji').value              = e ? e.emoji  : '';
  document.getElementById('entrataName').value               = e ? e.name   : '';
  document.getElementById('entrataAmount').value             = e ? e.amount : '';
  document.getElementById('entrataDeleteBtn').style.display  = id ? 'block' : 'none';

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
    renderAll();
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  showView('home');
  renderAll();

  document.getElementById('pocketModal').addEventListener('click',    e => { if (e.target === e.currentTarget) closePocketModal(); });
  document.getElementById('entrataModal').addEventListener('click',   e => { if (e.target === e.currentTarget) closeEntrataModal(); });
  document.getElementById('hamburgerMenu').addEventListener('click',  e => { if (e.target === e.currentTarget) closeHamburger(); });
});
