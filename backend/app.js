const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// 🟢 Security headers
app.use(helmet());

// 🟢 Logging (helps debugging on Render)
app.use(morgan('dev'));

// 🟢 Body parser
app.use(express.json());

// 🟢 CORS (secure)
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 🟢 Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// 🟢 Secure static uploads (ONLY images should exist)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

// 🟢 Health check (important for Render)
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// 🟢 Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

module.exports = app;