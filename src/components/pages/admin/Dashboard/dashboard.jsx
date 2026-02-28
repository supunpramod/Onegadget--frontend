import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

import Sidebar from "@/components/pages/admin/Dashboard/Sidebar";
import TopBar from "@/components/pages/admin/Dashboard/TopBar";
import DashboardRoutes from "@/components/pages/admin/Dashboard/DashboardRoutes";
import Footer from "@/components/pages/admin/Dashboard/Footer";

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, newUsers: 0 });

  const navigate = useNavigate();

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("authChange"));
        navigate("/login");
      }
    });
  };

  const authcheck = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      navigate("/login");
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        Swal.fire({ icon: "error", title: "Access Denied", text: "Only administrators can access this dashboard" })
          .then(() => navigate("/"));
        setLoading(false);
        return;
      }
      setUser(decoded);
      setLoading(false);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    authcheck();
    window.addEventListener("authChange", authcheck);
    return () => window.removeEventListener("authChange", authcheck);
  }, [authcheck]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar user={user} unreadCount={unreadCount} stats={stats} handleLogout={handleLogout} closeMobile={() => setMobileOpen(false)} />
      <TopBar user={user} mobileOpen={mobileOpen} toggleMobile={toggleMobile} />
      <div className="flex-1 lg:mt-15 lg:ml-20">
        <DashboardRoutes stats={stats} />
        <Footer />
      </div>
    </div>
  );
}
