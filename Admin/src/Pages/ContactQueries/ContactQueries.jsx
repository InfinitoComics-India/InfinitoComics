import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Mail, Trash2, RefreshCw, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchContactQueries,
  updateQueryStatus,
  deleteContactQuery,
} from "../../services/contactQueryService";

const TOPICS = [
  "All Topics",
  "Hiring",
  "Infinito Ultimate",
  "Request a Callback",
  "Internships",
  "Application Status",
  "Feedback or Suggestion",
  "Technical Issues",
  "Issue Not Listed",
  "Other",
];

const STATUSES = ["all", "new", "in-progress", "resolved"];

const STATUS_STYLES = {
  new:           "bg-blue-100 text-blue-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  resolved:      "bg-green-100 text-green-700",
};

const LIMIT = 10;

/* ── Detail Popup Modal ─────────────────────────────────────── */
const DetailModal = ({ query, onClose }) => {
  if (!query) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{query.email}</p>
            <p className="text-xs text-gray-400">
              {new Date(query.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Topic */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Topic</p>
          <span className="inline-block bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-sm">
            {query.topic}
          </span>
        </div>

        {/* Status */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[query.status]}`}>
            {query.status}
          </span>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</p>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
            {query.details || "No additional details provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
const ContactQueries = () => {
  const [queries, setQueries]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [topicFilter, setTopic]     = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);
  const [selectedQuery, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchContactQueries({
        topic:  topicFilter,
        status: statusFilter,
        page,
        limit:  LIMIT,
      });
      if (res.data.success) {
        setQueries(res.data.data);
        setTotal(res.data.total);
      }
    } catch {
      toast.error("Failed to load contact queries.");
    } finally {
      setLoading(false);
    }
  }, [topicFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (e, id) => {
    e.stopPropagation();
    try {
      await updateQueryStatus(id, e.target.value);
      toast.success("Status updated.");
      load();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this query?")) return;
    try {
      await deleteContactQuery(id);
      toast.info("Query deleted.");
      if (selectedQuery?._id === id) setSelected(null);
      load();
    } catch {
      toast.error("Failed to delete query.");
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-28">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Contact Queries</h1>
          <p className="text-gray-500 text-lg">Monitor and manage all contact form submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Filter</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Topic</label>
            <select
              value={topicFilter}
              onChange={(e) => { setTopic(e.target.value === "All Topics" ? "" : e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t === "All Topics" ? "" : t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatus(e.target.value === "all" ? "" : e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 bg-white capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s === "all" ? "" : s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { setTopic(""); setStatus(""); setPage(1); }}
            className="ml-auto text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Stats + Pagination bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{queries.length}</span> of{" "}
            <span className="font-semibold text-gray-800">{total}</span> submissions
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? "bg-red-600 text-white"
                      : "border text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">Loading…</div>
        ) : queries.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg font-medium">No queries found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Topic</th>
                  <th className="px-5 py-3 text-left">Details</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queries.map((q, idx) => (
                  <tr
                    key={q._id}
                    onClick={() => setSelected(q)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800 max-w-[170px] truncate">
                      {q.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs whitespace-nowrap">
                        {q.topic}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 max-w-[200px]">
                      <span className="block truncate text-xs">
                        {q.details ? (q.details.length > 50 ? q.details.slice(0, 50) + "…" : q.details) : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(e, q._id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-0 focus:outline-none cursor-pointer capitalize ${STATUS_STYLES[q.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(q.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(e, q._id)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom pagination (repeat for convenience) */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  p === page ? "bg-red-600 text-white" : "border text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      <DetailModal query={selectedQuery} onClose={() => setSelected(null)} />

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </div>
  );
};

export default ContactQueries;
