import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Loader2, 
  Sparkles, 
  Shield, 
  Truck, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Gift,
  Award,
  Clock
} from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Card from "@/components/Card";
import NewAdsTitles from "@/components/newadds";

// --- 1. Category Grid Component ---
const CategoryGrid = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 border-t border-l border-slate-100">
        {categories.map((cat) => (
          <Link 
            key={cat._id || cat.slug} 
            to={`/category/${cat.slug}`} 
            className="group flex flex-col items-center p-0 border-r border-b border-slate-100 hover:bg-slate-50 transition-all duration-300"
          >
            <div className="w-full aspect-square overflow-hidden flex items-center justify-center bg-slate-100">
              <LazyLoadImage 
                src={cat.image} 
                alt={cat.name} 
                effect="blur"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                wrapperClassName="w-full h-full"
              />
            </div>
            <div className="py-4 px-2 w-full flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-600 text-center uppercase tracking-widest leading-tight">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// --- 2. Banner Slider ---
const InternalBannerSlider = ({ ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!ads || ads.length === 0 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [ads?.length, isHovered]);

  const goToPrev = () => setCurrentIndex(currentIndex === 0 ? ads.length - 1 : currentIndex - 1);
  const goToNext = () => setCurrentIndex(currentIndex === ads.length - 1 ? 0 : currentIndex + 1);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[85vh] group overflow-hidden bg-slate-900" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-10 pointer-events-none" />
      <div className="absolute inset-0 z-20 flex items-center justify-between px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
        <button onClick={goToPrev} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90 shadow-2xl">
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button onClick={goToNext} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90 shadow-2xl">
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
      {ads.map((ad, index) => (
        <div key={index} className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${index === currentIndex ? "opacity-100 scale-100 visible" : "opacity-0 scale-110 invisible"}`}>
          {/* Slider එකේ පළමු image එක normal img එකක් විදියට තියනවා LCP score එක හොඳ කරගන්න */}
          {index === 0 ? (
            <img src={ad.imageUrl} className="w-full h-full object-cover object-center" alt={`Promotion ${index + 1}`} />
          ) : (
            <LazyLoadImage 
              src={ad.imageUrl} 
              effect="blur"
              className="w-full h-full object-cover object-center" 
              alt={`Promotion ${index + 1}`} 
              wrapperClassName="w-full h-full"
            />
          )}
        </div>
      ))}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-3 z-20">
        {ads.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={`transition-all duration-700 rounded-full h-1 ${i === currentIndex ? "w-16 bg-white" : "w-4 bg-white/30 hover:bg-white/60"}`} />
        ))}
      </div>
    </div>
  );
};

// --- 3. Premium Features ---
const PremiumFeatures = () => {
  const features = [
     { icon: Clock, title: "Customer Support", desc: "24 x 7 email or Super Chat" },
     { icon: Award, title: "Quality Assured", desc: "Quality Premium Products " },
     
     { icon: Truck, title: "Free Shipping", desc: "Orders Over Rs.3000.00" },
    { icon: Shield, title: "Secure Payment", desc: "We Ensure Secure Payment" },
    
    
    { icon: Gift, title: "Gift Cards", desc: "For Happy Moments" },
    
   ,
  ];

  return (
    <div className="py-16 bg-white border-b border-slate-50 justify-center  items-center   ">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center p-6 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-transparent hover:border-blue-50">
            <div className="w-12 h-12 rounded-2xl bg-[#2E2DAD] flex items-center justify-center mb-4 shadow-xl">
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-slate-900 text-xl ">{feature.title}</h3>
            <p className="text-sm text-slate-400 font-bold  mt-1 text-center">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 4. Main Home Container ---
export default function HomeContainer() {
  const [allProducts, setAllProducts] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  const fetchData = async () => {
    try {
      const [productRes, adsRes, categoryRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ads?category=home`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories`)
      ]);

      setAllProducts(Array.isArray(productRes.data) ? productRes.data : productRes.data.data || []);
      setAdsData(Array.isArray(adsRes.data) ? adsRes.data : adsRes.data.data || []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : categoryRes.data.data || []);
      
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && allProducts.length > visibleCount && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => prev + 8);
          setIsLoadingMore(false);
        }, 800);
      }
    }, { threshold: 0.1 });

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [allProducts.length, visibleCount, isLoadingMore]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Initializing Storefront</span>
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Promo Ticker */}
      <div className="bg-slate-950 py-3.5">
        <NewAdsTitles speed={35}>
          <div className="flex text-white font-black text-[10px] uppercase tracking-[0.3em]">
            <span className="mx-12 flex items-center gap-2"><Sparkles size={12} className="text-blue-400"/> NEW MONITORS IN STOCK NOW</span>
            <span className="mx-12 flex items-center gap-2"><Star size={12} className="text-blue-400"/>PREMIUM COLLECTION UPDATED</span>
             <span className="mx-12 flex items-center gap-2"><Star size={12} className="text-blue-400"/>NEW YEAR OFFER COMING SOON</span>
             <span className="mx-12 flex items-center gap-2"><Star size={12} className="text-blue-400"/>10% OFF NOW ONLINE PAYMENTS</span>
          </div>
        </NewAdsTitles>
      </div>

      <section className="w-full">
         <InternalBannerSlider ads={adsData} />
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <PremiumFeatures />

        {/* Category Grid */}
        <CategoryGrid categories={categories} />

        <main className="pb-32">
          <header className="py-24 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-6 border border-slate-100">
              Handpicked Styles
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter mb-6">THE EDIT</h2>
          </header>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {allProducts.slice(0, visibleCount).map((product) => (
              <Card key={product._id} {...product} />
            ))}
          </div>

          {/* Infinite Scroll Loader */}
          <div ref={observerTarget} className="h-40 w-full flex flex-col items-center justify-center mt-12">
            {isLoadingMore && <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />}
          </div>
        </main>
      </div>
    </div>
  );
}