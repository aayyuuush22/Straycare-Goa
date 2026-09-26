// api.js — SHARED helper used by every page to talk to the backend.
// This is the ONLY file that knows the backend's URL. If you deploy
// the backend somewhere else later, you change it in ONE place.

const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Generic JSON request (for login, register, likes, comments, checkout, etc.)
async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// For requests that include a photo upload (posts, animal reports, breeding listings)
async function apiUpload(endpoint, formData) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData // browser sets the correct multipart Content-Type automatically
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// Turns "/uploads/xyz.jpg" (from the backend) into a full loadable image URL
function imageUrl(path) {
  if (!path) return '';
  return `http://localhost:5000${path}`;
}
