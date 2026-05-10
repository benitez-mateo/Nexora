import type { Project } from "./types";

/**
 * El workspace arranca vacío. El primer proyecto se crea desde la UI
 * (botón "+ Nuevo proyecto" en /proyectos).
 */
export const INITIAL_PROJECTS: Project[] = [];

/**
 * Equipo demo para la pantalla "/equipo". Si más adelante quieres que cada
 * usuario gestione su propio equipo en Supabase, esto se reemplazará.
 */
export const TEAM = [
  { name: "Ejemplo · Manager", role: "Manager", workload: 0 },
];

/**
 * Respuestas automáticas del chat. Se mantienen para que el chat siga
 * sintiéndose vivo durante las pruebas. Si tu equipo va a usar el chat
 * real entre compañeros, lo migramos a Supabase Realtime en una fase 2.
 */
export const AUTOREPLIES = [
  { who: "Sistema", text: "Mensaje recibido. El equipo lo revisará pronto." },
];
