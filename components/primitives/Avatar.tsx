import { getPreset, isUploadedAvatar } from "@/lib/avatars";
import { avatarColor, cn, initialsFromName } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  avatar?: string;
  color?: string;
}

const SIZE_CLASS = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-[10px]",
  lg: "w-10 h-10 text-xs",
  xl: "w-20 h-20 text-lg",
};

export function Avatar({ name, size = "md", avatar, color }: AvatarProps) {
  const initials = initialsFromName(name || "??");

  if (avatar && isUploadedAvatar(avatar)) {
    return (
      <span
        role="img"
        aria-label={name}
        className={cn(
          "inline-block rounded-full border border-hairline shrink-0 overflow-hidden bg-cover bg-center",
          SIZE_CLASS[size],
        )}
        style={{ backgroundImage: `url(${avatar})` }}
      />
    );
  }

  const preset = avatar ? getPreset(avatar) : null;
  const bg = preset?.bg ?? color ?? avatarColor(name);
  const ink = preset?.ink ?? (name === "You" ? "white" : "var(--ink)");

  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full border border-hairline shrink-0 font-mono font-medium",
        SIZE_CLASS[size],
      )}
      style={{ background: bg, color: ink }}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
