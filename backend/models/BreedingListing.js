// BreedingListing model — pet owners list their pet for breeding/selling.

const mongoose = require('mongoose');

const breedingListingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  petName: { type: String, required: true },
  species: { type: String, required: true }, // e.g. Dog, Cat
  breed: { type: String, default: '' },
  age: { type: Number },
  purpose: { type: String, enum: ['breeding', 'sell'], required: true },
  imageUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  contactInfo: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BreedingListing', breedingListingSchema);
