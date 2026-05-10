"use client";

import { Avatar } from "@/components/primitives/Avatar";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export function Message({ m }: { m: ChatMessage }) {
  const { user } = useAuth();
  const mine = m.who === "You" || (user && m.who === user.name);
  const displayName = mine ? user?.name ?? "Tú" : m.who;
  const avatarValue = mine ? user?.avatar : undefined;
  const isAlert = m.alert;

  return (
    <div
      className={cn(
        "flex gap-2.5 items-start",
        mine ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar name={displayName} avatar={avatarValue} size="sm" />
      <div className="max-w-[240px]">
        <div
          className={cn(
            "flex gap-2 items-baseline mb-1",
            mine ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="font-semibold text-xs">{displayName}</span>
          <span className="font-mono text-[10px] text-muted tracking-[0.08em]">
            {m.time}
          </span>
        </div>
        <div
          className={cn(
            "px-3.5 py-2.5 text-[13px] leading-snug rounded-[14px]",
          )}
          style={{
            background: isAlert
              ? "linear-gradient(135deg, #C8D7F7 0%, #7BA0F0 100%)"
              : mine
                ? "var(--cobalt)"
                : "var(--paper-2)",
            color: isAlert
              ? "rgb(15, 30, 90)"
              : mine
                ? "white"
                : "var(--ink)",
            border: mine || isAlert ? "0" : "1px solid var(--hairline-2)",
            borderTopRightRadius: mine ? 4 : 14,
            borderTopLeftRadius: mine ? 14 : 4,
            boxShadow: isAlert ? "0 6px 18px rgba(27,61,255,0.20)" : undefined,
            fontWeight: isAlert ? 500 : 400,
          }}
        >
          {m.text}
        </div>
        {m.reacts && m.reacts.length > 0 && (
          <div
            className={cn(
              "flex gap-1.5 mt-1.5",
              mine ? "justify-end" : "justify-start",
            )}
          >
            {m.reacts.map((r, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full border border-hairline-2"
                style={{ background: "var(--paper-2)" }}
              >
                {r.e} {r.n}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
