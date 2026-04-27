import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPosts,
  savePosts,
  getUsers,
  saveUsers,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getPosts', () => {
    it('returns an empty array when no posts exist in localStorage', () => {
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns valid posts from localStorage', () => {
      const validPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Test content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
        {
          id: 'post-2',
          title: 'Another Post',
          content: 'More content',
          createdAt: '2024-01-02T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'Another User',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(validPosts));

      const posts = getPosts();
      expect(posts).toEqual(validPosts);
      expect(posts).toHaveLength(2);
    });

    it('filters out invalid post objects missing required fields', () => {
      const mixedPosts = [
        {
          id: 'post-1',
          title: 'Valid Post',
          content: 'Valid content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
        {
          id: 'post-2',
          title: 'Missing fields',
        },
        null,
        'not an object',
        {
          id: 123,
          title: 'Invalid id type',
          content: 'content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(mixedPosts));

      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('post-1');
    });

    it('returns an empty array when localStorage contains corrupted JSON', () => {
      localStorage.setItem('writespace_posts', 'not valid json{{{');

      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_posts', JSON.stringify({ not: 'an array' }));

      const posts = getPosts();
      expect(posts).toEqual([]);
    });
  });

  describe('savePosts', () => {
    it('saves posts to localStorage under the correct key', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Test content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Test User',
        },
      ];

      savePosts(posts);

      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toEqual(posts);
    });

    it('does not save when given a non-array value', () => {
      savePosts('not an array');
      expect(localStorage.getItem('writespace_posts')).toBeNull();
    });

    it('does not save when given null', () => {
      savePosts(null);
      expect(localStorage.getItem('writespace_posts')).toBeNull();
    });

    it('overwrites existing posts in localStorage', () => {
      const initialPosts = [
        {
          id: 'post-1',
          title: 'Initial',
          content: 'Content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'User',
        },
      ];
      savePosts(initialPosts);

      const newPosts = [
        {
          id: 'post-2',
          title: 'New',
          content: 'New Content',
          createdAt: '2024-01-02T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'User 2',
        },
      ];
      savePosts(newPosts);

      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toEqual(newPosts);
      expect(stored).toHaveLength(1);
    });
  });

  describe('getUsers', () => {
    it('returns an empty array when no users exist in localStorage', () => {
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns valid users from localStorage', () => {
      const validUsers = [
        {
          id: 'user-1',
          displayName: 'Test User',
          username: 'testuser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'user-2',
          displayName: 'Admin User',
          username: 'adminuser',
          password: 'admin123',
          role: 'admin',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(validUsers));

      const users = getUsers();
      expect(users).toEqual(validUsers);
      expect(users).toHaveLength(2);
    });

    it('filters out invalid user objects missing required fields', () => {
      const mixedUsers = [
        {
          id: 'user-1',
          displayName: 'Valid User',
          username: 'validuser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'user-2',
          displayName: 'Missing fields',
        },
        null,
        {
          id: 'user-3',
          displayName: 'Bad Role',
          username: 'badrole',
          password: 'password123',
          role: 'superadmin',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(mixedUsers));

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('user-1');
    });

    it('returns an empty array when localStorage contains corrupted JSON', () => {
      localStorage.setItem('writespace_users', '{{invalid json}}');

      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_users', JSON.stringify('a string'));

      const users = getUsers();
      expect(users).toEqual([]);
    });
  });

  describe('saveUsers', () => {
    it('saves users to localStorage under the correct key', () => {
      const users = [
        {
          id: 'user-1',
          displayName: 'Test User',
          username: 'testuser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      saveUsers(users);

      const stored = JSON.parse(localStorage.getItem('writespace_users'));
      expect(stored).toEqual(users);
    });

    it('does not save when given a non-array value', () => {
      saveUsers({ not: 'an array' });
      expect(localStorage.getItem('writespace_users')).toBeNull();
    });

    it('does not save when given undefined', () => {
      saveUsers(undefined);
      expect(localStorage.getItem('writespace_users')).toBeNull();
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists in localStorage', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns a valid session from localStorage', () => {
      const validSession = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(validSession));

      const session = getSession();
      expect(session).toEqual(validSession);
    });

    it('returns a valid admin session from localStorage', () => {
      const adminSession = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      localStorage.setItem('writespace_session', JSON.stringify(adminSession));

      const session = getSession();
      expect(session).toEqual(adminSession);
    });

    it('returns null when session has invalid schema', () => {
      const invalidSession = {
        userId: 'user-1',
        username: 'testuser',
      };
      localStorage.setItem('writespace_session', JSON.stringify(invalidSession));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session has invalid role', () => {
      const invalidSession = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'superadmin',
      };
      localStorage.setItem('writespace_session', JSON.stringify(invalidSession));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains corrupted JSON for session', () => {
      localStorage.setItem('writespace_session', 'not json');

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session value is null in localStorage', () => {
      localStorage.setItem('writespace_session', JSON.stringify(null));

      const session = getSession();
      expect(session).toBeNull();
    });
  });

  describe('saveSession', () => {
    it('saves a valid session to localStorage under the correct key', () => {
      const session = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };

      saveSession(session);

      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(session);
    });

    it('does not save an invalid session missing required fields', () => {
      const invalidSession = {
        userId: 'user-1',
      };

      saveSession(invalidSession);

      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not save a session with an invalid role', () => {
      const invalidSession = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'moderator',
      };

      saveSession(invalidSession);

      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not save null as a session', () => {
      saveSession(null);
      expect(localStorage.getItem('writespace_session')).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('removes the session from localStorage', () => {
      const session = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      clearSession();

      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('does not affect other localStorage keys', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Test',
          content: 'Content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'User',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      localStorage.setItem(
        'writespace_session',
        JSON.stringify({
          userId: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          role: 'user',
        })
      );

      clearSession();

      expect(localStorage.getItem('writespace_session')).toBeNull();
      expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual(posts);
    });
  });

  describe('round-trip integration', () => {
    it('can save and retrieve posts correctly', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Round Trip Post',
          content: 'Round trip content',
          createdAt: '2024-06-15T12:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Round Trip User',
        },
      ];

      savePosts(posts);
      const retrieved = getPosts();

      expect(retrieved).toEqual(posts);
    });

    it('can save and retrieve users correctly', () => {
      const users = [
        {
          id: 'user-1',
          displayName: 'Round Trip User',
          username: 'roundtrip',
          password: 'password123',
          role: 'user',
          createdAt: '2024-06-15T12:00:00.000Z',
        },
      ];

      saveUsers(users);
      const retrieved = getUsers();

      expect(retrieved).toEqual(users);
    });

    it('can save, retrieve, and clear a session correctly', () => {
      const session = {
        userId: 'user-1',
        username: 'roundtrip',
        displayName: 'Round Trip User',
        role: 'admin',
      };

      saveSession(session);
      expect(getSession()).toEqual(session);

      clearSession();
      expect(getSession()).toBeNull();
    });
  });
});