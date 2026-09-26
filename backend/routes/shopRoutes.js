// Handles: the pet shop. Products + a mock checkout (NO real payment).

const express = require('express');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/shop/products
router.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST /api/shop/checkout
// This is INTENTIONALLY fake — it just validates the cart and returns a
// bill summary. No real payment gateway is called, exactly as requested.
router.post('/checkout', requireAuth, async (req, res) => {
  const { items } = req.body; // items = [{ productId, quantity }]
  if (!items || !items.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  let total = 0;
  const billItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;
    const lineTotal = product.price * item.quantity;
    total += lineTotal;
    billItems.push({ name: product.name, price: product.price, quantity: item.quantity, lineTotal });
  }

  res.json({
    message: 'Bill generated (this is a demo — no payment was processed)',
    billItems,
    total
  });
});

module.exports = router;
