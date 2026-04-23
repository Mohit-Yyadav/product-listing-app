const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors());

const productRoutes = require('./routes/productRoutes');

app.use('/api/products', productRoutes);

app.use('/uploads', express.static('uploads'));



module.exports = app;