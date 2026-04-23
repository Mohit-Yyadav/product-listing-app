// App.jsx - Fully Upgraded with 10 Products Per Page and Enhanced Features
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import ProductCard from "./components/ProductCard";
import Pagination from "./components/Pagination";
import ProductForm from "./components/ProductForm";
import "./App.css";

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Changed to 10 products per page
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter states with sorting
  const [filters, setFilters] = useState({
    searchQuery: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    inStock: false,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const API_BASE_URL = "http://localhost:5000/api";

  // Fetch products from backend API with all filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.searchQuery) params.append("search", filters.searchQuery);
      if (filters.category) params.append("category", filters.category);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.minRating) params.append("minRating", filters.minRating);
      if (filters.inStock) params.append("inStock", "true");
      if (filters.sortBy) params.append("sort", filters.sortBy);
      if (filters.sortOrder) params.append("order", filters.sortOrder);
      
      params.append("page", currentPage);
      params.append("limit", productsPerPage);
      
      const url = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ""}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle backend response structure
      let productsData = [];
      let total = 0;
      let pages = 1;
      
      if (data.success && data.data) {
        productsData = data.data;
        total = data.pagination?.totalItems || productsData.length;
        pages = data.pagination?.totalPages || Math.ceil(total / productsPerPage);
      } else if (Array.isArray(data)) {
        productsData = data;
        total = data.length;
        pages = Math.ceil(data.length / productsPerPage);
      } else {
        productsData = [];
        total = 0;
      }
      
      setProducts(productsData);
      setFilteredProducts(productsData);
      setTotalPages(pages);
      setTotalItems(total);
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Failed to connect to backend: ${err.message}`);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, productsPerPage]);

  // Create new product with FormData
  const createProduct = async (productData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Append all text fields
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price);
      
      if (productData.discountPrice && productData.discountPrice !== '') {
        formData.append('discountPrice', productData.discountPrice);
      }
      if (productData.category) formData.append('category', productData.category);
      if (productData.brand) formData.append('brand', productData.brand);
      if (productData.rating) formData.append('rating', productData.rating);
      if (productData.stock) formData.append('stock', productData.stock);
      if (productData.color) formData.append('color', productData.color);
      if (productData.storage) formData.append('storage', productData.storage);
      
      // Append files
      if (productData.thumbnailFile) {
        formData.append('thumbnail', productData.thumbnailFile);
      }
      
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to create product");
      }
      
      const result = await response.json();
      
      // Reset to first page and refresh
      setCurrentPage(1);
      await fetchProducts();
      
      setShowProductForm(false);
      setEditingProduct(null);
      
      alert(`✅ Product "${result.product?.name || productData.name}" created successfully!`);
      
      return result;
    } catch (err) {
      console.error("Error creating product:", err);
      alert(`❌ ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing product
  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Append all text fields
      formData.append('name', productData.name);
      formData.append('description', productData.description || '');
      formData.append('price', productData.price);
      
      if (productData.discountPrice && productData.discountPrice !== '') {
        formData.append('discountPrice', productData.discountPrice);
      }
      if (productData.category) formData.append('category', productData.category);
      if (productData.brand) formData.append('brand', productData.brand);
      if (productData.rating) formData.append('rating', productData.rating);
      if (productData.stock) formData.append('stock', productData.stock);
      if (productData.color) formData.append('color', productData.color);
      if (productData.storage) formData.append('storage', productData.storage);
      
      // Append new files if provided
      if (productData.thumbnailFile) {
        formData.append('thumbnail', productData.thumbnailFile);
      }
      
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach(file => {
          formData.append('images', file);
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to update product");
      }
      
      const result = await response.json();
      
      await fetchProducts();
      
      setShowProductForm(false);
      setEditingProduct(null);
      
      alert(`✅ Product "${result.product?.name || productData.name}" updated successfully!`);
      
      return result;
    } catch (err) {
      console.error("Error updating product:", err);
      alert(`❌ ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const deleteProduct = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to delete product");
      }
      
      // If current page has no items after deletion, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      await fetchProducts();
      
      alert(`✅ Product "${productName}" deleted successfully!`);
      
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleFormSubmit = async (productData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }
  };

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get unique categories and brands for filters
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  // Calculate displayed items range
  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalItems);

  // Handle page change with scroll to top
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Navbar 
        searchQuery={filters.searchQuery}
        setSearchQuery={(query) => {
          setFilters({ ...filters, searchQuery: query });
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={fetchProducts}
        onAddProduct={() => {
          setEditingProduct(null);
          setShowProductForm(true);
        }}
        totalItems={totalItems}
      />
      
      <div className="main-container">
        <aside className="sidebar">
          <Filters 
            filters={filters}
            setFilters={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            categories={categories}
            brands={brands}
          />
        </aside>
        
        <main className="content">
          {loading && products.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading products from backend API...</p>
              <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                GET {API_BASE_URL}/products
              </p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Unable to fetch data from backend</h3>
              <p>{error}</p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", margin: "15px 0", textAlign: "left" }}>
                <strong>Troubleshooting steps:</strong>
                <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
                  <li>Make sure your backend server is running on <code>http://localhost:5000</code></li>
                  <li>Verify the products.json file exists in your backend directory</li>
                  <li>Check that the route <code>GET /api/products</code> is working</li>
                  <li>Use the "Add Product" button to add products to your database</li>
                </ul>
              </div>
              <button onClick={fetchProducts} className="retry-btn">
                <i className="fas fa-sync-alt"></i> Retry Connection
              </button>
            </div>
          ) : products.length === 0 && !loading ? (
            <div className="no-results">
              <i className="fas fa-box-open"></i>
              <h3>No Products Found</h3>
              <p>Get started by adding your first product!</p>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }} 
                className="add-first-btn"
              >
                <i className="fas fa-plus"></i> Add Your First Product
              </button>
            </div>
          ) : (
            <>
              <div className="results-info">
                <div className="results-left">
                  <i className="fas fa-layer-group"></i>
                  <span>
                    Showing {startItem} to {endItem} of {totalItems} products
                  </span>
                </div>
                <div className="results-right">
                  <select 
                    className="sort-select"
                    value={filters.sortBy}
                    onChange={(e) => {
                      setFilters({ ...filters, sortBy: e.target.value });
                      setCurrentPage(1);
                    }}
                  >
                    <option value="createdAt">Latest Arrivals</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="name">Product Name</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                  <button 
                    className="add-product-btn-header"
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                  >
                    <i className="fas fa-plus"></i> Add Product
                  </button>
                </div>
              </div>
              
              <div className={`products-${viewMode}`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    viewMode={viewMode}
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => deleteProduct(product.id, product.name)}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={handlePageChange}
                  totalItems={totalItems}
                  pageSize={productsPerPage}
                />
              )}
              
              {/* Pagination Info */}
              <div className="pagination-info">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="page-size-selector">
                  <label>Items per page:</label>
                  <select 
                    value={productsPerPage}
                    onChange={(e) => {
                      // This would require backend support
                      console.log(`Change page size to ${e.target.value}`);
                    }}
                    disabled
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
};

export default App;