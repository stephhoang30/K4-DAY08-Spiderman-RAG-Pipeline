"use client";

import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PIPELINE_CONFIG } from "@/lib/mock";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

export function Composer({
  onSend,
  onStop,
  busy = false,
  autoFocus = false,
}: {
  onSend: (text: string) => void;
  onStop?: () => void;
  busy?: boolean;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  function submit() {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => ref.current?.focus());
  }

  return (
    <div className="border-t border-border bg-bg/85 px-3 pb-3 pt-2.5 backdrop-blur sm:px-5">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-[0_1px_3px_rgba(15,26,38,0.06)] transition focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-ring/25",
          )}
        >
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Hỏi về chính sách Shopee — đổi trả, thanh toán, vận chuyển, quy định người bán…"
            aria-label="Nội dung câu hỏi"
            className="max-h-[200px] min-h-[2.25rem] flex-1 resize-none scrollbar-slim bg-transparent px-2 py-1.5 text-[14.5px] leading-relaxed text-fg outline-none placeholder:text-fg-subtle"
          />

          {busy && onStop ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Dừng tạo câu trả lời"
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-2 text-fg-muted transition hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Square className="size-3.5 fill-current" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              aria-label="Gửi câu hỏi"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
          )}
        </div>

        <p className="mt-1.5 text-center text-[11px] text-fg-subtle">
          <kbd className="rounded border border-border bg-surface-2 px-1 font-mono">
            Enter
          </kbd>{" "}
          để gửi ·{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1 font-mono">
            Shift + Enter
          </kbd>{" "}
          xuống dòng · Dữ liệu demo, không gọi API thật ·{" "}
          <span className="font-mono">
            {PIPELINE_CONFIG.embeddingModel} + BM25 + RRF
          </span>
        </p>
      </div>
    </div>
  );
}
