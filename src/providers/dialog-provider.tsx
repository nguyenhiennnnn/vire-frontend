import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useDialogStore } from "../stores/dialog-store";

export function DialogProvider() {
  const { open, options, hide } = useDialogStore();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && hide()}>
      <DialogContent className={options?.className}>
        <DialogHeader>
          <DialogTitle>{options?.title}</DialogTitle>
          {options?.description && (
            <DialogDescription>{options.description}</DialogDescription>
          )}
        </DialogHeader>

        {options?.content}

        {options?.footer && <DialogFooter>{options.footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
