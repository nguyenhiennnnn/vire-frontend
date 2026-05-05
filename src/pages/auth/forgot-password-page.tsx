import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { AuthLayout } from "../../components/layout/auth/auth-layout";
import { AuthCard } from "../../components/shared/auth-card";
import { FormField } from "../../components/shared/form-field";
import { PasswordInput } from "../../components/shared/password-input";
import { PasswordStrengthBar } from "../../components/shared/password-strength-bar";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "../../hooks/use-auth-mutations";

type Step = 1 | 2 | 3;
const OTP_TTL = 15 * 60;

function StepIndicator({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        {labels.map((_, i) => (
          <div
            key={i}
            className={`flex items-center ${i < labels.length - 1 ? "flex-1" : ""}`}
          >
            <div
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                current > i + 1
                  ? "bg-primary border-primary text-primary-foreground"
                  : current === i + 1
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-muted-foreground"
              }`}
            >
              {current > i + 1 ? "✓" : i + 1}
            </div>

            {i < labels.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 transition-colors duration-300 ${
                  current > i + 1 ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hidden sm:flex justify-between">
        {labels.map((label, i) => (
          <span
            key={i}
            className={`text-[10px] whitespace-nowrap transition-colors duration-300 ${
              current === i + 1
                ? "text-primary font-medium"
                : current > i + 1
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, char: string) => {
    const digit = char.replace(/\D/, "");
    const chars = value.padEnd(6, " ").split("").slice(0, 6);
    chars[i] = digit || " ";
    const next = chars.join("").trimEnd();
    onChange(next.slice(0, 6));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!value[i] && i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 bg-background transition-colors focus:outline-none focus:border-primary ${
            value[i]
              ? "border-primary/50 text-foreground"
              : "border-border text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function CountdownText({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <p
      className={`text-center text-sm font-mono ${seconds < 120 ? "text-destructive" : "text-muted-foreground"}`}
    >
      {seconds > 0 ? `Mã hết hạn sau ${mm}:${ss}` : "Mã đã hết hạn"}
    </p>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [countdown, setCountdown] = useState(OTP_TTL);

  const sendOtpMutation = useForgotPasswordMutation({
    onSuccess: (e) => {
      setEmail(e);
      setStep(2);
    },
  });
  const verifyOtpMutation = useVerifyOtpMutation({
    email,
    onSuccess: (token) => {
      setResetToken(token);
      setStep(3);
    },
    onLocked: () => setStep(1),
  });
  const resetPasswordMutation = useResetPasswordMutation({
    resetToken,
    onExpired: () => setStep(1),
  });

  useEffect(() => {
    if (step !== 2) return;
    setCountdown(OTP_TTL);
    const timer = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [step]);

  const step1Form = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({ email: z.string().email("Email không hợp lệ") }),
    ),
  });

  const step3Form = useForm<{ newPassword: string; confirmPassword: string }>({
    resolver: zodResolver(
      z
        .object({
          newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
          confirmPassword: z.string(),
        })
        .refine((d) => d.newPassword === d.confirmPassword, {
          message: "Mật khẩu không khớp",
          path: ["confirmPassword"],
        }),
    ),
  });

  const newPw = step3Form.watch("newPassword", "");

  const STEP_LABELS = ["Nhập email", "Xác nhận OTP", "Mật khẩu mới"];

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-1">
          <StepIndicator current={step} labels={STEP_LABELS} />
        </div>

        {step === 1 && (
          <form
            onSubmit={step1Form.handleSubmit((d) =>
              sendOtpMutation.mutate(d.email),
            )}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold">Quên mật khẩu</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Nhập email để nhận mã xác nhận 6 số.
              </p>
            </div>

            <FormField error={step1Form.formState.errors.email?.message}>
              <Input
                type="email"
                placeholder="Email"
                {...step1Form.register("email")}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full"
              disabled={sendOtpMutation.isPending}
            >
              {sendOtpMutation.isPending ? "Đang gửi..." : "Gửi mã OTP"}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Quay lại đăng nhập
              </Button>
            </Link>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Nhập mã xác nhận</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Mã 6 số đã gửi đến{" "}
                <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <OtpInput value={otpCode} onChange={setOtpCode} />
            <CountdownText seconds={countdown} />

            <Button
              className="w-full"
              disabled={otpCode.length < 6 || verifyOtpMutation.isPending}
              onClick={() => verifyOtpMutation.mutate(otpCode)}
            >
              {verifyOtpMutation.isPending ? "Đang xác nhận..." : "Xác nhận mã"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              disabled={countdown > 0 || sendOtpMutation.isPending}
              onClick={() => sendOtpMutation.mutate(email)}
            >
              {countdown > 0
                ? `Gửi lại sau ${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`
                : "Gửi lại mã"}
            </Button>
          </div>
        )}

        {step === 3 && (
          <form
            onSubmit={step3Form.handleSubmit((d) =>
              resetPasswordMutation.mutate(d.newPassword),
            )}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold">Mật khẩu mới</h2>
            </div>

            <FormField error={step3Form.formState.errors.newPassword?.message}>
              <PasswordInput
                placeholder="Mật khẩu mới"
                {...step3Form.register("newPassword")}
              />
              <PasswordStrengthBar password={newPw} />
            </FormField>

            <FormField
              error={step3Form.formState.errors.confirmPassword?.message}
            >
              <PasswordInput
                placeholder="Xác nhận mật khẩu mới"
                {...step3Form.register("confirmPassword")}
              />
            </FormField>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? "Đang đặt lại..."
                : "Đặt lại mật khẩu"}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
