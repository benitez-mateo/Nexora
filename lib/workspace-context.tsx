"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { AUTOREPLIES, INITIAL_PROJECTS } from "./data";
import { persistence, SCHEMA_VERSION } from "./persistence";
import type {
  ChatMessage,
  Deliverable,
  Project,
  Step,
  StepStatus,
} from "./types";
import { progressOf } from "./types";

export interface DeliverableDraft {
  id?: string;
  text: string;
  done?: boolean;
}

export interface StepDraft {
  title: string;
  subtitle?: string;
  date: string;
  dateLabel: string;
  deliverables: DeliverableDraft[];
}

export interface NewProjectInput {
  title: string;
  client: string;
  finalDate: string;
}

interface WorkspaceContextValue {
  projects: Project[];
  currentProject: Project | null;
  hydrated: boolean;

  addProject: (input: NewProjectInput) => string;
  removeProject: (id: string) => void;
  updateProjectMeta: (
    id: string,
    updates: Partial<NewProjectInput>,
  ) => void;

  steps: Step[];
  activeStepId: number | null;
  totalProgress: number;
  delayedCount: number;
  messages: ChatMessage[];

  selectStep: (id: number) => void;
  toggleDeliverable: (stepId: number, deliverableId: string) => void;
  completeStep: (id: number) => void;
  markStepDelayed: (id: number) => void;
  resolveDelayed: (id: number) => void;

  addStep: (draft: StepDraft, after?: number | null) => void;
  updateStep: (id: number, draft: StepDraft) => void;
  removeStep: (id: number) => void;
  moveStep: (id: number, direction: "up" | "down") => void;

  chatOpen: boolean;
  typing: boolean;
  toast: string | null;

  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  sendMessage: (text: string) => void;
  broadcastDelayAlert: () => void;

