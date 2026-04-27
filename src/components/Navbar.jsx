import { Link, useNavigate } from 'react-router-dom';
import { getAvatar } from './Avatar.jsx';
import { getCurrentUser, isAdmin as checkIsAdmin, logout } from '../utils/auth.js';

/**
 * Navbar component for authenticated users.
 * Displays WriteSpace logo, navigation links (Blogs, Write, and Admin Dashboard/Users for admins),
 * user avatar with display name, and Logout button.
 * @returns {JSX.Element}
 */
export function Navbar() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const adminUser = checkIsAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = currentUser ? currentUser.displayName : '';
  const role = currentUser ? currentUser.role : 'user';

  return (
    <nav className="bg-white shadow-card sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/blogs"
              className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent"
            >
              ✍️ WriteSpace
            </Link>
            <div className="flex items-center gap-1">
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              >
                Blogs
              </Link>
              <Link
                to="/write"
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              >
                Write
              </Link>
              {adminUser && (
                <>
                  <Link
                    to="/admin"
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                  >
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getAvatar(role, 'sm')}
              <span className="text-sm font-medium text-neutral-800 hidden sm:inline">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:text-error-700 hover:bg-error-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;