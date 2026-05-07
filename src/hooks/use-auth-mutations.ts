import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "./use-auth";
import { getApiError } from "../lib/get-api-error";
import { authApi } from "../services/api-services";

export const useLoginMutation = ({
  from,
  setUnverifiedEmail,
  setError,
}: {
  from: string;
  setUnverifiedEmail: (email: string | null) => void;
  setError: (field: "password", error: { message: string }) => void;
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      navigate(from, { replace: true });
    },
    onError: (err: any) => {
      const msg = getApiError(err);
      const status: number = err?.response?.status ?? 0;
      if (status === 403 && msg.includes("xác thực")) {
        setUnverifiedEmail(
          err?.config?.data
            ? ((JSON.parse(err.config.data) as { email?: string }).email ??
                null)
            : null,
        );
      } else if (status === 401) {
        setError("password", { message: msg });
      } else {
        toast.error(msg);
      }
    },
  });
};

export const useRegisterMutation = ({
  onSuccess,
  setError,
}: {
  onSuccess: (email: string) => void;
  setError: (field: "email" | "username", error: { message: string }) => void;
}) => {
  return useMutation({
    mutationFn: (data: { username: string; email: string; password: string }) =>
      authApi.register(data),
    onSuccess: (_, variables) => onSuccess(variables.email),
    onError: (err: any) => {
      const msg = getApiError(err);
      if (msg.includes("Email")) setError("email", { message: msg });
      else if (msg.includes("Username")) setError("username", { message: msg });
      else toast.error(msg);
    },
  });
};

export const useResendVerifyMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerify(email),
    onSuccess: () => {
      toast.success("Đã gửi lại email xác thực");
      onSuccess?.();
    },
    onError: (err: any) =>
      toast.error(getApiError(err, "Gửi email thất bại, thử lại sau")),
  });
};

export const useForgotPasswordMutation = ({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) => {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_, email) => onSuccess(email),
    onError: (err: any) => toast.error(getApiError(err, "Gửi OTP thất bại")),
  });
};

export const useVerifyOtpMutation = ({
  email,
  onSuccess,
  onLocked,
}: {
  email: string;
  onSuccess: (resetToken: string) => void;
  onLocked: () => void;
}) => {
  return useMutation({
    mutationFn: (code: string) => authApi.verifyOtp({ email, code }),
    onSuccess: (data) => onSuccess(data.resetToken),
    onError: (err: any) => {
      const msg = getApiError(err, "Mã không đúng");
      toast.error(msg);
      if (msg.includes("khoá") || msg.includes("5 lần")) onLocked();
    },
  });
};

export const useResetPasswordMutation = ({
  resetToken,
  onExpired,
}: {
  resetToken: string;
  onExpired: () => void;
}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (newPassword: string) =>
      authApi.resetPassword({ resetToken, newPassword }),
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công");
      setTimeout(() => navigate("/login?reset=success"), 1200);
    },
    onError: (err: any) => {
      const msg = getApiError(err, "Đặt lại mật khẩu thất bại");
      toast.error(msg);
      if (msg.includes("hết hạn")) onExpired();
    },
  });
};

export const useChangePasswordMutation = ({
  setError,
  onSuccess,
}: {
  setError: (field: "currentPassword", error: { message: string }) => void;
  onSuccess: () => void;
}) => {
  return useMutation({
    mutationFn: (d: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(d),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      onSuccess();
    },
    onError: (err: any) => {
      const msg = getApiError(err, "Đổi mật khẩu thất bại");
      if (msg.includes("hiện tại"))
        setError("currentPassword", { message: msg });
      else toast.error(msg);
    },
  });
};

export const useVerifyEmailMutation = (token: string) => {
  return useMutation({
    mutationFn: () => authApi.verifyEmail(token),
  });
};
