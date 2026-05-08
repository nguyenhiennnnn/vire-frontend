import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Chrome } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { getPasswordStrength } from "../lib/utils";
import { PasswordStrengthBar } from "../components/shared/password-strength-bar";
import {
  useDeactivateMutation,
  useDeleteAccountMutation,
  useUpdateMeMutation,
} from "../hooks/use-user-mutations";
import {
  useChangePasswordMutation,
  useResendVerifyMutation,
} from "../hooks/use-auth-mutations";
import { useAlertDialogStore } from "../stores/alert-dialog-store";

// ─── Constants ────────────────────────────────────────
const TABS = [
  { value: "account", label: "Tài khoản" },
  { value: "security", label: "Bảo mật" },
  { value: "danger", label: "Nguy hiểm" },
] as const;

// ─── Schema ───────────────────────────────────────────
const pwSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Không khớp",
    path: ["confirmPassword"],
  });

type PwForm = z.infer<typeof pwSchema>;

// ─── Sub-components ───────────────────────────────────
function PasswordInput({
  show,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...props} />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        onClick={onToggle}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { show } = useAlertDialogStore();

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const isGoogleAccount = !!user?.googleId;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
    reset,
  } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const newPw = watch("newPassword", "");
  const pwStrength = newPw ? getPasswordStrength(newPw) : null;
  const isDirty = username !== user?.username || bio !== (user?.bio ?? "");

  // ─── Mutations ────────────────────────────────────────
  const updateMeMutation = useUpdateMeMutation();

  const resendMutation = useResendVerifyMutation({
    onSuccess: () => {
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    },
  });

  const changePwMutation = useChangePasswordMutation({
    setError,
    onSuccess: () => {
      reset();
      setTimeout(async () => {
        await logout();
        navigate("/login?changed=true");
      }, 1500);
    },
  });

  const deactivateMutation = useDeactivateMutation();

  const deleteMutation = useDeleteAccountMutation();

  const handleSaveProfile = () => {
    updateMeMutation.mutate({
      username: username !== user?.username ? username : undefined,
      bio: bio !== (user?.bio ?? "") ? bio : undefined,
    });
  };

  const handleResendVerify = () => {
    resendMutation.mutate(user?.email ?? "");
  };

  const handleToggleCurrentPw = () => {
    setShowCurrent((v) => !v);
  };

  const handleToggleNewPw = () => {
    setShowNew((v) => !v);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handlePasswordSubmit = (d: PwForm) => {
    changePwMutation.mutate(d);
  };

  const handleOpenDeactivate = () => {
    show({
      title: "Vô hiệu hoá tài khoản?",
      description:
        "Tài khoản sẽ bị tạm ẩn. Bạn có thể đăng nhập lại để kích hoạt.",
      confirmLabel: "Xác nhận",
      cancelLabel: "Huỷ",
      onConfirm: () => deactivateMutation.mutate(),
    });
  };

  const handleOpenDelete = () => {
    show({
      title: "Xoá tài khoản vĩnh viễn?",
      description: "Tất cả dữ liệu sẽ bị xoá vĩnh viễn và không thể hoàn tác.",
      confirmLabel: "Xoá vĩnh viễn",
      cancelLabel: "Huỷ",
      variant: "destructive",
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Cài đặt</h1>

      <Tabs defaultValue="account">
        <TabsList className="w-full rounded-none h-auto p-0 bg-transparent border-b mb-6">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 rounded-none py-3 text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── Account ─────────────────────────────── */}
        <TabsContent value="account" className="space-y-6">
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold">Thông tin cơ bản</h3>
            <div className="space-y-1">
              <label className="text-sm font-medium">Username</label>
              <Input value={username} onChange={handleUsernameChange} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={handleBioChange}
                maxLength={200}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Giới thiệu bản thân..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/200
              </p>
            </div>
            <Button
              disabled={!isDirty || updateMeMutation.isPending}
              onClick={handleSaveProfile}
            >
              {updateMeMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>

          <div className="bg-card border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold">Email</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              {user?.isVerified ? (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Đã xác thực
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                  <AlertCircle size={11} /> Chưa xác thực
                </span>
              )}
            </div>
            {!user?.isVerified && (
              <Button
                size="sm"
                variant="outline"
                disabled={resendCooldown > 0 || resendMutation.isPending}
                onClick={handleResendVerify}
              >
                {resendCooldown > 0
                  ? `Gửi lại sau ${resendCooldown}s`
                  : "Gửi lại email xác thực"}
              </Button>
            )}
          </div>

          {isGoogleAccount && (
            <div className="bg-card border rounded-xl p-5 space-y-2">
              <h3 className="font-semibold">Tài khoản Google</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Chrome size={16} className="text-blue-500" />
                <span>Tài khoản này được liên kết với Google OAuth</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Bạn đăng nhập bằng Google — không có mật khẩu riêng cho tài
                khoản này.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ─── Security ────────────────────────────── */}
        <TabsContent value="security">
          {isGoogleAccount ? (
            <div className="bg-card border rounded-xl p-6 text-center space-y-3">
              <Chrome size={36} className="mx-auto text-blue-500" />
              <h3 className="font-semibold">Đăng nhập bằng Google</h3>
              <p className="text-sm text-muted-foreground">
                Tài khoản này sử dụng Google để xác thực.
                <br />
                Bạn không cần mật khẩu — quản lý bảo mật qua tài khoản Google
                của bạn.
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
          ) : (
            <div className="bg-card border rounded-xl p-5 space-y-4">
              <h3 className="font-semibold">Đổi mật khẩu</h3>
              <form
                onSubmit={handleSubmit(handlePasswordSubmit)}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Mật khẩu hiện tại
                  </label>
                  <PasswordInput
                    show={showCurrent}
                    onToggle={handleToggleCurrentPw}
                    {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Mật khẩu mới</label>
                  <PasswordInput
                    show={showNew}
                    onToggle={handleToggleNewPw}
                    {...register("newPassword")}
                  />
                  {newPw && pwStrength && (
                    <PasswordStrengthBar password={newPw} />
                  )}
                  {errors.newPassword && (
                    <p className="text-xs text-destructive">
                      Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 số
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Xác nhận mật khẩu mới
                  </label>
                  <Input type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={changePwMutation.isPending}>
                  {changePwMutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </div>
          )}
        </TabsContent>

        {/* ─── Danger ──────────────────────────────── */}
        <TabsContent value="danger" className="space-y-4">
          <div className="bg-card border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground">
              Vô hiệu hoá tài khoản
            </h3>
            <p className="text-sm text-muted-foreground">
              Tài khoản sẽ bị vô hiệu hoá. Bạn có thể kích hoạt lại bằng cách
              đăng nhập.
            </p>
            <Button variant="outline" onClick={handleOpenDeactivate}>
              Vô hiệu hoá tài khoản
            </Button>
          </div>

          <div className="bg-card border border-destructive/30 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-destructive">Xoá tài khoản</h3>
            <p className="text-sm text-muted-foreground">
              Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu
              sẽ bị xoá vĩnh viễn.
            </p>
            <Button variant="destructive" onClick={handleOpenDelete}>
              Xoá tài khoản vĩnh viễn
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
