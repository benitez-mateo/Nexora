"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve `true` cuando el navegador reporta conexión, `false` cuando no.
 *
 * Empieza optimista en `true` para evitar parpadeos durante la hidratación.
 * Después escucha los eventos `online` / `offline` del navegador.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
