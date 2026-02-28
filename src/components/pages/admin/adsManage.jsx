import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import uploadMediaToSupabase from "@/components/utils/mediaUpload";
import {
  MdCloudUpload,
  MdTextFields,
  MdCrop,
  MdDelete,
  MdDesktopWindows,
  MdCategory,
} from "react-icons/md";
import Swal from "sweetalert2";

// Image Cropping Helper
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
};

export default function AdsManage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ads, setAds] = useState([]);

  // CATEGORY TARGETING STATES
  const [targetCategory, setTargetCategory] = useState("home");
  const [categories, setCategories] = useState([]); 

  // Cropper States
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  // --- ප්ලේස්මන්ට් එකේ නම dynamic ලෙස ලබා ගැනීම ---
  const selectedCategoryName = 
    targetCategory === "home" 
    ? "Main Home" 
    : (categories.find(c => c.slug === targetCategory)?.name || targetCategory);

  // --- තෝරාගත් Category එකට අදාළව පමණක් Ads Filter කිරීම ---
  // Array.isArray එකෙන් ads කියන්නේ array එකක්ද කියලා check කරලා ආරක්ෂිතව filter කරනවා
  const filteredAds = Array.isArray(ads) ? ads.filter(ad => ad.category === targetCategory) : [];

  const fetchAds = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ads`);
      // Backend එකෙන් කෙලින්ම Array එකක් එවන්නේ නැත්නම් res.data.data ලබා ගන්නවා
      const adsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setAds(adsData);
    } catch (err) {
      console.error("Error fetching ads", err);
      setAds([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`);
      const catData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setCategories(catData);
    } catch (err) {
      console.error("Error fetching categories", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchCategories();
  }, []);

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setTempImage(url);
      setShowCropper(true);
    }
  };

  const confirmCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(tempImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], `ad-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setFile(croppedFile);
      setPreview(URL.createObjectURL(croppedBlob));
      setShowCropper(false);
      URL.revokeObjectURL(tempImage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      Swal.fire({ icon: "error", title: "Missing Info", text: "Please add a title and an image." });
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await uploadMediaToSupabase(file, "banners");
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ads`, {
        title: title,
        imageUrl: publicUrl,
        category: targetCategory, 
      });
      Swal.fire({ icon: "success", title: "Campaign Launched!", timer: 2000, showConfirmButton: false });
      setFile(null); setPreview(null); setTitle("");
      fetchAds();
    } catch (err) {
      Swal.fire("Error", "Failed to publish.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Campaign?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/ads/${id}`);
        fetchAds();
        Swal.fire("Deleted!", "", "success");
      } catch (err) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen space-y-10 bg-[#f9fafb]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: INPUTS */}
        <div className="lg:col-span-7 bg-white rounded-[32px] shadow-sm border border-gray-200 p-6 md:p-10 space-y-8">
          <header className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <MdCloudUpload size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Campaign Manager</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase">Targeted Ad Management</p>
            </div>
          </header>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Headline Text</label>
              <div className="relative group">
                <MdTextFields className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., WINTER COLLECTION 2026"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Target Placement</label>
              <div className="relative group">
                <MdCategory className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full pl-14 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="home">🏠 Main Home Page</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>📂 {cat.name} Page</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Banner Design</label>
              <div className="relative group border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50 hover:bg-white transition-all cursor-pointer">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                <div className="p-10 text-center">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <MdCloudUpload size={28} className="text-blue-500" />
                  </div>
                  <p className="text-gray-600 font-bold text-sm">Upload High-Res Banner</p>
                  <p className="text-gray-400 text-[9px] mt-1 uppercase italic font-black">21:7 Ratio Recommended</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest text-white bg-gray-900 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {uploading ? "Processing Launch..." : "Publish Campaign"}
          </button>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111827] rounded-[32px] p-2.5 shadow-2xl border border-gray-800 relative overflow-hidden">
              
              {/* Preview Badge */}
              <div className="absolute top-5 left-5 z-20">
                 <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl border border-white/20">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-wider">{selectedCategoryName} Preview</span>
                 </div>
              </div>

              <div className="relative aspect-[21/7] bg-gray-900 rounded-[24px] overflow-hidden border border-white/5">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover opacity-90" alt="Preview" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-40">
                    <MdCrop size={32} />
                    <p className="text-[9px] font-black uppercase mt-2">New Image Preview</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex gap-4 items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                 <MdDesktopWindows size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">Active Destination</p>
                <p className="text-[13px] text-blue-900 font-bold leading-tight">
                  Currently managing ads for the <span className="text-blue-600 underline decoration-2 underline-offset-4">{selectedCategoryName}</span> page.
                </p>
              </div>
            </div>
        </div>
      </div>

      {/* FILTERED LIVE ADS LIST */}
      <div className="pt-10 border-t border-gray-200">
        <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-black text-gray-800 italic uppercase">
                Live on {selectedCategoryName} ({filteredAds.length})
            </h3>
        </div>
        
        {filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad._id} className="bg-white p-4 rounded-[28px] border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all">
                <div className="w-40 aspect-[21/7] rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                  <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-800 text-sm uppercase leading-tight">{ad.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[9px] text-gray-500 font-black uppercase">{ad.category}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(ad._id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No Active Campaigns on this page</p>
          </div>
        )}
      </div>

      {/* CROPPER MODAL */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-4xl h-[60vh] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={21 / 7}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="mt-8 flex gap-4">
            <button onClick={() => setShowCropper(false)} className="px-10 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-white/20 transition-all tracking-widest">Cancel</button>
            <button onClick={confirmCrop} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-blue-500 transition-all tracking-widest shadow-lg shadow-blue-500/20">Apply Crop</button>
          </div>
        </div>
      )}
    </div>
  );
}