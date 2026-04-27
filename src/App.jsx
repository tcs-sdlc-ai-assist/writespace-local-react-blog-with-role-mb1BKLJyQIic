import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { Home } from './pages/Home.jsx';
import { ReadBlog } from './pages/ReadBlog.jsx';
import { WriteBlog } from './pages/WriteBlog.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { UserManagement } from './pages/UserManagement.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

/**
 * Root application component.
 * Defines all routes using React Router v6 Routes/Route.
 * Public routes: / (LandingPage), /login (LoginPage), /register (RegisterPage).
 * Protected routes: /blogs (Home), /blog/:id (ReadBlog), /write (WriteBlog), /edit/:id (WriteBlog).
 * Admin-only routes: /admin (AdminDashboard), /admin/users (UserManagement).
 * Uses ProtectedRoute for access control.
 * @returns {JSX.Element}
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes (authenticated users) */}
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <ProtectedRoute>
              <ReadBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;