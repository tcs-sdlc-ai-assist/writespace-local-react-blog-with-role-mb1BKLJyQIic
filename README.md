# WriteSpace

A modern writing platform built with React where users can create, share, and discover blog posts. Features role-based access control with admin and regular user roles, all powered by localStorage for client-side persistence.

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Vite 5** — Build tool and dev server
- **Vitest** — Unit testing framework
- **Testing Library** — React component testing utilities
- **PropTypes** — Runtime prop validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+ (or equivalent)

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Opens the app at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Outputs optimized static files to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test
```

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration (Tailwind)
├── tailwind.config.js          # Tailwind CSS theme and plugins
├── vite.config.js              # Vite build configuration
├── vitest.config.js            # Vitest test configuration
├── vercel.json                 # Vercel deployment rewrites (SPA)
├── src/
│   ├── main.jsx                # React DOM entry point
│   ├── App.jsx                 # Root component with route definitions
│   ├── App.test.jsx            # Routing and access control tests
│   ├── index.css               # Tailwind CSS directives
│   ├── components/
│   │   ├── Avatar.jsx          # Role-distinct avatar component
│   │   ├── BlogCard.jsx        # Blog post card for list views
│   │   ├── Navbar.jsx          # Navigation bar for authenticated users
│   │   ├── ProtectedRoute.jsx  # Route guard (auth + admin checks)
│   │   ├── PublicNavbar.jsx     # Navigation bar for guest users
│   │   ├── StatCard.jsx        # Stat tile for admin dashboard
│   │   └── UserRow.jsx         # User row for admin user management
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin overview with stats and recent posts
│   │   ├── Home.jsx            # Blog post listing (all posts)
│   │   ├── Home.test.jsx       # Home page tests
│   │   ├── LandingPage.jsx     # Public landing page with hero and features
│   │   ├── LoginPage.jsx       # User login form
│   │   ├── ReadBlog.jsx        # Full blog post view
│   │   ├── RegisterPage.jsx    # User registration form
│   │   ├── UserManagement.jsx  # Admin user CRUD
│   │   └── WriteBlog.jsx       # Create and edit blog posts
│   └── utils/
│       ├── auth.js             # Authentication logic (login, register, logout)
│       ├── auth.test.js        # Auth utility tests
│       ├── storage.js          # localStorage CRUD with validation
│       └── storage.test.js     # Storage utility tests
```

## Route Map

| Path            | Component        | Access          | Description                        |
| --------------- | ---------------- | --------------- | ---------------------------------- |
| `/`             | LandingPage      | Public          | Landing page with hero and features |
| `/login`        | LoginPage        | Public          | User sign-in form                  |
| `/register`     | RegisterPage     | Public          | User registration form             |
| `/blogs`        | Home             | Authenticated   | All blog posts (newest first)      |
| `/blog/:id`     | ReadBlog         | Authenticated   | Full blog post view                |
| `/write`        | WriteBlog        | Authenticated   | Create a new blog post             |
| `/edit/:id`     | WriteBlog        | Authenticated   | Edit an existing blog post         |
| `/admin`        | AdminDashboard   | Admin only      | Platform stats and recent posts    |
| `/admin/users`  | UserManagement   | Admin only      | Create and manage users            |

Unauthenticated users are redirected to `/login`. Non-admin users accessing admin routes are redirected to `/blogs`.

## Storage Schema

All data is persisted in the browser's `localStorage` under the following keys:

### `writespace_posts` — Array of Post objects

```json
{
  "id": "string (UUID)",
  "title": "string",
  "content": "string",
  "createdAt": "string (ISO 8601)",
  "authorId": "string",
  "authorName": "string"
}
```

### `writespace_users` — Array of User objects

```json
{
  "id": "string (UUID)",
  "displayName": "string",
  "username": "string",
  "password": "string (plaintext)",
  "role": "admin | user",
  "createdAt": "string (ISO 8601)"
}
```

### `writespace_session` — Session object (or null)

```json
{
  "userId": "string",
  "username": "string",
  "displayName": "string",
  "role": "admin | user"
}
```

### Hard-coded Admin Account

A default admin account is available without registration:

- **Username:** `admin`
- **Password:** `admin123`

This account is not stored in localStorage and cannot be deleted.

## Usage Guide

### Getting Started as a User

1. Open the app and click **Get Started** on the landing page
2. Fill in your display name, username, and password (min 6 characters)
3. After registration you are automatically signed in and redirected to the blog listing
4. Click **Write** in the navigation bar to create your first post
5. View any post by clicking its title, and edit or delete your own posts

### Admin Features

1. Sign in with the default admin credentials (`admin` / `admin123`)
2. Access the **Dashboard** for platform statistics and recent post management
3. Navigate to **Users** to create new accounts or delete existing ones
4. Admins can edit and delete any post on the platform

## Deployment

The project includes a `vercel.json` with SPA rewrites for deployment on [Vercel](https://vercel.com):

```bash
npm run build
```

Upload the `dist/` directory to any static hosting provider. Ensure all routes are rewritten to `index.html` for client-side routing to work.

## License

Private