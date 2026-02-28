import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import {
  ShoppingCart,
  Package,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import NotificationsDropdown from "@/components/utils/notificationDrop";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const DEFAULT_IMAGE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";

  // Notification කියවූ බව mark කිරීම
  const handleMarkAsSeen = async () => {
    if (!hasUpdates) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await axios.put(
        `${BACKEND_URL}/api/orders/mark-seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHasUpdates(false);
      window.dispatchEvent(new Event("storage")); // අනිත් components update කිරීමට
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const checkOrderUpdates = useCallback(async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unread = response.data.orders?.some(
        (order) => order.isViewedByUser === false
      );
      setHasUpdates(unread);
    } catch (error) {
      console.error("Check Updates Error:", error);
    }
  }, [BACKEND_URL]);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setHasUpdates(false);
      return;
    }
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data.user;
      setUser(userData);
      setIsAdmin(userData.role === "admin");
      checkOrderUpdates(token);
    } catch (error) {
      console.error("Navbar Auth Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  }, [BACKEND_URL, checkOrderUpdates]);

  useEffect(() => {
    fetchUserData();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("authChange", fetchUserData);
    window.addEventListener("storage", fetchUserData);
    window.addEventListener("profileUpdate", fetchUserData);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("authChange", fetchUserData);
      window.removeEventListener("storage", fetchUserData);
      window.removeEventListener("profileUpdate", fetchUserData);
    };
  }, [fetchUserData]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setIsAdmin(false);
    setHasUpdates(false);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const userId = user?._id || user?.id || "";
  const profileImgSrc = user?.profileImage || user?.picture || DEFAULT_IMAGE;

  const navLinkClass = (path) => `
    relative text-[14px] font-medium transition-all duration-300 px-3 py-2 rounded-lg text-white
    ${location.pathname === path ? "text-white bg-blue-50/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}
  `;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#3ead2d] backdrop-blur-md shadow-sm border-b border-slate-100 py-2.5" : "bg-[#2E2DAD] py-4"}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#2E2DAD] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">M</div>
          <span className="text-xl font-black tracking-tight text-white">OneGadget</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 ">
          <div className="flex items-center gap-1 mr-4 ">
            <Link to="/" className={navLinkClass("/")}>Home</Link>
            <Link to="/about" className={navLinkClass("/about")}>About</Link>
            <Link to="/service" className={navLinkClass("/service")}>Services</Link>
            <Link to="/contact" className={navLinkClass("/contact")}>Contact</Link>
          </div>

          

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-1">
                <Link title="Cart" to="/viewcart" className="p-2 text-white hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                  <ShoppingCart size={20} />
                </Link>

                <Link title="Orders" to="/orders" onClick={handleMarkAsSeen} className="p-2 text-white hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                  <Package size={20} />
                  {hasUpdates && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white"></span>
                    </span>
                  )}
                </Link>
              </div>
            )}

            {isAdmin && <NotificationsDropdown />}

            {isAdmin && (
              <Link to="/admin/dashboard" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-600 transition-all shadow-sm flex items-center gap-2">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <Link to={`/profile?userId=${userId}`} className="flex items-center gap-3 p-1 pr-3 rounded-full border border-slate-100 hover:border-blue-400 transition-all bg-slate-50/50">
                  <img src={profileImgSrc} className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" alt="profile" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block">{user.name?.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout} title="Logout" className="p-2 text-white hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-white hover:text-slate-900 px-3">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">Join Now</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 overflow-hidden md:hidden shadow-2xl">
            <div className="p-6 flex flex-col gap-2">
              <MobileNavLink to="/" label="Home" active={location.pathname === "/"} onClick={() => setMenuOpen(false)} />
              <MobileNavLink to="/about" label="About" active={location.pathname === "/about"} onClick={() => setMenuOpen(false)} />
              <MobileNavLink to="/service" label="Services" active={location.pathname === "/service"} onClick={() => setMenuOpen(false)} />
              <MobileNavLink to="/contact" label="Contact" active={location.pathname === "/contact"} onClick={() => setMenuOpen(false)} />

              {user && (
                <>
                  <div className="h-[1px] bg-slate-100 my-2" />
                  <MobileNavLink to="/viewcart" label="Shopping Cart" active={location.pathname === "/viewcart"} onClick={() => setMenuOpen(false)} />
                  <MobileNavLink 
                    to="/orders" 
                    label={<div className="flex items-center gap-2">My Orders {hasUpdates && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>}</div>} 
                    active={location.pathname === "/orders"} 
                    onClick={() => { handleMarkAsSeen(); setMenuOpen(false); }} 
                  />
                  <Link to={`/profile?userId=${userId}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mt-2">
                    <img src={profileImgSrc} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" alt="avatar" />
                    <span className="font-bold text-slate-700">My Profile</span>
                  </Link>
                </>
              )}

              {!user ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-center text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">Login</Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="py-3 text-center text-sm font-bold bg-blue-600 text-white rounded-xl">Sign Up</Link>
                </div>
              ) : (
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="mt-4 flex items-center justify-center gap-2 py-3 w-full text-sm font-bold text-rose-600 bg-rose-50 rounded-xl">
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl font-semibold transition-all ${active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
      {label} <ChevronRight size={16} className={active ? "opacity-100" : "opacity-30"} />
    </Link>
  );
}