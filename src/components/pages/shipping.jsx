import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// Optional: Use Lucide icons for a pro look
import { MapPin, Phone, Truck, CreditCard, ChevronRight, Edit3 } from "lucide-react";

export default function Shipping() {
  const location = useLocation();
  const orderData = location.state;
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    phone: "",
  });

  const DELIVERY_FEE = 350;

  useEffect(() => {
    const fetchUserCurrentDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setShippingInfo({
            address: res.data.user.address || "",
            phone: res.data.user.phone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCurrentDetails();
  }, []);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <p className="text-gray-400 mb-4 italic text-lg">No order data found!</p>
          <button onClick={() => navigate('/')} className="text-blue-600 font-bold underline">Go back to Shop</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleProceed = () => {
    const itemsTotal = orderData.total || 0;
    const calculatedFinalTotal = itemsTotal + DELIVERY_FEE;

    const finalOrderData = {
      ...orderData,
      shippingAddress: shippingInfo.address,
      contactPhone: shippingInfo.phone,
      deliveryFee: DELIVERY_FEE,
      finalTotal: calculatedFinalTotal,
    };
    
    navigate("/payment", { state: finalOrderData });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
       <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 text-gray-500 font-bold tracking-widest animate-pulse uppercase text-xs">Loading Details</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white overflow-hidden">
        
        {/* Header Section */}
        <div className="pt-10 px-10 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#2E2DAD] p-3 rounded-2xl shadow-lg shadow-blue-200">
               <Truck className="text-white w-6 h-6" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shipping</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium italic">Enter your delivery destination</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
             <div className="h-1.5 w-8 bg-blue-600 rounded-full"></div>
             <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
             <div className="h-1.5 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <div className="px-8 pb-10">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">Delivery Info</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
              >
                <Edit3 size={14} />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {!isEditing ? (
              <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-5">
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm h-fit">
                    <MapPin size={18} className="text-[#2E2DAD]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-1">Address</p>
                    <p className="text-gray-700 font-bold leading-tight">
                      {shippingInfo.address || <span className="text-rose-400">Not provided</span>}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm h-fit">
                    <Phone size={18} className="text-[#2E2DAD]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-black tracking-widest mb-1">Contact</p>
                    <p className="text-gray-700 font-black font-mono">
                      {shippingInfo.phone || <span className="text-rose-400 italic">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="group">
                  <textarea
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                    placeholder="Residential address..."
                  />
                </div>
                <div className="group">
                  <input
                    type="text"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Checkout Summary Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-950 rounded-[2rem] p-6 text-white mb-8 shadow-2xl shadow-blue-100 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">Items Total</span>
              <span className="font-mono">Rs. {orderData.total?.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">Delivery Fee</span>
              <span className="text-blue-400 font-mono">+ Rs. {DELIVERY_FEE.toLocaleString()}</span>
            </div>

            <div className="pt-3 border-t border-gray-700 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-tighter">Total Payable</p>
                <p className="text-3xl font-black tracking-tight font-mono text-white">
                  Rs. {(orderData.total + DELIVERY_FEE).toLocaleString()}
                </p>
              </div>
              <CreditCard className="text-gray-600 mb-1" />
            </div>
          </div>

          {/* Final Button */}
          <button
            onClick={handleProceed}
            disabled={!shippingInfo.address || !shippingInfo.phone}
            className={`group w-full py-5 rounded-[1.5rem] font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              !shippingInfo.address || !shippingInfo.phone
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-[#2E2DAD] text-white hover:bg-blue-700 shadow-[0_15px_30px_rgba(37,99,235,0.3)]"
            }`}
          >
            Confirm & Continue
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}