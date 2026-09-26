// shop.js — ONLY used by shop.html.
// Cart state lives only in this page's memory (a plain object), so it's
// simple to follow: { productId: quantity }.

requireLogin();
requireRole('owner');
renderNav('shop');

let products = [];
const cart = {}; // { productId: quantity }

async function loadProducts() {
  products = await apiRequest('/shop/products');
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = products.map(p => `
    <div class="card product-card">
      <div class="product-name">${p.name}</div>
      <div class="product-price">₹${p.price}</div>
      <div class="qty-control">
        <button class="qty-minus" data-id="${p._id}">−</button>
        <span id="qty-${p._id}">${cart[p._id] || 0}</span>
        <button class="qty-plus" data-id="${p._id}">+</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, 1));
  });
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, -1));
  });
}

function changeQty(productId, delta) {
  const current = cart[productId] || 0;
  const next = Math.max(0, current + delta);
  if (next === 0) delete cart[productId];
  else cart[productId] = next;

  document.getElementById(`qty-${productId}`).textContent = cart[productId] || 0;
  updateCartCount();
}

function updateCartCount() {
  const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
  document.getElementById('cart-count').textContent = totalItems;
}

// ---------- Bill popup ----------
document.getElementById('view-bill-btn').addEventListener('click', async () => {
  const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
  if (!items.length) {
    alert('Your cart is empty. Add some items first!');
    return;
  }

  // The total is calculated on the SERVER (source of truth for prices),
  // this is exactly the "automatic bill total" feature.
  const bill = await apiRequest('/shop/checkout', 'POST', { items });

  document.getElementById('bill-items').innerHTML = bill.billItems.map(item => `
    <div class="bill-item-row">
      <span>${item.name} × ${item.quantity}</span>
      <span>₹${item.lineTotal}</span>
    </div>
  `).join('');
  document.getElementById('bill-total').textContent = bill.total;
  document.getElementById('bill-modal').classList.remove('hidden');
});

document.getElementById('close-bill-btn').addEventListener('click', () => {
  document.getElementById('bill-modal').classList.add('hidden');
});

// The Pay button is INTENTIONALLY non-functional — this is a demo store,
// as requested. It's here purely to complete the UI flow.
document.getElementById('pay-btn').addEventListener('click', () => {
  alert('This is a demo store — payment is not implemented.');
});

loadProducts();
