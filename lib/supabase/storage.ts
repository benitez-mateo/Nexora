"use client";

import type { Attachment } from "@/lib/types";
import { getSupabaseClient } from "./client";

const BUCKET = "chat-attachments";
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function safeName(name: string): string {
  // Quita caracteres problemáticos para URLs y rutas de storage.
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "file";
}

/**
 * Sube un archivo al bucket `chat-attachments` y devuelve metadata para
 * incrustar en el mensaje. Devuelve null si Supabase no está configurado o
 * si hubo un error.
 */
export async function uploadChatFile(
  file: File,
  projectId: string,
  messageId: string,
): Promise<Attachment | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `"${file.name}" supera los 25 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    );
  }

  const ts = Date.now();
  const path = `${projectId}/${messageId}/${ts}-${safeName(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    url: data.publicUrl,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
  };
}

export function isImage(att: Attachment): boolean {
  return att.type.startsWith("image/");
}

export function isVideo(att: Attachment): boolean {
  return att.type.startsWith("video/");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
