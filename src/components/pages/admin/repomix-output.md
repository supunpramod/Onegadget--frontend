This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
addProducts.jsx
AdminAllProductView.jsx
dashboard.jsx
EditProducts.jsx
notification.jsx
payment.jsx
repomix.config.json
```

# Files

## File: addProducts.jsx
```javascript
import React, { useState, useEffect } from "react";
import axios from "axios";
import uploadMediaToSupabase from "@/components/utils/mediaUpload";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import { FiUpload, FiImage, FiDollarSign, FiPackage, FiTag, FiShoppingCart } from "react-icons/fi";

export default function AddProducts() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    productId: uuidv4().substring(0, 8).toUpperCase(),
    productName: "",
    altNames: "",
    price: "",
    lastPrices: "",
    stock: "",
    description: "",
    category: "General",
    brand: "Unbranded",
  });

  const categories = ["General", "Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Beauty", "Toys", "Food"];
  const brands = ["Unbranded", "Nike", "Samsung", "Apple", "Sony", "Adidas", "Dell", "LG", "Other"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        alert("Only administrators can add products.");
        navigate("/");
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Generate new product ID
  const generateNewId = () => {
    setFormData(prev => ({
      ...prev,
      productId: uuidv4().substring(0, 8).toUpperCase()
    }));
  };

  // Handle image selection with preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.productName.trim()) {
      alert("Product name is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price");
      return false;
    }
    if (images.length === 0) {
      alert("Please upload at least one image");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Upload images to Supabase
      const imgUrls = await Promise.all(
        images.map(file => uploadMediaToSupabase(file))
      );

      // Prepare payload
      const payload = {
        ...formData,
        productId: `PROD-${formData.productId}`,
        altNames: formData.altNames ? formData.altNames.split(",").map(n => n.trim()).filter(n => n) : [],
        price: parseFloat(formData.price),
        lastPrices: formData.lastPrices ? parseFloat(formData.lastPrices) : parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: imgUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Send to backend
      const res = await axios.post(
        "http://localhost:4000/api/products",
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("Product saved:", res.data);
      
      // Show success message and reset form
      alert("✅ Product uploaded successfully!");
      
      // Reset form
      setFormData({
        productId: uuidv4().substring(0, 8).toUpperCase(),
        productName: "",
        altNames: "",
        price: "",
        lastPrices: "",
        stock: "",
        description: "",
        category: "General",
        brand: "Unbranded",
      });
      setImages([]);
      setImagePreviews([]);
      
      // Optional: Navigate to products page
      // navigate("/products");

    } catch (err) {
      console.error("Upload failed:", err);
      let errorMessage = "Failed to upload product.";
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText;
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <p className="text-blue-100 mt-2">Fill in the product details below</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={generateNewId}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  title="Generate new ID"
                >
                  🔄 New ID
                </button>
                <div className="text-right">
                  <div className="text-sm opacity-90">Product ID</div>
                  <div className="text-xl font-mono font-bold">PROD-{formData.productId}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiShoppingCart className="mr-2" /> Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiTag className="mr-2" /> Alternate Names
                  </label>
                  <input
                    type="text"
                    name="altNames"
                    value={formData.altNames}
                    onChange={handleChange}
                    placeholder="Separate with commas (e.g., iPhone 15, Smartphone)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Other names customers might search for</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiDollarSign className="mr-2" /> Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Previous Price
                    </label>
                    <input
                      type="number"
                      name="lastPrices"
                      value={formData.lastPrices}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiPackage className="mr-2" /> Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand
                    </label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Images & Description */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiImage className="mr-2" /> Product Images *
                  </label>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-3 mb-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{imagePreviews.length} image(s) selected</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <FiUpload className="text-3xl text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-gray-600 font-medium mb-1">Click to upload images</div>
                      <div className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB each</div>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the product features, specifications, etc."
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading Product...
                      </>
                    ) : (
                      "Upload Product"
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    * Required fields. All product information will be saved to our database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: AdminAllProductView.jsx
```javascript
import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiCopy, 
  FiDownload, 
  FiRefreshCw,
  FiPlus
} from "react-icons/fi";
import { MdGridView, MdList } from "react-icons/md";
import Swal from "sweetalert2";

export default function AdminAllProductView() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productsData = res.data?.data || res.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load products',
          confirmButtonColor: '#d33',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, token]);

  // Get unique categories and brands for filters
  const categories = useMemo(() => {
    const allCategories = products.map(p => p.category).filter(Boolean);
    return ["all", ...new Set(allCategories)];
  }, [products]);

  const brands = useMemo(() => {
    const allBrands = products.map(p => p.brand).filter(Boolean);
    return ["all", ...new Set(allBrands)];
  }, [products]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.productName?.toLowerCase().includes(term) ||
        product.productId?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.altNames?.some(name => name.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== "all") {
      result = result.filter(product => product.brand === selectedBrand);
    }

    // Sorting
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        result.sort((a, b) => b.stock - a.stock);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      html: `Are you sure you want to delete <strong>"${productName}"</strong>?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });

        // Remove from state
        setProducts(prev => prev.filter(p => p.productId !== productId));
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: err.response?.data?.message || 'Failed to delete product',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Selection',
        text: 'Please select products to delete',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Bulk Delete?',
      html: `Are you sure you want to delete ${selectedProducts.size} product(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Delete ${selectedProducts.size} Items`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = Array.from(selectedProducts).map(productId =>
          axios.delete(`http://localhost:4000/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        await Promise.all(deletePromises);

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${selectedProducts.size} product(s) deleted`,
          timer: 2000,
          showConfirmButton: false
        });

        // Refresh products
        setProducts(prev => prev.filter(p => !selectedProducts.has(p.productId)));
        setSelectedProducts(new Set());
      } catch (err) {
        console.error("Bulk delete error:", err);
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: 'Failed to delete selected products',
          confirmButtonColor: '#d33',
        });
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === currentProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(currentProducts.map(p => p.productId));
      setSelectedProducts(allIds);
    }
  };

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Product ID copied to clipboard',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Products Management</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products • {selectedProducts.size} selected
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => navigate("/admin/dashboard/addproducts")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition"
          >
            <FiPlus className="mr-2" />
            Add New Product
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-white shadow" : "text-gray-600"}`}
            >
              <MdList size={20} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded ${viewMode === "grid" ? "bg-white shadow" : "text-gray-600"}`}
            >
              <MdGridView size={20} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand === "all" ? "All Brands" : brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock: High to Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Actions</label>
            <div className="flex space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Action</option>
                <option value="delete">Delete Selected</option>
                <option value="export">Export Selected</option>
              </select>
              <button
                onClick={() => bulkAction === "delete" && handleBulkDelete()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                disabled={!bulkAction}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Selection */}
        {selectedProducts.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="text-blue-700 font-medium">
              {selectedProducts.size} product(s) selected
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table (Table View) */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === currentProducts.length && currentProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.productId)}
                          onChange={() => handleSelectProduct(product.productId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.images?.[0] ? (
                              <img
                                className="h-16 w-16 object-cover rounded-lg"
                                src={product.images[0]}
                                alt={product.productName}
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <span className="font-mono">{product.productId}</span>
                              <button
                                onClick={() => copyToClipboard(product.productId)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                                title="Copy ID"
                              >
                                <FiCopy size={14} />
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {product.description?.substring(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                        {product.lastPrices && product.lastPrices > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            ${parseFloat(product.lastPrices).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/product/${product.productId}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => navigate("/admin/dashboard/editproducts", { state: { product } })}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product.productId, product.productName)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-lg mb-2">No products found</div>
                      <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                          setSelectedBrand("all");
                        }}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Clear all filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <div key={product.productId} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
                <div className="relative">
                  {product.images?.[0] ? (
                    <img
                      className="w-full h-48 object-cover"
                      src={product.images[0]}
                      alt={product.productName}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.productId)}
                    onChange={() => handleSelectProduct(product.productId)}
                    className="absolute top-2 left-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{product.productName}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate("/admin/dashboard/editproducts", { state: { product } })}
                        className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.productId, product.productName)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">{product.category}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <div className="text-gray-600 text-xl mb-2">No products found</div>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: dashboard.jsx
```javascript
import React, { useEffect, useState } from "react";
import { 
  RxHamburgerMenu, 
  RxDashboard, 
  RxPerson, 
  RxExit 
} from "react-icons/rx";
import { 
  MdOutlineGridView, 
  MdAddBox, 
  MdEdit, 
  MdNotifications,
  MdShoppingCart,
  MdBarChart,
  MdSettings,
  MdChevronRight,
  MdChevronLeft
} from "react-icons/md";
import { 
  FiUsers, 
  FiPackage, 
  FiDollarSign, 
  FiTrendingUp 
} from "react-icons/fi";
import { Link, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AddProducts from "./addProducts";
import AdminAllProductView from "./AdminAllProductView";
import EditProducts from "./EditProducts";
import Notification from "./notification";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsers: 0,
  });

  // Auth check
  const authcheck = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Only administrators can access this dashboard',
          confirmButtonColor: '#d33',
        }).then(() => {
          navigate("/");
        });
        return;
      }
      setUser(decoded);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      // Mock data for now
      setStats({
        totalProducts: 128,
        totalOrders: 45,
        totalRevenue: 12500,
        newUsers: 12,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    authcheck();
    fetchStats();
    window.addEventListener("authChange", authcheck);
    setLoading(false);
    return () => window.removeEventListener("authChange", authcheck);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Top Bar - Only on Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-teal-500 p-4 flex justify-between items-center z-50 shadow-lg">
        <div className="flex items-center">
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mr-4 text-white"
          >
            <RxHamburgerMenu size={28} />
          </button>
          <h1 className="text-white text-xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-blue-100">Welcome</div>
            <div className="text-white font-semibold">{user?.name || "Admin"}</div>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.name?.charAt(0) || "A"}
            </span>
          </div>
        </div>
      </div>

      {/* SIDEBAR - Always visible on desktop, collapsible on mobile */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link to="/admin/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center mr-3">
              <RxDashboard className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-gray-800">AdminPanel</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{user?.name || "Admin User"}</div>
              <div className="text-sm text-gray-500">{user?.email || "admin@example.com"}</div>
              <div className="text-xs mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full inline-block">
                Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-2">
            {/* Main Navigation */}
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Navigation
            </div>

            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="text-blue-600">
                <RxDashboard size={20} />
              </div>
              <span>Overview</span>
            </Link>

            <Link
              to="/admin/dashboard/adminviewproducts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="text-green-600">
                <MdOutlineGridView size={20} />
              </div>
              <span>View Products</span>
            </Link>

            <Link
              to="/admin/dashboard/addproducts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="text-purple-600">
                <MdAddBox size={20} />
              </div>
              <span>Add Product</span>
            </Link>


                        <Link
              to="/admin/dashboard/addproducts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="text-purple-600">
                <MdAddBox size={20} />
              </div>
              <span>Ads Managements</span>
            </Link>

            <Link
              to="/admin/dashboard/notification"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="text-red-600 relative">
                <MdNotifications size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </div>
              <span>Notifications</span>
              <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                3 new
              </span>
            </Link>

            {/* Additional Sections */}
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider my-4 px-2">
                Analytics
              </div>

              <Link
                to="/admin/dashboard/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition"
                onClick={() => setMobileOpen(false)}
              >
                <div className="text-indigo-600">
                  <MdShoppingCart size={20} />
                </div>
                <span>Orders</span>
                <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">45</span>
              </Link>

              <Link
                to="/admin/dashboard/users"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition"
                onClick={() => setMobileOpen(false)}
              >
                <div className="text-teal-600">
                  <FiUsers size={20} />
                </div>
                <span>Users</span>
              </Link>

              <Link
                to="/admin/dashboard/analytics"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition"
                onClick={() => setMobileOpen(false)}
              >
                <div className="text-amber-600">
                  <MdBarChart size={20} />
                </div>
                <span>Analytics</span>
              </Link>

              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider my-4 px-2">
                Settings
              </div>

              <Link
                to="/admin/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium hover:bg-blue-50 hover:text-blue-700 transition"
                onClick={() => setMobileOpen(false)}
              >
                <div className="text-gray-600">
                  <MdSettings size={20} />
                </div>
                <span>Settings</span>
              </Link>
            </>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium bg-red-50 text-red-600 hover:bg-red-100 transition group"
          >
            <RxExit size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className=" w-full lg:ml-10">
        {/* Overlay for mobile sidebar */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Dashboard Header */}
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Welcome back, {user?.name?.split(' ')[0] || "Admin"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your store today.
              </p>
            </div>
            <div className="mt-2 lg:mt-0">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-md font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { 
                title: "Total Products", 
                value: stats.totalProducts, 
                icon: <FiPackage className="text-blue-600" size={24} />, 
                change: "+12%", 
                color: "bg-blue-50", 
                textColor: "text-blue-600" 
              },
              { 
                title: "Total Orders", 
                value: stats.totalOrders, 
                icon: <MdShoppingCart className="text-green-600" size={24} />, 
                change: "+8%", 
                color: "bg-green-50", 
                textColor: "text-green-600" 
              },
              { 
                title: "Total Revenue", 
                value: `$${stats.totalRevenue.toLocaleString()}`, 
                icon: <FiDollarSign className="text-purple-600" size={24} />, 
                change: "+23%", 
                color: "bg-purple-50", 
                textColor: "text-purple-600" 
              },
              { 
                title: "New Users", 
                value: stats.newUsers, 
                icon: <FiUsers className="text-orange-600" size={24} />, 
                change: "+5%", 
                color: "bg-orange-50", 
                textColor: "text-orange-600" 
              },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className={`text-sm font-semibold ${stat.textColor}`}>
                    {stat.change}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTERED CONTENT AREA */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[500px] flex flex-col">
              <Routes>
                <Route index element={
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6">📊</div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
                    <p className="text-gray-600 max-w-2xl mb-8">
                      Select a section from the sidebar to manage products, view notifications, or access other admin features.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl text-center">
                        <div className="text-blue-600 font-bold text-lg mb-2">📦 Products</div>
                        <div className="text-gray-600 text-sm">Manage your product inventory</div>
                      </div>
                      <div className="p-6 bg-green-50 border border-green-100 rounded-xl text-center">
                        <div className="text-green-600 font-bold text-lg mb-2">🛒 Orders</div>
                        <div className="text-gray-600 text-sm">View and manage customer orders</div>
                      </div>
                      <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl text-center">
                        <div className="text-purple-600 font-bold text-lg mb-2">📈 Analytics</div>
                        <div className="text-gray-600 text-sm">Track store performance</div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="adminviewproducts" element={<AdminAllProductView />} />
                <Route path="addproducts" element={<AddProducts />} />
                <Route path="editproducts" element={<EditProducts />} />
                <Route path="notification" element={<Notification />} />
                <Route path="*" element={
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 max-w-md mb-8">
                      The page you're looking for doesn't exist in the admin dashboard.
                    </p>
                    <button 
                      onClick={() => navigate('/admin/dashboard')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                } />
              </Routes>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-200">
          <p>Admin Dashboard v1.0 • © {new Date().getFullYear()} Your Company</p>
        </div>
      </div>
    </div>
  );
}
```

## File: EditProducts.jsx
```javascript
import React, { useState, useEffect } from "react";
import axios from "axios";
import uploadMediaToSupabase from "@/components/utils/mediaUpload";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
  FiEdit, 
  FiSave, 
  FiTrash2, 
  FiImage, 
  FiPackage, 
  FiDollarSign, 
  FiTag, 
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiBox
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";

export default function EditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  
  // Status options
  const statusOptions = [
    { value: "pending", label: "Pending", icon: FiClock, color: "bg-yellow-100 text-yellow-800" },
    { value: "ready", label: "Ready", icon: FiCheckCircle, color: "bg-green-100 text-green-800" },
    { value: "delivered", label: "Delivered", icon: FiTruck, color: "bg-blue-100 text-blue-800" },
    { value: "out_of_stock", label: "Out of Stock", icon: FiBox, color: "bg-red-100 text-red-800" },
  ];

  // Categories and brands for dropdown
  const categories = ["General", "Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Beauty", "Toys", "Food", "Office"];
  const brands = ["Unbranded", "Nike", "Samsung", "Apple", "Sony", "Adidas", "Dell", "LG", "HP", "Microsoft", "Other"];

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    altNames: "",
    price: "",
    lastPrices: "",
    stock: "",
    description: "",
    category: "General",
    brand: "Unbranded",
    status: "pending", // Added status field
  });

  // Fetch product data
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        let productData;
        
        if (location.state?.product) {
          productData = location.state.product;
        } else if (id) {
          const response = await axios.get(
            `http://localhost:4000/api/products/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          productData = response.data;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No Product Selected',
            text: 'Please select a product to edit',
            confirmButtonColor: '#d33',
          }).then(() => navigate("/admin/products"));
          return;
        }

        // Set form data including status
        setFormData({
          productId: productData.productId || "",
          productName: productData.productName || "",
          altNames: productData.altNames?.join(", ") || "",
          price: productData.price || "",
          lastPrices: productData.lastPrices || productData.price || "",
          stock: productData.stock || "",
          description: productData.description || "",
          category: productData.category || "General",
          brand: productData.brand || "Unbranded",
          status: productData.status || "pending", // Set status from API
        });

        if (productData.images && Array.isArray(productData.images)) {
          setExistingImageUrls(productData.images);
        }

      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load product data',
          confirmButtonColor: '#d33',
        }).then(() => navigate("/admin/products"));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [token, navigate, location.state, id]);

  // Handle new image selection with preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove new image preview
  const removeNewImage = (index) => {
    const newImagesCopy = [...newImages];
    const newPreviews = [...imagePreviews];
    
    URL.revokeObjectURL(newPreviews[index]);
    newImagesCopy.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setNewImages(newImagesCopy);
    setImagePreviews(newPreviews);
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    Swal.fire({
      title: 'Remove Image?',
      text: "This image will be removed from the product",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const newExistingImages = [...existingImageUrls];
        newExistingImages.splice(index, 1);
        setExistingImageUrls(newExistingImages);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Quick status update handler
  const handleQuickStatusUpdate = (newStatus) => {
    Swal.fire({
      title: `Change Status to ${newStatus.toUpperCase()}?`,
      text: `Are you sure you want to change product status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update status!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({ ...prev, status: newStatus }));
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Product status changed to ${newStatus}`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const validateForm = () => {
    if (!formData.productName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Product name is required',
        confirmButtonColor: '#d33',
      });
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: 'Please enter a valid price',
        confirmButtonColor: '#d33',
      });
      return false;
    }
    if (existingImageUrls.length === 0 && newImages.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Images',
        text: 'Please add at least one product image',
        confirmButtonColor: '#d33',
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      // Upload new images
      const uploadedImages = newImages.length > 0 
        ? await Promise.all(newImages.map(uploadMediaToSupabase))
        : [];

      // Prepare payload including status
      const payload = {
        ...formData,
        altNames: formData.altNames 
          ? formData.altNames.split(",").map(n => n.trim()).filter(n => n)
          : [],
        price: parseFloat(formData.price),
        lastPrices: formData.lastPrices ? parseFloat(formData.lastPrices) : parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: [...existingImageUrls, ...uploadedImages],
        status: formData.status, // Include status in payload
        updatedAt: new Date().toISOString(),
      };

      // Update product
      await axios.patch(
        `http://localhost:4000/api/products/${formData.productId}`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Product Updated!',
        text: 'Product has been successfully updated',
        showConfirmButton: false,
        timer: 2000
      });

      // Reset image states
      setNewImages([]);
      setImagePreviews([]);

      // Navigate back
      navigate("/admin/dashboard/adminviewproducts");

    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update product. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading product data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Status */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-blue-100 mt-2">Update product information</p>
              </div>
              <div className="mt-4 md:mt-0 space-y-2">
                <div className="text-sm opacity-90">Product ID</div>
                <div className="text-xl font-mono font-bold">{formData.productId}</div>
                
                {/* Current Status Display */}
                <div className="flex items-center space-x-2 mt-3">
                  <div className="text-sm opacity-90">Current Status:</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusOptions.find(s => s.value === formData.status)?.color || "bg-gray-100 text-gray-800"
                  }`}>
                    {statusOptions.find(s => s.value === formData.status)?.label || "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Product Info */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiPackage className="mr-2" /> Product Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Alternate Names */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiTag className="mr-2" /> Alternate Names
                  </label>
                  <input
                    type="text"
                    name="altNames"
                    value={formData.altNames}
                    onChange={handleChange}
                    placeholder="Separate with commas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiDollarSign className="mr-2" /> Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Previous Price
                    </label>
                    <input
                      type="number"
                      name="lastPrices"
                      value={formData.lastPrices}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiGrid className="mr-2" /> Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => handleQuickStatusUpdate(status.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                          formData.status === status.value
                            ? 'border-blue-500 bg-blue-50 scale-105'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <status.icon className={`h-6 w-6 mb-2 ${
                          formData.status === status.value ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          formData.status === status.value ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {status.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Select product status from dropdown or click on status cards above
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-6">
                {/* Existing Images */}
                {existingImageUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Images ({existingImageUrls.length})
                    </label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {existingImageUrls.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove image"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {imagePreviews.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Images to Add ({imagePreviews.length})
                    </label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove image"
                          >
                            <MdClose size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiImage className="mr-2" /> Add More Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FiImage className="text-4xl text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-600 font-medium mb-2">Click to upload new images</div>
                      <div className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB each</div>
                    </label>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FiCheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Status Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusOptions.find(s => s.value === formData.status)?.color || "bg-gray-100 text-gray-800"
                      }`}>
                        {statusOptions.find(s => s.value === formData.status)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock Level:</span>
                      <span className={`font-medium ${
                        parseInt(formData.stock) > 10 ? 'text-green-600' : 
                        parseInt(formData.stock) > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formData.stock || 0} units
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-3">
                      💡 <strong>Status Guide:</strong> Pending → Ready → Delivered
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Update Product
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate("/admin/dashboard/adminviewproducts")}
                      className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Update Only Status?',
                          text: 'Would you like to update just the status without saving other changes?',
                          icon: 'question',
                          showDenyButton: true,
                          showCancelButton: true,
                          confirmButtonText: 'Save All Changes',
                          denyButtonText: 'Update Status Only',
                          cancelButtonText: 'Cancel'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleSave();
                          } else if (result.isDenied) {
                            // Update only status
                            const statusOnlyPayload = { status: formData.status };
                            axios.patch(
                              `http://localhost:4000/api/products/${formData.productId}`,
                              statusOnlyPayload,
                              { 
                                headers: { 
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                } 
                              }
                            ).then(() => {
                              Swal.fire({
                                icon: 'success',
                                title: 'Status Updated!',
                                text: 'Product status has been updated',
                                timer: 1500,
                                showConfirmButton: false
                              });
                            }).catch(error => {
                              console.error("Status update failed:", error);
                              Swal.fire({
                                icon: 'error',
                                title: 'Status Update Failed',
                                text: 'Failed to update product status',
                                confirmButtonColor: '#d33',
                              });
                            });
                          }
                        });
                      }}
                      className="w-full px-6 py-3 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Preview</h3>
            <div className={`px-4 py-1 rounded-full text-sm font-medium ${
              statusOptions.find(s => s.value === formData.status)?.color || "bg-gray-100 text-gray-800"
            }`}>
              {statusOptions.find(s => s.value === formData.status)?.label}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Preview */}
            <div className="md:w-1/3">
              <div className="bg-gray-100 rounded-lg overflow-hidden h-48 flex items-center justify-center">
                {existingImageUrls.length > 0 || imagePreviews.length > 0 ? (
                  <img
                    src={existingImageUrls[0] || imagePreviews[0]}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image</div>
                )}
              </div>
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Product Status</div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    formData.status === 'pending' ? 'bg-yellow-500' :
                    formData.status === 'ready' ? 'bg-green-500' :
                    formData.status === 'delivered' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">{statusOptions.find(s => s.value === formData.status)?.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.status === 'pending' && 'Product is awaiting processing'}
                  {formData.status === 'ready' && 'Product is ready for delivery'}
                  {formData.status === 'delivered' && 'Product has been delivered'}
                  {formData.status === 'out_of_stock' && 'Product is currently out of stock'}
                </p>
              </div>
            </div>
            
            {/* Info Preview */}
            <div className="md:w-2/3">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{formData.productName || "Product Name"}</h4>
              <div className="flex items-center mb-4">
                <span className="text-3xl font-bold text-blue-600 mr-3">
                  ${parseFloat(formData.price || 0).toFixed(2)}
                </span>
                {formData.lastPrices && parseFloat(formData.lastPrices) > parseFloat(formData.price) && (
                  <span className="text-lg text-gray-500 line-through">
                    ${parseFloat(formData.lastPrices).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium">{formData.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Brand</div>
                  <div className="font-medium">{formData.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Stock</div>
                  <div className={`font-medium ${
                    parseInt(formData.stock) > 10 ? 'text-green-600' : 
                    parseInt(formData.stock) > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formData.stock || 0} units
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Product ID</div>
                  <div className="font-mono font-medium">{formData.productId}</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Availability</div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    formData.status === 'out_of_stock' 
                      ? 'bg-red-100 text-red-800' 
                      : parseInt(formData.stock) > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.status === 'out_of_stock' 
                      ? 'Out of Stock' 
                      : parseInt(formData.stock) > 0 
                        ? 'In Stock' 
                        : 'Low Stock'}
                  </div>
                  {formData.status === 'delivered' && (
                    <div className="text-sm text-gray-600 flex items-center">
                      <FiTruck className="h-4 w-4 mr-1" /> Delivered
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-600">
                {formData.description || "No description provided"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: notification.jsx
```javascript
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";

export default function Notification() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch all message threads (admin endpoint)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/chat/admin/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Based on your backend controller, data is in res.data.data
        if (res.data.data) {
          setUsers(res.data.data);
        } else if (res.data.messages) {
          // Alternative response format
          setUsers(res.data.messages);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (err.response?.status === 403) {
          alert("You don't have admin privileges");
        }
      }
    };
    
    if (token) {
      fetchMessages();
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser]);

  // Handle admin reply
  const handleReply = async () => {
    if (!selectedUser || !replyText.trim()) return;

    setLoading(true);
    try {
      // Using your backend endpoint structure
      const res = await axios.post(
        "http://localhost:4000/api/chat/adminReply",
        { 
          userId: selectedUser.userId, // Send userId, not _id
          text: replyText  // Changed from 'message' to 'text'
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      alert(res.data.message || "Reply sent successfully");

      const newMessage = {
        _id: Date.now().toString(),
        sender: "admin",
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      // Update selectedUser messages locally
      setSelectedUser((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      // Update main users array
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.userId === selectedUser.userId || u._id === selectedUser._id
            ? { 
                ...u, 
                messages: [...u.messages, {
                  sender: "admin",
                  text: replyText,
                  timestamp: new Date().toISOString()
                }] 
              }
            : u
        )
      );

      setReplyText("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending reply:", err);
      if (err.response) {
        console.error("Response error:", err.response.data);
        alert(`Failed to send reply: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert("Failed to send reply");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format messages for display
  const formatMessages = (messages) => {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map(msg => ({
      ...msg,
      // Ensure sender is in lowercase for comparison
      sender: msg.sender?.toLowerCase() || "unknown"
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Chat Dashboard</h1>
      
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left border-b font-semibold text-gray-700">User ID</th>
              <th className="p-3 text-left border-b font-semibold text-gray-700">Email</th>
              <th className="p-3 text-left border-b font-semibold text-gray-700">Messages</th>
              <th className="p-3 text-left border-b font-semibold text-gray-700">Last Updated</th>
              <th className="p-3 text-left border-b font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No chat threads found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const formattedMessages = formatMessages(user.messages);
                const userMessages = formattedMessages.filter(m => m.sender === 'user');
                const lastUserMessage = userMessages[userMessages.length - 1];
                
                return (
                  <tr key={user._id || user.userId} className="border-t hover:bg-gray-50">
                    <td className="p-3 border-b">
                      <div className="font-medium">{user.userId}</div>
                      <div className="text-xs text-gray-500">Thread: {user._id?.substring(0, 8)}...</div>
                    </td>
                    <td className="p-3 border-b text-gray-600">{user.userEmail}</td>
                    <td className="p-3 border-b">
                      <div className="text-sm">
                        <span className="font-medium">{formattedMessages.length}</span> messages
                        {lastUserMessage && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            Last: "{lastUserMessage.text?.substring(0, 50)}..."
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-b">
                      {user.updatedAt ? (
                        <div>
                          <div className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(user.updatedAt).toLocaleTimeString()}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3 border-b">
                      <button
                        onClick={() => {
                          setSelectedUser({
                            ...user,
                            messages: formatMessages(user.messages)
                          });
                          setShowPopup(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {showPopup && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Chat with User</h2>
                <p className="text-sm text-blue-100">
                  User ID: {selectedUser.userId} | Email: {selectedUser.userEmail}
                </p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✖
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {selectedUser.messages?.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages in this thread yet.
                </div>
              ) : (
                selectedUser.messages
                  ?.sort((a, b) => new Date(a.timestamp || a.createdAt) - new Date(b.timestamp || b.createdAt))
                  .map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`mb-3 flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'user'
                            ? 'bg-white border border-gray-200 rounded-tl-none'
                            : 'bg-blue-100 border border-blue-200 rounded-tr-none'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-semibold ${msg.sender === 'user' ? 'text-gray-700' : 'text-blue-700'}`}>
                            {msg.sender === 'user' ? '👤 User' : '🛡️ Admin'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-800">{msg.text}</p>
                      </div>
                    </div>
                  ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Area */}
            <div className="border-t p-4">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your reply..."
                rows="3"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-end mt-3 space-x-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  onClick={handleReply}
                  disabled={loading || !replyText.trim()}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reply"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: payment.jsx
```javascript
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CreditCard, Shield, Lock, CheckCircle, ArrowLeft, 
  Truck, Package, Wallet, DollarSign 
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!orderData) {
      Swal.fire({
        icon: 'error',
        title: 'Order Data Missing',
        text: 'Please complete the shipping process first.',
      }).then(() => {
        navigate('/shipping');
      });
      return;
    }

    // Get user info from order data or fetch from API
    const token = localStorage.getItem('token');
    if (token && orderData.userInfo) {
      setUserInfo(orderData.userInfo);
    }
  }, [orderData, navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
    } 
    // Format CVV to max 3-4 digits
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    }
    // Format expiry month/year
    else if (name === 'expiryMonth') {
      const formatted = value.replace(/\D/g, '').slice(0, 2);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    }
    else if (name === 'expiryYear') {
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCardDetails = () => {
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      return 'Please enter a valid 16-digit card number';
    }
    if (!cardDetails.cardName) {
      return 'Please enter the name on card';
    }
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      return 'Please enter card expiry date';
    }
    const month = parseInt(cardDetails.expiryMonth);
    const year = parseInt(cardDetails.expiryYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (month < 1 || month > 12) {
      return 'Invalid expiry month';
    }
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired';
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      return 'Please enter a valid CVV';
    }
    return null;
  };

  const handlePlaceOrder = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Login Required',
      text: 'Please log in to complete your order.',
    });
    navigate('/login');
    return;
  }

  if (!orderData) {
    Swal.fire({
      icon: 'error',
      title: 'Order Error',
      text: 'Order data is missing. Please try again.',
    });
    return;
  }

  if (paymentMethod === 'card') {
    const validationError = validateCardDetails();
    if (validationError) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: validationError,
      });
      return;
    }
  }

  // Confirm with Swal first
  const result = await Swal.fire({
    title: 'Confirm Order',
    html: `... your summary HTML ...`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Place Order',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  setLoading(true);

  try {
    // Send order to backend
    const response = await axios.post(
      'http://localhost:4000/api/orders', // your backend route
      {
        ...orderData,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? cardDetails : null
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const savedOrder = response.data;

    // Show success Swal
    await Swal.fire({
      icon: 'success',
      title: 'Order Placed!',
      html: `
        <p>Order #${savedOrder._id} has been placed successfully.</p>
        <p>Total: Rs. ${savedOrder.total?.toFixed(2)}</p>
      `,
      showConfirmButton: true
    });

    navigate('/orders'); // go to order list page
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Order Failed',
      text: error.response?.data?.message || 'Something went wrong!',
    });
  } finally {
    setLoading(false);
  }
};


  const handleBackToShipping = () => {
    navigate('/shipping', { state: { quoteData: orderData } });
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Order Found</h2>
          <p className="text-gray-600 mb-4">Please complete the shipping process first.</p>
          <button
            onClick={() => navigate('/shipping')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Shipping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToShipping}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shipping
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
              <p className="text-gray-600">Secure payment gateway - Your information is protected</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-8 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Cart</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            
            <div className="flex-1 h-1 bg-green-500 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Shipping</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
            
            <div className="flex-1 h-1 bg-green-500 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Payment</p>
                <p className="text-xs text-gray-500">Current Step</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                Select Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded ${paymentMethod === 'card' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-purple-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay with Visa, MasterCard</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                    paymentMethod === 'wallet' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded ${paymentMethod === 'wallet' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Wallet className={`h-5 w-5 ${paymentMethod === 'wallet' ? 'text-purple-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Digital Wallet</p>
                    <p className="text-sm text-gray-500">Apple Pay, Google Pay</p>
                  </div>
                  {paymentMethod === 'wallet' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                    paymentMethod === 'bank' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded ${paymentMethod === 'bank' ? 'bg-purple-100' : 'bg-gray-100'}`}>
          <DollarSign className={`h-5 w-5 ${paymentMethod === 'bank' ? 'text-purple-600' : 'text-gray-600'}`} />

                  </div>
                  <div className="text-left">
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-500">Direct bank payment</p>
                  </div>
                  {paymentMethod === 'bank' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded ${paymentMethod === 'cod' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Truck className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-purple-600' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </button>
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'card' && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-blue-500" />
                    Card Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        maxLength="19"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={cardDetails.cardName}
                        onChange={handleCardInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Month *
                        </label>
                        <input
                          type="text"
                          name="expiryMonth"
                          value={cardDetails.expiryMonth}
                          onChange={handleCardInputChange}
                          placeholder="MM"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          maxLength="2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Year *
                        </label>
                        <input
                          type="text"
                          name="expiryYear"
                          value={cardDetails.expiryYear}
                          onChange={handleCardInputChange}
                          placeholder="YYYY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          maxLength="4"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          maxLength="4"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-sm text-gray-600">
                        Your card details are encrypted and secure. We do not store your card information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Payment Method Messages */}
              {paymentMethod !== 'card' && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-6 w-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {paymentMethod === 'wallet' && 'Digital Wallet Payment'}
                        {paymentMethod === 'bank' && 'Bank Transfer'}
                        {paymentMethod === 'cod' && 'Cash on Delivery'}
                      </h4>
                      <p className="text-gray-600">
                        {paymentMethod === 'wallet' && 'You will be redirected to your preferred digital wallet for secure payment.'}
                        {paymentMethod === 'bank' && 'Bank transfer details will be provided after order confirmation.'}
                        {paymentMethod === 'cod' && 'Pay when your order is delivered. Additional charges may apply.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-amber-500" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rs. {orderData.labeledTotal?.toFixed(2)}</span>
                </div>
                {orderData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {orderData.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Amount</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">Rs. {orderData.total?.toFixed(2)}</p>
                      {orderData.discount > 0 && (
                        <p className="text-sm text-green-600">
                          You saved Rs. {orderData.discount?.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Items in Order ({orderData.items?.length || 0})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {orderData.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-semibold">Rs. {(item.lastPrice * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary & Button */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Security Assurance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-500" />
                  Secure Payment
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>256-bit SSL encryption</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>PCI DSS compliant</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>No card details stored</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Money-back guarantee</span>
                  </li>
                </ul>
              </div>

              {/* Payment Summary & Button */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Payment Summary</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Order #{orderData.orderId}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Total</span>
                      <span>Rs. {orderData.labeledTotal?.toFixed(2)}</span>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- Rs. {orderData.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total to Pay</span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">Rs. {orderData.total?.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">including all taxes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start mb-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="h-4 w-4 text-purple-600 rounded mt-1 mr-2"
                      defaultChecked
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button className="text-purple-600 hover:text-purple-700">Terms & Conditions</button>{' '}
                      and{' '}
                      <button className="text-purple-600 hover:text-purple-700">Privacy Policy</button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    By completing this purchase, you agree to our terms and authorize the charge to your selected payment method.
                  </p>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>
                        Pay Rs. {orderData.total?.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Secured by SSL encryption
                </p>
              </div>

              {/* Support Info */}
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Need help?{' '}
                  <button className="text-purple-600 hover:text-purple-700 font-medium">
                    Contact Customer Support
                  </button>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  You can cancel your order within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: repomix.config.json
```json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "repomix-output.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "truncateBase64": false,
    "copyToClipboard": false,
    "includeFullDirectoryStructure": false,
    "tokenCountTree": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false,
      "includeLogs": false,
      "includeLogsCount": 50
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDotIgnore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```
