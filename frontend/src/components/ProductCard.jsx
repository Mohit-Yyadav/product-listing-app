// ProductCard.jsx - Complete Working Version with Fixed Edit/Delete
import React, { useState } from "react";

const ProductCard = ({ product, viewMode, onEdit, onDelete, onQuickView, onAddToWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Safely access product properties
  const productName = product?.name || "Unnamed Product";
  const productDescription = product?.description || "No description available";
  const productPrice = product?.price || 0;
  const productDiscountPrice = product?.discountPrice;
  const productBrand = product?.brand || "Generic";
  const productRating = product?.rating || 0;
  const productStock = product?.stock || 0;
  const productVariants = product?.variants || {};
  const productId = product?.id || product?._id; // Handle both id formats
  
  // Get all images - thumbnail first
  const thumbnailImage = product?.thumbnail || product?.image;
  const additionalImages = product?.images || [];
  const allImages = thumbnailImage 
    ? [thumbnailImage, ...additionalImages.filter(img => img !== thumbnailImage)]
    : [...additionalImages];
  
  const hasMultipleImages = allImages.length > 1;
  
  // Price calculations
  const finalPrice = productDiscountPrice || productPrice;
  const hasDiscount = productDiscountPrice && productDiscountPrice < productPrice;
  const discountPercent = hasDiscount
    ? Math.round(((productPrice - productDiscountPrice) / productPrice) * 100)
    : 0;
  
  // Handle image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:5000${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `http://localhost:5000/${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };
  
  const currentImageUrl = !imageError && allImages[currentImageIndex]
    ? getImageUrl(allImages[currentImageIndex])
    : "https://ui-avatars.com/api/?background=ff9900&color=fff&size=400&text=NO+IMAGE";
  
  // Image navigation
  const nextImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };
  
  // Render stars
  const renderStars = (rating, size = "small") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    const starSize = size === "large" ? "20px" : "14px";
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="star filled" style={{ fontSize: starSize, color: "#FFA41C" }}>★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="star half" style={{ fontSize: starSize, color: "#FFA41C" }}>½</span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty" style={{ fontSize: starSize, color: "#D5D5D5" }}>☆</span>
        );
      }
    }
    return stars;
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Event Handlers - All with stopPropagation to prevent card click
  const handleCardClick = () => {
    setShowDetailsModal(true);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(productId, productName);
    }
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    }
  };
  
  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setShowDetailsModal(true);
    }
  };
  
  // List View
  if (viewMode === "list") {
    return (
      <>
        <div 
          className="product-card-list"
          style={listStyles.card}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
        >
          {/* Image Section */}
          <div style={listStyles.imageContainer}>
            <img 
              src={currentImageUrl} 
              alt={productName}
              style={listStyles.image}
              onError={() => setImageError(true)}
            />
            {hasDiscount && <span style={listStyles.discountBadge}>-{discountPercent}%</span>}
            
            {hasMultipleImages && isHovered && (
              <>
                <button onClick={prevImage} style={listStyles.navArrowLeft} className="nav-arrow">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button onClick={nextImage} style={listStyles.navArrowRight} className="nav-arrow">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
            
            {hasMultipleImages && (
              <div style={listStyles.imageCounter}>
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div style={listStyles.content}>
            <div style={listStyles.brand}>{productBrand}</div>
            <h3 style={listStyles.title}>{productName}</h3>
            
            <div style={listStyles.rating}>
              {renderStars(productRating)}
              <span style={listStyles.ratingText}>({productRating})</span>
            </div>
            
            <p style={listStyles.description}>
              {productDescription.length > 150 ? productDescription.substring(0, 150) + "..." : productDescription}
            </p>
            
            <div style={listStyles.priceContainer}>
              <span style={listStyles.price}>{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span style={listStyles.oldPrice}>{formatPrice(productPrice)}</span>
                  <span style={listStyles.discount}>Save {formatPrice(productPrice - productDiscountPrice)}</span>
                </>
              )}
            </div>
            
            <div style={listStyles.stock}>
              {productStock > 0 ? (
                <span style={listStyles.inStock}>✓ In Stock ({productStock})</span>
              ) : (
                <span style={listStyles.outOfStock}>✗ Out of Stock</span>
              )}
            </div>
            
            {/* Button Group - All buttons visible */}
            <div style={listStyles.buttonGroup}>
              <button onClick={handleWishlistClick} style={listStyles.wishlistBtn} className="wishlist-btn">
                <i className={`fas fa-heart${isWishlisted ? '' : '-o'}`}></i>
                <span style={{ marginLeft: "5px" }}>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
              </button>
              <button onClick={handleQuickViewClick} style={listStyles.quickViewBtn} className="quick-view-btn">
                <i className="fas fa-eye"></i>
                <span style={{ marginLeft: "5px" }}>Quick View</span>
              </button>
              <button onClick={handleEditClick} style={listStyles.editBtn} className="edit-btn">
                <i className="fas fa-edit"></i>
                <span style={{ marginLeft: "5px" }}>Edit</span>
              </button>
              <button onClick={handleDeleteClick} style={listStyles.deleteBtn} className="delete-btn">
                <i className="fas fa-trash"></i>
                <span style={{ marginLeft: "5px" }}>Delete</span>
              </button>
            </div>
          </div>
        </div>
        
        {showDetailsModal && (
          <ProductDetailsModal 
            product={product}
            onClose={() => setShowDetailsModal(false)}
            onEdit={() => onEdit && onEdit(product)}
            onDelete={() => onDelete && onDelete(productId, productName)}
            formatPrice={formatPrice}
            renderStars={renderStars}
            getImageUrl={getImageUrl}
          />
        )}
      </>
    );
  }
  
  // Grid View
  return (
    <>
      <div 
        className="product-card-grid"
        style={gridStyles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div style={gridStyles.imageContainer}>
          <img 
            src={currentImageUrl} 
            alt={productName}
            style={gridStyles.image}
            onError={() => setImageError(true)}
          />
          {hasDiscount && <span style={gridStyles.discountBadge}>-{discountPercent}%</span>}
          {productStock === 0 && <span style={gridStyles.outOfStockBadge}>Out of Stock</span>}
          
          {/* Wishlist Button - Top Left */}
          <button onClick={handleWishlistClick} style={gridStyles.wishlistBtn} className="wishlist-btn">
            <i className={`fas fa-heart${isWishlisted ? '' : '-o'}`} style={{ color: isWishlisted ? '#e74c3c' : '#fff', fontSize: "16px" }}></i>
          </button>
          
          {/* Navigation Arrows */}
          {hasMultipleImages && isHovered && (
            <>
              <button onClick={prevImage} style={gridStyles.navArrowLeft} className="nav-arrow">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={nextImage} style={gridStyles.navArrowRight} className="nav-arrow">
                <i className="fas fa-chevron-right"></i>
              </button>
            </>
          )}
          
          {/* Image Dots */}
          {hasMultipleImages && (
            <div style={gridStyles.imageDots}>
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  style={{
                    ...gridStyles.imageDot,
                    backgroundColor: currentImageIndex === idx ? "#ff9900" : "rgba(255,255,255,0.5)"
                  }}
                  className="image-dot"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div style={gridStyles.content}>
          <div style={gridStyles.brand}>{productBrand}</div>
          <h3 style={gridStyles.title}>{productName}</h3>
          
          <div style={gridStyles.rating}>
            {renderStars(productRating)}
            <span style={gridStyles.ratingText}>({productRating})</span>
          </div>
          
          <div style={gridStyles.priceContainer}>
            <span style={gridStyles.price}>{formatPrice(finalPrice)}</span>
            {hasDiscount && <span style={gridStyles.oldPrice}>{formatPrice(productPrice)}</span>}
          </div>
          
          <div style={gridStyles.stock}>
            {productStock > 0 ? (
              <span style={gridStyles.inStock}>✓ In Stock</span>
            ) : (
              <span style={gridStyles.outOfStock}>✗ Out of Stock</span>
            )}
          </div>
          
          {/* Button Group - Grid View */}
          <div style={gridStyles.buttonGroup}>
            <button
              onClick={handleQuickViewClick}
              style={gridStyles.quickViewBtn}
              className="quick-view-btn"
              title="Quick View"
            >
              <i className="fas fa-eye"></i>
              <span style={{ marginLeft: "5px" }}>View</span>
            </button>

            <button
              onClick={handleEditClick}
              style={gridStyles.editBtn}
              className="edit-btn"
              title="Edit"
            >
              <i className="fas fa-edit"></i>
              <span style={{ marginLeft: "5px" }}>Edit</span>
            </button>

            <button
              onClick={handleDeleteClick}
              style={gridStyles.deleteBtn}
              className="delete-btn"
              title="Delete"
            >
              <i className="fas fa-trash"></i>
              <span style={{ marginLeft: "5px" }}>Delete</span>
            </button>
          </div>
        </div>
        
        {/* Quick View Overlay */}
        {isHovered && !hasMultipleImages && (
          <div style={gridStyles.quickViewOverlay}>
            <button onClick={handleQuickViewClick} style={gridStyles.quickViewOverlayBtn} className="quick-view-overlay-btn">
              Quick View
            </button>
          </div>
        )}
      </div>
      
      {showDetailsModal && (
        <ProductDetailsModal 
          product={product}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => onEdit && onEdit(product)}
          onDelete={() => onDelete && onDelete(productId, productName)}
          formatPrice={formatPrice}
          renderStars={renderStars}
          getImageUrl={getImageUrl}
        />
      )}
    </>
  );
};

// Product Details Modal Component - FIXED VERSION
const ProductDetailsModal = ({ product, onClose, onEdit, onDelete, formatPrice, renderStars, getImageUrl }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const productName = product?.name || "Unnamed Product";
  const productDescription = product?.description || "No description available";
  const productPrice = product?.price || 0;
  const productDiscountPrice = product?.discountPrice;
  const productBrand = product?.brand || "Generic";
  const productRating = product?.rating || 0;
  const productStock = product?.stock || 0;
  const productVariants = product?.variants || {};
  const productId = product?.id || product?._id;
  
  const finalPrice = productDiscountPrice || productPrice;
  const hasDiscount = productDiscountPrice && productDiscountPrice < productPrice;
  const discountPercent = hasDiscount
    ? Math.round(((productPrice - productDiscountPrice) / productPrice) * 100)
    : 0;
  
  const thumbnailImage = product?.thumbnail || product?.image;
  const additionalImages = product?.images || [];
  const allImages = thumbnailImage 
    ? [thumbnailImage, ...additionalImages.filter(img => img !== thumbnailImage)]
    : [...additionalImages];
  
  const currentImageUrl = !imageError && allImages[selectedImage]
    ? getImageUrl(allImages[selectedImage])
    : "https://ui-avatars.com/api/?background=ff9900&color=fff&size=600&text=NO+IMAGE";
  
  // Fixed handlers
  const handleEdit = (e) => {
    if (e) e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
    onClose();
  };
  
  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
    onClose();
  };
  
  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    },
    container: {
      backgroundColor: "white",
      borderRadius: "12px",
      maxWidth: "1000px",
      width: "90%",
      maxHeight: "90vh",
      overflow: "auto",
      position: "relative",
    },
    header: {
      position: "sticky",
      top: 0,
      backgroundColor: "#232f3e",
      color: "white",
      padding: "15px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
    },
    closeBtn: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "28px",
      cursor: "pointer",
      padding: "0 8px",
    },
    content: {
      padding: "24px",
      display: "flex",
      gap: "30px",
      flexWrap: "wrap",
    },
    imageSection: {
      flex: "1",
      minWidth: "280px",
    },
    mainImage: {
      width: "100%",
      height: "350px",
      objectFit: "contain",
      backgroundColor: "#f8f8f8",
      borderRadius: "8px",
      marginBottom: "15px",
    },
    thumbnailList: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    thumbnail: {
      width: "60px",
      height: "60px",
      objectFit: "cover",
      borderRadius: "4px",
      cursor: "pointer",
      border: "2px solid transparent",
    },
    activeThumbnail: {
      borderColor: "#ff9900",
    },
    infoSection: {
      flex: "1",
      minWidth: "280px",
    },
    brand: {
      fontSize: "14px",
      color: "#565959",
      marginBottom: "8px",
    },
    title: {
      fontSize: "22px",
      fontWeight: "600",
      marginBottom: "12px",
      color: "#111",
    },
    rating: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "15px",
    },
    priceSection: {
      marginBottom: "20px",
      padding: "15px",
      backgroundColor: "#f8f8f8",
      borderRadius: "8px",
    },
    currentPrice: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#B12704",
    },
    originalPrice: {
      fontSize: "16px",
      color: "#565959",
      textDecoration: "line-through",
      marginLeft: "10px",
    },
    discount: {
      fontSize: "14px",
      color: "#cc0c39",
      marginLeft: "10px",
    },
    stock: {
      marginBottom: "20px",
      padding: "10px",
      borderRadius: "4px",
    },
    inStock: { color: "#007600", fontWeight: "500" },
    outOfStock: { color: "#cc0c39", fontWeight: "500" },
    description: {
      marginBottom: "20px",
      lineHeight: "1.6",
      color: "#555",
    },
    variants: { marginBottom: "20px" },
    variantTitle: { fontWeight: "600", marginBottom: "8px" },
    variantTags: { display: "flex", gap: "8px", flexWrap: "wrap" },
    variantTag: {
      padding: "4px 12px",
      backgroundColor: "#f0f0f0",
      borderRadius: "20px",
      fontSize: "12px",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "20px",
      flexWrap: "wrap",
    },
    editBtn: {
      padding: "10px 20px",
      backgroundColor: "#ff9900",
      color: "#111",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
    },
    deleteBtn: {
      padding: "10px 20px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
    },
  };
  
  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2>Product Details</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
        </div>
        
        <div style={modalStyles.content}>
          <div style={modalStyles.imageSection}>
            <img 
              src={currentImageUrl} 
              alt={productName}
              style={modalStyles.mainImage}
              onError={() => setImageError(true)}
            />
            {allImages.length > 1 && (
              <div style={modalStyles.thumbnailList}>
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{
                      ...modalStyles.thumbnail,
                      ...(selectedImage === idx ? modalStyles.activeThumbnail : {})
                    }}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div style={modalStyles.infoSection}>
            <div style={modalStyles.brand}>{productBrand}</div>
            <h1 style={modalStyles.title}>{productName}</h1>
            
            <div style={modalStyles.rating}>
              {renderStars(productRating, "large")}
              <span>({productRating} out of 5)</span>
            </div>
            
            <div style={modalStyles.priceSection}>
              <span style={modalStyles.currentPrice}>{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span style={modalStyles.originalPrice}>{formatPrice(productPrice)}</span>
                  <span style={modalStyles.discount}>-{discountPercent}%</span>
                </>
              )}
            </div>
            
            <div style={{ ...modalStyles.stock, backgroundColor: productStock > 0 ? "#d4edda" : "#f8d7da" }}>
              {productStock > 0 ? (
                <span style={modalStyles.inStock}>✓ In Stock ({productStock} units available)</span>
              ) : (
                <span style={modalStyles.outOfStock}>✗ Out of Stock</span>
              )}
            </div>
            
            <div style={modalStyles.description}>
              <h4>Description:</h4>
              <p>{productDescription}</p>
            </div>
            
            {(productVariants.color?.length > 0 || productVariants.storage?.length > 0) && (
              <div style={modalStyles.variants}>
                {productVariants.color?.length > 0 && (
                  <>
                    <div style={modalStyles.variantTitle}>Available Colors:</div>
                    <div style={modalStyles.variantTags}>
                      {productVariants.color.map((color, idx) => (
                        <span key={idx} style={modalStyles.variantTag}>{color}</span>
                      ))}
                    </div>
                  </>
                )}
                {productVariants.storage?.length > 0 && (
                  <>
                    <div style={{ ...modalStyles.variantTitle, marginTop: "12px" }}>Storage Options:</div>
                    <div style={modalStyles.variantTags}>
                      {productVariants.storage.map((storage, idx) => (
                        <span key={idx} style={modalStyles.variantTag}>{storage}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div style={modalStyles.buttonGroup}>
              <button onClick={handleEdit} style={modalStyles.editBtn}>
                <i className="fas fa-edit"></i> Edit Product
              </button>
              <button onClick={handleDelete} style={modalStyles.deleteBtn}>
                <i className="fas fa-trash"></i> Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const gridStyles = {
  card: {
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  imageContainer: {
    position: "relative",
    paddingTop: "100%",
    background: "#f8f8f8",
    overflow: "hidden",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "16px",
  },
  discountBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#cc0c39",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 1,
  },
  outOfStockBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 1,
    whiteSpace: "nowrap",
  },
  wishlistBtn: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    transition: "all 0.2s",
  },
  navArrowLeft: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    zIndex: 1,
  },
  navArrowRight: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    zIndex: 1,
  },
  imageDots: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
    zIndex: 1,
  },
  imageDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  content: {
    padding: "12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontSize: "12px",
    color: "#565959",
    marginBottom: "4px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 0 6px 0",
    color: "#0F1111",
    lineHeight: "1.2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  ratingText: {
    fontSize: "12px",
    color: "#007185",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  price: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#B12704",
  },
  oldPrice: {
    fontSize: "13px",
    color: "#565959",
    textDecoration: "line-through",
  },
  stock: {
    marginBottom: "12px",
  },
  inStock: {
    fontSize: "12px",
    color: "#007600",
    fontWeight: "500",
  },
  outOfStock: {
    fontSize: "12px",
    color: "#cc0c39",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    marginTop: "auto",
  },
  quickViewBtn: {
    flex: 1,
    padding: "8px",
    background: "#232f3e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    flex: 1,
    padding: "8px",
    background: "#ff9900",
    color: "#111",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quickViewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
    padding: "20px",
    textAlign: "center",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  quickViewOverlayBtn: {
    background: "#ff9900",
    color: "#111",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
};

const listStyles = {
  card: {
    display: "flex",
    gap: "20px",
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "16px",
    position: "relative",
  },
  imageContainer: {
    width: "180px",
    flexShrink: 0,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    borderRadius: "4px",
  },
  discountBadge: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "#cc0c39",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  imageCounter: {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
  },
  navArrowLeft: {
    position: "absolute",
    left: "5px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  navArrowRight: {
    position: "absolute",
    right: "5px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontSize: "12px",
    color: "#565959",
    marginBottom: "4px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "500",
    margin: "0 0 8px 0",
    color: "#007185",
    cursor: "pointer",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "8px",
  },
  ratingText: {
    fontSize: "12px",
    color: "#007185",
  },
  description: {
    fontSize: "13px",
    color: "#555",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  price: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#B12704",
  },
  oldPrice: {
    fontSize: "14px",
    color: "#565959",
    textDecoration: "line-through",
  },
  discount: {
    fontSize: "12px",
    color: "#cc0c39",
    fontWeight: "500",
  },
  stock: {
    marginBottom: "12px",
  },
  inStock: {
    fontSize: "12px",
    color: "#007600",
    fontWeight: "500",
  },
  outOfStock: {
    fontSize: "12px",
    color: "#cc0c39",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
  wishlistBtn: {
    padding: "8px 16px",
    background: "#fff",
    color: "#e74c3c",
    border: "1px solid #d6d6d6",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
  quickViewBtn: {
    padding: "8px 16px",
    background: "#232f3e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
  editBtn: {
    padding: "8px 20px",
    background: "#ff9900",
    color: "#111",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
  deleteBtn: {
    padding: "8px 20px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .product-card-grid:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .product-card-grid:hover .quick-view-overlay {
    opacity: 1;
  }
  
  .product-card-list:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .edit-btn:hover, .quick-view-btn:hover, .wishlist-btn:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
  
  .delete-btn:hover {
    background: #c0392b !important;
    transform: translateY(-1px);
  }
  
  .nav-arrow:hover, .image-dot:hover {
    transform: scale(1.1);
  }
  
  .product-title:hover {
    text-decoration: underline;
    color: #c45500;
  }
  
  .product-card-grid, .product-card-list {
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default ProductCard;