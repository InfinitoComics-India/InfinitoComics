import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, RefreshCw, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { getAuditLogs } from "../../services/hrServices";

const ENTITIES = ["", "Employee", "Task", "Leave", "Payroll", "Attendance", "Goal", "Document", "Notification"];
const ACTIONS  = ["", "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT",
                  "ASSIGN", "UNASSIGN", "UPLOAD", "DOWNLOAD", "STATUS_CHANGE", "ROLE_CHANGE"];

const ACTION_COLORS = {
  CREATE:        "bg-green-100 text-green-700",
  UPDATE:        "bg-blue-100 text-blue-700",
  DELETE:        "bg-red-100 text-red-700",
  LOGIN:         "bg-purple-100 text-purple-700",
  LOGOUT:        "bg-gray-100 text-gray-600",
  APPROVE:       "bg-emerald-100 text-emerald-700",
  REJECT:        "bg-orange-100 text-orange-700",
  ASSIGN:        "bg-cyan-100 text-cyan-700",
  UNASSIGN:      "bg-yellow-100 text-yellow-700",
  STATUS_CHANGE: "bg-indigo-100 text-indigo-700",
  ROLE_CHANGE:   "bg-pink-100 text-pink-700",
  UPLOAD:        "bg-teal-100 text-teal-700",
  DOWNLOAD:      "bg-sky-100 text-sky-700",
};

const AuditLogPage = () => {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(null);

  // Filters
  const [entity,     setEntity]     = useState("");
  const [action,     setAction]     = useState("");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const LIMIT = 25;

  const load = async (overrides = {}) => {
    try {
      setLoading(true); setError("");
      const params = {
        entity:    overrides.entity    ?? entity,
        action:    overrides.action    ?? action,
        startDate: overrides.startDate ?? startDate,
        endDate:   overrides.endDate   ?? endDate,
        page:      overrides.page      ?? page,
        limit:     LIMIT,
      };
      // Remove empty strings
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

      const res = await getAuditLogs(params);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch { setError("Failed to load audit logs."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    load({ page: 1 });
  };

  const handleReset = () => {
    setEntity(""); setAction(""); setStartDate(""); setEndDate(""); setPage(1);
    load({ entity: "", action: "", startDate: "", endDate: "", page: 1 });
  };

  const handlePage = (p) => {
    setPage(p);
    load({ page: p });
  };

  const fmt = (d) => d
    ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <ShieldCheck size={22} className="text-[#DD1215]" />
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">AUDIT LOG</h1>
          <p className="text-xs text-gray-400 mt-0.5">Complete record of all admin actions — read only, append only</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Filters */}
        <form onSubmit={handleFilter}
          className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Entity</label>
            <select value={entity} onChange={e => setEntity(e.target.value)} className={selectCls}>
              {ENTITIES.map(e => <option key={e} value={e}>{e || "All Entities"}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Action</label>
            <select value={action} onChange={e => setAction(e.target.value)} className={selectCls}>
              {ACTIONS.map(a => <option key={a} value={a}>{a || "All Actions"}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={selectCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={selectCls} />
          </div>
          <button type="submit"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
            <Search size={13} /> Filter
          </button>
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 text-xs text-gray-500 border border-gray-300 px-3 py-2 hover:bg-gray-50 transition">
            <RefreshCw size={13} /> Reset
          </button>
        </form>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={13} className="text-gray-400" />
          Showing {logs.length} of {total} total log entries
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader size={28} className="animate-spin text-[#DD1215]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No audit logs found for these filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Time", "Performed By", "Action", "Entity", "Record", "Description", "Details"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => (
                    <React.Fragment key={log._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(log.createdAt)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {log.performedByName || "System"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-mono">{log.entity}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{log.entityLabel || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{log.description || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {(log.oldValue || log.newValue) && (
                            <button
                              onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                              className="text-xs text-blue-600 hover:underline font-semibold">
                              {expanded === log._id ? "Hide" : "Show"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {/* Expanded diff row */}
                      {expanded === log._id && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {log.oldValue && (
                                <div>
                                  <p className="text-xs font-bold uppercase text-red-500 mb-2">Before</p>
                                  <pre className="text-xs bg-red-50 border border-red-100 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                                    {JSON.stringify(log.oldValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValue && (
                                <div>
                                  <p className="text-xs font-bold uppercase text-green-600 mb-2">After</p>
                                  <pre className="text-xs bg-green-50 border border-green-100 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                                    {JSON.stringify(log.newValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePage(page - 1)} disabled={page <= 1}
                className="flex items-center gap-1 text-xs border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronLeft size={13} /> Prev
              </button>
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages}
                className="flex items-center gap-1 text-xs border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const selectCls = "border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white min-w-[140px]";

export default AuditLogPage;
