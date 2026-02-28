import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { 
  MessageSquare, User, Clock, CheckCircle, 
  RefreshCw, Bell, Shield 
} from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/notifications`;

// --- HELPER: පණිවිඩය ලැබුණු වේලාව ගණනය කිරීම ---
const formatRelativeTime = (date) => {
  if (!date) return "";
  const now = new Date();
  const msgDate = new Date(date);
  const diffInSeconds = Math.floor((now - msgDate) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  return msgDate.toLocaleDateString();
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  // --- LOGIC: එකම User ගේ පණිවිඩ Group කිරීම ---
  const groupNotifications = (data) => {
    const grouped = data.reduce((acc, current) => {
      const userId = current.userId;
      // දැනටමත් මේ user ගේ record එකක් තිබේ නම්, වඩාත් අලුත් (latest) එක තබා ගන්න
      if (!acc[userId] || new Date(current.sentAt) > new Date(acc[userId].sentAt)) {
        acc[userId] = current;
      }
      return acc;
    }, {});
    
    // Array එකක් බවට පත් කර අලුත්ම පණිවිඩය ඉහලට එනසේ Sort කිරීම
    return Object.values(grouped).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  };

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/getNotifications`, getHeaders());
      const uniqueUsers = groupNotifications(Array.isArray(data) ? data : []);
      setNotifications(uniqueUsers);
      
      // Sidebar Badge එක update කිරීම (Manual Refetch Logic)
      if (window.refetchSidebarBadges) {
        window.refetchSidebarBadges();
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);
    pollingRef.current = setInterval(() => fetchNotifications(false), 15000);
    return () => clearInterval(pollingRef.current);
  }, [fetchNotifications]);

  const markAsRead = async (userId) => {
    try {
      await axios.post(`${API_BASE_URL}/markRead`, { userId }, getHeaders());
      fetchNotifications(false);
    } catch (err) { console.error("Mark Read Error:", err); }
  };

  const openChatModal = async (notification) => {
    if (!notification.isRead) markAsRead(notification.userId);

    try {
      const { data: chatHistory } = await axios.get(`${API_BASE_URL}/getChat/${notification.userId}`, getHeaders());
      
      const renderBubble = (msg) => {
        const isAdmin = msg.sender === 'admin';
        return `
          <div style="display: flex; flex-direction: column; align-items: ${isAdmin ? 'flex-end' : 'flex-start'}; margin-bottom: 20px;">
            <div style="max-width: 85%; padding: 12px 16px; border-radius: ${isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}; background: ${isAdmin ? '#4f46e5' : '#f1f5f9'}; color: ${isAdmin ? '#ffffff' : '#334155'}; font-size: 0.95rem;">
              ${msg.text}
            </div>
            <span style="font-size: 0.7rem; color: #94a3b8; margin-top: 6px; padding: 0 4px;">
              ${new Date(msg.createdAt || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        `;
      };

      Swal.fire({
        html: `
          <div style="display: flex; flex-direction: column; height: 550px; text-align: left; font-family: 'Inter', sans-serif;">
            <div style="padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px;">
              <img src="${notification.userImage || 'https://ui-avatars.com/api/?name=' + notification.userName}" style="width: 40px; height: 40px; border-radius: 10px; object-fit: cover;">
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">${notification.userName}</h4>
                <div style="display: flex; align-items: center; gap: 5px;">
                   <span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%;"></span>
                   <p style="margin: 0; font-size: 0.7rem; color: #64748b; font-weight: 500;">Active Conversation</p>
                </div>
              </div>
            </div>
            <div id="chat-box" style="flex: 1; overflow-y: auto; padding: 20px; background: #ffffff;">
              ${chatHistory.map(msg => renderBubble(msg)).join('')}
            </div>
            <div style="padding: 15px; border-top: 1px solid #f1f5f9; background: #fff;">
              <div style="display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 5px 12px;">
                <input id="inline-input" type="text" placeholder="Type your message..." style="flex: 1; border: none; background: transparent; outline: none; padding: 10px 5px; font-size: 0.9rem;">
                <button id="inline-send-btn" style="background: #4f46e5; color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </div>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: '450px',
        padding: '0',
        customClass: { popup: 'rounded-2xl shadow-2xl overflow-hidden' },
        didOpen: () => {
          const chatBox = document.getElementById('chat-box');
          const input = document.getElementById('inline-input');
          const btn = document.getElementById('inline-send-btn');
          chatBox.scrollTop = chatBox.scrollHeight;
          input.focus();

          const sendMessage = async () => {
            const message = input.value.trim();
            if (!message || btn.disabled) return;
            btn.disabled = true;
            try {
              await axios.post(`${API_BASE_URL}/reply/${notification.userId}`, { message }, getHeaders());
              chatBox.insertAdjacentHTML('beforeend', renderBubble({ sender: 'admin', text: message, sentAt: new Date() }));
              input.value = '';
              chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
              fetchNotifications();
            } catch (err) { console.error(err); } 
            finally { btn.disabled = false; input.focus(); }
          };

          btn.onclick = sendMessage;
          input.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };
        }
      });
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/markAllRead`, {}, getHeaders());
      fetchNotifications(false);
    } catch (err) { console.error("Mark all read error:", err); }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'archived') return n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Inquiries</h1>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Real-time updates active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
             <button 
               onClick={() => fetchNotifications(false)} 
               className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
               title="Refresh Data"
             >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={markAllAsRead} 
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-md"
              >
                <CheckCircle className="w-4 h-4" /> Mark All Read
              </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'archived'].map((f) => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)} 
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Latest Message</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Received</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-medium">Fetching messages...</td></tr>
                ) : filteredNotifications.length === 0 ? (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-400">No conversations found.</td></tr>
                ) : (
                  filteredNotifications.map((n) => (
                    <tr key={n.userId} className={`hover:bg-slate-50/50 transition-colors ${!n.isRead ? 'bg-indigo-50/20' : ''}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-10 h-10 rounded-xl overflow-hidden ${!n.isRead ? 'ring-2 ring-indigo-500 ring-offset-2' : 'bg-slate-100'}`}>
                            {n.userImage ? (
                              <img src={n.userImage} className="w-full h-full object-cover" alt="User" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                {n.userName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{n.userName}</span>
                            <span className="text-[10px] font-medium text-slate-400">ID: {n.userId.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className={`text-sm max-w-[250px] truncate ${!n.isRead ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                          {n.message}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{formatRelativeTime(n.sentAt)}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => openChatModal(n)} 
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!n.isRead ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          OPEN CHAT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}