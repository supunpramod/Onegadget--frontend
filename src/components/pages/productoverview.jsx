import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImageSlider from "@/components/imageSlider";
import { addToCart } from "../utils/cart";
import {
  FiShoppingCart,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import Swal from "sweetalert2";

const DELIVERY_FEE = 350;

export default function ProductOverview() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + `/api/products/${productId}`,
        );
        if (response.data && response.data.product) {
          setProduct(response.data);
        } else {
          setError("Product data not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxStock = product?.product?.stock || 0;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (!product?.product || product.product.stock <= 0) {
      Swal.fire({
        icon: "error",
        title: "Out of Stock",
        text: "Sorry, this item is currently unavailable.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    const subtotal = product.product.lastPrices * quantity;
    const finalTotal = subtotal + DELIVERY_FEE;

    Swal.fire({
      title: `<span class="text-xl font-black uppercase tracking-tight text-black">Order Preview</span>
      <div class="border-t border border-black "></div>`,
      html: `
      
        <div class="mt-4 text-left font-sans">
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <img src="${product.product.images?.[0]}" class="w-16 h-16 rounded-xl object-cover border border-white shadow-sm" />
            <div class="flex-1 min-w-0">
              <p class="text-base font-black text-slate-900 truncate">${product.product.productName}</p>
              <p class="text-[11px] text-slate-500 font-bold uppercase tracking-wide">Qty: ${quantity} units</p>
            </div>
          </div>

          <div class="space-y-2 px-1">
            <div class="flex justify-between items-center text-sm">
              <span class="text-black font-medium  text-base">Items Subtotal</span>
              <span class="font-bold text-slate-900">Rs. ${subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-black font-medium  text-base">Standard Delivery</span>
              <span class="font-bold text-blue-600">+ Rs. ${DELIVERY_FEE.toLocaleString()}</span>
            </div>

            
            
            <div class="border-t border-dashed border-slate-300 my-3"></div>
            
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-base font-black text-black   mb-1">Total Payable</span>
                <span class="text-2xl font-black text-[#2E2DAD]">Rs. ${finalTotal.toLocaleString()}</span>
              </div>
              <div class="bg-emerald-100 text-emerald-700 p-2.5 rounded-2xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Place Order",
      cancelButtonText: "Maybe Later",
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ffffff", // Changed to White to use custom text color via CSS
      customClass: {
        popup: "rounded-[2.5rem] border-none shadow-2xl",
        actions: "flex justify-center gap-7",
        confirmButton:
          "rounded-lg px-5 py-3   text-white   order-2 bg-[#2E2DAD] ",
        cancelButton:
          " ml-2 rounded-lg px-5 py-3    text-black border border-slate-200 hover:text-slate-600 order-1 bg-[#D9D9D9]",
      },
      buttonsStyling: false, // Set to false to allow Tailwind classes in customClass to work fully
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(
          `/shipping/?P_id=${product.product._id}&productId=${product.product.productId}`,
          {
            state: {
              orderedItems: [
                {
                  productId: product.product.productId,
                  productName: product.product.productName,
                  price: product.product.price,
                  lastPrice: product.product.lastPrices,
                  qty: quantity,
                  image: product.product.images?.[0] || "",
                },
              ],
              total: subtotal,
              deliveryFee: DELIVERY_FEE,
              finalTotal: finalTotal,
              labeledTotal: product.product.price * quantity,
              discount:
                (product.product.price - product.product.lastPrices) * quantity,
              message: "Direct buy now",
            },
          },
        );
      }
    });
  };

  const handleAddToCart = async () => {
    if (!product?.product || product.product.stock <= 0) return;
    setAddingToCart(true);
    try {
      addToCart(product.product.productId, quantity);
      await Swal.fire({
        icon: "success",
        title: "Added to Cart!",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-500">Loading Product...</p>
      </div>
    );

  if (error || !product?.product)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        {error || "Product Not Found"}
      </div>
    );

  const data = product.product;
  const isOutOfStock = data.stock <= 0;
  const isLowStock = data.stock > 0 && data.stock <= 5;
  const hasDiscount = data.price > data.lastPrices;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white shadow-sm mb-6 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 font-bold hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft /> Back to Shop
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Images */}
          <div className="lg:w-1/2 space-y-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm relative overflow-hidden">
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-8 py-3 rounded-full font-black text-2xl shadow-xl transform -rotate-12">
                    SOLD OUT
                  </span>
                </div>
              )}
              <ImageSlider images={data.images} showThumbnails={true} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 text-blue-700 font-bold text-sm border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiTruck size={20} />
                </div>
                <span>Islandwide Delivery</span>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm border border-green-100">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FiShield size={20} />
                </div>
                <span>Quality Assured</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:w-1/2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {/* Stock Alert Badge */}
            <div className="mb-4">
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  <FiAlertCircle /> Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                  <FiClock /> Only {data.stock} Left - Order Soon!
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  <FiCheckCircle /> In Stock & Ready to Ship
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-widest">
              SKU: {data.productId}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
              {data.productName}
            </h1>

            <div className="mb-8 flex items-end gap-4">
              <span className="text-4xl font-black text-slate-900">
                {formatPrice(data.lastPrices)}
              </span>
              {hasDiscount && (
                <div className="flex flex-col mb-1">
                  <span className="text-lg text-gray-400 line-through font-bold decoration-red-400">
                    {formatPrice(data.price)}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded font-black mt-1">
                    SAVE{" "}
                    {Math.round(
                      ((data.price - data.lastPrices) / data.price) * 100,
                    )}
                    %
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div
              className={`mb-8 p-5 rounded-2xl border-2 transition-colors ${isOutOfStock ? "bg-gray-50 border-gray-100" : "bg-slate-50 border-slate-100"}`}
            >
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">
                Select Quantity
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => handleQuantityChange(-1)}
                    className="w-12 h-12 bg-white border-2 border-slate-200 rounded-xl font-bold hover:border-slate-800 disabled:opacity-30 transition-all flex items-center justify-center text-xl shadow-sm"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black w-8 text-center text-slate-800">
                    {quantity}
                  </span>
                  <button
                    disabled={isOutOfStock || quantity >= data.stock}
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 bg-white border-2 border-slate-200 rounded-xl font-bold hover:border-slate-800 disabled:opacity-30 transition-all flex items-center justify-center text-xl shadow-sm"
                  >
                    +
                  </button>
                </div>
                {!isOutOfStock && (
                  <div className="text-right">
                    <span
                      className={`text-xs font-black uppercase ${isLowStock ? "text-red-500" : "text-slate-400"}`}
                    >
                      {isLowStock ? "Low Stock" : "Availability"}
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {data.stock} units left
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                disabled={isOutOfStock || addingToCart}
                onClick={handleAddToCart}
                className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 active:scale-95"
              >
                <FiShoppingCart size={20} />{" "}
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="flex-1 py-4 px-6 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-300 transition-all shadow-lg shadow-green-100 active:scale-95"
              >
                {isOutOfStock ? "Out of Stock" : "Buy It Now"}
              </button>
            </div>

            {/* Tabs or Description */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-lg">
                <FiInfo className="text-slate-400" /> Product Information
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
