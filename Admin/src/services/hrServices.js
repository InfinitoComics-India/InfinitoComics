import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
});

// ── EMPLOYEES ─────────────────────────────────────────────────
export const getAllEmployees      = (params = {}) => axios.get(`${BASE}/hr/employees/getall`, { ...authHeaders(), params });
export const getEmployeeById      = (id)          => axios.get(`${BASE}/hr/employees/get/${id}`, authHeaders());
export const createEmployee       = (data)        => axios.post(`${BASE}/hr/employees/create`, data, authHeaders());
export const updateEmployee       = (id, data)    => axios.put(`${BASE}/hr/employees/update/${id}`, data, authHeaders());
export const changeEmployeeStatus = (id, status)  => axios.patch(`${BASE}/hr/employees/status/${id}`, { status }, authHeaders());
export const changeEmployeeRole   = (id, hrRole)  => axios.patch(`${BASE}/hr/employees/role/${id}`, { hrRole }, authHeaders());
export const deleteEmployee       = (id)          => axios.delete(`${BASE}/hr/employees/delete/${id}`, authHeaders());
export const getDirectReports     = (id)          => axios.get(`${BASE}/hr/employees/reports/${id}`, authHeaders());

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const getMyNotifications  = (limit = 50)  => axios.get(`${BASE}/hr/notifications/mine`, { ...authHeaders(), params: { limit } });
export const getUnreadCount      = ()             => axios.get(`${BASE}/hr/notifications/unread-count`, authHeaders());
export const markNotifRead       = (id)           => axios.patch(`${BASE}/hr/notifications/read/${id}`, {}, authHeaders());
export const markAllNotifsRead   = ()             => axios.patch(`${BASE}/hr/notifications/read-all`, {}, authHeaders());
export const deleteNotification  = (id)           => axios.delete(`${BASE}/hr/notifications/delete/${id}`, authHeaders());
export const sendNotification    = (data)         => axios.post(`${BASE}/hr/notifications/send`, data, authHeaders());

// ── AUDIT LOGS ────────────────────────────────────────────────
export const getAuditLogs        = (params = {})            => axios.get(`${BASE}/hr/audit`, { ...authHeaders(), params });
export const getAuditForEntity   = (entity, entityId)       => axios.get(`${BASE}/hr/audit/entity/${entity}/${entityId}`, authHeaders());
export const getAuditByUser      = (userId, limit = 20)     => axios.get(`${BASE}/hr/audit/user/${userId}`, { ...authHeaders(), params: { limit } });

// ── ATTENDANCE ────────────────────────────────────────────────
export const getTodayAttendance        = ()                          => axios.get(`${BASE}/hr/attendance/today`, authHeaders());
export const getTodayForEmployee       = (empId)                     => axios.get(`${BASE}/hr/attendance/today/${empId}`, authHeaders());
export const getMonthlyAttendance      = (empId, year, month)        => axios.get(`${BASE}/hr/attendance/monthly/${empId}`, { ...authHeaders(), params: { year, month } });
export const getAttendanceSummary      = (year, month)               => axios.get(`${BASE}/hr/attendance/summary`, { ...authHeaders(), params: { year, month } });
export const clockIn                   = (empId)                     => axios.post(`${BASE}/hr/attendance/clockin/${empId}`, {}, authHeaders());
export const clockOut                  = (empId)                     => axios.post(`${BASE}/hr/attendance/clockout/${empId}`, {}, authHeaders());
export const markAttendance            = (empId, data)               => axios.patch(`${BASE}/hr/attendance/mark/${empId}`, data, authHeaders());

// ── LEAVES ────────────────────────────────────────────────────
export const applyLeave                = (data)                      => axios.post(`${BASE}/hr/leaves/apply`, data, authHeaders());
export const getPendingLeaves          = ()                          => axios.get(`${BASE}/hr/leaves/pending`, authHeaders());
export const getEmployeeLeaves         = (empId, status)             => axios.get(`${BASE}/hr/leaves/employee/${empId}`, { ...authHeaders(), params: { status } });
export const getLeaveBalance           = (empId)                     => axios.get(`${BASE}/hr/leaves/balance/${empId}`, authHeaders());
export const approveLeave              = (id, adminNote)             => axios.patch(`${BASE}/hr/leaves/approve/${id}`, { adminNote }, authHeaders());
export const rejectLeave               = (id, rejectionNote)         => axios.patch(`${BASE}/hr/leaves/reject/${id}`, { rejectionNote }, authHeaders());
export const cancelLeave               = (id)                        => axios.patch(`${BASE}/hr/leaves/cancel/${id}`, {}, authHeaders());

