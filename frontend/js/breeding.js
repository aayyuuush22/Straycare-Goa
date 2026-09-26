// breeding.js — ONLY used by breeding.html.

requireLogin();
requireRole('owner');
renderNav('breeding');

async function loadListings() {
  const listings = await apiRequest('/breeding');
  const grid = document.getElementById('listings-grid');

  grid.innerHTML = listings.map(l => `
    <div class="card listing-card">
      ${l.imageUrl ? `<img src="${imageUrl(l.imageUrl)}" alt="${l.petName}">` : ''}
      <div class="listing-body">
        <span class="listing-tag">${l.purpose === 'breeding' ? 'For Breeding' : 'For Sale'}</span>
        <p class="listing-title">${l.petName} — ${l.species}${l.breed ? ' (' + l.breed + ')' : ''}</p>
        <p class="muted">${l.age ? l.age + ' yrs · ' : ''}Owner: ${l.ownerName}</p>
        <p>${l.description || ''}</p>
        ${l.contactInfo ? `<p class="muted">📞 ${l.contactInfo}</p>` : ''}
      </div>
    </div>
  `).join('') || '<p class="muted">No listings yet. Be the first to post!</p>';
}

document.getElementById('listing-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('petName', document.getElementById('petName').value);
  formData.append('species', document.getElementById('species').value);
  formData.append('breed', document.getElementById('breed').value);
  formData.append('age', document.getElementById('age').value);
  formData.append('purpose', document.getElementById('purpose').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('contactInfo', document.getElementById('contactInfo').value);
  const imageFile = document.getElementById('listing-image').files[0];
  if (imageFile) formData.append('image', imageFile);

  await apiUpload('/breeding', formData);
  e.target.reset();
  loadListings();
});

loadListings();
