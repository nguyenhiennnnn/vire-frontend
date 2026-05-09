import { Switch } from "../ui/switch"

interface EditToggleProps {
  enabled: boolean
  onToggle: () => void
}

export function EditToggle({ enabled, onToggle }: EditToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={enabled} onCheckedChange={onToggle} id="edit-mode" />
      <label
        htmlFor="edit-mode"
        className="text-sm text-muted-foreground cursor-pointer select-none"
      >
        Chỉnh sửa
      </label>
    </div>
  )
}