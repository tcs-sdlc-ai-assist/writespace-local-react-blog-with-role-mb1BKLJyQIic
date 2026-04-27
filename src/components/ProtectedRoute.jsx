import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, isAdmin } from '../utils/auth.js';

/**
 * Route guard component for protected routes.
 * Checks authentication and optionally admin role before rendering children.
 * @param {object} props
 * @param {boolean} [props.requireAdmin=false] - Whether the route requires admin role.
 * @param {JSX.Element} props.children - The child elements to render if access is granted.
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ requireAdmin = false, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  requireAdmin: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;