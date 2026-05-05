# Nexora — Social Media Frontend

> A modern, full-featured social media web application built with **React 19**, **Vite 8**, and **TailwindCSS v4**.

Nexora lets users connect through posts, stories, real-time notifications, and a rich friend/follow system — all powered by a JWT + Socket.IO backend.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Real-time (Socket.IO)](#real-time-socketio)
- [State Management](#state-management)
- [Media Uploads (Cloudinary)](#media-uploads-cloudinary)
- [Authentication Flow](#authentication-flow)
- [Deployment (Vercel)](#deployment-vercel)

---

## Features

### Authentication
- Email/password registration with email verification
- Login with JWT access tokens (stored in JS memory) and HTTP-only refresh token cookies
- Google OAuth 2.0 login via backend redirect
- Forgot password flow: email → OTP code → reset password
- Change password, deactivate account (re-activates on next login), and permanent account deletion

### Feed
- Infinite-scroll post feed from friends and followed users (cursor-based pagination)
- Real-time "new posts available" banner — alerts without a full reload
- Create posts with rich text (Quill v2 editor), images, and videos
- Post privacy controls: `PUBLIC`, `FRIENDS`, `ONLY_ME`
- AI-powered caption generation for uploaded images (Vietnamese / English)
- Edit and delete your own posts

### Posts & Reactions
- Facebook-style emoji reactions: 👍 LIKE · ❤️ LOVE · 😂 HAHA · 😮 WOW · 😢 SAD · 😡 ANGRY
- Reaction picker with hover-to-expand and a per-user reaction summary modal
- Threaded comments with infinite scroll, replies, edit, and delete
- Image lightbox for full-screen media viewing with keyboard navigation
- Video playback via Vidstack

### Stories
- 24-hour ephemeral stories (image or video with optional caption)
- Horizontal stories bar on the feed with unread ring indicators
- Full-screen story viewer with auto-progress per story segment
- View count and viewer list visible to the story author only
- Real-time story creation/deletion events via Socket.IO

### Friends & Social Graph
- Send, accept, reject, and cancel friend requests
- Unfriend, block, and unblock users
- Friend suggestions based on mutual connections
- Follow/unfollow independently of friendship status
- Real-time friend request and acceptance events
- Online/offline presence indicators throughout the UI

### Notifications
- Real-time in-app notifications powered by Socket.IO
- Types: `FRIEND_REQUEST` · `FRIEND_ACCEPTED` · `POST_REACT` · `POST_COMMENT` · `COMMENT_REPLY` · `NEW_FOLLOWER` · `NEW_POST`
- Mark individual notifications or all as read
- Unread badge count on the navbar icon

### User Profiles
- Profile page with cover photo, avatar, bio, and friends/followers/following counts
- Edit avatar and cover photo (uploaded directly to Cloudinary)
- View a user's posts, photos, friends, followers, following, and stories in a tabbed layout
- Dynamic action buttons based on friendship and follow status

### Settings
- Update username and bio
- Email verification status with resend-verification flow
- Change password with a live strength indicator
- Google OAuth account indicator (no password required for OAuth accounts)
- Deactivate account or permanently delete account with confirmation dialog

### UX Extras
- Light / dark / system theme toggle (`next-themes`)
- Debounced user search in the navbar
- Skeleton loading states throughout
- Toast notifications via Sonner with rich colors
- Fully responsive three-column layout — sidebars collapse gracefully on mobile

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org/) |
| Styling | [TailwindCSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` |
| Animations | [tw-animate-css](https://github.com/jamiebuilds/tailwindcss-animate) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (radix-nova style) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Routing | [React Router DOM v7](https://reactrouter.com/) |
| Server State | [TanStack Query v5](https://tanstack.com/query) + Devtools |
| Client State | [Zustand v5](https://zustand-demo.pmnd.rs/) |
| HTTP Client | [Axios](https://axios-http.com/) with interceptors for auth & silent token refresh |
| Forms | [React Hook Form v7](https://react-hook-form.com/) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers) + [Zod v4](https://zod.dev/) |
| Real-time | [Socket.IO Client v4](https://socket.io/) |
| Media Upload | [Cloudinary](https://cloudinary.com/) (unsigned upload preset, direct browser → CDN) |
| Video Player | [Vidstack React](https://www.vidstack.io/) |
| Rich Text | [Quill v2](https://quilljs.com/) |
| Toast | [Sonner](https://sonner.emilkowal.ski/) |
| Date | [Day.js](https://day.js.org/) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) |
| Font | [Geist Variable](https://vercel.com/font) via `@fontsource-variable/geist` |
| Linting | ESLint 9 + typescript-eslint |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
frontend/
├── public/                       # Static assets served as-is
├── src/
│   ├── assets/                   # Static imports (SVGs, images)
│   ├── components/
│   │   ├── comment/              # Comment thread components
│   │   ├── friend/               # Friend request, suggestion, and friend cards
│   │   ├── layout/               # App shell: MainLayout, Navbar, Left/Right sidebars
│   │   │   └── auth/             # Auth layout wrapper
│   │   ├── notification/         # Notification list items & dropdown preview
│   │   ├── post/                 # Post cards, editor, dialogs, reaction picker
│   │   ├── profile/              # Profile header, edit dialogs, tabbed post grid
│   │   ├── shared/               # Reusable primitives (Avatar, Lightbox, Skeletons…)
│   │   ├── story/                # Stories bar, viewer, add/view dialogs
│   │   ├── ui/                   # shadcn/ui base components
│   │   ├── mode-toggle.tsx       # Light / dark / system theme switch button
│   │   ├── theme-context.ts      # Theme React context definition
│   │   └── theme-provider.tsx    # next-themes provider wrapper
│   ├── hooks/
│   │   ├── use-auth.ts                 # Convenience hook over auth store
│   │   ├── use-auth-mutations.ts       # Login, register, logout, password mutations
│   │   ├── use-bootstrap.ts            # Session restore on app startup
│   │   ├── use-cloudinary-upload.ts    # Multi-file upload with per-file progress
│   │   ├── use-comment-mutations.ts    # Create, edit, delete comments/replies
│   │   ├── use-debounce.ts             # Generic value debounce hook
│   │   ├── use-feed-new-posts.ts       # Socket-driven "new posts" banner logic
│   │   ├── use-follow-mutations.ts     # Follow / unfollow mutations
│   │   ├── use-friendship-mutations.ts # Send, accept, reject, cancel, block requests
│   │   ├── use-generate-caption.ts     # AI image caption generation hook
│   │   ├── use-infinite-scroll.ts      # IntersectionObserver → fetchNextPage
│   │   ├── use-notification-mutations.ts # Mark read, mark all read, delete
│   │   ├── use-post-mutations.ts       # Create, update, delete posts
│   │   ├── use-presence.ts             # Batch-query online/offline presence
│   │   ├── use-socket.ts               # Socket.IO connection + all event listeners
│   │   ├── use-story-mutations.ts      # Create and delete stories
│   │   └── use-user-mutations.ts       # Update profile, avatar, cover, deactivate
│   ├── lib/
│   │   ├── query-client.ts       # TanStack Query client singleton
│   │   └── utils.ts              # cn(), formatters, password strength helpers, etc.
│   ├── pages/
│   │   ├── auth/                 # LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage
│   │   ├── oauth/                # OAuthCallbackPage — handles Google redirect
│   │   ├── feed-page.tsx
│   │   ├── friends-page.tsx      # Tabs: requests, sent, suggestions, all friends
│   │   ├── landing-page.tsx      # Marketing page shown to guests
│   │   ├── not-found-page.tsx
│   │   ├── notifications-page.tsx
│   │   ├── post-detail-page.tsx  # Full post view with real-time comment events
│   │   ├── profile-page.tsx
│   │   └── settings-page.tsx
│   ├── services/
│   │   ├── api.ts                # Axios instance + 401 auto-refresh interceptor
│   │   └── api-services.ts       # All API functions grouped by domain
│   ├── stores/
│   │   ├── auth-store.ts         # user, accessToken, isAuthenticated
│   │   ├── notification-store.ts # unreadCount, friendRequestCount, notifications[]
│   │   ├── presence-store.ts     # Set of currently online user IDs
│   │   └── socket-store.ts       # Socket.IO instance + connect/disconnect
│   ├── styles/                   # Additional global CSS (Quill overrides, etc.)
│   ├── types/
│   │   └── index.ts              # All shared TypeScript interfaces and types
│   ├── App.tsx                   # Root: providers, router, AppBootstrap, all routes
│   ├── index.css                 # Tailwind directives + oklch CSS variables
│   └── main.tsx                  # React DOM entry point
├── .env.example                  # Required environment variables template
├── components.json               # shadcn/ui configuration
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                   # SPA rewrite rule for Vercel
└── vite.config.ts                # Vite: React + Tailwind plugins, @ alias, dev proxy
```

---

## Pages & Routes

| Path | Component | Access |
|---|---|---|
| `/` | `LandingPage` | Guest only |
| `/login` | `LoginPage` | Guest only |
| `/register` | `RegisterPage` | Guest only |
| `/verify-email` | `VerifyEmailPage` | Public |
| `/forgot-password` | `ForgotPasswordPage` | Guest only |
| `/oauth/callback` | `OAuthCallbackPage` | Public |
| `/feed` | `FeedPage` | Protected |
| `/profile/:id` | `ProfilePage` | Protected |
| `/friends` | `FriendsPage` | Protected |
| `/notifications` | `NotificationsPage` | Protected |
| `/posts/:id` | `PostDetailPage` | Protected |
| `/settings` | `SettingsPage` | Protected |
| `*` | `NotFoundPage` | Public |

- **`<ProtectedRoute>`** — Redirects unauthenticated users to `/login`, preserving the intended destination in `location.state.from`.
- **`<GuestRoute>`** — Redirects already-authenticated users to `/feed`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         React App (Vite)                        │
│                                                                 │
│  ThemeProvider → QueryClientProvider → BrowserRouter            │
│              └─ AppBootstrap (session restore + socket init)    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages (routes)                                          │   │
│  │  └─ Components (layout, post, story, friend, profile…)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │   Zustand    │  │  TanStack Query  │  │    Socket.IO      │  │
│  │  auth        │  │  server cache    │  │  real-time events │  │
│  │  presence    │  │  infinite pages  │  │  presence sync    │  │
│  │  notifs      │  │  optimistic UI   │  │  notifications    │  │
│  │  socket ref  │  └──────────────────┘  └───────────────────┘  │
│  └──────────────┘                                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Axios (api.ts)                                          │   │
│  │  • Attaches Authorization: Bearer <token> on every req   │   │
│  │  • On 401 → silent refresh via /auth/refresh (cookie)    │   │
│  │  • Queues concurrent requests during refresh, replays    │   │
│  │  • Refresh failure → logout() + redirect to /login       │   │
│  │  • Dev proxy: /api → http://localhost:3000               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  REST API Backend (localhost:3000)
                  Socket.IO Server (localhost:3000)
                  Cloudinary CDN (media storage)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A running instance of the backend API (see [backend README](../backend/README.md))
- A [Cloudinary](https://cloudinary.com/) account (free tier is sufficient)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd frontend

# Install dependencies
npm install
```

### Development

```bash
# Copy the environment template and fill in your values
cp .env.example .env

# Start the dev server at http://localhost:5173
npm run dev
```

> The Vite dev server proxies every `/api` request to `http://localhost:3000`, so CORS is handled transparently during local development — no browser extension or backend CORS change needed.

### Production Build

```bash
npm run build
```

Output is written to `/dist`. Preview the production bundle locally:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in the values:

```env
# Full URL to the backend REST API (must include /api prefix)
VITE_API_URL=http://localhost:3000/api

# Backend URL used for the Socket.IO connection
VITE_SOCKET_URL=http://localhost:3000

# Cloudinary cloud name (found in your Cloudinary dashboard)
VITE_CLOUDINARY_CLOUD_NAME=

# Cloudinary unsigned upload preset name
VITE_CLOUDINARY_UPLOAD_PRESET=
```

> **Note:** All variables are prefixed with `VITE_` so Vite exposes them to the browser bundle. **Never store secrets here** — these values are visible in the compiled output.

---

## API Integration

All API calls live in `src/services/api-services.ts`, grouped by domain:

| Export | Endpoints covered |
|---|---|
| `authApi` | Register, verify email, resend verification, login, logout, refresh token, forgot password, verify OTP, reset password, change password |
| `usersApi` | Get/update current user, update avatar, update cover photo, deactivate, delete account, get profile by ID or username, search users |
| `postsApi` | Create post, get feed (paginated), get by ID, update, delete, get user posts |
| `commentsApi` | Create comment/reply, list comments, list replies, update, delete |
| `reactionsApi` | Toggle reaction, list reactors (filterable by type), get summary, get my reaction |
| `friendshipsApi` | Send/accept/reject/cancel request, unfriend, block/unblock, get requests/sent/friends list, get status, get suggestions |
| `followersApi` | Follow/unfollow, get followers list, get following list, get follow status |
| `notificationsApi` | List (filterable by unread), get unread count, mark read, mark all read, delete |
| `storiesApi` | Create story, get feed groups, get mine, get active by user, record view, get viewers, delete |
| `aiApi` | Generate image captions (`vi` or `en`) |
| `bootstrapApi` | Internal — called only by `useBootstrap` on initial app load to restore session |

### Axios Interceptor Behaviour

The instance in `src/services/api.ts` automatically:

1. Attaches `Authorization: Bearer <accessToken>` on every outgoing request.
2. On a `401` response, silently calls `POST /auth/refresh` using the HTTP-only cookie.
3. Queues all concurrent requests that arrived during the refresh and replays them with the new token.
4. If the refresh itself fails, clears all auth state and redirects to `/login`.

Auth endpoints under `/auth/` are excluded from the 401-retry loop to prevent infinite refresh cycles.

---

## Real-time (Socket.IO)

The `useSocket` hook is mounted once inside `AppBootstrap` and maintains a single authenticated connection. The socket authenticates using the current access token passed as a query parameter.

### Socket Events

| Event | Handler action |
|---|---|
| `new_notification` | Appends to notification store, increments unread badge, shows toast |
| `friend_request` | Increments friend-request badge, invalidates request list cache |
| `friend_request_cancelled` | Decrements badge, invalidates cache |
| `friend_accepted` | Invalidates friends, feed, profile, and stories caches |
| `friend_unfriended` | Invalidates friends, feed, and profile caches |
| `story:new` | Invalidates stories feed, shows toast |
| `story:deleted` | Invalidates stories feed |
| `user:online` | Adds user ID to presence store |
| `user:offline` | Removes user ID from presence store |

On disconnect or connection error, the presence store is cleared to avoid stale online indicators.

---

## State Management

Zustand stores are intentionally kept thin — they hold only cross-cutting state that doesn't belong in the server cache:

| Store | State held |
|---|---|
| `auth-store` | `user`, `accessToken` (in-memory only), `isAuthenticated` |
| `notification-store` | `unreadCount`, `friendRequestCount`, latest `notifications[]` |
| `presence-store` | `Set<userId>` of currently online users |
| `socket-store` | Socket.IO `socket` instance + `connect` / `disconnect` methods |

All server data — posts, comments, friends, profiles, stories — lives exclusively in **TanStack Query** to benefit from automatic caching, background re-fetching, cache invalidation, and cursor-based infinite pagination.

> **Security note:** The access token is never written to `localStorage` or cookies — it lives only in Zustand (JS memory). The refresh token is stored in an `HttpOnly` cookie, making it inaccessible to JavaScript and protecting against XSS token theft.

---

## Media Uploads (Cloudinary)

The `useCloudinaryUpload` hook provides a complete multi-file upload pipeline that bypasses the backend entirely:

- Accepts **images** (≤ 50 MB) and **videos** (≤ 100 MB), up to **10 files** per post
- Uses `XMLHttpRequest` for real per-file upload progress tracking
- Uploads all files concurrently via `Promise.all`
- Deduplicates files by name + size to prevent accidental double-uploads
- Automatically revokes `URL.createObjectURL` blobs on file removal or hook reset
- Returns a typed status per file: `idle | uploading | done | error`

Files are uploaded directly from the browser to Cloudinary using an **unsigned upload preset**, meaning no binary data passes through your backend server.

---

## Authentication Flow

```
App Load
  └─ useBootstrap()
       ├─ POST /auth/refresh  (HTTP-only cookie) → accessToken
       ├─ GET  /users/me                          → user object
       ├─ GET  /notifications/unread-count        → unread badge
       ├─ GET  /friendships/requests?limit=1      → friend request badge
       └─ setReady(true) → render children

Email / Password Login
  └─ POST /auth/login → { accessToken, user }
       └─ setAuth(user, accessToken) → authStore → navigate /feed

Google OAuth
  └─ Browser redirects to backend OAuth handler
       └─ Backend redirects to /oauth/callback?token=…
            └─ Parse token → setAuth → navigate /feed

Logout
  └─ POST /auth/logout  (server clears the refresh token cookie)
       └─ authStore.logout() → redirect /login

Silent Token Refresh (background, transparent)
  └─ Any non-auth request returns 401
       └─ Axios interceptor → POST /auth/refresh
            ├─ Success: set new token, replay original + queued requests
            └─ Failure: authStore.logout() + redirect /login
```

---

## Deployment (Vercel)

The project ships with a `vercel.json` that handles SPA client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Deploy Steps

1. Push your code to GitHub.
2. Import the repository in the [Vercel dashboard](https://vercel.com/).
3. If this is a monorepo, set the **Root Directory** to `frontend`.
4. Add all four environment variables in **Project → Settings → Environment Variables**.
5. Click **Deploy** — Vercel auto-detects Vite and runs `npm run build`.

> **CORS in production:** Ensure your backend sets `Access-Control-Allow-Origin` to your Vercel deployment URL and includes `Access-Control-Allow-Credentials: true` so that the HTTP-only refresh token cookie is sent cross-origin.
