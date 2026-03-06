import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const QUICK_TOPICS = [
  "WiFi not working",
  "Cannot login to my account",
  "Printer not printing",
  "Laptop is very slow",
  "Email not working",
  "VPN keeps disconnecting",
];

export default function ChatBot() {
  const navigate  = useNavigate();
  const { token } = useSelector((s) => s.auth);
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [messages, setMessages] = useState([{
    from: "bot",
    text: "Hi! I am your IT Support Assistant. Describe your issue and I will help you fix it instantly!",
    showTopics: true,
  }]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(
        "https://it-helpdesk-ee86.onrender.com/api/chatbot",
        { message: userText },
        { headers: { Authorization: "Bearer " + token } }
      );
      setMessages((prev) => [...prev, { from: "bot", text: res.data.reply, showEscalate: true }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "Sorry, I am having trouble. Please create a support ticket.", showEscalate: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setMessages([{
    from: "bot",
    text: "Hi! I am your IT Support Assistant. Describe your issue and I will help you fix it instantly!",
    showTopics: true,
  }]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={"fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center z-50 transition-all duration-300 text-white font-bold " + (open ? "bg-slate-700" : "bg-indigo-500 hover:bg-indigo-600")}
      >
        {open ? "X" : "AI"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden" style={{ height: "520px" }}>
          <div className="bg-indigo-500 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">AI</div>
              <div>
                <p className="text-white font-bold text-sm">IT Support Bot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-indigo-100 text-xs">AI Powered - Gemini</span>
                </div>
              </div>
            </div>
            <button onClick={handleReset} className="text-indigo-200 hover:text-white text-xs font-semibold">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx}>
                {msg.from === "user" ? (
                  <div className="flex justify-end">
                    <div className="bg-indigo-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-xs">{msg.text}</div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-start">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 mt-0.5">AI</div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                      {msg.showTopics && (
                        <div className="grid grid-cols-2 gap-1.5">
                          {QUICK_TOPICS.map((t) => (
                            <button key={t} onClick={() => sendMessage(t)}
                              className="text-left px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.showEscalate && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                          <p className="text-xs text-amber-700 font-semibold mb-2">Still not resolved?</p>
                          <button onClick={() => { setOpen(false); navigate("/employee/incidents/new"); }}
                            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors">
                            Create Support Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">AI</div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-white shrink-0">
            <div className="flex gap-2">
              <input type="text" placeholder="Describe your issue..." value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all" />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
