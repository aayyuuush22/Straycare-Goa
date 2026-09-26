// feed.js — ONLY used by feed.html.

requireLogin();
requireRole('owner');
renderNav('feed');

let pinnedLocation = null; // { lat, lng }

// ---------- Load & render posts ----------
async function loadPosts() {
  const posts = await apiRequest('/posts');
  const list = document.getElementById('posts-list');
  const user = getUser();

  list.innerHTML = posts.map(post => {
    const liked = post.likes.includes(user.id);
    const commentsHtml = post.comments.map(c => `
      <div class="comment-item"><b>${c.userName}:</b>${c.text}</div>
    `).join('');

    return `
      <div class="card post-card" data-id="${post._id}">
        <img src="${imageUrl(post.imageUrl)}" alt="post photo">
        <div class="post-body">
          <div class="post-author">${post.authorName}</div>
          <p class="post-caption">${post.caption || ''}</p>
          <div class="post-actions">
            <button class="like-btn ${liked ? 'liked' : ''}" data-id="${post._id}">
              👍 ${post.likes.length}
            </button>
          </div>
          <div class="comment-list">${commentsHtml}</div>
          <div class="comment-input-row">
            <input type="text" placeholder="Write a comment..." class="comment-input" data-id="${post._id}">
            <button class="btn-small comment-btn" data-id="${post._id}">Send</button>
          </div>
        </div>
      </div>
    `;
  }).join('') || '<p class="muted">No posts yet. Be the first to share!</p>';

  // Wire up like buttons
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await apiRequest(`/posts/${btn.dataset.id}/like`, 'POST');
      loadPosts();
    });
  });

  // Wire up comment buttons
  document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const input = document.querySelector(`.comment-input[data-id="${btn.dataset.id}"]`);
      if (!input.value.trim()) return;
      await apiRequest(`/posts/${btn.dataset.id}/comment`, 'POST', { text: input.value.trim() });
      loadPosts();
    });
  });
}

// ---------- New post form ----------
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('post-image');
  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('caption', document.getElementById('post-caption').value);

  await apiUpload('/posts', formData);
  e.target.reset();
  loadPosts();
});

// ---------- Pin location using the browser's Geolocation API ----------
document.getElementById('pin-location-btn').addEventListener('click', () => {
  const statusEl = document.getElementById('location-status');
  if (!navigator.geolocation) {
    statusEl.textContent = 'Geolocation is not supported on this browser.';
    return;
  }
  statusEl.textContent = 'Getting your location...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      pinnedLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      statusEl.textContent = `📍 Pinned: ${pinnedLocation.lat.toFixed(5)}, ${pinnedLocation.lng.toFixed(5)}`;
    },
    () => { statusEl.textContent = 'Could not get location. Please allow location access.'; }
  );
});

// ---------- Report form (stray / rabies) ----------
document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('report-error');
  errorEl.classList.add('hidden');

  if (!pinnedLocation) {
    errorEl.textContent = 'Please pin a location first.';
    errorEl.classList.remove('hidden');
    return;
  }

  const formData = new FormData();
  formData.append('image', document.getElementById('report-image').files[0]);
  formData.append('type', document.getElementById('report-type').value);
  formData.append('description', document.getElementById('report-description').value);
  formData.append('lat', pinnedLocation.lat);
  formData.append('lng', pinnedLocation.lng);

  try {
    await apiUpload('/animals', formData);
    alert('Report submitted! It will now appear on the Map & Heatmap page.');
    e.target.reset();
    pinnedLocation = null;
    document.getElementById('location-status').textContent = 'No location pinned yet.';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

loadPosts();
