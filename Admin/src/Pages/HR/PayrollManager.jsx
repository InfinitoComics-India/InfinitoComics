import React, { useState, useEffect } from "react";
import { IndianRupee, Plus, RefreshCw, ChevronLeft, ChevronRight, Loader, CheckCircle, Clock, AlertCircle, X, Pencil, Download, CheckSquare, DollarSign, FileText } from "lucide-react";
import axios from "axios";

const BASE   = import.meta.env.VITE_BASE_URL;
const auth   = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const INR    = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;

const STATUS_STYLE = {
  draft:    { bg:"bg-yellow-100", text:"text-yellow-700", icon: Clock },
  approved: { bg:"bg-blue-100",   text:"text-blue-700",   icon: CheckCircle },
  paid:     { bg:"bg-green-100",  text:"text-green-700",  icon: CheckCircle },
};

const SALARY_FIELDS = [
  { key:"basic",           label:"Basic Salary"       },
  { key:"hra",             label:"HRA"                },
  { key:"ta",              label:"Travel Allowance"   },
  { key:"medical",         label:"Medical Allowance"  },
  { key:"special",         label:"Special Allowance"  },
  { key:"otherAllowances", label:"Other Allowances"   },
  { key:"pf",              label:"PF (Deduction)"     },
  { key:"esic",            label:"ESIC (Deduction)"   },
  { key:"tds",             label:"TDS (Deduction)"    },
  { key:"otherDeductions", label:"Other Deductions"   },
];

const EMPTY_SALARY = { basic:0, hra:0, ta:0, medical:0, special:0, otherAllowances:0, pf:0, esic:0, tds:0, otherDeductions:0, bankName:"", accountNumber:"", ifscCode:"", accountHolder:"", payDay:1, effectiveFrom:"" };

