import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "./lib/query-client";
import { useSocket } from "./hooks/use-socket";
import { useBootstrap } from "./hooks/use-bootstrap";

import { MainLayout } from "./components/layout/main-layout";
import {
  ProtectedRoute,
  GuestRoute,
} from "./components/shared/protected-route";

import LoginPage from "./pages/auth/login-page";
import RegisterPage from "./pages/auth/register-page";
import VerifyEmailPage from "./pages/auth/verify-email-page";
import ForgotPasswordPage from "./pages/auth/forgot-password-page";

import LandingPage from "./pages/landing-page";
import FeedPage from "./pages/feed-page";
import ProfilePage from "./pages/profile-page";
import FriendsPage from "./pages/friends-page";
import NotificationsPage from "./pages/notifications-page";
import PostDetailPage from "./pages/post-detail-page";
import SettingsPage from "./pages/settings-page";
import NotFoundPage from "./pages/not-found-page";
import { ThemeProvider } from "./components/theme-provider";
import OAuthCallbackPage from "./pages/oauth/oauth-callback-page";

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { isReady } = useBootstrap();
  useSocket();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppBootstrap>
            <Routes>
              <Route
                path="/"
                element={
                  <GuestRoute>
                    <LandingPage />
                  </GuestRoute>
                }
              />

              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />

              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ForgotPasswordPage />
                  </GuestRoute>
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppBootstrap>
        </BrowserRouter>

        <Toaster position="top-right" richColors closeButton duration={3500} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
