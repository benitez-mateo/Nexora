"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase singleton para el navegador.
 *
 * Usamos `createClient` directo (no `createBrowserClient` de `@supabase/ssr`)
 * porque toda la auth de la app vive en el cliente — no leemos cookies en el
 * servidor. Esto evita que la sesión se guarde en cookies (que pueden hacer
 * que el header de la request supere el límite de Vercel y devuelva 494
 * REQUEST_HEADER_TOO_LARGE). Con `localStorage` la sesión vive solo en el
 * navegador y no se manda con cada request.
 *
 * Si las variables de entorno no están definidas, devolvemos `null` y el
 * AuthProvider hace fallback a localStorage propio.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "nexora-auth",
      // localStorage por defecto — no cookies.
    },
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
