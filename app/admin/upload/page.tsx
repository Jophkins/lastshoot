"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { extractExif } from "@/lib/client/extract-exif";
import { generateVariants } from "@/lib/client/image-resize";

type UploadStatus = "idle" | "processing" | "uploading" | "committing" | "done" | "error";

type FileEntry = {
  file: File;
  status: UploadStatus;
  error?: string;
};

export default function AdminUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [globalStatus, setGlobalStatus] = useState<UploadStatus>("idle");

  const updateEntry = useCallback((index: number, patch: Partial<FileEntry>) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }
    const newEntries: FileEntry[] = Array.from(files).map(file => ({
      file,
      status: "idle" as const,
    }));
    setEntries(prev => [...prev, ...newEntries]);
  }

  async function uploadSingle(entry: FileEntry, index: number) {
    try {
      // 1. Extract EXIF (no GPS)
      updateEntry(index, { status: "processing" });
      const exif = await extractExif(entry.file);

      // 2. Generate preview & thumb in browser
      const { preview, thumb } = await generateVariants(entry.file);

      // 3. Request signed URLs
      updateEntry(index, { status: "uploading" });
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [
            { filename: entry.file.name, contentType: entry.file.type, variant: "original" },
            { filename: entry.file.name, contentType: "image/webp", variant: "preview" },
            { filename: entry.file.name, contentType: "image/webp", variant: "thumb" },
          ],
        }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get signed URLs");
      }

      const { items } = await signRes.json() as {
        items: { variant: string; key: string; url: string }[];
      };

      const originalItem = items.find(i => i.variant === "original")!;
      const previewItem = items.find(i => i.variant === "preview")!;
      const thumbItem = items.find(i => i.variant === "thumb")!;

      // 4. Upload files directly to storage
      await Promise.all([
        fetch(originalItem.url, { method: "PUT", body: entry.file, headers: { "Content-Type": entry.file.type } }),
        fetch(previewItem.url, { method: "PUT", body: preview, headers: { "Content-Type": "image/webp" } }),
        fetch(thumbItem.url, { method: "PUT", body: thumb, headers: { "Content-Type": "image/webp" } }),
      ]);

      // 5. Commit metadata
      updateEntry(index, { status: "committing" });
      const commitRes = await fetch("/api/photos/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalKey: originalItem.key,
          previewKey: previewItem.key,
          thumbKey: thumbItem.key,
          title: entry.file.name.replace(/\.[^.]+$/, ""),
          isPublished: false,
          ...exif,
        }),
      });

      if (!commitRes.ok) {
        throw new Error("Failed to commit photo metadata");
      }

      updateEntry(index, { status: "done" });
    }
    catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      updateEntry(index, { status: "error", error: message });
    }
  }

  async function handleUploadAll() {
    setGlobalStatus("uploading");
    const pending = entries
      .map((e, i) => ({ entry: e, index: i }))
      .filter(({ entry }) => entry.status === "idle" || entry.status === "error");

    await Promise.allSettled(
      pending.map(({ entry, index }) => uploadSingle(entry, index)),
    );

    setGlobalStatus("done");
    router.refresh();
  }

  function removeEntry(index: number) {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }

  const hasUploadable = entries.some(e => e.status === "idle" || e.status === "error");

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Upload Photos</h1>

      {/* File picker */}
      <div className="mb-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border-2 border-dashed border-neutral-300 px-6 py-4 text-sm text-neutral-600 hover:border-neutral-400"
        >
          Select images...
        </button>
      </div>

      {/* File list */}
      {entries.length > 0 && (
        <div className="mb-6 space-y-2">
          {entries.map((entry, i) => (
            <div
              key={`${entry.file.name}-${i}`}
              className="flex items-center justify-between rounded-lg border px-4 py-2 text-sm"
            >
              <span className="truncate">{entry.file.name}</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={entry.status} error={entry.error} />
                {(entry.status === "idle" || entry.status === "error") && (
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {hasUploadable && (
        <button
          type="button"
          onClick={handleUploadAll}
          disabled={globalStatus === "uploading"}
          className="rounded-lg bg-neutral-900 px-6 py-2 text-white disabled:opacity-50"
        >
          {globalStatus === "uploading" ? "Uploading..." : "Upload All"}
        </button>
      )}

      {globalStatus === "done" && (
        <p className="mt-4 text-sm text-green-600">All uploads processed.</p>
      )}
    </div>
  );
}

function StatusBadge({ status, error }: { status: UploadStatus; error?: string }) {
  const labels: Record<UploadStatus, string> = {
    idle: "Pending",
    processing: "Processing EXIF...",
    uploading: "Uploading...",
    committing: "Saving...",
    done: "Done",
    error: error ?? "Error",
  };

  const colors: Record<UploadStatus, string> = {
    idle: "text-neutral-500",
    processing: "text-blue-500",
    uploading: "text-blue-500",
    committing: "text-blue-500",
    done: "text-green-600",
    error: "text-red-500",
  };

  return (
    <span className={`text-xs ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
