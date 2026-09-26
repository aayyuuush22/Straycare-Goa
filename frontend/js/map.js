// map.js — ONLY used by map.html.
// Shows two views on the same Leaflet map:
//   1) Pin view  — a marker for every report (click for details/status)
//   2) Heatmap view — a red heat layer for rabies + a yellow heat layer
//      for strays, built from the same data.
// Both views read from GET /api/animals, so a newly submitted report
// (from feed.html) appears automatically next time this data refreshes.

requireLogin();
renderNav('map');

const GOA_CENTER = [15.2993, 74.1240];
const map = L.map('map').setView(GOA_CENTER, 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);

let markerLayer = L.layerGroup().addTo(map);
let strayHeatLayer = null;
let rabiesHeatLayer = null;
let currentView = 'markers';

async function loadPins() {
  const pins = await apiRequest('/animals');
  drawMarkers(pins);
  drawHeatmap(pins);
}

function drawMarkers(pins) {
  markerLayer.clearLayers();
  const user = getUser();

  pins.forEach(pin => {
    const color = pin.type === 'rabies' ? '#e53935' : '#ffca28';
    const icon = L.divIcon({
      className: '',
      html: `<div style="background:${color}; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16]
    });

    const marker = L.marker([pin.location.lat, pin.location.lng], { icon });

    marker.on('click', () => showPinDetails(pin, user));
    marker.addTo(markerLayer);
  });
}

function drawHeatmap(pins) {
  if (strayHeatLayer) map.removeLayer(strayHeatLayer);
  if (rabiesHeatLayer) map.removeLayer(rabiesHeatLayer);

  const strayPoints = pins.filter(p => p.type === 'stray').map(p => [p.location.lat, p.location.lng, 0.6]);
  const rabiesPoints = pins.filter(p => p.type === 'rabies').map(p => [p.location.lat, p.location.lng, 1.0]);

  // Yellow gradient for stray density
  strayHeatLayer = L.heatLayer(strayPoints, {
    radius: 35, blur: 25, maxZoom: 14,
    gradient: { 0.2: '#fff9c4', 0.5: '#ffe082', 1.0: '#ffca28' }
  });

  // Red gradient for rabies cases
  rabiesHeatLayer = L.heatLayer(rabiesPoints, {
    radius: 35, blur: 25, maxZoom: 14,
    gradient: { 0.2: '#ffcdd2', 0.5: '#ef5350', 1.0: '#c62828' }
  });

  if (currentView === 'heatmap') {
    strayHeatLayer.addTo(map);
    rabiesHeatLayer.addTo(map);
  }
}

function showPinDetails(pin, user) {
  const box = document.getElementById('pin-details');
  box.classList.remove('hidden');

  const canManage = user.role === 'ngo';

  box.innerHTML = `
    <img src="${imageUrl(pin.imageUrl)}" style="width:100%; max-height:260px; object-fit:cover; border-radius:8px;">
    <h3>${pin.type === 'rabies' ? '🔴 Suspected rabies case' : '🟡 Stray animal'}</h3>
    <p>${pin.description || 'No description provided.'}</p>
    <p class="muted">Reported by ${pin.reporterName} · ${pin.location.lat.toFixed(5)}, ${pin.location.lng.toFixed(5)}</p>
    <p>Status: <span class="status-${pin.status}">${pin.status}</span></p>
    ${canManage ? `
      <select id="status-select">
        <option value="pending" ${pin.status === 'pending' ? 'selected' : ''}>Pending</option>
        <option value="in-progress" ${pin.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
        <option value="resolved" ${pin.status === 'resolved' ? 'selected' : ''}>Resolved</option>
      </select>
      <button id="update-status-btn" class="btn-small" style="background:var(--color-primary); color:white; margin-left:8px;">Update</button>
    ` : ''}
  `;

  const updateBtn = document.getElementById('update-status-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      const newStatus = document.getElementById('status-select').value;
      await apiRequest(`/animals/${pin._id}/status`, 'PATCH', { status: newStatus });
      loadPins();
    });
  }
}

// ---------- View toggle ----------
document.getElementById('view-markers-btn').addEventListener('click', () => {
  currentView = 'markers';
  map.addLayer(markerLayer);
  if (strayHeatLayer) map.removeLayer(strayHeatLayer);
  if (rabiesHeatLayer) map.removeLayer(rabiesHeatLayer);
  document.getElementById('view-markers-btn').classList.add('active-toggle');
  document.getElementById('view-heatmap-btn').classList.remove('active-toggle');
});

document.getElementById('view-heatmap-btn').addEventListener('click', () => {
  currentView = 'heatmap';
  map.removeLayer(markerLayer);
  if (strayHeatLayer) strayHeatLayer.addTo(map);
  if (rabiesHeatLayer) rabiesHeatLayer.addTo(map);
  document.getElementById('view-heatmap-btn').classList.add('active-toggle');
  document.getElementById('view-markers-btn').classList.remove('active-toggle');
});

// ---------- Auto-update ----------
// Real-time push (websockets) is a good next upgrade, but for a first
// project, polling the API every 15 seconds is simple and reliable:
// any new report (with its photo + pinned location) shows up here
// automatically without refreshing the page.
loadPins();
setInterval(loadPins, 15000);
