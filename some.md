import React, { useState, useEffect } from "react";
import axios from "axios";
import uploadMediaToSupabase from "../../utils/mediaupload.jsx";
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
            import.meta.env.VITE_BACKEND_URL+`/api/products/${id}`,
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
        import.meta.env.VITE_BACKEND_URL + `/api/products/${formData.productId}`,
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
                              import.meta.env.VITE_BACKEND_URL + `/api/products/${formData.productId}`,
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