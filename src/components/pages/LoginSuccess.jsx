import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Backend එකෙන් redirect කරනකොට URL එකේ එවන token එක කියවීම
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      
      // Navbar සහ අනෙකුත් තැන් වලට දැනුම් දීම
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChange"));
      
      toast.success("Login successful!");
      navigate(role === "admin" ? "/admin/dashboard" : "/");
    } else {
      toast.error("Authentication failed!");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return <div className="flex items-center justify-center min-h-screen">Verifying login...</div>;
}