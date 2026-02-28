import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AiChatbot() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [adminMessageCount, setAdminMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);
  const inputRef = useRef(null);
  const notificationSoundRef = useRef(null);

  // Initialize notification sound
  useEffect(() => {
    notificationSoundRef.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3"
    );
    notificationSoundRef.current.volume = 0.3;
  }, []);

  // Fetch messages and check for admin messages
  const fetchMessages = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setMessages([]);
      return;
    }
    try {
      const res = await axios.get("http://localhost:4000/api/messages/getMessages", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const fetchedMessages = res.data.messages || [];
      setMessages(fetchedMessages);
      
      // Check for admin messages (messages sent by admin)
      const hasAdminMessage = fetchedMessages.some(msg => 
        msg.text && msg.text.includes("admin:") || msg.text.includes("Admin:")
      );
      
      if (hasAdminMessage && !open) {
        triggerAdminNotification();
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("token"));
      fetchMessages();
    };
    
    const handleLogout = () => {
      setMessages([]);
      setToken(null);
    };

    // Listen for admin messages (you can trigger this from backend)
    const handleAdminMessage = (event) => {
      if (event.detail && event.detail.adminMessage) {
        triggerAdminNotification();
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("logout", handleLogout);
    window.addEventListener("adminMessageReceived", handleAdminMessage);

    fetchMessages();

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("adminMessageReceived", handleAdminMessage);
    };
  }, [open]);

  // Setup speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = "en-US";

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
        stopSpeaking();
        sendHandle(transcript, true);
      };

      recognition.current.onend = () => setListening(false);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  // Trigger admin notification
  const triggerAdminNotification = () => {
    setAdminMessageCount(prev => prev + 1);
    setShowNotification(true);
    
    // Play notification sound
    if (notificationSoundRef.current) {
      notificationSoundRef.current.play().catch(e => console.log("Sound play error:", e));
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  // Close notification
  const closeNotification = () => {
    setShowNotification(false);
    setAdminMessageCount(0);
  };

  // Voice controls
  const handleVoice = () => {
    if (!recognition.current) return;
    if (listening) {
      recognition.current.stop();
      setListening(false);
    } else {
      recognition.current.start();
      setListening(true);
      stopSpeaking();
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    setSpeaking(true);
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.onend = () => setSpeaking(false);
    speechSynthesis.speak(utter);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // Fetch AI reply
  const fetchAiReply = async (userText) => {
    try {
      setIsTyping(true);
      const currentToken = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:4000/api/simai/reply",
        { query: userText },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      setIsTyping(false);
      return res.data.reply || "No response from AI.";
    } catch (err) {
      setIsTyping(false);
      console.error("Error fetching AI reply:", err);
      return "Sorry, I couldn't find an answer in my knowledge base.";
    }
  };

  // Send message
  const sendHandle = async (voiceInput = null, isVoice = false) => {
    const textToSend = voiceInput || input;
    if (!textToSend?.trim()) return;

    const newMessage = {
      sender: "user",
      text: textToSend,
      _id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Admin message handling (user sending to admin)
    if (textToSend.toLowerCase().includes("@admin")) {
      const textAfterAdmin = textToSend.split("@admin")[1]?.trim();
      if (!textAfterAdmin) {
        console.error("You must type a message after @admin");
        alert("You must type a message after @admin");
        return;
      }

      try {
        const currentToken = localStorage.getItem("token");
        await axios.post(
          "http://localhost:4000/api/simai/admin/message",
          { message: textToSend },
          { headers: { Authorization: `Bearer ${currentToken}`, "Content-Type": "application/json" } }
        );
      } catch (err) {
        console.error("Admin endpoint error:", err);
      }

      const adminMessageObj = {
        sender: "ai",
        text: "✅ Your message has been sent to the admin. They will respond shortly.",
        _id: (Date.now() + 1).toString(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, adminMessageObj]);
      if (isVoice) speakText(adminMessageObj.text);
      return;
    }

    // Normal AI message
    try {
      const currentToken = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/messages/sendMessages",
        { input: textToSend },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
    } catch (err) {
      console.error("Error sending user message:", err);
    }

    const aiText = await fetchAiReply(newMessage.text);
    const aiMessage = {
      sender: "ai",
      text: aiText,
      _id: (Date.now() + 2).toString(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    if (isVoice) speakText(aiText);
  };

  return (
    <>
      {/* Admin Notification Alert */}
      {showNotification && !open && (
        <div className="fixed top-4 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-slideIn">
          <div className="relative">
            <span className="text-xl">🔔</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <p className="font-medium">New message from admin!</p>
            <p className="text-sm opacity-90">Click the chat button to view</p>
          </div>
          <button
            onClick={closeNotification}
            className="ml-2 p-1 hover:bg-white/20 rounded-full"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Button */}
      {!open && (<button
  onClick={() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "You need to log in to use the chatbot.",
          showCancelButton: true,
          confirmButtonText: "Go to Login",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        alert("Please login to use the chatbot");
      }
      return;
    }
    setOpen(true);
    closeNotification(); // Close notification when opening chat
  }}
  className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
>
  <div className="relative">
    <span className="text-2xl">🤖</span>
    {adminMessageCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
        {adminMessageCount > 9 ? '9+' : adminMessageCount}
      </span>
    )}
  </div>
</button>)}

      {/* Chat Widget */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                {speaking && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <div className="flex items-center gap-2 text-xs opacity-90">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                  {isTyping && <span className="ml-2 animate-pulse">Typing...</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={stopSpeaking}
                disabled={!speaking}
                className={`p-2 rounded-lg ${speaking ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 cursor-not-allowed'} transition-colors`}
                title="Stop speaking"
              >
                <span className="text-sm">⏹</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Close chat"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                <div className="text-4xl mb-4 opacity-50">👋</div>
                <h3 className="text-lg font-semibold mb-2">Welcome to AI Assistant</h3>
                <p className="text-center text-sm text-gray-600 mb-6">
                  Start a conversation with me! I can help you with questions, explanations, and more.
                </p>
                <div className="text-xs text-gray-500">
                  💡 Tip: Use <code className="bg-gray-200 px-2 py-1 rounded">@admin</code> to contact administrators
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                          : message.text.includes("admin:") || message.text.includes("Admin:")
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-bl-none border-l-4 border-yellow-400"
                          : "bg-gradient-to-r from-gray-100 to-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.text.includes("admin:") || message.text.includes("Admin:") ? (
                          <>
                            <span className="text-sm">👑</span>
                            <span className="text-xs opacity-90">Admin</span>
                          </>
                        ) : message.sender === "ai" ? (
                          <span className="text-xs opacity-90">AI Assistant</span>
                        ) : null}
                      </div>
                      <div className="whitespace-pre-wrap break-words text-sm">
                        {message.text.replace("admin:", "").replace("Admin:", "").trim()}
                      </div>
                      <div className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-200" : "text-gray-300"}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {message.sender === "user" && message.text.includes("@admin") && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-700 rounded-full text-xs">
                            To Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-none p-4 bg-gradient-to-r from-gray-100 to-white border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <button
                onClick={handleVoice}
                className={`p-2.5 rounded-full flex-shrink-0 transition-all ${
                  listening 
                    ? "animate-pulse bg-red-100 text-red-600 border-2 border-red-300" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? "⏹" : "🎤"}
              </button>
              
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                onKeyDown={(e) => e.key === "Enter" && sendHandle()}
              />
              
              <button
                onClick={() => sendHandle()}
                disabled={!input.trim() || isTyping}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex-shrink-0"
              >
                Send
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 flex justify-between px-1">
              <span>Press Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
}