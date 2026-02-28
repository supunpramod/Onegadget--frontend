import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import { RxDashboard, RxExit } from "react-icons/rx";
import {
  MdOutlineGridView,
  MdAddBox,
  MdNotifications,
  MdShoppingCart,
  MdCampaign,
} from "react-icons/md";

export default function Sidebar({
  user: initialUser,
  handleLogout,
  closeMobile,
}) {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // --- MANUAL REFETCH LOGIC ---
  const fetchBadgeData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };

      // 1. User Profile Fetch (Using /api/users/me)
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, { headers });
      // ඔබේ API එකේ දත්ත පවතින්නේ response.data.user තුළ බැවින්:
      if (userResponse.data && userResponse.data.success) {
        setCurrentUser(userResponse.data.user);
      }

      // 2. ඇණවුම් ගණන ලබා ගැනීම
      const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders/userplace/orders`, { headers });
      const oCount = (ordersResponse.data.orders || []).filter(
        (order) => order.status === "Pending"
      ).length;
      setPendingOrdersCount(oCount);

      // 3. නොකියවූ පණිවිඩ ගණන ලබා ගැනීම
      const notifyResponse = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, { headers });
      if (notifyResponse.data.success) {
        setUnreadNotifications(notifyResponse.data.count);
      }
      
      console.log("Sidebar data refetched manually");
    } catch (err) {
      console.error("Sidebar Badge Fetch Error:", err);
    }
  }, [API_BASE_URL]);

  // Global access ලබා දීම
  useEffect(() => {
    window.refetchSidebarBadges = fetchBadgeData;
    return () => {
      delete window.refetchSidebarBadges;
    };
  }, [fetchBadgeData]);

  useEffect(() => {
    fetchBadgeData();
    // Auto polling (every 60s)
    const interval = setInterval(fetchBadgeData, 60000);
    return () => clearInterval(interval);
  }, [fetchBadgeData]);

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
      isActive ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-blue-50 text-gray-700"
    }`;

  return (
    <div className="fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300">
      
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Link to="/admin/dashboard" className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center mr-3">
            <RxDashboard className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-gray-800">AdminPanel</span>
        </Link>
      </div>

      {/* User Info (Fetch කළ Profile Picture එක මෙහි දිස්වේ) */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 flex items-center justify-center bg-blue-500 mr-3 shadow-sm">
            {currentUser?.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt="Admin" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin"; }}
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {currentUser?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-gray-800 truncate text-sm">
              {currentUser?.name || "Admin User"}
            </div>
            <div className="text-[10px] mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full inline-block font-bold uppercase">
              {currentUser?.role || "Administrator"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Management
        </div>

        <NavLink to="/admin/dashboard" end className={navItemClass} onClick={closeMobile}>
          <RxDashboard size={20} className="text-blue-600" />
          Overview
        </NavLink>

        <NavLink to="/admin/dashboard/adminviewproducts" className={navItemClass} onClick={closeMobile}>
          <MdOutlineGridView size={20} className="text-green-600" />
          View Products
        </NavLink>

        <NavLink to="/admin/dashboard/addproducts" className={navItemClass} onClick={closeMobile}>
          <MdAddBox size={20} className="text-purple-600" />
          Add Product
        </NavLink>

        {/* Notifications */}
        <NavLink to="/admin/dashboard/notification" className={navItemClass} onClick={closeMobile}>
          <div className="relative">
            <MdNotifications size={20} className="text-red-600" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="flex justify-between items-center w-full">
            <span>Notifications</span>
            {unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </div>
        </NavLink>

        {/* Orders */}
        <NavLink to="/admin/dashboard/orders" className={navItemClass} onClick={closeMobile}>
          <div className="relative">
            <MdShoppingCart size={20} className="text-indigo-600" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="flex justify-between items-center w-full">
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {pendingOrdersCount} NEW
              </span>
            )}
          </div>
        </NavLink>

        <NavLink to="/admin/dashboard/ads" className={navItemClass} onClick={closeMobile}>
          <MdCampaign size={20} className="text-orange-600" />
          Ads Management
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <RxExit size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}