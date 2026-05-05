import { useAuthStore } from "../stores/auth-store";
import { useSocketStore } from "../stores/socket-store";
import { authApi } from "../services/api-services";
import { queryClient } from "../lib/query-client";
import type { User } from "../types";

export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    setAuth,
    setAccessToken,
    updateUser,
    logout: storeLogout,
  } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  const login = (user: User, token: string) => {
    setAuth(user, token);
    connect(token);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — still clear local state
    }
    storeLogout();
    disconnect();
    queryClient.clear();
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    setAccessToken,
    updateUser,
    login,
    logout,
  };
};
