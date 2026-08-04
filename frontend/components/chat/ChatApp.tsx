"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ChatMessage, Conversation, MockAnswer } from "@/lib/types";
import {
  MOCK_CONVERSATIONS,
  buildDefaultAnswer,
  createPendingAssistantMessage,
  createUserMessage,
  matchAnswer,
} from "@/lib/mock";
import { AppShell } from "@/components/AppShell";
import { ConversationList } from "./ConversationList";
import { MessageItem } from "./MessageItem";
import { Composer } from "./Composer";
import { Welcome } from "./Welcome";
import { truncate } from "@/lib/utils";

/** Hội thoại nháp lúc mở app — id cố định để không lệch giữa server và client. */
const DRAFT: Conversation = {
  id: "conv_draft",
  title: "Cuộc trò chuyện mới",
  updatedAt: "",
  messages: [],
};

/** Nhịp hiển thị mỗi bước: giữ đúng thứ tự thật nhưng đủ chậm để nhìn thấy. */
function pace(durationMs: number): number {
  return Math.min(900, Math.max(240, durationMs));
}

/** Cắt câu trả lời thành ~N mảnh theo ranh giới khoảng trắng để giả lập streaming. */
function splitIntoPieces(text: string, count: number): string[] {
  const tokens = text.split(/(\s+)/);
  const per = Math.max(1, Math.ceil(tokens.length / count));
  const pieces: string[] = [];
  for (let i = 0; i < tokens.length; i += per) {
    pieces.push(tokens.slice(i, i + per).join(""));
  }
  return pieces.length > 0 ? pieces : [text];
}

let draftCounter = 0;

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    DRAFT,
    ...MOCK_CONVERSATIONS,
  ]);
  const [activeId, setActiveId] = useState<string>(DRAFT.id);
  const [busy, setBusy] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const inflight = useRef<{
    convId: string;
    msgId: string;
    answer: MockAnswer;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const patchMessage = useCallback(
    (convId: string, msgId: string, patch: Partial<ChatMessage>) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id !== convId
            ? conv
            : {
                ...conv,
                messages: conv.messages.map((m) =>
                  m.id === msgId ? { ...m, ...patch } : m,
                ),
              },
        ),
      );
    },
    [],
  );

  // Tự cuộn xuống đáy khi có nội dung mới
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active?.messages]);

  const finish = useCallback(() => {
    const job = inflight.current;
    if (!job) return;
    clearTimers();
    patchMessage(job.convId, job.msgId, {
      content: job.answer.answer,
      sources: job.answer.sources,
      steps: job.answer.steps,
      totalMs: job.answer.totalMs,
      usedFallback: job.answer.usedFallback,
      revealedSteps: undefined,
      streaming: false,
    });
    inflight.current = null;
    setBusy(false);
  }, [clearTimers, patchMessage]);

  const send = useCallback(
    (text: string) => {
      if (busy) return;
      const answer = matchAnswer(text) ?? buildDefaultAnswer(text);
      const userMsg = createUserMessage(text);
      const assistantMsg: ChatMessage = {
        ...createPendingAssistantMessage(),
        steps: answer.steps,
        totalMs: answer.totalMs,
        usedFallback: answer.usedFallback,
        revealedSteps: 1,
      };
      const convId = activeId;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id !== convId
            ? conv
            : {
                ...conv,
                title:
                  conv.messages.length === 0 ? truncate(text, 44) : conv.title,
                updatedAt: new Date().toISOString(),
                messages: [...conv.messages, userMsg, assistantMsg],
              },
        ),
      );

      setBusy(true);
      inflight.current = { convId, msgId: assistantMsg.id, answer };
      clearTimers();

      // 1) Lộ dần từng bước pipeline
      let elapsed = 0;
      answer.steps.forEach((step, i) => {
        if (i === 0) return;
        elapsed += pace(answer.steps[i - 1].durationMs);
        const at = elapsed;
        timers.current.push(
          setTimeout(
            () => patchMessage(convId, assistantMsg.id, { revealedSteps: i + 1 }),
            at,
          ),
        );
      });

      // 2) Sau bước cuối (Generation) thì stream dần câu trả lời
      const genDuration = answer.steps[answer.steps.length - 1]?.durationMs ?? 900;
      const streamWindow = Math.min(2000, Math.max(900, genDuration));
      const pieces = splitIntoPieces(answer.answer, 48);
      const tick = Math.max(16, Math.round(streamWindow / pieces.length));
      const streamStart = elapsed + 160;

      pieces.forEach((_, idx) => {
        timers.current.push(
          setTimeout(
            () =>
              patchMessage(convId, assistantMsg.id, {
                content: pieces.slice(0, idx + 1).join(""),
              }),
            streamStart + tick * (idx + 1),
          ),
        );
      });

      timers.current.push(
        setTimeout(
          () => finish(),
          streamStart + tick * (pieces.length + 1) + 120,
        ),
      );
    },
    [activeId, busy, clearTimers, finish, patchMessage],
  );

  const newConversation = useCallback(() => {
    finish();
    const existingDraft = conversations.find((c) => c.messages.length === 0);
    if (existingDraft) {
      setActiveId(existingDraft.id);
      return;
    }
    draftCounter += 1;
    const fresh: Conversation = {
      id: `conv_new_${draftCounter}`,
      title: "Cuộc trò chuyện mới",
      updatedAt: "",
      messages: [],
    };
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
  }, [conversations, finish]);

  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <AppShell
      fullHeight
      sidebarSlot={
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={newConversation}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Header vùng chat (desktop) */}
        <header className="hidden items-center justify-between gap-3 border-b border-border bg-surface px-5 py-2.5 lg:flex">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-fg">
              {active?.title ?? "Cuộc trò chuyện mới"}
            </h1>
            <p className="text-[11px] text-fg-subtle">
              {isEmpty
                ? "Chưa có tin nhắn"
                : `${messages.filter((m) => m.role === "user").length} câu hỏi · ${
                    messages.filter((m) => m.role === "assistant").length
                  } câu trả lời`}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1 text-[11px] text-fg-muted">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            Hybrid RAG · dữ liệu mock
          </span>
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto scrollbar-slim"
        >
          {isEmpty ? (
            <Welcome onPick={send} />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-5">
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>

        <Composer onSend={send} onStop={finish} busy={busy} autoFocus />
      </div>
    </AppShell>
  );
}
