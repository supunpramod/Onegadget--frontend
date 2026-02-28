import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Edit,
  Save,
  X,
  Shield,
  Camera,
  Loader2,
  CheckCircle,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import uploadMediaToSupabase from "@/components/utils/mediaupload";

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const isGoogleUser = user && user.googleId;

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/users/me",
          { headers: getAuthHeader() }
        );

        if (userRes.data?.user) {
          const userData = userRes.data.user;
          setUser(userData);
          setEditForm({
            name: userData.name || "",
            lastname: userData.lastname || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            profileImage: userData.profileImage || "",
          });
        }
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Navbar එක Update කිරීමට Dispatch කරන Function එක
  const updateNavbar = (imageUrl) => {
    const event = new CustomEvent("profileUpdate", { detail: imageUrl });
    window.dispatchEvent(event);
    
    // LocalStorage එකේ තියෙන පරණ දත්තත් update කරගන්න (Navbar එක initial load එකේදී පාවිච්චි කරනවා නම්)
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    storedUser.profileImage = imageUrl;
    localStorage.setItem("user", JSON.stringify(storedUser));
  };

  const handleDeletePhoto = async () => {
    const result = await Swal.fire({
      title: "Remove Profile Photo?",
      text: "Are you sure you want to delete your profile picture?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        setUploading(true);
        await axios.put(
          import.meta.env.VITE_BACKEND_URL + "/api/users/me",
          { ...editForm, profileImage: "" },
          { headers: getAuthHeader() }
        );

        setEditForm(prev => ({ ...prev, profileImage: "" }));
        setUser(prev => ({ ...prev, profileImage: "" }));
        
        // Navbar එකට පණිවිඩය යැවීම (Image එක හිස් බව)
        updateNavbar("");

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Profile photo has been removed.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({ icon: "error", title: "Failed to delete" });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadMediaToSupabase(file, "profile-pictures");
      setEditForm(prev => ({ ...prev, profileImage: publicUrl }));

      if (!editing) {
        await axios.put(
          import.meta.env.VITE_BACKEND_URL + "/api/users/me",
          { ...editForm, profileImage: publicUrl },
          { headers: getAuthHeader() }
        );
        setUser(prev => ({ ...prev, profileImage: publicUrl }));
        
        // Navbar එකට පණිවිඩය යැවීම (අලුත් පින්තූරයේ URL එක)
        updateNavbar(publicUrl);

        Swal.fire({
          icon: "success",
          title: "Photo Updated!",
          timer: 1500,
          showConfirmButton: false,
          background: "#f0fdf4",
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: "Upload Failed", 
        text: error.message 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        import.meta.env.VITE_BACKEND_URL + "/api/users/me",
        editForm,
        { headers: getAuthHeader() }
      );
      if (res.data) {
        const updatedUser = res.data.user || res.data;
        setUser(updatedUser);
        
        // Save කරන විටත් Navbar එක update කිරීම
        updateNavbar(updatedUser.profileImage);

        Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          timer: 1500,
          showConfirmButton: false,
          background: "#f0fdf4",
        });
        setEditing(false);
      }
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (isGoogleUser) {
      Swal.fire({
        icon: "info",
        title: "Google Login Active",
        text: "Security settings are managed by Google.",
        background: "#eff6ff",
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: '<span class="text-gray-900 font-bold">Change Password</span>',
      html: `
        <div class="space-y-3">
          <input id="current-password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Current Password">
          <input id="new-password" type="password" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="New Password">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
      showClass: { popup: "animate-fade-in" },
      preConfirm: () => {
        const current = document.getElementById("current-password").value;
        const newPass = document.getElementById("new-password").value;
        if (!current || !newPass)
          return Swal.showValidationMessage("Fill all fields");
        if (newPass.length < 6)
          return Swal.showValidationMessage("Password must be at least 6 characters");
        return { currentPassword: current, newPassword: newPass };
      },
    });

    if (formValues) Swal.fire({ 
      icon: "success", 
      title: "Password Updated!",
      timer: 1500,
      showConfirmButton: false,
      background: "#f0fdf4",
    });
  };

  if (loading && !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading Profile...</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-gray-600">No user logged in.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>

          <div className="px-6 pb-8 relative">
            <div className="relative -mt-20 mb-6">
              <div className="relative inline-block group">
                <div className="h-40 w-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {editForm.profileImage ? (
                    <img
                      src={editForm.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <User size={60} />
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                      <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 z-10"
                  disabled={uploading}
                >
                  <Camera size={20} />
                </button>

                {editForm.profileImage && (
                  <button
                    onClick={handleDeletePhoto}
                    className="absolute -bottom-2 -left-2 p-3 bg-red-500 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:scale-105 transition-all duration-200 z-10"
                    disabled={uploading}
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="absolute right-0 top-0 flex space-x-3">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium shadow-md"
                  >
                    <Edit className="h-5 w-5 mr-2" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium shadow-md disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5 mr-2" />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                    >
                      <X className="h-5 w-5 mr-2" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name} {user.lastname}
                </h1>
                {isGoogleUser && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
                    <CheckCircle className="h-3 w-3 mr-1" /> Google Account
                  </span>
                )}
              </div>
              <p className="text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" /> {user.email}
              </p>
            </div>

            {/* Form grid and other fields remain the same as your original code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  First Name
                </label>
                {editing ? (
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Last Name
                </label>
                {editing ? (
                  <input
                    value={editForm.lastname}
                    onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-gray-900 font-medium">{user.lastname || "N/A"}</span>
                  </div>
                )}
              </div>

              {/* ... other fields like phone, email, address follow your original structure ... */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-gray-900 font-medium">{user.phone || "Not provided"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-gray-900 font-medium">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Shipping Address
              </label>
              {editing ? (
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-900 font-medium">{user.address || "No address added yet."}</span>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-emerald-500" /> Security
              </h3>
              {isGoogleUser ? (
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-gray-600 text-sm">Security managed by Google.</p>
                </div>
              ) : (
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-3.5 bg-gray-900 text-white rounded-xl font-medium"
                >
                  <Lock className="h-5 w-5 inline mr-2" /> Change Password
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}