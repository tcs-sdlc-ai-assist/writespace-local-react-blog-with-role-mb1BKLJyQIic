import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  isAdmin,
} from './auth.js';

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('returns a session for the hard-coded admin with correct credentials', () => {
      const result = login('admin', 'admin123');
      expect(result).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
    });

    it('saves the session to localStorage for the hard-coded admin', () => {
      login('admin', 'admin123');
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
    });

    it('returns an Error for the hard-coded admin with wrong password', () => {
      const result = login('admin', 'wrongpassword');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Invalid username or password');
    });

    it('returns a session for a registered localStorage user with correct credentials', () => {
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
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const result = login('testuser', 'password123');
      expect(result).toEqual({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
    });

    it('saves the session to localStorage for a registered user', () => {
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
      localStorage.setItem('writespace_users', JSON.stringify(users));

      login('testuser', 'password123');
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
    });

    it('returns an Error for a registered user with wrong password', () => {
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
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const result = login('testuser', 'wrongpassword');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Invalid username or password');
    });

    it('returns an Error for a non-existent username', () => {
      const result = login('nonexistent', 'password123');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Invalid username or password');
    });

    it('returns an Error when username is empty', () => {
      const result = login('', 'password123');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Username and password are required');
    });

    it('returns an Error when password is empty', () => {
      const result = login('admin', '');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Username and password are required');
    });

    it('returns an Error when both username and password are empty', () => {
      const result = login('', '');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Username and password are required');
    });

    it('returns a session for a registered admin-role user', () => {
      const users = [
        {
          id: 'user-admin',
          displayName: 'Custom Admin',
          username: 'customadmin',
          password: 'adminpass123',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const result = login('customadmin', 'adminpass123');
      expect(result).toEqual({
        userId: 'user-admin',
        username: 'customadmin',
        displayName: 'Custom Admin',
        role: 'admin',
      });
    });
  });

  describe('register', () => {
    it('registers a new user and returns a session', () => {
      const result = register('New User', 'newuser', 'password123');
      expect(result).toMatchObject({
        username: 'newuser',
        displayName: 'New User',
        role: 'user',
      });
      expect(result.userId).toBeDefined();
      expect(typeof result.userId).toBe('string');
    });

    it('saves the new user to localStorage', () => {
      register('New User', 'newuser', 'password123');
      const users = JSON.parse(localStorage.getItem('writespace_users'));
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('newuser');
      expect(users[0].displayName).toBe('New User');
      expect(users[0].role).toBe('user');
      expect(users[0].password).toBe('password123');
      expect(users[0].id).toBeDefined();
      expect(users[0].createdAt).toBeDefined();
    });

    it('saves the session to localStorage after registration', () => {
      register('New User', 'newuser', 'password123');
      const session = JSON.parse(localStorage.getItem('writespace_session'));
      expect(session).toMatchObject({
        username: 'newuser',
        displayName: 'New User',
        role: 'user',
      });
      expect(session.userId).toBeDefined();
    });

    it('assigns the user role by default', () => {
      const result = register('New User', 'newuser', 'password123');
      expect(result.role).toBe('user');
    });

    it('returns an Error when username is already taken by a registered user', () => {
      const users = [
        {
          id: 'user-1',
          displayName: 'Existing User',
          username: 'existinguser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const result = register('Another User', 'existinguser', 'password456');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Username is already taken');
    });

    it('returns an Error when username is the hard-coded admin username', () => {
      const result = register('Fake Admin', 'admin', 'password123');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Username is already taken');
    });

    it('returns an Error when displayName is empty', () => {
      const result = register('', 'newuser', 'password123');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('All fields are required');
    });

    it('returns an Error when username is empty', () => {
      const result = register('New User', '', 'password123');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('All fields are required');
    });

    it('returns an Error when password is empty', () => {
      const result = register('New User', 'newuser', '');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('All fields are required');
    });

    it('returns an Error when password is shorter than 6 characters', () => {
      const result = register('New User', 'newuser', '12345');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Password must be at least 6 characters');
    });

    it('allows password of exactly 6 characters', () => {
      const result = register('New User', 'newuser', '123456');
      expect(result).not.toBeInstanceOf(Error);
      expect(result.username).toBe('newuser');
    });

    it('appends to existing users in localStorage', () => {
      const existingUsers = [
        {
          id: 'user-1',
          displayName: 'Existing User',
          username: 'existinguser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(existingUsers));

      register('New User', 'newuser', 'password123');

      const users = JSON.parse(localStorage.getItem('writespace_users'));
      expect(users).toHaveLength(2);
      expect(users[0].username).toBe('existinguser');
      expect(users[1].username).toBe('newuser');
    });
  });

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      const session = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      logout();

      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
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

      logout();

      expect(localStorage.getItem('writespace_session')).toBeNull();
      expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual(posts);
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when a valid session exists', () => {
      const session = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      expect(isAuthenticated()).toBe(true);
    });

    it('returns true when an admin session exists', () => {
      const session = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when session data is invalid', () => {
      localStorage.setItem('writespace_session', JSON.stringify({ userId: 'user-1' }));

      expect(isAuthenticated()).toBe(false);
    });

    it('returns false when session data is corrupted JSON', () => {
      localStorage.setItem('writespace_session', 'not valid json');

      expect(isAuthenticated()).toBe(false);
    });

    it('returns true after a successful login', () => {
      login('admin', 'admin123');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      logout();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns the session object when a valid session exists', () => {
      const session = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      expect(getCurrentUser()).toEqual(session);
    });

    it('returns the admin session after admin login', () => {
      login('admin', 'admin123');
      const user = getCurrentUser();
      expect(user).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
    });

    it('returns the user session after registration', () => {
      register('New User', 'newuser', 'password123');
      const user = getCurrentUser();
      expect(user).toMatchObject({
        username: 'newuser',
        displayName: 'New User',
        role: 'user',
      });
      expect(user.userId).toBeDefined();
    });

    it('returns null after logout', () => {
      login('admin', 'admin123');
      logout();
      expect(getCurrentUser()).toBeNull();
    });

    it('returns null when session data is invalid', () => {
      localStorage.setItem('writespace_session', JSON.stringify({ incomplete: true }));
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns true when the hard-coded admin is logged in', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);
    });

    it('returns false when a regular user is logged in', () => {
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
      localStorage.setItem('writespace_users', JSON.stringify(users));

      login('testuser', 'password123');
      expect(isAdmin()).toBe(false);
    });

    it('returns true when a registered admin-role user is logged in', () => {
      const users = [
        {
          id: 'user-admin',
          displayName: 'Custom Admin',
          username: 'customadmin',
          password: 'adminpass123',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));

      login('customadmin', 'adminpass123');
      expect(isAdmin()).toBe(true);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);
      logout();
      expect(isAdmin()).toBe(false);
    });

    it('returns false when a newly registered user is logged in', () => {
      register('New User', 'newuser', 'password123');
      expect(isAdmin()).toBe(false);
    });

    it('returns false when session has an invalid role', () => {
      localStorage.setItem(
        'writespace_session',
        JSON.stringify({
          userId: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          role: 'superadmin',
        })
      );
      expect(isAdmin()).toBe(false);
    });
  });

  describe('integration: login → getCurrentUser → logout → isAuthenticated', () => {
    it('completes a full authentication lifecycle', () => {
      expect(isAuthenticated()).toBe(false);
      expect(getCurrentUser()).toBeNull();
      expect(isAdmin()).toBe(false);

      const loginResult = login('admin', 'admin123');
      expect(loginResult).not.toBeInstanceOf(Error);

      expect(isAuthenticated()).toBe(true);
      expect(getCurrentUser()).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      expect(isAdmin()).toBe(true);

      logout();

      expect(isAuthenticated()).toBe(false);
      expect(getCurrentUser()).toBeNull();
      expect(isAdmin()).toBe(false);
    });

    it('completes a full registration lifecycle', () => {
      expect(isAuthenticated()).toBe(false);

      const registerResult = register('New User', 'newuser', 'password123');
      expect(registerResult).not.toBeInstanceOf(Error);

      expect(isAuthenticated()).toBe(true);
      expect(isAdmin()).toBe(false);

      const user = getCurrentUser();
      expect(user.username).toBe('newuser');
      expect(user.displayName).toBe('New User');
      expect(user.role).toBe('user');

      logout();

      expect(isAuthenticated()).toBe(false);

      const loginResult = login('newuser', 'password123');
      expect(loginResult).not.toBeInstanceOf(Error);
      expect(isAuthenticated()).toBe(true);
      expect(getCurrentUser().username).toBe('newuser');
    });
  });
});