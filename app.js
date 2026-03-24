// ── CONSTANTS ──
const POCKET_COLORS = [
  '#7C3AED', '#A78BFA', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#06B6D4',
];

const DEFAULT_POCKETS = [
  { id: 'affitto',   name: 'Affitto',     emoji: '🏠', amount: 400, color: '#7C3AED' },
  { id: 'emergenze', name: 'Emergenze',   emoji: '🚨', amount: 250, color: '#EF4444' },
  { id: 'spesa',     name: 'Spesa & Casa',emoji: '🛒', amount: 450, color: '#10B981' },
  { id: 'gaming',    name: 'Gaming',      emoji: '🎮', amount: 150, color: '#F59E0B' },
  { id: 'rossana',   name: 'Rossana',     emoji: '💜', amount: 150, color: '#EC4899' },
];

// ── STATE ──
function loadState() {
  return {
    pockets: JSON.parse(localStorage.getItem('fx_pockets') || JSON.stringify(DEFAULT_POCKETS)),
    entrate: parseInt(localStorage.getItem('fx_entrate') || '1800'),
  };
}

function saveState() {
  localStorage.setItem('fx_pockets', JSON.stringify(state.pockets));
  localStorage.setItem('fx_entrate', String(state.entrate));
}

let state = loadState();
let currentView = 'pockets';
let editingPocketId = null;
let selectedColor = POCKET_COLORS[0];

// ── HELPERS ──
function fmtInt(n) {
  return '€' + Math.round(n).toLocaleString('it-IT');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ── RENDER SUMMARY ──
function renderSummary() {
  const total = state.pockets.reduce((s, p) => s + p.amount, 0);
  const scarto = state.entrate - total;
  const pct = state.entrate > 0 ? Math.min((total / state.entrate) * 100, 100) : 0;

  document.getElementById('summaryIncome').textContent = fmtInt(state.entrate);
  document.getElementById('summaryAllocato').textContent = fmtInt(total);

  const scartoEl = document.getElementById('summaryScarto');
  scartoEl.textContent = fmtInt(Math.abs(scarto));
  scartoEl.style.color = scarto < 0 ? '#FCA5A5' : 'inherit';

  document.getElementById('summaryBarFill').style.width = pct + '%';
  document.getElementById('summaryBarLabel').textContent = Math.round(pct) + '% del reddito allocato';

  const settingsIncome = document.getElementById('settingsIncomeVal');
  if (settingsIncome) settingsIncome.textContent = fmtInt(state.entrate);
}

// ── RENDER POCKETS ──
function renderPockets() {
  const container = document.getElementById('pocketsList');
  const count = document.getElementById('pocketsCount');

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

function renderAll() {
  renderSummary();
  renderPockets();
}

// ── NAVIGATION ──
function showView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelector(`[data-view="${view}"]`).classList.add('active');

  const fab = document.getElementById('fabAdd');
  fab.style.display = view === 'pockets' ? 'flex' : 'none';

  if (view === 'settings') {
    document.getElementById('settingsIncomeVal').textContent = fmtInt(state.entrate);
  }
}

// ── POCKET MODAL ──
function openPocketModal(id) {
  editingPocketId = id;
  const pocket = id ? state.pockets.find(p => p.id === id) : null;

  document.getElementById('pocketModalTitle').textContent = id ? 'Modifica pocket' : 'Nuovo pocket';
  document.getElementById('pocketEmoji').value = pocket ? pocket.emoji : '';
  document.getElementById('pocketName').value = pocket ? pocket.name : '';
  document.getElementById('pocketAmount').value = pocket ? pocket.amount : '';
  document.getElementById('pocketDeleteBtn').style.display = id ? 'block' : 'none';

  selectedColor = pocket ? pocket.color : POCKET_COLORS[0];
  renderColorSwatches();
  updatePreview();

  document.getElementById('pocketModal').classList.add('open');
}

function closePocketModal() {
  document.getElementById('pocketModal').classList.remove('open');
}

function renderColorSwatches() {
  document.getElementById('colorSwatches').innerHTML = POCKET_COLORS.map(c => `
    <button class="color-swatch ${c === selectedColor ? 'selected' : ''}"
      style="background:${c}" onclick="selectColor('${c}')"></button>
  `).join('');
}

function selectColor(color) {
  selectedColor = color;
  renderColorSwatches();
  updatePreview();
}

function updatePreview() {
  const emoji  = document.getElementById('pocketEmoji').value || '💳';
  const name   = document.getElementById('pocketName').value   || 'Pocket';
  const amount = parseInt(document.getElementById('pocketAmount').value) || 0;

  const icon = document.getElementById('pocketPreviewIcon');
  icon.textContent = emoji;
  icon.style.background = selectedColor + '22';
  icon.style.color = selectedColor;

  document.getElementById('pocketPreviewName').textContent = name;
  document.getElementById('pocketPreviewAmount').textContent = fmtInt(amount) + ' / mese';
}

function savePocket() {
  const emoji  = document.getElementById('pocketEmoji').value.trim() || '💳';
  const name   = document.getElementById('pocketName').value.trim();
  const amount = parseInt(document.getElementById('pocketAmount').value) || 0;

  if (!name) { alert('Inserisci un nome per il pocket'); return; }

  if (editingPocketId) {
    const pocket = state.pockets.find(p => p.id === editingPocketId);
    if (pocket) {
      pocket.emoji  = emoji;
      pocket.name   = name;
      pocket.amount = amount;
      pocket.color  = selectedColor;
    }
  } else {
    state.pockets.push({ id: generateId(), emoji, name, amount, color: selectedColor });
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

// ── INCOME MODAL ──
function openIncomeModal() {
  document.getElementById('incomeInput').value = state.entrate;
  document.getElementById('incomeModal').classList.add('open');
}

function closeIncomeModal() {
  document.getElementById('incomeModal').classList.remove('open');
}

function saveIncome() {
  const val = parseInt(document.getElementById('incomeInput').value);
  if (!isNaN(val) && val >= 0) {
    state.entrate = val;
    saveState();
  }
  closeIncomeModal();
  renderAll();
}

// ── SETTINGS ──
function confirmClearPockets() {
  if (confirm('Eliminare tutti i pocket? Questa azione non può essere annullata.')) {
    state.pockets = [];
    saveState();
    renderAll();
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  showView('pockets');
  renderAll();

  document.getElementById('pocketModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePocketModal();
  });
  document.getElementById('incomeModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeIncomeModal();
  });
});
