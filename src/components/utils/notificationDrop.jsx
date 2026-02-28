import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiBell,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiUser,
  FiSend,
  FiX,
} from "react-icons/fi";
import axios from "axios";

export default function NotificationDrop() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [replyingToMsgId, setReplyingToMsgId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const dropdownRef = useRef(null);
  const API_BASE = "http://localhost:4000/api/notifications";

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/getNotifications`);
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Dropdown එකෙන් පිටත click කළොත් වහන්න
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (msgId, userId) => {
    try {
      await axios.post(`${API_BASE}/markRead`, { userId });
      setNotifications((prev) =>
        prev.map((n) => (n.userId === userId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      setReplyingToMsgId(msgId);
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleSendReply = async (userId) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`${API_BASE}/reply/${userId}`, { message: replyText });
      setReplyText("");
      setReplyingToMsgId(null);
      alert("Reply Sent!");
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  // ✅ නිවැරදිව පෙන්විය යුතු ප්‍රමාණය තෝරාගැනීම
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-[400px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center text-sm font-bold text-slate-700">
            <span>Recent Activity</span>
            {unreadCount > 0 && (
              <span className="text-[10px] text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto">
            {/* 👇 මෙතන notifications වෙනුවට displayedNotifications පාවිච්චි කළා */}
            {displayedNotifications.map((n) => (
              <div
                key={n._id}
                className={`px-4 py-4 border-b border-slate-50 transition-all ${!n.isRead ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {n.userImage ? (
                      <img
                        src={n.userImage}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <FiUser size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[13px] font-bold text-slate-900">
                        {n.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <FiClock size={10} />{" "}
                        {new Date(n.sentAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 mb-3">
                      {n.message}
                    </p>

                    <div className="flex flex-col gap-2">
                      {!n.isRead ? (
                        <button
                          onClick={() => handleMarkAsRead(n._id, n.userId)}
                          className="w-fit flex items-center gap-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <FiCheckCircle size={12} /> Mark as Seen
                        </button>
                      ) : replyingToMsgId === n._id ? (
                        <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 duration-200">
                          <input
                            autoFocus
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${n.userName}...`}
                            className="flex-1 text-[11px] border border-slate-200 rounded-md px-2 py-2 outline-none focus:border-indigo-500 shadow-sm"
                          />
                          <button
                            onClick={() => handleSendReply(n.userId)}
                            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            <FiSend size={12} />
                          </button>
                          <button
                            onClick={() => setReplyingToMsgId(null)}
                            className="p-2 text-slate-400 hover:text-slate-600"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingToMsgId(n._id);
                            setReplyText("");
                          }}
                          className="w-fit text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Show All / Show Less */}
          {notifications.length > 5 && (
            <div className="p-2 border-t bg-slate-50">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full py-2 text-[11px] font-bold text-indigo-600 flex items-center justify-center gap-2 uppercase hover:bg-indigo-50 rounded-lg transition-all"
              >
                {showAll ? (
                  <>
                    <FiChevronUp /> Show Less
                  </>
                ) : (
                  <>
                    <FiChevronDown /> View More ({notifications.length - 5}{" "}
                    More)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
