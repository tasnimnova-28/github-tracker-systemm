// GitHub Issues Tracker

const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';

let allIssues = [];
let currentTab = 'all';

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

  const prioClass = issue.priority === 'high' ? 'priority-high' : issue.priority === 'medium' ? 'priority-medium' : 'priority-low';
  const desc = issue.description.length > 80 ? issue.description.slice(0, 80) + '...' : issue.description;
  const date = formatDate(issue.createdAt);
  const labelsHtml = (issue.labels || []).map(lbl =>
    `<span class="label-badge ${getLabelClass(lbl)}">${formatLabel(lbl)}</span>`
  ).join('');

  div.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="${isOpen ? 'icon-open' : 'icon-closed'} text-lg">${isOpen ? '◎' : '✓'}</span>
      <span class="priority-badge ${prioClass}">${issue.priority.toUpperCase()}</span>
    </div>
    <h3 class="font-semibold text-gray-800 text-sm mb-1 leading-snug">${capitalizeTitle(issue.title)}</h3>
    <p class="text-gray-500 text-xs mb-3 leading-relaxed">${desc}</p>
    <div class="flex flex-wrap gap-1 mb-3">${labelsHtml}</div>
    <div class="text-xs text-gray-400 border-t border-gray-100 pt-2">
      <p>#${issue.id} by <span class="text-gray-600 font-medium">${issue.author}</span></p>
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

  if (document.getElementById('issues-grid')) loadIssues();
});