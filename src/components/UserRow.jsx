import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';

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
 * UserRow component for admin user management.
 * Displays user info (displayName, username, role, createdAt) with avatar,
 * role badge pill, and delete button.
 * Delete button is disabled for hard-coded admin and for the currently logged-in user.
 * @param {object} props
 * @param {string} props.id - The unique user ID.
 * @param {string} props.displayName - The user's display name.
 * @param {string} props.username - The user's username.
 * @param {'admin' | 'user'} props.role - The user's role.
 * @param {string} props.createdAt - The ISO date string of user creation.
 * @param {function} props.onDelete - Callback invoked with the user ID when delete is clicked.
 * @returns {JSX.Element}
 */
export function UserRow({ id, displayName, username, role, createdAt, onDelete }) {
  const currentUser = getCurrentUser();
  const isHardCodedAdmin = id === 'admin';
  const isCurrentUser = currentUser && currentUser.userId === id;
  const isDeleteDisabled = isHardCodedAdmin || isCurrentUser;

  const roleBadgeClasses =
    role === 'admin'
      ? 'bg-violet-100 text-violet-700'
      : 'bg-primary-100 text-primary-700';

  let tooltipText = '';
  if (isHardCodedAdmin) {
    tooltipText = 'Cannot delete the default admin';
  } else if (isCurrentUser) {
    tooltipText = 'Cannot delete your own account';
  }

  return (
    <div className="bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar role={role} size="md" />
            <div>
              <p className="text-sm font-bold text-neutral-900">{displayName}</p>
              <p className="text-xs text-neutral-500">@{username}</p>
              <p className="text-xs text-neutral-400 mt-1">Joined {formatDate(createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`${roleBadgeClasses} inline-flex items-center rounded-full px-3 py-1 text-xs font-medium`}
            >
              {role === 'admin' ? 'Admin' : 'User'}
            </span>
            <div className="relative group">
              <button
                type="button"
                onClick={() => onDelete(id)}
                disabled={isDeleteDisabled}
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm transition-colors duration-200 ${
                  isDeleteDisabled
                    ? 'text-neutral-300 cursor-not-allowed'
                    : 'text-neutral-500 hover:text-error-700 hover:bg-error-50'
                }`}
                aria-label={`Delete user ${displayName}`}
              >
                <span>🗑️</span>
              </button>
              {isDeleteDisabled && tooltipText && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-white shadow-soft">
                  {tooltipText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

UserRow.propTypes = {
  id: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  createdAt: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;