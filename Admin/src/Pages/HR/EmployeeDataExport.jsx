import { useState, useEffect } from "react";
import { FileSpreadsheet, Download, CheckSquare, Square, Search, RefreshCw, Users } from "lucide-react";
import * as XLSX from "xlsx";
import { getAllEmployees } from "../../services/hrServices";

// ── Column definitions ─────────────────────────────────────

// Sheet 1 — Personal Information only (what the employee filled in My Profile → Personal section)
const SHEET1_COLS = [
  { key: "employeeId",    label: "Employee ID" },
  { key: "firstName",     label: "First Name" },
  { key: "lastName",      label: "Last Name" },
  { key: "email",         label: "Email" },
  { key: "phone",         label: "Phone Number" },
  { key: "dateOfBirth",   label: "Date of Birth" },
  { key: "gender",        label: "Gender" },
  { key: "fatherName",    label: "Father's Name" },
  { key: "motherName",    label: "Mother's Name" },
  { key: "addressLine1",  label: "Address Line 1" },
  { key: "addressLine2",  label: "Address Line 2" },
  { key: "city",          label: "City" },
  { key: "zipCode",       label: "ZIP / Postcode" },
  { key: "country",       label: "Country" },
];

// Sheet 2 — All details filled by the employee (Personal + Emergency Contact + Bank Details)
const SHEET2_COLS = [
  { key: "employeeId",    label: "Employee ID" },
  { key: "firstName",     label: "First Name" },
  { key: "lastName",      label: "Last Name" },
  { key: "email",         label: "Email" },
  { key: "phone",         label: "Phone Number" },
  { key: "dateOfBirth",   label: "Date of Birth" },
  { key: "gender",        label: "Gender" },
  { key: "fatherName",    label: "Father's Name" },
  { key: "motherName",    label: "Mother's Name" },
  { key: "addressLine1",  label: "Address Line 1" },
  { key: "addressLine2",  label: "Address Line 2" },
  { key: "city",          label: "City" },
  { key: "zipCode",       label: "ZIP / Postcode" },
  { key: "country",       label: "Country" },
  { key: "emergencyName", label: "Emergency Contact Name" },
  { key: "emergencyPhone",label: "Emergency Contact Phone" },
  { key: "emergencyRel",  label: "Emergency Contact Relation" },
  { key: "bankName",      label: "Bank Name" },
  { key: "accountHolder", label: "Account Holder Name" },
  { key: "accountNumber", label: "Account Number" },
  { key: "ifscCode",      label: "IFSC Code" },
  { key: "swiftCode",     label: "SWIFT / BIC Code" },
];

const fmt = (v) => {
  if (!v) return "";
  if (v instanceof Date) return v.toLocaleDateString("en-IN");
  if (typeof v === "string" && v.includes("T")) {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString("en-IN");
  }
  return v;
};

const flatten = (emp) => ({
  ...emp,
  dateOfBirth:    emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString("en-IN") : "",
  joiningDate:    emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN") : "",
  emergencyName:  emp.emergencyContact?.name || "",
  emergencyPhone: emp.emergencyContact?.phone || "",
  emergencyRel:   emp.emergencyContact?.relation || "",
});

// ── Component ──────────────────────────────────────────────
const EmployeeDataExport = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [selected,  setSelected]  = useState(new Set());
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("hr"); // "hr" | "profile"

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? employees.filter(e =>
            `${e.firstName} ${e.lastName} ${e.email} ${e.employeeId}`.toLowerCase().includes(q)
          )
        : employees
    );
  }, [search, employees]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllEmployees();
      setEmployees(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch { } finally { setLoading(false); }
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(e => e._id)));
  };

  const getSelectedEmployees = () =>
    selected.size === 0
      ? filtered.map(flatten)
      : filtered.filter(e => selected.has(e._id)).map(flatten);

  const downloadExcel = () => {
    const rows = getSelectedEmployees();
    const cols  = activeTab === "hr" ? SHEET1_COLS : SHEET2_COLS;
    const sheetName = activeTab === "hr" ? "Personal Information" : "All Employee Details";

    // Build worksheet data
    const header = cols.map(c => c.label);
    const data   = rows.map(emp => cols.map(c => fmt(emp[c.key])));

    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);

    // Column widths
    ws["!cols"] = cols.map(() => ({ wch: 22 }));

    // Style header row bold (basic)
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: "DD1215" } } };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const filename = `Infinito_Employees_${sheetName.replace(" ","_")}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const allChecked = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && selected.size < filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-28">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Employee Data Export</h1>
          <p className="text-gray-500 text-lg">Select employees and download as editable Excel sheet</p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("hr")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "hr" ? "bg-[#DD1215] text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            👤 Sheet 1 — Personal Information
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "profile" ? "bg-[#DD1215] text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            🏦 Sheet 2 — All Details (Personal + Bank)
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or ID..."
              className="text-sm flex-1 outline-none bg-transparent"
            />
          </div>

          <button onClick={load} className="p-2 rounded-lg border text-gray-500 hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Select info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            {selected.size > 0 ? (
              <span className="font-semibold text-gray-800">{selected.size} selected</span>
            ) : (
              <span>All {filtered.length} will be exported</span>
            )}
          </div>

          {/* Download button */}
          <button
            onClick={downloadExcel}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Download Excel {selected.size > 0 ? `(${selected.size})` : `(All ${filtered.length})`}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading employees…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No employees found</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left w-10">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-[#DD1215] transition">
                      {allChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#DD1215]" />
                      ) : someChecked ? (
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(emp => (
                  <tr
                    key={emp._id}
                    onClick={() => toggleOne(emp._id)}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      selected.has(emp._id) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      {selected.has(emp._id) ? (
                        <CheckSquare className="w-4 h-4 text-[#DD1215]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{emp.employeeId}</td>
                    <td className="px-4 py-3 text-gray-700">{emp.designation}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        emp.status === "active" ? "bg-green-100 text-green-700"
                        : emp.status === "terminated" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{emp.employmentType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}



      </div>
    </div>
  );
};

export default EmployeeDataExport;
