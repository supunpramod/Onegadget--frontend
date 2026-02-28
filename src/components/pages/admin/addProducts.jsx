import React, { useState, useEffect } from "react";
import axios from "axios";
import uploadMediaToSupabase from "../../utils/mediaupload.jsx";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import { FiUpload, FiImage, FiDollarSign, FiPackage, FiTag, FiShoppingCart, FiPlusCircle } from "react-icons/fi";

export default function AddProducts() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // --- NEW STATES FOR FETCHING CATEGORIES ---
  const [dbCategories, setDbCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryImage, setCategoryImage] = useState(null); // New state for category image

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

  // Keep your brands list exact
  const brands = ["Unbranded", "Nike", "Samsung", "Apple", "Sony", "Adidas", "Dell", "LG", "Other"];

  // --- FETCH CATEGORIES FROM YOUR BACKEND ---
  const fetchCats = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/categories");
      if (res.data && res.data.length > 0) {
        setDbCategories(res.data);
        // default select first category if not in "New Category" mode
        if (!isNewCategory) {
          setFormData(prev => ({ ...prev, category: res.data[0].name }));
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

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
    if (isNewCategory) {
      if (!formData.category.trim()) {
        alert("Please enter a category name");
        return false;
      }
      if (!categoryImage) {
        alert("Please upload an image for the new category");
        return false;
      }
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    const token = localStorage.getItem("token");
    
    try {
      // TRIM INPUTS
      let finalCategoryName = formData.category.trim();

      // 1. IF NEW CATEGORY, UPLOAD CAT IMAGE AND POST IT FIRST
      if (isNewCategory) {
        try {
          // Upload Category Image to Supabase
          const catImageUrl = await uploadMediaToSupabase(categoryImage);

          const catRes = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/api/categories",
            { 
              name: finalCategoryName,
              image: catImageUrl, // Sending the uploaded image URL
              slug: finalCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') 
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          finalCategoryName = catRes.data.name;
          // Refresh category list
          await fetchCats();
        } catch (catErr) {
          console.error("Category creation failed", catErr);
          // If category exists, it might throw error, we try to proceed
        }
      }

      // 2. Upload product images to Supabase
      const imgUrls = await Promise.all(
        images.map(file => uploadMediaToSupabase(file))
      );

      // 3. Prepare payload with TRIMMED values
      const payload = {
        ...formData,
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        category: finalCategoryName,
        productId: `PROD-${formData.productId.trim()}`,
        // Split, trim each, and filter out empty strings
        altNames: formData.altNames ? formData.altNames.split(",").map(n => n.trim()).filter(n => n !== "") : [],
        price: parseFloat(formData.price),
        lastPrices: formData.lastPrices ? parseFloat(formData.lastPrices) : parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        images: imgUrls,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 4. Send to backend
      const res = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/products",
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("Product saved:", res.data);
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
        category: dbCategories.length > 0 ? dbCategories[0].name : "General",
        brand: "Unbranded",
      });
      setImages([]);
      setImagePreviews([]);
      setIsNewCategory(false);
      setCategoryImage(null);

    } catch (err) {
      console.error("Upload failed:", err);
      let errorMessage = "Failed to upload product.";
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText;
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
                    placeholder="Separate with commas"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
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
                      Last Price
                    </label>
                    <input
                      type="number"
                      name="lastPrices"
                      value={formData.lastPrices}
                      onChange={handleChange}
                      placeholder="0.00"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* --- CATEGORY SECTION --- */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <FiTag className="mr-2" /> Category *
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        const newToggleState = !isNewCategory;
                        setIsNewCategory(newToggleState);
                        setFormData(prev => ({
                          ...prev, 
                          category: newToggleState ? "" : (dbCategories[0]?.name || "General")
                        }));
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FiPlusCircle /> {isNewCategory ? "Use List" : "Add New"}
                    </button>
                  </div>

                  {isNewCategory ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Type new category name..."
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        required
                      />
                      {/* NEW: Category Image Input */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase ml-1">Category Image *</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCategoryImage(e.target.files[0])}
                          className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    >
                      {dbCategories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                      {dbCategories.length === 0 && <option value="General">General</option>}
                    </select>
                  )}
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

              {/* Right Column - Images & Description */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiImage className="mr-2" /> Product Images *
                  </label>
                  
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
                    </div>
                  )}

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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the product details..."
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-70 flex items-center justify-center"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}