import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Body from './components/Body';
import ProtectedRoute from './components/ProtectedRoute';
import CreateBlog from './Pages/Blogs/CreateBlog.jsx';
import User from './Pages/UserList/UserList';
import Home from './Pages/Home/home.jsx';
import FAQManager from './Pages/Faq/FaqManager';
import Login from "./Auth/login";
import Characters from './Pages/Characters/CharacterManager.jsx';
import Career from './Pages/career/career';
import Comic from './Pages/Comic/Comic.jsx';
import ChapterDashboard from './Pages/Comic/ChapterDashboard.jsx';
import PaperCreate from "./Pages/Research/PaperCreate";
import TimeLine from './Pages/TimeLine/timeline';
import ResearchManager from './Pages/Research/ResearchManager.jsx';
import ComicChap from './Pages/Comic/comicChapters.jsx';
import AdminManagement from './Pages/AdminManagement/AdminManagement.jsx';
import Unauthorized from './Pages/Unauthorized/Unauthorized.jsx';
import ContactQueries from './Pages/ContactQueries/ContactQueries.jsx';

// ── HR System imports ─────────────────────────────────────────
import EmployeeList      from './Pages/HR/EmployeeList.jsx';
import EmployeeForm      from './Pages/HR/EmployeeForm.jsx';
import EmployeeProfile   from './Pages/HR/EmployeeProfile.jsx';
import NotificationsPage from './Pages/HR/Notifications.jsx';
import AuditLogPage      from './Pages/HR/AuditLog.jsx';
import AttendanceManager from './Pages/HR/AttendanceManager.jsx';
import LeaveManagement   from './Pages/HR/LeaveManagement.jsx';
import CompanyCalendar   from './Pages/HR/CompanyCalendar.jsx';
import KanbanBoard       from './Pages/HR/KanbanBoard.jsx';
import WorkAssignment    from './Pages/HR/WorkAssignment.jsx';
import ProjectManager    from './Pages/HR/ProjectManager.jsx';
import PerformanceDashboard from './Pages/HR/PerformanceDashboard.jsx';
import GoalTracker       from './Pages/HR/GoalTracker.jsx';
import RecognitionWall   from './Pages/HR/RecognitionWall.jsx';

// Role constants
const SUPER   = ["superadmin"];
const COMICS  = ["superadmin", "comics_admin"];
const CHARS   = ["superadmin", "character_admin"];
const RESEARCH= ["superadmin", "research_admin"];
const BLOG    = ["superadmin", "blog_admin"];
const CAREER  = ["superadmin", "career_admin"];
const ALL_AUTH= ["superadmin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"];

// ── HR Role constants ─────────────────────────────────────────
const HR      = ["superadmin", "hr_manager"];
const HR_VIEW = ["superadmin", "hr_manager", "manager", "team_lead",
                 "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"];
const AUDIT   = ["superadmin", "hr_manager"];

