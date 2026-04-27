import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPosts, savePosts } from '../utils/storage.js';
import { getCurrentUser, isAdmin as checkIsAdmin } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';

const TITLE_MAX_LENGTH = 200;
const CONTENT_MAX_LENGTH = 10000;

/**
 * WriteBlog page component for creating and editing blog posts.
 * Used for both /write (create) and /edit/:id (edit).
 * In edit mode, pre-fills form with existing post data and enforces ownership check.
 * Admin can edit any post; regular users can only edit their own.
 * Validates required fields (title, content) with character counter.
 * @returns {JSX.Element}
 */
export function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const adminUser = checkIsAdmin();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    try {
      const allPosts = getPosts();
      const existingPost = allPosts.find((p) => p.id === id);

      if (!existingPost) {
        setNotFound(true);
        return;
      }

      const isOwner = currentUser && currentUser.userId === existingPost.authorId;
      const canEdit = isOwner || adminUser;

      if (!canEdit) {
        setUnauthorized(true);
        return;
      }

      setTitle(existingPost.title);
      setContent(existingPost.content);
    } catch {
      setNotFound(true);
    }
  }, [id, isEditMode, currentUser, adminUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      setError(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
      return;
    }

    if (!trimmedContent) {
      setError('Content is required');
      return;
    }

    if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      setError(`Content must be ${CONTENT_MAX_LENGTH} characters or less`);
      return;
    }

    setLoading(true);

    try {
      const allPosts = getPosts();

      if (isEditMode) {
        const postIndex = allPosts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
          setError('Post not found. It may have been deleted.');
          setLoading(false);
          return;
        }

        allPosts[postIndex] = {
          ...allPosts[postIndex],
          title: trimmedTitle,
          content: trimmedContent,
        };

        savePosts(allPosts);
        navigate(`/blog/${id}`, { replace: true });
      } else {
        const newPost = {
          id: crypto.randomUUID(),
          title: trimmedTitle,
          content: trimmedContent,
          createdAt: new Date().toISOString(),
          authorId: currentUser.userId,
          authorName: currentUser.displayName,
        };

        allPosts.push(newPost);
        savePosts(allPosts);
        navigate(`/blog/${newPost.id}`, { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/blogs');
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
              The post you&apos;re trying to edit doesn&apos;t exist or may have been removed.
            </p>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Back to Blogs
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="text-center animate-fade-in">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning-50 text-3xl mb-6">
              <span>🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Unauthorized
            </h1>
            <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
              You don&apos;t have permission to edit this post.
            </p>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Back to Blogs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            {isEditMode
              ? 'Update your post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8 animate-fade-in">
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 animate-fade-in">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Title
                </label>
                <span
                  className={`text-xs ${
                    title.length > TITLE_MAX_LENGTH
                      ? 'text-error-700'
                      : 'text-neutral-500'
                  }`}
                >
                  {title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title"
                className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Content
                </label>
                <span
                  className={`text-xs ${
                    content.length > CONTENT_MAX_LENGTH
                      ? 'text-error-700'
                      : 'text-neutral-500'
                  }`}
                >
                  {content.length}/{CONTENT_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here…"
                rows={12}
                className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 resize-y"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? isEditMode
                    ? 'Saving…'
                    : 'Publishing…'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Publish Post'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default WriteBlog;