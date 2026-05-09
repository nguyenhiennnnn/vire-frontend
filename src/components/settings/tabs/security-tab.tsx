import { Chrome } from "lucide-react";
import { Button } from "../../ui/button";
import { ChangePasswordSection } from "../change-password-section";

interface SecurityTabProps {
  isGoogleAccount: boolean;
}

export function SecurityTab({ isGoogleAccount }: SecurityTabProps) {
  if (isGoogleAccount) {
    return (
      <div className="bg-card border rounded-xl p-6 text-center space-y-3">
        <Chrome size={36} className="mx-auto text-blue-500" />
        <h3 className="font-semibold">Đăng nhập bằng Google</h3>
        <p className="text-sm text-muted-foreground">
          Tài khoản này sử dụng Google để xác thực.
          <br />
          Bạn không cần mật khẩu — quản lý bảo mật qua tài khoản Google của bạn.
        </p>
        <a
          href="https://myaccount.google.com/security"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Chrome size={14} /> Cài đặt bảo mật Google
          </Button>
        </a>
      </div>
    );
  }

  return <ChangePasswordSection />;
}
