const { readData, writeData } = require('../utils/fileHandler');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


exports.addProduct = (req, res) => {
  try {
    const products = readData();

    const newProduct = {
      id: uuidv4(),
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      discountPrice: Number(req.body.discountPrice),
      category: req.body.category,
      brand: req.body.brand,
      rating: Number(req.body.rating),
      stock: Number(req.body.stock),

      // Image path
      thumbnail: req.files?.thumbnail
    ? `/uploads/${req.files.thumbnail[0].filename}`
    : null,

  images: req.files?.images
    ? req.files.images.map(file => `/uploads/${file.filename}`)
    : [],

      variants: {
        color: req.body.color ? req.body.color.split(',') : [],
        storage: req.body.storage ? req.body.storage.split(',') : []
      },

      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    writeData(products);

    res.status(201).json({
      message: "Product Created",
      product: newProduct
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getProducts = (req, res) => { 
try {
  let products = readData();
  const {
    search,
    page=1,
    limit=10,
    sort,
    order='asc',
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    color,
    storage,
    inStock,
    discount} =req.query;

    let filteredProducts = [...products];

    // serch
    if(search){
      const searchTerm = search.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(p =>
        p.name?.toLowerCase().includes(searchTerm) || 
        p.description?.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm)
      );

    }


    //Category filter
    if(category){
      const categories = category.split(',');
      filteredProducts = filteredProducts.filter(p =>
        categories.includes(p.category)
      );
    }


    //Brand filter 

    if(brand){
      const brands = brand.split(',');
      filteredProducts = filteredProducts.filter(p =>
        brands.includes(p.brand)
      );
    }


    //price range filter

    if(minPrice){
      filteredProducts = filteredProducts.filter(p =>
        p.price >= Number(minPrice)
      );
    }

    if(maxPrice){
      filteredProducts = filteredProducts.filter(p =>
        p.price <= Number(maxPrice)
      );
    }

    //Rating filter
    if(minRating){
      filteredProducts = filteredProducts.filter(p =>
        p.rating >= Number(minRating)
      )
    }

    //color variant filter
    if(color){
      const colors = color.split(',');
      filteredProducts = filteredProducts.filter(p =>
        p.variants?.color?.some(c =>
          colors.some(col => col.toLowerCase() === c.toLowerCase())
        )
      );
    }


    //storage variant filter
    if(storage){
      const storages = storage.split(',');
      filteredProducts = filteredProducts.filter(p =>
        p.variants?.storage?.some(s =>storages.includes(s))
      );
    }

    //stock filter
    if(inStock === 'true'){
      filteredProducts = filteredProducts.filter(p => 
        p.stock > 0);
    }else if(inStock === 'false'){
      filteredProducts = filteredProducts.filter(p =>
        p.stock === 0 
      )
    }

//discount filter
if(discount === 'true'){
  filteredProducts = filteredProducts.filter(p =>
    p.discountPrice && p.discountPrice < p.price
  )
}

//Sorting
if(sort){
  filteredProducts.sort((a,b)=>{
    let aVal = a[sort];
    let bVal = b[sort];

    if(aVal === undefined || bVal === undefined)return 0;
    
    if (typeof aVal === 'string'){
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if(typeof aVal === 'number'){
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  })
}

//Pagination
const pageNum = Number(page);
const limitNum = Number(limit);
const startIndex = (pageNum - 1) * limitNum;
const endIndex = startIndex + limitNum;

const paginatedProducts = filteredProducts.slice(startIndex, endIndex);



//Response
res.status(200).json({
  success : true,
  data : paginatedProducts,
  pagination :{
    currentPage : pageNum,
    totalPages : Math.ceil(filteredProducts.length / limitNum),
    totalItems : filteredProducts.length,
    itemsPerPage : limitNum,
    hasNextPage : endIndex < filteredProducts.length,
    hasPrevPage : startIndex > 0
    
  },
   filters: {
    categories: [...new Set(filteredProducts.map(p => p.category))],
    brands: [...new Set(filteredProducts.map(p => p.brand))],
    colors: [...new Set(filteredProducts.flatMap(p => p.variants?.color || []))],
    storages: [...new Set(filteredProducts.flatMap(p => p.variants?.storage || []))]
  }
 
})

}
  
catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching filter options',
            error: error.message
        });
    }
};


exports.getProductById = (req, res) => {
  try {
    const products = readData();

    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateProduct = (req, res) => {
  try {
    let products = readData();

    const id = req.params.id;

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    let product = products[index];

    // 🔹 Basic Fields Update
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price ? Number(req.body.price) : product.price;
    product.discountPrice = req.body.discountPrice
      ? Number(req.body.discountPrice)
      : product.discountPrice;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.rating = req.body.rating ? Number(req.body.rating) : product.rating;
    product.stock = req.body.stock ? Number(req.body.stock) : product.stock;

    // 🔹 Thumbnail Update (delete old + add new)
    if (req.files?.thumbnail) {
      if (product.thumbnail && fs.existsSync(`.${product.thumbnail}`)) {
        fs.unlinkSync(`.${product.thumbnail}`);
      }
      product.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    // 🔹 Images Update (replace all)
    if (req.files?.images) {
      // delete old images
      if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
          if (fs.existsSync(`.${img}`)) {
            fs.unlinkSync(`.${img}`);
          }
        });
      }

      // add new images
      product.images = req.files.images.map(
        file => `/uploads/${file.filename}`
      );
    }

    // 🔹 Variants Update
    if (req.body.color) {
      product.variants.color = req.body.color
        .split(',')
        .map(c => c.trim());
    }

    if (req.body.storage) {
      product.variants.storage = req.body.storage
        .split(',')
        .map(s => s.trim());
    }

    // 🔹 Update Time
    product.updatedAt = new Date().toISOString();

    // Save
    products[index] = product;
    writeData(products);

    res.json({
      message: "Product Updated Successfully",
      product
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteProduct = (req, res) => {
  try {
    let products = readData();

    const id = req.params.id;

    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[index];

    // 🔹 Delete thumbnail
    if (product.thumbnail && fs.existsSync(`.${product.thumbnail}`)) {
      fs.unlinkSync(`.${product.thumbnail}`);
    }

    // 🔹 Delete all images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (fs.existsSync(`.${img}`)) {
          fs.unlinkSync(`.${img}`);
        }
      });
    }

    // 🔹 Remove product from array
    products.splice(index, 1);

    writeData(products);

    res.json({ message: "Product Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};