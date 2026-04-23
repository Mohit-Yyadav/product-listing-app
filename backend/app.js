const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const app = express();

// Body parser
app.use(express.json());

// CORS (secure)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);




app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health route
app.get('/', (req, res) => {
  res.send("API running 🚀");
});

module.exports = app;