# Deployment

This document covers deploying WriteSpace to [Vercel](https://vercel.com) as a static single-page application (SPA).

## Overview

WriteSpace is a fully client-side React application with no backend server. All data is persisted in the browser's `localStorage`. Deployment consists of building the static assets with Vite and serving them from any static hosting provider. Vercel is the recommended platform.

## Prerequisites

- A [Vercel](https://vercel.com) account (free tier is sufficient)
- A GitHub, GitLab, or Bitbucket repository containing the WriteSpace source code
- Node.js 18+ and npm 9+ installed locally (for manual builds)

## Build Command

To produce the production-ready static files, run:

```bash
npm install
npm run build
```

This executes `vite build`, which outputs optimized HTML, CSS, and JavaScript to the `dist/` directory.

To preview the production build locally before deploying:

```bash
npm run preview
```

This starts a local static server serving the `dist/` directory.

## Vercel Configuration

The repository includes a `vercel.json` file at the project root that configures SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### SPA Rewrite Rules

WriteSpace uses client-side routing via React Router v6. All navigation (e.g., `/blogs`, `/admin`, `/blog/:id`) is handled in the browser by JavaScript — there are no corresponding server-side routes.

The rewrite rule ensures that every incoming request, regardless of the URL path, is served the same `index.html` file. Without this rule, directly navigating to a route like `/blogs` or refreshing the page on `/blog/some-id` would result in a 404 error from the hosting provider.

The single rewrite rule `/(.*) → /index.html` catches all paths and lets React Router resolve the correct page component on the client side.

## Deploying to Vercel

### Option 1: Auto-Deploy via Git Integration (Recommended)

1. Push the WriteSpace repository to GitHub, GitLab, or Bitbucket.
2. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import the repository from your Git provider.
4. Vercel auto-detects the Vite framework. Confirm the following settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**.

Once connected, Vercel automatically deploys on every push to the default branch (e.g., `main`). Pull requests receive preview deployments with unique URLs.

### Option 2: Manual Deploy via Vercel CLI

1. Install the Vercel CLI globally:

   ```bash
   npm install -g vercel
   ```

2. From the project root, run:

   ```bash
   vercel
   ```

3. Follow the prompts to link the project to your Vercel account.

4. For subsequent production deployments:

   ```bash
   vercel --prod
   ```

## CI/CD via Vercel Auto-Deploy

When the repository is connected to Vercel through the Git integration:

- **Production deploys** are triggered automatically on every push to the `main` branch (or whichever branch is configured as the production branch in Vercel project settings).
- **Preview deploys** are triggered automatically on every push to any other branch or on pull request creation. Each preview deploy receives a unique URL for testing.
- **Build logs** are available in the Vercel dashboard under the project's Deployments tab.
- **Rollbacks** can be performed instantly from the Vercel dashboard by promoting any previous successful deployment.

No additional CI/CD pipeline configuration (e.g., GitHub Actions) is required. Vercel handles the install, build, and deploy steps automatically.

## Environment Variables

WriteSpace does **not** require any environment variables. There are no API keys, backend URLs, or secrets to configure.

- No `.env` file is needed for development or production.
- No environment variables need to be set in the Vercel dashboard.
- All data is stored in the browser's `localStorage` on the client side.
- The hard-coded admin account (`admin` / `admin123`) is embedded in the application source code.

If the project is extended in the future to include external API calls, environment variables should be prefixed with `VITE_` (e.g., `VITE_API_URL`) so that Vite exposes them to the client bundle via `import.meta.env.VITE_API_URL`. These would then need to be added in the Vercel dashboard under **Settings → Environment Variables**.

## Output Directory

The production build outputs to the `dist/` directory, which contains:

- `index.html` — The single HTML entry point
- `assets/` — Hashed JavaScript and CSS bundles

This directory is what Vercel (or any static hosting provider) serves to users.

## Deploying to Other Static Hosts

WriteSpace can be deployed to any static hosting provider (Netlify, Cloudflare Pages, GitHub Pages, AWS S3 + CloudFront, etc.). The key requirement is configuring a catch-all rewrite rule so that all URL paths serve `index.html`.

### Netlify

Add a `_redirects` file to the `public/` directory:

```
/*    /index.html   200
```

### Cloudflare Pages

Cloudflare Pages handles SPA routing automatically for single-page applications when the framework preset is set to **None** or **Vite**.

### GitHub Pages

Use a `404.html` that redirects to `index.html`, or use a GitHub Actions workflow with a SPA-aware deployment action.

## Troubleshooting

| Issue | Cause | Solution |
| --- | --- | --- |
| 404 on page refresh | SPA rewrite rule not applied | Verify `vercel.json` is at the project root and contains the rewrite rule |
| Blank page after deploy | Build output directory mismatch | Confirm the output directory is set to `dist` in Vercel project settings |
| Styles missing | Tailwind CSS not processed | Ensure `npm install` runs before `npm run build` so PostCSS and Tailwind are available |
| Old content after deploy | Browser cache | Hard refresh (`Ctrl+Shift+R`) or clear browser cache; Vite uses content-hashed filenames to bust caches automatically |
| localStorage data missing | Different domain or browser | localStorage is scoped to the origin (protocol + domain + port); data from `localhost:3000` is not available on the Vercel deployment URL |