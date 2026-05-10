export type StepStatus = "pending" | "active" | "delayed" | "completed";

export interface Deliverable {
  id: string;
  text: string;
  done: boolean;
}

export interface Step {
  id: number;
  num: string;
  title: string;
  subtitle?: string;
  status: StepStatus;
  date: string;
  dateLabel: string;
  deliverables: Deliverable[];
}

export interface ChatReaction {
  e: string;
  n: number;
}

export interface ChatMessage {
  id: string;
  who: string;
  time: string;
  text: string;
  reacts?: ChatReaction[];
  pinned?: boolean;
  alert?: boolean;
}

export interface Project {
  id: string;
  client: string;
  title: string;
  finalDate: string;
  steps: Step[];
  messages: ChatMessage[];
  activeStepId: number | null;
  createdAt: number;
}

export type Theme = "light" | "dark";

export function progressOf(step: Step): number {
  if (step.deliverables.length === 0) {
    return step.status === "completed" ? 100 : 0;
  }
  const done = step.deliverables.filter((d) => d.done).length;
  return Math.round((done / step.deliverables.length) * 100);
}

export function projectProgress(project: Project): number {
  if (project.steps.length === 0) return 0;
  return Math.round(
    project.steps.reduce((sum, s) => sum + progressOf(s), 0) /
      project.steps.length,
  );
}

export function projectStatus(
  project: Project,
): "FINALIZADO" | "EN RIESGO" | "EN PROCESO" | "SIN FASES" {
  if (project.steps.length === 0) return "SIN FASES";
  if (project.steps.every((s) => s.status === "completed")) return "FINALIZADO";
  if (project.steps.some((s) => s.status === "delayed")) return "EN RIESGO";
  return "EN PROCESO";
}
