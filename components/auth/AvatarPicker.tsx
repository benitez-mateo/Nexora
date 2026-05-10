"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/primitives/Avatar";
import {
  AVATAR_PRESETS,
  isPresetAvatar,
  isUploadedAvatar,
  resizeImageFile,
} from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function AvatarPicker({ value, onChange, name }: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeImageFile(file, 256, 0.85);
      onChange(dataUrl);
    } catch {
      setError("No se pudo procesar la imagen.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = () => {
    onChange(`preset:${AVATAR_PRESETS[0].id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar name={name || "?"} avatar={value} size="xl" />
        <div className="flex-1">
          <div className="micro mb-1">Vista previa</div>
          <div className="font-serif text-base">
            {name || "Tu avatar aparecerá aquí"}
          </div>
          {isUploadedAvatar(value) && (
            <button
              type="button"
              onClick={removePhoto}
              className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-pink hover:underline mt-1"
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="micro mb-2">Colores</div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_PRESETS.map((p) => {
            const presetValue = `preset:${p.id}`;
            const selected = value === presetValue;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(presetValue)}
                title={p.label}
                aria-label={`Avatar ${p.label}`}
                className={cn(
                  "w-10 h-10 rounded-full transition-transform hover:scale-110",
                  selected ? "ring-2 ring-offset-2 ring-cobalt" : "",
                )}
                style={{
                  background: p.bg,
                  // @ts-expect-error css var
                  "--tw-ring-offset-color": "var(--paper)",
                }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <div className="micro mb-2">O sube tu propia foto</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-ghost disabled:opacity-50"
        >
          {busy
            ? "Procesando..."
            : isUploadedAvatar(value)
              ? "Cambiar foto"
              : "Subir foto"}
        </button>
        {error && (
          <p className="text-xs text-pink mt-2" role="alert">
            {error}
          </p>
        )}
        <p className="text-[11px] text-muted mt-2">
          La imagen se redimensiona a 256×256 y se guarda localmente.
        </p>
      </div>
    </div>
  );
}
