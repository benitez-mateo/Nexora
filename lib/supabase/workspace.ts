"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ChatMessage, Project, Step } from "@/lib/types";
import { getSupabaseClient } from "./client";

/* ===========================================================================
 * Helpers de mapeo entre la fila de la DB y nuestros tipos.
 * - DB usa snake_case y guarda steps como JSONB.
 * - Cliente usa camelCase y tipos estructurados.
 * ========================================================================= */

interface ProjectRow {
  id: string;
  client: string;
  title: string;
  final_date: string;
  steps: Step[];
  active_step_id: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  project_id: string;
  who: string;
  avatar: string | null;
  user_id: string | null;
  time: string;
  text: string;
  reacts: ChatMessage["reacts"];
  attachments: ChatMessage["attachments"];
  pinned: boolean;
  alert: boolean;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

function projectFromRow(row: ProjectRow, messages: ChatMessage[] = []): Project {
  return {
    id: row.id,
    client: row.client,
    title: row.title,
    finalDate: row.final_date,
    steps: Array.isArray(row.steps) ? row.steps : [],
    messages,
    activeStepId: row.active_step_id ?? null,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function messageFromRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    who: row.who,
    avatar: row.avatar ?? undefined,
    userId: row.user_id ?? undefined,
    time: row.time,
    text: row.text,
    reacts: row.reacts ?? [],
    attachments: row.attachments ?? [],
    pinned: row.pinned,
    alert: row.alert,
    editedAt: row.edited_at ?? undefined,
    deletedAt: row.deleted_at ?? undefined,
  };
}

/* ===========================================================================
 * CRUD
 * ========================================================================= */

export async function loadAllProjects(): Promise<Project[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const [{ data: projectRows, error: pErr }, { data: msgRows, error: mErr }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true }),
    ]);

  if (pErr) throw pErr;
  if (mErr) throw mErr;

  const messagesByProject = new Map<string, ChatMessage[]>();
  ((msgRows as MessageRow[]) ?? []).forEach((m) => {
    const arr = messagesByProject.get(m.project_id) ?? [];
    arr.push(messageFromRow(m));
    messagesByProject.set(m.project_id, arr);
  });

  return ((projectRows as ProjectRow[]) ?? []).map((p) =>
    projectFromRow(p, messagesByProject.get(p.id) ?? []),
  );
}

export async function insertProject(project: Project, userId?: string | null) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("projects").insert({
    id: project.id,
    client: project.client,
    title: project.title,
    final_date: project.finalDate,
    steps: project.steps,
    active_step_id: project.activeStepId,
    created_by: userId ?? null,
  });
  if (error) throw error;
}

export async function updateProjectRow(
  id: string,
  patch: Partial<Pick<Project, "client" | "title" | "finalDate" | "steps" | "activeStepId">>,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const dbPatch: Record<string, unknown> = {};
  if (patch.client !== undefined) dbPatch.client = patch.client;
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.finalDate !== undefined) dbPatch.final_date = patch.finalDate;
  if (patch.steps !== undefined) dbPatch.steps = patch.steps;
  if (patch.activeStepId !== undefined) dbPatch.active_step_id = patch.activeStepId;

  if (Object.keys(dbPatch).length === 0) return;

  const { error } = await supabase.from("projects").update(dbPatch).eq("id", id);
  if (error) throw error;
}

export async function deleteProjectRow(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export async function insertMessage(projectId: string, message: ChatMessage) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("messages").insert({
    id: message.id,
    project_id: projectId,
    who: message.who,
    avatar: message.avatar ?? null,
    user_id: message.userId ?? null,
    time: message.time,
    text: message.text,
    reacts: message.reacts ?? [],
    attachments: message.attachments ?? [],
    pinned: Boolean(message.pinned),
    alert: Boolean(message.alert),
  });
  if (error) throw error;
}

export async function updateMessageAttachments(
  id: string,
  attachments: NonNullable<ChatMessage["attachments"]>,
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("messages")
    .update({ attachments })
    .eq("id", id);
  if (error) throw error;
}

export async function editMessageRow(id: string, text: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("messages")
    .update({ text, edited_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function softDeleteMessageRow(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("messages")
    .update({
      deleted_at: new Date().toISOString(),
      // Vaciamos el texto para no exponerlo en la base de datos.
      text: "",
    })
    .eq("id", id);
  if (error) throw error;
}

/* ===========================================================================
 * Realtime: una suscripción global que dispara `onChange` cuando algo cambia
 * en cualquiera de las dos tablas.
 *
 * El consumidor (workspace-context) decide cómo refrescar (refetch completo o
 * patch granular). Por ahora hacemos refetch completo — simple y suficiente
 * para volúmenes pequeños.
 * ========================================================================= */

export function subscribeWorkspace(
  onChange: (kind: "projects" | "messages") => void,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channel: RealtimeChannel = supabase
    .channel("nexora-workspace")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      () => onChange("projects"),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      () => onChange("messages"),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
