import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  X,
  FileSpreadsheet,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { message, Popconfirm } from "antd";
import { BACKEND_URL } from "../../Utils/constant";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending", badge: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "contacted", label: "Contacted", badge: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "in-discussion", label: "In Discussion", badge: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "closed", label: "Closed", badge: "bg-emerald-100 text-emerald-800 border-emerald-300" },
];

export default function AdsInquiriesTable() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const authHeader = () => {
    const token = localStorage.getItem("authToken");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ads-inquiry/admin/all`, authHeader());
      if (res.data?.success) {
        setInquiries(res.data.data || []);
      } else {
        setInquiries([]);
      }
    } catch (err) {
      console.error("fetchInquiries error:", err);
      message.error("Failed to load ads inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update status handler
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/ads-inquiry/admin/${id}`,
        { status: newStatus },
        authHeader()
      );
      if (res.data?.success) {
        message.success("Status updated successfully");
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry?._id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/ads-inquiry/admin/${id}`,
        authHeader()
      );
      if (res.data?.success) {
        message.success("Inquiry deleted successfully");
        setInquiries((prev) => prev.filter((item) => item._id !== id));
        if (selectedInquiry?._id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete inquiry");
    }
  };

  // File download handlers
  const handleExportExcel = () => {
    window.open(`${BACKEND_URL}/api/ads-inquiry/admin/export/excel`, "_blank");
  };

  const handleExportCSV = () => {
    window.open(`${BACKEND_URL}/api/ads-inquiry/admin/export/csv`, "_blank");
  };

  // Filtering
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.companyName?.toLowerCase().includes(q) ||
        item.yourName?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.industry?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, selectedStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status === "pending").length;
    const discussion = inquiries.filter((i) => i.status === "in-discussion").length;
    const closed = inquiries.filter((i) => i.status === "closed").length;
    return { total, pending, discussion, closed };
  }, [inquiries]);

  const getStatusBadge = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.badge : "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-100 text-[#d01824] rounded-lg">
                <Sparkles size={20} />
              </span>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Brand Ads & Sponsorship Inquiries
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Review partnership applications, manage client leads, and export partner records
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-300 transition shadow-sm cursor-pointer"
              title="Download CSV"
            >
              <FileText size={15} className="text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
              title="Download Excel Spreadsheet"
            >
              <FileSpreadsheet size={15} />
              <span>Export Excel</span>
            </button>

            <button
              onClick={fetchInquiries}
              className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
              title="Reload list"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-red-600" : ""} />
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider">
              Total Inquiries
            </span>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-amber-700 tracking-wider">
              Pending Review
            </span>
            <p className="text-2xl font-black text-amber-800 mt-0.5">{stats.pending}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200/80 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-purple-700 tracking-wider">
              In Discussion
            </span>
            <p className="text-2xl font-black text-purple-800 mt-0.5">{stats.discussion}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-lg">
            <span className="text-[11px] font-semibold uppercase text-emerald-700 tracking-wider">
              Closed / Signed
            </span>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company, name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#d01824] transition bg-gray-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                selectedStatus === opt.value
                  ? "bg-[#d01824] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw size={32} className="animate-spin text-[#d01824] mx-auto mb-3" />
            <p className="text-sm">Loading advertising inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base font-semibold text-gray-600">No Inquiries Found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search filters or status"
                : "No brand inquiries have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Brand / Company</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq._id}
                    className="hover:bg-slate-50/70 transition cursor-pointer group"
                    onClick={() => setSelectedInquiry(inq)}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>
                          {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-[180px] truncate">
                      {inq.companyName}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {inq.yourName}
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`mailto:${inq.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-red-600 transition truncate max-w-[200px]"
                        >
                          <Mail size={12} className="text-gray-400 shrink-0" />
                          <span>{inq.email}</span>
                        </a>
                        <a
                          href={`tel:${inq.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-red-600 transition"
                        >
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{inq.phone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded text-[11px]">
                        {inq.industry || "General"}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inq.status}
                        disabled={updatingId === inq._id}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition capitalize ${getStatusBadge(
                          inq.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="in-discussion">In Discussion</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                          title="View Message"
                        >
                          <Eye size={16} />
                        </button>

                        <Popconfirm
                          title="Delete inquiry?"
                          description="Are you sure you want to delete this brand inquiry?"
                          onConfirm={() => handleDelete(inq._id)}
                          okText="Delete"
                          okType="danger"
                          cancelText="Cancel"
                        >
                          <button
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Slideout / Modal */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-[#120822] text-white p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-1">
                  Brand Inquiry Details
                </span>
                <h3 className="text-xl font-bold">{selectedInquiry.companyName}</h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Submitted by {selectedInquiry.yourName}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Email</span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="font-medium text-gray-800 hover:text-red-600"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phone</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-medium text-gray-800 hover:text-red-600"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Industry</span>
                  <span className="font-medium text-gray-800">
                    {selectedInquiry.industry || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Submission Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedInquiry.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold mb-1">
                  Brand Ideas / Campaign Message
                </span>
                <div className="bg-slate-50 border border-gray-200 p-4 rounded-xl text-gray-800 leading-relaxed text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status change in Modal */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer capitalize ${getStatusBadge(
                    selectedInquiry.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="in-discussion">In Discussion</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Infinito%20Comics%20Brand%20Partnership&body=Hi%20${selectedInquiry.yourName},`}
                className="bg-[#d01824] hover:bg-[#b0131d] text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Reply via Email
              </a>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}