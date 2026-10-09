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
  // Days passed in current month (today's date) — fallback when no joining date
  const daysPassedDefault = now.getDate();

  // Earned so far — counts from the employee's joining day-of-month, not the 1st.
  // - If they joined THIS month: count from their join day up to today (first month, partial pay).
  // - If their join day hasn't occurred yet this month (e.g. joined on the 22nd, today is the
  //   7th): they already completed a full first month earlier, so just use days elapsed this
  //   month (same as default) — there's no partial cycle to apply here.
  // - If their join day already occurred this month and they joined in an earlier month: count
  //   from their join day of THIS month up to today — this keeps every employee's "earned so far"
  //   anchored to their personal pay-cycle date instead of always starting from the 1st.
  const daysPassedFor = (emp) => {
    if (!emp?.joiningDate) return daysPassedDefault;
    const joinDate = new Date(emp.joiningDate);
    if (isNaN(joinDate.getTime())) return daysPassedDefault;

    const sameMonth = joinDate.getFullYear() === now.getFullYear() && joinDate.getMonth() === now.getMonth();
    if (sameMonth) {
      // Joined this month — first (partial) pay cycle, count from join day to today.
      return Math.max(1, now.getDate() - joinDate.getDate() + 1);
    }

    const joinDay = joinDate.getDate();
    const daysInThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const effectiveJoinDay = Math.min(joinDay, daysInThisMonth);

    if (now.getDate() >= effectiveJoinDay) {
      // This month's pay-cycle anchor day has already passed — count from that day.
      return now.getDate() - effectiveJoinDay + 1;
    }
    // Anchor day hasn't come up yet this month — fall back to days elapsed this month.
    return daysPassedDefault;
  };
  const earnedSoFar = (sal, emp) => sal ? Math.round((daysPassedFor(emp) / 30) * sal.netSalary) : 0;
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

  // Convert number to words (Indian system)
  const numToWords = (n) => {
    const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const inWords = (num) => {
      if (num === 0) return "";
      if (num < 20) return a[num] + " ";
      if (num < 100) return b[Math.floor(num/10)] + " " + a[num%10] + " ";
      return a[Math.floor(num/100)] + " Hundred " + inWords(num%100);
    };
    if (!n || n === 0) return "Zero Only";
    let str = "";
    if (n >= 10000000) { str += inWords(Math.floor(n/10000000)) + "Crore "; n %= 10000000; }
    if (n >= 100000)   { str += inWords(Math.floor(n/100000))   + "Lakh ";  n %= 100000;   }
    if (n >= 1000)     { str += inWords(Math.floor(n/1000))     + "Thousand "; n %= 1000;  }
    str += inWords(n);
    return str.trim() + " Only";
  };

  // Download payslip as PDF (HTML print)
  const downloadPayslip = (slip, salData) => {
    const emp = slip.employeeId;
    const INRf  = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;
    const R     = (label, value, bold=false, red=false) =>
      `<tr style="${bold?"font-weight:bold;background:#f8f8f8;":""}">
        <td style="padding:6px 10px;border:1px solid #e0e0e0;${bold?"font-weight:bold;":""}">${label}</td>
        <td style="padding:6px 10px;border:1px solid #e0e0e0;text-align:right;${bold?"font-weight:bold;":""}${red?"color:#c62828;":""}"> ${value}</td>
      </tr>`;
    const joiningFmt = emp?.joiningDate ? new Date(emp.joiningDate).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payslip - ${MONTHS[slip.month-1]} ${slip.year}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff}
  .page{max-width:780px;margin:0 auto;padding:20px}
  .header{background:#CC0000;color:white;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:0}
  .header h1{font-size:20px;font-weight:900;letter-spacing:3px;margin:0}
  .header p{font-size:10px;opacity:0.85;margin:2px 0 0}
  .header-right{text-align:right}
  .header-right .title{font-size:18px;font-weight:900;letter-spacing:2px}
  .header-right .sub{font-size:11px}
  .subheader{background:#111;color:white;text-align:center;padding:5px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
  table.info{width:100%;border-collapse:collapse;margin-bottom:10px}
  table.info td{padding:5px 8px;border:1px solid #ccc;font-size:11px}
  table.info td.lbl{background:#f0f0f0;font-weight:bold;width:16%}
  table.info td.val{width:17%}
  table.earn{width:100%;border-collapse:collapse;margin-bottom:10px}
  table.earn th{padding:7px 10px;border:1px solid #ccc;background:#222;color:#fff;font-size:11px;text-align:left}
  table.earn th.right{text-align:right}
  table.earn td{padding:6px 10px;border:1px solid #e0e0e0;font-size:11px}
  .section-hdr{background:#333;color:#fff;text-align:center;font-weight:bold;font-size:11px;letter-spacing:1px;padding:5px;margin:8px 0 0}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #ccc;margin-bottom:8px}
  .summary-box{text-align:center;padding:8px 4px;border-right:1px solid #ccc}
  .summary-box:last-child{border-right:none}
  .summary-box .big{font-size:18px;font-weight:900}
  .summary-box .small{font-size:9px;text-transform:uppercase;color:#555;margin-top:2px}
  .net-row{background:#1b5e20;color:white;display:flex;justify-content:space-between;align-items:center;padding:10px 16px;margin-top:10px}
  .net-row .lbl{font-weight:bold;font-size:12px;letter-spacing:1px;text-transform:uppercase}
  .net-row .amt{font-size:20px;font-weight:900}
  .words-row{border:1px solid #ccc;padding:6px 10px;font-size:11px;margin-top:6px}
  .words-row span{font-weight:bold}
  .bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #ccc;margin-top:6px}
  .bottom-cell{padding:6px 10px;border-right:1px solid #ccc;font-size:11px}
  .bottom-cell:last-child{border-right:none}
  .bottom-cell .lbl{font-weight:bold;color:#555;font-size:10px}
  .bottom-cell .val{font-size:12px;font-weight:bold}
  .footer{margin-top:20px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:10px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:10px}}
</style></head>
<body><div class="page">

  <!-- Header -->
  <div class="header">
    <div><h1>INFINITO COMICS</h1><p>Miraya Corporation Pvt. Ltd.</p><p>career@infinitohq.com · infinitohq.com</p></div>
    <div class="header-right"><div class="title">PAYSLIP</div><div class="sub">${MONTHS[slip.month-1]} ${slip.year}</div><div class="sub" style="margin-top:4px">Status: <strong>${(slip.status||"").toUpperCase()}</strong>${slip.paidAt?` | Paid: ${new Date(slip.paidAt).toLocaleDateString("en-IN")}`:""}</div></div>
  </div>
  <div class="subheader">Salary Slip for the Month of ${MONTHS[slip.month-1]} ${slip.year}</div>

  <!-- Employee Info Table -->
  <table class="info">
    <tr>
      <td class="lbl">Employee Name</td><td class="val" style="font-weight:bold">${emp?.firstName||""} ${emp?.lastName||""}</td>
      <td class="lbl">Employee Code</td><td class="val">${emp?.employeeId||"—"}</td>
      <td class="lbl">PAN No.</td><td class="val">${emp?.pan||"—"}</td>
    </tr>
    <tr>
      <td class="lbl">Bank Name</td><td class="val">${salData?.bankName||"—"}</td>
      <td class="lbl">Joining Date</td><td class="val">${joiningFmt}</td>
      <td class="lbl">Designation</td><td class="val">${emp?.designation||"—"}</td>
    </tr>
    <tr>
      <td class="lbl">Bank A/C No.</td><td class="val">${salData?.accountNumber||"—"}</td>
      <td class="lbl">Department</td><td class="val">${emp?.department||"—"}</td>
      <td class="lbl">IFSC Code</td><td class="val">${salData?.ifscCode||"—"}</td>
    </tr>
  </table>

  <!-- Attendance Summary -->
  <div class="section-hdr">Attendance Summary</div>
  <div class="summary-grid" style="margin-top:0">
    <div class="summary-box"><div class="big">${slip.presentDays||0}</div><div class="small">Day Present</div></div>
    <div class="summary-box"><div class="big">${slip.absentDays||0}</div><div class="small">Day Absent</div></div>
    <div class="summary-box"><div class="big">${slip.leaveDays||0}</div><div class="small">Total Leave</div></div>
    <div class="summary-box"><div class="big">${(slip.presentDays||0)+(slip.leaveDays||0)}</div><div class="small">Total Day Paid</div></div>
  </div>

  <!-- Earnings & Deductions side by side -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
    <div>
      <table class="earn">
        <tr><th>Earnings</th><th class="right">Amount (₹)</th></tr>
        ${[["Basic Pay",slip.basic],["House Allowance (HRA)",slip.hra],["Travel Allowance",slip.ta],["Medical Allowance",slip.medical],["Special Allowance",slip.special],["Other Allowances",slip.otherAllowances]].filter(([,v])=>Number(v)>0).map(([l,v])=>`<tr><td style="padding:6px 10px;border:1px solid #e0e0e0">${l}</td><td style="padding:6px 10px;border:1px solid #e0e0e0;text-align:right">${INRf(v)}</td></tr>`).join("")}
        <tr style="background:#f0f0f0;font-weight:bold"><td style="padding:6px 10px;border:1px solid #ccc">Total Earnings</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right">${INRf(slip.grossSalary)}</td></tr>
      </table>
    </div>
    <div>
      <table class="earn">
        <tr><th>Deductions</th><th class="right">Amount (₹)</th></tr>
        ${[["Provident Fund (PF)",slip.pf],["ESIC",slip.esic],["TDS",slip.tds],["Loss of Pay (LOP)",slip.lossOfPay],["Other Deductions",slip.otherDeductions]].filter(([,v])=>Number(v)>0).map(([l,v])=>`<tr><td style="padding:6px 10px;border:1px solid #e0e0e0">${l}</td><td style="padding:6px 10px;border:1px solid #e0e0e0;text-align:right;color:#c62828">- ${INRf(v)}</td></tr>`).join("")}
        ${[["Provident Fund (PF)",slip.pf],["ESIC",slip.esic],["TDS",slip.tds],["Loss of Pay (LOP)",slip.lossOfPay],["Other Deductions",slip.otherDeductions]].filter(([,v])=>Number(v)>0).length===0?`<tr><td style="padding:6px 10px;border:1px solid #e0e0e0;color:#999" colspan="2">No deductions</td></tr>`:""}
        <tr style="background:#f0f0f0;font-weight:bold"><td style="padding:6px 10px;border:1px solid #ccc">Gross Deduction</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right;color:#c62828">${INRf(slip.totalDeductions)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Bottom summary -->
  <div class="bottom-grid" style="margin-top:8px">
    <div class="bottom-cell"><div class="lbl">Gross Earning</div><div class="val">${INRf(slip.grossSalary)}</div></div>
    <div class="bottom-cell"><div class="lbl">Gross Deduction</div><div class="val" style="color:#c62828">${INRf(slip.totalDeductions)}</div></div>
  </div>
  <div class="bottom-grid">
    <div class="bottom-cell"><div class="lbl">Net Salary</div><div class="val" style="color:#1b5e20;font-size:14px">${INRf(slip.netSalary)}</div></div>
    <div class="bottom-cell"><div class="lbl">Mode of Payment</div><div class="val">${salData?.bankName ? "Bank Transfer" : "Cash"}</div></div>
  </div>

  <!-- Net Salary Banner -->
  <div class="net-row">
    <span class="lbl">Net Salary Payable</span>
    <span class="amt">${INRf(slip.netSalary)}</span>
  </div>

  <!-- Amount in Words -->
  <div class="words-row">Amount in Words: <span>${numToWords(Math.round(slip.netSalary||0))}</span></div>

  <div class="footer">This is a computer generated payslip and does not require a signature. &nbsp;·&nbsp; InfinitoComics India (Miraya Corporation Pvt. Ltd.) &nbsp;·&nbsp; career@infinitohq.com</div>

</div><script>window.onload=()=>window.print();</script></body></html>`;
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
                                <button onClick={() => downloadPayslip(slip, salaries.find(s=>s.employeeId?._id===slip.employeeId?._id||s.employeeId===slip.employeeId?._id))} title="Download PDF" className="text-gray-400 hover:text-gray-700"><Download size={13}/></button>
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
                      {["Employee","Designation","Dept","Basic","HRA","PF","Gross","Net","Earned So Far","Bank","Pay Day","Actions"].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${h==="Earned So Far"?"text-blue-600 bg-blue-50":"text-gray-500"}`}>{h}</th>
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
                          <td className="px-4 py-3 whitespace-nowrap bg-blue-50/40">
                            {sal ? (
                              <div>
                                <p className="text-xs font-black text-blue-700">{INR(earnedSoFar(sal, emp))}</p>
                                <p className="text-[10px] text-blue-400">{daysPassedFor(emp)} of 30 days</p>
                              </div>
                            ) : <span className="text-gray-300">—</span>}
                          </td>
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
                <button onClick={() => downloadPayslip(slipModal, salaries.find(s=>s.employeeId?._id===slipModal.employeeId?._id||s.employeeId===slipModal.employeeId?._id))} title="Download PDF"
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
                <button onClick={() => downloadPayslip(slipModal, salaries.find(s=>s.employeeId?._id===slipModal.employeeId?._id||s.employeeId===slipModal.employeeId?._id))} className="flex items-center justify-center gap-1.5 flex-1 border border-gray-300 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition rounded">
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
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center px-4 py-6">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl mt-4 mb-4">
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
                <div className="flex items-center justify-between border-t pt-2 bg-blue-50 rounded px-2 py-1.5">
                  <span className="text-xs font-bold text-blue-700">Per Day Rate <span className="font-normal text-blue-500">(Gross ÷ 30)</span></span>
                  <span className="text-sm font-black text-blue-700">{INR(Math.round(["basic","hra","ta","medical","special","otherAllowances"].reduce((s,k)=>s+(salaryForm[k]||0),0) / 30))}</span>
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
