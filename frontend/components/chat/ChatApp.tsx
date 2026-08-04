"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { ChatMessage, Conversation, DataSource } from "@/lib/types";
import {
  MOCK_CONVERSATIONS,
  createPendingAssistantMessage,
  createUserMessage,
} from "@/lib/mock";
import { checkBackend, runChat, type ChatResult, type Loaded } from "@/lib/data";
import { API_BASE_URL } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import {
  BackendOfflineBanner,
  DataSourceBadge,
} from "@/components/ui/DataSource";
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

  /** Tình trạng backend, dùng cho nhãn ở header và banner ở màn hình chào. */
  const [health, setHealth] = useState<{
    source: DataSource;
    error?: string;
    chunks?: number;
    liveStages?: string;
  } | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Câu trả lời đang stream dở — giữ để nút Dừng nhảy thẳng tới kết quả cuối. */
  const inflight = useRef<{
    convId: string;
    msgId: string;
    result: Loaded<ChatResult>;
  } | null>(null);
  /** Tăng mỗi lần gửi, để response tới muộn của lượt cũ không ghi đè lượt mới. */
  const requestSeq = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Hỏi backend một lần lúc mở trang để biết gắn nhãn nào.
  useEffect(() => {
    let alive = true;
    checkBackend().then((res) => {
      if (!alive) return;
      setHealth({
        source: res.source,
        error: res.error,
        chunks: res.data?.chunks_indexed,
        liveStages: res.data
          ? `${res.data.live_count}/${res.data.total_count} tầng live`
          : undefined,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

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

  /** Bỏ qua phần streaming còn lại, hiện ngay kết quả đầy đủ. */
  const finish = useCallback(() => {
    const job = inflight.current;
    clearTimers();
    if (!job) {
      setBusy(false);
      return;
    }
    const { data, source, error } = job.result;
    patchMessage(job.convId, job.msgId, {
      content: data.answer,
      sources: data.sources,
      steps: data.steps,
      totalMs: data.totalMs,
      usedFallback: data.usedFallback,
      source,
      sourceError: error,
      loadingNote: undefined,
      revealedSteps: undefined,
      streaming: false,
    });
    inflight.current = null;
    setBusy(false);
  }, [clearTimers, patchMessage]);

  const send = useCallback(
    (text: string) => {
      if (busy) return;
      const convId = activeId;
      const userMsg = createUserMessage(text);
      const assistantMsg: ChatMessage = {
        ...createPendingAssistantMessage(),
        loadingNote:
          "Đang gọi POST /api/chat — lần gọi đầu sau khi backend khởi động có thể mất 20–30 giây vì phải nạp model BAAI/bge-m3.",
      };

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
      clearTimers();
      const seq = (requestSeq.current += 1);

      // Toàn bộ quyết định live/mock nằm trong runChat() — ở đây chỉ hiển thị.
      runChat(text).then((result) => {
        if (seq !== requestSeq.current) return; // lượt này đã bị thay thế
        inflight.current = { convId, msgId: assistantMsg.id, result };

        const { data, source, error } = result;

        // 1) Lộ dần từng bước pipeline. Số liệu đã có sẵn, stagger chỉ để đọc kịp.
        patchMessage(convId, assistantMsg.id, {
          steps: data.steps,
          totalMs: data.totalMs,
          usedFallback: data.usedFallback,
          source,
          sourceError: error,
          revealedSteps: 1,
          loadingNote: undefined,
        });

        const stepTick = 140;
        data.steps.forEach((_, i) => {
          if (i === 0) return;
          timers.current.push(
            setTimeout(
              () => patchMessage(convId, assistantMsg.id, { revealedSteps: i + 1 }),
              stepTick * i,
            ),
          );
        });

        // 2) Rồi stream dần câu trả lời
        const streamStart = stepTick * data.steps.length + 120;
        const pieces = splitIntoPieces(data.answer, 48);
        const tick = Math.max(12, Math.round(1200 / pieces.length));

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
          setTimeout(() => finish(), streamStart + tick * (pieces.length + 1) + 120),
        );
      });
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
  const offline = health !== null && health.source === "mock";

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
          {/* Nhãn này nói về BACKEND, không nói về hội thoại đang mở — mỗi câu
              trả lời có nhãn nguồn riêng ngay trên khối trace của nó. */}
          <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-2 px-2 py-1 text-[11px] text-fg-muted">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            Hybrid RAG · backend
            {health ? (
              <DataSourceBadge
                source={health.source}
                title={
                  health.source === "live"
                    ? `Backend đang chạy tại ${API_BASE_URL} · ${health.liveStages ?? ""}`
                    : health.error
                }
              />
            ) : (
              <span className="text-fg-subtle">đang kiểm tra…</span>
            )}
          </span>
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto scrollbar-slim"
        >
          {isEmpty ? (
            <>
              {offline ? (
                <div className="mx-auto w-full max-w-3xl px-4 pt-4">
                  <BackendOfflineBanner error={health?.error} />
                </div>
              ) : null}
              <Welcome onPick={send} chunkCount={health?.chunks} />
            </>
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
