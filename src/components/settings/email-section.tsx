import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useResendVerifyMutation } from "../../hooks/use-auth-mutations";

interface EmailSectionProps {
  email: string | undefined;
  isVerified: boolean | undefined;
}

export function EmailSection({ email, isVerified }: EmailSectionProps) {
  const [cooldown, setCooldown] = useState(0);

  const resendMutation = useResendVerifyMutation({
    onSuccess: () => {
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    },
  });

  return (
    <div className="bg-card border rounded-xl p-5 space-y-3">
      <h3 className="font-semibold">Email</h3>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{email}</span>
        {isVerified ? (
          <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={11} /> Đã xác thực
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
            <AlertCircle size={11} /> Chưa xác thực
          </span>
        )}
      </div>
      {!isVerified && (
        <Button
          size="sm"
          variant="outline"
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={() => resendMutation.mutate(email ?? "")}
        >
          {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại email xác thực"}
        </Button>
      )}
    </div>
  );
}
