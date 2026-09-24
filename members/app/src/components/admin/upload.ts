"use client";

import { startUpload, type UploadKind } from "@/app/(admin)/admin/_actions/content";
import { createClient } from "@/lib/supabase/client";

/** Sends a file straight to the private bucket with a one-time signed URL. Returns the stored path. */
export async function uploadToStorage(productId: string, kind: UploadKind, file: Blob): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const started = await startUpload(productId, kind, file.type, file.size);
  if (!started.ok) return started;
  const { path, token } = started.data as { path: string; token: string };
  const { error } = await createClient().storage.from("products").uploadToSignedUrl(path, token, file, { contentType: file.type });
  if (error) {
    console.error("upload failed", error.message);
    return { ok: false, error: "err_upload" };
  }
  return { ok: true, path };
}

/** A light preview (at most 700 px) of a page drawing, made in the browser. */
export async function makePreview(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 700 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (blob?.type === "image/webp") return blob;
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  } catch {
    return null;
  }
}

/** "noahs-ark-page-3.png" -> "Noahs ark page 3". */
export function titleFromFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
}
