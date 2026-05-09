import { Button } from "../../ui/button";
import {
  useDeactivateMutation,
  useDeleteAccountMutation,
} from "../../../hooks/use-user-mutations";
import { useAlertDialogStore } from "../../../stores/alert-dialog-store";

export function DangerTab() {
  const { show } = useAlertDialogStore();
  const deactivateMutation = useDeactivateMutation();
  const deleteMutation = useDeleteAccountMutation();

  const handleDeactivate = () => {
    show({
      title: "Vô hiệu hoá tài khoản?",
      description:
        "Tài khoản sẽ bị tạm ẩn. Bạn có thể đăng nhập lại để kích hoạt.",
      confirmLabel: "Xác nhận",
      cancelLabel: "Huỷ",
      onConfirm: () => deactivateMutation.mutate(),
    });
  };

  const handleDelete = () => {
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
    <div className="space-y-4">
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground">Vô hiệu hoá tài khoản</h3>
        <p className="text-sm text-muted-foreground">
          Tài khoản sẽ bị vô hiệu hoá. Bạn có thể kích hoạt lại bằng cách đăng
          nhập.
        </p>
        <Button variant="outline" onClick={handleDeactivate}>
          Vô hiệu hoá tài khoản
        </Button>
      </div>

      <div className="bg-card border border-destructive/30 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-destructive">Xoá tài khoản</h3>
        <p className="text-sm text-muted-foreground">
          Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu sẽ
          bị xoá vĩnh viễn.
        </p>
        <Button variant="destructive" onClick={handleDelete}>
          Xoá tài khoản vĩnh viễn
        </Button>
      </div>
    </div>
  );
}
