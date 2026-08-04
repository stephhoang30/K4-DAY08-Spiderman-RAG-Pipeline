"use client";

import { ChevronRight, CircleAlert, FileText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ChunkExcerpt, ChunkLabel } from "@/components/ui/ChunkLabel";
import { Markdown } from "@/components/chat/Markdown";
import {
  GOLDEN_CASES,
  GOLDEN_PASSED,
  GOLDEN_TOTAL,
  METRIC_IDS,
  METRIC_META,
  PIPELINE_CONFIG,
  RAGAS_THRESHOLD,
} from "@/lib/mock";
import type { GoldenCase } from "@/lib/types";
import { cn, formatScore } from "@/lib/utils";
import { DocChip, MetricValue, PassBadge } from "./common";

type FilterId = "all" | "passed" | "failed";

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "passed", label: "Đạt" },
  { id: "failed", label: "Không đạt" },
];

const COLUMN_COUNT = 9;

function missingChunks(row: GoldenCase): string[] {
  return row.expectedChunkIds.filter(
    (id) => !row.retrievedChunkIds.includes(id),
  );
}

// ---------------------------------------------------------------------------

function CaseDetail({ row }: { row: GoldenCase }) {
  const missing = missingChunks(row);

  return (
    <div className="space-y-3 border-l-2 border-accent/40 bg-surface-2 px-4 py-4">
      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        {/* Câu trả lời sinh ra */}
        <div className="rounded-lg border border-border bg-surface px-3.5 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
            <Sparkles className="size-3.5" aria-hidden />
            Câu trả lời sinh ra
          </p>
          <Markdown content={row.generatedAnswer} />
        </div>

        {/* Chunk đưa vào prompt */}
        <div className="space-y-2">
          <div className="rounded-lg border border-border bg-surface px-3.5 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
              <FileText className="size-3.5" aria-hidden />
              Chunk đưa vào prompt ({row.retrievedChunkIds.length})
            </p>
            <ol className="space-y-1.5">
              {row.retrievedChunkIds.map((chunkId, i) => {
                const isAnswerChunk = row.expectedChunkIds.includes(chunkId);
                return (
                  <li
                    key={chunkId}
                    className={cn(
                      "flex gap-2 rounded-lg border px-2.5 py-2",
                      isAnswerChunk
                        ? "border-ok/30 bg-ok-soft"
                        : "border-border bg-surface-2",
                    )}
                  >
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-3 font-mono text-[10px] font-semibold text-fg-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <ChunkLabel chunkId={chunkId} />
                        {isAnswerChunk ? (
                          <Badge tone="ok" className="shrink-0">
                            chunk đáp án
                          </Badge>
                        ) : null}
                      </div>
                      <ChunkExcerpt chunkId={chunkId} max={130} className="mt-1" />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {missing.length > 0 ? (
            <div className="rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-danger">
                <CircleAlert className="size-3.5" aria-hidden />
                Thiếu chunk chứa đáp án
              </p>
              <ul className="mt-2 space-y-1.5">
                {missing.map((chunkId) => (
                  <li key={chunkId} className="min-w-0">
                    <ChunkLabel chunkId={chunkId} />
                    <ChunkExcerpt chunkId={chunkId} max={130} className="mt-1" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {/* Thông số của lần chạy */}
      <dl className="flex flex-wrap gap-x-5 gap-y-1.5 rounded-lg bg-surface-3 px-3 py-2">
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[11px] text-fg-subtle">cosine top-1</dt>
          <dd
            className={cn(
              "font-mono text-[11px] font-semibold tabular-nums",
              row.topCosine < PIPELINE_CONFIG.fallbackThreshold
                ? "text-warn"
                : "text-fg",
            )}
          >
            {formatScore(row.topCosine)}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[11px] text-fg-subtle">ngưỡng fallback</dt>
          <dd className="font-mono text-[11px] font-medium tabular-nums text-fg">
            {PIPELINE_CONFIG.fallbackThreshold.toFixed(2)}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[11px] text-fg-subtle">PageIndex</dt>
          <dd className="text-[11px] font-medium text-fg">
            {row.usedFallback ? "đã kích hoạt" : "không kích hoạt"}
          </dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="text-[11px] text-fg-subtle">chủ đề</dt>
          <dd className="text-[11px] font-medium text-fg">{row.category}</dd>
        </div>
      </dl>

      <p className="text-[11px] leading-relaxed text-fg-muted">
        <span className="font-semibold text-fg-subtle">Ghi chú người chấm: </span>
        {row.note}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function GoldenDataset() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [openId, setOpenId] = useState<string | null>(GOLDEN_CASES[0]?.id ?? null);

  const counts = useMemo(
    () => ({
      all: GOLDEN_TOTAL,
      passed: GOLDEN_PASSED,
      failed: GOLDEN_TOTAL - GOLDEN_PASSED,
    }),
    [],
  );

  const rows = useMemo(
    () =>
      GOLDEN_CASES.filter((row) =>
        filter === "all" ? true : filter === "passed" ? row.passed : !row.passed,
      ),
    [filter],
  );

  return (
    <Card>
      <CardHeader
        title={`Golden dataset — ${GOLDEN_TOTAL} cặp Q&A`}
        description="Bấm vào một dòng để xem câu trả lời sinh ra và các chunk đã dùng."
        action={
          <div className="inline-flex shrink-0 rounded-lg border border-border bg-surface-2 p-0.5">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}{" "}
                  <span className="font-mono tabular-nums">
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </div>
        }
      />

      <div className="overflow-x-auto scrollbar-slim">
        <table className="w-full min-w-[64rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-fg-subtle">
              <th className="w-14 px-4 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Câu hỏi</th>
              <th className="px-3 py-2 font-medium">Tài liệu kỳ vọng</th>
              <th className="px-3 py-2 font-medium">Tài liệu truy xuất</th>
              {METRIC_IDS.map((id) => (
                <th
                  key={id}
                  title={METRIC_META[id].label}
                  className="px-1.5 py-2 text-right font-medium"
                >
                  {METRIC_META[id].short}
                </th>
              ))}
              <th className="px-4 py-2 text-right font-medium">Trạng thái</th>
            </tr>
          </thead>

          {rows.map((row) => {
            const open = openId === row.id;
            const missing = missingChunks(row);
            return (
              <tbody key={row.id} className="border-b border-border/60 last:border-0">
                <tr
                  onClick={() => setOpenId(open ? null : row.id)}
                  className={cn(
                    "cursor-pointer align-top transition",
                    open ? "bg-surface-2" : "hover:bg-surface-2/70",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(open ? null : row.id);
                      }}
                      className="flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <ChevronRight
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 text-fg-subtle transition-transform duration-200",
                          open && "rotate-90",
                        )}
                      />
                      <span className="font-mono text-[11px] font-semibold text-fg-muted">
                        {row.id}
                      </span>
                      <span className="sr-only">
                        {open ? "Thu gọn" : "Mở rộng"} chi tiết {row.question}
                      </span>
                    </button>
                  </td>

                  <td className="max-w-[18rem] px-3 py-2.5">
                    <p className="text-xs font-medium leading-relaxed text-fg">
                      {row.question}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-fg-subtle">
                        {row.category}
                      </span>
                      {row.usedFallback ? (
                        <Badge tone="warn">PageIndex</Badge>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex flex-col items-start gap-1">
                      {row.expectedDocIds.map((docId) => (
                        <DocChip key={docId} docId={docId} />
                      ))}
                      <span className="font-mono text-[10px] text-fg-subtle">
                        {row.expectedChunkIds.join(", ")}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex flex-col items-start gap-1">
                      {row.retrievedDocIds.map((docId) => (
                        <DocChip key={docId} docId={docId} />
                      ))}
                      <span
                        className={cn(
                          "font-mono text-[10px]",
                          missing.length > 0 ? "text-danger" : "text-fg-subtle",
                        )}
                      >
                        {missing.length > 0
                          ? `thiếu ${missing.join(", ")}`
                          : "có chunk đáp án"}
                      </span>
                    </div>
                  </td>

                  {METRIC_IDS.map((id) => (
                    <td key={id} className="px-1.5 py-2.5 text-right">
                      <MetricValue
                        value={row.scores[id]}
                        threshold={RAGAS_THRESHOLD}
                      />
                    </td>
                  ))}

                  <td className="px-4 py-2.5 text-right">
                    <PassBadge passed={row.passed} />
                  </td>
                </tr>

                {open ? (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="p-0">
                      <div className="animate-fade-in">
                        <CaseDetail row={row} />
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-fg-muted">
          Không có câu hỏi nào khớp bộ lọc.
        </p>
      ) : null}
    </Card>
  );
}
