# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page** — Hero section with gradient branding, feature cards highlighting Simple Writing, Share Instantly, and Content Control, latest posts preview for guest visitors, and a responsive footer with navigation links.
- **User Authentication** — Login page with username/password validation and inline error messages. Registration page with display name, username, and password fields (minimum 6 characters). Automatic session creation on successful login or registration. Hard-coded admin account (`admin` / `admin123`) available without registration.
- **Role-Based Access Control** — `ProtectedRoute` component guarding authenticated and admin-only routes. Unauthenticated users redirected to `/login`. Non-admin users accessing admin routes redirected to `/blogs`. Admin users have full access to all routes including dashboard and user management.
- **Blog Post CRUD** — Create new blog posts with title and content fields, character counters, and validation. Edit existing posts with pre-filled form data. Delete posts with confirmation dialog. Full blog post view at `/blog/:id` with author avatar, formatted date, and whitespace-preserved content. Blog listing at `/blogs` with responsive grid layout sorted newest first.
- **Admin Dashboard** — Platform statistics displayed via `StatCard` components: total posts, total users, admin count, and user count. Quick action buttons for writing posts and managing users. Recent posts list with inline edit and delete controls.
- **User Management** — Admin-only page at `/admin/users` for creating new user accounts with role selection (user or admin). User list displaying all registered users plus the hard-coded admin. Delete functionality with confirmation, disabled for the default admin account and the currently logged-in user. `UserRow` component with avatar, role badge pill, and contextual tooltips.
- **Avatar System** — Role-distinct `Avatar` component rendering crown emoji (👑) for admins and book emoji (📖) for regular users. Configurable sizes (sm, md, lg) with role-based color theming. `getAvatar` helper function for inline usage.
- **Navigation** — `Navbar` component for authenticated users with WriteSpace branding, Blogs/Write links, conditional Dashboard/Users links for admins, user avatar with display name, and logout button. `PublicNavbar` component for guest users with Login and Get Started buttons.
- **localStorage Persistence** — All data persisted client-side under `writespace_posts`, `writespace_users`, and `writespace_session` keys. Schema validation on read with automatic filtering of invalid entries. Safe JSON parsing with fallback values for corrupted data. Storage utility functions with localStorage availability checks.
- **Responsive Tailwind UI** — Custom color palette (primary, secondary, neutral, success, warning, error) with extended theme configuration. Gradient backgrounds for hero sections, buttons, and branding. Custom box shadows (soft, card, card-hover) for depth and interactivity. Fade-in and slide-up animations for smooth page transitions. Responsive grid layouts adapting from single column to multi-column across breakpoints.
- **Vercel Deployment** — SPA rewrite configuration in `vercel.json` routing all paths to `index.html` for client-side routing support. Production build output to `dist/` directory via Vite.
- **Testing** — Unit tests for storage utilities covering CRUD operations, schema validation, corrupted data handling, and round-trip integration. Unit tests for authentication utilities covering login, registration, logout, session management, and full lifecycle integration. Component tests for the Home page covering empty state, post rendering, sorting, grid layout, edit permissions, content truncation, error handling, and navbar rendering. Routing and access control tests verifying public routes, protected route redirects, admin route guards, and `ProtectedRoute` component behavior.