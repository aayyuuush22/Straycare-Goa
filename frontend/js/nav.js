// nav.js — builds the shared top navigation bar on every page.
// Editing the nav means editing ONLY this file, not every HTML page.

const WHATSAPP_NUMBER = '91+ 8983574009'; // 👉 put YOUR number here (country code, no + or spaces)
const WHATSAPP_DEFAULT_MESSAGE = 'Hi! I have a question about StrayCare Goa.';

function renderNav(activePage) {
  const user = getUser(); 
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  const links = [
    { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard', roles: ['ngo'] },
    { href: 'feed.html', label: 'Community Feed', key: 'feed', roles: ['owner'] },
    { href: 'map.html', label: 'Map & Heatmap', key: 'map' },
    { href: 'breeding.html', label: 'Breeding & Sell', key: 'breeding', roles: ['owner'] },
    { href: 'shop.html', label: 'Shop', key: 'shop', roles: ['owner'] }
  ];

  const visibleLinks = links.filter(link => !link.roles || (user && link.roles.includes(user.role)));

  const linksHtml = visibleLinks.map(link => `
    <a href="${link.href}" class="nav-link ${activePage === link.key ? 'active' : ''}">${link.label}</a>
  `).join('');

  navContainer.innerHTML = `
    <nav class="navbar">
      <a href="feed.html" class="nav-brand">🐾 StrayCare Goa</a>
      <div class="nav-links">${linksHtml}</div>
      <div class="nav-user">
        ${user
          ? `<span class="nav-username">${user.name} (${user.role})</span>
             <button id="logout-btn" class="btn-small">Logout</button>`
          : `<a href="index.html" class="btn-small">Login</a>`
        }
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  renderWhatsappButton();
}

function renderWhatsappButton() {
  if (document.getElementById('whatsapp-float')) return;
  const link = document.createElement('a');
  link.id = 'whatsapp-float';
  link.className = 'whatsapp-float';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.title = 'Chat with us on WhatsApp';
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;
  link.innerHTML = '💬';
  document.body.appendChild(link);
}

function requireRole(allowedRole) {
  const user = getUser();
  if (!user || user.role !== allowedRole) {
    alert('This section is only available for Pet Owner accounts.');
    window.location.href = 'feed.html';
  }
}

// Simple guard: call this at the top of any page that requires login
function requireLogin() {
  if (!isLoggedIn()) {
    alert('Please log in first.');
    window.location.href = 'index.html';
  }
}
