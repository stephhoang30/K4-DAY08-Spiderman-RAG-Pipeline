"use client";

import { Check, Copy, User } from "lucide-react";
import { useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { LogoMark } from "@/components/Logo";
import { Markdown } from "./Markdown";
import { PipelineTrace } from "./PipelineTrace";
import { SourcesPanel } from "./SourcesPanel";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // clipboard bị chặn — bỏ qua
        }
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-fg-subtle transition hover:bg-surface-3 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label="Sao chép câu trả lời"
    >
      {copied ? (
        <Check className="size-3.5 text-ok" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Đã chép" : "Sao chép"}
    </button>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Đang soạn">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-fg-subtle"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
        />
      ))}
    </span>
  );
}

export function MessageItem({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex animate-fade-up justify-end gap-3">
        <div className="max-w-[min(42rem,85%)] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-[14.5px] leading-relaxed text-accent-fg shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span
          aria-hidden
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface text-fg-subtle"
        >
          <User className="size-4" />
        </span>
      </div>
    );
  }

  const hasSteps = (message.steps?.length ?? 0) > 0;
  const showTyping = message.streaming && !message.content;

  return (
    <div className="flex animate-fade-up gap-3">
      <span
        aria-hidden
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface"
      >
        <LogoMark className="size-[18px]" />
      </span>

      <div className="min-w-0 flex-1 space-y-2.5">
        {hasSteps ? (
          <PipelineTrace
            steps={message.steps ?? []}
            totalMs={message.totalMs ?? 0}
            streaming={message.streaming}
            revealedSteps={message.revealedSteps}
            usedFallback={message.usedFallback}
            source={message.source}
          />
        ) : null}

        {showTyping ? (
          <div className="space-y-1.5">
            <TypingDots />
            {message.loadingNote ? (
              <p className="text-[11.5px] leading-relaxed text-fg-subtle">
                {message.loadingNote}
              </p>
            ) : null}
          </div>
        ) : message.content ? (
          <div
            className={cn(
              "rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 shadow-[0_1px_2px_rgba(15,26,38,0.04)]",
            )}
          >
            <Markdown content={message.content} />
            {message.streaming ? (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-accent align-text-bottom"
              />
            ) : null}
          </div>
        ) : null}

        {!message.streaming && message.sources?.length ? (
          <SourcesPanel sources={message.sources} />
        ) : null}

        {!message.streaming && message.content ? (
          <div className="flex flex-wrap items-center gap-1 pl-0.5">
            <CopyButton text={message.content} />
            {message.usedFallback ? (
              <span className="rounded-md border border-warn/30 bg-warn-soft px-1.5 py-0.5 text-[10px] font-medium text-warn">
                Trả lời qua PageIndex Vectorless
              </span>
            ) : null}
            {/* Nói rõ khi câu trả lời là mock, kèm lý do — người xem không được
                phép nhầm câu trả lời demo thành câu trả lời do backend sinh ra. */}
            {message.source === "mock" ? (
              <span className="text-[10.5px] text-fg-subtle">
                Câu trả lời demo
                {message.sourceError ? ` · ${message.sourceError}` : null}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
