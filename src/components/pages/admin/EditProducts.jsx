import React, { useState, useEffect } from "react";
import axios from "axios";
import uploadMediaToSupabase from "../../utils/mediaupload.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import {
  FiUpload, FiImage, FiDollarSign, FiPackage, FiTag, FiShoppingCart, FiPlusCircle,
  FiArrowLeft, FiTrash2, FiEdit2, FiX
} from "react-icons/fi";
import { TbCategory } from "react-icons/tb";
import Swal from "sweetalert2";

export default function EditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const productData = location.state?.product;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [dbCategories, setDbCategories] = useState([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryImage, setCategoryImage] = useState(null);
  const [selectedCatPreview, setSelectedCatPreview] = useState("");

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
  });

  const brands = ["Unbranded", "Nike", "Samsung", "Apple", "Sony", "Adidas", "Dell", "LG", "Other"];

  // --- FETCH CATEGORIES FROM BACKEND ---
  const fetchCats = async (currentCategoryName) => {
    try {
      const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/categories");
      if (res.data && res.data.length > 0) {
        setDbCategories(res.data);
        // Find image for the specific category name
        const target = currentCategoryName || formData.category;
        const current = res.data.find(c => c.name === target);
        if (current) setSelectedCatPreview(current.image);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    // Admin authentication check
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        alert("Only administrators can edit products.");
        navigate("/");
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!productData) {
      navigate("/admin/dashboard/adminviewproducts");
      return;
    }

    const initialCategory = productData.category || "General";
    
    setFormData({
      productId: productData.productId ? productData.productId.replace('PROD-', '') : uuidv4().substring(0, 8).toUpperCase(),
      productName: productData.productName || "",
      altNames: Array.isArray(productData.altNames) ? productData.altNames.join(", ") : productData.altNames || "",
      price: productData.price || "",
      lastPrices: productData.lastPrices || productData.price || "",
      stock: productData.stock || "",
      description: productData.description || "",
      category: initialCategory,
      brand: productData.brand || "Unbranded",
    });
    
    // Set existing images as previews
    if (productData.images && productData.images.length > 0) {
      setImagePreviews(productData.images);
      setExistingImageUrls(productData.images);
    }
    
    // Fetch categories and set initial icon
    fetchCats(initialCategory);
    setLoading(false);
  }, [productData, navigate]);

  // Track existing image URLs separately from new file uploads
  const [existingImageUrls, setExistingImageUrls] = useState([]);

  // Handle image selection with preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    
    // Create previews for new images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...existingImageUrls, ...imagePreviews.filter(url => !existingImageUrls.includes(url)), ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    // Check if removing an existing URL or a new preview
    if (index < existingImageUrls.length) {
      // Removing existing image
      const newExistingUrls = existingImageUrls.filter((_, i) => i !== index);
      setExistingImageUrls(newExistingUrls);
      
      // Update previews
      const newPreviews = [...newExistingUrls, ...images.map(file => URL.createObjectURL(file))];
      setImagePreviews(newPreviews);
    } else {
      // Removing new image
      const newImagesIndex = index - existingImageUrls.length;
      const newImagesArray = [...images];
      newImagesArray.splice(newImagesIndex, 1);
      setImages(newImagesArray);
      
      // Update previews
      const newPreviews = [...existingImageUrls, ...newImagesArray.map(file => URL.createObjectURL(file))];
      setImagePreviews(newPreviews);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "category") {
      const selected = dbCategories.find(c => c.name === value);
      setSelectedCatPreview(selected ? selected.image : "");
    }
  };

  // Live preview for "Add New Category" file input
  const handleNewCategoryFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
      setSelectedCatPreview(URL.createObjectURL(file));
    }
  };

  // Generate new product ID
  const generateNewId = () => {
    setFormData(prev => ({
      ...prev,
      productId: uuidv4().substring(0, 8).toUpperCase()
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
    if (imagePreviews.length === 0) {
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

  const handleUpdateCurrentCategory = async () => {
    const currentCat = dbCategories.find(c => c.name === formData.category);
    if (!currentCat) return;

    const { value: formValues } = await Swal.fire({
      title: 'Update Category Icon',
      html: `
        <div style="text-align: left;">
          <label style="font-weight:bold; font-size: 14px;">Category Name</label>
          <input id="swal-input-name" class="swal2-input" value="${currentCat.name}" style="width: 100%; margin: 10px 0;">
          <label style="font-weight:bold; font-size: 14px; display:block; margin-top:10px;">New Icon</label>
          <div style="display:flex; align-items:center; gap:15px; margin-top:10px; background:#f4f4f4; padding:10px; border-radius:10px;">
             <img id="swal-preview-node" src="${currentCat.image}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:2px solid #fff;">
             <input type="file" id="swal-input-file" accept="image/*" style="font-size:12px;">
          </div>
        </div>
      `,
      showCancelButton: true,
      didOpen: () => {
        const fileInput = document.getElementById('swal-input-file');
        const previewImg = document.getElementById('swal-preview-node');
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) previewImg.src = URL.createObjectURL(file);
        };
      },
      preConfirm: () => ({
        newName: document.getElementById('swal-input-name').value,
        newFile: document.getElementById('swal-input-file').files[0]
      })
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Uploading...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        let finalUrl = currentCat.image;
        if (formValues.newFile) finalUrl = await uploadMediaToSupabase(formValues.newFile);

        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${currentCat._id}`, {
          name: formValues.newName,
          image: finalUrl
        }, { headers: { Authorization: `Bearer ${token}` } });

        Swal.fire('Success', 'Category updated', 'success');
        setFormData(prev => ({ ...prev, category: formValues.newName }));
        setSelectedCatPreview(finalUrl);
        fetchCats(formValues.newName);
      } catch (err) { Swal.fire('Error', 'Failed to update', 'error'); }
    }
  };

  const handleDeleteCurrentCategory = async () => {
    const currentCat = dbCategories.find(c => c.name === formData.category);
    if (!currentCat) return;

    const result = await Swal.fire({
      title: `Delete "${currentCat.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/categories/${currentCat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(prev => ({ ...prev, category: dbCategories[0]?.name || "General" }));
        setSelectedCatPreview("");
        fetchCats();
        Swal.fire('Deleted', '', 'success');
      } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    
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
              image: catImageUrl,
              slug: finalCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') 
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          finalCategoryName = catRes.data.name;
          // Refresh category list
          await fetchCats();
        } catch (catErr) {
          console.error("Category creation failed", catErr);
        }
      }

      // 2. Upload new product images to Supabase (if any)
      let imgUrls = [...existingImageUrls];
      if (images.length > 0) {
        const newImgUrls = await Promise.all(
          images.map(file => uploadMediaToSupabase(file))
        );
        imgUrls = [...existingImageUrls, ...newImgUrls];
      }

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
        updatedAt: new Date().toISOString()
      };

      // 4. Send to backend
      const res = await axios.patch(
        import.meta.env.VITE_BACKEND_URL + "/api/products/" + `PROD-${formData.productId.trim()}`,
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("Product updated:", res.data);
      alert("✅ Product updated successfully!");
      
      // Navigate back to products list
      navigate("/admin/dashboard/adminviewproducts");

    } catch (err) {
      console.error("Update failed:", err);
      let errorMessage = "Failed to update product.";
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText;
      }
      alert(`❌ ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading product data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/dashboard/adminviewproducts")}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header - EXACT match with AddProducts */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-blue-100 mt-2">Update product information below</p>
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

                {/* --- CATEGORY SECTION - WITH ALL YOUR FEATURES PRESERVED --- */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <TbCategory className="mr-2" /> Category *
                    </label>
                    <div className="flex items-center gap-2">
                      {/* YOUR CATEGORY EDIT/DELETE BUTTONS */}
                      {!isNewCategory && formData.category && dbCategories.length > 0 && (
                        <div className="flex bg-white rounded-lg shadow-sm border p-1 mr-2">
                          <button 
                            type="button" 
                            onClick={handleUpdateCurrentCategory} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Edit Category"
                          >
                            <FiEdit2 size={14}/>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleDeleteCurrentCategory} 
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                            title="Delete Category"
                          >
                            <FiTrash2 size={14}/>
                          </button>
                        </div>
                      )}
                      {/* YOUR ADD NEW CATEGORY TOGGLE */}
                      <button 
                        type="button"
                        onClick={() => {
                          const newToggleState = !isNewCategory;
                          setIsNewCategory(newToggleState);
                          setFormData(prev => ({
                            ...prev, 
                            category: newToggleState ? "" : (dbCategories[0]?.name || "General")
                          }));
                          if (!newToggleState) {
                            setCategoryImage(null);
                            // Restore preview of selected category
                            const selected = dbCategories.find(c => c.name === formData.category);
                            setSelectedCatPreview(selected ? selected.image : "");
                          } else {
                            setSelectedCatPreview("");
                          }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <FiPlusCircle /> {isNewCategory ? "Use List" : "Add New"}
                      </button>
                    </div>
                  </div>

                  {isNewCategory ? (
                    /* YOUR NEW CATEGORY INPUT SECTION */
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
                      {/* Category Image Input */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-blue-500 uppercase ml-1">Category Image *</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleNewCategoryFile}
                          className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  ) : (
                    /* YOUR CATEGORY SELECT DROPDOWN */
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                    >
                      <option value="">Select Category</option>
                      {dbCategories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                      {dbCategories.length === 0 && <option value="General">General</option>}
                    </select>
                  )}

                  {/* YOUR PERSISTENT CATEGORY PREVIEW */}
                  {selectedCatPreview && !isNewCategory && (
                    <div className="mt-4 flex items-center gap-4 p-3 bg-white rounded-2xl shadow-sm border border-blue-100">
                      <img 
                        src={selectedCatPreview} 
                        className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-md" 
                        alt="Category Icon" 
                      />
                      <div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">Category Icon</p>
                        <p className="text-sm font-bold text-gray-700">{formData.category || "Selected Icon"}</p>
                      </div>
                    </div>
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
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg transition disabled:opacity-70 flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Product...
                      </>
                    ) : (
                      "Update Product"
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