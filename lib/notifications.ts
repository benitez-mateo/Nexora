"use client";

/**
 * Capa fina sobre la Notifications API + Service Worker para mostrar
 * notificaciones tipo WhatsApp cuando la app está en background.
 *
 * Funciona si:
 * - El navegador soporta Notifications API.
 * - El usuario otorgó permiso.
 * - La pestaña está oculta (background, minimizada, en otra app).
 *
 * No funciona si la app está totalmente cerrada (eso requiere Web Push real
 * con VAPID + servidor de push, lo dejamos para fase 2).
 */

export type Permission = "default" | "granted" | "denied" | "unsupported";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): Permission {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission as Permission;
}

export async function requestNotificationPermission(): Promise<Permission> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result as Permission;
  } catch {
    return "denied";
  }
}

interface NotifyOptions {
  body?: string;
  icon?: string;
  tag?: string;
  /** Si true, sólo notifica cuando la pestaña está oculta. Default: true. */
  onlyIfHidden?: boolean;
  /** URL a abrir cuando se hace click. */
  url?: string;
}

/**
 * Muestra una notificación. Si hay un service worker activo, la dispara
 * desde ahí (mejor soporte en móvil PWA); si no, usa `new Notification`.
 */
export async function notify(title: string, options: NotifyOptions = {}) {
  if (!notificationsSupported()) return;
  if (Notification.permission !== "granted") return;

  const {
    body,
    icon = "/icon",
    tag,
    onlyIfHidden = true,
    url,
  } = options;

  // Si la pestaña está visible y el usuario está activo, no molestamos.
  if (
    onlyIfHidden &&
    typeof document !== "undefined" &&
    document.visibilityState === "visible"
  ) {
    return;
  }

  // Path preferido: service worker (más confiable, sobre todo en PWA móvil).
  if (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator
  ) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          tag,
          data: url ? { url } : undefined,
        });
        return;
      }
    } catch {
      /* cae al fallback */
    }
  }

  // Fallback: notificación directa desde la página.
  try {
    const n = new Notification(title, {
      body,
      icon,
      tag,
    });
    if (url) {
      n.onclick = () => {
        window.focus();
        window.location.href = url;
        n.close();
      };
    }
  } catch {
    /* ignorar */
  }
}
