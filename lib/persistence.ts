"use client";

import type { Project } from "./types";

export interface WorkspaceSnapshot {
  projects: Project[];
  version: number;
  updatedAt: number;
}

export const SCHEMA_VERSION = 3;

export interface PersistenceAdapter {
  load(): WorkspaceSnapshot | null;
  save(snapshot: WorkspaceSnapshot): void;
  subscribe(cb: (snapshot: WorkspaceSnapshot) => void): () => void;
  clear(): void;
}

const STORAGE_KEY = "nexora_workspace";

const newDelivId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `dl-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function migrate(parsed: unknown): WorkspaceSnapshot | null {
  if (!parsed || typeof parsed !== "object") return null;
  let snap = parsed as Record<string, unknown>;
  let version = (snap.version as number) ?? 1;

  if (version === 1 && Array.isArray(snap.steps)) {
    const migratedSteps = (snap.steps as Array<Record<string, unknown>>).map(
      (s) => {
        const oldDeliverables = (s.deliverables as unknown[]) ?? [];
        const completed = s.status === "completed";
        const progress = (s.progress as number) ?? 0;
        const targetDone = completed
          ? oldDeliverables.length
          : Math.round((progress / 100) * oldDeliverables.length);
        const deliverables = oldDeliverables.map((d, i) => {
          if (typeof d === "string") {
            return { id: newDelivId(), text: d, done: i < targetDone };
          }
          return d;
        });
        const { progress: _progress, ...rest } = s;
        return { ...rest, deliverables };
      },
    );
    snap = { ...snap, steps: migratedSteps, version: 2 };
    version = 2;
  }

  if (version === 2 && Array.isArray(snap.steps)) {
    // Snapshots viejos de mono-proyecto: si tenían fases, las preservamos
    // como un único proyecto; si estaban vacías, arrancamos limpio.
    const oldSteps = snap.steps as Project["steps"];
    const projects: Project[] =
      oldSteps.length > 0
        ? [
            {
              id: `p-${Date.now()}-legacy`,
              client: "—",
              title: "Proyecto migrado",
              finalDate: "—",
              steps: oldSteps,
              messages: (snap.messages as Project["messages"]) ?? [],
              activeStepId: (snap.activeStepId as number | null) ?? null,
              createdAt: (snap.updatedAt as number) ?? Date.now(),
            },
          ]
        : [];
    snap = {
      projects,
      version: 3,
      updatedAt: Date.now(),
    };
    version = 3;
  }

  if (version === 3 && Array.isArray(snap.projects)) {
    return snap as unknown as WorkspaceSnapshot;
  }

  return null;
}

export class LocalStorageAdapter implements PersistenceAdapter {
  load(): WorkspaceSnapshot | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  save(snapshot: WorkspaceSnapshot): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* quota exceeded — ignore */
    }
  }

  subscribe(cb: (snapshot: WorkspaceSnapshot) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const migrated = migrate(JSON.parse(e.newValue));
        if (migrated) cb(migrated);
      } catch {
        /* malformed — ignore */
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const persistence: PersistenceAdapter = new LocalStorageAdapter();
