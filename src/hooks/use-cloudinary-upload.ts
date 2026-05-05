import { useState, useCallback, useRef } from "react";

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface FileUploadState {
  file: File;
  preview: string;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  url?: string;
  publicId?: string;
  error?: string;
}

const MAX_FILES = 10;
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const uploadOne = (
  file: File,
  folder: string,
  onProgress: (pct: number) => void,
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
    const uploadPreset = import.meta.env
      .VITE_CLOUDINARY_UPLOAD_PRESET as string;

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    form.append("folder", folder);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as {
          secure_url: string;
          public_id: string;
        };
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    );
    xhr.send(form);
  });
};

export const useCloudinaryUpload = (folder = "posts") => {
  const [items, setItems] = useState<FileUploadState[]>([]);

  const itemsRef = useRef<FileUploadState[]>([]);

  const syncedSetItems = useCallback(
    (updater: (prev: FileUploadState[]) => FileUploadState[]) => {
      setItems((prev) => {
        const next = updater(prev);
        itemsRef.current = next;
        return next;
      });
    },
    [],
  );

  const updateItem = useCallback(
    (index: number, patch: Partial<FileUploadState>) => {
      syncedSetItems((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      );
    },
    [syncedSetItems],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      const current = itemsRef.current;
      const remaining = MAX_FILES - current.length;
      if (remaining <= 0) return;

      const valid: File[] = [];
      for (const f of incoming.slice(0, remaining)) {
        const isImg = f.type.startsWith("image/");
        const isVid = f.type.startsWith("video/");
        if (!isImg && !isVid) continue;
        if (isImg && f.size > MAX_IMAGE_SIZE) continue;
        if (isVid && f.size > MAX_VIDEO_SIZE) continue;
        const already = current.some(
          (x) => x.file.name === f.name && x.file.size === f.size,
        );
        if (!already) valid.push(f);
      }

      if (valid.length === 0) return;

      const newItems: FileUploadState[] = valid.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        progress: 0,
        status: "idle",
      }));

      syncedSetItems((prev) => [...prev, ...newItems]);
    },
    [syncedSetItems],
  );

  const removeFile = useCallback(
    (index: number) => {
      syncedSetItems((prev) => {
        URL.revokeObjectURL(prev[index]?.preview ?? "");
        return prev.filter((_, i) => i !== index);
      });
    },
    [syncedSetItems],
  );

  const uploadAll = useCallback(async (): Promise<string[]> => {
    const snapshot = itemsRef.current;
    const indices = snapshot
      .map((item, i) => (item.status === "idle" ? i : -1))
      .filter((i) => i >= 0);

    if (indices.length === 0) {
      return snapshot.filter((x) => x.url).map((x) => x.url!);
    }

    const results = await Promise.all(
      indices.map(async (idx) => {
        updateItem(idx, { status: "uploading", progress: 0 });
        try {
          const result = await uploadOne(snapshot[idx].file, folder, (pct) =>
            updateItem(idx, { progress: pct }),
          );
          updateItem(idx, {
            status: "done",
            progress: 100,
            url: result.url,
            publicId: result.publicId,
          });
          return result.url;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload thất bại";
          updateItem(idx, { status: "error", error: msg });
          throw new Error(`"${snapshot[idx].file.name}": ${msg}`);
        }
      }),
    );

    const urlByIndex = new Map<number, string>();
    indices.forEach((idx, pos) => urlByIndex.set(idx, results[pos]));

    return snapshot
      .map((item, i) => {
        if (urlByIndex.has(i)) return urlByIndex.get(i)!;
        return item.url ?? "";
      })
      .filter(Boolean);
  }, [folder, updateItem]);

  const reset = useCallback(() => {
    itemsRef.current.forEach((x) => URL.revokeObjectURL(x.preview));
    syncedSetItems(() => []);
  }, [syncedSetItems]);

  const hasFiles = items.length > 0;
  const isUploading = items.some((x) => x.status === "uploading");
  const hasError = items.some((x) => x.status === "error");
  const allDone = items.length > 0 && items.every((x) => x.status === "done");

  return {
    items,
    addFiles,
    removeFile,
    uploadAll,
    reset,
    hasFiles,
    isUploading,
    hasError,
    allDone,
    MAX_FILES,
  };
};
