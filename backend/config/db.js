// Handles connecting to MongoDB.
// This file only does ONE job: connect. Keeping it separate means
// if you ever change database provider, you only edit this file.

const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
