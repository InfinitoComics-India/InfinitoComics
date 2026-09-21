import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, Users, UserCheck, UserX, Filter } from "lucide-react";
import { getAllEmployees, changeEmployeeStatus, deleteEmployee } from "../../services/hrServices";

const DEPARTMENTS = ["All", "Engineering", "Design", "Marketing", "HR", "Finance", "Operations", "Research", "Content", "Other"];
const STATUS_COLORS = {
  active:     "bg-green-100 text-green-700",
  inactive:   "bg-gray-100 text-gray-600",
  on_leave:   "bg-yellow-100 text-yellow-700",
  terminated: "bg-red-100 text-red-700",
};
const ROLE_COLORS = {
  superadmin:  "bg-purple-100 text-purple-700",
  hr_manager:  "bg-blue-100 text-blue-700",
  manager:     "bg-indigo-100 text-indigo-700",
  team_lead:   "bg-cyan-100 text-cyan-700",
  employee:    "bg-gray-100 text-gray-600",
  finance:     "bg-orange-100 text-orange-700",
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [dept, setDept]             = useState("All");
  const [error, setError]           = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const load = async (params = {}) => {
    try {
      setLoading(true); setError("");
      const res = await getAllEmployees(params);
      setEmployees(res.data.data || []);
    } catch (e) {
      setError("Failed to load employees.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) load({ search: search.trim() });
    else load();
  };

  const handleDeptFilter = (d) => {
    setDept(d);
    if (d === "All") load();
    else load({ department: d });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await changeEmployeeStatus(id, newStatus);
      setEmployees(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch { setError("Failed to update status."); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await deleteEmployee(confirmDelete._id);
      setEmployees(prev => prev.filter(e => e._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch { setError("Failed to delete employee."); }
    finally { setDeleting(false); }
  };

  // Summary counts
  const counts = employees.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">EMPLOYEES</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage all InfinitoComics team members</p>
        </div>
        <button
          onClick={() => navigate("/hr/employees/new")}
          className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition"
        >
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",      value: employees.length, icon: Users,     color: "text-blue-600"  },
            { label: "Active",     value: counts.active || 0, icon: UserCheck, color: "text-green-600" },
            { label: "On Leave",   value: counts.on_leave || 0, icon: UserX,  color: "text-yellow-600"},
            { label: "Terminated", value: counts.terminated || 0, icon: UserX, color: "text-red-600"  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border rounded-lg px-5 py-4 flex items-center gap-4">
              <Icon size={28} className={color} />
              <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white border rounded-lg px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Search by name, email, designation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
              <Search size={14} />
            </button>
          </form>
          <div className="flex gap-2 flex-wrap">
            {DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => handleDeptFilter(d)}
                className={`px-3 py-1.5 text-xs font-semibold border transition ${
                  dept === d ? "bg-[#DD1215] text-white border-[#DD1215]" : "bg-white text-gray-600 border-gray-300 hover:border-red-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button onClick={() => { setSearch(""); setDept("All"); load(); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition">
            <RefreshCw size={13} /> Reset
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-b-2 border-[#DD1215] rounded-full" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No employees found.</p>
              <button onClick={() => navigate("/hr/employees/new")}
                className="mt-4 text-xs text-[#DD1215] font-bold uppercase hover:underline">
                Add your first employee →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["ID", "Name", "Designation", "Department", "Type", "Role", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{emp.employeeId}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#DD1215] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{emp.designation}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.department}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">{emp.employmentType}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[emp.hrRole] || "bg-gray-100 text-gray-600"}`}>
                          {emp.hrRole?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={emp.status}
                          onChange={e => handleStatusChange(emp._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COLORS[emp.status]}`}
                        >
                          {["active", "inactive", "on_leave", "terminated"].map(s => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button onClick={() => navigate(`/hr/employees/${emp._id}`)}
                            className="text-xs text-blue-600 hover:underline font-semibold">View</button>
                          <button onClick={() => navigate(`/hr/employees/${emp._id}/edit`)}
                            className="text-xs text-gray-600 hover:underline font-semibold">Edit</button>
                          <button onClick={() => setConfirmDelete(emp)}
                            className="text-xs text-red-500 hover:underline font-semibold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 mb-2">Delete Employee</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete{" "}
              <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
