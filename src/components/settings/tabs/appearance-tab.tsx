import { ModeToggle } from "../../mode-toggle";
import { ColorSchemePicker } from "../color-scheme-picker";

export function AppearanceTab() {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold">Chế độ hiển thị</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Chuyển sáng / tối
          </span>
          <ModeToggle />
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-semibold">Màu sắc chủ đề</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Áp dụng ngay, được lưu tự động
          </p>
        </div>
        <ColorSchemePicker />
      </div>
    </div>
  );
}
