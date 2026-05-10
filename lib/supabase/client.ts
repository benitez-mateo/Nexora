"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase singleton para el navegador.
 *
 * Si las variables de entorno no están definidas (por ejemplo en local antes
 * de configurar Supabase), devolvemos `null` y el AuthProvider hace fallback
 * a localStorage. Eso permite trabajar offline sin romper la app.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  client = createBrowserClient(url, anon);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
