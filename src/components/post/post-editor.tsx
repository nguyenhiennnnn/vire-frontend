import { useEffect, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";

const MAX_CHARS = 5000;

interface Props {
  placeholder?: string;
  initialValue?: string;
  onChange: (html: string, text: string) => void;
  onReset?: (resetFn: () => void) => void;
  onSetValue?: (setValueFn: (html: string) => void) => void;
  autoFocus?: boolean;
}

export const PostEditor = ({
  placeholder = "Bạn đang nghĩ gì?",
  initialValue,
  onChange,
  onReset,
  onSetValue,
  autoFocus,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  const resetEditor = useCallback(() => {
    if (quillRef.current) {
      quillRef.current.setText("");
      quillRef.current.history.clear();
    }
  }, []);

  const setValue = useCallback((html: string) => {
    const quill = quillRef.current;
    if (!quill) return;
    quill.history.clear();
    quill.clipboard.dangerouslyPasteHTML(0, html);
    quill.setSelection(quill.getLength(), 0);
    quill.history.clear();
  }, []);

  useEffect(() => {
    onReset?.(resetEditor);
  }, [onReset, resetEditor]);

  useEffect(() => {
    onSetValue?.(setValue);
  }, [onSetValue, setValue]);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    import("quill").then(({ default: Quill }) => {
      const toolbarOptions = [
        ["bold", "italic", "underline", "strike"],
        ["link", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ];

      const quill = new Quill(containerRef.current!, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: toolbarOptions,
          history: { delay: 1000, maxStack: 100, userOnly: true },
          clipboard: { matchVisual: false },
        },
      });

      if (initialValue?.trim()) {
        quill.clipboard.dangerouslyPasteHTML(0, initialValue);
        quill.setSelection(quill.getLength(), 0);
      }

      quill.on("text-change", () => {
        const text = quill.getText();
        if (text.length > MAX_CHARS + 1) {
          quill.deleteText(MAX_CHARS, quill.getLength());
          return;
        }

        const html = quill.getSemanticHTML();
        const trimmed = text.trim();
        onChange(trimmed ? html : "", trimmed);

        const counter = containerRef.current
          ?.closest(".post-editor-wrapper")
          ?.querySelector<HTMLElement>(".ql-char-count");
        if (counter) {
          const len = trimmed.length;
          counter.textContent = `${len}/${MAX_CHARS}`;
          counter.dataset.near = String(len > MAX_CHARS * 0.85);
          counter.dataset.atlimit = String(len >= MAX_CHARS);
        }
      });

      if (autoFocus) setTimeout(() => quill.focus(), 50);
      quillRef.current = quill;
    });

    return () => {
      quillRef.current = null;
    };
  }, []);

  return (
    <div className="post-editor-wrapper rounded-xl border bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden">
      <div ref={containerRef} />
      <div className="flex justify-end px-3 pb-2 border-t pt-1.5">
        <span
          className={cn(
            "ql-char-count text-xs font-mono tabular-nums text-muted-foreground",
            "data-[atlimit='true']:text-destructive data-[atlimit='true']:font-semibold",
            "data-[near='true']:text-foreground",
          )}
        >
          0/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
};
