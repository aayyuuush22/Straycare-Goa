// dashboard.js — ONLY used by dashboard.html. NGO accounts only.

requireLogin();
requireRole('ngo');
renderNav('dashboard');

async function loadDashboard() {
  const pins = await apiRequest('/animals');

  const pending = pins.filter(p => p.status === 'pending').length;
  const inProgress = pins.filter(p => p.status === 'in-progress').length;
  const resolved = pins.filter(p => p.status === 'resolved').length;
  const strayCount = pins.filter(p => p.type === 'stray').length;
  const rabiesCount = pins.filter(p => p.type === 'rabies').length;

  const stats = [
    { label: 'Pending', value: pending },
    { label: 'In Progress', value: inProgress },
    { label: 'Resolved', value: resolved },
    { label: 'Stray Reports', value: strayCount },
    { label: 'Rabies Cases', value: rabiesCount }
  ];

  document.getElementById('stats-grid').innerHTML = stats.map(s => `
    <div class="card stat-card">
      <div class="stat-number">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  const recent = pins
    .filter(p => p.status !== 'resolved')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  document.getElementById('recent-list').innerHTML = recent.map(p => `
    <div class="card recent-item">
      <img src="${imageUrl(p.imageUrl)}" alt="report photo">
      <div class="recent-info">
        <b>${p.type === 'rabies' ? '🔴 Rabies case' : '🟡 Stray animal'}</b>
        <p class="muted" style="margin:4px 0;">${p.description || 'No description'}</p>
        <span class="status-${p.status}">${p.status}</span>
      </div>
    </div>
  `).join('') || '<p class="muted">No unresolved reports right now — great work!</p>';
}

loadDashboard();