import React, { memo } from 'react';
import { Target, Eye, ShieldCheck, Users } from 'lucide-react';

const AboutPage = memo(() => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] py-20 px-6 antialiased">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-24 space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase">
            Our <span className="text-blue-600">Story</span>
          </h1>
          <div className="w-24 h-2 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-slate-500 font-bold text-xs md:text-sm uppercase tracking-[0.4em] max-w-2xl mx-auto pt-4">
            Defining the future of digital commerce since 2024.
          </p>
        </div>

        {/* Content Section: Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-10 mb-20">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-blue-100/50 transition-all duration-500">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Our Mission</h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              To empower global consumers by providing a seamless, secure, and innovative shopping experience. We bridge the gap between quality products and doorstep delivery with cutting-edge technology.
            </p>
          </div>

          <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl shadow-slate-400/20 hover:shadow-slate-900/40 transition-all duration-500">
            <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed font-medium">
              To be the world's most customer-centric brand, where people can find and discover anything they want to buy online, backed by trust and unparalleled efficiency.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-slate-50 shadow-sm mb-20">
          <div className="text-center mb-12">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Core Values</h3>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">What we stand for</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <ValueItem 
              icon={<ShieldCheck size={32} />} 
              title="Integrity" 
              desc="We believe in radical transparency and absolute honesty in every transaction." 
            />
            <ValueItem 
              icon={<Users size={32} />} 
              title="Community" 
              desc="Our customers are our family. We build relationships, not just order histories." 
            />
            <ValueItem 
              icon={<Target size={32} />} 
              title="Innovation" 
              desc="Constantly evolving to stay ahead of the digital curve and user expectations." 
            />
          </div>
        </div>

        {/* Brand Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-slate-100">
          <StatBox number="10K+" label="Active Users" />
          <StatBox number="50+" label="Global Partners" />
          <StatBox number="99%" label="Happy Clients" />
          <StatBox number="24/7" label="Support" />
        </div>
      </div>
    </div>
  );
});

// Helper Components
const ValueItem = ({ icon, title, desc }) => (
  <div className="space-y-4 group">
    <div className="text-slate-300 group-hover:text-blue-600 transition-colors duration-300 flex justify-center">{icon}</div>
    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatBox = ({ number, label }) => (
  <div className="text-center">
    <div className="text-3xl font-black text-slate-900 tracking-tighter">{number}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default AboutPage;