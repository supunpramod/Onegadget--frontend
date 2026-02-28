import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import AddProducts from "../addProducts";
import AdminAllProductView from "../AdminAllProductView";
import EditProducts from "../EditProducts";
import Notification from "../notification";
import StatCard from "../Dashboard/StatCard";
import OrderedPage from "./OrderedPage";
import AdsManage from "@/components/pages/admin/AdsManage";

import { FiPackage, FiUsers, FiDollarSign } from "react-icons/fi";
import { MdShoppingCart } from "react-icons/md";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DashboardRoutes() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsers: 0
  });

  const [loading, setLoading] = useState(true); // Data load වෙනකම් පෙන්වන්න

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BACKEND_URL}/api/orders/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Routes>
      <Route
        index
        element={
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="text-6xl mb-6 animate-bounce">📊</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 max-w-2xl mb-8">
              Manage your products, orders, and users efficiently from here. 
              The revenue shown is based on <b>Confirmed</b> and <b>Delivered</b> orders.
            </p>

            {loading ? (
              <div className="text-gray-500 font-medium">Fetching latest data...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 w-full max-w-6xl">
                <StatCard
                  icon={<FiPackage size={24} />}
                  title="Total Products"
                  value={stats.totalProducts}
                  color="text-green-600"
                />
                <StatCard
                  icon={<MdShoppingCart size={24} />}
                  title="Total Orders"
                  value={stats.totalOrders}
                  color="text-indigo-600"
                />
                <StatCard
                  icon={<FiDollarSign size={24} />}
                  title="Total Revenue"
                  value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                  color="text-amber-600"
                />
                <StatCard
                  icon={<FiUsers size={24} />}
                  title="Total Users"
                  value={stats.newUsers}
                  color="text-teal-600"
                />
              </div>
            )}
          </div>
        }
      />
      <Route path="adminviewproducts" element={<AdminAllProductView />} />
      <Route path="addproducts" element={<AddProducts />} />
      <Route path="editproducts" element={<EditProducts />} />
      <Route path="notification" element={<Notification />} />
      <Route path="orders" element={<OrderedPage />} />
      <Route path="ads" element={<AdsManage />} />
    </Routes>
  );
}