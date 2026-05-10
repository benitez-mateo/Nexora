export interface AvatarPreset {
  id: string;
  label: string;
  bg: string;
  ink: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "coral", label: "Coral", bg: "linear-gradient(135deg, #FFB8A8, #FF7A6B)", ink: "#3A1410" },
  { id: "ocean", label: "Océano", bg: "linear-gradient(135deg, #A8C5FF, #5575E5)", ink: "#0A1A4A" },
  { id: "forest", label: "Bosque", bg: "linear-gradient(135deg, #B8E5C2, #4FA666)", ink: "#0D2D17" },
  { id: "sunset", label: "Atardecer", bg: "linear-gradient(135deg, #FFD9A8, #FF9466)", ink: "#3A1A05" },
  { id: "lavender", label: "Lavanda", bg: "linear-gradient(135deg, #D9C8FF, #8E74E5)", ink: "#1F0F45" },
  { id: "mint", label: "Menta", bg: "linear-gradient(135deg, #B8F0E5, #4FB3A6)", ink: "#0A2D28" },
  { id: "rose", label: "Rosa", bg: "linear-gradient(135deg, #FFC8DC, #FF7BAE)", ink: "#3A0D22" },
  { id: "graphite", label: "Grafito", bg: "linear-gradient(135deg, #C8CCD0, #5C6168)", ink: "#0D0F12" },
];

export const DEFAULT_AVATAR = `preset:${AVATAR_PRESETS[0].id}`;

export function isUploadedAvatar(value: string): boolean {
  return value.startsWith("data:image/");
}

export function isPresetAvatar(value: string): boolean {
  return value.startsWith("preset:");
}

export function getPreset(value: string): AvatarPreset | null {
  if (!isPresetAvatar(value)) return null;
  const id = value.slice(7);
  return AVATAR_PRESETS.find((p) => p.id === id) ?? null;
}

export async function resizeImageFile(
  file: File,
  maxSize = 256,
  quality = 0.85,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas no disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = dataUrl;
  });
}
