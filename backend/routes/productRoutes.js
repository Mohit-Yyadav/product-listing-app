const express = require('express');
const router = express.Router();

const upload = require('../utils/multer');
const { addProduct ,getProducts,getProductById,updateProduct,deleteProduct} = require('../controllers/productController');
//Create a new product
router.post(
  '/',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  addProduct
);

//Get all products
router.get('/',getProducts);

//Get a single product by ID
router.get('/:id',getProductById);

//Update a product by ID
router.put('/:id', upload.fields([
  {name : 'thumbnail', maxCount: 1},
  {name : 'images', maxCount: 5} 
]),updateProduct);

//Delete a product by ID
router.delete('/:id',deleteProduct);




module.exports = router;