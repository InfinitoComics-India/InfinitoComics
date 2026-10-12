import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, UserPlus, ShieldCheck } from "lucide-react";
import { BACKEND_URL } from "../../Utils/constant";

const ROLE_OPTIONS = [
  { value: "superadmin",      label: "Super Admin",     desc: "Full access to everything" },
  { value: "comics_admin",    label: "Comics Admin",    desc: "Comics & Chapters" },
  { value: "character_admin", label: "Character Admin", desc: "Characters" },
  { value: "research_admin",  label: "Research Admin",  desc: "Research papers" },
  { value: "blog_admin",      label: "Blog Admin",      desc: "Blogs, FAQs, Timeline" },
  { value: "career_admin",    label: "Career Admin",    desc: "Career & Jobs" },
];

const ROLE_COLORS = {
  superadmin:      "bg-red-100 text-red-700",
  comics_admin:    "bg-blue-100 text-blue-700",
  character_admin: "bg-purple-100 text-purple-700",
  research_admin:  "bg-green-100 text-green-700",
  blog_admin:      "bg-yellow-100 text-yellow-700",
  career_admin:    "bg-orange-100 text-orange-700",
};

const EMPTY_FORM = { name: "", email: "", password: "", roles: [] };

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
    } catch {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleRole = (value) => {
    setForm((prev) => {
      const has = prev.roles.includes(value);
      if (has) return { ...prev, roles: prev.roles.filter((r) => r !== value) };
      if (prev.roles.length >= 4) {
        toast.error("Max 4 roles allowed");
        return prev;
      }
      return { ...prev, roles: [...prev.roles, value] };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email.endsWith("@infinitohq.com")) {
      toast.error("Email must be an @infinitohq.com address");
      return;
    }
    if (form.roles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    setLoading(true);
    try {
      // Send roles array; also set role = first role for backward compat
      const payload = { ...form, role: form.roles[0] };
      await axios.post(`${BACKEND_URL}/admin/create`, payload, authHeader());
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
    } catch {
      toast.error("Failed to delete admin");
    }
  };

  // Get display roles for an admin (supports both old and new format)
  const getAdminRoles = (admin) => {
    if (Array.isArray(admin.roles) && admin.roles.length > 0) return admin.roles;
    if (admin.role) return [admin.role];
    return [];
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
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); }}
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
          className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-8 space-y-5"
        >
          <h2 className="text-lg font-bold text-gray-700">Create New Admin</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" name="name" value={form.name} onChange={handleChange}
                placeholder="Rajan Sharma" required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(@infinitohq.com)</span>
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="name@infinitohq.com" required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Min 8 characters" required minLength={8}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Role checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles <span className="text-gray-400 font-normal">(select 1–4)</span>
              {form.roles.length > 0 && (
                <span className="ml-2 text-red-600 font-semibold">{form.roles.length}/4 selected</span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((r) => {
                const checked = form.roles.includes(r.value);
                return (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      checked ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRole(r.value)}
                      className="mt-0.5 accent-red-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold rounded-lg transition"
          >
            {loading ? "Creating…" : "Create Admin"}
          </button>
        </form>
      )}

      {/* Admins table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Roles</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">No admins found.</td>
              </tr>
            ) : (
              admins.map((admin) => {
                const adminRoles = getAdminRoles(admin);
                const isSuperAdmin = adminRoles.includes("superadmin");
                return (
                  <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{admin.name}</td>
                    <td className="px-5 py-3 text-gray-600">{admin.email}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {adminRoles.map((r) => (
                          <span key={r} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[r] || "bg-gray-100 text-gray-600"}`}>
                            {r.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!isSuperAdmin && (
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManagement;
