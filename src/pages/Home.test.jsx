import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../utils/storage.js', () => ({
  getPosts: vi.fn(() => []),
  savePosts: vi.fn(),
  getUsers: vi.fn(() => []),
  saveUsers: vi.fn(),
  getSession: vi.fn(() => null),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('../utils/auth.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(() => true),
  getCurrentUser: vi.fn(() => ({
    userId: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    role: 'user',
  })),
  isAdmin: vi.fn(() => false),
}));

import { getPosts } from '../utils/storage.js';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { Home } from './Home.jsx';

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/blogs']}>
      <Home />
    </MemoryRouter>
  );
}

const makePosts = (count) => {
  const posts = [];
  for (let i = 1; i <= count; i++) {
    posts.push({
      id: `post-${i}`,
      title: `Post Title ${i}`,
      content: `This is the content for post number ${i}. It has some text to display.`,
      createdAt: new Date(2024, 0, i).toISOString(),
      authorId: `user-${i}`,
      authorName: `Author ${i}`,
    });
  }
  return posts;
};

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPosts.mockReturnValue([]);
    getCurrentUser.mockReturnValue({
      userId: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    });
    isAdmin.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('page header', () => {
    it('renders the page title "All Posts"', () => {
      renderHome();
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      renderHome();
      expect(screen.getByText('Discover the latest stories from the community')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('displays empty state when no posts exist', () => {
      getPosts.mockReturnValue([]);
      renderHome();
      expect(screen.getByText('No posts yet')).toBeInTheDocument();
    });

    it('displays a message encouraging the user to write', () => {
      getPosts.mockReturnValue([]);
      renderHome();
      expect(
        screen.getByText('Be the first to share your thoughts with the community. Start writing your first post now!')
      ).toBeInTheDocument();
    });

    it('displays a "Write Your First Post" link in empty state', () => {
      getPosts.mockReturnValue([]);
      renderHome();
      const link = screen.getByRole('link', { name: 'Write Your First Post' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/write');
    });

    it('does not render any blog cards when there are no posts', () => {
      getPosts.mockReturnValue([]);
      renderHome();
      expect(screen.queryByText(/Post Title/)).not.toBeInTheDocument();
    });
  });

  describe('rendering posts', () => {
    it('renders blog cards when posts exist', () => {
      const posts = makePosts(3);
      getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.getByText('Post Title 1')).toBeInTheDocument();
      expect(screen.getByText('Post Title 2')).toBeInTheDocument();
      expect(screen.getByText('Post Title 3')).toBeInTheDocument();
    });

    it('does not display empty state when posts exist', () => {
      const posts = makePosts(1);
      getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.queryByText('No posts yet')).not.toBeInTheDocument();
    });

    it('renders author names for each post', () => {
      const posts = makePosts(2);
      getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.getByText('Author 1')).toBeInTheDocument();
      expect(screen.getByText('Author 2')).toBeInTheDocument();
    });

    it('renders links to individual blog posts', () => {
      const posts = makePosts(2);
      getPosts.mockReturnValue(posts);
      renderHome();

      const link1 = screen.getByRole('link', { name: /Post Title 1/ });
      const link2 = screen.getByRole('link', { name: /Post Title 2/ });
      expect(link1).toHaveAttribute('href', '/blog/post-1');
      expect(link2).toHaveAttribute('href', '/blog/post-2');
    });
  });

  describe('post sorting (newest first)', () => {
    it('renders posts sorted by createdAt in descending order', () => {
      const posts = [
        {
          id: 'post-old',
          title: 'Old Post',
          content: 'Old content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Author One',
        },
        {
          id: 'post-new',
          title: 'New Post',
          content: 'New content',
          createdAt: '2024-06-15T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'Author Two',
        },
        {
          id: 'post-mid',
          title: 'Mid Post',
          content: 'Mid content',
          createdAt: '2024-03-10T00:00:00.000Z',
          authorId: 'user-3',
          authorName: 'Author Three',
        },
      ];
      getPosts.mockReturnValue(posts);
      renderHome();

      const titles = screen.getAllByRole('heading', { level: 2 });
      expect(titles[0]).toHaveTextContent('New Post');
      expect(titles[1]).toHaveTextContent('Mid Post');
      expect(titles[2]).toHaveTextContent('Old Post');
    });
  });

  describe('grid layout', () => {
    it('renders posts inside a grid container', () => {
      const posts = makePosts(3);
      getPosts.mockReturnValue(posts);
      const { container } = renderHome();

      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();
      expect(gridElement.className).toContain('grid-cols-1');
    });
  });

  describe('BlogCard props', () => {
    it('renders edit link for posts owned by the current user', () => {
      getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });

      const posts = [
        {
          id: 'post-mine',
          title: 'My Post',
          content: 'My content here',
          createdAt: '2024-06-15T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
      ];
      getPosts.mockReturnValue(posts);
      renderHome();

      const editLink = screen.getByRole('link', { name: /Edit post: My Post/ });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/edit/post-mine');
    });

    it('does not render edit link for posts not owned by the current user', () => {
      getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });

      const posts = [
        {
          id: 'post-other',
          title: 'Other Post',
          content: 'Other content here',
          createdAt: '2024-06-15T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'Other User',
        },
      ];
      getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.queryByRole('link', { name: /Edit post: Other Post/ })).not.toBeInTheDocument();
    });

    it('renders edit link for all posts when user is admin', () => {
      getCurrentUser.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      isAdmin.mockReturnValue(true);

      const posts = [
        {
          id: 'post-other',
          title: 'Someone Else Post',
          content: 'Content by someone else',
          createdAt: '2024-06-15T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'Other User',
        },
      ];
      getPosts.mockReturnValue(posts);
      renderHome();

      const editLink = screen.getByRole('link', { name: /Edit post: Someone Else Post/ });
      expect(editLink).toBeInTheDocument();
    });

    it('truncates long content in blog cards', () => {
      const longContent = 'A'.repeat(200);
      const posts = [
        {
          id: 'post-long',
          title: 'Long Post',
          content: longContent,
          createdAt: '2024-06-15T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
      ];
      getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.queryByText(longContent)).not.toBeInTheDocument();
      expect(screen.getByText(/A+…/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('renders empty state when getPosts throws an error', () => {
      getPosts.mockImplementation(() => {
        throw new Error('Storage error');
      });
      renderHome();

      expect(screen.getByText('No posts yet')).toBeInTheDocument();
    });
  });

  describe('navbar', () => {
    it('renders the Navbar with WriteSpace branding', () => {
      renderHome();
      expect(screen.getByText('✍️ WriteSpace')).toBeInTheDocument();
    });

    it('renders the Blogs navigation link', () => {
      renderHome();
      const blogsLinks = screen.getAllByRole('link', { name: 'Blogs' });
      expect(blogsLinks.length).toBeGreaterThan(0);
    });

    it('renders the Write navigation link', () => {
      renderHome();
      const writeLink = screen.getByRole('link', { name: 'Write' });
      expect(writeLink).toBeInTheDocument();
      expect(writeLink).toHaveAttribute('href', '/write');
    });

    it('renders the Logout button', () => {
      renderHome();
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    });
  });
});