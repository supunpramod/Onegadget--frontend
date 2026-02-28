import React, { useEffect, useState } from "react";
import { loadCart, deleteItem, updateItemQty } from "@/components/utils/cart";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  AlertCircle,
  Package,
  CreditCard,
  Minus,
  Plus,
  Truck,
  Info,
} from "lucide-react";

const DELIVERY_FEE = 350;

const initialQuoteState = {
  orderedItems: [],
  total: 0,
  labeledTotal: 0,
  discount: 0,
  message: "Calculating prices...",
};

export default function ViewCart() {
  const [quoteData, setQuoteData] = useState(initialQuoteState);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setToken(null);
      setQuoteData({
        ...initialQuoteState,
        message: "Please log in to view your cart.",
      });
      return;
    }
    setToken(storedToken);
  }, []);

  const fetchQuote = async (currentToken) => {
    const cart = loadCart();
    if (!cart.length) {
      setQuoteData({ ...initialQuoteState, message: "Your cart is empty." });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/orders/quote",
        { orderedItems: cart },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      setQuoteData(data);
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      setQuoteData((prev) => ({
        ...prev,
        message: serverMessage || "Failed to fetch prices.",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchQuote(token);
  }, [token]);

  const handleQtyChange = (productId, currentQty, change, maxStock) => {
    const newQty = currentQty + change;

    // --- STOCK VALIDATION ---
    if (newQty > maxStock) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "Maximum stock reached",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    if (newQty < 1) return;
    updateItemQty(productId, newQty);
    if (token) fetchQuote(token);
  };

  const handleDelete = (productId, productName) => {
    Swal.fire({
      title: "Remove Item?",
      text: `Do you want to remove "${productName}" from cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem(productId);
        const updatedCart = loadCart();
        if (updatedCart.length === 0) {
          setQuoteData({
            ...initialQuoteState,
            message: "Your cart is empty.",
          });
        } else {
          fetchQuote(token);
        }
      }
    });
  };

  const handleCheckout = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    // --- FINAL STOCK CHECK BEFORE CHECKOUT ---
    const outOfStockItems = quoteData.orderedItems.filter(
      (item) => item.stock <= 0,
    );
    if (outOfStockItems.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Items Out of Stock",
        text: "Some items in your cart are no longer available. Please remove them to proceed.",
      });
      return;
    }

    if (!quoteData.orderedItems.length || quoteData.total <= 0) return;

    const finalTotal = quoteData.total + DELIVERY_FEE;

    Swal.fire({
      title: "Confirm Checkout",
      html: `
        <div class="text-left text-sm p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <div class="flex justify-between mb-2 text-gray-600 font-medium"><span>Items Subtotal:</span> <span>Rs. ${quoteData.total.toLocaleString()}</span></div>
           <div class="flex justify-between text-blue-600 font-medium"><span>Delivery Charge:</span> <span>Rs. ${DELIVERY_FEE.toLocaleString()}</span></div>
           <hr class="my-3 border-gray-200" />
           <div class="flex justify-between text-lg font-black text-slate-900"><span>Grand Total:</span> <span>Rs. ${finalTotal.toLocaleString()}</span></div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Secure Checkout",
    }).then((result) => {
      if (result.isConfirmed) {
        const dataToPass = {
          ...quoteData,
          total: quoteData.total,
          deliveryFee: DELIVERY_FEE,
          finalTotal: finalTotal,
          orderedItems: quoteData.orderedItems.map((item) => ({
            ...item,
            images: Array.isArray(item.images)
              ? item.images
              : item.image
                ? [item.image]
                : [],
          })),
        };
        navigate("/shipping/", { state: dataToPass });
      }
    });
  };

  const { orderedItems, total, labeledTotal, discount, message } = quoteData;
  const finalTotalDisplay = total > 0 ? total + DELIVERY_FEE : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-100">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
          </div>
          <span className="text-gray-400 font-bold">
            {orderedItems.length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN: Items */}
          <div className="lg:col-span-2 space-y-6">
            {message && (
              <div className="p-4 bg-white border-l-4 border-amber-500 rounded-xl shadow-sm flex items-center text-amber-700 font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" /> {message}
              </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              {orderedItems.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {orderedItems.map((item) => {
                    const isLowStock = item.stock > 0 && item.stock <= 5;
                    const isOutOfStock = item.stock <= 0;

                    return (
                      <div
                        key={item.productId}
                        className={`p-8 flex flex-col md:flex-row items-center gap-8 transition-all ${isOutOfStock ? "bg-red-50/30 opacity-80" : "hover:bg-gray-50/50"}`}
                      >
                        {/* Image */}
                        {/* Image */}
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                            {/* Check if images exists and has length. 
       If item.images is a string (legacy), it uses that. 
       If it's an array, it takes the first one.
    */}
                            {item.images &&
                            (Array.isArray(item.images)
                              ? item.images.length > 0
                              : item.images) ? (
                              <img
                                src={
                                  Array.isArray(item.images)
                                    ? item.images[0]
                                    : item.images
                                }
                                alt={item.productName}
                                className={`w-full h-full object-cover ${isOutOfStock ? "grayscale" : ""}`}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=No+Image"; // Fallback if URL is broken
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          {isOutOfStock && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                              SOLD OUT
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {item.productName}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="text-emerald-600 font-black text-lg">
                              Rs. {item.lastPrice.toLocaleString()}
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                🔥 Only {item.stock} left
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-center md:justify-start gap-6">
                            <div
                              className={`flex items-center border-2 rounded-xl p-1 bg-white ${isOutOfStock ? "opacity-50 border-gray-100" : "border-slate-100"}`}
                            >
                              <button
                                disabled={isOutOfStock}
                                onClick={() =>
                                  handleQtyChange(
                                    item.productId,
                                    item.qty,
                                    -1,
                                    item.stock,
                                  )
                                }
                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 disabled:cursor-not-allowed"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="px-5 font-black text-slate-700 min-w-[40px] text-center">
                                {item.qty}
                              </span>
                              <button
                                disabled={isOutOfStock}
                                onClick={() =>
                                  handleQtyChange(
                                    item.productId,
                                    item.qty,
                                    1,
                                    item.stock,
                                  )
                                }
                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 disabled:cursor-not-allowed"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                handleDelete(item.productId, item.productName)
                              }
                              className="group p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={22} />
                            </button>
                          </div>
                        </div>

                        {/* Total per Item */}
                        <div className="text-right hidden md:block min-w-[120px]">
                          <p className="text-xl font-black text-slate-900 leading-none mb-1">
                            Rs. {(item.lastPrice * item.qty).toLocaleString()}
                          </p>
                          {item.discount > 0 && (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">
                              Saved Rs.{" "}
                              {(item.discount * item.qty).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-slate-400 mb-8">
                    Looks like you haven't added anything yet.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all shadow-lg shadow-slate-200"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-50 sticky top-10">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                Summary <Info size={18} className="text-slate-300" />
              </h2>

              <div className="space-y-5 text-slate-500 border-b border-dashed border-slate-100 pb-8 mb-8">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold font-mono">
                    Rs. {labeledTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between font-medium">
                  <span>Total Discount</span>
                  <span className="text-emerald-500 font-black">
                    - Rs. {discount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                    <Truck size={18} className="text-blue-500" />
                    Delivery Fee
                  </span>
                  <span className="text-slate-900 font-black font-mono">
                    Rs. {DELIVERY_FEE.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">
                    Total Amount
                  </p>
                  <span className="text-3xl font-black text-slate-900 leading-none font-mono">
                    Rs. {finalTotalDisplay.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={
                  loading ||
                  total <= 0 ||
                  orderedItems.some((i) => i.stock <= 0)
                }
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-300 hover:bg-black transition-all flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-30 disabled:grayscale transform active:scale-[0.98]"
              >
                {loading ? (
                  "Syncing..."
                ) : (
                  <>
                    <CreditCard size={20} /> Secure Checkout
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-6 font-medium uppercase tracking-widest">
                🔒 SSL Encrypted & Secure Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
