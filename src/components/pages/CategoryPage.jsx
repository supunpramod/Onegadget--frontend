import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Loader2, ArrowLeft, LayoutGrid, SlidersHorizontal, 
  ChevronDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Card from "@/components/Card";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // DYNAMIC CATEGORY ADS STATE
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adsData, setAdsData] = useState([]); 

  const nextSlide = () => setCurrentSlide((prev) => (prev === adsData.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? adsData.length - 1 : prev - 1));

  // Auto-slide logic
  useEffect(() => {
    if (adsData && adsData.length > 1) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [adsData.length]);
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // FETCH PRODUCTS AND CATEGORY-SPECIFIC IMAGES ONLY
        const [productRes, adsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/category/${slug}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ads?category=${slug}`)
        ]);
        
        // Safety checks for response data structure
        const fetchedProducts = Array.isArray(productRes.data) ? productRes.data : (productRes.data.data || []);
        const fetchedAds = Array.isArray(adsRes.data) ? adsRes.data : (adsRes.data.data || []);

        setProducts(fetchedProducts);
        setAdsData(fetchedAds); 
      } catch (error) {
        console.error("Fetching error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const sortedProducts = React.useMemo(() => {
    let result = [...products];
    if (sortBy === "low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "new") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Collection</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      
      {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
      {/* DYNAMIC BANNER SECTION: FETCHES ONLY CATEGORY IMAGES */}
      <section className="relative h-[400px] md:h-[550px] overflow-hidden bg-slate-900">
        {adsData && adsData.length > 0 ? (
          adsData.map((ad, index) => (
            <div 
              key={ad._id || index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
              }`}
            >
              <img 
                src={ad.imageUrl} 
                className="w-full h-full object-cover opacity-60" 
                alt={ad.title} 
              />
            </div>
          ))
        ) : (
          // Fallback if no specific banner is uploaded for this category
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center" />
        )}
        
        {/* Slider Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors mb-8">
             <ArrowLeft size={14} /> Back to Home
          </Link>
          
          {/* Show Ad Title as Sub-heading */}
          <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">
            {adsData[currentSlide]?.title || "Premium Selection"}
          </span>
          
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8]">
            {slug ? slug.replace(/-/g, ' ') : "Collection"}
          </h1>
        </div>

        {/* Slider Controls - Only visible if there are multiple images */}
        {adsData && adsData.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all z-20">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all z-20">
              <ChevronRight size={24} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-20">
              {adsData.map((_, i) => (
                <div key={i} className={`h-1 transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-white/30"}`} />
              ))}
            </div>
          </>
        )}
      </section>
      {/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

      {/* Filter/Sort Header */}
      <div className="sticky top-[0px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Showing {sortedProducts.length} Results
          </p>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent pl-4 pr-10 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-full focus:outline-none focus:border-slate-900 cursor-pointer transition-all"
              >
                <option value="default">Sort By</option>
                <option value="new">Newest First</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
              <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
              <SlidersHorizontal size={12} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {sortedProducts.map((product) => (
              <Card key={product._id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-900 font-black uppercase tracking-widest mb-2">No Items Found</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">We're updating this collection soon.</p>
          </div>
        )}
      </main>

      <div className="h-32" />
    </div>
  );
}