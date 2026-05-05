import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AuthLayout } from "../../components/layout/auth/auth-layout";
import { AuthCard } from "../../components/shared/auth-card";
import {
  useResendVerifyMutation,
  useVerifyEmailMutation,
} from "../../hooks/use-auth-mutations";

type State = "loading" | "success" | "error";

function VerifyState({ state }: { state: State }) {
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Đang xác thực email của bạn...
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold">Email đã xác thực!</h2>
        <p className="text-sm text-muted-foreground">
          Bạn có thể đăng nhập ngay bây giờ.
        </p>
        <Link to="/login?verified=true" className="w-full mt-2">
          <Button className="w-full">Đến trang đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <XCircle size={28} className="text-destructive" />
      </div>
      <h2 className="text-xl font-bold">Liên kết không hợp lệ</h2>
      <p className="text-sm text-muted-foreground">
        Liên kết đã hết hạn hoặc đã được sử dụng.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const verifyMutation = useVerifyEmailMutation(token);
  const resendMutation = useResendVerifyMutation();

  useEffect(() => {
    if (token) verifyMutation.mutate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const state: State =
    !token || verifyMutation.isError
      ? "error"
      : verifyMutation.isSuccess
        ? "success"
        : "loading";

  return (
    <AuthLayout>
      <AuthCard>
        <VerifyState state={state} />

        {state === "error" && (
          <div className="space-y-2 pt-1">
            <Button
              className="w-full"
              variant="outline"
              disabled={resendMutation.isPending || resendMutation.isSuccess}
              onClick={() => resendMutation.mutate("")}
            >
              {resendMutation.isPending
                ? "Đang gửi..."
                : resendMutation.isSuccess
                  ? "Đã gửi!"
                  : "Gửi lại email xác thực"}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full text-muted-foreground">
                Về trang đăng nhập
              </Button>
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
