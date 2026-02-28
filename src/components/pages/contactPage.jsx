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
            GET IN TOUCH
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto uppercase text-xs tracking-[0.2em]">
          Let's get this conversation started. Tell us a bit about yourself, and we'll get in touch as soon as we can.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 1. Contact Info Cards */}
          <div className="space-y-6">
            <ContactInfoCard 
              icon={<Phone size={20} />} 
              title="Phone Number" 
              detail="+94 77 123 4567" 
            />
            <ContactInfoCard 
              icon={<Mail size={20} />} 
              title="Email " 
              detail="contact.gadgetone@gone.com" 
            />
            <ContactInfoCard 
              icon={<MapPin size={20} />} 
              title="Address" 
              detail="#12 Main Street, Colombo 06" 
            />
            <ContactInfoCard 
              icon={<Clock size={20} />} 
              title="24 x 7 Customer Service" 
              detail="24 x 7 Customer Service
Super AI Chat" 
            />
          </div>

          {/* 2. Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-base font-bold text-black   ml-1">Your Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-bold text-black ml-1">Email Address</label>
                  <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-base font-bold text-black  ml-1">Subject</label>
                <input type="text" placeholder="How can we help?" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium" />
              </div>

              <div className="space-y-2">
                <label className="text-base font-bold text-black  ml-1">Message</label>
                <textarea rows="5" placeholder="Write your message here..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium resize-none"></textarea>
              </div>

              <button className="w-full md:w-max px-12 py-4 bg-[#2E2DAD] text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-3">
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
      <div className="w-12 h-12 bg-blue-50 text-[#2E2DAD] rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-bold text-black ">{title}</h4>
        <p className="text-slate-700 ">{detail}</p>
      </div>
    </div>
  );
}