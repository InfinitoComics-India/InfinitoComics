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

// ── PERFORMANCE ───────────────────────────────────────────────
export const generatePerformance   = (empId, month, year)            => axios.post(`${BASE}/hr/performance/generate/${empId}`, { month, year }, authHeaders());
export const getPerformanceHistory = (empId)                         => axios.get(`${BASE}/hr/performance/${empId}`, authHeaders());
export const getPerformancePeriod  = (empId, month, year)            => axios.get(`${BASE}/hr/performance/${empId}/period`, { ...authHeaders(), params: { month, year } });
export const getAllPerformance     = (month, year)                    => axios.get(`${BASE}/hr/performance/all`, { ...authHeaders(), params: { month, year } });
export const addManagerScore       = (empId, data)                   => axios.post(`${BASE}/hr/performance/score/${empId}`, data, authHeaders());
export const getTopPerformers      = (month, year)                   => axios.get(`${BASE}/hr/performance/top`, { ...authHeaders(), params: { month, year } });
export const getPerformanceTrend   = (empId, months)                 => axios.get(`${BASE}/hr/performance/trend/${empId}`, { ...authHeaders(), params: { months } });

// ── GOALS ─────────────────────────────────────────────────────
export const createGoal            = (data)                          => axios.post(`${BASE}/hr/goals/create`, data, authHeaders());
export const getGoalsByEmployee    = (empId, status)                 => axios.get(`${BASE}/hr/goals/employee/${empId}`, { ...authHeaders(), params: { status } });
export const getGoalSummary        = (empId)                         => axios.get(`${BASE}/hr/goals/summary/${empId}`, authHeaders());
export const getOverdueGoals       = ()                              => axios.get(`${BASE}/hr/goals/overdue`, authHeaders());
export const updateGoalProgress    = (id, currentValue)              => axios.patch(`${BASE}/hr/goals/progress/${id}`, { currentValue }, authHeaders());
export const updateGoal            = (id, data)                      => axios.put(`${BASE}/hr/goals/update/${id}`, data, authHeaders());
export const deleteGoal            = (id)                            => axios.delete(`${BASE}/hr/goals/delete/${id}`, authHeaders());

// ── RECOGNITION ───────────────────────────────────────────────
export const giveRecognition       = (data)                          => axios.post(`${BASE}/hr/recognition/give`, data, authHeaders());
export const getRecognitionWall    = ()                              => axios.get(`${BASE}/hr/recognition/wall`, authHeaders());
export const getRecognitionForEmp  = (empId)                         => axios.get(`${BASE}/hr/recognition/employee/${empId}`, authHeaders());
export const getBadgesForEmp       = (empId)                         => axios.get(`${BASE}/hr/recognition/badges/${empId}`, authHeaders());
export const deleteRecognition     = (id)                            => axios.delete(`${BASE}/hr/recognition/delete/${id}`, authHeaders());

// ── SALARY ────────────────────────────────────────────────────
export const setSalary          = (empId, data)              => axios.post(`${BASE}/hr/salary/set/${empId}`, data, authHeaders());
export const getSalaryByEmp     = (empId)                    => axios.get(`${BASE}/hr/salary/employee/${empId}`, authHeaders());
export const getAllSalaries      = ()                         => axios.get(`${BASE}/hr/salary/getall`, authHeaders());

// ── PAYROLL ───────────────────────────────────────────────────
export const generatePayslip    = (empId, month, year)       => axios.post(`${BASE}/hr/payroll/generate/${empId}`, { month, year }, authHeaders());
export const generatePayrollAll = (month, year, employeeIds) => axios.post(`${BASE}/hr/payroll/generate-all`, { month, year, employeeIds }, authHeaders());
export const getPayrollPeriod   = (month, year)              => axios.get(`${BASE}/hr/payroll/period`, { ...authHeaders(), params: { month, year } });
export const getPayrollSummary  = (month, year)              => axios.get(`${BASE}/hr/payroll/summary`, { ...authHeaders(), params: { month, year } });
export const getPayrollByEmp    = (empId)                    => axios.get(`${BASE}/hr/payroll/employee/${empId}`, authHeaders());
export const getPayslip         = (empId, month, year)       => axios.get(`${BASE}/hr/payroll/slip/${empId}`, { ...authHeaders(), params: { month, year } });
export const approvePayslip     = (id)                       => axios.patch(`${BASE}/hr/payroll/approve/${id}`, {}, authHeaders());
export const markPayslipPaid    = (id)                       => axios.patch(`${BASE}/hr/payroll/paid/${id}`, {}, authHeaders());

