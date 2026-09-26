// Run this ONCE with `node seed.js` to fill the shop with sample products.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  { name: 'Dog Dry Food (3kg)', price: 899, category: 'food', imageUrl: '' },
  { name: 'Cat Dry Food (2kg)', price: 649, category: 'food', imageUrl: '' },
  { name: 'Chew Toy', price: 199, category: 'toys', imageUrl: '' },
  { name: 'Pet Shampoo', price: 349, category: 'grooming', imageUrl: '' },
  { name: 'Collar with Leash', price: 449, category: 'accessories', imageUrl: '' },
  { name: 'Puppy Vaccination Kit Reminder Tag', price: 149, category: 'accessories', imageUrl: '' }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log('Shop seeded with sample products');
  process.exit();
}

seed();
