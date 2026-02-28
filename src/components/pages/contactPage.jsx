import React from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // මෙතනට Form submission logic එක දාන්න පුළුවන්
    console.log("Message sent!");
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
            GET IN <span className="text-blue-600">TOUCH</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto uppercase text-xs tracking-[0.2em]">
            අප සමඟ සම්බන්ධ වීමට පහත පෝරමය පාවිච්චි කරන්න.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 1. Contact Info Cards */}
          <div className="space-y-6">
            <ContactInfoCard 
              icon={<Phone size={20} />} 
              title="Call Us" 
              detail="+94 77 123 4567" 
            />
            <ContactInfoCard 
              icon={<Mail size={20} />} 
              title="Email Us" 
              detail="support@mybrand.com" 
            />
            <ContactInfoCard 
              icon={<MapPin size={20} />} 
              title="Visit Us" 
              detail="No 123, Galle Road, Colombo" 
            />
            <ContactInfoCard 
              icon={<Clock size={20} />} 
              title="Working Hours" 
              detail="Mon - Sat: 9.00 AM - 6.00 PM" 
            />
          </div>

          {/* 2. Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Message</label>
                <textarea rows="5" placeholder="Write your message here..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium resize-none"></textarea>
              </div>

              <button className="w-full md:w-max px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-3">
                Send Message <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Component for Info Cards
function ContactInfoCard({ icon, title, detail }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
        <p className="text-slate-700 font-bold">{detail}</p>
      </div>
    </div>
  );
}