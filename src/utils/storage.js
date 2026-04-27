const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/**
 * Safely checks if localStorage is available.
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__writespace_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parses JSON from localStorage.
 * Returns the fallback value if parsing fails or localStorage is unavailable.
 * @param {string} key - The localStorage key to read.
 * @param {*} fallback - The fallback value on failure.
 * @returns {*}
 */
function safeGetItem(key, fallback) {
  if (!isLocalStorageAvailable()) {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Safely writes a JSON-serializable value to localStorage.
 * Silently fails if localStorage is unavailable.
 * @param {string} key - The localStorage key to write.
 * @param {*} value - The value to serialize and store.
 */
function safeSetItem(key, value) {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Safely removes a key from localStorage.
 * @param {string} key - The localStorage key to remove.
 */
function safeRemoveItem(key) {
  if (!isLocalStorageAvailable()) {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Validates that a post object has the required schema fields.
 * @param {object} post - The post object to validate.
 * @returns {boolean}
 */
function isValidPost(post) {
  return (
    post !== null &&
    typeof post === 'object' &&
    typeof post.id === 'string' &&
    typeof post.title === 'string' &&
    typeof post.content === 'string' &&
    typeof post.createdAt === 'string' &&
    typeof post.authorId === 'string' &&
    typeof post.authorName === 'string'
  );
}

/**
 * Validates that a user object has the required schema fields.
 * @param {object} user - The user object to validate.
 * @returns {boolean}
 */
function isValidUser(user) {
  return (
    user !== null &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.username === 'string' &&
    typeof user.password === 'string' &&
    (user.role === 'admin' || user.role === 'user') &&
    typeof user.createdAt === 'string'
  );
}

/**
 * Validates that a session object has the required schema fields.
 * @param {object} session - The session object to validate.
 * @returns {boolean}
 */
function isValidSession(session) {
  return (
    session !== null &&
    typeof session === 'object' &&
    typeof session.userId === 'string' &&
    typeof session.username === 'string' &&
    typeof session.displayName === 'string' &&
    (session.role === 'admin' || session.role === 'user')
  );
}

/**
 * Retrieves all posts from localStorage.
 * Returns an empty array if data is missing, corrupted, or localStorage is unavailable.
 * @returns {Array<{id: string, title: string, content: string, createdAt: string, authorId: string, authorName: string}>}
 */
export function getPosts() {
  const data = safeGetItem(POSTS_KEY, []);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(isValidPost);
}

/**
 * Saves an array of posts to localStorage.
 * @param {Array<{id: string, title: string, content: string, createdAt: string, authorId: string, authorName: string}>} posts
 */
export function savePosts(posts) {
  if (!Array.isArray(posts)) {
    return;
  }
  safeSetItem(POSTS_KEY, posts);
}

/**
 * Retrieves all users from localStorage.
 * Returns an empty array if data is missing, corrupted, or localStorage is unavailable.
 * @returns {Array<{id: string, displayName: string, username: string, password: string, role: string, createdAt: string}>}
 */
export function getUsers() {
  const data = safeGetItem(USERS_KEY, []);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.filter(isValidUser);
}

/**
 * Saves an array of users to localStorage.
 * @param {Array<{id: string, displayName: string, username: string, password: string, role: string, createdAt: string}>} users
 */
export function saveUsers(users) {
  if (!Array.isArray(users)) {
    return;
  }
  safeSetItem(USERS_KEY, users);
}

/**
 * Retrieves the current session from localStorage.
 * Returns null if no session exists, data is corrupted, or localStorage is unavailable.
 * @returns {{userId: string, username: string, displayName: string, role: string} | null}
 */
export function getSession() {
  const data = safeGetItem(SESSION_KEY, null);
  if (data === null || !isValidSession(data)) {
    return null;
  }
  return data;
}

/**
 * Saves a session object to localStorage.
 * @param {{userId: string, username: string, displayName: string, role: string}} session
 */
export function saveSession(session) {
  if (!isValidSession(session)) {
    return;
  }
  safeSetItem(SESSION_KEY, session);
}

/**
 * Clears the current session from localStorage.
 */
export function clearSession() {
  safeRemoveItem(SESSION_KEY);
}