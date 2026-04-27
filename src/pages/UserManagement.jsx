import { useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../utils/storage.js';
import { getCurrentUser } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';

/**
 * UserManagement page component for admin users.
 * Displays a list of all users and a form to create new users.
 * Accessible at /admin/users. Non-admins are redirected by ProtectedRoute.
 * @returns {JSX.Element}
 */
export function UserManagement() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    try {
      const allUsers = getUsers();
      setUsers(allUsers);
    } catch {
      setUsers([]);
    }
  }, []);

  const hardCodedAdmin = {
    id: 'admin',
    displayName: 'Admin',
    username: 'admin',
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString(),
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedDisplayName) {
      setError('Display name is required');
      return;
    }

    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (trimmedUsername === 'admin') {
      setError('Username is already taken');
      return;
    }

    const allUsers = getUsers();
    const existing = allUsers.find((u) => u.username === trimmedUsername);

    if (existing) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        id: crypto.randomUUID(),
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        password,
        role,
        createdAt: new Date().toISOString(),
      };

      allUsers.push(newUser);
      saveUsers(allUsers);
      setUsers(allUsers);

      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setSuccess(`User "${trimmedDisplayName}" created successfully`);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteRequest = (userId) => {
    setDeleteConfirmId(userId);
  };

  const handleDeleteConfirm = (userId) => {
    try {
      const allUsers = getUsers();
      const filtered = allUsers.filter((u) => u.id !== userId);
      saveUsers(filtered);
      setUsers(filtered);
      setDeleteConfirmId(null);
      setSuccess('User deleted successfully');
    } catch {
      setDeleteConfirmId(null);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Banner Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            User Management
          </h1>
          <p className="text-sm text-white/80">
            Manage platform users — create new accounts or remove existing ones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Create User</h2>

              <form onSubmit={handleCreateUser} noValidate>
                {error && (
                  <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700 animate-fade-in">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 animate-fade-in">
                    {success}
                  </div>
                )}

                <div className="mb-4">
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    autoComplete="name"
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating…' : 'Create User'}
                </button>
              </form>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">
                All Users ({users.length + 1})
              </h2>
            </div>

            <div className="space-y-4">
              {/* Hard-coded admin row */}
              {deleteConfirmId === hardCodedAdmin.id ? (
                <div className="bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">
                        Cannot delete the default admin account.
                      </span>
                      <button
                        type="button"
                        onClick={handleDeleteCancel}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <UserRow
                  id={hardCodedAdmin.id}
                  displayName={hardCodedAdmin.displayName}
                  username={hardCodedAdmin.username}
                  role={hardCodedAdmin.role}
                  createdAt={hardCodedAdmin.createdAt}
                  onDelete={handleDeleteRequest}
                />
              )}

              {/* Registered users */}
              {users.map((user) =>
                deleteConfirmId === user.id ? (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-card-hover animate-fade-in overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">
                          Are you sure you want to delete <strong>{user.displayName}</strong>?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteConfirm(user.id)}
                            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-white bg-error-500 hover:bg-error-700 transition-colors duration-200"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteCancel}
                            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <UserRow
                    key={user.id}
                    id={user.id}
                    displayName={user.displayName}
                    username={user.username}
                    role={user.role}
                    createdAt={user.createdAt}
                    onDelete={handleDeleteRequest}
                  />
                )
              )}

              {users.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl shadow-card animate-fade-in">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl mb-6">
                    <span>👥</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    No registered users yet
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto">
                    Create the first user using the form on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;