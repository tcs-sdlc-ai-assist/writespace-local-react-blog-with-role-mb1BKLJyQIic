import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { isAuthenticated } from '../utils/auth.js';
import { PublicNavbar } from '../components/PublicNavbar.jsx';

/**
 * Truncates content to a specified maximum length, appending ellipsis if truncated.
 * @param {string} content - The content string to truncate.
 * @param {number} [maxLength=120] - The maximum character length before truncation.
 * @returns {string}
 */
function truncateContent(content, maxLength = 120) {
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
 * Feature card component for the features section.
 * @param {object} props
 * @param {string} props.icon - The emoji icon to display.
 * @param {string} props.title - The feature title.
 * @param {string} props.description - The feature description.
 * @returns {JSX.Element}
 */
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 transition-shadow duration-200 hover:shadow-card-hover animate-fade-in">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-xl mb-4">
        <span>{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * Post preview card for the latest posts section on the landing page.
 * Clicking redirects to /login if not authenticated, otherwise to the blog post.
 * @param {object} props
 * @param {object} props.post - The post object.
 * @param {function} props.onClick - Click handler for the card.
 * @returns {JSX.Element}
 */
function PostPreviewCard({ post, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-card p-6 transition-shadow duration-200 hover:shadow-card-hover animate-fade-in cursor-pointer"
      role="article"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-neutral-500">{formatDate(post.createdAt)}</span>
        <span className="text-xs text-neutral-400">·</span>
        <span className="text-xs text-neutral-500">{post.authorName}</span>
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2 hover:text-primary-600 transition-colors duration-200">
        {post.title}
      </h3>
      <p className="text-sm text-neutral-600 leading-relaxed">
        {truncateContent(post.content)}
      </p>
    </div>
  );
}

/**
 * LandingPage component - public landing page accessible without login.
 * Contains hero section, features section, latest posts preview, and footer.
 * @returns {JSX.Element}
 */
export function LandingPage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const allPosts = getPosts();
      const sorted = [...allPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestPosts(sorted.slice(0, 3));
    } catch {
      setLatestPosts([]);
    }
  }, []);

  const handlePostClick = (postId) => {
    if (isAuthenticated()) {
      navigate(`/blog/${postId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-subtle py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6 animate-fade-in">
            Your Space to Write,
            <br />
            Share &amp; Inspire
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 animate-fade-in">
            WriteSpace is a modern writing platform where ideas come to life. Create, share, and
            discover stories that matter.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-neutral-700 bg-white shadow-card hover:shadow-card-hover transition-shadow duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Everything you need to express your thoughts and connect with readers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="✍️"
              title="Simple Writing"
              description="A clean, distraction-free editor that lets you focus on what matters most — your words."
            />
            <FeatureCard
              icon="🌍"
              title="Share Instantly"
              description="Publish your posts and share them with the community in just one click. No setup required."
            />
            <FeatureCard
              icon="🔒"
              title="Your Content, Your Control"
              description="Full ownership of your posts with role-based access. Edit or delete anytime you want."
            />
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                Latest Posts
              </h2>
              <p className="text-neutral-600 max-w-xl mx-auto">
                See what the community has been writing about recently.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <PostPreviewCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
              >
                Sign in to read more
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-neutral-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold text-white">✍️ WriteSpace</span>
              <p className="text-sm text-neutral-400 mt-1">
                A modern platform for writers and readers.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/login"
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-800 pt-6 text-center">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;