export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const PALETTE: Record<string, string> = {
  "María González": "#FFD8E5",
  "Carlos Ruiz": "#D8E2FF",
  "Ana Torres": "#E5E0CF",
  "Diego Salazar": "#CFE2D9",
  You: "#1B3DFF",
};

export function avatarColor(name: string) {
  return PALETTE[name] ?? "var(--bg-2)";
}
