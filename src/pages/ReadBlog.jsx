import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPosts, savePosts } from '../utils/storage.js';
import { getCurrentUser, isAdmin as checkIsAdmin } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';

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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * ReadBlog page component for displaying a full blog post.
 * Accessible at /blog/:id. Shows post title, full content, creation date,
 * author name with avatar, and conditional edit/delete/back buttons.
 * Admin can delete any post; regular users can only edit/delete their own.
 * @returns {JSX.Element}
 */
export function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentUser = getCurrentUser();
  const adminUser = checkIsAdmin();

  useEffect(() => {
    try {
      const allPosts = getPosts();
      const found = allPosts.find((p) => p.id === id);
      if (found) {
        setPost(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [id]);

  const isOwner = currentUser && post && currentUser.userId === post.authorId;
  const canEdit = isOwner || adminUser;
  const canDelete = isOwner || adminUser;
  const authorRole = post && post.authorId === 'admin' ? 'admin' : 'user';

  const handleDelete = () => {
    try {
      const allPosts = getPosts();
      const filtered = allPosts.filter((p) => p.id !== id);
      savePosts(filtered);
      navigate('/blogs', { replace: true });
    } catch {
      navigate('/blogs', { replace: true });
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center animate-fade-in">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-error-50 text-3xl mb-6">
              <span>🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Post Not Found
            </h1>
            <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
              The post you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Back to Blogs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center animate-fade-in">
            <p className="text-sm text-neutral-600">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 animate-fade-in">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors duration-200"
          >
            <span>←</span>
            <span>Back to Blogs</span>
          </Link>
        </div>

        <article className="bg-white rounded-2xl shadow-card p-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            {getAvatar(authorRole, 'md')}
            <div>
              <p className="text-sm font-medium text-neutral-800">{post.authorName}</p>
              <p className="text-xs text-neutral-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-6">
            {post.title}
          </h1>

          <div className="prose max-w-none">
            <p className="text-base text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {(canEdit || canDelete) && (
            <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center gap-3">
              {canEdit && (
                <Link
                  to={`/edit/${post.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
                >
                  ✏️ Edit Post
                </Link>
              )}
              {canDelete && !showConfirm && (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-error-700 bg-error-50 hover:bg-error-50/80 transition-colors duration-200"
                >
                  🗑️ Delete Post
                </button>
              )}
              {canDelete && showConfirm && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-sm text-neutral-600">Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-error-500 hover:bg-error-700 transition-colors duration-200"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

export default ReadBlog;