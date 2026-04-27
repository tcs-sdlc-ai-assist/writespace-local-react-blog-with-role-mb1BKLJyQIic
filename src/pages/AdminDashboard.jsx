import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, savePosts, getUsers } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';

/**
 * Formats an ISO date string into a human-readable format.
 * @param {string} dateString - The ISO date string to format.
 * @returns {string}
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncates content to a specified maximum length, appending ellipsis if truncated.
 * @param {string} content - The content string to truncate.
 * @param {number} [maxLength=100] - The maximum character length before truncation.
 * @returns {string}
 */
function truncateContent(content, maxLength = 100) {
  if (!content || content.length <= maxLength) {
    return content || '';
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * AdminDashboard page component for admin users.
 * Displays stat cards, quick-action buttons, and recent posts with edit/delete controls.
 * Accessible at /admin. Non-admins are redirected by ProtectedRoute.
 * @returns {JSX.Element}
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    try {
      const allPosts = getPosts();
      const sorted = [...allPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sorted);
    } catch {
      setPosts([]);
    }

    try {
      const allUsers = getUsers();
      setUsers(allUsers);
    } catch {
      setUsers([]);
    }
  }, []);

  const totalPosts = posts.length;
  // +1 for the hard-coded admin who is not stored in localStorage users
  const totalUsers = users.length + 1;
  const adminCount = users.filter((u) => u.role === 'admin').length + 1;
  const userCount = users.filter((u) => u.role === 'user').length;

  const recentPosts = posts.slice(0, 5);

  const handleDelete = (postId) => {
    try {
      const allPosts = getPosts();
      const filtered = allPosts.filter((p) => p.id !== postId);
      savePosts(filtered);
      const sorted = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sorted);
      setDeleteConfirmId(null);
    } catch {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Banner Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-sm text-white/80">
            Welcome back, {currentUser ? currentUser.displayName : 'Admin'}. Here&apos;s an overview of your platform.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            icon="📝"
            color="primary"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon="👥"
            color="secondary"
          />
          <StatCard
            title="Admins"
            value={adminCount}
            icon="👑"
            color="warning"
          />
          <StatCard
            title="Users"
            value={userCount}
            icon="📖"
            color="success"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="flex items-center gap-3">
            <Link
              to="/write"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              ✍️ Write Post
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-700 bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200"
            >
              👥 Manage Users
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Recent Posts</h2>
            <Link
              to="/blogs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              View All →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-card animate-fade-in">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl mb-6">
                <span>📝</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                No posts yet
              </h3>
              <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
                Get started by creating the first post on the platform.
              </p>
              <Link
                to="/write"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
              >
                Write Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <Link
                          to={`/blog/${post.id}`}
                          className="block group"
                        >
                          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 mb-1 truncate">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-neutral-600 leading-relaxed mb-2">
                          {truncateContent(post.content)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">{post.authorName}</span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs text-neutral-500">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/edit/${post.id}`}
                          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                          aria-label={`Edit post: ${post.title}`}
                        >
                          <span className="text-base">✏️</span>
                        </Link>
                        {deleteConfirmId !== post.id ? (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 hover:text-error-700 hover:bg-error-50 transition-colors duration-200"
                            aria-label={`Delete post: ${post.title}`}
                          >
                            <span className="text-base">🗑️</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <button
                              type="button"
                              onClick={() => handleDelete(post.id)}
                              className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-error-500 hover:bg-error-700 transition-colors duration-200"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;