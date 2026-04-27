import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';

/**
 * Truncates content to a specified maximum length, appending ellipsis if truncated.
 * @param {string} content - The content string to truncate.
 * @param {number} [maxLength=150] - The maximum character length before truncation.
 * @returns {string}
 */
function truncateContent(content, maxLength = 150) {
  if (!content || content.length <= maxLength) {
    return content || '';
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

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
 * BlogCard component for displaying a blog post in a list.
 * Shows title, excerpt, date, author avatar, author name, and a conditional edit icon.
 * @param {object} props
 * @param {string} props.id - The unique post ID.
 * @param {string} props.title - The post title.
 * @param {string} props.content - The full post content (will be truncated).
 * @param {string} props.createdAt - The ISO date string of post creation.
 * @param {string} props.authorId - The ID of the post author.
 * @param {string} props.authorName - The display name of the post author.
 * @returns {JSX.Element}
 */
export function BlogCard({ id, title, content, createdAt, authorId, authorName }) {
  const currentUser = getCurrentUser();
  const isOwner = currentUser && currentUser.userId === authorId;
  const isAdminUser = currentUser && currentUser.role === 'admin';
  const canEdit = isOwner || isAdminUser;
  const authorRole = authorId === 'admin' ? 'admin' : 'user';

  return (
    <div className="bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getAvatar(authorRole, 'sm')}
            <div>
              <p className="text-sm font-medium text-neutral-800">{authorName}</p>
              <p className="text-xs text-neutral-500">{formatDate(createdAt)}</p>
            </div>
          </div>
          {canEdit && (
            <Link
              to={`/edit/${id}`}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
              aria-label={`Edit post: ${title}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-base">✏️</span>
            </Link>
          )}
        </div>
        <Link to={`/blog/${id}`} className="block group">
          <h2 className="text-lg font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
            {title}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {truncateContent(content)}
          </p>
        </Link>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  authorName: PropTypes.string.isRequired,
};

export default BlogCard;