// ── CALENDAR EVENTS ───────────────────────────────────────────
export const getCalendarMonth          = (year, month)               => axios.get(`${BASE}/hr/calendar/month`, { ...authHeaders(), params: { year, month } });
export const getCalendarRange          = (startDate, endDate, empId) => axios.get(`${BASE}/hr/calendar/range`, { ...authHeaders(), params: { startDate, endDate, employeeId: empId } });
export const getUpcomingEvents         = (days = 14)                 => axios.get(`${BASE}/hr/calendar/upcoming`, { ...authHeaders(), params: { days } });
export const getHolidays               = (year)                      => axios.get(`${BASE}/hr/calendar/holidays`, { ...authHeaders(), params: { year } });
export const createCalendarEvent       = (data)                      => axios.post(`${BASE}/hr/calendar/create`, data, authHeaders());
export const updateCalendarEvent       = (id, data)                  => axios.put(`${BASE}/hr/calendar/update/${id}`, data, authHeaders());
export const deleteCalendarEvent       = (id)                        => axios.delete(`${BASE}/hr/calendar/delete/${id}`, authHeaders());

// ── TASKS ─────────────────────────────────────────────────────
export const createTask          = (data)                      => axios.post(`${BASE}/hr/tasks/create`, data, authHeaders());
export const getKanbanBoard      = (projectId)                 => axios.get(`${BASE}/hr/tasks/kanban`, { ...authHeaders(), params: projectId ? { projectId } : {} });
export const getOverdueTasks     = ()                          => axios.get(`${BASE}/hr/tasks/overdue`, authHeaders());
export const getTasksByEmployee  = (empId, status)             => axios.get(`${BASE}/hr/tasks/employee/${empId}`, { ...authHeaders(), params: { status } });
export const getTasksByProject   = (projectId)                 => axios.get(`${BASE}/hr/tasks/project/${projectId}`, authHeaders());
export const getTaskById         = (id)                        => axios.get(`${BASE}/hr/tasks/${id}`, authHeaders());
export const updateTask          = (id, data)                  => axios.put(`${BASE}/hr/tasks/update/${id}`, data, authHeaders());
export const moveTaskStatus      = (id, newStatus, note)       => axios.patch(`${BASE}/hr/tasks/status/${id}`, { newStatus, note }, authHeaders());
export const addTaskComment      = (id, content)               => axios.post(`${BASE}/hr/tasks/comment/${id}`, { content }, authHeaders());
export const deleteTask          = (id)                        => axios.delete(`${BASE}/hr/tasks/delete/${id}`, authHeaders());
export const getTaskMetrics      = (empId, startDate, endDate) => axios.get(`${BASE}/hr/tasks/metrics/${empId}`, { ...authHeaders(), params: { startDate, endDate } });

// ── WORK ASSIGNMENTS ──────────────────────────────────────────
export const assignEmployee      = (data)                      => axios.post(`${BASE}/hr/assignments/assign`, data, authHeaders());
export const getWorkload         = ()                          => axios.get(`${BASE}/hr/assignments/workload`, authHeaders());
export const getAssignmentsByEmp = (empId)                     => axios.get(`${BASE}/hr/assignments/employee/${empId}`, authHeaders());
export const getAssignmentsByProj= (projectId)                 => axios.get(`${BASE}/hr/assignments/project/${projectId}`, authHeaders());
export const updateAssignment    = (id, data)                  => axios.put(`${BASE}/hr/assignments/update/${id}`, data, authHeaders());
export const removeAssignment    = (id)                        => axios.delete(`${BASE}/hr/assignments/remove/${id}`, authHeaders());

// ── PROJECTS ──────────────────────────────────────────────────
export const createProject       = (data)                      => axios.post(`${BASE}/hr/projects/create`, data, authHeaders());
export const getAllProjects       = (params)                    => axios.get(`${BASE}/hr/projects/getall`, { ...authHeaders(), params });
export const getProjectDetail    = (id)                        => axios.get(`${BASE}/hr/projects/${id}`, authHeaders());
export const updateProject       = (id, data)                  => axios.put(`${BASE}/hr/projects/update/${id}`, data, authHeaders());
export const addMilestone        = (id, data)                  => axios.post(`${BASE}/hr/projects/milestone/${id}`, data, authHeaders());
export const updateMilestone     = (id, msId, data)            => axios.put(`${BASE}/hr/projects/milestone/${id}/${msId}`, data, authHeaders());
export const deleteProject       = (id)                        => axios.delete(`${BASE}/hr/projects/delete/${id}`, authHeaders());
export const getProjectStats     = ()                          => axios.get(`${BASE}/hr/projects/stats`, authHeaders());
