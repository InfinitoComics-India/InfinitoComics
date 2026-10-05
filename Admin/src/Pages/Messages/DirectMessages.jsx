import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Inbox, SendHorizonal, Trash2, RefreshCw, Plus, X, ChevronDown, Search } from "lucide-react";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const fmtAgo = (d) => {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
};

const DirectMessages = () => {
  const [tab,       setTab]       = useState("inbox");
  const [inbox,     setInbox]     = useState([]);
  const [sent,      setSent]      = useState([]);
  const [contacts,  setContacts]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [composing, setComposing] = useState(false);
  const [search,    setSearch]    = useState("");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [toId,      setToId]      = useState("");
  const [toSearch,  setToSearch]  = useState("");
  const [subject,   setSubject]   = useState("");
  const [body,      setBody]      = useState("");
  const [sending,   setSending]   = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef(null);

  useEffect(() => { loadInbox(); loadSent(); loadContacts(); }, []);

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const loadInbox    = async () => { try { setLoading(true); const r = await axios.get(`${BASE}/messages/inbox`, auth()); setInbox(r.data.data||[]); } catch {} finally { setLoading(false); } };
  const loadSent     = async () => { try { const r = await axios.get(`${BASE}/messages/sent`, auth()); setSent(r.data.data||[]); } catch {} };
  const loadContacts = async () => { try { const r = await axios.get(`${BASE}/messages/contacts`, auth()); setContacts(r.data.data||[]); } catch {} };

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.isRead && tab === "inbox") {
      try {
        await axios.patch(`${BASE}/messages/read/${msg._id}`, {}, auth());
        setInbox(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch {}
    }
  };

  const deleteMsg = async (id) => {
    try {
      await axios.delete(`${BASE}/messages/delete/${id}`, auth());
      setInbox(prev => prev.filter(m => m._id !== id));
      setSent(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
      setSuccess("Message deleted.");
    } catch { setError("Failed to delete."); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toId) { setError("Please select a recipient."); return; }
    if (!body.trim()) { setError("Message body is required."); return; }
    try {
      setSending(true); setError("");
      await axios.post(`${BASE}/messages/send`, { receiverId: toId, subject, body }, auth());
      setSuccess("✅ Message sent!");
      setComposing(false); setToId(""); setToSearch(""); setSubject(""); setBody("");
      loadSent();
    } catch (e) { setError(e.response?.data?.message || "Failed to send."); }
    finally { setSending(false); }
  };

  const messages = tab === "inbox" ? inbox : sent;
  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    return !q || m.subject?.toLowerCase().includes(q) || m.body?.toLowerCase().includes(q) ||
      m.senderName?.toLowerCase().includes(q) || m.receiverName?.toLowerCase().includes(q);
  });
  const filteredContacts = contacts.filter(c => !toSearch ||
    c.name?.toLowerCase().includes(toSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(toSearch.toLowerCase()));
  const selectedContact = contacts.find(c => c._id === toId);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">MESSAGES</h1>
            <p className="text-xs text-gray-400 mt-0.5">Send messages to admins and employees</p>
          </div>
        </div>
        <button onClick={() => { setComposing(true); setSelected(null); setError(""); setSuccess(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition rounded-lg">
          <Plus size={15}/> Compose
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* List pane */}
          <div className="bg-white border rounded-xl overflow-hidden flex flex-col">
            <div className="flex border-b">
              <button onClick={() => { setTab("inbox"); setSelected(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition ${tab==="inbox"?"bg-[#DD1215] text-white":"text-gray-500 hover:bg-gray-50"}`}>
                <Inbox size={14}/> Inbox
                {inbox.filter(m=>!m.isRead).length > 0 && (
                  <span className="bg-white text-[#DD1215] text-[10px] font-black px-1.5 py-0.5 rounded-full">{inbox.filter(m=>!m.isRead).length}</span>
                )}
              </button>
              <button onClick={() => { setTab("sent"); setSelected(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition ${tab==="sent"?"bg-[#DD1215] text-white":"text-gray-500 hover:bg-gray-50"}`}>
                <SendHorizonal size={14}/> Sent
              </button>
            </div>
            <div className="px-3 py-2 border-b">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                <Search size={12} className="text-gray-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-xs focus:outline-none text-gray-600"/>
              </div>
            </div>
            <div className="px-3 py-1.5 border-b flex justify-end">
              <button onClick={() => { loadInbox(); loadSent(); }} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-700">
                <RefreshCw size={10}/> Refresh
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y" style={{maxHeight:"60vh"}}>
              {loading ? <p className="text-center text-xs text-gray-400 py-8">Loading...</p>
              : filtered.length === 0 ? (
                <div className="text-center py-10"><Inbox size={28} className="mx-auto text-gray-200 mb-2"/><p className="text-xs text-gray-400">No messages</p></div>
              ) : filtered.map(msg => (
                <div key={msg._id} onClick={() => openMessage(msg)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${selected?._id===msg._id?"bg-blue-50 border-l-2 border-l-[#DD1215]":""} ${!msg.isRead&&tab==="inbox"?"bg-blue-50/40":""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${!msg.isRead&&tab==="inbox"?"font-black text-gray-900":"font-semibold text-gray-700"}`}>
                        {tab==="inbox"?msg.senderName:msg.receiverName}
                      </p>
                      {msg.subject && <p className="text-[10px] text-gray-500 truncate mt-0.5">{msg.subject}</p>}
                      <p className="text-[10px] text-gray-400 truncate">{msg.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-[9px] text-gray-400">{fmtAgo(msg.createdAt)}</p>
                      {!msg.isRead&&tab==="inbox"&&<span className="w-2 h-2 rounded-full bg-[#DD1215]"/>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View/Compose pane */}
          <div className="lg:col-span-2 bg-white border rounded-xl overflow-hidden flex flex-col">
            {composing ? (
              <div className="flex flex-col h-full">
                <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50">
                  <p className="font-black text-gray-900 text-sm">New Message</p>
                  <button onClick={() => setComposing(false)} className="text-gray-400 hover:text-gray-700"><X size={16}/></button>
                </div>
                <form onSubmit={handleSend} className="flex-1 flex flex-col p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">To *</label>
                    <div className="relative" ref={dropRef}>
                      <div onClick={() => setDropOpen(o=>!o)} className="w-full border border-gray-300 px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between rounded-lg">
                        {selectedContact ? <span className="text-gray-800 font-semibold text-xs">{selectedContact.name} ({selectedContact.email})</span>
                          : <span className="text-gray-400 text-xs">Select recipient...</span>}
                        <ChevronDown size={14} className="text-gray-400"/>
                      </div>
                      {dropOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                          <div className="p-2 border-b">
                            <input value={toSearch} onChange={e=>setToSearch(e.target.value)} autoFocus placeholder="Search..." className="w-full text-xs focus:outline-none px-2 py-1.5 border border-gray-200 rounded"/>
                          </div>
                          <div className="overflow-y-auto" style={{maxHeight:"200px"}}>
                            {filteredContacts.length===0 ? <p className="text-xs text-gray-400 text-center py-4">No contacts found</p>
                            : filteredContacts.map(c => (
                              <div key={c._id} onClick={() => { setToId(c._id); setToSearch(""); setDropOpen(false); }}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[11px] font-black shrink-0">
                                  {c.name?.[0]?.toUpperCase()||"?"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{c.name}</p>
                                  <p className="text-[10px] text-gray-400">{c.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Subject</label>
                    <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Optional subject..." className="w-full border border-gray-300 px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[#DD1215]"/>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Message *</label>
                    <textarea value={body} onChange={e=>setBody(e.target.value)} required rows={8} placeholder="Type your message here..." className="flex-1 border border-gray-300 px-3 py-3 text-sm rounded-lg focus:outline-none focus:border-[#DD1215] resize-none"/>
                  </div>
                  <button type="submit" disabled={sending} className="flex items-center justify-center gap-2 bg-[#DD1215] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50 rounded-lg">
                    <Send size={15}/> {sending?"Sending...":"Send Message"}
                  </button>
                </form>
              </div>
            ) : selected ? (
              <div className="flex flex-col h-full">
                <div className="px-5 py-4 border-b bg-gray-50 flex items-start justify-between">
                  <div>
                    <p className="font-black text-gray-900">{selected.subject || "(No subject)"}</p>
                    <p className="text-xs text-gray-500 mt-1">{tab==="inbox"?`From: ${selected.senderName}`:`To: ${selected.receiverName}`} · {fmtAgo(selected.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setComposing(true); setToId(tab==="inbox"?selected.senderId:selected.receiverId); setSubject(`Re: ${selected.subject||""}`); setBody(""); setSelected(null); }}
                      className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 text-xs font-bold hover:bg-gray-100 rounded-lg">
                      <Send size={12}/> Reply
                    </button>
                    <button onClick={() => deleteMsg(selected._id)} className="flex items-center gap-1.5 border border-red-200 text-red-500 px-3 py-1.5 text-xs font-bold hover:bg-red-50 rounded-lg">
                      <Trash2 size={12}/> Delete
                    </button>
                    <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 ml-1"><X size={16}/></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-20">
                <Send size={48} className="mb-4 opacity-30"/>
                <p className="font-bold text-gray-400">Select a message or compose new</p>
                <button onClick={() => setComposing(true)} className="mt-5 flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2.5 text-xs font-black uppercase rounded-lg hover:bg-red-700 transition">
                  <Plus size={14}/> Compose
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
