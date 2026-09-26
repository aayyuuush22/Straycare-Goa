// AnimalPin model — a report of a stray animal or a rabies case,
// with a photo + exact map location. This is what powers BOTH the
// map page and the heatmap page.

const mongoose = require('mongoose');

const animalPinSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reporterName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['stray', 'rabies'], required: true }, // controls heatmap color
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' }
  },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AnimalPin', animalPinSchema);
