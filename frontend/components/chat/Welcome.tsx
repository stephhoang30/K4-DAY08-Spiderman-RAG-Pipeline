"use client";

import { ArrowUpRight, Database, Layers, ShieldAlert } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { PIPELINE_CONFIG, SUGGESTED_QUESTIONS, TOTAL_CHUNKS } from "@/lib/mock";

/**
 * @param chunkCount Số chunk backend báo qua `/api/health`. Không có (backend
 *   tắt) thì dùng số của bộ mock.
 */
function highlights(chunkCount?: number) {
  return [
    {
      icon: Database,
      label: "13 tài liệu",
      value: `${chunkCount ?? TOTAL_CHUNKS} chunk · ${PIPELINE_CONFIG.chunkSize}/${PIPELINE_CONFIG.chunkOverlap}`,
    },
    {
      icon: Layers,
      label: "Hybrid retrieval",
      value: `bge-m3 + BM25 → RRF k=${PIPELINE_CONFIG.rrfK}`,
    },
    {
      icon: ShieldAlert,
      label: "Fallback",
      value: `PageIndex khi cosine < ${PIPELINE_CONFIG.fallbackThreshold}`,
    },
  ];
}

export function Welcome({
  onPick,
  chunkCount,
}: {
  onPick: (q: string) => void;
  chunkCount?: number;
}) {
  const HIGHLIGHTS = highlights(chunkCount);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10 sm:py-16">
      <LogoMark className="size-14 sm:size-16" />

      <h1 className="mt-5 text-center text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        Trợ lý chính sách Shopee Việt Nam
      </h1>
      <p className="mt-2 max-w-xl text-center text-sm leading-relaxed text-fg-muted">
        Hỏi về đổi trả/hoàn tiền, thanh toán, vận chuyển, bảo mật hay quy định người
        bán. Mỗi câu trả lời đều kèm trích dẫn và diễn giải đủ 6 bước của retrieval
        pipeline.
      </p>

      <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </div>
              <p className="mt-1 font-mono text-[11px] text-fg-muted">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 w-full">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
          Câu hỏi gợi ý
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => onPick(question)}
                className="group flex w-full items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-[13.5px] leading-snug text-fg-muted transition hover:border-accent/40 hover:bg-accent-soft hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="min-w-0 flex-1">{question}</span>
                <ArrowUpRight
                  className="mt-0.5 size-3.5 shrink-0 text-fg-subtle transition group-hover:text-accent"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-[11px] text-fg-subtle">
          Thử một câu lạc đề hẳn (ví dụ &ldquo;Cách nấu phở bò ngon tại nhà?&rdquo;)
          để xem nhánh PageIndex fallback được kích hoạt — rồi thử tiếp
          &ldquo;Shopee có chính sách đổi trả vé máy bay và tour du lịch
          không?&rdquo; để thấy một câu nghe cũng lạc đề nhưng cosine vẫn vượt
          ngưỡng.
        </p>
      </div>
    </div>
  );
}