// ── ONBOARDING ────────────────────────────────────────────────
export const initiateOnboarding   = (empId, data)            => axios.post(`${BASE}/hr/onboarding/initiate/${empId}`, data, authHeaders());
export const getOnboardingByEmp   = (empId)                  => axios.get(`${BASE}/hr/onboarding/employee/${empId}`, authHeaders());
export const getOnboardingActive  = ()                       => axios.get(`${BASE}/hr/onboarding/active`, authHeaders());
export const getOnboardingByType  = (type)                   => axios.get(`${BASE}/hr/onboarding/type/${type}`, authHeaders());
export const toggleChecklistItem  = (id, itemId, isCompleted)=> axios.patch(`${BASE}/hr/onboarding/toggle/${id}`, { itemId, isCompleted }, authHeaders());
export const addOnboardingItem    = (id, data)               => axios.post(`${BASE}/hr/onboarding/additem/${id}`, data, authHeaders());
export const deleteOnboarding     = (id)                     => axios.delete(`${BASE}/hr/onboarding/delete/${id}`, authHeaders());

// ── HR DOCUMENTS ──────────────────────────────────────────────
export const uploadDocument       = (data)                   => axios.post(`${BASE}/hr/documents/upload`, data, authHeaders());
export const getDocumentsByEmp    = (empId)                  => axios.get(`${BASE}/hr/documents/employee/${empId}`, authHeaders());
export const getExpiringDocuments = (days)                   => axios.get(`${BASE}/hr/documents/expiring`, { ...authHeaders(), params: { days } });
export const getAllDocuments       = ()                       => axios.get(`${BASE}/hr/documents/all`, authHeaders());
export const updateDocument       = (id, data)               => axios.put(`${BASE}/hr/documents/update/${id}`, data, authHeaders());
export const deleteDocument       = (id)                     => axios.delete(`${BASE}/hr/documents/delete/${id}`, authHeaders());

// ── RECRUITMENT PIPELINE ──────────────────────────────────────
export const addToPipeline       = (data)                             => axios.post(`${BASE}/hr/recruitment/add`, data, authHeaders());
export const getRecruitmentBoard = ()                                 => axios.get(`${BASE}/hr/recruitment/kanban`, authHeaders());
export const getRecruitmentList  = (stage)                           => axios.get(`${BASE}/hr/recruitment/list`, { ...authHeaders(), params: { stage } });
export const getRecruitmentStats = ()                                 => axios.get(`${BASE}/hr/recruitment/stats`, authHeaders());
export const moveRecruitStage    = (id, stage, note)                  => axios.patch(`${BASE}/hr/recruitment/stage/${id}`, { stage, note }, authHeaders());
export const updateRecruitEntry  = (id, data)                        => axios.put(`${BASE}/hr/recruitment/update/${id}`, data, authHeaders());
export const addInterview        = (id, data)                        => axios.post(`${BASE}/hr/recruitment/interview/${id}`, data, authHeaders());
export const updateInterview     = (id, ivId, data)                   => axios.put(`${BASE}/hr/recruitment/interview/${id}/${ivId}`, data, authHeaders());
export const deleteRecruitEntry  = (id)                              => axios.delete(`${BASE}/hr/recruitment/delete/${id}`, authHeaders());

