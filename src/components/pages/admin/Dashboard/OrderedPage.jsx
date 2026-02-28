import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiShoppingCart,
} from "react-icons/fi";
// Hot Toast Import කිරීම
import toast, { Toaster } from "react-hot-toast";

// Constants
const STATUS_OPTIONS = ["Pending", "Confirmed", "Delivered", "Cancelled"];
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminOrdersCenter() {
  const [orders, setOrders] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Initial Data Fetch
  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/userplace/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const sortedOrders = (response.data.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Order Fetch Error:", err);
      setError("Failed to load orders. Please try again later.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (userId) => {
    if (!userId || userInfo[userId]) return;

    try {
      setLoadingUserId(userId);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.user || response.data;
      setUserInfo((prev) => ({
        ...prev,
        [userId]: data,
      }));
    } catch (err) {
      console.error("User Fetch Error:", err);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // Loading toast එකක් පෙන්වීම
    const loadingToast = toast.loading(`Updating order to ${newStatus}...`);

    try {
      setUpdatingId(orderId);
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_BASE_URL}/api/orders/admin/getplaceorders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      // සාර්ථක පණිවිඩය (Toast)
      toast.success(`Order ${newStatus} & Email sent!`, { id: loadingToast });

      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Status Update Error:", err);
      // අසාර්ථක පණිවිඩය (Toast)
      toast.error(err.response?.data?.message || "Status update failed", {
        id: loadingToast,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const onRowClick = (order) => {
    const userId = order.userId?._id;
    if (expandedOrderId === order._id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(order._id);
      fetchCustomerDetails(userId);
    }
  };

  const isToday = (dateString) => {
    return new Date(dateString).toDateString() === new Date().toDateString();
  };

  const pendingCount = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Fetching orders...</p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toaster Container එක අනිවාර්යයෙන් ඇතුළත් කළ යුතුයි */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            Orders Center
          </h2>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
              {pendingCount} NEW
            </span>
          )}
        </div>

        <button
          onClick={loadAllOrders}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all font-bold text-gray-600 active:scale-95"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  ID
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Products
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Customer
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Total Amount
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Status
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Action
                </th>
                <th className="p-5 font-bold text-gray-400 text-[10px] uppercase tracking-widest">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const isNew =
                  isToday(order.createdAt) && order.status === "Pending";
                return (
                  <React.Fragment key={order._id}>
                    <tr
                      onClick={() => onRowClick(order)}
                      className={`group cursor-pointer transition-all duration-300 hover:bg-blue-50/40 ${
                        expandedOrderId === order._id ? "bg-blue-50/60" : ""
                      } ${isNew ? "bg-amber-50/50" : ""}`}
                    >
                      <td className="p-5">
                        <span className="font-mono font-bold text-blue-600 text-sm">
                          #{order.orderId || order._id.slice(-6)}
                        </span>
                      </td>

                      <td className="p-5">
                        <div className="flex -space-x-4 group-hover:-space-x-1 transition-all duration-500">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
                            />
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="font-bold text-gray-700 text-sm">
                          {order.userId?.name || "Guest User"}
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="font-black text-gray-900 text-sm">
                          Rs. {order.totalAmount?.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : order.status === "Cancelled"
                                ? "bg-rose-50 text-rose-600 border-rose-100"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="p-5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-400 transition-all cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-5 text-[11px] text-gray-400 font-bold uppercase">
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </td>
                    </tr>

                    {expandedOrderId === order._id && (
                      <tr className="bg-gray-50/50">
                        <td
                          colSpan="7"
                          className="p-8 border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-4 duration-500"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div>
                              <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                                <FiShoppingCart /> Ordered Items (
                                {order.items?.length})
                              </h4>
                              <div className="space-y-4">
                                {order.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]"
                                  >
                                    <img
                                      src={item.imageUrl}
                                      className="w-14 h-14 rounded-xl object-cover"
                                      alt=""
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-black text-gray-800">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-400 font-bold">
                                        Qty: {item.qty} × Rs.{item.price}
                                      </p>
                                    </div>
                                    <div className="text-sm font-black text-gray-900">
                                      Rs.
                                      {(item.qty * item.price).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-8">
                              <div>
                                <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                                  <FiUser /> Delivery Details
                                </h4>
                                {loadingUserId === order.userId?._id ? (
                                  <div className="flex items-center gap-2 text-blue-500 italic text-sm font-bold animate-pulse">
                                    Loading contact data...
                                  </div>
                                ) : userInfo[order.userId?._id] ? (
                                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <FiMail className="text-blue-500" />{" "}
                                      {userInfo[order.userId?._id].email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      <FiPhone className="text-blue-500" />{" "}
                                      {userInfo[order.userId?._id].phone ||
                                        "No phone provided"}
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                      <FiMapPin className="text-blue-500 mt-1" />
                                      <span className="leading-relaxed">
                                        {userInfo[order.userId?._id].address ||
                                          "Address not specified"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-rose-500 font-bold">
                                    Contact info unavailable
                                  </p>
                                )}
                              </div>

                              <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <div className="flex justify-between items-center mb-2 opacity-80 text-[10px] font-black uppercase tracking-widest">
                                  <span>Payment Method</span>
                                  <span>{order.paymentMethod || "COD"}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className="text-sm font-bold">
                                    Grand Total
                                  </span>
                                  <span className="text-2xl font-black">
                                    Rs. {order.totalAmount?.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <FiPackage className="text-gray-200 text-6xl mb-4" />
              <p className="text-gray-400 font-bold">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




// total length = 262