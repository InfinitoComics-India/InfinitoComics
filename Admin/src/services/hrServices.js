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
