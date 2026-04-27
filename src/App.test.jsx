import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// We need to mock the auth module before importing components that use it
vi.mock('./utils/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(() => false),
  getCurrentUser: vi.fn(() => null),
  isAdmin: vi.fn(() => false),
}));

vi.mock('./utils/storage.js', () => ({
  getPosts: vi.fn(() => []),
  savePosts: vi.fn(),
  getUsers: vi.fn(() => []),
  saveUsers: vi.fn(),
  getSession: vi.fn(() => null),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));

import { isAuthenticated, getCurrentUser, isAdmin } from './utils/auth.js';
import { getPosts, getUsers } from './utils/storage.js';

// Simple stub components for pages to avoid complex rendering
vi.mock('./pages/LandingPage.jsx', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('./pages/LoginPage.jsx', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('./pages/RegisterPage.jsx', () => ({
  RegisterPage: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock('./pages/Home.jsx', () => ({
  Home: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('./pages/ReadBlog.jsx', () => ({
  ReadBlog: () => <div data-testid="read-blog-page">Read Blog Page</div>,
}));

vi.mock('./pages/WriteBlog.jsx', () => ({
  WriteBlog: () => <div data-testid="write-blog-page">Write Blog Page</div>,
}));

vi.mock('./pages/AdminDashboard.jsx', () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>,
}));

vi.mock('./pages/UserManagement.jsx', () => ({
  UserManagement: () => <div data-testid="user-management-page">User Management Page</div>,
}));

// Import the actual App after mocks are set up
import App from './App.jsx';

/**
 * Helper to render the App at a specific route using MemoryRouter.
 * We cannot use BrowserRouter from App directly since App already wraps with BrowserRouter,
 * so we render App and rely on its internal BrowserRouter. However, to control the initial route,
 * we need a different approach: we'll test the routing logic by rendering the route structure
 * with MemoryRouter directly.
 */

function renderWithRouter(initialRoute = '/') {
  // We replicate the App route structure but with MemoryRouter so we can control initial entries
  const { LandingPage } = require('./pages/LandingPage.jsx');
  const { LoginPage } = require('./pages/LoginPage.jsx');
  const { RegisterPage } = require('./pages/RegisterPage.jsx');
  const { Home } = require('./pages/Home.jsx');
  const { ReadBlog } = require('./pages/ReadBlog.jsx');
  const { WriteBlog } = require('./pages/WriteBlog.jsx');
  const { AdminDashboard } = require('./pages/AdminDashboard.jsx');
  const { UserManagement } = require('./pages/UserManagement.jsx');

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
    </MemoryRouter>
  );
}

describe('App routing and access control', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    isAuthenticated.mockReturnValue(false);
    getCurrentUser.mockReturnValue(null);
    isAdmin.mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('public routes', () => {
    it('renders the LandingPage at /', () => {
      renderWithRouter('/');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('renders the LoginPage at /login', () => {
      renderWithRouter('/login');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders the RegisterPage at /register', () => {
      renderWithRouter('/register');
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('renders public routes without requiring authentication', () => {
      isAuthenticated.mockReturnValue(false);

      renderWithRouter('/');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });
  });

  describe('protected routes - unauthenticated users', () => {
    beforeEach(() => {
      isAuthenticated.mockReturnValue(false);
      getCurrentUser.mockReturnValue(null);
      isAdmin.mockReturnValue(false);
    });

    it('redirects unauthenticated users from /blogs to /login', () => {
      renderWithRouter('/blogs');
      expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /blog/:id to /login', () => {
      renderWithRouter('/blog/some-post-id');
      expect(screen.queryByTestId('read-blog-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /write to /login', () => {
      renderWithRouter('/write');
      expect(screen.queryByTestId('write-blog-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /edit/:id to /login', () => {
      renderWithRouter('/edit/some-post-id');
      expect(screen.queryByTestId('write-blog-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin to /login', () => {
      renderWithRouter('/admin');
      expect(screen.queryByTestId('admin-dashboard-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated users from /admin/users to /login', () => {
      renderWithRouter('/admin/users');
      expect(screen.queryByTestId('user-management-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('protected routes - authenticated regular users', () => {
    beforeEach(() => {
      isAuthenticated.mockReturnValue(true);
      getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      isAdmin.mockReturnValue(false);
    });

    it('renders Home page at /blogs for authenticated users', () => {
      renderWithRouter('/blogs');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders ReadBlog page at /blog/:id for authenticated users', () => {
      renderWithRouter('/blog/post-1');
      expect(screen.getByTestId('read-blog-page')).toBeInTheDocument();
    });

    it('renders WriteBlog page at /write for authenticated users', () => {
      renderWithRouter('/write');
      expect(screen.getByTestId('write-blog-page')).toBeInTheDocument();
    });

    it('renders WriteBlog page at /edit/:id for authenticated users', () => {
      renderWithRouter('/edit/post-1');
      expect(screen.getByTestId('write-blog-page')).toBeInTheDocument();
    });

    it('redirects non-admin users from /admin to /blogs', () => {
      renderWithRouter('/admin');
      expect(screen.queryByTestId('admin-dashboard-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('redirects non-admin users from /admin/users to /blogs', () => {
      renderWithRouter('/admin/users');
      expect(screen.queryByTestId('user-management-page')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('admin routes - authenticated admin users', () => {
    beforeEach(() => {
      isAuthenticated.mockReturnValue(true);
      getCurrentUser.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      isAdmin.mockReturnValue(true);
    });

    it('renders AdminDashboard at /admin for admin users', () => {
      renderWithRouter('/admin');
      expect(screen.getByTestId('admin-dashboard-page')).toBeInTheDocument();
    });

    it('renders UserManagement at /admin/users for admin users', () => {
      renderWithRouter('/admin/users');
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    it('renders Home page at /blogs for admin users', () => {
      renderWithRouter('/blogs');
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders WriteBlog page at /write for admin users', () => {
      renderWithRouter('/write');
      expect(screen.getByTestId('write-blog-page')).toBeInTheDocument();
    });

    it('renders ReadBlog page at /blog/:id for admin users', () => {
      renderWithRouter('/blog/post-1');
      expect(screen.getByTestId('read-blog-page')).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute component behavior', () => {
    it('renders children when user is authenticated and no admin requirement', () => {
      isAuthenticated.mockReturnValue(true);
      isAdmin.mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-redirect">Login</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to /login when user is not authenticated', () => {
      isAuthenticated.mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-redirect">Login</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-redirect')).toBeInTheDocument();
    });

    it('redirects to /blogs when requireAdmin is true but user is not admin', () => {
      isAuthenticated.mockReturnValue(true);
      isAdmin.mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <ProtectedRoute requireAdmin>
                  <div data-testid="admin-content">Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<div data-testid="blogs-redirect">Blogs</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('blogs-redirect')).toBeInTheDocument();
    });

    it('renders children when requireAdmin is true and user is admin', () => {
      isAuthenticated.mockReturnValue(true);
      isAdmin.mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route
              path="/test"
              element={
                <ProtectedRoute requireAdmin>
                  <div data-testid="admin-content">Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/blogs" element={<div data-testid="blogs-redirect">Blogs</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });
  });

  describe('public routes remain accessible when authenticated', () => {
    beforeEach(() => {
      isAuthenticated.mockReturnValue(true);
      getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      isAdmin.mockReturnValue(false);
    });

    it('renders LandingPage at / even when authenticated', () => {
      renderWithRouter('/');
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('renders LoginPage at /login even when authenticated', () => {
      renderWithRouter('/login');
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders RegisterPage at /register even when authenticated', () => {
      renderWithRouter('/register');
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });
  });
});