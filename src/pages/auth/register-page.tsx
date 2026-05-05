import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { AuthLayout } from "../../components/layout/auth/auth-layout";
import { AuthCard, AuthCardHeader } from "../../components/shared/auth-card";
import { FormField } from "../../components/shared/form-field";
import { PasswordInput } from "../../components/shared/password-input";
import { PasswordStrengthBar } from "../../components/shared/password-strength-bar";
import { GoogleButton } from "../../components/shared/google-button";
import {
  useRegisterMutation,
  useResendVerifyMutation,
} from "../../hooks/use-auth-mutations";

const schema = z
  .object({
    username: z
      .string()
      .min(3, "Tối thiểu 3 ký tự")
      .max(20, "Tối đa 20 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ dùng chữ, số và dấu _"),
    email: z.string().email("Email không hợp lệ"),
    password: z
      .string()
      .min(8, "Tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function EmailSentScreen({
  email,
  resendPending,
  resendCooldown,
  onResend,
}: {
  email: string;
  resendPending: boolean;
  resendCooldown: number;
  onResend: () => void;
}) {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Mail size={26} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Kiểm tra hộp thư</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Link xác thực đã được gửi đến{" "}
              <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={resendCooldown > 0 || resendPending}
              onClick={onResend}
            >
              {resendCooldown > 0
                ? `Gửi lại sau ${resendCooldown}s`
                : resendPending
                  ? "Đang gửi..."
                  : "Gửi lại email"}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Về trang đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  const registerMutation = useRegisterMutation({
    onSuccess: setRegisteredEmail,
    setError,
  });
  const resendMutation = useResendVerifyMutation({
    onSuccess: () => {
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    },
  });

  if (registeredEmail) {
    return (
      <EmailSentScreen
        email={registeredEmail}
        resendPending={resendMutation.isPending}
        resendCooldown={resendCooldown}
        onResend={() => resendMutation.mutate(registeredEmail)}
      />
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthCardHeader title="Tạo tài khoản" />

        <form
          onSubmit={handleSubmit((d) =>
            registerMutation.mutate({
              username: d.username,
              email: d.email,
              password: d.password,
            }),
          )}
          className="space-y-4"
        >
          <FormField error={errors.username?.message}>
            <Input placeholder="Username" {...register("username")} />
          </FormField>

          <FormField error={errors.email?.message}>
            <Input type="email" placeholder="Email" {...register("email")} />
          </FormField>

          <FormField error={errors.password?.message}>
            <PasswordInput placeholder="Mật khẩu" {...register("password")} />
            <PasswordStrengthBar password={password} />
          </FormField>

          <FormField error={errors.confirmPassword?.message}>
            <PasswordInput
              placeholder="Xác nhận mật khẩu"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">hoặc</span>
          </div>
        </div>

        <GoogleButton label="Đăng ký với Google" />

        <p className="text-sm text-center text-muted-foreground pt-2 border-t border-border/60">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
