"use client";

import { getSupabaseClient } from "./supabase/client";

/**
 * Capa para gestionar Web Push (notificaciones aunque la app esté cerrada).
 *
 * Flujo:
 *  - subscribeToPush(): pide al navegador una PushSubscription para nuestro
 *    VAPID public key, y guarda la suscripción en Supabase.
 *  - unsubscribeFromPush(): cancela en el navegador y borra de Supabase.
 *  - getPushStatus(): consulta el estado actual.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    !!VAPID_PUBLIC_KEY
  );
}

export type PushStatus = "unsupported" | "subscribed" | "unsubscribed";

export async function getPushStatus(): Promise<PushStatus> {
  if (!isPushSupported()) return "unsupported";
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return "unsupported";
  const sub = await reg.pushManager.getSubscription();
  return sub ? "subscribed" : "unsubscribed";
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

function subscriptionToFields(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint!,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
  };
}

export async function subscribeToPush(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isPushSupported())
    return { ok: false, error: "Tu navegador no soporta Web Push." };

  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase no configurado." };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          .buffer as ArrayBuffer,
      });
    }
    const fields = subscriptionToFields(sub);

    // Obtenemos el user actual para llenar user_id.
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) {
      return { ok: false, error: "Sesión no válida." };
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint: fields.endpoint,
          p256dh: fields.p256dh,
          auth: fields.auth,
          user_agent:
            typeof navigator !== "undefined"
              ? navigator.userAgent.slice(0, 200)
              : null,
        },
        { onConflict: "endpoint" },
      );

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean }> {
  if (!isPushSupported()) return { ok: true };
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return { ok: true };
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return { ok: true };
  const endpoint = sub.endpoint;
  try {
    await sub.unsubscribe();
  } catch {
    /* sigue */
  }
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);
  }
  return { ok: true };
}
