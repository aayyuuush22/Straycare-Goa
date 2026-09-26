// Entry point — this is the file you run with `node server.js`
// It just wires everything together: connects DB, sets up middleware,
// mounts each route file under its own URL prefix, and starts listening.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const animalRoutes = require('./routes/animalRoutes');
const shopRoutes = require('./routes/shopRoutes');
const breedingRoutes = require('./routes/breedingRoutes');

const app = express();

connectDB();

app.use(cors());               // allows the frontend (different port) to call this API
app.use(express.json());       // lets us read req.body as JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve uploaded photos

// Every route file is mounted under its own prefix.
// Want to add a new feature later? Add ONE new route file + ONE new line here.
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/breeding', breedingRoutes);

app.get('/', (req, res) => {
  res.send('Stray Animal App API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
