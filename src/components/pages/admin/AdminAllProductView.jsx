import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiRefreshCw,
  FiPlus,
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
        const res = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/products",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const productsData = res.data?.data || res.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error("Error fetching products:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load products",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, token]);

  // Get unique categories and brands for filters
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category).filter(Boolean);
    return ["all", ...new Set(allCategories)];
  }, [products]);

  const brands = useMemo(() => {
    const allBrands = products.map((p) => p.brand).filter(Boolean);
    return ["all", ...new Set(allBrands)];
  }, [products]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.productName?.toLowerCase().includes(term) ||
          product.productId?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.altNames?.some((name) => name.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Brand filter
    if (selectedBrand !== "all") {
      result = result.filter((product) => product.brand === selectedBrand);
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
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory, selectedBrand, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleDelete = async (productId, productName) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      html: `Are you sure you want to delete <strong>"${productName}"</strong>?<br>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          import.meta.env.VITE_BACKEND_URL + `/api/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });

        setProducts((prev) => prev.filter((p) => p.productId !== productId));
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: err.response?.data?.message || "Failed to delete product",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    const result = await Swal.fire({
      title: "Bulk Delete?",
      html: `Are you sure you want to delete ${selectedProducts.size} product(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Delete ${selectedProducts.size} Items`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = Array.from(selectedProducts).map((productId) =>
          axios.delete(
            import.meta.env.VITE_BACKEND_URL + `/api/products/${productId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );

        await Promise.all(deletePromises);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${selectedProducts.size} product(s) deleted`,
          timer: 2000,
          showConfirmButton: false,
        });

        setProducts((prev) =>
          prev.filter((p) => !selectedProducts.has(p.productId))
        );
        setSelectedProducts(new Set());
      } catch (err) {
        console.error("Bulk delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Failed to delete selected products",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === currentProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(currentProducts.map((p) => p.productId));
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
      icon: "success",
      title: "Copied!",
      text: "Product ID copied to clipboard",
      timer: 1500,
      showConfirmButton: false,
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Products Management
          </h1>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
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
              {brands.map((brand) => (
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
              </select>
              <button
                onClick={() => bulkAction === "delete" && handleBulkDelete()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                disabled={!bulkAction || selectedProducts.size === 0}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {selectedProducts.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="text-blue-700 font-medium">{selectedProducts.size} product(s) selected</div>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <FiTrash2 className="mr-2" /> Delete Selected
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
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
                              <img className="h-16 w-16 object-cover rounded-lg" src={product.images[0]} alt={product.productName} />
                            ) : (
                              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <span className="font-mono">{product.productId}</span>
                              <button onClick={() => copyToClipboard(product.productId)} className="ml-2 text-gray-400 hover:text-gray-600">
                                <FiCopy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 10 ? "bg-green-100 text-green-800" : product.stock > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                          {product.stock} units
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
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
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No products found</td>
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
          {currentProducts.map((product) => (
            <div key={product.productId} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="relative">
                <img className="w-full h-48 object-cover" src={product.images?.[0] || ""} alt={product.productName} />
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.productId)}
                  onChange={() => handleSelectProduct(product.productId)}
                  className="absolute top-2 left-2 rounded border-gray-300 text-blue-600"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 truncate">{product.productName}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{product.stock} stock</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <button onClick={() => navigate("/admin/dashboard/editproducts", { state: { product } })} className="p-2 bg-blue-100 text-blue-600 rounded">
                      <FiEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.productId, product.productName)} className="p-2 bg-red-100 text-red-600 rounded">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">{product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}
          </div>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}