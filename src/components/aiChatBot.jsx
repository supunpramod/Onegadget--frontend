import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

/* =====================
    Message Bubble Component
===================== */
const MessageBubble = memo(({ msg }) => {
  const isUser = msg.sender === "user";
  const isAdmin = msg.sender === "admin";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3 animate-in fade-in slide-in-from-bottom-1`}>
      <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${isUser ? "bg-slate-900 text-white rounded-t-2xl rounded-bl-2xl" : "bg-white border rounded-t-2xl rounded-br-2xl text-slate-700"}`}>
        {msg.text}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
        {isUser ? "You" : isAdmin ? "Admin" : "AI"}
      </span>
    </div>
  );
});

export default function ChatBot() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState("si-LK"); // Default Sinhala

  const mainRef = useRef(null);
  const audioRef = useRef(null);
  const token = localStorage.getItem("token");
  const API_BASE = "http://localhost:4000/api/messages";

  useLayoutEffect(() => {
    if (isOpen && mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [messages.length, loading, isOpen]);

  const playAudio = useCallback((base64Audio) => {
    if (!base64Audio) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play().catch(err => {
        console.error("Playback error:", err);
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error("Audio error:", error);
      setIsSpeaking(false);
    }
  }, []);

  const updateMessagesUnique = useCallback((newMessages) => {
    if (!newMessages || !Array.isArray(newMessages)) return;
    setMessages((prev) => {
      const messageMap = new Map();
      prev.forEach((m) => { if (m._id) messageMap.set(m._id, m); });
      newMessages.forEach((m) => { if (m._id) messageMap.set(m._id, m); });
      
      return Array.from(messageMap.values()).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });
  }, []);

  const fetchMessages = useCallback(async (endpoint) => {
    if (!token || !isOpen) return;
    try {
      const { data } = await axios.get(`${API_BASE}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.messages) updateMessagesUnique(data.messages);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [isOpen, token, updateMessagesUnique]);

  useEffect(() => {
    if (!isOpen) return;
    fetchMessages("getmessages");
    const interval = setInterval(() => fetchMessages("getadminreplies"), 3000);
    return () => clearInterval(interval);
  }, [isOpen, fetchMessages]);

  const sendMessage = async (text, isVoice = false) => {
    const trimmedText = text?.trim();
    if (!trimmedText || loading) return;
    
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = { 
      _id: tempId, 
      text: trimmedText, 
      sender: "user", 
      createdAt: new Date().toISOString() 
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/sendmessage`, 
        { message: trimmedText, isVoice: isVoice }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        setMessages(prev => prev.filter(m => m._id !== tempId));
        updateMessagesUnique(data.messages);
        
        if (isVoice && data.audio) {
          playAudio(data.audio);
        }
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== tempId));
      Swal.fire("Error", "Message failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire("Not Supported", "Your browser does not support voice recognition.", "warning");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang; 
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      if (audioRef.current) audioRef.current.pause();
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      if (transcript) sendMessage(transcript, true);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <button 
        onClick={() => (token ? setIsOpen(!isOpen) : navigate("/login"))} 
        className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center text-lg hover:scale-105 active:scale-90 transition-all"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[340px] h-[550px] bg-white rounded-[30px] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
          <header className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-sm">Customer Support</h3>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => setSelectedLang("si-LK")}
                  className={`text-[9px] px-1.5 py-0.5 rounded ${selectedLang === "si-LK" ? "bg-white text-slate-900" : "bg-white/20 text-white"}`}
                >
                  SINHALA
                </button>
                <button 
                  onClick={() => setSelectedLang("en-US")}
                  className={`text-[9px] px-1.5 py-0.5 rounded ${selectedLang === "en-US" ? "bg-white text-slate-900" : "bg-white/20 text-white"}`}
                >
                  ENGLISH
                </button>
              </div>
            </div>
            {isSpeaking && (
              <button 
                onClick={() => { if(audioRef.current) audioRef.current.pause(); setIsSpeaking(false); }} 
                className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20 hover:bg-white/20"
              >
                Stop
              </button>
            )}
          </header>

          <main ref={mainRef} className="flex-1 p-4 overflow-y-auto bg-slate-50">
            {messages.map((m) => (
              <MessageBubble key={m._id || m.tempId} msg={m} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="px-4 py-2 bg-white border rounded-t-2xl rounded-br-2xl text-[11px] text-slate-400 animate-pulse">
                  AI is thinking...
                </div>
              </div>
            )}
          </main>

          <footer className="p-3 border-t bg-white shrink-0">
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                sendMessage(input, false); 
              }} 
              className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3"
            >
              <button 
                type="button" 
                onClick={startVoiceInput} 
                className={`text-xl transition-transform active:scale-125 ${isListening ? "text-red-500 animate-bounce" : "text-slate-500"}`}
              >
                🎤
              </button>
              <input 
                className="flex-1 bg-transparent outline-none text-sm py-2.5 text-slate-700" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={isListening ? (selectedLang === "si-LK" ? "මම අසා සිටිමි..." : "Listening...") : "Type a message..."} 
                disabled={loading} 
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading} 
                className="text-xl text-slate-900 disabled:opacity-20 hover:scale-110 transition-transform"
              >
                ➤
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}