// Handles: reporting stray animals / rabies cases, and listing them
// for the map + heatmap pages. This is the core "help NGOs find animals" feature.

const express = require('express');
const AnimalPin = require('../models/AnimalPin');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/animals — get every pin (map + heatmap both read from this)
router.get('/', async (req, res) => {
  const pins = await AnimalPin.find().sort({ createdAt: -1 });
  res.json(pins);
});

// POST /api/animals — report a new stray/rabies case with photo + pinned location
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'A photo is required' });

    const { lat, lng, address, description, type } = req.body;
    if (!lat || !lng || !type) {
      return res.status(400).json({ message: 'Location (lat/lng) and type are required' });
    }

    const pin = await AnimalPin.create({
      reportedBy: req.user.id,
      reporterName: req.user.name,
      imageUrl: `/uploads/${req.file.filename}`,
      description: description || '',
      type, // 'stray' or 'rabies'
      location: { lat: Number(lat), lng: Number(lng), address: address || '' }
    });

    res.status(201).json(pin);
  } catch (err) {
    res.status(500).json({ message: 'Could not submit report', error: err.message });
  }
});

// PATCH /api/animals/:id/status — NGO updates status (pending -> in-progress -> resolved)
router.patch('/:id/status', requireAuth, requireRole('ngo'), async (req, res) => {
  const { status } = req.body;
  const pin = await AnimalPin.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!pin) return res.status(404).json({ message: 'Report not found' });
  res.json(pin);
});

module.exports = router;
