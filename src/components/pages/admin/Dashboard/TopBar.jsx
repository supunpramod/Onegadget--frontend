// TopBar.jsx
import React from "react";
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar({ user, mobileOpen, toggleMobile }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-teal-500 p-4 flex justify-between items-center z-50 shadow-lg">
      <div className="flex items-center">
        <button onClick={toggleMobile} className="mr-4 text-white">
          <RxHamburgerMenu size={28} />
        </button>
        <h1 className="text-white text-xl font-bold">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm text-blue-100">Welcome</div>
          <div className="text-white font-semibold">{user?.name || "Admin"}</div>
        </div>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{user?.name?.charAt(0) || "A"}</span>
        </div>
      </div>
    </div>
  );
}
