// Handles: the breeding/selling marketplace.

const express = require('express');
const BreedingListing = require('../models/BreedingListing');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/breeding — all listings, newest first
router.get('/', async (req, res) => {
  const listings = await BreedingListing.find().sort({ createdAt: -1 });
  res.json(listings);
});

// POST /api/breeding — create a listing
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { petName, species, breed, age, purpose, description, contactInfo } = req.body;
    if (!petName || !species || !purpose) {
      return res.status(400).json({ message: 'Pet name, species and purpose are required' });
    }

    const listing = await BreedingListing.create({
      owner: req.user.id,
      ownerName: req.user.name,
      petName,
      species,
      breed,
      age,
      purpose,
      description,
      contactInfo,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Could not create listing', error: err.message });
  }
});

module.exports = router;
