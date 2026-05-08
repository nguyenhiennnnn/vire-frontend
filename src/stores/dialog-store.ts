import { create } from "zustand";
import type { ReactNode } from "react";

interface DialogOptions {
  title: string;
  description?: string;
  content?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface DialogStore {
  open: boolean;
  options: DialogOptions | null;
  show: (options: DialogOptions) => void;
  hide: () => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  open: false,
  options: null,
  show: (options) => set({ open: true, options }),
  hide: () => set({ open: false, options: null }),
}));