function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/" element={<Body />}>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Dashboard — any logged-in admin */}
          <Route path="/" element={
            <ProtectedRoute allowedRoles={ALL_AUTH}><Home /></ProtectedRoute>
          } />

          {/* Comics */}
          <Route path="/comic" element={
            <ProtectedRoute allowedRoles={COMICS}><Comic /></ProtectedRoute>
          } />
          <Route path="/comic/:comicId/chapters" element={
            <ProtectedRoute allowedRoles={COMICS}><ChapterDashboard /></ProtectedRoute>
          } />
          <Route path="/chapters/:chapId/open" element={
            <ProtectedRoute allowedRoles={COMICS}><ChapterDashboard /></ProtectedRoute>
          } />
          <Route path="/chapters/:chapId/edit" element={
            <ProtectedRoute allowedRoles={COMICS}><ChapterDashboard /></ProtectedRoute>
          } />
          <Route path="/comicChap/:comicId/chapters" element={
            <ProtectedRoute allowedRoles={COMICS}><ComicChap /></ProtectedRoute>
          } />

          {/* Characters */}
          <Route path="/characters" element={
            <ProtectedRoute allowedRoles={CHARS}><Characters /></ProtectedRoute>
          } />

          {/* Research */}
          <Route path="/research" element={
            <ProtectedRoute allowedRoles={RESEARCH}><ResearchManager /></ProtectedRoute>
          } />
          <Route path="/research/create" element={
            <ProtectedRoute allowedRoles={RESEARCH}><PaperCreate /></ProtectedRoute>
          } />

          {/* Blog / FAQ / Timeline */}
          <Route path="/createblog" element={
            <ProtectedRoute allowedRoles={BLOG}><CreateBlog /></ProtectedRoute>
          } />
          <Route path="/createfaq" element={
            <ProtectedRoute allowedRoles={BLOG}><FAQManager /></ProtectedRoute>
          } />
          <Route path="/timeline" element={
            <ProtectedRoute allowedRoles={BLOG}><TimeLine /></ProtectedRoute>
          } />

          {/* Career */}
          <Route path="/career" element={
            <ProtectedRoute allowedRoles={CAREER}><Career /></ProtectedRoute>
          } />

          {/* Users — superadmin only */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={SUPER}><User /></ProtectedRoute>
          } />

          {/* Admin Management — superadmin only */}
          <Route path="/admin-management" element={
            <ProtectedRoute allowedRoles={SUPER}><AdminManagement /></ProtectedRoute>
          } />

          {/* Contact Queries — superadmin only */}
          <Route path="/contact-queries" element={
            <ProtectedRoute allowedRoles={SUPER}><ContactQueries /></ProtectedRoute>
          } />

          {/* ── HR System ──────────────────────────────────── */}

          {/* Employee Management */}
          <Route path="/hr/employees" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><EmployeeList /></ProtectedRoute>
          } />
          <Route path="/hr/employees/new" element={
            <ProtectedRoute allowedRoles={HR}><EmployeeForm /></ProtectedRoute>
          } />
          <Route path="/hr/employees/:id" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><EmployeeProfile /></ProtectedRoute>
          } />
          <Route path="/hr/employees/:id/edit" element={
            <ProtectedRoute allowedRoles={HR}><EmployeeForm /></ProtectedRoute>
          } />

          {/* Notifications — all admins */}
          <Route path="/hr/notifications" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><NotificationsPage /></ProtectedRoute>
          } />

          {/* Audit Log — HR + superadmin only */}
          <Route path="/hr/audit" element={
            <ProtectedRoute allowedRoles={AUDIT}><AuditLogPage /></ProtectedRoute>
          } />

          {/* ── HR Phase 2 ─────────────────────────────────── */}

          {/* Attendance */}
          <Route path="/hr/attendance" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><AttendanceManager /></ProtectedRoute>
          } />

          {/* Leave Management */}
          <Route path="/hr/leaves" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><LeaveManagement /></ProtectedRoute>
          } />

          {/* Company Calendar */}
          <Route path="/hr/calendar" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><CompanyCalendar /></ProtectedRoute>
          } />

          {/* ── HR Phase 3 ─────────────────────────────────── */}

          {/* Job Tracking — Kanban Board */}
          <Route path="/hr/tasks" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><KanbanBoard /></ProtectedRoute>
          } />

          {/* Work Assignment */}
          <Route path="/hr/assignments" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><WorkAssignment /></ProtectedRoute>
          } />

          {/* Project Management */}
          <Route path="/hr/projects" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><ProjectManager /></ProtectedRoute>
          } />

          {/* ── HR Phase 4 ─────────────────────────────────── */}
          <Route path="/hr/performance" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><PerformanceDashboard /></ProtectedRoute>
          } />
          <Route path="/hr/goals" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><GoalTracker /></ProtectedRoute>
          } />
          <Route path="/hr/recognition" element={
            <ProtectedRoute allowedRoles={HR_VIEW}><RecognitionWall /></ProtectedRoute>
          } />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
