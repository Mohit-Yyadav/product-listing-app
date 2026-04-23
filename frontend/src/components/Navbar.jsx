// components/Navbar.jsx - Enhanced with Indian localization and mobile improvements
import React, { useState, useEffect } from "react";

const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode, 
  onRefresh,
  cartCount = 0,
  onCartClick,
  user = null,
  onLoginClick,
  onLogoutClick,
  totalItems = 0
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen, isMobileMenuOpen]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "footwear", label: "Footwear" },
    { value: "home", label: "Home & Kitchen" },
    { value: "books", label: "Books" }
  ];

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // You can implement category-based search here
  };

  const isMobile = windowWidth < 768;

  return (
    <nav style={styles.navbar}>
      {/* Top Bar */}
      <div style={styles.navContainer}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.mobileMenuBtn}
            className="mobile-menu-btn"
          >
            <i className="fas fa-bars"></i>
          </button>
        )}

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🛒</span>
          <span style={styles.logoText}>amazon</span>
          <span style={styles.logoDot}>.</span>
          <span style={styles.logoSub}>clone</span>
        </div>

        {/* Delivery Location - Hide on mobile */}
        {!isMobile && (
          <div style={styles.delivery}>
            <i className="fas fa-map-marker-alt" style={styles.deliveryIcon}></i>
            <div>
              <div style={styles.deliveryLabel}>Deliver to</div>
              <div style={styles.deliveryLocation}>India 110001</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          {!isMobile && (
            <select 
              style={{
                ...styles.searchSelect,
                borderColor: isSearchFocused ? "#ff9900" : "#f3f3f3"
              }}
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            style={{
              ...styles.searchInput,
              borderColor: isSearchFocused ? "#ff9900" : "transparent",
              borderRadius: isMobile ? "4px" : "0"
            }}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <button 
            style={styles.searchButton}
            onClick={() => setSearchQuery(searchQuery)}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Language Selector - Hide on mobile */}
        {!isMobile && (
          <div style={styles.language}>
            <i className="fas fa-globe" style={styles.languageIcon}></i>
            <span>EN</span>
            <i className="fas fa-chevron-down" style={styles.languageArrow}></i>
          </div>
        )}

        {/* Account & Lists - Hide on mobile */}
        {!isMobile && (
          <div 
            className="profile-dropdown"
            style={styles.navItem}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div style={styles.navItemLabel}>
              Hello, {user ? user.name : "Sign in"}
            </div>
            <div style={styles.navItemValue}>
              Account & Lists
              <i className="fas fa-chevron-down" style={styles.dropdownArrow}></i>
            </div>
            
            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div style={styles.dropdownMenu}>
                {!user ? (
                  <>
                    <button 
                      style={styles.signInBtn}
                      onClick={onLoginClick}
                    >
                      Sign in
                    </button>
                    <div style={styles.dropdownDivider}></div>
                    <div style={styles.dropdownItem}>New customer? Start here</div>
                  </>
                ) : (
                  <>
                    <div style={styles.dropdownUser}>
                      <strong>{user.name}</strong>
                      <div style={styles.dropdownUserEmail}>{user.email}</div>
                    </div>
                    <div style={styles.dropdownDivider}></div>
                    <div style={styles.dropdownItem}>Your Account</div>
                    <div style={styles.dropdownItem}>Your Orders</div>
                    <div style={styles.dropdownItem}>Your Lists</div>
                    <div style={styles.dropdownDivider}></div>
                    <div 
                      style={styles.dropdownItem}
                      onClick={onLogoutClick}
                    >
                      Sign Out
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Returns & Orders - Hide on mobile */}
        {!isMobile && (
          <div style={styles.navItem}>
            <div style={styles.navItemLabel}>Returns</div>
            <div style={styles.navItemValue}>& Orders</div>
          </div>
        )}

        {/* Cart */}
        <div style={styles.cart} onClick={onCartClick}>
          <i className="fas fa-shopping-cart" style={styles.cartIcon}></i>
          {cartCount > 0 && (
            <span style={styles.cartCount}>{cartCount > 99 ? '99+' : cartCount}</span>
          )}
          <span style={styles.cartText}>Cart</span>
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefresh} 
          style={styles.refreshBtn} 
          title="Refresh products"
          className="refresh-btn"
        >
          <i className="fas fa-sync-alt"></i>
        </button>

        {/* View Toggle */}
        <div style={styles.viewToggle}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === "grid" ? "#ff9900" : "#f0f2f2",
              color: viewMode === "grid" ? "#111" : "#555",
            }}
            title="Grid View"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              ...styles.toggleBtn,
              backgroundColor: viewMode === "list" ? "#ff9900" : "#f0f2f2",
              color: viewMode === "list" ? "#111" : "#555",
            }}
            title="List View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>

      {/* Secondary Navbar - Departments (Hide on mobile) */}
      {!isMobile && (
        <div style={styles.secondaryNav}>
          <div style={styles.secondaryContainer}>
            <div style={styles.allMenu}>
              <i className="fas fa-bars"></i>
              <span>All</span>
            </div>
            <div style={styles.secondaryLinks}>
              <span>Today's Deals</span>
              <span>Customer Service</span>
              <span>Registry</span>
              <span>Gift Cards</span>
              <span>Sell</span>
              <span>Amazon Basics</span>
              <span>Prime Video</span>
              <span>Fashion</span>
              <span>Electronics</span>
              <span>Home & Kitchen</span>
            </div>
            <div style={styles.primeBanner}>
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_logo.svg/1200px-Amazon_Prime_logo.svg.png"
    alt="Prime" 
    style={styles.primeLogo}
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'inline';
    }}
  />
  <span>Try Prime</span>
</div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div style={styles.mobileMenu} className="mobile-menu">
          <div style={styles.mobileMenuItem} onClick={() => {
            setIsMobileMenuOpen(false);
            onLoginClick?.();
          }}>
            <i className="fas fa-user"></i> Sign in
          </div>
          <div style={styles.mobileMenuItem}>
            <i className="fas fa-map-marker-alt"></i> Deliver to India
          </div>
          <div style={styles.mobileMenuItem}>
            <i className="fas fa-globe"></i> Language: English
          </div>
          <div style={styles.mobileDivider}></div>
          <div style={styles.mobileMenuItem}>Today's Deals</div>
          <div style={styles.mobileMenuItem}>Customer Service</div>
          <div style={styles.mobileMenuItem}>Your Orders</div>
          <div style={styles.mobileMenuItem}>Your Lists</div>
          <div style={styles.mobileDivider}></div>
          <div style={styles.mobileMenuItem}>Sell</div>
          <div style={styles.mobileMenuItem}>Amazon Basics</div>
          <div style={styles.mobileMenuItem}>Prime Video</div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#131921",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "8px 20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  logo: {
    display: "flex",
    alignItems: "baseline",
    fontSize: "24px",
    fontWeight: "bold",
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
    padding: "5px 8px",
    borderRadius: "4px",
    transition: "border 0.2s",
  },
  logoIcon: {
    fontSize: "28px",
    marginRight: "4px",
  },
  logoText: {
    fontWeight: "700",
  },
  logoDot: {
    color: "#ff9900",
  },
  logoSub: {
    fontSize: "14px",
    marginLeft: "2px",
    fontWeight: "400",
  },
  delivery: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "white",
    fontSize: "12px",
    padding: "5px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "border 0.2s",
  },
  deliveryIcon: {
    fontSize: "18px",
  },
  deliveryLabel: {
    color: "#ccc",
  },
  deliveryLocation: {
    fontWeight: "bold",
    fontSize: "13px",
  },
  searchContainer: {
    flex: 1,
    display: "flex",
    minWidth: "200px",
    borderRadius: "4px",
    overflow: "hidden",
  },
  searchSelect: {
    backgroundColor: "#f3f3f3",
    border: "1px solid transparent",
    padding: "8px 12px",
    fontSize: "12px",
    cursor: "pointer",
    borderRight: "1px solid #cdcdcd",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid transparent",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchButton: {
    backgroundColor: "#febd69",
    border: "none",
    padding: "0 20px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#111",
    transition: "background-color 0.2s",
  },
  language: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "white",
    fontSize: "13px",
    fontWeight: "bold",
    padding: "5px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  languageIcon: {
    fontSize: "14px",
  },
  languageArrow: {
    fontSize: "10px",
    marginLeft: "2px",
  },
  navItem: {
    position: "relative",
    color: "white",
    fontSize: "12px",
    padding: "5px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  navItemLabel: {
    color: "#ccc",
    fontSize: "11px",
  },
  navItemValue: {
    fontWeight: "bold",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  dropdownArrow: {
    fontSize: "10px",
    marginLeft: "4px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "white",
    minWidth: "220px",
    borderRadius: "4px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "10px 0",
    marginTop: "8px",
    zIndex: 1001,
  },
  signInBtn: {
    width: "calc(100% - 20px)",
    margin: "0 10px",
    padding: "8px",
    backgroundColor: "#ff9900",
    color: "#111",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  dropdownUser: {
    padding: "8px 15px",
    fontSize: "13px",
  },
  dropdownUserEmail: {
    fontSize: "11px",
    color: "#666",
    marginTop: "4px",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#e7e7e7",
    margin: "8px 0",
  },
  dropdownItem: {
    padding: "8px 15px",
    fontSize: "13px",
    color: "#111",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  cart: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "white",
    cursor: "pointer",
    padding: "5px 8px",
    borderRadius: "4px",
    position: "relative",
  },
  cartIcon: {
    fontSize: "28px",
  },
  cartCount: {
    position: "absolute",
    top: "-5px",
    left: "18px",
    color: "#f08804",
    fontWeight: "bold",
    fontSize: "14px",
  },
  cartText: {
    fontWeight: "bold",
    fontSize: "13px",
  },
  refreshBtn: {
    backgroundColor: "transparent",
    border: "1px solid #fff",
    color: "white",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  viewToggle: {
    display: "flex",
    gap: "2px",
    backgroundColor: "#f0f2f2",
    borderRadius: "6px",
    overflow: "hidden",
  },
  toggleBtn: {
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  secondaryNav: {
    backgroundColor: "#232f3e",
    padding: "5px 0",
  },
  secondaryContainer: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    fontSize: "13px",
  },
  allMenu: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "white",
    fontWeight: "bold",
    padding: "6px 8px",
    cursor: "pointer",
  },
  secondaryLinks: {
    display: "flex",
    gap: "15px",
    color: "white",
    flexWrap: "wrap",
    "& span": {
      cursor: "pointer",
      padding: "6px 0",
    },
  },
  primeBanner: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "auto",
    color: "white",
    cursor: "pointer",
  },
  primeLogo: {
    height: "16px",
  },
  mobileMenuBtn: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px",
  },
  mobileMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    maxHeight: "80vh",
    overflowY: "auto",
  },
  mobileMenuItem: {
    padding: "12px 20px",
    fontSize: "14px",
    color: "#111",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #e7e7e7",
  },
  mobileDivider: {
    height: "8px",
    backgroundColor: "#f0f2f2",
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .nav-item:hover, .delivery:hover, .cart:hover, .logo:hover, .language:hover {
    border: 1px solid white;
    padding: 4px 7px;
  }
  
  .refresh-btn:hover {
    background-color: #ff9900 !important;
    border-color: #ff9900 !important;
    color: #111 !important;
  }
  
  .toggle-btn:hover {
    opacity: 0.8;
  }
  
  .search-button:hover {
    background-color: #f3a847;
  }
  
  .dropdown-item:hover {
    background-color: #f0f2f2;
  }
  
  .secondary-links span:hover {
    border: 1px solid white;
    padding: 5px 7px;
  }
  
  .all-menu:hover {
    border: 1px solid white;
    padding: 5px 7px;
  }
  
  .mobile-menu-item:hover {
    background-color: #f0f2f2;
  }
  
  .mobile-menu-btn:hover {
    background-color: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;