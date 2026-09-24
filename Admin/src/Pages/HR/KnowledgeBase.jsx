import React, { useState, useEffect } from "react";
import { BookOpen, Plus, X, Search, Eye, ThumbsUp, ThumbsDown, Pin, Edit3, Trash2, Loader, RefreshCw, ChevronRight, Tag } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const CATEGORIES = ["All","Engineering","Design","HR","Finance","Marketing","Operations","Research","General"];
const CAT_COLORS = { Engineering:"bg-blue-100 text-blue-700", Design:"bg-purple-100 text-purple-700", HR:"bg-pink-100 text-pink-700", Finance:"bg-green-100 text-green-700", Marketing:"bg-orange-100 text-orange-700", Operations:"bg-yellow-100 text-yellow-700", Research:"bg-indigo-100 text-indigo-700", General:"bg-gray-100 text-gray-600" };

const EMPTY_FORM = { title:"", content:"", category:"General", tags:"", isPublished:false, isPinned:false, changeNote:"" };

const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const KnowledgeBase = () => {
  const [articles,   setArticles]  = useState([]);
  const [popular,    setPopular]   = useState([]);
  const [stats,      setStats]     = useState([]);
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [catFilter,  setCatFilter] = useState("All");
  const [search,     setSearch]    = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [detail,     setDetail]    = useState(null);
  const [detailFull, setDetailFull]= useState(null);
  const [editModal,  setEditModal] = useState(null);
  const [createModal,setCreateModal]=useState(false);
  const [form,       setForm]      = useState(EMPTY_FORM);
  const [saving,     setSaving]    = useState(false);

  const load = async () => {
    try { setLoading(true); setError("");
      const cat = catFilter === "All" ? undefined : catFilter;
      const [aRes, pRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/wiki/all`, { ...auth(), params: cat ? { category: cat } : {} }),
        axios.get(`${BASE}/hr/wiki/popular`, auth()),
        axios.get(`${BASE}/hr/wiki/stats`, auth()),
      ]);
      setArticles(aRes.data.data || []);
      setPopular(pRes.data.data || []);
      setStats(sRes.data.data || []);
    } catch { setError("Failed to load articles."); } finally { setLoading(false); }
  };

  const openDetail = async (article) => {
    try {
      const res = await axios.get(`${BASE}/hr/wiki/${article._id}`, auth());
      setDetailFull(res.data.data);
      setDetail(article);
    } catch {}
  };

  useEffect(() => { load(); }, [catFilter]);

  const handleSearch = async () => {
    if (!search.trim()) { setSearchResults(null); return; }
    try {
      const res = await axios.get(`${BASE}/hr/wiki/search`, { ...auth(), params: { q: search } });
      setSearchResults(res.data.data || []);
    } catch { setError("Search failed."); }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { setError("Title and content are required."); return; }
    try { setSaving(true); setError("");
      const payload = { ...form, tags: form.tags.split(",").map(t=>t.trim()).filter(Boolean) };
      if (editModal) {
        await axios.put(`${BASE}/hr/wiki/update/${editModal._id}`, payload, auth());
      } else {
        await axios.post(`${BASE}/hr/wiki/create`, payload, auth());
      }
      setCreateModal(false); setEditModal(null); setForm(EMPTY_FORM); load();
    } catch (e) { setError(e.response?.data?.message || "Failed to save."); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try { await axios.delete(`${BASE}/hr/wiki/delete/${id}`, auth()); setDetail(null); setDetailFull(null); load(); }
    catch { setError("Failed to delete."); }
  };

  const handleTogglePublish = async (article) => {
    try {
      await axios.put(`${BASE}/hr/wiki/update/${article._id}`, { isPublished: !article.isPublished }, auth());
      load();
    } catch { setError("Failed to update."); }
  };

  const handleVote = async (id, helpful) => {
    try { await axios.post(`${BASE}/hr/wiki/vote/${id}`, { helpful }, auth()); openDetail(detail); }
    catch {}
  };

  const displayArticles = searchResults !== null ? searchResults : articles;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">KNOWLEDGE BASE</h1>
            <p className="text-xs text-gray-400 mt-0.5">Infinito Wiki — internal documentation and guides</p>
          </div>
        </div>
        <button onClick={() => { setCreateModal(true); setForm(EMPTY_FORM); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> New Article
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6 flex-col lg:flex-row">

        {/* Main content */}
        <div className="flex-1 space-y-5 min-w-0">

          {/* Search */}
          <div className="flex gap-2">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="flex-1 border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white"
              placeholder="Search articles, guides, docs..." />
            <button onClick={handleSearch} className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
              <Search size={14}/>
            </button>
            {searchResults !== null && (
              <button onClick={() => { setSearchResults(null); setSearch(""); }} className="border border-gray-300 px-3 py-2 hover:bg-gray-50 transition text-gray-500"><X size={14}/></button>
            )}
          </div>

          {/* Category tabs */}
          {searchResults === null && (
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`px-3 py-1.5 text-xs font-bold transition rounded ${catFilter===c?"bg-[#DD1215] text-white":"bg-white border border-gray-300 text-gray-600 hover:border-[#DD1215] hover:text-[#DD1215]"}`}>{c}</button>
              ))}
              <button onClick={load} className="border border-gray-300 px-2 py-1.5 hover:bg-gray-50 transition rounded text-gray-400"><RefreshCw size={11}/></button>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}
          {searchResults !== null && <p className="text-xs text-gray-500 font-semibold">{searchResults.length} results for "{search}"</p>}

          {/* Article list */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
          ) : displayArticles.length === 0 ? (
            <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-3 opacity-30"/>
              <p className="font-semibold">No articles found.</p>
              <button onClick={() => { setCreateModal(true); setForm(EMPTY_FORM); }} className="mt-3 text-xs text-[#DD1215] font-bold hover:underline">Write the first article →</button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayArticles.map(a => (
                <div key={a._id} onClick={() => openDetail(a)}
                  className="bg-white border rounded-lg px-5 py-4 flex items-start gap-4 cursor-pointer hover:border-[#DD1215] hover:shadow-sm transition">
                  {/* Pin indicator */}
                  {a.isPinned && <Pin size={14} className="text-[#DD1215] shrink-0 mt-1"/>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[a.category]||"bg-gray-100 text-gray-600"}`}>{a.category}</span>
                      {!a.isPublished && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Draft</span>}
                      {a.tags?.slice(0,3).map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">#{t}</span>)}
                    </div>
                    <h3 className="font-black text-gray-900 truncate">{a.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-400">
                      <span>By {a.authorName}</span>
                      <span>{fmt(a.updatedAt)}</span>
                      <span className="flex items-center gap-1"><Eye size={9}/> {a.views}</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={9}/> {a.helpful}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleTogglePublish(a)} className={`text-[10px] px-2 py-1 rounded font-bold ${a.isPublished?"bg-green-100 text-green-700 hover:bg-green-200":"bg-gray-100 text-gray-600 hover:bg-gray-200"} transition`}>
                      {a.isPublished ? "Published" : "Draft"}
                    </button>
                    <button onClick={() => { setEditModal(a); setForm({ title:a.title, content:"", category:a.category, tags:(a.tags||[]).join(", "), isPublished:a.isPublished, isPinned:a.isPinned||false, changeNote:"" }); openDetail(a); setCreateModal(false); }} className="text-gray-400 hover:text-blue-600 transition"><Edit3 size={14}/></button>
                    <button onClick={() => handleDelete(a._id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14}/></button>
                    <ChevronRight size={14} className="text-gray-300"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-64 space-y-4 shrink-0">
          {/* Category stats */}
          {stats.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">By Category</p></div>
              <div className="divide-y">
                {stats.map(s => (
                  <div key={s._id} className="px-4 py-2 flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[s._id]||"bg-gray-100 text-gray-600"}`}>{s._id}</span>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-800">{s.count}</span>
                      <span className="text-[9px] text-gray-400 ml-1">· {s.totalViews} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Popular */}
          {popular.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Most Viewed</p></div>
              <div className="divide-y">
                {popular.map((a,i) => (
                  <button key={a._id} onClick={() => openDetail(a)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-start gap-2">
                    <span className="text-[10px] font-black text-gray-400 w-4 shrink-0">{i+1}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2">{a.title}</p>
                      <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5"><Eye size={8}/> {a.views}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Panel */}
      {detail && detailFull && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[detailFull.category]||"bg-gray-100 text-gray-600"}`}>{detailFull.category}</span>
                  {!detailFull.isPublished && <span className="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">Draft</span>}
                </div>
                <h2 className="text-xl font-black">{detailFull.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">By {detailFull.authorName} · Updated {fmt(detailFull.updatedAt)} · v{detailFull.version} · <Eye size={10} className="inline"/> {detailFull.views}</p>
              </div>
              <button onClick={() => { setDetail(null); setDetailFull(null); }} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Tags */}
              {detailFull.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailFull.tags.map(t => <span key={t} className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium"><Tag size={8}/> {t}</span>)}
                </div>
              )}
              {/* Content */}
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">{detailFull.content}</div>
              {/* Vote */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <p className="text-xs text-gray-400 font-semibold">Was this helpful?</p>
                <button onClick={() => handleVote(detailFull._id, true)} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded hover:bg-green-100 transition font-semibold">
                  <ThumbsUp size={12}/> Yes ({detailFull.helpful})
                </button>
                <button onClick={() => handleVote(detailFull._id, false)} className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100 transition font-semibold">
                  <ThumbsDown size={12}/> No ({detailFull.notHelpful})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(createModal || editModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">{editModal ? "Edit Article" : "New Article"}</h3>
              <button onClick={() => { setCreateModal(false); setEditModal(null); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <F label="Title *"><input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className={inp} required /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Category">
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className={inp}>
                    {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </F>
                <F label="Tags (comma separated)"><input type="text" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} className={inp} placeholder="setup, guide, react" /></F>
              </div>
              <F label="Content *">
                <textarea rows={12} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
                  className={`${inp} resize-none font-mono text-xs`}
                  placeholder="Write your article here. Supports plain text and markdown-style formatting..." required />
              </F>
              {editModal && <F label="Change Note (optional)"><input type="text" value={form.changeNote} onChange={e=>setForm(f=>({...f,changeNote:e.target.value}))} className={inp} placeholder="What changed in this version?" /></F>}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]"/>
                  Publish immediately
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.isPinned} onChange={e=>setForm(f=>({...f,isPinned:e.target.checked}))} className="w-4 h-4 accent-[#DD1215]"/>
                  Pin to top
                </label>
              </div>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setCreateModal(false); setEditModal(null); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Saving..." : editModal ? "Save Changes" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const F   = ({ label, children }) => (<div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>{children}</div>);

export default KnowledgeBase;
