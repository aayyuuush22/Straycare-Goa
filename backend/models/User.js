// User model — represents both Pet Owners and NGOs.
// The "role" field is what separates the two account types.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
  role: { type: String, enum: ['owner', 'ngo'], required: true },
  ngoName: { type: String }, // only used when role === 'ngo'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
