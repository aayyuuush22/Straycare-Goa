// auth.js — ONLY used by index.html and signup.html.

const roleSelect = document.getElementById('role');
if (roleSelect) {
  roleSelect.addEventListener('change', () => {
    const ngoGroup = document.getElementById('ngo-name-group');
    ngoGroup.classList.toggle('hidden', roleSelect.value !== 'ngo');
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    try {
      const data = await apiRequest('/api/auth/login', 'POST', {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = data.user.role === 'ngo' ? 'dashboard.html' : 'feed.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('signup-error');
    errorEl.classList.add('hidden');

    try {
      const data = await apiRequest('/api/auth/register', 'POST', {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        ngoName: document.getElementById('ngoName').value
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = data.user.role === 'ngo' ? 'dashboard.html' : 'feed.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
  });
}
