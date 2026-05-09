import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EditToggle } from "./edit-toggle";
import { useUpdateMeMutation } from "../../hooks/use-user-mutations";
import type { User } from "../../types";

interface BasicInfoSectionProps {
  user: User;
}

export function BasicInfoSection({ user }: BasicInfoSectionProps) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const updateMeMutation = useUpdateMeMutation();

  const isDirty = username !== user?.username || bio !== (user?.bio ?? "");

  const handleToggle = () => {
    if (editing) {
      setUsername(user?.username ?? "");
      setBio(user?.bio ?? "");
    }
    setEditing((v) => !v);
  };

  const handleSave = () => {
    updateMeMutation.mutate({
      username: username !== user?.username ? username : undefined,
      bio: bio !== (user?.bio ?? "") ? bio : undefined,
    });
    setEditing(false);
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Thông tin cơ bản</h3>
        <EditToggle enabled={editing} onToggle={handleToggle} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!editing}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          disabled={!editing}
          className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed bg-transparent"
          placeholder="Giới thiệu bản thân..."
        />
        <p className="text-xs text-muted-foreground text-right">
          {bio.length}/200
        </p>
      </div>

      {editing && (
        <Button
          disabled={!isDirty || updateMeMutation.isPending}
          onClick={handleSave}
        >
          {updateMeMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      )}
    </div>
  );
}
