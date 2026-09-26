// Product model — items in the pet shop (food, toys, etc.)

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'general' },
  stock: { type: Number, default: 100 }
});

module.exports = mongoose.model('Product', productSchema);
