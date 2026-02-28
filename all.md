import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

const token = localStorage.getItem("token");

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const prevCount = useRef(0);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newNotifications = res.data.adminMessages;

      if (prevCount.current && newNotifications.length > prevCount.current) {
        Swal.fire({
          icon: "info",
          title: "New Notification",
          text: "You have new messages",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          position: "top-end",
        });
      }

      prevCount.current = newNotifications.length;
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = (userId) => {
    setCurrentUserId(userId);
    setReplyText("");
    setShowModal(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;

    const result = await Swal.fire({
      title: "Send Reply?",
      text: "Are you sure you want to send this reply?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.post(
        "http://localhost:4000/api/simai/admin/replymessage",
        { message: replyText, userId: currentUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Reply Sent!",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-end",
        });

        await fetchNotifications();
        setShowModal(false);
        setReplyText("");
        setCurrentUserId(null);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to send reply",
        text: err.response?.data?.message || "Something went wrong!",
      });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/notifications/read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await axios.delete(`http://localhost:4000/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications((prev) => prev.filter((n) => n._id !== id));

        Swal.fire({
          icon: "success",
          title: "Deleted",
          toast: true,
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: err.response?.data?.message || "Something went wrong",
        });
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-sans tracking-tight">
            Notifications
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Manage your messages and user communications
          </p>
          {unreadCount > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mt-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                Messages from users will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notifications.map((notif, index) => (
                    <tr
                      key={notif._id}
                      className={`transition-colors duration-150 hover:bg-gray-50 ${
                        !notif.isRead ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg text-gray-700 inline-block">
                          {notif.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {notif.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(notif.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          <br />
                          <span className="text-gray-500 text-xs">
                            {new Date(notif.sentAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReply(notif._id)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            Reply
                          </button>
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notif._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow"
                            >
                              Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif._id)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Reply to User
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your reply message:
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={sendReply}
                        disabled={!replyText.trim()}
                        className={`px-5 py-2.5 font-medium rounded-xl transition-all duration-200 ${
                          replyText.trim()
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
