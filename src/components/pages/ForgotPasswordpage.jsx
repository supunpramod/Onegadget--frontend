import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`, { email });
      if (res.data.success) {
        toast.success("Reset link sent to your email!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-[2rem] border border-slate-100 text-center">
        
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#2E2DAD]">
            <Mail size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-800">Forgot Password?</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2E2DAD] text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18}/> Send Reset Link</>}
          </button>
        </form>

        <div className="mt-8">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}