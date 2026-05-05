# Nexora — Frontend Mạng Xã Hội

> Ứng dụng web mạng xã hội hiện đại, đầy đủ tính năng, được xây dựng bằng **React 19**, **Vite 8** và **TailwindCSS v4**.

Nexora cho phép người dùng kết nối qua bài viết, stories, thông báo thời gian thực và hệ thống bạn bè/theo dõi phong phú — tất cả được vận hành bởi backend JWT + Socket.IO.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white&style=flat-square)

---

## Mục Lục

- [Tính Năng](#tính-năng)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Trang & Routes](#trang--routes)
- [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
- [Bắt Đầu](#bắt-đầu)
- [Biến Môi Trường](#biến-môi-trường)
- [Tích Hợp API](#tích-hợp-api)
- [Thời Gian Thực (Socket.IO)](#thời-gian-thực-socketio)
- [Quản Lý State](#quản-lý-state)
- [Tải Media (Cloudinary)](#tải-media-cloudinary)
- [Luồng Xác Thực](#luồng-xác-thực)
- [Triển Khai (Vercel)](#triển-khai-vercel)

---

## Tính Năng

### Xác Thực
- Đăng ký bằng email/mật khẩu với xác minh email
- Đăng nhập bằng JWT access token (lưu trong bộ nhớ JS) và cookie refresh token HTTP-only
- Đăng nhập Google OAuth 2.0 qua chuyển hướng backend
- Luồng quên mật khẩu: email → mã OTP → đặt lại mật khẩu
- Đổi mật khẩu, vô hiệu hóa tài khoản (tự kích hoạt lại khi đăng nhập tiếp theo) và xóa tài khoản vĩnh viễn

### Feed
- Feed bài viết cuộn vô tận từ bạn bè và người dùng đang theo dõi (phân trang dựa trên con trỏ)
- Banner "có bài viết mới" thời gian thực — cảnh báo mà không cần tải lại trang
- Tạo bài viết với văn bản phong phú (trình soạn thảo Quill v2), hình ảnh và video
- Kiểm soát quyền riêng tư bài viết: `PUBLIC`, `FRIENDS`, `ONLY_ME`
- Tạo caption bằng AI cho ảnh đã tải lên (Tiếng Việt / Tiếng Anh)
- Chỉnh sửa và xóa bài viết của bạn

### Bài Viết & Cảm Xúc
- Cảm xúc emoji kiểu Facebook: 👍 LIKE · ❤️ LOVE · 😂 HAHA · 😮 WOW · 😢 SAD · 😡 ANGRY
- Bộ chọn cảm xúc mở rộng khi hover và modal tổng hợp cảm xúc theo người dùng
- Bình luận theo luồng với cuộn vô tận, trả lời, chỉnh sửa và xóa
- Lightbox xem ảnh toàn màn hình với điều hướng bằng bàn phím
- Phát video qua Vidstack

### Stories
- Stories tạm thời 24 giờ (ảnh hoặc video kèm caption tùy chọn)
- Thanh stories ngang trên feed với vòng hiển thị chưa xem
- Trình xem story toàn màn hình với tự động chuyển từng đoạn
- Số lượt xem và danh sách người xem chỉ hiển thị với tác giả story
- Sự kiện tạo/xóa story thời gian thực qua Socket.IO

### Bạn Bè & Mạng Xã Hội
- Gửi, chấp nhận, từ chối và hủy lời mời kết bạn
- Xóa bạn, chặn và bỏ chặn người dùng
- Gợi ý kết bạn dựa trên bạn chung
- Theo dõi/bỏ theo dõi độc lập với trạng thái kết bạn
- Sự kiện gửi và chấp nhận lời mời kết bạn thời gian thực
- Chỉ báo trạng thái trực tuyến/ngoại tuyến trên toàn giao diện

### Thông Báo
- Thông báo trong ứng dụng thời gian thực được vận hành bởi Socket.IO
- Các loại: `FRIEND_REQUEST` · `FRIEND_ACCEPTED` · `POST_REACT` · `POST_COMMENT` · `COMMENT_REPLY` · `NEW_FOLLOWER` · `NEW_POST`
- Đánh dấu từng thông báo hoặc tất cả là đã đọc
- Số huy hiệu chưa đọc trên biểu tượng thanh điều hướng

### Hồ Sơ Người Dùng
- Trang hồ sơ với ảnh bìa, avatar, bio và số bạn bè/người theo dõi/đang theo dõi
- Chỉnh sửa avatar và ảnh bìa (tải trực tiếp lên Cloudinary)
- Xem bài viết, ảnh, bạn bè, người theo dõi, đang theo dõi và stories của người dùng trong bố cục tab
- Nút hành động động dựa trên trạng thái kết bạn và theo dõi

### Cài Đặt
- Cập nhật tên người dùng và bio
- Trạng thái xác minh email với luồng gửi lại xác minh
- Đổi mật khẩu với chỉ báo độ mạnh trực tiếp
- Chỉ báo tài khoản Google OAuth (không cần mật khẩu cho tài khoản OAuth)
- Vô hiệu hóa tài khoản hoặc xóa vĩnh viễn với hộp thoại xác nhận

### Trải Nghiệm Người Dùng
- Chuyển đổi giao diện sáng / tối / theo hệ thống (`next-themes`)
- Tìm kiếm người dùng có debounce trên thanh điều hướng
- Trạng thái tải skeleton xuyên suốt ứng dụng
- Thông báo toast qua Sonner với màu sắc phong phú
- Bố cục ba cột responsive đầy đủ — các sidebar thu gọn gọn gàng trên thiết bị di động

---

## Công Nghệ Sử Dụng

| Danh mục | Thư viện / Công cụ |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Công cụ Build | [Vite 8](https://vite.dev/) |
| Ngôn ngữ | [TypeScript 5.9](https://www.typescriptlang.org/) |
| Styling | [TailwindCSS v4](https://tailwindcss.com/) qua `@tailwindcss/vite` |
| Animations | [tw-animate-css](https://github.com/jamiebuilds/tailwindcss-animate) |
| Thành phần UI | [shadcn/ui](https://ui.shadcn.com/) (style radix-nova) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Routing | [React Router DOM v7](https://reactrouter.com/) |
| State Server | [TanStack Query v5](https://tanstack.com/query) + Devtools |
| State Client | [Zustand v5](https://zustand-demo.pmnd.rs/) |
| HTTP Client | [Axios](https://axios-http.com/) với interceptors cho auth & làm mới token tự động |
| Forms | [React Hook Form v7](https://react-hook-form.com/) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers) + [Zod v4](https://zod.dev/) |
| Thời gian thực | [Socket.IO Client v4](https://socket.io/) |
| Tải Media | [Cloudinary](https://cloudinary.com/) (unsigned upload preset, trình duyệt → CDN trực tiếp) |
| Phát Video | [Vidstack React](https://www.vidstack.io/) |
| Văn bản phong phú | [Quill v2](https://quilljs.com/) |
| Toast | [Sonner](https://sonner.emilkowal.ski/) |
| Ngày tháng | [Day.js](https://day.js.org/) |
| Giao diện | [next-themes](https://github.com/pacocoursey/next-themes) |
| Font chữ | [Geist Variable](https://vercel.com/font) qua `@fontsource-variable/geist` |
| Linting | ESLint 9 + typescript-eslint |
| Triển khai | [Vercel](https://vercel.com/) |

---

## Cấu Trúc Dự Án

```
frontend/
├── public/                       # Tài nguyên tĩnh phục vụ nguyên bản
├── src/
│   ├── assets/                   # Import tĩnh (SVG, hình ảnh)
│   ├── components/
│   │   ├── comment/              # Các thành phần luồng bình luận
│   │   ├── friend/               # Card lời mời, gợi ý và bạn bè
│   │   ├── layout/               # Shell ứng dụng: MainLayout, Navbar, sidebar trái/phải
│   │   │   └── auth/             # Wrapper layout xác thực
│   │   ├── notification/         # Mục danh sách thông báo & preview dropdown
│   │   ├── post/                 # Card bài viết, editor, dialog, bộ chọn cảm xúc
│   │   ├── profile/              # Header hồ sơ, dialog chỉnh sửa, grid bài viết theo tab
│   │   ├── shared/               # Các thành phần tái sử dụng (Avatar, Lightbox, Skeleton…)
│   │   ├── story/                # Thanh stories, trình xem, dialog thêm/xem
│   │   ├── ui/                   # Các thành phần cơ sở shadcn/ui
│   │   ├── mode-toggle.tsx       # Nút chuyển đổi giao diện sáng / tối / hệ thống
│   │   ├── theme-context.ts      # Định nghĩa React context cho giao diện
│   │   └── theme-provider.tsx    # Wrapper provider next-themes
│   ├── hooks/
│   │   ├── use-auth.ts                 # Hook tiện ích trên auth store
│   │   ├── use-auth-mutations.ts       # Mutations đăng nhập, đăng ký, đăng xuất, mật khẩu
│   │   ├── use-bootstrap.ts            # Khôi phục phiên khi khởi động ứng dụng
│   │   ├── use-cloudinary-upload.ts    # Tải nhiều file với theo dõi tiến độ từng file
│   │   ├── use-comment-mutations.ts    # Tạo, chỉnh sửa, xóa bình luận/trả lời
│   │   ├── use-debounce.ts             # Hook debounce giá trị generic
│   │   ├── use-feed-new-posts.ts       # Logic banner "bài viết mới" qua Socket
│   │   ├── use-follow-mutations.ts     # Mutations theo dõi / bỏ theo dõi
│   │   ├── use-friendship-mutations.ts # Gửi, chấp nhận, từ chối, hủy, chặn yêu cầu
│   │   ├── use-generate-caption.ts     # Hook tạo caption ảnh bằng AI
│   │   ├── use-infinite-scroll.ts      # IntersectionObserver → fetchNextPage
│   │   ├── use-notification-mutations.ts # Đánh dấu đã đọc, đánh dấu tất cả, xóa
│   │   ├── use-post-mutations.ts       # Tạo, cập nhật, xóa bài viết
│   │   ├── use-presence.ts             # Truy vấn hàng loạt trạng thái online/offline
│   │   ├── use-socket.ts               # Kết nối Socket.IO + tất cả event listener
│   │   ├── use-story-mutations.ts      # Tạo và xóa story
│   │   └── use-user-mutations.ts       # Cập nhật hồ sơ, avatar, ảnh bìa, vô hiệu hóa
│   ├── lib/
│   │   ├── query-client.ts       # TanStack Query client singleton
│   │   └── utils.ts              # cn(), formatter, hàm kiểm tra độ mạnh mật khẩu, v.v.
│   ├── pages/
│   │   ├── auth/                 # LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage
│   │   ├── oauth/                # OAuthCallbackPage — xử lý chuyển hướng Google
│   │   ├── feed-page.tsx
│   │   ├── friends-page.tsx      # Tabs: yêu cầu, đã gửi, gợi ý, tất cả bạn bè
│   │   ├── landing-page.tsx      # Trang marketing hiển thị cho khách
│   │   ├── not-found-page.tsx
│   │   ├── notifications-page.tsx
│   │   ├── post-detail-page.tsx  # Xem bài viết đầy đủ với sự kiện bình luận thời gian thực
│   │   ├── profile-page.tsx
│   │   └── settings-page.tsx
│   ├── services/
│   │   ├── api.ts                # Axios instance + interceptor tự động làm mới khi 401
│   │   └── api-services.ts       # Tất cả hàm API được nhóm theo domain
│   ├── stores/
│   │   ├── auth-store.ts         # user, accessToken, isAuthenticated
│   │   ├── notification-store.ts # unreadCount, friendRequestCount, notifications[]
│   │   ├── presence-store.ts     # Set các ID người dùng đang trực tuyến
│   │   └── socket-store.ts       # Instance Socket.IO + phương thức connect/disconnect
│   ├── styles/                   # CSS global bổ sung (ghi đè Quill, v.v.)
│   ├── types/
│   │   └── index.ts              # Tất cả interface và type TypeScript dùng chung
│   ├── App.tsx                   # Root: providers, router, AppBootstrap, tất cả routes
│   ├── index.css                 # Chỉ thị Tailwind + biến CSS oklch
│   └── main.tsx                  # Điểm vào React DOM
├── .env.example                  # Template biến môi trường cần thiết
├── components.json               # Cấu hình shadcn/ui
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                   # Quy tắc rewrite SPA cho Vercel
└── vite.config.ts                # Vite: plugin React + Tailwind, alias @, proxy dev
```

---

## Trang & Routes

| Đường dẫn | Component | Quyền truy cập |
|---|---|---|
| `/` | `LandingPage` | Chỉ khách |
| `/login` | `LoginPage` | Chỉ khách |
| `/register` | `RegisterPage` | Chỉ khách |
| `/verify-email` | `VerifyEmailPage` | Công khai |
| `/forgot-password` | `ForgotPasswordPage` | Chỉ khách |
| `/oauth/callback` | `OAuthCallbackPage` | Công khai |
| `/feed` | `FeedPage` | Được bảo vệ |
| `/profile/:id` | `ProfilePage` | Được bảo vệ |
| `/friends` | `FriendsPage` | Được bảo vệ |
| `/notifications` | `NotificationsPage` | Được bảo vệ |
| `/posts/:id` | `PostDetailPage` | Được bảo vệ |
| `/settings` | `SettingsPage` | Được bảo vệ |
| `*` | `NotFoundPage` | Công khai |

- **`<ProtectedRoute>`** — Chuyển hướng người dùng chưa xác thực đến `/login`, lưu lại đích đến trong `location.state.from`.
- **`<GuestRoute>`** — Chuyển hướng người dùng đã xác thực đến `/feed`.

---

## Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                      Ứng dụng React (Vite)                      │
│                                                                 │
│  ThemeProvider → QueryClientProvider → BrowserRouter            │
│              └─ AppBootstrap (khôi phục phiên + khởi tạo socket)│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages (routes)                                          │   │
│  │  └─ Components (layout, post, story, friend, profile…)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │   Zustand    │  │  TanStack Query  │  │    Socket.IO      │  │
│  │  auth        │  │  server cache    │  │  sự kiện thực     │  │
│  │  presence    │  │  infinite pages  │  │  đồng bộ presence │  │
│  │  notifs      │  │  optimistic UI   │  │  thông báo        │  │
│  │  socket ref  │  └──────────────────┘  └───────────────────┘  │
│  └──────────────┘                                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Axios (api.ts)                                          │   │
│  │  • Gắn Authorization: Bearer <token> mỗi yêu cầu        │   │
│  │  • Khi 401 → làm mới tự động qua /auth/refresh (cookie) │   │
│  │  • Xếp hàng các yêu cầu đồng thời khi refresh, phát lại │   │
│  │  • Refresh thất bại → logout() + chuyển hướng /login     │   │
│  │  • Proxy dev: /api → http://localhost:3000               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  REST API Backend (localhost:3000)
                  Socket.IO Server (localhost:3000)
                  Cloudinary CDN (lưu trữ media)
```

---

## Bắt Đầu

### Yêu Cầu

- **Node.js** ≥ 18
- **npm** ≥ 9
- Một instance backend API đang chạy (xem [README backend](../backend/README.md))
- Tài khoản [Cloudinary](https://cloudinary.com/) (gói miễn phí là đủ)

### Cài Đặt

```bash
# Clone repository
git clone <repo-url>
cd frontend

# Cài đặt dependencies
npm install
```

### Phát Triển

```bash
# Sao chép template môi trường và điền vào các giá trị của bạn
cp .env.example .env

# Khởi động dev server tại http://localhost:5173
npm run dev
```

> Dev server Vite proxy mọi request `/api` đến `http://localhost:3000`, vì vậy CORS được xử lý minh bạch trong quá trình phát triển cục bộ — không cần extension trình duyệt hay thay đổi CORS backend.

### Build Production

```bash
npm run build
```

Output được ghi vào `/dist`. Xem trước bundle production cục bộ:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Biến Môi Trường

Sao chép `.env.example` sang `.env` trong thư mục gốc dự án và điền vào các giá trị:

```env
# URL đầy đủ đến REST API backend (phải bao gồm tiền tố /api)
VITE_API_URL=http://localhost:3000/api

# URL backend dùng cho kết nối Socket.IO
VITE_SOCKET_URL=http://localhost:3000

# Tên cloud Cloudinary (tìm trong dashboard Cloudinary)
VITE_CLOUDINARY_CLOUD_NAME=

# Tên unsigned upload preset của Cloudinary
VITE_CLOUDINARY_UPLOAD_PRESET=
```

> **Lưu ý:** Tất cả biến được thêm tiền tố `VITE_` để Vite hiển thị chúng trong bundle trình duyệt. **Không bao giờ lưu trữ bí mật ở đây** — các giá trị này hiển thị trong output đã biên dịch.

---

## Tích Hợp API

Tất cả các lệnh gọi API nằm trong `src/services/api-services.ts`, được nhóm theo domain:

| Export | Endpoint được bao gồm |
|---|---|
| `authApi` | Đăng ký, xác minh email, gửi lại xác minh, đăng nhập, đăng xuất, làm mới token, quên mật khẩu, xác minh OTP, đặt lại mật khẩu, đổi mật khẩu |
| `usersApi` | Lấy/cập nhật người dùng hiện tại, cập nhật avatar, cập nhật ảnh bìa, vô hiệu hóa, xóa tài khoản, lấy hồ sơ theo ID hoặc tên, tìm kiếm người dùng |
| `postsApi` | Tạo bài viết, lấy feed (phân trang), lấy theo ID, cập nhật, xóa, lấy bài viết của người dùng |
| `commentsApi` | Tạo bình luận/trả lời, danh sách bình luận, danh sách trả lời, cập nhật, xóa |
| `reactionsApi` | Bật/tắt cảm xúc, danh sách người phản ứng (có thể lọc theo loại), lấy tóm tắt, lấy cảm xúc của tôi |
| `friendshipsApi` | Gửi/chấp nhận/từ chối/hủy yêu cầu, xóa bạn, chặn/bỏ chặn, lấy danh sách yêu cầu/đã gửi/bạn bè, lấy trạng thái, lấy gợi ý |
| `followersApi` | Theo dõi/bỏ theo dõi, lấy danh sách người theo dõi, lấy danh sách đang theo dõi, lấy trạng thái theo dõi |
| `notificationsApi` | Danh sách (có thể lọc theo chưa đọc), lấy số chưa đọc, đánh dấu đã đọc, đánh dấu tất cả đã đọc, xóa |
| `storiesApi` | Tạo story, lấy nhóm feed, lấy của tôi, lấy active theo người dùng, ghi nhận lượt xem, lấy người xem, xóa |
| `aiApi` | Tạo caption ảnh (`vi` hoặc `en`) |
| `bootstrapApi` | Nội bộ — chỉ được gọi bởi `useBootstrap` khi khởi động ứng dụng để khôi phục phiên |

### Hành Vi Axios Interceptor

Instance trong `src/services/api.ts` tự động:

1. Gắn `Authorization: Bearer <accessToken>` vào mọi request gửi đi.
2. Khi nhận phản hồi `401`, gọi thầm `POST /auth/refresh` bằng cookie HTTP-only.
3. Xếp hàng tất cả các request đồng thời đến trong quá trình làm mới và phát lại chúng với token mới.
4. Nếu quá trình làm mới thất bại, xóa toàn bộ trạng thái xác thực và chuyển hướng đến `/login`.

Các endpoint xác thực dưới `/auth/` được loại trừ khỏi vòng lặp thử lại 401 để tránh chu kỳ làm mới vô tận.

---

## Thời Gian Thực (Socket.IO)

Hook `useSocket` được gắn một lần bên trong `AppBootstrap` và duy trì một kết nối xác thực duy nhất. Socket xác thực bằng access token hiện tại được truyền dưới dạng tham số query.

### Sự Kiện Socket

| Sự kiện | Hành động xử lý |
|---|---|
| `new_notification` | Thêm vào notification store, tăng huy hiệu chưa đọc, hiển thị toast |
| `friend_request` | Tăng huy hiệu lời mời kết bạn, vô hiệu hóa cache danh sách yêu cầu |
| `friend_request_cancelled` | Giảm huy hiệu, vô hiệu hóa cache |
| `friend_accepted` | Vô hiệu hóa cache bạn bè, feed, hồ sơ và stories |
| `friend_unfriended` | Vô hiệu hóa cache bạn bè, feed và hồ sơ |
| `story:new` | Vô hiệu hóa feed stories, hiển thị toast |
| `story:deleted` | Vô hiệu hóa feed stories |
| `user:online` | Thêm ID người dùng vào presence store |
| `user:offline` | Xóa ID người dùng khỏi presence store |

Khi ngắt kết nối hoặc lỗi kết nối, presence store được xóa để tránh các chỉ báo trực tuyến cũ.

---

## Quản Lý State

Các Zustand store được giữ mỏng một cách có chủ đích — chúng chỉ lưu trữ state xuyên cắt không thuộc server cache:

| Store | State lưu trữ |
|---|---|
| `auth-store` | `user`, `accessToken` (chỉ trong bộ nhớ), `isAuthenticated` |
| `notification-store` | `unreadCount`, `friendRequestCount`, `notifications[]` mới nhất |
| `presence-store` | `Set<userId>` của những người dùng đang trực tuyến |
| `socket-store` | Instance Socket.IO `socket` + phương thức `connect` / `disconnect` |

Tất cả dữ liệu server — bài viết, bình luận, bạn bè, hồ sơ, stories — chỉ tồn tại trong **TanStack Query** để được hưởng lợi từ bộ nhớ đệm tự động, tải lại nền, vô hiệu hóa cache và phân trang vô tận dựa trên con trỏ.

> **Lưu ý bảo mật:** Access token không bao giờ được ghi vào `localStorage` hay cookie — nó chỉ tồn tại trong Zustand (bộ nhớ JS). Refresh token được lưu trong cookie `HttpOnly`, không thể truy cập bằng JavaScript và bảo vệ chống đánh cắp token XSS.

---

## Tải Media (Cloudinary)

Hook `useCloudinaryUpload` cung cấp pipeline tải nhiều file hoàn chỉnh bỏ qua hoàn toàn backend:

- Nhận **ảnh** (≤ 50 MB) và **video** (≤ 100 MB), tối đa **10 file** mỗi bài viết
- Sử dụng `XMLHttpRequest` để theo dõi tiến độ tải thực sự từng file
- Tải tất cả file đồng thời qua `Promise.all`
- Loại trùng file theo tên + kích thước để tránh tải lên kép ngoài ý muốn
- Tự động thu hồi blob `URL.createObjectURL` khi xóa file hoặc reset hook
- Trả về trạng thái kiểu dữ liệu cho mỗi file: `idle | uploading | done | error`

File được tải trực tiếp từ trình duyệt lên Cloudinary bằng **unsigned upload preset**, nghĩa là không có dữ liệu nhị phân nào đi qua máy chủ backend của bạn.

---

## Luồng Xác Thực

```
Khởi động ứng dụng
  └─ useBootstrap()
       ├─ POST /auth/refresh  (cookie HTTP-only) → accessToken
       ├─ GET  /users/me                          → đối tượng user
       ├─ GET  /notifications/unread-count        → huy hiệu chưa đọc
       ├─ GET  /friendships/requests?limit=1      → huy hiệu lời mời kết bạn
       └─ setReady(true) → render children

Đăng nhập Email / Mật khẩu
  └─ POST /auth/login → { accessToken, user }
       └─ setAuth(user, accessToken) → authStore → navigate /feed

Google OAuth
  └─ Trình duyệt chuyển hướng đến handler OAuth backend
       └─ Backend chuyển hướng đến /oauth/callback?token=…
            └─ Parse token → setAuth → navigate /feed

Đăng xuất
  └─ POST /auth/logout  (server xóa cookie refresh token)
       └─ authStore.logout() → chuyển hướng /login

Làm mới Token Tự Động (nền, minh bạch)
  └─ Bất kỳ request không-auth nào trả về 401
       └─ Axios interceptor → POST /auth/refresh
            ├─ Thành công: đặt token mới, phát lại request gốc + các request đang chờ
            └─ Thất bại: authStore.logout() + chuyển hướng /login
```

---

## Triển Khai (Vercel)

Dự án đi kèm `vercel.json` xử lý routing phía client cho SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Các Bước Triển Khai

1. Đẩy code lên GitHub.
2. Import repository trong [Vercel dashboard](https://vercel.com/).
3. Nếu đây là monorepo, đặt **Root Directory** là `frontend`.
4. Thêm tất cả bốn biến môi trường trong **Project → Settings → Environment Variables**.
5. Nhấn **Deploy** — Vercel tự động phát hiện Vite và chạy `npm run build`.

> **CORS trong production:** Đảm bảo backend đặt `Access-Control-Allow-Origin` thành URL triển khai Vercel của bạn và bao gồm `Access-Control-Allow-Credentials: true` để cookie refresh token HTTP-only được gửi khi cross-origin.