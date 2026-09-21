import React, { useState, useEffect } from "react";
import { TrendingUp, Star, RefreshCw, ChevronLeft, ChevronRight, Loader, Award, Target, Clock, CheckCircle } from "lucide-react";
import axios from "axios";

const BASE  = import.meta.env.VITE_BASE_URL;
const auth  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } });
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ScoreBar = ({ label, score, color = "#DD1215" }) => (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-black text-gray-900">{score ?? "—"}<span className="text-xs text-gray-400 font-normal">/10</span></span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${((score||0)/10)*100}%`, backgroundColor: color }} />
    </div>
  </div>
);

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white border rounded-lg px-4 py-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={16} className={color} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    </div>
    <p className="text-2xl font-black text-gray-900">{value ?? "—"}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const PerformanceDashboard = () => {
  const now = new Date();
  const [employees, setEmployees] = useState([]);
  const [selEmp,    setSelEmp]    = useState("");
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [year,      setYear]      = useState(now.getFullYear());
  const [perf,      setPerf]      = useState(null);
  const [trend,     setTrend]     = useState([]);
  const [topList,   setTopList]   = useState([]);
  const [tab,       setTab]       = useState("individual");
  const [loading,   setLoading]   = useState(false);
  const [generating,setGenerating]= useState(false);
  const [error,     setError]     = useState("");
  const [scoreForm, setScoreForm] = useState({ productivity:5, quality:5, reliability:5, contribution:5, collaboration:5, comment:"" });
  const [scoring,   setScoring]   = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    axios.get(`${BASE}/hr/employees/getall`, auth()).then(r => setEmployees(r.data.data || [])).catch(() => {});
    loadTop();
  }, []);

  useEffect(() => { if (selEmp) { loadPerf(); loadTrend(); } }, [selEmp, month, year]);

  const loadPerf = async () => {
    try { setLoading(true); setError("");
      const res = await axios.get(`${BASE}/hr/performance/${selEmp}/period`, { ...auth(), params: { month, year } });
      setPerf(res.data.data);
    } catch (e) {
      if (e.response?.status === 404) setPerf(null);
      else setError("Failed to load performance data.");
    } finally { setLoading(false); }
  };

  const loadTrend = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/performance/trend/${selEmp}`, auth());
      setTrend((res.data.data || []).reverse());
    } catch {}
  };

  const loadTop = async () => {
    try {
      const res = await axios.get(`${BASE}/hr/performance/top`, { ...auth(), params: { month: now.getMonth()+1, year: now.getFullYear() } });
      setTopList(res.data.data || []);
    } catch {}
  };

  const handleGenerate = async () => {
    if (!selEmp) return;
    try { setGenerating(true); setError("");
      await axios.post(`${BASE}/hr/performance/generate/${selEmp}`, { month, year }, auth());
      loadPerf();
    } catch (e) { setError(e.response?.data?.message || "Failed to generate."); }
    finally { setGenerating(false); }
  };

  const handleScore = async () => {
    try { setScoring(true);
      await axios.post(`${BASE}/hr/performance/score/${selEmp}`, { month, year, ...scoreForm }, auth());
      setShowScoreModal(false); loadPerf();
    } catch (e) { setError(e.response?.data?.message || "Failed to save score."); }
    finally { setScoring(false); }
  };

  const scoreColor = (s) => s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#DD1215";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <TrendingUp size={22} className="text-[#DD1215]" />
        <div>
          <h1 className="text-2xl font-black tracking-widest text-gray-900">PERFORMANCE</h1>
          <p className="text-xs text-gray-400 mt-0.5">Auto-calculated from task, attendance, and project data</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border rounded-lg p-1 w-fit">
          {[{key:"individual",label:"Individual"},{key:"team",label:"Team Leaderboard"}].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition rounded ${tab===t.key?"bg-[#DD1215] text-white":"text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">{error}</div>}

        {/* INDIVIDUAL TAB */}
        {tab === "individual" && (
          <>
            {/* Controls */}
            <div className="bg-white border rounded-lg px-5 py-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                <select value={selEmp} onChange={e => setSelEmp(e.target.value)} className={inp}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.designation}</option>)}
                </select>
              </div>
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
              {selEmp && (
                <div className="flex gap-2">
                  <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition disabled:opacity-50">
                    <RefreshCw size={12} /> {generating ? "Generating..." : "Generate"}
                  </button>
                  {perf && <button onClick={() => setShowScoreModal(true)} className="flex items-center gap-2 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition">
                    <Star size={12} /> Add Score
                  </button>}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader size={28} className="animate-spin text-[#DD1215]"/></div>
            ) : !selEmp ? (
              <div className="bg-white border rounded-lg text-center py-20 text-gray-400">
                <TrendingUp size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="font-semibold">Select an employee to view performance</p>
              </div>
            ) : !perf ? (
              <div className="bg-white border rounded-lg text-center py-16 text-gray-400">
                <p className="font-semibold mb-2">No performance record for {MONTHS[month-1]} {year}</p>
                <button onClick={handleGenerate} disabled={generating} className="text-xs text-[#DD1215] font-bold hover:underline">
                  {generating ? "Generating..." : "Click Generate to create one →"}
                </button>
              </div>
            ) : (
              <>
                {/* Overall score */}
                <div className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{MONTHS[month-1]} {year}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-black text-xl" style={{ borderColor: scoreColor(perf.overallScore), color: scoreColor(perf.overallScore) }}>
                          {perf.overallScore}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-gray-900">{perf.overallScore}<span className="text-sm font-normal text-gray-400">/100</span></p>
                          <p className="text-xs text-gray-400">{perf.status === "published" ? "✅ Published" : "📝 Draft"}</p>
                        </div>
                      </div>
                    </div>
                    {/* Manager score summary */}
                    {perf.managerScore?.scoredBy && (
                      <div className="bg-gray-50 border rounded-lg px-4 py-3 text-xs">
                        <p className="font-bold uppercase tracking-wider text-gray-500 mb-2">Manager Score</p>
                        {["productivity","quality","reliability","contribution","collaboration"].map(k => (
                          <div key={k} className="flex items-center justify-between gap-6 mb-1">
                            <span className="capitalize text-gray-600">{k}</span>
                            <span className="font-bold text-gray-900">{perf.managerScore[k]}/10</span>
                          </div>
                        ))}
                        {perf.managerScore.comment && <p className="text-gray-500 italic mt-2 border-t pt-2">"{perf.managerScore.comment}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Metric cards */}
                  <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b">
                    <MetricCard label="Tasks Done"     value={perf.productivity.tasksCompleted} sub={`of ${perf.productivity.totalAssigned} assigned`}  icon={CheckCircle} color="text-green-500" />
                    <MetricCard label="Completion"     value={`${perf.productivity.completionRate}%`} sub="task completion rate" icon={TrendingUp} color="text-blue-500" />
                    <MetricCard label="Attendance"     value={`${perf.reliability.attendanceRate}%`} sub={`${perf.reliability.attendanceDays}/${perf.reliability.totalWorkingDays} days`} icon={Clock} color="text-purple-500" />
                    <MetricCard label="Revisions"      value={perf.quality.revisionCount} sub="total revisions across tasks" icon={RefreshCw} color="text-orange-500" />
                  </div>

                  {/* Detail breakdown */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Productivity</p>
                      <ScoreBar label="Completion Rate" score={Math.round(perf.productivity.completionRate/10)} />
                      <ScoreBar label="Overdue Rate" score={10 - Math.min(10, perf.productivity.tasksOverdue)} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quality</p>
                      <ScoreBar label="Approval Rate" score={Math.round(perf.quality.approvalRate/10)} color="#22c55e" />
                      <ScoreBar label="Error Rate (low=good)" score={Math.round((100-perf.quality.errorRate)/10)} color="#f59e0b" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Reliability</p>
                      <ScoreBar label="Attendance Rate" score={Math.round(perf.reliability.attendanceRate/10)} color="#6366f1" />
                      <ScoreBar label="Deadline Adherence" score={Math.round(perf.reliability.deadlineAdherence/10)} color="#8b5cf6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contribution & Collaboration</p>
                      <ScoreBar label="Projects Contributed" score={Math.min(10, perf.contribution.projectsContributed * 2)} color="#ec4899" />
                      <ScoreBar label="Tasks Reviewed" score={Math.min(10, perf.collaboration.tasksReviewed)} color="#06b6d4" />
                    </div>
                  </div>
                </div>

                {/* Trend chart (simple) */}
                {trend.length > 1 && (
                  <div className="bg-white border rounded-lg p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">6-Month Trend</p>
                    <div className="flex items-end gap-3 h-24">
                      {trend.map((t, i) => {
                        const h = Math.max(8, (t.overallScore / 100) * 96);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-gray-500">{t.overallScore}</span>
                            <div className="w-full rounded-t transition-all" style={{ height: `${h}px`, backgroundColor: scoreColor(t.overallScore) }} />
                            <span className="text-[9px] text-gray-400">{MONTHS[(t.period?.month||1)-1]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* TEAM LEADERBOARD */}
        {tab === "team" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Top Performers — {MONTHS[now.getMonth()]} {now.getFullYear()}</p>
              <button onClick={loadTop} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition"><RefreshCw size={12}/> Refresh</button>
            </div>
            {topList.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No published performance records for this month yet.</div>
            ) : (
              <div className="divide-y">
                {topList.map((p, i) => {
                  const emp = p.employeeId;
                  return (
                    <div key={p._id} className="px-6 py-4 flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i===0?"bg-yellow-400 text-white":i===1?"bg-gray-300 text-gray-700":i===2?"bg-orange-400 text-white":"bg-gray-100 text-gray-500"}`}>
                        {i+1}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">
                        {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{emp?.firstName} {emp?.lastName}</p>
                        <p className="text-xs text-gray-400">{emp?.designation} · {emp?.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black" style={{ color: scoreColor(p.overallScore) }}>{p.overallScore}</p>
                        <p className="text-[10px] text-gray-400">/ 100</p>
                      </div>
                      {i === 0 && <Award size={20} className="text-yellow-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manager Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-5">Add Manager Score</h3>
            <div className="space-y-4">
              {["productivity","quality","reliability","contribution","collaboration"].map(k => (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase capitalize">{k}</label>
                    <span className="text-sm font-black text-gray-900">{scoreForm[k]}/10</span>
                  </div>
                  <input type="range" min={0} max={10} value={scoreForm[k]}
                    onChange={e => setScoreForm(f => ({...f,[k]:parseInt(e.target.value)}))}
                    className="w-full accent-[#DD1215]" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase mb-1.5 block">Comment (optional)</label>
                <textarea rows={2} value={scoreForm.comment} onChange={e => setScoreForm(f => ({...f,comment:e.target.value}))}
                  className={`${inp} resize-none`} placeholder="Overall feedback for this month..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowScoreModal(false)} className="flex-1 border border-gray-300 px-4 py-2 text-xs font-bold uppercase hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleScore} disabled={scoring} className="flex-1 bg-[#DD1215] text-white px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 transition disabled:opacity-50">
                {scoring ? "Saving..." : "Save Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inp = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#DD1215] bg-white";
export default PerformanceDashboard;
