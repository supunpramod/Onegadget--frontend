// import React, { useEffect, useState } from "react";
// import Navbar from "../Navbar";
// import { Route, Routes } from "react-router-dom";
// import HomeContainer from "@/components/pages/HomeContainer";
// import Login from "./Login";
// import Dashboard from "@/components/pages/admin/Dashboard/dashboard";
// import NotFound from "@/components/pages/NotFound";
// import Signup from "@/components/pages/singUp";
// import Productoverview from "./productoverview";
// import ViewCartPage from "./viewCart";
// import ShipingPage from "@/components/pages/shipping";
// import AboutPage from "@/components/pages/about.jsx";
// import ServicePage from "@/components/pages/service.jsx";
// import { jwtDecode } from "jwt-decode";
// import AiChatBot from "@/components/aiChatBot";
// import PaymentPage from "@/components/pages/admin/payment";
// import OrderPage from "@/components/pages/orderpage.jsx";
// import ProfilePage from "@/components/pages/ProfilePage.jsx";
// import ContactPage from "@/components/pages/contactPage.jsx";
// import ForgotPassword from "@/components/pages/ForgotPasswordpage";
// import ResetPassword from "@/components/pages/ResetPasswordPage.jsx";
// import LoginSuccess from "@/components/pages/LoginSuccess";
// import CategoryPage from "@/components/pages/CategoryPage";
// import Bottomfooter from "@/components/bottomfooter";


// export default function Homepage() {
//   const [user, setUser] = useState("customer");

//   useEffect(() => {
//     const authcheck = () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setUser("customer");
//         return;
//       }

//       try {
//         const decoded = jwtDecode(token);
//         setUser(decoded.role === "admin" ? "admin" : "customer");
//       } catch {
//         setUser("customer");
//       }
//     };

//     authcheck();
//     window.addEventListener("authChange", authcheck);
//     return () => window.removeEventListener("authChange", authcheck);
//   }, []);

//   return (
//     <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
//       <Navbar />

//       <div className="flex-1 pt-[60px] overflow-y-auto">
//         <Routes>
//           <Route path="/" element={<HomeContainer />} />
//           <Route path="/viewcart" element={<ViewCartPage />} />
//           <Route path="/about" element={<AboutPage />} />
//           <Route path="/shipping/" element={<ShipingPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/contact" element={<ContactPage />} />
//           <Route path="/orders" element={<OrderPage />} />
//           <Route path="/orders/:orderId" element={<OrderPage />} />
//           <Route path="/service" element={<ServicePage />} />
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/payment" element={<PaymentPage />} />
//           <Route path="/admin/dashboard/*" element={<Dashboard />} />
//           <Route
//             path="/productoverview/:productId"
//             element={<Productoverview />}
//           />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/login-success" element={<LoginSuccess />} />
//           <Route path="/category/:slug" element={<CategoryPage/>} />

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </div>

     

//       {/* Show chatbot only for customer */}
//       {user === "customer" && <AiChatBot />}
//       <Bottomfooter></Bottomfooter>
//     </div>
    
//   );
// }


import React, { useEffect, useState, useCallback } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Components
import Navbar from "../Navbar";
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
import AiChatBot from "@/components/aiChatBot";
import PaymentPage from "@/components/pages/admin/payment";
import OrderPage from "@/components/pages/orderpage.jsx";
import ProfilePage from "@/components/pages/ProfilePage.jsx";
import ContactPage from "@/components/pages/contactPage.jsx";
import ForgotPassword from "@/components/pages/ForgotPasswordpage";
import ResetPassword from "@/components/pages/ResetPasswordPage.jsx";
import LoginSuccess from "@/components/pages/LoginSuccess";
import CategoryPage from "@/components/pages/CategoryPage";
import Bottomfooter from "@/components/bottomfooter";
import OurBrands from "@/components/Ourbrands";

export default function Homepage() {
  const [userRole, setUserRole] = useState("customer");

  // Auth පරීක්ෂා කරන function එක
  const authCheck = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserRole("customer");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // Token එක expire වී ඇත්දැයි බැලීම (Security boost)
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        setUserRole("customer");
      } else {
        setUserRole(decoded.role === "admin" ? "admin" : "customer");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUserRole("customer");
    }
  }, []);

  useEffect(() => {
    authCheck();
    // වෙනත් tab එකකින් logout වුවහොත් එය හඳුනා ගැනීමට
    window.addEventListener("authChange", authCheck);
    window.addEventListener("storage", authCheck); 

    return () => {
      window.removeEventListener("authChange", authCheck);
      window.removeEventListener("storage", authCheck);
    };
  }, [authCheck]);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <Navbar />

      {/* ප්‍රධාන කොටස - මෙහි Footer එකත් ඇතුළත් කළා scroll වීමට */}
      <div className="flex-1 pt-[60px] overflow-y-auto flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeContainer />} />
            <Route path="/viewcart" element={<ViewCartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/shipping" element={<ShipingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/orders/:orderId" element={<OrderPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            
            {/* Admin Dashboard එක ආරක්ෂා කිරීම (Protected Route) */}
            <Route 
              path="/admin/dashboard/*" 
              element={userRole === "admin" ? <Dashboard /> : <Navigate replace to="/login" />} 
            />

            <Route path="/productoverview/:productId" element={<Productoverview />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/category/:slug" element={<CategoryPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
<OurBrands></OurBrands>
        <Bottomfooter />
      </div>

      {/* සාමාන්‍ය පාරිභෝගිකයන්ට පමණක් ChatBot එක පෙන්වයි */}
      {userRole === "customer" && <AiChatBot />}
    </div>
  );
}