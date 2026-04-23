// src/components/ProductForm.jsx - Enhanced with Drag & Drop, Rich Text, Better Validation
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ProductForm = ({ product, onSubmit, onClose, categories, brands }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    rating: "",
    stock: "",
    color: "",
    storage: ""
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const API_BASE_URL = "http://localhost:5000/api";

  // Load product data when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        category: product.category || "",
        brand: product.brand || "",
        rating: product.rating || "",
        stock: product.stock || "",
        color: product.variants?.color?.join(", ") || "",
        storage: product.variants?.storage?.join(", ") || ""
      });

      // Set image previews from existing product
      if (product.thumbnail && product.thumbnail !== 'null') {
        const thumbnailUrl = product.thumbnail.startsWith('http') 
          ? product.thumbnail 
          : `${API_BASE_URL}${product.thumbnail}`;
        setThumbnailPreview(thumbnailUrl);
      }
      
      if (product.images && product.images.length > 0) {
        const previews = product.images.map(img => 
          img.startsWith('http') ? img : `${API_BASE_URL}${img}`
        );
        setImagePreviews(previews);
      }
    }
  }, [product]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }
    
    if (!form.price) {
      newErrors.price = "Price is required";
    } else if (parseFloat(form.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    if (!form.brand) {
      newErrors.brand = "Brand is required";
    }
    
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price)) {
      newErrors.discountPrice = "Discount price must be less than original price";
    }
    
    if (form.rating && (parseFloat(form.rating) < 0 || parseFloat(form.rating) > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    
    if (form.stock && parseInt(form.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop for images
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  // Handle multiple images selection
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
    if (imagePreviews.length + files.length > 5) {
      alert('You can upload maximum 5 images');
      return;
    }
    
    const validFiles = [];
    const validPreviews = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB`);
        continue;
      }
      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result);
        if (validPreviews.length === validFiles.length) {
          setImageFiles(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...validPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image from selection
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  // Submit form using FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the errors before submitting");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Append all text fields
      Object.keys(form).forEach(key => {
        if (form[key] && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });
      
      // Append thumbnail file
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      // Append image files
      imageFiles.forEach((imageFile) => {
        formData.append('images', imageFile);
      });
      
      let response;
      
      if (product && product.id) {
        response = await axios.put(
          `${API_BASE_URL}/products/${product.id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        alert("✅ Product Updated Successfully!");
      } else {
        response = await axios.post(
          `${API_BASE_URL}/products`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        alert("✅ Product Created Successfully!");
      }

      if (onSubmit) {
        onSubmit(response.data.product || response.data);
      }

      // Reset form only for create mode
      if (!product) {
        setForm({
          name: "",
          description: "",
          price: "",
          discountPrice: "",
          category: "",
          brand: "",
          rating: "",
          stock: "",
          color: "",
          storage: ""
        });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setImageFiles([]);
        setImagePreviews([]);
      }

      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }

    } catch (err) {
      console.error("Error saving product:", err);
      let errorMessage = "Error saving product. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.join(', ');
      } else if (err.request) {
        errorMessage = "Cannot connect to server. Please check if backend is running";
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      overflowY: "auto",
      padding: "20px",
    },
    container: {
      maxWidth: "1000px",
      width: "100%",
      backgroundColor: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      backgroundColor: "#232f3e",
      color: "white",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    headerIcon: {
      fontSize: "28px",
    },
    headerTitle: {
      fontSize: "20px",
      fontWeight: "600",
      margin: 0,
    },
    editBadge: {
      backgroundColor: "#ff9900",
      color: "#111",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      marginLeft: "12px",
    },
    closeButton: {
      background: "none",
      border: "none",
      color: "white",
      fontSize: "28px",
      cursor: "pointer",
      padding: "0 8px",
    },
    tabs: {
      display: "flex",
      borderBottom: "1px solid #e7e7e7",
      backgroundColor: "#fafafa",
      padding: "0 24px",
    },
    tab: {
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      border: "none",
      background: "none",
      color: "#666",
      transition: "all 0.2s",
    },
    activeTab: {
      color: "#ff9900",
      borderBottom: "2px solid #ff9900",
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: "24px",
    },
    formSection: {
      marginBottom: "32px",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#111",
      marginBottom: "20px",
      paddingBottom: "8px",
      borderBottom: "2px solid #ff9900",
      display: "inline-block",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px",
    },
    formGroupFull: {
      gridColumn: "span 2",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#111",
      marginBottom: "6px",
    },
    labelRequired: {
      color: "#c40000",
      marginLeft: "4px",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: "1px solid #d6d6d6",
      borderRadius: "6px",
      transition: "all 0.2s",
      outline: "none",
    },
    errorInput: {
      borderColor: "#c40000",
    },
    errorText: {
      color: "#c40000",
      fontSize: "11px",
      marginTop: "4px",
    },
    textarea: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: "1px solid #d6d6d6",
      borderRadius: "6px",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "inherit",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: "1px solid #d6d6d6",
      borderRadius: "6px",
      backgroundColor: "white",
      cursor: "pointer",
    },
    fileUploadArea: {
      border: `2px dashed ${isDragging ? "#ff9900" : "#d6d6d6"}`,
      borderRadius: "8px",
      padding: "30px",
      textAlign: "center",
      backgroundColor: isDragging ? "#fff5e6" : "#fafafa",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    previewContainer: {
      display: "flex",
      gap: "15px",
      flexWrap: "wrap",
      marginTop: "15px",
    },
    previewItem: {
      position: "relative",
      width: "100px",
      height: "100px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #ddd",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    removeBtn: {
      position: "absolute",
      top: "5px",
      right: "5px",
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "22px",
      height: "22px",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    thumbnailPreview: {
      width: "120px",
      height: "120px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "2px solid #ff9900",
      marginTop: "10px",
      position: "relative",
    },
    removeThumbnailBtn: {
      position: "absolute",
      top: "5px",
      right: "5px",
      backgroundColor: "rgba(0,0,0,0.7)",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "22px",
      height: "22px",
      cursor: "pointer",
    },
    buttonGroup: {
      padding: "20px 24px",
      backgroundColor: "#fafafa",
      display: "flex",
      gap: "15px",
      justifyContent: "flex-end",
      borderTop: "1px solid #e7e7e7",
    },
    submitBtn: {
      backgroundColor: "#ff9900",
      color: "#111",
      border: "none",
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    cancelBtn: {
      backgroundColor: "#e7e7e7",
      color: "#111",
      border: "none",
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "6px",
      cursor: "pointer",
    },
    clearBtn: {
      backgroundColor: "transparent",
      color: "#666",
      border: "1px solid #d6d6d6",
      padding: "10px 24px",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "6px",
      cursor: "pointer",
      marginRight: "auto",
    },
    infoText: {
      fontSize: "11px",
      color: "#666",
      marginTop: "5px",
    },
    ratingContainer: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    starIcon: {
      color: "#ffa41c",
      fontSize: "18px",
    },
  };

  return (
    <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.headerIcon}>📦</span>
            <h1 style={styles.headerTitle}>
              {product ? "Edit Product" : "Add New Product"}
            </h1>
            {product && <span style={styles.editBadge}>Editing: {product.name}</span>}
          </div>
          <button onClick={onClose} style={styles.closeButton}>&times;</button>
        </div>

        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tab, ...(activeTab === "basic" && styles.activeTab) }}
            onClick={() => setActiveTab("basic")}
          >
            Basic Info
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === "pricing" && styles.activeTab) }}
            onClick={() => setActiveTab("pricing")}
          >
            Pricing & Stock
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === "images" && styles.activeTab) }}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
        </div>

        <div style={styles.content}>
          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && (
              <div style={styles.formSection}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>
                      Product Name <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      style={{ ...styles.input, ...(errors.name && styles.errorInput) }}
                      placeholder="e.g., Apple iPhone 15 Pro Max"
                    />
                    {errors.name && <div style={styles.errorText}>{errors.name}</div>}
                  </div>
                  
                  <div>
                    <label style={styles.label}>
                      Brand <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      style={{ ...styles.input, ...(errors.brand && styles.errorInput) }}
                      placeholder="e.g., Apple, Samsung"
                    />
                    {errors.brand && <div style={styles.errorText}>{errors.brand}</div>}
                  </div>
                  
                  <div style={styles.formGroupFull}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      style={styles.textarea}
                      placeholder="Detailed product description..."
                    />
                  </div>
                  
                  <div>
                    <label style={styles.label}>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g., Electronics, Clothing"
                    />
                  </div>
                  
                  <div>
                    <label style={styles.label}>Rating</label>
                    <div style={styles.ratingContainer}>
                      <input
                        type="number"
                        name="rating"
                        step="0.1"
                        min="0"
                        max="5"
                        value={form.rating}
                        onChange={handleChange}
                        style={{ ...styles.input, width: "100px" }}
                      />
                      <span style={styles.starIcon}>★</span>
                      <span style={{ fontSize: "13px", color: "#666" }}>/ 5.0</span>
                    </div>
                    {errors.rating && <div style={styles.errorText}>{errors.rating}</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div style={styles.formSection}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>
                      Price (₹) <span style={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      style={{ ...styles.input, ...(errors.price && styles.errorInput) }}
                      placeholder="999.99"
                    />
                    {errors.price && <div style={styles.errorText}>{errors.price}</div>}
                  </div>
                  
                  <div>
                    <label style={styles.label}>Discount Price (₹)</label>
                    <input
                      type="number"
                      name="discountPrice"
                      step="0.01"
                      value={form.discountPrice}
                      onChange={handleChange}
                      style={{ ...styles.input, ...(errors.discountPrice && styles.errorInput) }}
                      placeholder="799.99"
                    />
                    {errors.discountPrice && <div style={styles.errorText}>{errors.discountPrice}</div>}
                    <div style={styles.infoText}>Leave empty if no discount</div>
                  </div>
                  
                  <div>
                    <label style={styles.label}>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      style={{ ...styles.input, ...(errors.stock && styles.errorInput) }}
                      placeholder="100"
                    />
                    {errors.stock && <div style={styles.errorText}>{errors.stock}</div>}
                  </div>
                  
                  <div>
                    <label style={styles.label}>Color Variants</label>
                    <input
                      type="text"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Black, White, Blue (comma separated)"
                    />
                  </div>
                  
                  <div>
                    <label style={styles.label}>Storage Variants</label>
                    <input
                      type="text"
                      name="storage"
                      value={form.storage}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="128GB, 256GB, 512GB (comma separated)"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div style={styles.formSection}>
                {/* Thumbnail Upload */}
                <div style={{ marginBottom: "30px" }}>
                  <label style={styles.label}>
                    Thumbnail Image <span style={styles.labelRequired}>*</span>
                  </label>
                  <div
                    style={styles.fileUploadArea}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      style={{ display: "none" }}
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" style={{ cursor: "pointer", display: "block" }}>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: "40px", color: "#ff9900" }}></i>
                      <p style={{ margin: "10px 0 0", fontSize: "14px" }}>Click or drag to upload thumbnail</p>
                      <p style={{ fontSize: "12px", color: "#666" }}>PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                  {thumbnailPreview && (
                    <div style={styles.thumbnailPreview}>
                      <img src={thumbnailPreview} alt="Thumbnail" style={styles.previewImage} />
                      <button type="button" onClick={removeThumbnail} style={styles.removeThumbnailBtn}>×</button>
                    </div>
                  )}
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <label style={styles.label}>Additional Images (Max 5)</label>
                  <div
                    style={styles.fileUploadArea}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      style={{ display: "none" }}
                      id="images-upload"
                    />
                    <label htmlFor="images-upload" style={{ cursor: "pointer", display: "block" }}>
                      <i className="fas fa-images" style={{ fontSize: "40px", color: "#ff9900" }}></i>
                      <p style={{ margin: "10px 0 0", fontSize: "14px" }}>Click or drag to upload images</p>
                      <p style={{ fontSize: "12px", color: "#666" }}>You can select multiple files</p>
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div style={styles.previewContainer}>
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} style={styles.previewItem}>
                          <img src={preview} alt={`Preview ${idx + 1}`} style={styles.previewImage} />
                          <button type="button" onClick={() => removeImage(idx)} style={styles.removeBtn}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={styles.buttonGroup}>
              {!product && (
                <button type="button" onClick={() => {
                  setForm({
                    name: "", description: "", price: "", discountPrice: "",
                    category: "", brand: "", rating: "", stock: "", color: "", storage: ""
                  });
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  setImageFiles([]);
                  setImagePreviews([]);
                  setErrors({});
                }} style={styles.clearBtn}>
                  <i className="fas fa-eraser"></i> Clear All
                </button>
              )}
              <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> {product ? "Updating..." : "Creating..."}</>
                ) : (
                  <><i className={`fas fa-${product ? "save" : "plus-circle"}`}></i> {product ? "Update Product" : "Create Product"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;