// ── CHAT ──────────────────────────────────────────────────────
export const createChannel       = (data)                            => axios.post(`${BASE}/hr/chat/channels/create`, data, authHeaders());
export const getAllChannels       = ()                                => axios.get(`${BASE}/hr/chat/channels/all`, authHeaders());
export const getMyChannels       = ()                                => axios.get(`${BASE}/hr/chat/channels/mine`, authHeaders());
export const getOrCreateDM       = (targetUserId, targetUserName)    => axios.post(`${BASE}/hr/chat/channels/dm`, { targetUserId, targetUserName }, authHeaders());
export const addChannelMember    = (channelId, userId)               => axios.post(`${BASE}/hr/chat/channels/${channelId}/member`, { userId }, authHeaders());
export const deleteChannel       = (channelId)                       => axios.delete(`${BASE}/hr/chat/channels/${channelId}`, authHeaders());
export const sendMessage         = (channelId, content, opts)        => axios.post(`${BASE}/hr/chat/messages/${channelId}`, { content, ...opts }, authHeaders());
export const getMessages         = (channelId, limit, before)        => axios.get(`${BASE}/hr/chat/messages/${channelId}`, { ...authHeaders(), params: { limit, before } });
export const markMessagesRead    = (channelId)                       => axios.patch(`${BASE}/hr/chat/messages/${channelId}/read`, {}, authHeaders());
export const searchMessages      = (channelId, q)                    => axios.get(`${BASE}/hr/chat/messages/${channelId}/search`, { ...authHeaders(), params: { q } });
export const deleteMessage       = (msgId)                           => axios.delete(`${BASE}/hr/chat/messages/${msgId}`, authHeaders());
export const addReaction         = (msgId, emoji)                    => axios.post(`${BASE}/hr/chat/messages/${msgId}/react`, { emoji }, authHeaders());
export const sendAnnouncement    = (channelId, content)              => axios.post(`${BASE}/hr/chat/announce`, { channelId, content }, authHeaders());

// ── KNOWLEDGE BASE (WIKI) ─────────────────────────────────────
export const createWikiArticle    = (data)                  => axios.post(`${BASE}/hr/wiki/create`, data, authHeaders());
export const getAllWikiArticles   = (category)              => axios.get(`${BASE}/hr/wiki/all`, { ...authHeaders(), params: { category } });
export const getPublishedArticles = (category)              => axios.get(`${BASE}/hr/wiki/published`, { ...authHeaders(), params: { category } });
export const getWikiArticleById   = (id)                    => axios.get(`${BASE}/hr/wiki/${id}`, authHeaders());
export const getWikiArticleBySlug = (slug)                  => axios.get(`${BASE}/hr/wiki/slug/${slug}`, authHeaders());
export const updateWikiArticle    = (id, data)              => axios.put(`${BASE}/hr/wiki/update/${id}`, data, authHeaders());
export const deleteWikiArticle    = (id)                    => axios.delete(`${BASE}/hr/wiki/delete/${id}`, authHeaders());
export const searchWikiArticles   = (q)                     => axios.get(`${BASE}/hr/wiki/search`, { ...authHeaders(), params: { q } });
export const voteWikiArticle      = (id, helpful)           => axios.post(`${BASE}/hr/wiki/vote/${id}`, { helpful }, authHeaders());
export const getPopularWikiArticles = ()                    => axios.get(`${BASE}/hr/wiki/popular`, authHeaders());
export const getWikiCategoryStats = ()                      => axios.get(`${BASE}/hr/wiki/stats`, authHeaders());

// ── SELF SERVICE ──────────────────────────────────────────────
export const submitSSRequest      = (data)                  => axios.post(`${BASE}/hr/self-service/submit`, data, authHeaders());
export const getAllSSRequests      = (status)               => axios.get(`${BASE}/hr/self-service/all`, { ...authHeaders(), params: status ? { status } : {} });
export const getOpenSSRequests    = ()                      => axios.get(`${BASE}/hr/self-service/open`, authHeaders());
export const getSSRequestsByEmp   = (empId, status)        => axios.get(`${BASE}/hr/self-service/employee/${empId}`, { ...authHeaders(), params: { status } });
export const updateSSStatus       = (id, status, assigned) => axios.patch(`${BASE}/hr/self-service/status/${id}`, { status, ...assigned }, authHeaders());
export const resolveSSRequest     = (id, resolution)       => axios.patch(`${BASE}/hr/self-service/resolve/${id}`, { resolution }, authHeaders());
export const addSSComment         = (id, content)          => axios.post(`${BASE}/hr/self-service/comment/${id}`, { content }, authHeaders());
export const getSSStats           = ()                      => axios.get(`${BASE}/hr/self-service/stats`, authHeaders());
