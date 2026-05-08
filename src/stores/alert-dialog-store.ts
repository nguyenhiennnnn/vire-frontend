import { create } from "zustand";

interface AlertDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertDialogStore {
  open: boolean;
  options: AlertDialogOptions | null;
  show: (options: AlertDialogOptions) => void;
  hide: () => void;
}

export const useAlertDialogStore = create<AlertDialogStore>((set) => ({
  open: false,
  options: null,
  show: (options) => set({ open: true, options }),
  hide: () => set({ open: false, options: null }),
}));