  showToast: (message: string) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const nowTime = () =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const newStepId = () => Date.now() + Math.floor(Math.random() * 1000);

function renumber(steps: Step[]): Step[] {
  return steps.map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0") }));
}

function deriveActiveId(steps: Step[]): number | null {
  const focus = steps.find(
    (s) => s.status === "active" || s.status === "delayed",
  );
  return focus?.id ?? null;
}

function draftToDeliverables(
  drafts: DeliverableDraft[],
  previous: Deliverable[] = [],
): Deliverable[] {
  return drafts
    .filter((d) => d.text.trim().length > 0)
    .map((d) => {
      const prior = d.id ? previous.find((p) => p.id === d.id) : undefined;
      return {
        id: d.id ?? createId(),
        text: d.text.trim(),
        done: d.done ?? prior?.done ?? false,
      };
    });
}

function maybeAutoComplete(steps: Step[]): Step[] {
  const idx = steps.findIndex(
    (s) => s.status === "active" || s.status === "delayed",
  );
  if (idx === -1) return steps;
  const focus = steps[idx];
  const allDone =
    focus.deliverables.length > 0 && focus.deliverables.every((d) => d.done);
  if (!allDone) return steps;
  return steps.map((s, i) => {
    if (i === idx) {
      return {
        ...s,
        status: "completed" as StepStatus,
        dateLabel: "Completado el",
      };
    }
    if (i === idx + 1 && s.status === "pending") {
      return { ...s, status: "active" as StepStatus };
    }
    return s;
  });
}

function ensureActive(steps: Step[]): Step[] {
  const hasFocus = steps.some(
    (s) => s.status === "active" || s.status === "delayed",
  );
  if (hasFocus) return steps;
  const firstPending = steps.findIndex((s) => s.status === "pending");
  if (firstPending === -1) return steps;
  return steps.map((s, i) =>
    i === firstPending ? { ...s, status: "active" as StepStatus } : s,
  );
}

function reconcile(steps: Step[]): Step[] {
  return ensureActive(maybeAutoComplete(steps));
}

const newProjectId = () =>
  `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [chatOpen, setChatOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const lastSavedAt = useRef(0);

  const currentProjectId = useMemo(() => {
    const match = pathname.match(/^\/proyectos\/([^/?]+)$/);
    return match?.[1] ?? null;
  }, [pathname]);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId) ?? null,
    [projects, currentProjectId],
  );

  useEffect(() => {
    const snap = persistence.load();
    if (snap && snap.projects.length > 0) {
      setProjects(
        snap.projects.map((p) => ({
          ...p,
          steps: reconcile(p.steps),
          activeStepId:
            p.activeStepId ??
            deriveActiveId(reconcile(p.steps)),
        })),
      );
      lastSavedAt.current = snap.updatedAt;
    }
    setHydrated(true);

    const unsub = persistence.subscribe((incoming) => {
      if (incoming.updatedAt <= lastSavedAt.current) return;
      lastSavedAt.current = incoming.updatedAt;
      setProjects(
        incoming.projects.map((p) => ({
          ...p,
          steps: reconcile(p.steps),
          activeStepId:
            p.activeStepId ?? deriveActiveId(reconcile(p.steps)),
        })),
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const updatedAt = Date.now();
    lastSavedAt.current = updatedAt;
    persistence.save({
      projects,
      version: SCHEMA_VERSION,
      updatedAt,
    });
  }, [projects, hydrated]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const updateCurrentProject = useCallback(
    (updater: (p: Project) => Project) => {
      if (!currentProjectId) return;
      setProjects((prev) =>
        prev.map((p) => (p.id === currentProjectId ? updater(p) : p)),
      );
    },
    [currentProjectId],
  );

  /* ===== Project CRUD ===== */

  const addProject = useCallback(
    (input: NewProjectInput) => {
      const id = newProjectId();
      const project: Project = {
        id,
        client: input.client.trim() || "Cliente sin nombre",
        title: input.title.trim() || "Nuevo proyecto",
        finalDate: input.finalDate.trim() || "—",
        steps: [],
        messages: [],
        activeStepId: null,
        createdAt: Date.now(),
      };
      setProjects((prev) => [...prev, project]);
      showToast("Proyecto creado");
      return id;
    },
    [showToast],
  );

  const removeProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (id === currentProjectId) {
        router.push("/proyectos");
      }
      showToast("Proyecto eliminado");
    },
    [currentProjectId, router, showToast],
  );

  const updateProjectMeta = useCallback(
    (id: string, updates: Partial<NewProjectInput>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                title: updates.title?.trim() || p.title,
                client: updates.client?.trim() || p.client,
                finalDate: updates.finalDate?.trim() || p.finalDate,
              }
            : p,
        ),
      );
      showToast("Proyecto actualizado");
    },
    [showToast],
  );

  /* ===== Derived current-project state ===== */

  const steps = currentProject?.steps ?? [];
  const messages = currentProject?.messages ?? [];
  const activeStepId = currentProject?.activeStepId ?? null;

  const totalProgress = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round(
      steps.reduce((sum, s) => sum + progressOf(s), 0) / steps.length,
    );
  }, [steps]);

  const delayedCount = useMemo(
    () => steps.filter((s) => s.status === "delayed").length,
    [steps],
  );

  /* ===== Step methods ===== */

  const selectStep = useCallback(
    (id: number) => {
      updateCurrentProject((p) => ({ ...p, activeStepId: id }));
    },
    [updateCurrentProject],
  );

  const toggleDeliverable = useCallback(
    (stepId: number, deliverableId: string) => {
      const project = projects.find((p) => p.id === currentProjectId);
      if (!project) return;
      const target = project.steps.find((s) => s.id === stepId);
      if (!target) return;

      const newDelivs = target.deliverables.map((d) =>
        d.id === deliverableId ? { ...d, done: !d.done } : d,
      );
      const allDone =
        newDelivs.length > 0 && newDelivs.every((d) => d.done);
      const willComplete =
        allDone &&
        (target.status === "active" || target.status === "delayed");

      updateCurrentProject((p) => {
        const updated = p.steps.map((s) =>
          s.id === stepId ? { ...s, deliverables: newDelivs } : s,
        );
        const reconciled = reconcile(updated);
        return {
          ...p,
          steps: reconciled,
          activeStepId: deriveActiveId(reconciled),
        };
      });

      if (willComplete) showToast("Fase completada");
    },
    [projects, currentProjectId, updateCurrentProject, showToast],
  );

  const completeStep = useCallback(
    (id: number) => {
      const project = projects.find((p) => p.id === currentProjectId);
      if (!project) return;
      const target = project.steps.find((s) => s.id === id);
      if (!target || target.status === "completed" || target.status === "pending") {
        return;
      }

      updateCurrentProject((p) => {
        const updated = p.steps.map((s) =>
          s.id === id
            ? {
                ...s,
                deliverables: s.deliverables.map((d) => ({ ...d, done: true })),
              }
            : s,
        );
        const reconciled = reconcile(updated);
        return {
          ...p,
          steps: reconciled,
          activeStepId: deriveActiveId(reconciled),
        };
      });
      showToast("Fase completada");
    },
    [projects, currentProjectId, updateCurrentProject, showToast],
  );

  const markStepDelayed = useCallback(
    (id: number) => {
      updateCurrentProject((p) => {
        const updated = p.steps.map((s) =>
          s.id === id && (s.status === "active" || s.status === "pending")
            ? { ...s, status: "delayed" as StepStatus }
            : s,
        );
        return { ...p, steps: updated, activeStepId: id };
      });
      showToast("Aviso enviado al equipo");
    },
    [updateCurrentProject, showToast],
  );

  const resolveDelayed = useCallback(
    (id: number) => {
      updateCurrentProject((p) => ({
        ...p,
        steps: p.steps.map((s) =>
          s.id === id && s.status === "delayed"
            ? { ...s, status: "active" as StepStatus }
            : s,
        ),
      }));
      showToast("Estado restaurado");
    },
    [updateCurrentProject, showToast],
  );

  const addStep = useCallback(
    (draft: StepDraft, after: number | null = null) => {
      updateCurrentProject((p) => {
        const newStep: Step = {
          id: newStepId(),
          num: "00",
          title: draft.title.trim() || "Nueva fase",
          subtitle: draft.subtitle?.trim() || "",
          status: "pending",
          date: draft.date.trim() || "—",
          dateLabel: draft.dateLabel.trim() || "Est. Inicio",
          deliverables: draftToDeliverables(draft.deliverables),
        };
        const insertIdx =
          after == null
            ? p.steps.length
            : p.steps.findIndex((s) => s.id === after) + 1;
        const next = [...p.steps];
        next.splice(insertIdx, 0, newStep);
        const reconciled = reconcile(renumber(next));
        return {
          ...p,
          steps: reconciled,
          activeStepId: deriveActiveId(reconciled),
        };
      });
      showToast("Fase añadida");
    },
    [updateCurrentProject, showToast],
  );

  const updateStep = useCallback(
    (id: number, draft: StepDraft) => {
      updateCurrentProject((p) => {
        const updated = p.steps.map((s) =>
          s.id === id
            ? {
                ...s,
                title: draft.title.trim() || s.title,
                subtitle: draft.subtitle?.trim() || "",
                date: draft.date.trim() || s.date,
                dateLabel: draft.dateLabel.trim() || s.dateLabel,
                deliverables: draftToDeliverables(
                  draft.deliverables,
                  s.deliverables,
                ),
              }
            : s,
        );
        const reconciled = reconcile(updated);
        return {
          ...p,
          steps: reconciled,
          activeStepId: deriveActiveId(reconciled),
        };
      });
      showToast("Fase actualizada");
    },
    [updateCurrentProject, showToast],
  );

  const removeStep = useCallback(
    (id: number) => {
      updateCurrentProject((p) => {
        const idx = p.steps.findIndex((s) => s.id === id);
        if (idx === -1) return p;
        const removed = p.steps[idx];
        const remaining = p.steps.filter((s) => s.id !== id);

        let nextActive = p.activeStepId;
        if (
          (removed.status === "active" || removed.status === "delayed") &&
          remaining.length > 0
        ) {
          const fallbackIdx = Math.min(idx, remaining.length - 1);
          const fallback = remaining[fallbackIdx];
          if (fallback.status === "pending") {
            remaining[fallbackIdx] = { ...fallback, status: "active" };
          }
          nextActive = remaining[fallbackIdx].id;
        } else if (p.activeStepId === id) {
          nextActive = deriveActiveId(remaining);
        }

        return {
          ...p,
          steps: reconcile(renumber(remaining)),
          activeStepId: nextActive,
        };
      });
      showToast("Fase eliminada");
    },
    [updateCurrentProject, showToast],
  );

  const moveStep = useCallback(
    (id: number, direction: "up" | "down") => {
      updateCurrentProject((p) => {
        const idx = p.steps.findIndex((s) => s.id === id);
        if (idx === -1) return p;
        const swapWith = direction === "up" ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= p.steps.length) return p;
        const next = [...p.steps];
        [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
        return { ...p, steps: reconcile(renumber(next)) };
      });
    },
    [updateCurrentProject],
  );

  /* ===== Chat ===== */

  const toggleChat = useCallback(() => setChatOpen((o) => !o), []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !currentProjectId) return;
      const senderName = user?.name ?? "You";
      const message: ChatMessage = {
        id: createId(),
        who: senderName,
        time: nowTime(),
        text: trimmed,
        reacts: [],
      };
      updateCurrentProject((p) => ({
        ...p,
        messages: [...p.messages, message],
      }));

      window.setTimeout(() => setTyping(true), 600);
      window.setTimeout(() => {
        setTyping(false);
        const reply =
          AUTOREPLIES[Math.floor(Math.random() * AUTOREPLIES.length)];
        updateCurrentProject((p) => ({
          ...p,
          messages: [
            ...p.messages,
            {
              id: createId(),
              who: reply.who,
              time: nowTime(),
              text: reply.text,
              reacts: [],
            },
          ],
        }));
      }, 2200);
    },
    [currentProjectId, updateCurrentProject, user],
  );

  const broadcastDelayAlert = useCallback(() => {
    if (!currentProjectId) return;
    const project = projects.find((p) => p.id === currentProjectId);
    if (!project) return;

    const target =
      project.steps.find(
        (s) => s.id === project.activeStepId && s.status !== "completed",
      ) ??
      project.steps.find(
        (s) => s.status === "active" || s.status === "delayed",
      );
    if (!target) return;

    const stepName = `${target.title}${target.subtitle ? " " + target.subtitle : ""}`;
    const senderName = user?.name ?? "You";

    updateCurrentProject((p) => ({
      ...p,
      steps: p.steps.map((s) =>
        s.id === target.id
          ? { ...s, status: "delayed" as StepStatus }
          : s,
      ),
      messages: [
        ...p.messages,
        {
          id: createId(),
          who: senderName,
          time: nowTime(),
          text: `⚠ Alerta de retraso difundida — la fase "${stepName}" requiere apoyo del equipo para cumplir la fecha de entrega ${target.date}.`,
          reacts: [],
          pinned: true,
          alert: true,
        },
      ],
    }));

    setChatOpen(true);
    showToast("Aviso de retraso difundido");
  }, [currentProjectId, projects, updateCurrentProject, user, showToast]);

  const resetWorkspace = useCallback(() => {
    persistence.clear();
    setProjects(INITIAL_PROJECTS);
    showToast("Workspace restaurado");
  }, [showToast]);

  const value: WorkspaceContextValue = {
    projects,
    currentProject,
    hydrated,

    addProject,
    removeProject,
    updateProjectMeta,

    steps,
    activeStepId,
    totalProgress,
    delayedCount,
    messages,

    selectStep,
    toggleDeliverable,
    completeStep,
    markStepDelayed,
    resolveDelayed,

    addStep,
    updateStep,
    removeStep,
    moveStep,

    chatOpen,
    typing,
    toast,

    toggleChat,
    setChatOpen,
    sendMessage,
    broadcastDelayAlert,

    showToast,
    resetWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
