import axios from "axios";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Swal from "sweetalert2";

export default function AiChatBot() {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);

  // Show loading SweetAlert
  const showLoadingAlert = (title, text) => {
    return Swal.fire({
      title: title || "Loading...",
      text: text || "Please wait",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  };

  // Show success SweetAlert
  const showSuccessAlert = (title, text) => {
    return Swal.fire({
      title: title || "Success!",
      text: text || "Operation completed successfully",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Show error SweetAlert
  const showErrorAlert = (title, text) => {
    return Swal.fire({
      title: title || "Error!",
      text: text || "Something went wrong",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#d33",
    });
  };

  // Show confirmation dialog
  const showConfirmationDialog = async (title, text, confirmText = "Yes", cancelText = "No") => {
    const result = await Swal.fire({
      title: title || "Are you sure?",
      text: text || "",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
    return result.isConfirmed;
  };

  // Load messages with SweetAlert loading
  const loadMessages = useCallback(async () => {
    if (loading) return;

    const loadingAlert = showLoadingAlert("Loading Messages", "Fetching your chat history...");
    
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/api/chat/getMessagesbyid", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
      } else {
        setMessages([]);
      }
      
      await loadingAlert.close();
    } catch (err) {
      await loadingAlert.close();
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            showErrorAlert("Session Expired", "Please login again to continue chatting.");
            // Optional: Redirect to login
            // window.location.href = "/login";
            break;
          case 403:
            showErrorAlert("Access Denied", "You don't have permission to access chat history.");
            break;
          case 404:
            showErrorAlert("Not Found", "Chat history not found.");
            break;
          default:
            showErrorAlert("Error", "Failed to load messages. Please try again.");
        }
      } else {
        showErrorAlert("Network Error", "Unable to connect to the server. Please check your connection.");
      }
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load messages when chat opens
  useEffect(() => {
    if (open && token) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [open]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages change
  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, open]);

  // Handle reply with SweetAlert
  const handleReply = async () => {
    if (!newMessage.trim() || sending) return;
    
    // Optional: Show confirmation for long messages
    if (newMessage.trim().length > 500) {
      const confirmed = await showConfirmationDialog(
        "Send Long Message?",
        "Your message is quite long. Are you sure you want to send it?",
        "Send",
        "Cancel"
      );
      if (!confirmed) return;
    }
    
    const messageToSend = newMessage.trim();
    
    // Create local message
    const localMessage = {
      _id: Date.now(),
      sender: "User",
      text: messageToSend,
      createdAt: new Date().toISOString(),
    };

    // Optimistic Update
    setMessages((prev) => [...prev, localMessage]);
    setNewMessage("");
    setSending(true);

    try {
      // Show sending indicator
      const sendingAlert = showLoadingAlert("Sending", "Your message is being sent...");
      
      await axios.post(
        "http://localhost:4000/api/chat/sendMessage",
        { text: messageToSend }, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      await sendingAlert.close();
      await showSuccessAlert("Sent!", "Message delivered successfully");
      
      // Wait a bit before reloading messages
      setTimeout(() => {
        loadMessages();
      }, 500);
      
    } catch (error) {
      console.error("Message sending failed:", error);
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            showErrorAlert("Session Expired", "Please login again to send messages.");
            break;
          case 403:
            showErrorAlert("Permission Denied", "You don't have permission to send messages.");
            break;
          case 429:
            showErrorAlert("Too Many Requests", "Please wait a moment before sending another message.");
            break;
          case 500:
            showErrorAlert("Server Error", "Our server encountered an error. Please try again later.");
            break;
          default:
            showErrorAlert("Failed to Send", "Unable to send message. Please try again.");
        }
      } else if (error.request) {
        showErrorAlert("Network Error", "Unable to connect to the server. Please check your internet connection.");
      } else {
        showErrorAlert("Error", "Something went wrong. Please try again.");
      }
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== localMessage._id));
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  // Handle chat window toggle with confirmation if there's unsent message
  const handleToggleChat = async () => {
    if (newMessage.trim() && !open) {
      const confirmed = await showConfirmationDialog(
        "Unsaved Message",
        "You have an unsent message. Open chat anyway?",
        "Open",
        "Continue Writing"
      );
      if (!confirmed) return;
    }
    setOpen(!open);
  };

  // Clear chat history
  const handleClearChat = async () => {
    if (messages.length === 0) return;
    
    const confirmed = await showConfirmationDialog(
      "Clear Chat History?",
      "This will remove all your chat history. This action cannot be undone.",
      "Clear All",
      "Cancel"
    );
    
    if (!confirmed) return;
    
    const loadingAlert = showLoadingAlert("Clearing", "Removing chat history...");
    
    try {
      await axios.delete("http://localhost:4000/api/chat/clearMessages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      await loadingAlert.close();
      await showSuccessAlert("Cleared!", "All chat history has been removed.");
      setMessages([]);
    } catch (error) {
      await loadingAlert.close();
      showErrorAlert("Clear Failed", "Failed to clear chat history. Please try again.");
      console.error("Error clearing messages:", error);
    }
  };

  // Debug: Check token with SweetAlert
  useEffect(() => {
    if (!token && open) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please login to use the chat feature.",
        icon: "warning",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to login page
          window.location.href = "/login";
        } else {
          setOpen(false);
        }
      });
    }
  }, [open, token]);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating button with notification badge */}
      <div className="relative">
        <button
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          onClick={handleToggleChat}
        >
          💬
          {messages.length > 0 && !open && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full absolute -top-0 -right-0 animate-ping"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full absolute -top-0 -right-0"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Assistant</h3>
                <p className="text-xs opacity-80">
                  {(loading || sending) ? "Processing..." : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition"
                  title="Clear chat history"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-lg hover:text-gray-200 transition"
                title="Close chat"
              >
                ✖
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {/* Loading Indicator with SweetAlert2 style */}
            {loading && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading your conversation history...</p>
              </div>
            )}

            {/* No messages */}
            {!loading && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <h4 className="font-semibold text-gray-700">Start a Conversation</h4>
                <p className="text-gray-500 text-sm mt-1">Ask me anything! I'm here to help.</p>
                <div className="mt-4 text-left bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">Try asking:</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• "Hello, how can you help me?"</li>
                    <li>• "Explain machine learning in simple terms"</li>
                    <li>• "What's the weather like today?"</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  message.sender !== "User"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                } max-w-[85%] ${
                  message.sender !== "User" ? "mr-auto" : "ml-auto"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    message.sender !== "User" 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
                      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                  }`}>
                    {message.sender !== "User" ? "AI" : "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {message.sender}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {message.text}
                    </p>
                    <small className="text-xs text-gray-500 block mt-2">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </small>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Sending indicator */}
            {sending && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-sm">Sending message...</span>
                </div>
              </div>
            )}
            
            {/* Scroll Ref */}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer with Reply */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={loading || sending}
                  className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed pr-12"
                  onKeyPress={(e) => { 
                    if (e.key === 'Enter' && !sending && newMessage.trim()) {
                      handleReply();
                    }
                  }}
                  maxLength={2000}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {newMessage.length}/2000
                </div>
              </div>
              <button
                onClick={handleReply}
                disabled={loading || sending || !newMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center w-12"
                title={sending ? "Sending..." : "Send message"}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="text-lg">➤</span>
                )}
              </button>
            </div>
            {newMessage.length > 1500 && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Message getting too long ({newMessage.length}/2000)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}