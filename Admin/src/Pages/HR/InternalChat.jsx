import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Plus, X, Send, Hash, Lock, Megaphone, Search, Loader, Trash2, Smile } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const CHANNEL_ICONS = { public: <Hash size={14}/>, private: <Lock size={14}/>, announcement: <Megaphone size={14}/>, direct: null };
const CHANNEL_COLORS = { public:"text-gray-400", private:"text-yellow-500", announcement:"text-[#DD1215]", direct:"text-blue-400" };

const QUICK_REACTIONS = ["👍","❤️","😂","🎉","🔥","👏"];

const InternalChat = () => {
  const admin      = JSON.parse(localStorage.getItem("Admin") || "{}");
  const myId       = admin?._id || admin?.id || "";
  const myName     = admin?.name || admin?.username || admin?.email || "Admin";

  const [channels,   setChannels]   = useState([]);
  const [selChannel, setSelChannel] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [announceModal, setAnnounceModal] = useState(false);
  const [dmModal,    setDmModal]    = useState(false);
  const [newChannel, setNewChannel] = useState({ name:"", description:"", type:"public", icon:"💬" });
  const [announcement, setAnnouncement] = useState({ channelId:"", content:"" });
  const [dmTarget,   setDmTarget]   = useState("");
  const [sending,    setSending]    = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); };

  useEffect(() => { loadChannels(); loadEmployees(); }, []);
  useEffect(() => { if (selChannel) loadMessages(); }, [selChannel]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadChannels = async () => {
    try { setLoading(true);
      const res = await axios.get(`${BASE}/hr/chat/channels/all`, auth());
      setChannels(res.data.data || []);
    } catch { setError("Failed to load channels."); } finally { setLoading(false); }
  };

  const loadMessages = async () => {
    try { setMsgLoading(true);
      const res = await axios.get(`${BASE}/hr/chat/messages/${selChannel._id}`, { ...auth(), params:{ limit:80 } });
      setMessages(res.data.data || []);
      // Mark as read
      axios.patch(`${BASE}/hr/chat/messages/${selChannel._id}/read`, {}, auth()).catch(()=>{});
    } catch { setError("Failed to load messages."); } finally { setMsgLoading(false); }
  };

  const loadEmployees = async () => {
    try { const r = await axios.get(`${BASE}/hr/employees/getall`, auth()); setEmployees(r.data.data||[]); } catch {}
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !selChannel || sending) return;
    try { setSending(true);
      const res = await axios.post(`${BASE}/hr/chat/messages/${selChannel._id}`, { content: input.trim() }, auth());
      setMessages(prev => [...prev, res.data.data]);
      setInput("");
      // Update channel preview
      setChannels(prev => prev.map(c => c._id === selChannel._id ? { ...c, lastMessage:{ content: input.trim(), sentBy: myName, sentAt: new Date() } } : c));
    } catch { setError("Failed to send."); } finally { setSending(false); inputRef.current?.focus(); }
  };

  const handleReaction = async (msgId, emoji) => {
    try {
      const res = await axios.post(`${BASE}/hr/chat/messages/${msgId}/react`, { emoji }, auth());
      setMessages(prev => prev.map(m => m._id === msgId ? res.data.data : m));
    } catch {}
  };

  const handleDelete = async (msgId) => {
    try {
      await axios.delete(`${BASE}/hr/chat/messages/${msgId}`, auth());
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, content: "This message was deleted." } : m));
    } catch {}
  };

  const handleSearch = async () => {
    if (!search.trim() || !selChannel) return;
    try {
      const res = await axios.get(`${BASE}/hr/chat/messages/${selChannel._id}/search`, { ...auth(), params:{ q: search } });
      setSearchResults(res.data.data || []);
    } catch {}
  };

  const handleCreateChannel = async () => {
    if (!newChannel.name) return;
    try { setSending(true);
      await axios.post(`${BASE}/hr/chat/channels/create`, newChannel, auth());
      setCreateModal(false); setNewChannel({ name:"", description:"", type:"public", icon:"💬" });
      loadChannels();
    } catch (e) { setError(e.response?.data?.message||"Failed to create."); } finally { setSending(false); }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.channelId || !announcement.content) return;
    try { setSending(true);
      await axios.post(`${BASE}/hr/chat/announce`, announcement, auth());
      setAnnounceModal(false); setAnnouncement({ channelId:"", content:"" });
      if (selChannel?._id === announcement.channelId) loadMessages();
    } catch (e) { setError(e.response?.data?.message||"Failed to send."); } finally { setSending(false); }
  };

  const handleStartDM = async () => {
    if (!dmTarget) return;
    const emp = employees.find(e => e._id === dmTarget);
    try { setSending(true);
      const res = await axios.post(`${BASE}/hr/chat/channels/dm`, { targetUserId: dmTarget, targetUserName: `${emp?.firstName} ${emp?.lastName}` }, auth());
      setDmModal(false); setDmTarget("");
      loadChannels();
      setSelChannel(res.data.data);
    } catch (e) { setError(e.response?.data?.message||"Failed."); } finally { setSending(false); }
  };

  const handleDeleteChannel = async (id) => {
    if (!window.confirm("Delete this channel and all its messages?")) return;
    try { await axios.delete(`${BASE}/hr/chat/channels/${id}`, auth()); setSelChannel(null); loadChannels(); }
    catch { setError("Failed to delete channel."); }
  };

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes("") );
  const fmt = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" }) : "";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN",{ day:"2-digit", month:"short" }) : "";

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach(m => {
    const d = fmtDate(m.createdAt);
    if (d !== lastDate) { groupedMessages.push({ type:"date", label: d }); lastDate = d; }
    groupedMessages.push({ type:"msg", data: m });
  });

  return (
    <div className="bg-gray-100 flex h-full" style={{ height: "calc(100vh - 120px)" }}>

      {/* ── Sidebar ── */}
      <div className="w-64 bg-gray-900 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <p className="text-white font-black text-sm uppercase tracking-widest">Channels</p>
          <div className="flex gap-1">
            <button onClick={() => setAnnounceModal(true)} title="Send Announcement" className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700 transition"><Megaphone size={14}/></button>
            <button onClick={() => setDmModal(true)} title="Direct Message" className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700 transition"><MessageSquare size={14}/></button>
            <button onClick={() => setCreateModal(true)} title="New Channel" className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-700 transition"><Plus size={14}/></button>
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader size={16} className="animate-spin text-gray-400"/></div>
          ) : channels.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">No channels yet.</p>
          ) : (
            channels.map(ch => (
              <button key={ch._id} onClick={() => { setSelChannel(ch); setSearchResults(null); setSearch(""); }}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-2 hover:bg-gray-700 transition group ${selChannel?._id === ch._id ? "bg-gray-700" : ""}`}>
                <span className={`mt-0.5 shrink-0 ${CHANNEL_COLORS[ch.type]}`}>{CHANNEL_ICONS[ch.type] || <Hash size={14}/>}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${selChannel?._id===ch._id?"text-white":"text-gray-300"}`}>{ch.name}</p>
                  {ch.lastMessage?.content && (
                    <p className="text-[10px] text-gray-500 truncate">{ch.lastMessage.sentBy}: {ch.lastMessage.content}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* My info */}
        <div className="px-4 py-3 border-t border-gray-700 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold shrink-0">{myName[0]?.toUpperCase()}</div>
          <p className="text-xs text-gray-300 font-semibold truncate">{myName}</p>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      {!selChannel ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <MessageSquare size={48} className="mb-4 opacity-20"/>
          <p className="font-semibold">Select a channel to start chatting</p>
          <button onClick={() => setCreateModal(true)} className="mt-3 text-xs text-[#DD1215] font-bold hover:underline">Create your first channel →</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="bg-white border-b px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className={CHANNEL_COLORS[selChannel.type]}>{CHANNEL_ICONS[selChannel.type]||<Hash size={16}/>}</span>
              <p className="font-black text-gray-900">{selChannel.name}</p>
              {selChannel.description && <p className="text-xs text-gray-400 hidden sm:block">— {selChannel.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex gap-1">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()}
                  className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#DD1215] w-32"
                  placeholder="Search messages..." />
                <button onClick={handleSearch} className="border border-gray-300 px-2 py-1 hover:bg-gray-50 transition"><Search size={12}/></button>
                {searchResults !== null && <button onClick={() => { setSearchResults(null); setSearch(""); }} className="text-gray-400 hover:text-gray-700"><X size={14}/></button>}
              </div>
              <button onClick={() => handleDeleteChannel(selChannel._id)} className="text-gray-400 hover:text-red-500 transition" title="Delete channel"><Trash2 size={15}/></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {msgLoading ? (
              <div className="flex justify-center py-8"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
            ) : searchResults !== null ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-gray-400">Search Results ({searchResults.length})</p>
                {searchResults.map(m => (
                  <div key={m._id} className="bg-yellow-50 border border-yellow-100 rounded px-4 py-2">
                    <p className="text-xs font-bold text-gray-700">{m.senderName} · {fmt(m.createdAt)}</p>
                    <p className="text-sm text-gray-800 mt-0.5">{m.content}</p>
                  </div>
                ))}
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare size={32} className="mb-2 opacity-30"/>
                <p className="text-sm font-semibold">No messages yet. Say hello!</p>
              </div>
            ) : (
              groupedMessages.map((item, i) => {
                if (item.type === "date") return (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="flex-1 border-b border-gray-200"/>
                    <span className="text-[10px] text-gray-400 font-semibold px-2">{item.label}</span>
                    <div className="flex-1 border-b border-gray-200"/>
                  </div>
                );
                const m = item.data;
                const isMe = m.senderId?.toString() === myId?.toString();
                return (
                  <div key={m._id} className={`flex gap-2 group ${isMe ? "flex-row-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isMe?"bg-[#DD1215] text-white":"bg-gray-300 text-gray-700"}`}>
                      {m.senderName?.[0]?.toUpperCase()}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[65%] ${isMe?"items-end":"items-start"} flex flex-col`}>
                      {!isMe && <p className="text-[10px] text-gray-400 font-semibold mb-0.5 px-1">{m.senderName}</p>}
                      <div className={`relative px-3 py-2 rounded-2xl text-sm ${
                        m.isDeleted ? "bg-gray-100 text-gray-400 italic" :
                        m.type === "announcement" ? "bg-red-50 border border-red-200 text-red-800 font-semibold" :
                        isMe ? "bg-[#DD1215] text-white" : "bg-white border border-gray-200 text-gray-800"
                      }`}>
                        {m.type === "announcement" && <Megaphone size={12} className="inline mr-1.5"/>}
                        {m.content}
                      </div>
                      {/* Time + reactions */}
                      <div className="flex items-center gap-1 mt-0.5 px-1">
                        <span className="text-[9px] text-gray-400">{fmt(m.createdAt)}</span>
                        {/* Reactions display */}
                        {m.reactions?.map(r => r.count > 0 && (
                          <button key={r.emoji} onClick={() => handleReaction(m._id, r.emoji)}
                            className="text-[10px] bg-gray-100 hover:bg-gray-200 rounded-full px-1.5 py-0.5 transition">
                            {r.emoji} {r.count}
                          </button>
                        ))}
                      </div>
                      {/* Hover actions */}
                      {!m.isDeleted && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-1 mt-0.5">
                          {QUICK_REACTIONS.map(emoji => (
                            <button key={emoji} onClick={() => handleReaction(m._id, emoji)}
                              className="text-[12px] hover:scale-125 transition-transform">{emoji}</button>
                          ))}
                          {isMe && (
                            <button onClick={() => handleDelete(m._id)} className="text-gray-400 hover:text-red-500 ml-1"><Trash2 size={11}/></button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="bg-white border-t px-4 py-3 flex items-center gap-3 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#DD1215]"
              placeholder={`Message #${selChannel.name}...`}
            />
            <button type="submit" disabled={!input.trim() || sending}
              className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center hover:bg-red-700 transition disabled:opacity-40">
              <Send size={15}/>
            </button>
          </form>
        </div>
      )}

      {/* Create Channel Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Create Channel</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Channel Name *"><input type="text" value={newChannel.name} onChange={e=>setNewChannel(f=>({...f,name:e.target.value}))} className={inp} placeholder="general" required /></F>
                <F label="Type">
                  <select value={newChannel.type} onChange={e=>setNewChannel(f=>({...f,type:e.target.value}))} className={inp}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </F>
              </div>
              <F label="Description"><input type="text" value={newChannel.description} onChange={e=>setNewChannel(f=>({...f,description:e.target.value}))} className={inp} /></F>
              <F label="Icon (emoji)"><input type="text" value={newChannel.icon} onChange={e=>setNewChannel(f=>({...f,icon:e.target.value}))} className={inp} placeholder="💬" /></F>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreateChannel} disabled={sending} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {sending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {announceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">📢 Send Announcement</h3>
            <div className="space-y-4">
              <F label="Channel *">
                <select value={announcement.channelId} onChange={e=>setAnnouncement(f=>({...f,channelId:e.target.value}))} className={inp}>
                  <option value="">Select channel</option>
                  {channels.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </F>
              <F label="Message *"><textarea rows={4} value={announcement.content} onChange={e=>setAnnouncement(f=>({...f,content:e.target.value}))} className={`${inp} resize-none`} placeholder="Important announcement..." /></F>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAnnounceModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSendAnnouncement} disabled={sending} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DM Modal */}
      {dmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Direct Message</h3>
            <F label="Select Employee">
              <select value={dmTarget} onChange={e=>setDmTarget(e.target.value)} className={inp}>
                <option value="">Choose employee...</option>
                {employees.map(e=><option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
              </select>
            </F>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDmModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleStartDM} disabled={!dmTarget||sending} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {sending ? "Opening..." : "Open Chat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2">
          {error}
          <button onClick={() => setError("")}><X size={14}/></button>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default InternalChat;
