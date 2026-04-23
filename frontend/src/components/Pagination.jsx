// components/Pagination.jsx - With page size selector
import React, { useState, useEffect } from "react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  paginate,
  totalItems = 0,
  pageSize = 12,
  onPageSizeChange,
  siblingCount = 1,
  showFirstLast = true,
  onPageChange 
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const maxVisible = isMobile ? 3 : 5;

  const pageSizeOptions = [12, 24, 48, 96];

  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSibling = Math.max(currentPage - siblingCount, 1);
      const rightSibling = Math.min(currentPage + siblingCount, totalPages);
      const showLeftEllipsis = leftSibling > 2;
      const showRightEllipsis = rightSibling < totalPages - 1;

      if (showFirstLast) {
        pages.push(1);
      }

      if (showLeftEllipsis) {
        pages.push("...");
      }

      for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (showRightEllipsis) {
        pages.push("...");
      }

      if (showFirstLast && totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      paginate(page);
      if (onPageChange) {
        onPageChange(page);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={styles.container}>
      <div style={styles.paginationControls}>
        {/* First Page Button */}
        {showFirstLast && !isMobile && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            style={{
              ...styles.button,
              ...(currentPage === 1 ? styles.disabled : {}),
            }}
            title="First Page"
          >
            <i className="fas fa-angle-double-left"></i>
          </button>
        )}

        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...styles.button,
            ...(currentPage === 1 ? styles.disabled : {}),
          }}
          title="Previous Page"
        >
          <i className="fas fa-chevron-left"></i>
          {!isMobile && <span> Previous</span>}
        </button>

        {/* Page Numbers */}
        <div style={styles.pages}>
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageChange(page)}
              style={{
                ...styles.pageBtn,
                ...(currentPage === page ? styles.activePage : {}),
                ...(page === "..." ? styles.dots : {}),
              }}
              disabled={page === "..."}
              aria-label={page === "..." ? "More pages" : `Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...styles.button,
            ...(currentPage === totalPages ? styles.disabled : {}),
          }}
          title="Next Page"
        >
          {!isMobile && <span>Next </span>}
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Last Page Button */}
        {showFirstLast && !isMobile && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.button,
              ...(currentPage === totalPages ? styles.disabled : {}),
            }}
            title="Last Page"
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        )}
      </div>

      {/* Page Size Selector and Info */}
      <div style={styles.infoContainer}>
        {totalItems > 0 && (
          <div style={styles.itemInfo}>
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
        )}
        
        {onPageSizeChange && (
          <div style={styles.pageSizeSelector}>
            <label style={styles.pageSizeLabel}>Show:</label>
            <select 
              value={pageSize} 
              onChange={handlePageSizeChange}
              style={styles.pageSizeSelect}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
    padding: "20px 0",
  },
  paginationControls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 14px",
    backgroundColor: "white",
    border: "1px solid #d6d6d6",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#111",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  pages: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageBtn: {
    minWidth: "36px",
    height: "36px",
    padding: "0 10px",
    backgroundColor: "white",
    border: "1px solid #d6d6d6",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#111",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activePage: {
    backgroundColor: "#ff9900",
    borderColor: "#ff9900",
    color: "#111",
    fontWeight: "bold",
    cursor: "default",
  },
  dots: {
    cursor: "default",
    border: "none",
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
  infoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: "13px",
    color: "#555",
  },
  itemInfo: {
    padding: "6px 12px",
    backgroundColor: "#f8f8f8",
    borderRadius: "6px",
  },
  pageSizeSelector: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  pageSizeLabel: {
    fontSize: "13px",
    color: "#555",
  },
  pageSizeSelect: {
    padding: "6px 10px",
    border: "1px solid #d6d6d6",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
  },
};

// Add hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .pagination-button:not(:disabled):hover {
    background-color: #f0f2f2;
    border-color: #ff9900;
  }
  
  .page-button:not(:disabled):hover {
    background-color: #f0f2f2;
    border-color: #ff9900;
    transform: translateY(-1px);
  }
  
  .active-page:hover {
    background-color: #e68a00 !important;
    border-color: #e68a00 !important;
  }
  
  .page-size-select:hover {
    border-color: #ff9900;
  }
`;
document.head.appendChild(styleSheet);

export default Pagination;