// ProductCard.jsx - Premium Amazon-Style UI with Complete Functionality
import React, { useState, useEffect } from "react";

const ProductCard = ({ product, viewMode, onEdit, onDelete, onQuickView, onAddToWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Safely access product properties
  const productName = product?.name || "Unnamed Product";
  const productDescription = product?.description || "No description available";
  const productPrice = product?.price || 0;
  const productDiscountPrice = product?.discountPrice;
  const productBrand = product?.brand || "Generic";
  const productRating = product?.rating || 0;
  const productStock = product?.stock || 0;
  const productVariants = product?.variants || {};
  const productId = product?.id || product?._id;
  const totalReviews = product?.reviews?.length || product?.reviewCount || 0;
  
  // Get all images
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
  const totalSavings = hasDiscount ? productPrice - productDiscountPrice : 0;
  
  // Handle image URL
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${BASE_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${BASE_URL}/${imagePath}`;
    return `${BASE_URL}/uploads/${imagePath}`;
  };
  
  const currentImageUrl = !imageError && allImages[currentImageIndex]
    ? getImageUrl(allImages[currentImageIndex])
    : "https://ui-avatars.com/api/?background=FF9900&color=fff&size=400&bold=true&text=NO+IMAGE";
  
  // Image navigation
  const nextImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      setIsLoading(true);
    }
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      setIsLoading(true);
    }
  };
  
  // Render stars with Amazon styling
  const renderStars = (rating, size = "small", reviewCount = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    const starSize = size === "large" ? "18px" : "14px";
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} style={{ fontSize: starSize, color: "#FFA41C", marginRight: "2px" }}>★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} style={{ fontSize: starSize, color: "#FFA41C", marginRight: "2px" }}>½</span>
        );
      } else {
        stars.push(
          <span key={i} style={{ fontSize: starSize, color: "#D5D5D5", marginRight: "2px" }}>☆</span>
        );
      }
    }
    
    if (reviewCount > 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>
          <span style={{ fontSize: size === "large" ? "14px" : "12px", color: "#007185" }}>
            {reviewCount.toLocaleString()} ratings
          </span>
        </div>
      );
    }
    
    return <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>;
  };
  
  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Event Handlers
  const handleCardClick = () => {
    setShowDetailsModal(true);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(productId, productName);
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) onAddToWishlist(productId);
  };
  
  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
    else setShowDetailsModal(true);
  };
  
  // Amazon-style Delivery Message
  const getDeliveryMessage = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 2);
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return `FREE delivery ${deliveryDate.toLocaleDateString('en-US', options)}`;
  };
  
  // List View Component
  if (viewMode === "list") {
    return (
      <>
        <div 
          className="product-card-list"
          style={amazonListStyles.card}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleCardClick}
        >
          {/* Image Section */}
          <div style={amazonListStyles.imageContainer}>
            <div style={{ position: "relative", width: "100%" }}>
              {isLoading && (
                <div style={amazonListStyles.imageSkeleton}>
                  <div className="skeleton-shimmer"></div>
                </div>
              )}
              <img 
                src={currentImageUrl} 
                alt={productName}
                style={{
                  ...amazonListStyles.image,
                  display: isLoading ? "none" : "block"
                }}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsLoading(false);
                }}
              />
              {hasDiscount && (
                <span style={amazonListStyles.discountBadge}>
                  -{discountPercent}%
                </span>
              )}
              
              {hasMultipleImages && isHovered && (
                <>
                  <button onClick={prevImage} style={amazonListStyles.navArrowLeft} className="nav-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button onClick={nextImage} style={amazonListStyles.navArrowRight} className="nav-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}
              
              {hasMultipleImages && (
                <div style={amazonListStyles.imageCounter}>
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
          </div>
          
          {/* Content Section */}
          <div style={amazonListStyles.content}>
            <div style={amazonListStyles.brand}>{productBrand}</div>
            <h3 style={amazonListStyles.title}>{productName}</h3>
            
            <div style={amazonListStyles.ratingSection}>
              {renderStars(productRating, "small", totalReviews)}
            </div>
            
            <div style={amazonListStyles.priceSection}>
              <span style={amazonListStyles.price}>{formatPrice(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span style={amazonListStyles.oldPrice}>{formatPrice(productPrice)}</span>
                  <span style={amazonListStyles.discount}>
                    Save {formatPrice(totalSavings)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
            
            <div style={amazonListStyles.deliveryInfo}>
              <span style={{ color: "#007600", fontWeight: "500" }}>{getDeliveryMessage()}</span>
              {productStock > 0 && productStock < 10 && (
                <span style={{ color: "#CC0C39", fontSize: "12px", marginLeft: "8px" }}>
                  Only {productStock} left in stock
                </span>
              )}
            </div>
            
            <p style={amazonListStyles.description}>
              {productDescription.length > 120 ? productDescription.substring(0, 120) + "..." : productDescription}
            </p>
            
            <div style={amazonListStyles.buttonGroup}>
              <button onClick={handleWishlistClick} style={amazonListStyles.wishlistBtn} className="wishlist-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "#e74c3c" : "none"} stroke={isWishlisted ? "#e74c3c" : "#666"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}</span>
              </button>
              <button onClick={handleQuickViewClick} style={amazonListStyles.quickViewBtn} className="quick-view-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>Quick View</span>
              </button>
              <button onClick={handleEditClick} style={amazonListStyles.editBtn} className="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3l4 4-7 7-4 1 1-4 6-6z"/>
                  <path d="M3 21l4-4"/>
                </svg>
                <span>Edit</span>
              </button>
              <button onClick={handleDeleteClick} style={amazonListStyles.deleteBtn} className="delete-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>Delete</span>
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
  
  // Grid View with Amazon styling
  return (
    <>
      <div 
        className="product-card-grid"
        style={amazonGridStyles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div style={amazonGridStyles.imageContainer}>
          {isLoading && (
            <div style={amazonGridStyles.imageSkeleton}>
              <div className="skeleton-shimmer"></div>
            </div>
          )}
          <img 
            src={currentImageUrl} 
            alt={productName}
            style={{
              ...amazonGridStyles.image,
              display: isLoading ? "none" : "block"
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImageError(true);
              setIsLoading(false);
            }}
          />
          
          {hasDiscount && (
            <span style={amazonGridStyles.discountBadge}>
              -{discountPercent}%
            </span>
          )}
          
          {productStock === 0 && (
            <span style={amazonGridStyles.outOfStockBadge}>
              Out of Stock
            </span>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={handleWishlistClick} 
            style={amazonGridStyles.wishlistBtn} 
            className="wishlist-btn"
            aria-label="Add to wishlist"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "#e74c3c" : "none"} stroke={isWishlisted ? "#e74c3c" : "#fff"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          {/* Navigation Arrows */}
          {hasMultipleImages && isHovered && (
            <>
              <button onClick={prevImage} style={amazonGridStyles.navArrowLeft} className="nav-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button onClick={nextImage} style={amazonGridStyles.navArrowRight} className="nav-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </>
          )}
          
          {/* Image Dots */}
          {hasMultipleImages && (
            <div style={amazonGridStyles.imageDots}>
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                    setIsLoading(true);
                  }}
                  style={{
                    ...amazonGridStyles.imageDot,
                    backgroundColor: currentImageIndex === idx ? "#FF9900" : "rgba(255,255,255,0.6)",
                    width: currentImageIndex === idx ? "10px" : "8px",
                  }}
                  className="image-dot"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div style={amazonGridStyles.content}>
          <div style={amazonGridStyles.brand}>{productBrand}</div>
          <h3 style={amazonGridStyles.title}>{productName}</h3>
          
          <div style={amazonGridStyles.ratingSection}>
            {renderStars(productRating, "small", totalReviews)}
          </div>
          
          <div style={amazonGridStyles.priceContainer}>
            <span style={amazonGridStyles.price}>{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span style={amazonGridStyles.oldPrice}>{formatPrice(productPrice)}</span>
            )}
          </div>
          
          {hasDiscount && (
            <div style={amazonGridStyles.savings}>
              <span style={{ color: "#CC0C39", fontSize: "11px", fontWeight: "500" }}>
                Save {formatPrice(totalSavings)}
              </span>
            </div>
          )}
          
          <div style={amazonGridStyles.deliveryInfo}>
            <span style={{ fontSize: "11px", color: "#007600" }}>
              {getDeliveryMessage()}
            </span>
          </div>
          
          {/* Button Group */}
          <div style={amazonGridStyles.buttonGroup}>
            <button
              onClick={handleQuickViewClick}
              style={amazonGridStyles.quickViewBtn}
              className="quick-view-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>View</span>
            </button>
            <button
              onClick={handleEditClick}
              style={amazonGridStyles.editBtn}
              className="edit-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3l4 4-7 7-4 1 1-4 6-6z"/>
                <path d="M3 21l4-4"/>
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              style={amazonGridStyles.deleteBtn}
              className="delete-btn"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        {/* Quick View Overlay */}
        {isHovered && !hasMultipleImages && (
          <div style={amazonGridStyles.quickViewOverlay}>
            <button onClick={handleQuickViewClick} style={amazonGridStyles.quickViewOverlayBtn}>
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

// Product Details Modal - Amazon Style
const ProductDetailsModal = ({ product, onClose, onEdit, onDelete, formatPrice, renderStars, getImageUrl }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState({});
  
  const productName = product?.name || "Unnamed Product";
  const productDescription = product?.description || "No description available";
  const productPrice = product?.price || 0;
  const productDiscountPrice = product?.discountPrice;
  const productBrand = product?.brand || "Generic";
  const productRating = product?.rating || 0;
  const productStock = product?.stock || 0;
  const productVariants = product?.variants || {};
  const productId = product?.id || product?._id;
  const totalReviews = product?.reviews?.length || product?.reviewCount || 0;
  
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
    : "https://ui-avatars.com/api/?background=FF9900&color=fff&size=600&bold=true&text=NO+IMAGE";
  
  const handleEdit = (e) => {
    if (e) e.stopPropagation();
    if (onEdit) onEdit();
    onClose();
  };
  
  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    if (onDelete) onDelete();
    onClose();
  };
  
  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Product Details</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>×</button>
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
            
            <div style={modalStyles.ratingSection}>
              {renderStars(productRating, "large", totalReviews)}
              <button style={modalStyles.ratingLink}>Write a review</button>
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
            
            {hasDiscount && (
              <div style={modalStyles.savingsDetail}>
                <span>You save: </span>
                <span style={{ fontWeight: "bold", color: "#CC0C39" }}>
                  {formatPrice(productPrice - productDiscountPrice)} ({discountPercent}%)
                </span>
              </div>
            )}
            
            <div style={modalStyles.stockSection}>
              {productStock > 0 ? (
                <>
                  <span style={modalStyles.inStock}>✓ In Stock</span>
                  {productStock < 10 && (
                    <span style={modalStyles.limitedStock}>Only {productStock} left in stock</span>
                  )}
                </>
              ) : (
                <span style={modalStyles.outOfStock}>✗ Out of Stock</span>
              )}
            </div>
            
            <div style={modalStyles.deliverySection}>
              <div style={modalStyles.deliveryRow}>
                <span style={{ fontWeight: "500" }}>Delivery:</span>
                <span>FREE delivery available</span>
              </div>
              <div style={modalStyles.deliveryRow}>
                <span style={{ fontWeight: "500" }}>Returns:</span>
                <span>30-day easy returns</span>
              </div>
            </div>
            
            <div style={modalStyles.description}>
              <h4 style={{ marginBottom: "8px", color: "#0F1111" }}>About this item</h4>
              <p style={{ lineHeight: "1.6", color: "#555" }}>{productDescription}</p>
            </div>
            
            {(productVariants.color?.length > 0 || productVariants.storage?.length > 0) && (
              <div style={modalStyles.variants}>
                {productVariants.color?.length > 0 && (
                  <div style={modalStyles.variantGroup}>
                    <div style={modalStyles.variantTitle}>Color:</div>
                    <div style={modalStyles.variantOptions}>
                      {productVariants.color.map((color, idx) => (
                        <button
                          key={idx}
                          style={{
                            ...modalStyles.variantOption,
                            ...(selectedVariant.color === color ? modalStyles.variantOptionSelected : {})
                          }}
                          onClick={() => setSelectedVariant({ ...selectedVariant, color })}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {productVariants.storage?.length > 0 && (
                  <div style={modalStyles.variantGroup}>
                    <div style={modalStyles.variantTitle}>Storage:</div>
                    <div style={modalStyles.variantOptions}>
                      {productVariants.storage.map((storage, idx) => (
                        <button
                          key={idx}
                          style={{
                            ...modalStyles.variantOption,
                            ...(selectedVariant.storage === storage ? modalStyles.variantOptionSelected : {})
                          }}
                          onClick={() => setSelectedVariant({ ...selectedVariant, storage })}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div style={modalStyles.buttonGroup}>
              <button onClick={handleEdit} style={modalStyles.editBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px" }}>
                  <path d="M17 3l4 4-7 7-4 1 1-4 6-6z"/>
                  <path d="M3 21l4-4"/>
                </svg>
                Edit Product
              </button>
              <button onClick={handleDelete} style={modalStyles.deleteBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "8px" }}>
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Amazon-Styled Grid Styles
const amazonGridStyles = {
  card: {
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #f0f0f0",
  },
  imageContainer: {
    position: "relative",
    paddingTop: "100%",
    background: "#ffffff",
    overflow: "hidden",
  },
  imageSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "20px",
    transition: "transform 0.3s ease",
  },
  discountBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#CC0C39",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 2,
  },
  outOfStockBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 2,
    whiteSpace: "nowrap",
  },
  wishlistBtn: {
    position: "absolute",
    top: "8px",
    left: "8px",
    background: "rgba(0,0,0,0.5)",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    transition: "all 0.2s ease",
  },
  navArrowLeft: {
    position: "absolute",
    left: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    zIndex: 2,
    transition: "all 0.2s ease",
  },
  navArrowRight: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    zIndex: 2,
    transition: "all 0.2s ease",
  },
  imageDots: {
    position: "absolute",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
    zIndex: 2,
  },
  imageDot: {
    height: "8px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    padding: 0,
  },
  content: {
    padding: "12px 12px 16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontSize: "11px",
    color: "#565959",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "400",
    margin: "0 0 6px 0",
    color: "#0F1111",
    lineHeight: "1.3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  ratingSection: {
    marginBottom: "8px",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "4px",
    flexWrap: "wrap",
  },
  price: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#B12704",
  },
  oldPrice: {
    fontSize: "12px",
    color: "#565959",
    textDecoration: "line-through",
  },
  savings: {
    marginBottom: "6px",
  },
  deliveryInfo: {
    marginBottom: "12px",
  },
  buttonGroup: {
    display: "flex",
    gap: "6px",
    marginTop: "auto",
  },
  quickViewBtn: {
    flex: 1,
    padding: "8px 6px",
    background: "#FFD814",
    color: "#0F1111",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },
  editBtn: {
    flex: 1,
    padding: "8px 6px",
    background: "#FF9900",
    color: "#0F1111",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    flex: 1,
    padding: "8px 6px",
    background: "#E74C3C",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },
  quickViewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
    padding: "40px 20px 20px",
    textAlign: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
    pointerEvents: "none",
  },
  quickViewOverlayBtn: {
    background: "#FF9900",
    color: "#0F1111",
    border: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    pointerEvents: "auto",
    transition: "all 0.2s ease",
  },
};

// Amazon-Styled List Styles
const amazonListStyles = {
  card: {
    display: "flex",
    gap: "24px",
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    marginBottom: "16px",
    position: "relative",
    transition: "all 0.2s ease",
    border: "1px solid #f0f0f0",
  },
  imageContainer: {
    width: "200px",
    flexShrink: 0,
    position: "relative",
  },
  imageSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    borderRadius: "4px",
  },
  discountBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#CC0C39",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    zIndex: 1,
  },
  imageCounter: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "500",
  },
  navArrowLeft: {
    position: "absolute",
    left: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
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
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
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
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontSize: "12px",
    color: "#565959",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "400",
    margin: "0 0 8px 0",
    color: "#007185",
    cursor: "pointer",
    lineHeight: "1.3",
  },
  ratingSection: {
    marginBottom: "10px",
  },
  priceSection: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  price: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#B12704",
  },
  oldPrice: {
    fontSize: "16px",
    color: "#565959",
    textDecoration: "line-through",
  },
  discount: {
    fontSize: "13px",
    color: "#CC0C39",
    fontWeight: "500",
  },
  deliveryInfo: {
    marginBottom: "12px",
    fontSize: "13px",
  },
  description: {
    fontSize: "13px",
    color: "#555",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
    flexWrap: "wrap",
  },
  wishlistBtn: {
    padding: "8px 20px",
    background: "white",
    color: "#0F1111",
    border: "1px solid #D5D9D9",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  quickViewBtn: {
    padding: "8px 20px",
    background: "#FFD814",
    color: "#0F1111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  editBtn: {
    padding: "8px 24px",
    background: "#FF9900",
    color: "#0F1111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    padding: "8px 24px",
    background: "#E74C3C",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
};

// Modal Styles
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    animation: "fadeIn 0.2s ease",
  },
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    maxWidth: "1100px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    animation: "slideUp 0.3s ease",
  },
  header: {
    position: "sticky",
    top: 0,
    backgroundColor: "#232F3E",
    color: "white",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "32px",
    cursor: "pointer",
    padding: "0 8px",
    lineHeight: 1,
    transition: "opacity 0.2s ease",
  },
  content: {
    padding: "30px",
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
  },
  imageSection: {
    flex: "1.2",
    minWidth: "300px",
  },
  mainImage: {
    width: "100%",
    height: "400px",
    objectFit: "contain",
    backgroundColor: "#FAFAFA",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #E5E5E5",
  },
  thumbnailList: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  thumbnail: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.2s ease",
  },
  activeThumbnail: {
    borderColor: "#FF9900",
    boxShadow: "0 0 0 2px #FF9900",
  },
  infoSection: {
    flex: "1",
    minWidth: "320px",
  },
  brand: {
    fontSize: "14px",
    color: "#565959",
    marginBottom: "8px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "500",
    marginBottom: "12px",
    color: "#0F1111",
    lineHeight: "1.3",
  },
  ratingSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  ratingLink: {
    background: "none",
    border: "none",
    color: "#007185",
    cursor: "pointer",
    fontSize: "13px",
    textDecoration: "underline",
  },
  priceSection: {
    marginBottom: "12px",
    padding: "12px 0",
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
  },
  currentPrice: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#B12704",
  },
  originalPrice: {
    fontSize: "18px",
    color: "#565959",
    textDecoration: "line-through",
  },
  discount: {
    fontSize: "16px",
    color: "#CC0C39",
    fontWeight: "500",
  },
  savingsDetail: {
    marginBottom: "16px",
    padding: "8px 12px",
    backgroundColor: "#F0F7F0",
    borderRadius: "6px",
    fontSize: "14px",
  },
  stockSection: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#F8F8F8",
    borderRadius: "6px",
  },
  inStock: {
    color: "#007600",
    fontWeight: "500",
    display: "block",
    marginBottom: "4px",
  },
  limitedStock: {
    color: "#CC0C39",
    fontSize: "13px",
  },
  outOfStock: {
    color: "#CC0C39",
    fontWeight: "500",
  },
  deliverySection: {
    marginBottom: "20px",
    padding: "12px",
    backgroundColor: "#F8F8F8",
    borderRadius: "6px",
  },
  deliveryRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "6px",
    fontSize: "14px",
  },
  description: {
    marginBottom: "24px",
  },
  variants: {
    marginBottom: "24px",
  },
  variantGroup: {
    marginBottom: "16px",
  },
  variantTitle: {
    fontWeight: "500",
    marginBottom: "8px",
    color: "#0F1111",
  },
  variantOptions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  variantOption: {
    padding: "8px 16px",
    backgroundColor: "#F0F2F2",
    border: "1px solid #D5D9D9",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.2s ease",
  },
  variantOptionSelected: {
    backgroundColor: "#FF9900",
    borderColor: "#FF9900",
    color: "white",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "24px",
    flexWrap: "wrap",
  },
  editBtn: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#FF9900",
    color: "#0F1111",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  deleteBtn: {
    flex: 1,
    padding: "12px 24px",
    backgroundColor: "#E74C3C",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .product-card-grid:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    border-color: #ddd;
  }
  
  .product-card-grid:hover img {
    transform: scale(1.02);
  }
  
  .product-card-grid:hover .quick-view-overlay {
    opacity: 1;
    pointer-events: auto;
  }
  
  .product-card-list:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    border-color: #ddd;
  }
  
  .edit-btn:hover {
    background: #E68900 !important;
    transform: translateY(-1px);
  }
  
  .quick-view-btn:hover {
    background: #F7CA00 !important;
    transform: translateY(-1px);
  }
  
  .delete-btn:hover {
    background: #C0392B !important;
    transform: translateY(-1px);
  }
  
  .wishlist-btn:hover {
    background: #F0F2F2 !important;
    transform: translateY(-1px);
  }
  
  .nav-arrow:hover {
    background: rgba(0,0,0,0.8) !important;
    transform: translateY(-50%) scale(1.1);
  }
  
  .image-dot:hover {
    transform: scale(1.2);
  }
  
  .product-title:hover {
    text-decoration: underline;
    color: #C45500;
  }
  
  .skeleton-shimmer {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;
document.head.appendChild(styleSheet);

export default ProductCard;