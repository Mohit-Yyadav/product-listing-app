// components/Filters.jsx - Enhanced with better backend integration
import React, { useState, useEffect } from "react";

const Filters = ({ filters, setFilters, categories, brands, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with parent filters
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange({
      min: filters.minPrice || "",
      max: filters.maxPrice || ""
    });
  }, [filters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    const updatedFilters = {
      ...filters,
      [name]: newValue,
    };
    
    setFilters(updatedFilters);
    
    // Callback for parent component if needed
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = { ...priceRange, [name]: value };
    setPriceRange(newPriceRange);
    
    // Update filters with debounce to avoid too many API calls
    const updatedFilters = {
      ...filters,
      minPrice: name === "min" ? value : filters.minPrice,
      maxPrice: name === "max" ? value : filters.maxPrice,
    };
    
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
      inStock: false,
    };
    setFilters(clearedFilters);
    setPriceRange({ min: "", max: "" });
    
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category !== "") count++;
    if (filters.brand && filters.brand !== "") count++;
    if (filters.minPrice && filters.minPrice !== "") count++;
    if (filters.maxPrice && filters.maxPrice !== "") count++;
    if (filters.minRating && filters.minRating !== "") count++;
    if (filters.inStock) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Handle price range apply with Enter key
  const handlePriceKeyPress = (e) => {
    if (e.key === 'Enter') {
      const updatedFilters = {
        ...filters,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      };
      setFilters(updatedFilters);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <i className="fas fa-sliders-h" style={styles.titleIcon}></i>
          <h3 style={styles.title}>Filters</h3>
          {activeFilterCount > 0 && (
            <span style={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </div>
        <div style={styles.headerRight}>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} style={styles.clearBtn}>
              <i className="fas fa-times"></i> Clear all
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={styles.toggleBtn}
            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          >
            <i className={`fas fa-chevron-${isExpanded ? "up" : "down"}`}></i>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={styles.content}>
          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>
                <i className="fas fa-tag" style={styles.filterIcon}></i>
                Category
              </h4>
              <select
                name="category"
                value={filters.category || ""}
                onChange={handleChange}
                style={styles.select}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Brand Filter */}
          {brands && brands.length > 0 && (
            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>
                <i className="fas fa-building" style={styles.filterIcon}></i>
                Brand
              </h4>
              <select
                name="brand"
                value={filters.brand || ""}
                onChange={handleChange}
                style={styles.select}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>
              <i className="fas fa-rupee-sign" style={styles.filterIcon}></i>
              Price Range
            </h4>
            <div style={styles.priceContainer}>
              <div style={styles.priceInputWrapper}>
                <span style={styles.priceCurrency}>₹</span>
                <input
                  type="number"
                  name="min"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={handlePriceChange}
                  onKeyPress={handlePriceKeyPress}
                  style={styles.priceInput}
                  className="filter-price-input"
                  min="0"
                />
              </div>
              <span style={styles.priceSep}>to</span>
              <div style={styles.priceInputWrapper}>
                <span style={styles.priceCurrency}>₹</span>
                <input
                  type="number"
                  name="max"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  onKeyPress={handlePriceKeyPress}
                  style={styles.priceInput}
                  className="filter-price-input"
                  min="0"
                />
              </div>
            </div>
            
            {/* Quick price ranges */}
            <div style={styles.quickPrices}>
              {[
                { label: "Under ₹500", min: 0, max: 500 },
                { label: "₹500 - ₹1000", min: 500, max: 1000 },
                { label: "₹1000 - ₹5000", min: 1000, max: 5000 },
                { label: "₹5000 - ₹10000", min: 5000, max: 10000 },
                { label: "Over ₹10000", min: 10000, max: "" },
              ].map((range, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newMin = range.min;
                    const newMax = range.max;
                    setPriceRange({ min: newMin, max: newMax });
                    setFilters({
                      ...filters,
                      minPrice: newMin,
                      maxPrice: newMax,
                    });
                  }}
                  style={styles.quickPriceBtn}
                  className="quick-price-btn"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>
              <i className="fas fa-star" style={styles.filterIcon}></i>
              Customer Review
            </h4>
            <div style={styles.ratingOptions}>
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="minRating"
                    value={rating}
                    checked={filters.minRating === String(rating)}
                    onChange={handleChange}
                    style={styles.radio}
                  />
                  <div style={styles.ratingStars}>
                    <span style={styles.stars}>
                      {"★".repeat(rating)}
                      {"☆".repeat(5 - rating)}
                    </span>
                    <span style={styles.ratingText}>& up</span>
                  </div>
                </label>
              ))}
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="minRating"
                  value=""
                  checked={filters.minRating === "" || !filters.minRating}
                  onChange={handleChange}
                  style={styles.radio}
                />
                <span>All ratings</span>
              </label>
            </div>
          </div>

          {/* Availability */}
          <div style={styles.filterGroup}>
            <h4 style={styles.filterTitle}>
              <i className="fas fa-box" style={styles.filterIcon}></i>
              Availability
            </h4>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="inStock"
                checked={filters.inStock || false}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>
                <i className="fas fa-check-circle" style={{ color: "#007600", marginRight: "8px" }}></i>
                In Stock Only
              </span>
            </label>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div style={styles.activeFilters}>
              <h4 style={styles.filterTitle}>Active Filters</h4>
              <div style={styles.activeFilterList}>
                {filters.category && (
                  <span style={styles.activeFilterTag} className="active-filter-tag">
                    Category: {filters.category}
                    <button
                      onClick={() => setFilters({ ...filters, category: "" })}
                      style={styles.removeFilter}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.brand && (
                  <span style={styles.activeFilterTag} className="active-filter-tag">
                    Brand: {filters.brand}
                    <button
                      onClick={() => setFilters({ ...filters, brand: "" })}
                      style={styles.removeFilter}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span style={styles.activeFilterTag} className="active-filter-tag">
                    Price: ₹{filters.minPrice || "0"} - {filters.maxPrice || "∞"}
                    <button
                      onClick={() => {
                        setFilters({ ...filters, minPrice: "", maxPrice: "" });
                        setPriceRange({ min: "", max: "" });
                      }}
                      style={styles.removeFilter}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minRating && (
                  <span style={styles.activeFilterTag} className="active-filter-tag">
                    Rating: {filters.minRating}★ & up
                    <button
                      onClick={() => setFilters({ ...filters, minRating: "" })}
                      style={styles.removeFilter}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.inStock && (
                  <span style={styles.activeFilterTag} className="active-filter-tag">
                    In Stock Only
                    <button
                      onClick={() => setFilters({ ...filters, inStock: false })}
                      style={styles.removeFilter}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    position: "sticky",
    top: "80px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e7e7e7",
    cursor: "pointer",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111",
    margin: 0,
  },
  titleIcon: {
    color: "#ff9900",
    fontSize: "18px",
  },
  filterBadge: {
    backgroundColor: "#ff9900",
    color: "#111",
    borderRadius: "20px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "600",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#007185",
    cursor: "pointer",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.2s",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    padding: "4px",
    transition: "color 0.2s",
  },
  content: {
    padding: "20px",
  },
  filterGroup: {
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e7e7e7",
    animation: "fadeIn 0.3s ease",
  },
  filterTitle: {
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#111",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterIcon: {
    color: "#ff9900",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d6d6d6",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  priceContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "12px",
  },
  priceInputWrapper: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  priceCurrency: {
    position: "absolute",
    left: "10px",
    color: "#666",
    fontSize: "14px",
  },
  priceInput: {
    width: "100%",
    padding: "10px 10px 10px 28px",
    fontSize: "14px",
    border: "1px solid #d6d6d6",
    borderRadius: "6px",
    transition: "border-color 0.2s",
  },
  priceSep: {
    color: "#555",
    fontSize: "14px",
  },
  quickPrices: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },
  quickPriceBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    backgroundColor: "#f8f8f8",
    border: "1px solid #d6d6d6",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  ratingOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  radio: {
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  ratingStars: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  stars: {
    color: "#ffa41c",
    letterSpacing: "2px",
    fontSize: "14px",
  },
  ratingText: {
    color: "#555",
    fontSize: "12px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  checkbox: {
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
  activeFilters: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e7e7e7",
  },
  activeFilterList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  activeFilterTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px 4px 12px",
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#111",
  },
  removeFilter: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    padding: "0 2px",
    transition: "color 0.2s",
  },
};

// Add global styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .filter-select:hover, .filter-price-input:hover {
    border-color: #ff9900;
  }
  
  .filter-select:focus, .filter-price-input:focus {
    outline: none;
    border-color: #ff9900;
    box-shadow: 0 0 0 2px rgba(255,153,0,0.2);
  }
  
  .quick-price-btn:hover {
    background-color: #ff9900;
    border-color: #ff9900;
    color: #111;
  }
  
  .active-filter-tag:hover {
    background-color: #e0e0e0;
  }
  
  .remove-filter:hover {
    color: #e74c3c;
  }
  
  .clear-btn:hover {
    color: #ff9900;
  }
  
  .toggle-btn:hover {
    color: #ff9900;
  }
  
  /* Scrollbar styling */
  .filters-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .filters-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .filters-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  .filters-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;
document.head.appendChild(styleSheet);

export default Filters;