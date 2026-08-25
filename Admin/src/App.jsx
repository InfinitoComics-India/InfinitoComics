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

// Role constants
const SUPER   = ["superadmin"];
const COMICS  = ["superadmin", "comics_admin"];
const CHARS   = ["superadmin", "character_admin"];
const RESEARCH= ["superadmin", "research_admin"];
const BLOG    = ["superadmin", "blog_admin"];
const CAREER  = ["superadmin", "career_admin"];
const ALL_AUTH= ["superadmin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"];

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

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
