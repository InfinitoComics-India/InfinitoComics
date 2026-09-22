import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Plus, Trash2, MessageSquare, Loader, X, ChevronLeft, Bot, User, AlertTriangle } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const SUGGESTIONS = [
  "Who is available this week?",
  "Show me all overdue tasks",
  "What is the status of active projects?",
  "How many leave requests are pending?",
  "Who are the top performers this month?",
  "Show today's attendance summary",
  "List all open self-service requests",
  "Which employees are in the Engineering department?",
  "What are our current active projects?",
  "Summarize the team workload",
];

const fmt = (d) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-[#DD1215]" : "bg-gray-800"}`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-[#DD1215] text-white rounded-tr-none"
          : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
      }`}>
        {/* Render markdown-like content */}
        {msg.content.split("\n").map((line, i) => {
          // Bold: **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**")
                  ? <strong key={j}>{part.slice(2, -2)}</strong>
                  : part
              )}
            </p>
          );
        })}
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-red-200" : "text-gray-400"}`}>{fmt(msg.createdAt)}</p>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [typing,        setTyping]        = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [isMock,        setIsMock]        = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/ai/conversations`, auth());
      setConversations(res.data.data || []);
    } catch {}
  };

  const openConversation = async (conv) => {
    try {
      const res = await axios.get(`${BASE}/hr/ai/conversations/${conv._id}`, auth());
      setActiveConv(res.data.data);
      setMessages(res.data.data.messages || []);
    } catch {}
  };

  const startNewChat = () => {
    setActiveConv(null);
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");
    // Optimistically add user message
    const userMsg = { role: "user", content: msg, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await axios.post(`${BASE}/hr/ai/chat`, {
        message: msg,
        conversationId: activeConv?._id || null,
      }, auth());

      const { reply, conversationId, mock } = res.data.data;
      setIsMock(!!mock);

      // Set or update active conversation
      if (!activeConv) {
        const convRes = await axios.get(`${BASE}/hr/ai/conversations/${conversationId}`, auth());
        setActiveConv(convRes.data.data);
        setMessages(convRes.data.data.messages || []);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: reply, createdAt: new Date() }]);
      }
      loadConversations();
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I encountered an error: ${e.response?.data?.message || e.message}. Please try again.`,
        createdAt: new Date(),
      }]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleDelete = async (convId) => {
    try {
      await axios.delete(`${BASE}/hr/ai/conversations/${convId}`, auth());
      if (activeConv?._id === convId) startNewChat();
      loadConversations();
    } catch {}
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all conversations?")) return;
    try {
      await axios.delete(`${BASE}/hr/ai/conversations`, auth());
      startNewChat(); loadConversations();
    } catch {}
  };

  return (
    <div className="bg-gray-100 flex" style={{ height: "calc(100vh - 120px)" }}>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-900 flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#DD1215]"/>
              <p className="text-white font-black text-sm uppercase tracking-widest">Infinito AI</p>
            </div>
            <button onClick={startNewChat} className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700 transition" title="New Chat">
              <Plus size={14}/>
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-8">No conversations yet.</p>
            ) : (
              conversations.map(conv => (
                <button key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left px-4 py-2.5 flex items-start gap-2 hover:bg-gray-700 transition group ${activeConv?._id===conv._id?"bg-gray-700":""}`}>
                  <MessageSquare size={13} className="text-gray-500 shrink-0 mt-0.5"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{conv.title}</p>
                    <p className="text-[10px] text-gray-500">{fmtDate(conv.updatedAt)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(conv._id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition shrink-0">
                    <Trash2 size={11}/>
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {conversations.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-700">
              <button onClick={handleClearAll} className="text-[10px] text-gray-500 hover:text-red-400 transition uppercase tracking-widest">
                Clear all history
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-400 hover:text-gray-700 transition">
              <ChevronLeft size={18} className={`transition-transform ${sidebarOpen?"":"rotate-180"}`}/>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
              <Bot size={16} className="text-white"/>
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Infinito AI Assistant</p>
              <p className="text-[10px] text-green-500 font-semibold">● Connected to HR data</p>
            </div>
          </div>
          <button onClick={startNewChat} className="flex items-center gap-1.5 text-xs border border-gray-300 px-3 py-1.5 hover:bg-gray-50 transition font-semibold text-gray-600">
            <Plus size={12}/> New Chat
          </button>
        </div>

        {/* Mock warning */}
        {isMock && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-5 py-2 flex items-center gap-2">
            <AlertTriangle size={13} className="text-yellow-600 shrink-0"/>
            <p className="text-xs text-yellow-800">
              Running in <strong>demo mode</strong> — add <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code> to <code className="bg-yellow-100 px-1 rounded">backend/.env</code> for full AI responses.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-4 shadow-xl">
                <Sparkles size={28} className="text-[#DD1215]"/>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Infinito AI</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Your internal AI assistant. Ask me anything about your team, tasks, projects, attendance, leaves, or HR processes.
              </p>
              {/* Suggestion pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.slice(0, 6).map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full hover:border-[#DD1215] hover:text-[#DD1215] transition shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white"/>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions row (after first message) */}
        {messages.length > 0 && messages.length < 3 && (
          <div className="px-5 py-2 flex gap-2 overflow-x-auto border-t border-gray-100 bg-white shrink-0">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button key={s} onClick={() => handleSend(s)}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 whitespace-nowrap transition shrink-0">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t px-5 py-4 shrink-0">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-[#DD1215] transition bg-white">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                rows={1}
                className="flex-1 resize-none outline-none text-sm text-gray-800 max-h-32 bg-transparent"
                placeholder="Ask anything... (e.g. 'Who is on leave today?' or 'Show overdue tasks')"
                style={{ minHeight: "24px" }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || typing}
              className="w-11 h-11 rounded-full bg-[#DD1215] text-white flex items-center justify-center hover:bg-red-700 transition disabled:opacity-40 shrink-0"
            >
              {typing ? <Loader size={16} className="animate-spin"/> : <Send size={16}/>}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Infinito AI · Powered by your HR data · Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
