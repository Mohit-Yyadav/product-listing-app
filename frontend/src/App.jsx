// App.jsx - Complete with Amazon-Style Loading Upgrade
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Connecting to server...");
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch products with loading progress simulation
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage("Initializing connection...");
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);
      
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
      
      setLoadingMessage("Fetching products from server...");
      
      const url = `${API_BASE_URL}/api/products${params.toString() ? `?${params.toString()}` : ""}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setLoadingMessage("Processing product data...");
      setLoadingProgress(95);
      
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
      
      setLoadingProgress(100);
      setLoadingMessage("Complete!");
      
      setTimeout(() => {
        setProducts(productsData);
        setFilteredProducts(productsData);
        setTotalPages(pages);
        setTotalItems(total);
        setLoading(false);
      }, 300);
      
      clearInterval(progressInterval);
      
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(`Failed to connect to backend: ${err.message}`);
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  }, [filters, currentPage, productsPerPage, API_BASE_URL]);

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
      
      const response = await fetch(`${API_BASE_URL}/api/products`, {
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
      
      showToast(`✅ Product "${result.product?.name || productData.name}" created successfully!`, 'success');
      
      return result;
    } catch (err) {
      console.error("Error creating product:", err);
      showToast(`❌ ${err.message}`, 'error');
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
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
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
      
      showToast(`✅ Product "${result.product?.name || productData.name}" updated successfully!`, 'success');
      
      return result;
    } catch (err) {
      console.error("Error updating product:", err);
      showToast(`❌ ${err.message}`, 'error');
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
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
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
      
      showToast(`✅ Product "${productName}" deleted successfully!`, 'success');
      
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast(`❌ ${err.message}`, 'error');
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
      await updateProduct(editingProduct.id || editingProduct._id, productData);
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

  // Skeleton Product Card Component
  const SkeletonProductCard = () => (
    <div style={skeletonStyles.card}>
      <div style={skeletonStyles.image}></div>
      <div style={skeletonStyles.content}>
        <div style={skeletonStyles.brand}></div>
        <div style={skeletonStyles.title}></div>
        <div style={skeletonStyles.rating}></div>
        <div style={skeletonStyles.price}></div>
        <div style={skeletonStyles.buttons}>
          <div style={skeletonStyles.button}></div>
          <div style={skeletonStyles.button}></div>
          <div style={skeletonStyles.button}></div>
        </div>
      </div>
    </div>
  );

  const skeletonStyles = {
    card: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    image: {
      paddingTop: "100%",
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    },
    content: {
      padding: "12px",
      flex: 1,
    },
    brand: {
      height: "12px",
      width: "60%",
      background: "#e0e0e0",
      borderRadius: "4px",
      marginBottom: "8px",
      animation: "shimmer 1.5s infinite",
    },
    title: {
      height: "16px",
      width: "90%",
      background: "#e0e0e0",
      borderRadius: "4px",
      marginBottom: "8px",
      animation: "shimmer 1.5s infinite",
    },
    rating: {
      height: "14px",
      width: "40%",
      background: "#e0e0e0",
      borderRadius: "4px",
      marginBottom: "8px",
      animation: "shimmer 1.5s infinite",
    },
    price: {
      height: "20px",
      width: "50%",
      background: "#e0e0e0",
      borderRadius: "4px",
      marginBottom: "12px",
      animation: "shimmer 1.5s infinite",
    },
    buttons: {
      display: "flex",
      gap: "8px",
      marginTop: "auto",
    },
    button: {
      flex: 1,
      height: "32px",
      background: "#e0e0e0",
      borderRadius: "4px",
      animation: "shimmer 1.5s infinite",
    },
  };

  // Amazon-style loading styles
  const amazonLoadingStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "500px",
      padding: "40px",
      background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
      borderRadius: "12px",
      textAlign: "center",
    },
    logoContainer: {
      marginBottom: "40px",
      animation: "fadeInDown 0.5s ease",
    },
    amazonLogo: {
      fontSize: "48px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    amazonText: {
      background: "linear-gradient(135deg, #232f3e 0%, #ff9900 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    dot: {
      color: "#ff9900",
      fontSize: "52px",
    },
    smile: {
      fontSize: "48px",
      animation: "bounce 1s ease infinite",
    },
    progressContainer: {
      width: "100%",
      maxWidth: "400px",
      marginBottom: "30px",
    },
    progressBar: {
      width: "100%",
      height: "6px",
      backgroundColor: "#e0e0e0",
      borderRadius: "3px",
      overflow: "hidden",
      marginBottom: "8px",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #ff9900 0%, #ffcc00 100%)",
      borderRadius: "3px",
      transition: "width 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    progressText: {
      fontSize: "12px",
      color: "#666",
      fontFamily: "monospace",
    },
    messageContainer: {
      marginBottom: "30px",
    },
    loadingIcon: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
      marginBottom: "16px",
    },
    loadingDot: {
      width: "8px",
      height: "8px",
      backgroundColor: "#ff9900",
      borderRadius: "50%",
      animation: "pulse 1.4s ease infinite",
    },
    loadingMessage: {
      fontSize: "14px",
      color: "#555",
      fontWeight: "500",
    },
    tipsContainer: {
      maxWidth: "350px",
      padding: "16px",
      backgroundColor: "rgba(255, 153, 0, 0.1)",
      borderRadius: "8px",
      marginBottom: "24px",
      border: "1px solid rgba(255, 153, 0, 0.2)",
    },
    tipsTitle: {
      fontSize: "12px",
      fontWeight: "bold",
      color: "#ff9900",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    tipsText: {
      fontSize: "13px",
      color: "#666",
      lineHeight: "1.5",
    },
    endpointInfo: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      backgroundColor: "white",
      padding: "8px 16px",
      borderRadius: "20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    endpointLabel: {
      fontSize: "11px",
      color: "#999",
      fontWeight: "500",
    },
    endpointCode: {
      fontSize: "11px",
      fontFamily: "monospace",
      color: "#ff9900",
      background: "#f5f5f5",
      padding: "2px 6px",
      borderRadius: "4px",
    },
  };

  // Toast notification styles
  const toastStyles = {
    position: "fixed",
    top: "80px",
    right: "20px",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "14px 20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    animation: "slideInRight 0.3s ease",
    minWidth: "300px",
    borderLeft: "4px solid",
  };

  return (
    <div className="app">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          ...toastStyles,
          borderLeftColor: toastMessage.type === 'success' ? '#007600' : '#CC0C39'
        }}>
          <span>{toastMessage.message}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
              padding: "0 4px"
            }}
          >
            ×
          </button>
        </div>
      )}
      
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
            <div style={amazonLoadingStyles.container}>
              {/* Amazon Logo Animation */}
              <div style={amazonLoadingStyles.logoContainer}>
                <div style={amazonLoadingStyles.amazonLogo}>
                  <span style={amazonLoadingStyles.amazonText}>amazon</span>
                  <span style={amazonLoadingStyles.dot}>.</span>
                  <span style={amazonLoadingStyles.smile}>🎯</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={amazonLoadingStyles.progressContainer}>
                <div style={amazonLoadingStyles.progressBar}>
                  <div 
                    style={{
                      ...amazonLoadingStyles.progressFill,
                      width: `${loadingProgress}%`
                    }}
                  />
                </div>
                <span style={amazonLoadingStyles.progressText}>
                  {loadingProgress}%
                </span>
              </div>
              
              {/* Loading Message */}
              <div style={amazonLoadingStyles.messageContainer}>
                <div style={amazonLoadingStyles.loadingIcon}>
                  <div style={amazonLoadingStyles.loadingDot}></div>
                  <div style={{...amazonLoadingStyles.loadingDot, animationDelay: "0.2s"}}></div>
                  <div style={{...amazonLoadingStyles.loadingDot, animationDelay: "0.4s"}}></div>
                </div>
                <p style={amazonLoadingStyles.loadingMessage}>{loadingMessage}</p>
              </div>
              
              {/* Loading Tips */}
              <div style={amazonLoadingStyles.tipsContainer}>
                <p style={amazonLoadingStyles.tipsTitle}>✨ Did you know?</p>
                <p style={amazonLoadingStyles.tipsText}>
                  Amazon-style product cards showcase discounts, ratings, and multiple images for better shopping experience!
                </p>
              </div>
              
              {/* Endpoint Info */}
              <div style={amazonLoadingStyles.endpointInfo}>
                <span style={amazonLoadingStyles.endpointLabel}>API Endpoint:</span>
                <code style={amazonLoadingStyles.endpointCode}>
                  {API_BASE_URL}/api/products
                </code>
              </div>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Unable to fetch data from backend</h3>
              <p>{error}</p>
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "8px", margin: "15px 0", textAlign: "left" }}>
                <strong>Troubleshooting steps:</strong>
                <ul style={{ marginTop: "10px", marginLeft: "20px" }}>
                  <li>Make sure your backend server is running on <code>{API_BASE_URL}</code></li>
                  <li>Verify the database connection is working</li>
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
                {loading ? (
                  // Show skeleton cards while loading
                  Array(productsPerPage).fill().map((_, index) => (
                    <SkeletonProductCard key={`skeleton-${index}`} />
                  ))
                ) : (
                  products.map((product) => (
                    <ProductCard 
                      key={product.id || product._id}
                      product={product} 
                      viewMode={viewMode}
                      onEdit={() => handleEditProduct(product)}
                      onDelete={() => deleteProduct(product.id || product._id, product.name)}
                      onQuickView={(product) => console.log('Quick view:', product)}
                      onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
                    />
                  ))
                )}
              </div>
              
              {totalPages > 1 && !loading && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={handlePageChange}
                  totalItems={totalItems}
                  pageSize={productsPerPage}
                />
              )}
              
              {/* Pagination Info */}
              {!loading && totalPages > 1 && (
                <div className="pagination-info">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="page-size-selector">
                    <label>Items per page:</label>
                    <select 
                      value={productsPerPage}
                      onChange={(e) => {
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
              )}
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