const PayrollManager = () => {
  const now = new Date();
  const [tab,    setTab]    = useState("payroll");
  const [month,  setMonth]  = useState(now.getMonth() + 1);
  const [year,   setYear]   = useState(now.getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [summary,  setSummary]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaries,  setSalaries]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [slipModal, setSlipModal] = useState(null);
  const [salaryModal, setSalaryModal] = useState(null);
  const [salaryForm,  setSalaryForm]  = useState(EMPTY_SALARY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selected, setSelected] = useState(new Set()); // selected payslip IDs
  const [remarks, setRemarks] = useState("");

  const loadPayroll = async () => {
    try { setLoading(true); setError("");
      const [pRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/payroll/period`, { ...auth(), params: { month, year } }),
        axios.get(`${BASE}/hr/payroll/summary`, { ...auth(), params: { month, year } }),
      ]);
      setPayslips(pRes.data.data || []);
      setSummary(sRes.data.data || []);
      setSelected(new Set());
    } catch { setError("Failed to load payroll."); } finally { setLoading(false); }
  };

  const loadSalaries = async () => {
    try { setLoading(true); setError("");
      const [sRes, empRes] = await Promise.all([
        axios.get(`${BASE}/hr/salary/getall`, auth()),
        axios.get(`${BASE}/hr/employees/getall`, auth()),
      ]);
      setSalaries(sRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch { setError("Failed to load salaries."); } finally { setLoading(false); }
  };

  useEffect(() => { if (tab === "payroll") loadPayroll(); else loadSalaries(); }, [tab, month, year]);

  const handleGenerateAll = async () => {
    if (employees.length === 0) { await loadSalaries(); }
    const ids = employees.map(e => e._id);
    if (!ids.length) { setError("No employees found."); return; }
    try { setGenerating(true); setError("");
      await axios.post(`${BASE}/hr/payroll/generate-all`, { month, year, employeeIds: ids }, auth());
      setSuccess("Payslips generated successfully!");
      loadPayroll();
    } catch (e) { setError(e.response?.data?.message || "Failed to generate."); }
    finally { setGenerating(false); }
  };

  const handleGenerateOne = async (empId, empName) => {
    try { setGenerating(true); setError("");
      await axios.post(`${BASE}/hr/payroll/generate/${empId}`, { month, year }, auth());
      setSuccess(`Payslip generated for ${empName}!`);
      loadPayroll();
    } catch (e) { setError(e.response?.data?.message || "Failed to generate."); }
    finally { setGenerating(false); }
  };

  const handleAction = async (slipId, action) => {
    try {
      await axios.patch(`${BASE}/hr/payroll/${action}/${slipId}`, {}, auth());
      setSuccess(`Payslip ${action === "approve" ? "approved" : "marked as paid"}!`);
      loadPayroll();
      if (slipModal?._id === slipId) setSlipModal(null);
    } catch (e) { setError(e.response?.data?.message || `Failed to ${action}.`); }
  };

  // Bulk approve all drafts
  const handleBulkApprove = async () => {
    const drafts = payslips.filter(s => s.status === "draft" && (selected.size === 0 || selected.has(s._id)));
    if (!drafts.length) { setError("No draft payslips to approve."); return; }
    try { setBulkLoading(true); setError("");
      await Promise.all(drafts.map(s => axios.patch(`${BASE}/hr/payroll/approve/${s._id}`, {}, auth())));
      setSuccess(`${drafts.length} payslip(s) approved!`);
      loadPayroll();
    } catch (e) { setError("Bulk approve failed."); }
    finally { setBulkLoading(false); }
  };

  // Bulk mark paid all approved
  const handleBulkMarkPaid = async () => {
    const approved = payslips.filter(s => s.status === "approved" && (selected.size === 0 || selected.has(s._id)));
    if (!approved.length) { setError("No approved payslips to mark as paid."); return; }
    try { setBulkLoading(true); setError("");
      await Promise.all(approved.map(s => axios.patch(`${BASE}/hr/payroll/paid/${s._id}`, {}, auth())));
      setSuccess(`${approved.length} payslip(s) marked as paid!`);
      loadPayroll();
    } catch (e) { setError("Bulk mark paid failed."); }
    finally { setBulkLoading(false); }
  };

  const openSalaryModal = async (emp) => {
    try {
      const res = await axios.get(`${BASE}/hr/salary/employee/${emp._id}`, auth());
      setSalaryForm({ ...EMPTY_SALARY, ...(res.data.data || {}) });
    } catch { setSalaryForm(EMPTY_SALARY); }
    setSalaryModal(emp);
  };

  const handleSaveSalary = async () => {
    try { setSaving(true); setError("");
      await axios.post(`${BASE}/hr/salary/set/${salaryModal._id}`, salaryForm, auth());
      setSuccess("Salary structure saved!");
      setSalaryModal(null); loadSalaries();
    } catch (e) { setError(e.response?.data?.message || "Failed to save salary."); }
    finally { setSaving(false); }
  };

  // Download payslip as PDF (HTML print)
  const downloadPayslip = (slip) => {
    const emp = slip.employeeId;
    const html = `<!DOCTYPE html>
<html><head><title>Payslip - ${MONTHS[slip.month-1]} ${slip.year}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:0;color:#111}
  .header{background:#DD1215;color:white;padding:20px 30px;display:flex;justify-content:space-between;align-items:center}
  .header h1{margin:0;font-size:22px;letter-spacing:2px}
  .header p{margin:0;font-size:11px;opacity:0.8}
  .body{padding:24px 30px}
  .emp-block{display:flex;justify-content:space-between;margin-bottom:20px;background:#f9f9f9;padding:16px;border-radius:8px}
  .emp-block div p{margin:2px 0;font-size:12px}
  .emp-block div .name{font-size:16px;font-weight:bold}
  .section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px;margin-top:16px}
  .att-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .att-box{background:#f3f3f3;border-radius:6px;padding:10px;text-align:center}
  .att-box .val{font-size:20px;font-weight:900}
  .att-box .lbl{font-size:9px;text-transform:uppercase;color:#888;margin-top:2px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  td{padding:7px 10px;border-bottom:1px solid #f0f0f0}
  .bold-row td{font-weight:bold;border-top:2px solid #ddd;font-size:13px}
  .net-box{background:#e8f5e9;border:2px solid #4caf50;border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
  .net-box .label{font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#2e7d32}
  .net-box .amount{font-size:22px;font-weight:900;color:#2e7d32}
  .status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:bold;text-transform:uppercase;background:${slip.status==="paid"?"#dcfce7":slip.status==="approved"?"#dbeafe":"#fef9c3"};color:${slip.status==="paid"?"#166534":slip.status==="approved"?"#1e40af":"#854d0e"}}
  .footer{margin-top:30px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
  <div class="header">
    <div><h1>INFINITO COMICS</h1><p>Miraya Corporation Pvt. Ltd.</p></div>
    <div style="text-align:right"><p style="font-size:16px;font-weight:bold;margin:0">PAYSLIP</p><p>${MONTHS[slip.month-1]} ${slip.year}</p></div>
  </div>
  <div class="body">
    <div class="emp-block">
      <div>
        <p class="name">${emp?.firstName||""} ${emp?.lastName||""}</p>
        <p>${emp?.designation||""} · ${emp?.department||""}</p>
        <p>Emp ID: ${emp?.employeeId||"—"}</p>
      </div>
      <div style="text-align:right">
        <p><strong>Pay Period:</strong> ${MONTHS[slip.month-1]} ${slip.year}</p>
        <p><strong>Status:</strong> <span class="status-badge">${slip.status}</span></p>
        ${slip.paidAt?`<p><strong>Paid On:</strong> ${new Date(slip.paidAt).toLocaleDateString("en-IN")}</p>`:""}
      </div>
    </div>
    <div class="section-title">Attendance Summary</div>
    <div class="att-grid">
      <div class="att-box"><div class="val">${slip.workingDays}</div><div class="lbl">Working Days</div></div>
      <div class="att-box"><div class="val">${slip.presentDays}</div><div class="lbl">Present</div></div>
      <div class="att-box"><div class="val">${slip.absentDays}</div><div class="lbl">Absent</div></div>
      <div class="att-box"><div class="val">${slip.leaveDays}</div><div class="lbl">On Leave</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div>
        <div class="section-title">Earnings</div>
        <table>${[["Basic Salary",slip.basic],["HRA",slip.hra],["Travel Allowance",slip.ta],["Medical Allowance",slip.medical],["Special Allowance",slip.special],["Other Allowances",slip.otherAllowances]].filter(([,v])=>v>0).map(([l,v])=>`<tr><td>${l}</td><td style="text-align:right">₹${Number(v||0).toLocaleString("en-IN")}</td></tr>`).join("")}
        <tr class="bold-row"><td>Gross Salary</td><td style="text-align:right">₹${Number(slip.grossSalary||0).toLocaleString("en-IN")}</td></tr></table>
      </div>
      <div>
        <div class="section-title">Deductions</div>
        <table>${[["Provident Fund",slip.pf],["ESIC",slip.esic],["TDS",slip.tds],["Other Deductions",slip.otherDeductions],["Loss of Pay",slip.lossOfPay]].filter(([,v])=>v>0).map(([l,v])=>`<tr><td>${l}</td><td style="text-align:right;color:#dc2626">- ₹${Number(v||0).toLocaleString("en-IN")}</td></tr>`).join("")}
        <tr class="bold-row"><td>Total Deductions</td><td style="text-align:right;color:#dc2626">- ₹${Number(slip.totalDeductions||0).toLocaleString("en-IN")}</td></tr></table>
      </div>
    </div>
    <div class="net-box">
      <span class="label">Net Salary Payable</span>
      <span class="amount">₹${Number(slip.netSalary||0).toLocaleString("en-IN")}</span>
    </div>
    <div class="footer">This is a computer generated payslip and does not require a signature. · InfinitoComics India · career@infinitohq.com</div>
  </div>
  <script>window.onload=()=>window.print();</script>
</body></html>`;
    const blob = new Blob([html], {type:"text/html"});
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const selectAll = () => {
    if (selected.size === payslips.length) setSelected(new Set());
    else setSelected(new Set(payslips.map(s=>s._id)));
  };

  const summaryMap = {};
  summary.forEach(s => { summaryMap[s._id] = s; });
  const totalNet   = Object.values(summaryMap).reduce((s, v) => s + (v.totalNet || 0), 0);
  const totalPaid  = summaryMap.paid?.count || 0;
  const totalCount = payslips.length;
  const draftCount = payslips.filter(s=>s.status==="draft").length;
  const approvedCount = payslips.filter(s=>s.status==="approved").length;

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IndianRupee size={22} className="text-[#DD1215]" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-gray-900">PAYROLL</h1>
            <p className="text-xs text-gray-400 mt-0.5">Salary structures and monthly payslips</p>
          </div>
        </div>
        {tab === "payroll" && (
          <div className="flex items-center gap-2">
            {/* Bulk approve */}
            {draftCount > 0 && (
              <button onClick={handleBulkApprove} disabled={bulkLoading}
                className="flex items-center gap-1.5 border border-blue-500 text-blue-700 px-3 py-2 text-xs font-bold uppercase hover:bg-blue-50 transition disabled:opacity-50">
                <CheckSquare size={13}/> Approve All ({draftCount})
              </button>
            )}
            {/* Bulk mark paid */}
            {approvedCount > 0 && (
              <button onClick={handleBulkMarkPaid} disabled={bulkLoading}
                className="flex items-center gap-1.5 border border-green-500 text-green-700 px-3 py-2 text-xs font-bold uppercase hover:bg-green-50 transition disabled:opacity-50">
                <DollarSign size={13}/> Mark Paid ({approvedCount})
              </button>
            )}
            <button onClick={handleGenerateAll} disabled={generating}
              className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50">
              {generating ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
              {generating ? "Generating..." : "Generate All"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{ key:"payroll",label:"Monthly Payroll" }, { key:"salary",label:"Salary Structures" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center justify-between">{error}<button onClick={()=>setError("")}>✕</button></div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded flex items-center justify-between">{success}<button onClick={()=>setSuccess("")}>✕</button></div>}

        {/* PAYROLL TAB */}
        {tab === "payroll" && (
          <>
            {/* Month/Year controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Month</label>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className={inp}>
                  {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
                <div className="flex items-center gap-1">
                  <button onClick={() => setYear(y => y-1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronLeft size={13}/></button>
                  <span className="text-sm font-bold px-2">{year}</span>
                  <button onClick={() => setYear(y => y+1)} className="border border-gray-300 p-2 hover:bg-gray-50 transition"><ChevronRight size={13}/></button>
                </div>
              </div>
              <button onClick={loadPayroll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 border border-gray-300 px-3 py-2 transition mt-4"><RefreshCw size={12}/></button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label:"Total",    value: totalCount,               color:"text-gray-900" },
                { label:"Draft",    value: draftCount,               color:"text-yellow-700" },
                { label:"Approved", value: approvedCount,            color:"text-blue-700" },
                { label:"Paid",     value: totalPaid,                color:"text-green-700" },
                { label:"Total Net",value: INR(totalNet),            color:"text-gray-900" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border rounded-lg px-4 py-3">
                  <p className={`text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Payslip table */}
            <div className="bg-white border rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
              ) : payslips.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <IndianRupee size={36} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-semibold">No payslips for {MONTHS[month-1]} {year}.</p>
                  <button onClick={handleGenerateAll} disabled={generating} className="mt-3 text-xs text-[#DD1215] font-bold hover:underline">
                    {generating ? "Generating..." : "Generate now →"}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3">
                          <input type="checkbox" checked={selected.size===payslips.length&&payslips.length>0} onChange={selectAll} className="accent-[#DD1215]"/>
                        </th>
                        {["Employee","Dept","Gross","Deductions","LOP","Net Pay","Days","Status","Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payslips.map(slip => {
                        const emp = slip.employeeId;
                        const s   = STATUS_STYLE[slip.status] || STATUS_STYLE.draft;
                        const SI  = s.icon;
                        const isSel = selected.has(slip._id);
                        return (
                          <tr key={slip._id} className={`hover:bg-gray-50 transition-colors ${isSel?"bg-blue-50/30":""}`}>
                            <td className="px-3 py-3 text-center">
                              <input type="checkbox" checked={isSel} onChange={()=>toggleSelect(slip._id)} className="accent-[#DD1215]"/>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{emp?.firstName?.[0]}{emp?.lastName?.[0]}</div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-xs">{emp?.firstName} {emp?.lastName}</p>
                                  <p className="text-[10px] text-gray-400">{emp?.designation}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{emp?.department}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">{INR(slip.grossSalary)}</td>
                            <td className="px-4 py-3 text-xs text-red-600 whitespace-nowrap">{INR(slip.totalDeductions)}</td>
                            <td className="px-4 py-3 text-xs text-orange-600 whitespace-nowrap">{INR(slip.lossOfPay)}</td>
                            <td className="px-4 py-3 text-xs font-black text-green-700 whitespace-nowrap">{INR(slip.netSalary)}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{slip.presentDays}/{slip.workingDays}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${s.bg} ${s.text}`}>
                                <SI size={10}/> {slip.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => setSlipModal(slip)} className="text-xs text-blue-600 hover:underline font-semibold">View</button>
                                <button onClick={() => downloadPayslip(slip)} title="Download PDF" className="text-gray-400 hover:text-gray-700"><Download size={13}/></button>
                                {slip.status === "draft"    && <button onClick={() => handleAction(slip._id,"approve")} className="text-xs text-green-600 hover:underline font-semibold">Approve</button>}
                                {slip.status === "approved" && <button onClick={() => handleAction(slip._id,"paid")}   className="text-xs text-[#DD1215] hover:underline font-semibold">Paid</button>}
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
          </>
        )}

        {/* SALARY TAB */}
        {tab === "salary" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">All Employee Salary Structures</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{employees.length} employees · {salaries.length} structures set</span>
                <button onClick={loadSalaries} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/></button>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Employee","Designation","Dept","Basic","HRA","PF","Gross","Net","Bank","Pay Day","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map(emp => {
                      const sal = salaries.find(s => s.employeeId?._id === emp._id || s.employeeId === emp._id);
                      return (
                        <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                              <div>
                                <p className="font-semibold text-gray-900 text-xs">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-gray-400">{emp.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{emp.designation}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{emp.department}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">{sal ? INR(sal.basic) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{sal ? INR(sal.hra) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{sal ? INR(sal.pf) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">{sal ? INR(sal.grossSalary) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs font-black text-green-700 whitespace-nowrap">{sal ? INR(sal.netSalary) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{sal?.bankName || <span className="text-gray-300">Not set</span>}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 text-center">{sal?.payDay || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openSalaryModal(emp)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold">
                                <Pencil size={11}/> {sal ? "Edit" : "Set"}
                              </button>
                              {/* Generate payslip for this employee */}
                              <button onClick={() => handleGenerateOne(emp._id, `${emp.firstName} ${emp.lastName}`)}
                                disabled={generating || !sal}
                                title={!sal ? "Set salary first" : "Generate payslip"}
                                className="flex items-center gap-1 text-xs text-orange-600 hover:underline font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                                <FileText size={11}/> Gen
                              </button>
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

      {/* Payslip Detail Modal */}
      {slipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{MONTHS[slipModal.month-1]} {slipModal.year} — Payslip</p>
                <h3 className="text-lg font-black">{slipModal.employeeId?.firstName} {slipModal.employeeId?.lastName}</h3>
                <p className="text-xs text-gray-300">{slipModal.employeeId?.designation} · {slipModal.employeeId?.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadPayslip(slipModal)} title="Download PDF"
                  className="flex items-center gap-1 bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-800">
                  <Download size={12}/> PDF
                </button>
                <button onClick={() => setSlipModal(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Attendance */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[["Working Days",slipModal.workingDays],["Present",slipModal.presentDays],["Absent",slipModal.absentDays],["On Leave",slipModal.leaveDays]].map(([l,v]) => (
                  <div key={l} className="bg-gray-50 border rounded px-2 py-2">
                    <p className="text-lg font-black text-gray-900">{v}</p>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
              {/* Earnings */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Earnings</p>
                {[["Basic",slipModal.basic],["HRA",slipModal.hra],["Travel",slipModal.ta],["Medical",slipModal.medical],["Special",slipModal.special],["Other",slipModal.otherAllowances]].filter(([,v])=>v>0).map(([l,v])=>(
                  <Row key={l} label={l} value={INR(v)} />
                ))}
                <Row label="Gross Salary" value={INR(slipModal.grossSalary)} bold />
              </div>
              {/* Deductions */}
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Deductions</p>
                {[["PF",slipModal.pf],["ESIC",slipModal.esic],["TDS",slipModal.tds],["Other",slipModal.otherDeductions],["Loss of Pay",slipModal.lossOfPay]].filter(([,v])=>v>0).map(([l,v])=>(
                  <Row key={l} label={l} value={`- ${INR(v)}`} red />
                ))}
                <Row label="Total Deductions" value={`- ${INR(slipModal.totalDeductions)}`} bold red />
              </div>
              {/* Net */}
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="font-black text-green-800 uppercase tracking-widest text-sm">Net Salary</p>
                <p className="font-black text-green-800 text-xl">{INR(slipModal.netSalary)}</p>
              </div>
              {/* Calculation notes */}
              {slipModal.remarks && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
                  <p className="font-bold mb-1">Calculation Breakdown</p>
                  <p className="font-mono text-[11px]">{slipModal.remarks}</p>
                </div>
              )}
              {/* Remarks */}
              {slipModal.status === "draft" && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Remarks (optional)</label>
                  <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} rows={2} placeholder="Add notes before approving..."
                    className="w-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-[#DD1215] resize-none"/>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {slipModal.status === "draft"    && <button onClick={() => handleAction(slipModal._id,"approve")} className="flex-1 bg-blue-600 text-white py-2 text-xs font-bold uppercase hover:bg-blue-700 transition rounded">Approve</button>}
                {slipModal.status === "approved" && <button onClick={() => handleAction(slipModal._id,"paid")}   className="flex-1 bg-green-600 text-white py-2 text-xs font-bold uppercase hover:bg-green-700 transition rounded">Mark as Paid</button>}
                <button onClick={() => downloadPayslip(slipModal)} className="flex items-center justify-center gap-1.5 flex-1 border border-gray-300 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition rounded">
                  <Download size={13}/> Download PDF
                </button>
                <button onClick={() => setSlipModal(null)} className="flex-1 border border-gray-300 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition rounded">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Salary Modal */}
      {salaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest">Set Salary</h3>
                <p className="text-xs text-gray-400 mt-0.5">{salaryModal.firstName} {salaryModal.lastName} · {salaryModal.designation}</p>
              </div>
              <button onClick={() => setSalaryModal(null)} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
            </div>
            <p className="text-xs font-bold uppercase text-gray-400 mb-3">Earnings</p>
            <div className="space-y-3">
              {SALARY_FIELDS.slice(0,6).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">{label}</label>
                  <input type="number" min={0} value={salaryForm[key]} onChange={e => setSalaryForm(f => ({...f,[key]:parseFloat(e.target.value)||0}))}
                    className={inp + " text-right"} />
                </div>
              ))}
              <p className="text-xs font-bold uppercase text-gray-400 pt-2 mt-2">Deductions</p>
              {SALARY_FIELDS.slice(6).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">{label}</label>
                  <input type="number" min={0} value={salaryForm[key]} onChange={e => setSalaryForm(f => ({...f,[key]:parseFloat(e.target.value)||0}))}
                    className={inp + " text-right"} />
                </div>
              ))}
              <div className="border-t pt-3 mt-3 space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Gross Salary</span>
                  <span className="text-sm font-black text-gray-900">{INR(["basic","hra","ta","medical","special","otherAllowances"].reduce((s,k)=>s+(salaryForm[k]||0),0))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Total Deductions</span>
                  <span className="text-sm font-bold text-red-600">{INR(["pf","esic","tds","otherDeductions"].reduce((s,k)=>s+(salaryForm[k]||0),0))}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs font-bold text-gray-700">Net Salary</span>
                  <span className="text-base font-black text-green-700">{INR(["basic","hra","ta","medical","special","otherAllowances"].reduce((s,k)=>s+(salaryForm[k]||0),0) - ["pf","esic","tds","otherDeductions"].reduce((s,k)=>s+(salaryForm[k]||0),0))}</span>
                </div>
              </div>
              <p className="text-xs font-bold uppercase text-gray-400 pt-2">Bank Details</p>
              {[["bankName","Bank Name"],["accountHolder","Account Holder"],["accountNumber","Account Number"],["ifscCode","IFSC Code"]].map(([k,l])=>(
                <div key={k} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">{l}</label>
                  <input type="text" value={salaryForm[k]||""} onChange={e => setSalaryForm(f=>({...f,[k]:e.target.value}))} className={inp} />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">Pay Day</label>
                <input type="number" min={1} max={28} value={salaryForm.payDay||1} onChange={e => setSalaryForm(f=>({...f,payDay:parseInt(e.target.value)||1}))} className={inp + " text-right"} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">Effective From</label>
                <input type="date" value={salaryForm.effectiveFrom?.split?.("T")?.[0]||""} onChange={e => setSalaryForm(f=>({...f,effectiveFrom:e.target.value}))} className={inp} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSalaryModal(null)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSaveSalary} disabled={saving} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Salary"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
const Row = ({ label, value, bold, red }) => (
  <div className={`flex items-center justify-between py-1 border-b border-gray-50 ${bold?"border-gray-200 mt-1 pt-2":""}`}>
    <span className={`text-xs ${bold?"font-bold text-gray-900":"text-gray-600"}`}>{label}</span>
    <span className={`text-xs ${bold?"font-black":"font-semibold"} ${red?"text-red-600":"text-gray-800"}`}>{value}</span>
  </div>
);

export default PayrollManager;
