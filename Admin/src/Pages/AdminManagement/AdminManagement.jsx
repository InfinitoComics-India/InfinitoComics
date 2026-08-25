import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, UserPlus, ShieldCheck } from "lucide-react";
import { BACKEND_URL } from "../../Utils/constant";

const ROLES = [
  { value: "superadmin",      label: "Super Admin — Full access" },
  { value: "comics_admin",    label: "Comics Admin — Comics & Chapters" },
  { value: "character_admin", label: "Character Admin — Characters" },
  { value: "research_admin",  label: "Research Admin — Research papers" },
  { value: "blog_admin",      label: "Blog Admin — Blogs, FAQs, Timeline" },
  { value: "career_admin",    label: "Career Admin — Career & Jobs" },
];

const ROLE_COLORS = {
  superadmin:      "bg-red-100 text-red-700",
  comics_admin:    "bg-blue-100 text-blue-700",
  character_admin: "bg-purple-100 text-purple-700",
  research_admin:  "bg-green-100 text-green-700",
  blog_admin:      "bg-yellow-100 text-yellow-700",
  career_admin:    "bg-orange-100 text-orange-700",
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "" };

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/admin/all`, authHeader());
      setAdmins(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();

    // Enforce @infinitohq.com domain on frontend too
    if (!form.email.endsWith("@infinitohq.com")) {
      toast.error("Email must be an @infinitohq.com address");
      return;
    }
    if (!form.role) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/admin/create`, form, authHeader());
      toast.success(`Admin "${form.name}" created successfully`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/admin/${id}`, authHeader());
      toast.success(`Admin "${name}" deleted`);
      fetchAdmins();
    } catch (err) {
      toast.error("Failed to delete admin");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto mt-20 text-black">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={32} className="text-red-600" />
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
        >
          <UserPlus size={18} />
          {showForm ? "Cancel" : "Add New Admin"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-700 mb-2">Create New Admin</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rajan Sharma"
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(@infinitohq.com only)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@infinitohq.com"
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none bg-white"
              >
                <option value="">Select a role…</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Creating…" : "Create Admin"}
          </button>
        </form>
      )}

      {/* Admins list */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{admin.name}</td>
                  <td className="px-5 py-3 text-gray-600">{admin.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[admin.role] || "bg-gray-100 text-gray-600"}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {/* Prevent deleting yourself */}
                    {admin.role !== "superadmin" && (
                      <button
                        onClick={() => handleDelete(admin._id, admin.name)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete admin"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManagement;
