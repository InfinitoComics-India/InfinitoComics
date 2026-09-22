import React, { useState, useEffect } from "react";
import { IndianRupee, Plus, RefreshCw, ChevronLeft, ChevronRight, Loader, CheckCircle, Clock, AlertCircle, X, Pencil } from "lucide-react";
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
  const [slipModal, setSlipModal] = useState(null);
  const [salaryModal, setSalaryModal] = useState(null); // employee to set salary
  const [salaryForm,  setSalaryForm]  = useState(EMPTY_SALARY);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadPayroll = async () => {
    try { setLoading(true); setError("");
      const [pRes, sRes] = await Promise.all([
        axios.get(`${BASE}/hr/payroll/period`, { ...auth(), params: { month, year } }),
        axios.get(`${BASE}/hr/payroll/summary`, { ...auth(), params: { month, year } }),
      ]);
      setPayslips(pRes.data.data || []);
      setSummary(sRes.data.data || []);
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
    const ids = employees.map(e => e._id);
    if (!ids.length) { setError("No employees found."); return; }
    try { setGenerating(true); setError("");
      await axios.post(`${BASE}/hr/payroll/generate-all`, { month, year, employeeIds: ids }, auth());
      loadPayroll();
    } catch (e) { setError(e.response?.data?.message || "Failed to generate."); }
    finally { setGenerating(false); }
  };

  const handleAction = async (slipId, action) => {
    try {
      await axios.patch(`${BASE}/hr/payroll/${action}/${slipId}`, {}, auth());
      loadPayroll();
      if (slipModal?._id === slipId) setSlipModal(null);
    } catch (e) { setError(e.response?.data?.message || `Failed to ${action}.`); }
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
      setSalaryModal(null); loadSalaries();
    } catch (e) { setError(e.response?.data?.message || "Failed to save salary."); }
    finally { setSaving(false); }
  };

  const summaryMap = {};
  summary.forEach(s => { summaryMap[s._id] = s; });
  const totalNet   = Object.values(summaryMap).reduce((s, v) => s + (v.totalNet || 0), 0);
  const totalPaid  = summaryMap.paid?.count || 0;
  const totalCount = payslips.length;

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
          <button onClick={handleGenerateAll} disabled={generating}
            className="flex items-center gap-2 bg-[#DD1215] text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition disabled:opacity-50">
            {generating ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
            {generating ? "Generating..." : "Generate All"}
          </button>
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

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label:"Total Payslips", value: totalCount },
                { label:"Paid",           value: totalPaid },
                { label:"Pending",        value: totalCount - totalPaid },
                { label:"Total Net Pay",  value: INR(totalNet) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border rounded-lg px-4 py-3">
                  <p className="text-2xl font-black text-gray-900">{value}</p>
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
                        {["Employee","Department","Gross","Deductions","LOP","Net Pay","Days","Status","Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payslips.map(slip => {
                        const emp = slip.employeeId;
                        const s   = STATUS_STYLE[slip.status] || STATUS_STYLE.draft;
                        const SI  = s.icon;
                        return (
                          <tr key={slip._id} className="hover:bg-gray-50 transition-colors">
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
                              <div className="flex items-center gap-2">
                                <button onClick={() => setSlipModal(slip)} className="text-xs text-blue-600 hover:underline font-semibold">View</button>
                                {slip.status === "draft"    && <button onClick={() => handleAction(slip._id,"approve")} className="text-xs text-green-600 hover:underline font-semibold">Approve</button>}
                                {slip.status === "approved" && <button onClick={() => handleAction(slip._id,"paid")}   className="text-xs text-[#DD1215] hover:underline font-semibold">Mark Paid</button>}
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
              <button onClick={loadSalaries} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/></button>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader size={24} className="animate-spin text-[#DD1215]"/></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Employee","Designation","Basic","Gross","Net","Bank","Actions"].map(h => (
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
                              <p className="font-semibold text-gray-900 text-xs">{emp.firstName} {emp.lastName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{emp.designation}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-800">{sal ? INR(sal.basic) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-800">{sal ? INR(sal.grossSalary) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs font-black text-green-700">{sal ? INR(sal.netSalary) : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{sal?.bankName || <span className="text-gray-300">Not set</span>}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => openSalaryModal(emp)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold">
                              <Pencil size={11}/> {sal ? "Edit" : "Set"}
                            </button>
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
                <p className="text-xs text-gray-300">{slipModal.employeeId?.designation}</p>
              </div>
              <button onClick={() => setSlipModal(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
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
              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {slipModal.status === "draft"    && <button onClick={() => handleAction(slipModal._id,"approve")} className="flex-1 bg-blue-600 text-white py-2 text-xs font-bold uppercase hover:bg-blue-700 transition rounded">Approve</button>}
                {slipModal.status === "approved" && <button onClick={() => handleAction(slipModal._id,"paid")}   className="flex-1 bg-green-600 text-white py-2 text-xs font-bold uppercase hover:bg-green-700 transition rounded">Mark as Paid</button>}
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
            <div className="space-y-3">
              {SALARY_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-gray-600 w-44 shrink-0">{label}</label>
                  <input type="number" min={0} value={salaryForm[key]} onChange={e => setSalaryForm(f => ({...f,[key]:parseFloat(e.target.value)||0}))}
                    className={inp + " text-right"} />
                </div>
              ))}
              <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between gap-3 col-span-2">
                  <label className="text-xs font-bold text-gray-600">Gross Salary</label>
                  <span className="text-sm font-black text-gray-900">{INR(["basic","hra","ta","medical","special","otherAllowances"].reduce((s,k)=>s+(salaryForm[k]||0),0))}</span>
                </div>
                <div className="flex items-center justify-between gap-3 col-span-2">
                  <label className="text-xs font-bold text-gray-600">Net Salary</label>
                  <span className="text-sm font-black text-green-700">{INR(["basic","hra","ta","medical","special","otherAllowances"].reduce((s,k)=>s+(salaryForm[k]||0),0) - ["pf","esic","tds","otherDeductions"].reduce((s,k)=>s+(salaryForm[k]||0),0))}</span>
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
