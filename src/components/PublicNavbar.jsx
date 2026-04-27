import { Link } from 'react-router-dom';

/**
 * PublicNavbar component for unauthenticated (guest) users.
 * Displays WriteSpace logo/brand, Login button, and Get Started button.
 * Links to / (landing), /login, and /register.
 * @returns {JSX.Element}
 */
export function PublicNavbar() {
  return (
    <nav className="bg-white shadow-card sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent"
          >
            ✍️ WriteSpace
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;