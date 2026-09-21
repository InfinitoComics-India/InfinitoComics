import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { createEmployee, getEmployeeById, updateEmployee, getAllEmployees } from "../../services/hrServices";

const DEPARTMENTS   = ["Engineering", "Design", "Marketing", "HR", "Finance", "Operations", "Research", "Content", "Other"];
const EMP_TYPES     = ["full-time", "part-time", "intern", "contractor", "freelance"];
const HR_ROLES      = ["employee", "team_lead", "manager", "hr_manager", "finance", "superadmin"];
const GENDERS       = ["male", "female", "other", "prefer_not_to_say"];

const EMPTY = {
  firstName: "", lastName: "", email: "", phone: "",
  designation: "", department: "Engineering", employmentType: "full-time",
  hrRole: "employee", joiningDate: "", salaryGrade: "",
  dateOfBirth: "", gender: "", address: "",
  emergencyContact: { name: "", phone: "", relation: "" },
  skills: "", linkedIn: "", github: "",
  reportingManager: "",
};

const EmployeeForm = () => {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const isEdit        = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // Load employee data if editing
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Load all employees to populate manager dropdown
        const mgrRes = await getAllEmployees({ all: true });
        setManagers(mgrRes.data.data || []);

        if (isEdit) {
          const res = await getEmployeeById(id);
          const e = res.data.data;
          setForm({
            ...EMPTY, ...e,
            joiningDate: e.joiningDate ? e.joiningDate.split("T")[0] : "",
            dateOfBirth: e.dateOfBirth ? e.dateOfBirth.split("T")[0] : "",
            skills: (e.skills || []).join(", "),
            reportingManager: e.reportingManager?._id || e.reportingManager || "",
            emergencyContact: e.emergencyContact || { name: "", phone: "", relation: "" },
          });
        }
      } catch { setError("Failed to load data."); }
      finally { setLoading(false); }
    };
    init();
  }, [id]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setEC = (field, value) => setForm(prev => ({
    ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value }
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        reportingManager: form.reportingManager || undefined,
      };
      if (isEdit) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      navigate("/hr/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader size={32} className="animate-spin text-[#DD1215]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/hr/employees")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">
            {isEdit ? "EDIT EMPLOYEE" : "ADD EMPLOYEE"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEdit ? "Update employee information" : "Create a new team member record"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>
        )}

        {/* Section: Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name *" required>
              <input type="text" value={form.firstName} onChange={e => set("firstName", e.target.value)}
                className={inputCls} placeholder="Arpit" required />
            </Field>
            <Field label="Last Name *" required>
              <input type="text" value={form.lastName} onChange={e => set("lastName", e.target.value)}
                className={inputCls} placeholder="Sharma" required />
            </Field>
            <Field label="Email Address *">
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                className={inputCls} placeholder="arpit@infinitohq.com" required />
            </Field>
            <Field label="Phone Number">
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                className={inputCls} placeholder="+91 9876543210" />
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)}
                className={inputCls} placeholder="Mumbai, Maharashtra" />
            </Field>
          </div>
        </Section>

        {/* Section: Job Info */}
        <Section title="Job Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Designation *">
              <input type="text" value={form.designation} onChange={e => set("designation", e.target.value)}
                className={inputCls} placeholder="Frontend Developer" required />
            </Field>
            <Field label="Department *">
              <select value={form.department} onChange={e => set("department", e.target.value)} className={inputCls} required>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Employment Type *">
              <select value={form.employmentType} onChange={e => set("employmentType", e.target.value)} className={inputCls} required>
                {EMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="HR Role *">
              <select value={form.hrRole} onChange={e => set("hrRole", e.target.value)} className={inputCls} required>
                {HR_ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </Field>
            <Field label="Joining Date *">
              <input type="date" value={form.joiningDate} onChange={e => set("joiningDate", e.target.value)}
                className={inputCls} required />
            </Field>
            <Field label="Salary Grade">
              <input type="text" value={form.salaryGrade} onChange={e => set("salaryGrade", e.target.value)}
                className={inputCls} placeholder="L3 / Senior" />
            </Field>
            <Field label="Reporting Manager" className="sm:col-span-2">
              <select value={form.reportingManager} onChange={e => set("reportingManager", e.target.value)} className={inputCls}>
                <option value="">No manager</option>
                {managers
                  .filter(m => m._id !== id) // can't report to themselves
                  .map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} — {m.designation}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Section: Emergency Contact */}
        <Section title="Emergency Contact">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Name">
              <input type="text" value={form.emergencyContact.name}
                onChange={e => setEC("name", e.target.value)} className={inputCls} placeholder="Jane Doe" />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.emergencyContact.phone}
                onChange={e => setEC("phone", e.target.value)} className={inputCls} placeholder="+91 9876543210" />
            </Field>
            <Field label="Relation">
              <input type="text" value={form.emergencyContact.relation}
                onChange={e => setEC("relation", e.target.value)} className={inputCls} placeholder="Spouse / Parent" />
            </Field>
          </div>
        </Section>

        {/* Section: Skills & Links */}
        <Section title="Skills & Social Links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Skills (comma separated)" className="sm:col-span-2">
              <input type="text" value={form.skills} onChange={e => set("skills", e.target.value)}
                className={inputCls} placeholder="React, Node.js, MongoDB, Tailwind" />
            </Field>
            <Field label="LinkedIn URL">
              <input type="url" value={form.linkedIn} onChange={e => set("linkedIn", e.target.value)}
                className={inputCls} placeholder="https://linkedin.com/in/arpit" />
            </Field>
            <Field label="GitHub URL">
              <input type="url" value={form.github} onChange={e => set("github", e.target.value)}
                className={inputCls} placeholder="https://github.com/arpit" />
            </Field>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50">
            <Save size={14} />
            {saving ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
          </button>
          <button type="button" onClick={() => navigate("/hr/employees")}
            className="px-8 py-3 border border-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────
const inputCls = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";

const Section = ({ title, children }) => (
  <div className="bg-white border rounded-lg overflow-hidden">
    <div className="px-6 py-3 border-b bg-gray-50">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default EmployeeForm;
