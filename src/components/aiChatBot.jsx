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
    <div
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3 animate-in fade-in slide-in-from-bottom-1`}
    >
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm leading-relaxed ${isUser
          ? "bg-[#2E2DAD] text-white rounded-t-2xl rounded-bl-2xl"
          : "bg-white border rounded-t-2xl rounded-br-2xl text-slate-700"
          }`}
        style={{ fontFamily: "inherit" }} // සිංහල අකුරු නිවැරදිව පෙන්වීමට
      >
        {msg.text}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
        {isUser ? "You" : isAdmin ? "Admin" : "AI Assistant"}
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
  const [selectedLang, setSelectedLang] = useState("si-LK");

  const mainRef = useRef(null);
  const audioRef = useRef(null);
  const token = localStorage.getItem("token");

  const API_BASE = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

  useLayoutEffect(() => {
    if (isOpen && mainRef.current) {
      mainRef.current.scrollTo({
        top: mainRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, isOpen]);

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
      audio.play().catch((err) => {
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
      prev.forEach((m) => {
        const id = m._id || m.tempId;
        if (id) messageMap.set(id, m);
      });
      newMessages.forEach((m) => {
        if (m._id) messageMap.set(m._id, m);
      });

      return Array.from(messageMap.values()).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    });
  }, []);

  const fetchMessages = useCallback(
    async (endpoint) => {
      if (!token || !isOpen) return;
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/messages/${endpoint}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data?.messages) updateMessagesUnique(data.messages);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    },
    [isOpen, token, updateMessagesUnique, API_BASE],
  );

  useEffect(() => {
    if (!isOpen) return;
    fetchMessages("getmessages");
    const interval = setInterval(() => fetchMessages("getadminreplies"), 4000);
    return () => clearInterval(interval);
  }, [isOpen, fetchMessages]);

  // 1. sendMessage ශ්‍රිතය යාවත්කාලීන කිරීම
  const sendMessage = async (text, shouldSpeak = false) => {
    const trimmedText = text?.trim();
    if (!trimmedText || loading) return;

    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      text: trimmedText,
      sender: "user",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/messages/sendmessage`,
        {
          message: trimmedText,
          isVoice: shouldSpeak,
          language: selectedLang // මෙතැනින් භාෂාව Backend එකට යවයි
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data?.success) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        updateMessagesUnique(data.messages);
        console.log(data);

        if (shouldSpeak && data.audio) {
          playAudio(data.audio);
        }
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      console.error("Send error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. startVoiceInput තුළ භාෂාව නිවැරදිව යෙදීම
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire("Not Supported", "Please use Chrome or Edge for voice features.", "warning");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang; // UI එකේ තෝරාගත් භාෂාව මෙහි භාවිතා වේ
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
    <div className="fixed bottom-6 right-6 z-[1000] font-sans antialiased">
      <button
        onClick={() => (token ? setIsOpen(!isOpen) : navigate("/login"))}
        className="w-14 h-14 bg-[#2E2DAD] text-white rounded-full border border-2 border-white shadow-2xl flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all mr-10"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[550px] bg-white rounded-[25px] flex flex-col shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">
          <header className="p-4 bg-[#2E2DAD] text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-small tracking-wide">Customer Support</h3>
              <h3 className=" text-sm tracking-wide">Customer Service Super Chat</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => setSelectedLang("si-LK")}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${selectedLang === "si-LK" ? "bg-white text-slate-900" : "bg-white/20 text-white"}`}
                >
                  සිංහල
                </button>
                <button
                  onClick={() => setSelectedLang("en-US")}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${selectedLang === "en-US" ? "bg-white text-slate-900" : "bg-white/20 text-white"}`}
                >
                  ENGLISH
                </button>
              </div>
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <button
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setIsSpeaking(false);
                  }}
                  className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20 hover:bg-white/20"
                >
                  Stop
                </button>
              </div>
            )}
          </header>

          <main ref={mainRef} className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-1">
            {messages.map((m) => (
              <MessageBubble key={m._id || m.tempId} msg={m} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="px-4 py-2 bg-white border rounded-t-2xl rounded-br-2xl text-[11px] text-slate-400 animate-pulse">
                  AI is typing...
                </div>
              </div>
            )}
          </main>

          <footer className="p-4 border-t bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input, false);
              }}
              className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all"
            >
              <button
                type="button"
                onClick={startVoiceInput}
                className={`text-lg transition-all active:scale-125 ${isListening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-slate-600"}`}
              >
                {isListening ? "🔴" : "🎤"}
              </button>
              <input
                className="flex-1 bg-transparent outline-none text-sm py-3 text-slate-700 placeholder:text-slate-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                // placeholder={isListening ? (selectedLang === "si-LK" ? "අසා සිටිමි..." : "Listening...") : "පණිවිඩයක් ලියන්න..."}
                placeholder={
  isListening
    ? (selectedLang === "si-LK" ? "අසා සිටිමි..." : "Listening...")
    : (selectedLang === "si-LK" ? "පණිවිඩයක් ලියන්න..." : "Type Your Message Here...")
}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="text-slate-900 disabled:opacity-20 hover:translate-x-0.5 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}