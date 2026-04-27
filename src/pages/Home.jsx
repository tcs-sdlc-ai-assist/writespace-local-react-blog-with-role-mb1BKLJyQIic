import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { BlogCard } from '../components/BlogCard.jsx';

/**
 * Home page component for authenticated users.
 * Displays a responsive grid of blog posts sorted newest first.
 * Shows an empty state with a CTA to write a post if no posts exist.
 * @returns {JSX.Element}
 */
export function Home() {
  const [posts, setPosts] = useState([]);

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
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
            All Posts
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Discover the latest stories from the community
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl mb-6">
              <span>📝</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              No posts yet
            </h2>
            <p className="text-sm text-neutral-600 mb-6 max-w-md mx-auto">
              Be the first to share your thoughts with the community. Start writing your first post now!
            </p>
            <Link
              to="/write"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200"
            >
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                createdAt={post.createdAt}
                authorId={post.authorId}
                authorName={post.authorName}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;