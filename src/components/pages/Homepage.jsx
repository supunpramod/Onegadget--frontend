import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { Route, Routes } from "react-router-dom";
import HomeContainer from "@/components/pages/HomeContainer";
import Login from "./Login";
import Dashboard from "@/components/pages/admin/Dashboard/dashboard";
import NotFound from "@/components/pages/NotFound";
import Signup from "@/components/pages/singUp";
import Productoverview from "./productoverview";
import ViewCartPage from "./viewCart";
import ShipingPage from "@/components/pages/shipping";
import AboutPage from "@/components/pages/about.jsx";
import ServicePage from "@/components/pages/service.jsx";
import { jwtDecode } from "jwt-decode";
import AiChatBot from "@/components/aiChatBot";
import PaymentPage from "@/components/pages/admin/payment";
import OrderPage from "@/components/pages/orderpage.jsx";
import ProfilePage from "@/components/pages/ProfilePage.jsx";
import ContactPage from "@/components/pages/contactPage.jsx";
import ForgotPassword from "@/components/pages/ForgotPasswordpage";
import ResetPassword from "@/components/pages/ResetPasswordPage.jsx";
import LoginSuccess from "@/components/pages/LoginSuccess";
import CategoryPage from "@/components/pages/CategoryPage";


export default function Homepage() {
  const [user, setUser] = useState("customer");

  useEffect(() => {
    const authcheck = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser("customer");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        setUser(decoded.role === "admin" ? "admin" : "customer");
      } catch {
        setUser("customer");
      }
    };

    authcheck();
    window.addEventListener("authChange", authcheck);
    return () => window.removeEventListener("authChange", authcheck);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <Navbar />

      <div className="flex-1 pt-[80px] overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeContainer />} />
          <Route path="/viewcart" element={<ViewCartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shipping/" element={<ShipingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/orders/:orderId" element={<OrderPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/admin/dashboard/*" element={<Dashboard />} />
          <Route
            path="/productoverview/:productId"
            element={<Productoverview />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/category/:slug" element={<CategoryPage/>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Show chatbot only for customer */}
      {user === "customer" && <AiChatBot />}
    </div>
  );
}
