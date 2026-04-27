import {
  getUsers,
  saveUsers,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

/**
 * Attempts to log in a user with the given credentials.
 * Checks hard-coded admin credentials first, then localStorage users.
 * @param {string} username - The username to log in with.
 * @param {string} password - The password to log in with.
 * @returns {{userId: string, username: string, displayName: string, role: string} | Error}
 */
export function login(username, password) {
  if (!username || !password) {
    return new Error('Username and password are required');
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = {
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    };
    saveSession(session);
    return session;
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return new Error('Invalid username or password');
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  saveSession(session);
  return session;
}

/**
 * Registers a new user with the given details.
 * Validates uniqueness of username, assigns 'user' role, generates ID via crypto.randomUUID().
 * @param {string} displayName - The display name for the new user.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password (min 6 characters).
 * @returns {{userId: string, username: string, displayName: string, role: string} | Error}
 */
export function register(displayName, username, password) {
  if (!displayName || !username || !password) {
    return new Error('All fields are required');
  }

  if (password.length < 6) {
    return new Error('Password must be at least 6 characters');
  }

  if (username === ADMIN_USERNAME) {
    return new Error('Username is already taken');
  }

  const users = getUsers();
  const existing = users.find((u) => u.username === username);

  if (existing) {
    return new Error('Username is already taken');
  }

  const newUser = {
    id: crypto.randomUUID(),
    displayName,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };
  saveSession(session);
  return session;
}

/**
 * Logs out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Checks if a user is currently authenticated.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

/**
 * Retrieves the current authenticated user's session data.
 * @returns {{userId: string, username: string, displayName: string, role: string} | null}
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Checks if the current authenticated user has the admin role.
 * @returns {boolean}
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}