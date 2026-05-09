import { Chrome } from "lucide-react";

export function GoogleAccountSection() {
  return (
    <div className="bg-card border rounded-xl p-5 space-y-2">
      <h3 className="font-semibold">Tài khoản Google</h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Chrome size={16} className="text-blue-500" />
        <span>Tài khoản này được liên kết với Google OAuth</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Bạn đăng nhập bằng Google — không có mật khẩu riêng cho tài khoản này.
      </p>
    </div>
  );
}
