import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Lock,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  Camera,
  Phone,
  MapPin,
  Sparkles
} from "lucide-react";
import uploadMediaToSupabase from "@/components/utils/mediaupload";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "user",
    profileImage: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.profileImage;
      if (selectedFile) {
        imageUrl = await uploadMediaToSupabase(selectedFile);
      }

      const finalData = { ...formData, profileImage: imageUrl };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/`, finalData);

      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-[#2E2DAD] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-white">
            <Sparkles size={40} />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mx-auto mb-4 border border-white/30 shadow-xl">
            <UserIcon size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create Account</h2>
          <p className="text-blue-100 text-sm mt-1 font-medium  opacity-80">Join us to experience something new</p>
        </div>

        <div className="p-8">
          {/* --- Google Redirect Section --- */}
          <div className="flex justify-center mb-8">
            <GoogleLogin
              onSuccess={() => {}} 
              onError={() => toast.error("Signup Failed")}
              ux_mode="redirect"
              login_uri="http://localhost:4000/api/users/google" // ඔයාගේ backend එකේ redirect වෙන්න ඕන uri එක
              
              theme="outline"
              width="350"
              text="signup_with"
            />
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Or use Email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-blue-400 transition-all ring-4 ring-white shadow-inner">
                  {selectedFile ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-300 group-hover:text-blue-500" size={28} />
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                <div className="absolute -bottom-1 -right-1 bg-[#2E2DAD] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <ImageIcon size={14} />
                </div>
              </label>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" name="name" icon={<UserIcon size={18}/>} placeholder="John" value={formData.name} onChange={handleChange} />
              <InputField label="Last Name" name="lastname" placeholder="Doe" value={formData.lastname} onChange={handleChange} noIcon />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Email" type="email" name="email" icon={<Mail size={18}/>} placeholder="john@mail.com" value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="phone" icon={<Phone size={18}/>} placeholder="077..." value={formData.phone} onChange={handleChange} />
            </div>

            <InputField label="Address" name="address" icon={<MapPin size={18}/>} placeholder="123 Street, Colombo" value={formData.address} onChange={handleChange} />
            <InputField label="Password" type="password" name="password" icon={<Lock size={18}/>} placeholder="••••••••" value={formData.password} onChange={handleChange} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E2DAD] text-white py-4 rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Register Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 text-sm font-medium">
            Already a member?{" "}
            <Link to="/login" className="text-[#2E2DAD] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Sub-component
const InputField = ({ label, icon, noIcon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">{label}</label>
    <div className="relative">
      {!noIcon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input
        {...props}
        required
        className={`w-full ${noIcon ? 'px-5' : 'pl-12 pr-5'} py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300`}
      />
    </div>
  </div>
);