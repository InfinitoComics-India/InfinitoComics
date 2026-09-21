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
