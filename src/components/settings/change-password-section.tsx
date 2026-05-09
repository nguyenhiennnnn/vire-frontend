import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordStrengthBar } from "../shared/password-strength-bar";
import { EditToggle } from "./edit-toggle";
import { useChangePasswordMutation } from "../../hooks/use-auth-mutations";
import { useAuth } from "../../hooks/use-auth";
import { getPasswordStrength } from "../../lib/utils";
import { PasswordInput } from "../shared/password-input";

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

export function ChangePasswordSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

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

  const changePwMutation = useChangePasswordMutation({
    setError,
    onSuccess: () => {
      reset();
      setEditing(false);
      setTimeout(async () => {
        await logout();
        navigate("/login?changed=true");
      }, 1500);
    },
  });

  const handleToggle = () => {
    if (editing) reset();
    setEditing((v) => !v);
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Đổi mật khẩu</h3>
        <EditToggle enabled={editing} onToggle={handleToggle} />
      </div>

      <form
        onSubmit={handleSubmit((d) => changePwMutation.mutate(d))}
        className="space-y-3"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">Mật khẩu hiện tại</label>
          <PasswordInput {...register("currentPassword")} disabled={!editing} />
          {errors.currentPassword && (
            <p className="text-xs text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Mật khẩu mới</label>
          <PasswordInput {...register("newPassword")} disabled={!editing} />
          {newPw && pwStrength && <PasswordStrengthBar password={newPw} />}
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 số
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
          <Input
            type="password"
            {...register("confirmPassword")}
            disabled={!editing}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {editing && (
          <Button type="submit" disabled={changePwMutation.isPending}>
            {changePwMutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
          </Button>
        )}
      </form>
    </div>
  );
}
