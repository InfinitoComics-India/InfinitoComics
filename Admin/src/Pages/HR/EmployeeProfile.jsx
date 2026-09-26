import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Briefcase,
  User, Github, Linkedin, Shield, Users, Loader
} from "lucide-react";
import { getEmployeeById, getDirectReports, getAuditForEntity } from "../../services/hrServices";

const STATUS_COLORS = {
  active:     "bg-green-100 text-green-700",
  inactive:   "bg-gray-100 text-gray-600",
  on_leave:   "bg-yellow-100 text-yellow-700",
  terminated: "bg-red-100 text-red-700",
};

const EmployeeProfile = () => {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const [emp, setEmp]           = useState(null);
  const [reports, setReports]   = useState([]);
  const [logs, setLogs]         = useState([]);
  const [tab, setTab]           = useState("overview");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [empRes, reportsRes, logsRes] = await Promise.all([
          getEmployeeById(id),
          getDirectReports(id),
          getAuditForEntity("Employee", id),
        ]);
        setEmp(empRes.data.data);
        setReports(reportsRes.data.data || []);
        setLogs(logsRes.data.data || []);
      } catch { setError("Failed to load employee."); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader size={32} className="animate-spin text-[#DD1215]" />
    </div>
  );

  if (error || !emp) return (
    <div className="flex items-center justify-center h-full text-red-600">{error || "Employee not found."}</div>
  );

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/hr/employees")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-xl font-black tracking-widest text-gray-900">EMPLOYEE PROFILE</h1>
        </div>
        <button onClick={() => navigate(`/hr/employees/${id}/edit`)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-black transition">
          <Pencil size={13} /> Edit
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#310303] to-[#DD1215]" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-[#DD1215]">
                {emp.firstName?.[0]}{emp.lastName?.[0]}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-gray-900">{emp.firstName} {emp.lastName}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[emp.status]}`}>
                    {emp.status?.replace("_", " ")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 capitalize">
                    {emp.hrRole?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{emp.designation} · {emp.department}</p>
                <p className="text-gray-400 text-xs font-mono mt-1">{emp.employeeId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="border-b flex">
            {["overview", "direct_reports", "activity"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition ${
                  tab === t ? "border-b-2 border-[#DD1215] text-[#DD1215]" : "text-gray-500 hover:text-gray-800"
                }`}>
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</h3>
                  <InfoRow icon={Mail}     label="Email"   value={emp.email} />
                  <InfoRow icon={Phone}    label="Phone"   value={emp.phone} />
                  <InfoRow icon={MapPin}   label="Address" value={emp.address} />
                </div>
                {/* Job */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Job Details</h3>
                  <InfoRow icon={Briefcase} label="Employment Type" value={emp.employmentType} />
                  <InfoRow icon={Calendar}  label="Joined"          value={fmt(emp.joiningDate)} />
                  <InfoRow icon={Calendar}  label="Date of Birth"   value={fmt(emp.dateOfBirth)} />
                  <InfoRow icon={User}      label="Manager"
                    value={emp.reportingManager
                      ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}`
                      : "No manager"} />
                </div>
                {/* Skills */}
                {emp.skills?.length > 0 && (
                  <div className="sm:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {emp.skills.map(s => (
                        <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Social */}
                {(emp.linkedIn || emp.github) && (
                  <div className="sm:col-span-2 flex gap-4">
                    {emp.linkedIn && (
                      <a href={emp.linkedIn} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                        <Linkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {emp.github && (
                      <a href={emp.github} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-700 hover:underline">
                        <Github size={14} /> GitHub
                      </a>
                    )}
                  </div>
                )}
                {/* Emergency Contact */}
                {emp.emergencyContact?.name && (
                  <div className="sm:col-span-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Emergency Contact</h3>
                    <div className="bg-gray-50 border rounded px-4 py-3 text-sm text-gray-700">
                      <strong>{emp.emergencyContact.name}</strong> · {emp.emergencyContact.relation} · {emp.emergencyContact.phone}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Direct Reports Tab */}
            {tab === "direct_reports" && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Direct Reports ({reports.length})
                </h3>
                {reports.length === 0 ? (
                  <p className="text-sm text-gray-400">No direct reports.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reports.map(r => (
                      <button key={r._id} onClick={() => navigate(`/hr/employees/${r._id}`)}
                        className="bg-gray-50 border rounded-lg px-4 py-3 text-left hover:border-[#DD1215] transition">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#DD1215] text-white flex items-center justify-center text-xs font-bold">
                            {r.firstName?.[0]}{r.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{r.firstName} {r.lastName}</p>
                            <p className="text-xs text-gray-400">{r.designation}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab — Audit Log */}
            {tab === "activity" && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Activity History ({logs.length})
                </h3>
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-400">No activity recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {logs.map(log => (
                      <div key={log._id} className="flex items-start gap-3 border-b pb-3">
                        <div className="w-2 h-2 rounded-full bg-[#DD1215] mt-2 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{log.description || `${log.action} on ${log.entity}`}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            By {log.performedByName} · {fmt(log.createdAt)}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{log.action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  </div>
);

export default EmployeeProfile;
