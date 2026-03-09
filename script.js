//js
const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

let allIssues = [];
let currentTab = 'all';
let searchTimeout = null;

function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errEl = document.getElementById('login-error');

  if (username === 'admin' && password === 'admin123') {
    window.location.href = 'issues.html';
  } else {
    errEl.classList.remove('hidden');
    setTimeout(() => errEl.classList.add('hidden'), 3000);
  }
}

async function loadIssues() {
  showSpinner(true);
  try {
    const res = await fetch(`${API_BASE}/issues`);
    const json = await res.json();
    if (json.status === 'success') {
      allIssues = json.data;
      renderIssues(allIssues);
    }
  } catch (err) {
    console.error('Failed to fetch issues:', err);
  } finally {
    showSpinner(false);
  }
}

function renderIssues(issues) {
  const grid = document.getElementById('issues-grid');
  const noResults = document.getElementById('no-results');
  const countEl = document.getElementById('issue-count');
  if (!grid) return;

  countEl.textContent = `${issues.length} Issue${issues.length !== 1 ? 's' : ''}`;

  if (issues.length === 0) {
    grid.classList.add('hidden');
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = '';

  issues.forEach(issue => grid.appendChild(buildCard(issue)));
}

function buildCard(issue) {
  const div = document.createElement('div');
  const isOpen = issue.status === 'open';
  div.className = `issue-card ${isOpen ? 'open-card' : 'closed-card'}`;
  div.addEventListener('click', () => openModal(issue.id));

  const prioClass = issue.priority === 'high' ? 'priority-high' : issue.priority === 'medium' ? 'priority-medium' : 'priority-low';
  const desc = issue.description.length > 80 ? issue.description.slice(0, 80) + '...' : issue.description;
  const date = formatDate(issue.createdAt);
  const labelsHtml = (issue.labels || []).map(lbl =>
    `<span class="label-badge ${getLabelClass(lbl)}">${formatLabel(lbl)}</span>`
  ).join('');

  div.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <img src="${isOpen ? 'assets/Open-Status.png' : 'assets/Closed-Status.png'}" alt="status" class="w-5 h-5" />
      <span class="priority-badge ${prioClass}" style="font-size:12px; border-radius:999px; padding:2px 10px;">${issue.priority.toUpperCase()}</span>
    </div>
    <h3 style="font-weight:600; font-size:14px; color:#1f2937; margin-bottom:6px; line-height:1.4;">${capitalizeTitle(issue.title)}</h3>
    <p style="color:#6b7280; font-size:12px; margin-bottom:12px; line-height:1.5;">${desc}</p>
    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">${labelsHtml}</div>
    <div style="font-size:12px; color:#9ca3af; border-top:1px solid #f3f4f6; padding-top:8px;">
      <p>#${issue.id} by <span style="color:#4b5563; font-weight:500;">${issue.author}</span></p>
      <p>${date}</p>
    </div>
  `;

  return div;
}

function switchTab(tab) {
  currentTab = tab;
  ['all', 'open', 'closed'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.remove('active-tab');
  });
  document.getElementById(`tab-${tab}`)?.classList.add('active-tab');

  const searchInput = document.getElementById('search-input');
  const searchMobile = document.getElementById('search-input-mobile');
  if (searchInput) searchInput.value = '';
  if (searchMobile) searchMobile.value = '';

  let filtered = allIssues;
  if (tab === 'open') filtered = allIssues.filter(i => i.status === 'open');
  if (tab === 'closed') filtered = allIssues.filter(i => i.status === 'closed');
  renderIssues(filtered);
}

function runSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (query.length === 0) {
      switchTab(currentTab);
      return;
    }
    showSpinner(true);
    try {
      const res = await fetch(`${API_BASE}/issues/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.status === 'success') {
        let results = json.data;
        if (currentTab === 'open') results = results.filter(i => i.status === 'open');
        if (currentTab === 'closed') results = results.filter(i => i.status === 'closed');
        renderIssues(results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      showSpinner(false);
    }
  }, 400);
}

async function openModal(id) {
  const modal = document.getElementById('issue-modal');
  const content = document.getElementById('modal-content');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  content.innerHTML = `<div class="flex justify-center py-6"><div class="spinner-ring"></div></div>`;

  try {
    const res = await fetch(`${API_BASE}/issue/${id}`);
    const json = await res.json();
    if (json.status === 'success') {
      content.innerHTML = buildModalContent(json.data);
    }
  } catch (err) {
    content.innerHTML = `<p class="text-red-500 text-sm">Failed to load issue details.</p>`;
  }
}

function buildModalContent(issue) {
  const isOpen = issue.status === 'open';
  const labelsHtml = (issue.labels || []).map(lbl =>
    `<span class="label-badge ${getLabelClass(lbl)}">${formatLabel(lbl)}</span>`
  ).join('');

  const statusBadge = isOpen
    ? `<span class="status-badge-open">Opened</span>`
    : `<span class="status-badge-closed">Closed</span>`;

  const assignee = issue.assignee || 'Unassigned';
  const date = formatDate(issue.updatedAt || issue.createdAt);
  const prioClass = issue.priority === 'high' ? 'modal-priority-high' : issue.priority === 'medium' ? 'modal-priority-medium' : 'modal-priority-low';

  return `
    <h2 style="font-size:20px; font-weight:700; color:#111827; margin-bottom:12px;">${capitalizeTitle(issue.title)}</h2>
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
      ${statusBadge}
      <span style="font-size:12px; color:#9ca3af;">• Opened by <span style="font-weight:500; color:#4b5563;">${issue.author}</span> • ${date}</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">${labelsHtml}</div>
    <p style="color:#4b5563; font-size:14px; line-height:1.6; margin-bottom:20px;">${issue.description}</p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; background:#f9fafb; border-radius:12px; padding:16px;">
      <div>
        <p style="font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Assignee:</p>
        <p style="font-weight:600; color:#111827; font-size:14px;">${assignee}</p>
      </div>
      <div>
        <p style="font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Priority:</p>
        <span class="${prioClass}">${issue.priority.toUpperCase()}</span>
      </div>
    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById('issue-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function showSpinner(show) {
  const spinner = document.getElementById('spinner');
  const grid = document.getElementById('issues-grid');
  if (!spinner) return;
  if (show) {
    spinner.classList.remove('hidden');
    grid?.classList.add('hidden');
  } else {
    spinner.classList.add('hidden');
  }
}

function getLabelClass(label) {
  const map = {
    'bug': 'label-bug',
    'enhancement': 'label-enhancement',
    'documentation': 'label-documentation',
    'help wanted': 'label-help-wanted',
    'good first issue': 'label-good-first-issue'
  };
  return map[label.toLowerCase()] || 'label-documentation';
}

function formatLabel(label) {
  return label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function capitalizeTitle(title) {
  return title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('signin-btn');
  if (btn) btn.addEventListener('click', handleLogin);

  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');
  if (usernameField) usernameField.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  if (passwordField) passwordField.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

  document.getElementById('tab-all')?.addEventListener('click', () => switchTab('all'));
  document.getElementById('tab-open')?.addEventListener('click', () => switchTab('open'));
  document.getElementById('tab-closed')?.addEventListener('click', () => switchTab('closed'));

  document.getElementById('search-input')?.addEventListener('input', function () { runSearch(this.value.trim()); });
  document.getElementById('search-input-mobile')?.addEventListener('input', function () { runSearch(this.value.trim()); });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  if (document.getElementById('issues-grid')) loadIssues();
});