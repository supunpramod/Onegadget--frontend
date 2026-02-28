import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams(); // URL එකේ ඇති token එක ලබා ගැනීම
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    setLoading(true);

    try {
      const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        
        <h2 className="text-2xl font-black text-slate-800 text-center">Set New Password</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium text-center">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="New Password"
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Confirm New Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={18}/> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}