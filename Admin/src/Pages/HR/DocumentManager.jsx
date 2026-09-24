import React, { useState, useEffect } from "react";
import { FileText, Plus, X, AlertTriangle, ExternalLink, Loader, RefreshCw, Download } from "lucide-react";
import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });

const CATEGORIES = ["offer_letter","nda","contract","certificate","id_proof","payslip","appraisal","warning","resignation","experience_letter","other"];
const STATUSES   = ["pending_signature","signed","active","expired","revoked"];

const STATUS_STYLE = {
  active:            "bg-green-100 text-green-700",
  signed:            "bg-blue-100 text-blue-700",
  pending_signature: "bg-yellow-100 text-yellow-700",
  expired:           "bg-red-100 text-red-600",
  revoked:           "bg-gray-100 text-gray-500",
};

const CAT_LABEL = (c) => c.replace(/_/g," ").replace(/\b\w/g, l => l.toUpperCase());
const fmt       = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const EMPTY_FORM = { employeeId:"", category:"offer_letter", title:"", fileName:"", fileUrl:"", mimeType:"application/pdf", status:"active", issueDate:"", expiryDate:"", notes:"" };

const DocumentManager = () => {
  const [tab,       setTab]       = useState("all");
  const [docs,      setDocs]      = useState([]);
  const [expiring,  setExpiring]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selEmp,    setSelEmp]    = useState("");
  const [empDocs,   setEmpDocs]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [uploadModal, setUploadModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [catFilter, setCatFilter] = useState("all");

  const loadAll = async () => {
    try { setLoading(true); setError("");
      const [dRes, eRes, empRes] = await Promise.all([
        axios.get(`${BASE}/hr/documents/all`, auth()),
        axios.get(`${BASE}/hr/documents/expiring`, { ...auth(), params:{ days:30 } }),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setDocs(dRes.data.data||[]);
      setExpiring(eRes.data.data||[]);
      setEmployees(empRes.data.data||[]);
    } catch { setError("Failed to load documents."); } finally { setLoading(false); }
  };

  const loadEmpDocs = async () => {
    if (!selEmp) return;
    try { setLoading(true);
      const res = await axios.get(`${BASE}/hr/documents/employee/${selEmp}`, auth());
      setEmpDocs(res.data.data||[]);
    } catch { setError("Failed to load."); } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (tab==="employee" && selEmp) loadEmpDocs(); }, [selEmp, tab]);

  const handleUpload = async () => {
    if (!form.employeeId || !form.fileName || !form.fileUrl) { setError("Employee, file name and URL are required."); return; }
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/documents/upload`, form, auth());
      setUploadModal(false); setForm(EMPTY_FORM);
      loadAll(); if (selEmp) loadEmpDocs();
    } catch (e) { setError(e.response?.data?.message||"Failed to upload."); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await axios.delete(`${BASE}/hr/documents/delete/${id}`, auth());
      setDocs(prev => prev.filter(d => d._id !== id));
      setEmpDocs(prev => prev.filter(d => d._id !== id));
    } catch { setError("Failed to delete."); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${BASE}/hr/documents/update/${id}`, { status }, auth());
      const update = docs => docs.map(d => d._id === id ? {...d, status} : d);
      setDocs(update); setEmpDocs(update);
    } catch { setError("Failed to update status."); }
  };

  const displayDocs = tab === "employee" ? empDocs : docs;
  const filtered    = catFilter === "all" ? displayDocs : displayDocs.filter(d => d.category === catFilter);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText size={22} className="text-[#DD1215]"/>
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">DOCUMENTS</h1>
            <p className="text-xs text-gray-400 mt-0.5">HR documents, contracts, and certificates</p>
          </div>
        </div>
        <button onClick={() => { setUploadModal(true); setError(""); }}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition">
          <Plus size={14}/> Upload Document
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Expiring soon banner */}
        {expiring.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-5 py-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-yellow-600 shrink-0"/>
            <p className="text-sm text-yellow-800 font-semibold">
              {expiring.length} document{expiring.length>1?"s":""} expiring within 30 days:
              {" "}{expiring.slice(0,3).map(d=>`${d.employeeId?.firstName} ${d.employeeId?.lastName} (${CAT_LABEL(d.category)})`).join(", ")}
              {expiring.length>3 && ` +${expiring.length-3} more`}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
            {[{key:"all",label:`All (${docs.length})`},{key:"employee",label:"By Employee"},{key:"expiring",label:`Expiring (${expiring.length})`}].map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
            ))}
          </div>
          {/* Category filter */}
          {tab !== "expiring" && (
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DD1215] bg-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL(c)}</option>)}
            </select>
          )}
        </div>

        {/* Employee selector (employee tab) */}
        {tab === "employee" && (
          <div className="bg-white border rounded-lg px-5 py-4">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Select Employee</label>
            <select value={selEmp} onChange={e => setSelEmp(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] min-w-[250px] bg-white">
              <option value="">Choose employee...</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
            </select>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* EXPIRING TAB */}
        {tab === "expiring" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b"><p className="text-xs font-bold uppercase tracking-widest text-gray-500">Expiring Within 30 Days</p></div>
            {expiring.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No documents expiring soon.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Employee","Category","Title","Expiry Date","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiring.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{d.employeeId?.firstName} {d.employeeId?.lastName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 capitalize">{CAT_LABEL(d.category)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{d.title || d.fileName}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-red-600 whitespace-nowrap">{fmt(d.expiryDate)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[d.status]}`}>{d.status}</span></td>
                        <td className="px-4 py-3"><a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"><ExternalLink size={11}/> Open</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ALL / EMPLOYEE TABS */}
        {tab !== "expiring" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={36} className="mx-auto mb-3 opacity-30"/>
                <p className="font-semibold">No documents found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Employee","Category","Title / File","Version","Issue Date","Expiry","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(d => {
                      const emp = d.employeeId;
                      return (
                        <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            {emp ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-[10px] font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                                <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{emp.firstName} {emp.lastName}</span>
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 capitalize whitespace-nowrap">{CAT_LABEL(d.category)}</td>
                          <td className="px-4 py-3 text-xs text-gray-700 max-w-[180px] truncate">{d.title || d.fileName}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">v{d.version}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(d.issueDate)}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {d.expiryDate ? (
                              <span className={new Date(d.expiryDate) < new Date() ? "text-red-600 font-semibold" : "text-gray-500"}>{fmt(d.expiryDate)}</span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select value={d.status} onChange={e => handleStatusChange(d._id, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer ${STATUS_STYLE[d.status]}`}>
                              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <a href={d.fileUrl} target="_blank" rel="noreferrer"
                                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"><ExternalLink size={11}/> Open</a>
                              <button onClick={() => handleDelete(d._id)} className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black uppercase tracking-widest">Upload Document</h3>
              <button onClick={() => { setUploadModal(false); setError(""); }} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <F label="Employee *">
                <select value={form.employeeId} onChange={e => setForm(f=>({...f,employeeId:e.target.value}))} className={inp} required>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Category *">
                  <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL(c)}</option>)}
                  </select>
                </F>
                <F label="Status">
                  <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} className={inp}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                  </select>
                </F>
              </div>
              <F label="Display Title"><input type="text" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className={inp} placeholder="Offer Letter — Arpit Singh" /></F>
              <F label="File Name *"><input type="text" value={form.fileName} onChange={e=>setForm(f=>({...f,fileName:e.target.value}))} className={inp} placeholder="offer_letter_arpit.pdf" required /></F>
              <F label="File URL (S3) *">
                <input type="url" value={form.fileUrl} onChange={e=>setForm(f=>({...f,fileUrl:e.target.value}))} className={inp} placeholder="https://s3.amazonaws.com/..." required />
                <p className="text-[10px] text-gray-400 mt-1">Upload file to AWS S3 first, then paste the URL here.</p>
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Issue Date"><input type="date" value={form.issueDate} onChange={e=>setForm(f=>({...f,issueDate:e.target.value}))} className={inp}/></F>
                <F label="Expiry Date"><input type="date" value={form.expiryDate} onChange={e=>setForm(f=>({...f,expiryDate:e.target.value}))} className={inp}/></F>
              </div>
              <F label="Notes"><input type="text" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} className={inp} placeholder="Optional notes..." /></F>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setUploadModal(false); setError(""); }} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleUpload} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Uploading..." : "Upload Document"}
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

export default DocumentManager;
