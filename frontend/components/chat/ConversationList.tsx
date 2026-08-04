"use client";

import { MessageSquare, Pin, Plus } from "lucide-react";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "2026-08-04T09:42:00+07:00" -> "04/08" (thuần chuỗi, tránh lệch hydrate). */
function dayLabel(iso: string): string {
  if (!iso || iso.length < 10) return "";
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2.5 pb-2 pt-1">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-[13px] font-semibold text-accent transition hover:bg-accent hover:text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden />
          Cuộc trò chuyện mới
        </button>
      </div>

      <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
        Lịch sử
      </p>

      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto scrollbar-slim px-2.5 pb-2">
        {conversations.map((conv) => {
          const active = conv.id === activeId;
          const preview =
            conv.messages.find((m) => m.role === "user")?.content ??
            "Chưa có tin nhắn";
          return (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() => onSelect(conv.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "bg-surface-3 text-fg"
                    : "text-fg-muted hover:bg-surface-3/70 hover:text-fg",
                )}
              >
                <MessageSquare
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    active ? "text-accent" : "text-fg-subtle",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1">
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[13px]",
                        active && "font-semibold",
                      )}
                    >
                      {conv.title}
                    </span>
                    {conv.pinned ? (
                      <Pin
                        className="size-3 shrink-0 text-fg-subtle"
                        aria-label="Đã ghim"
                      />
                    ) : null}
                    <span className="shrink-0 font-mono text-[10px] text-fg-subtle">
                      {dayLabel(conv.updatedAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-fg-subtle">
                    {preview}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
