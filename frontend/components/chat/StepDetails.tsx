"use client";

import { ArrowRight, Check, CornerDownRight, Minus, X } from "lucide-react";
import type { StepDetail } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar, scoreTone } from "@/components/ui/ScoreBar";
import { ChunkExcerpt, ChunkLabel } from "@/components/ui/ChunkLabel";
import { resolveDocument } from "@/lib/chunkRegistry";
import { cn, formatScore } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mảnh dùng chung
// ---------------------------------------------------------------------------

/**
 * Hàng tham số của một bước.
 *
 * Giá trị 0 / rỗng nghĩa là "API không trả về thông số này" (ví dụ `avgdl` của
 * BM25 hay số token của prompt) — bỏ hẳn khỏi bảng, đừng hiện số 0 vì người xem
 * sẽ tưởng đó là kết quả đo được.
 */
function ConfigRow({ items }: { items: Array<[string, string | number]> }) {
  const shown = items.filter(
    ([, value]) => value !== 0 && value !== "" && value !== "0",
  );
  if (shown.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-1.5 rounded-lg bg-surface-2 px-3 py-2">
      {shown.map(([key, value]) => (
        <div key={key} className="flex items-baseline gap-1.5">
          <dt className="text-[11px] text-fg-subtle">{key}</dt>
          <dd className="font-mono text-[11px] font-medium tabular-nums text-fg">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RankChip({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-md bg-surface-3 font-mono text-[10px] text-fg-subtle">
        <Minus className="size-3" aria-hidden />
      </span>
    );
  }
  return (
    <span className="inline-flex size-5 items-center justify-center rounded-md bg-surface-3 font-mono text-[10px] font-semibold tabular-nums text-fg-muted">
      {rank}
    </span>
  );
}

function DeltaChip({ before, after }: { before: number; after: number }) {
  const delta = before - after;
  if (delta === 0) {
    return (
      <span className="font-mono text-[10px] text-fg-subtle">giữ nguyên</span>
    );
  }
  return (
    <span
      className={cn(
        "rounded px-1 font-mono text-[10px] font-semibold tabular-nums",
        delta > 0 ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger",
      )}
    >
      {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
    </span>
  );
}

function Row({
  index,
  children,
  className,
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "flex gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2",
        className,
      )}
    >
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-[10px] font-semibold text-accent">
        {index}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// 1. Semantic Search
// ---------------------------------------------------------------------------

function SemanticDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "semantic" }>;
}) {
  return (
    <div className="space-y-2.5">
      <ConfigRow
        items={[
          ["model", detail.model],
          ["dim", detail.dimensions],
          ["metric", detail.metric],
          ["collection", detail.collection],
          ["chunk quét", detail.candidates],
          ["top-k", detail.topK],
        ]}
      />
      <ul className="space-y-1.5">
        {detail.hits.map((hit) => (
          <Row key={hit.chunkId} index={hit.rank}>
            <div className="flex items-start justify-between gap-3">
              <ChunkLabel chunkId={hit.chunkId} />
              <ScoreBar
                value={hit.cosine}
                label={formatScore(hit.cosine)}
                tone={scoreTone(hit.cosine)}
                width="w-16 sm:w-24"
                className="shrink-0"
              />
            </div>
            <ChunkExcerpt chunkId={hit.chunkId} className="mt-1" />
          </Row>
        ))}
      </ul>
      <p className="text-[11px] text-fg-subtle">
        Điểm cosine gốc ở bảng này là căn cứ duy nhất để quyết định fallback — không
        dùng điểm RRF đã fuse.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Lexical Search (BM25)
// ---------------------------------------------------------------------------

function LexicalDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "lexical" }>;
}) {
  const maxScore = Math.max(...detail.hits.map((h) => h.bm25), 1);
  return (
    <div className="space-y-2.5">
      <ConfigRow
        items={[
          ["algorithm", detail.algorithm],
          ["k1", detail.k1],
          ["b", detail.b],
          ["corpus", detail.corpusSize],
          ["avgdl", detail.avgDocLength],
        ]}
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-fg-subtle">Token truy vấn:</span>
        {detail.tokens.map((token) => (
          <Badge key={token} tone="accent" mono>
            {token}
          </Badge>
        ))}
      </div>
      <ul className="space-y-1.5">
        {detail.hits.map((hit) => (
          <Row key={hit.chunkId} index={hit.rank}>
            <div className="flex items-start justify-between gap-3">
              <ChunkLabel chunkId={hit.chunkId} />
              <ScoreBar
                value={hit.bm25 / maxScore}
                label={hit.bm25.toFixed(2)}
                tone="red"
                width="w-16 sm:w-24"
                className="shrink-0"
              />
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {hit.matchedTerms.map((term) => (
                <span
                  key={term}
                  className="rounded bg-brand-red-50 px-1 font-mono text-[10px] text-brand-red-700 dark:bg-brand-red-950/60 dark:text-brand-red-300"
                >
                  {term}
                </span>
              ))}
            </div>
          </Row>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Merge — Reciprocal Rank Fusion
// ---------------------------------------------------------------------------

function MergeDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "merge" }>;
}) {
  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2">
        <p className="text-[11px] font-medium text-accent">{detail.method}</p>
        <code className="mt-1 block font-mono text-xs text-fg">
          {detail.formula}
        </code>
        <p className="mt-1 text-[11px] text-fg-muted">
          Mỗi danh sách đóng góp <code className="font-mono">1/({detail.k}+rank)</code>
          . Điểm RRF tối đa ≈ {(2 / (detail.k + 1)).toFixed(6)} nên{" "}
          <strong>không dùng để so ngưỡng fallback</strong>.
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-slim">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-fg-subtle">
              <th className="py-1.5 pr-2 font-medium">Chunk</th>
              <th className="px-2 py-1.5 text-center font-medium">Dense</th>
              <th className="px-2 py-1.5 text-center font-medium">BM25</th>
              <th className="px-2 py-1.5 font-medium">Phép tính RRF</th>
              <th className="px-2 py-1.5 text-right font-medium">Điểm</th>
              <th className="py-1.5 pl-2 text-center font-medium">Hạng</th>
            </tr>
          </thead>
          <tbody>
            {detail.rows.map((row) => (
              <tr
                key={row.chunkId}
                className="border-b border-border/60 last:border-0"
              >
                <td className="max-w-[13rem] py-1.5 pr-2">
                  <ChunkLabel chunkId={row.chunkId} showSection={false} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <RankChip rank={row.denseRank} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <RankChip rank={row.sparseRank} />
                </td>
                <td className="px-2 py-1.5 font-mono text-[10px] whitespace-nowrap text-fg-muted">
                  {[
                    row.denseRank ? `1/(${detail.k}+${row.denseRank})` : null,
                    row.sparseRank ? `1/(${detail.k}+${row.sparseRank})` : null,
                  ]
                    .filter(Boolean)
                    .join(" + ")}
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-[11px] font-semibold tabular-nums text-fg">
                  {row.rrf.toFixed(6)}
                </td>
                <td className="py-1.5 pl-2 text-center">
                  <span className="inline-flex size-5 items-center justify-center rounded-md bg-accent-soft font-mono text-[10px] font-semibold text-accent">
                    {row.fusedRank}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Rerank — cross-encoder
// ---------------------------------------------------------------------------

function RerankDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "rerank" }>;
}) {
  return (
    <div className="space-y-2.5">
      <ConfigRow
        items={[
          ["model", detail.model],
          ["cặp (query, chunk) đã chấm", detail.pairsScored],
        ]}
      />
      <ul className="space-y-1.5">
        {detail.rows.map((row) => (
          <Row key={row.chunkId} index={row.rankAfter}>
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <ChunkLabel chunkId={row.chunkId} />
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 font-mono text-[10px] tabular-nums text-fg-subtle">
                  #{row.rankBefore}
                  <ArrowRight className="size-3" aria-hidden />#{row.rankAfter}
                </span>
                <DeltaChip before={row.rankBefore} after={row.rankAfter} />
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-mono text-[10px] text-fg-subtle">
                RRF {row.scoreBefore.toFixed(6)}
              </span>
              <ArrowRight className="size-3 text-fg-subtle" aria-hidden />
              <ScoreBar
                value={row.scoreAfter}
                label={formatScore(row.scoreAfter, 4)}
                tone={scoreTone(row.scoreAfter)}
                width="w-20 sm:w-28"
              />
            </div>
          </Row>
        ))}
      </ul>
      <p className="text-[11px] text-fg-subtle">
        Cross-encoder đọc đồng thời câu hỏi và chunk nên điểm sau khi rerank phản ánh
        độ liên quan thật, khác hẳn thang RRF chỉ dựa vào thứ hạng.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Fallback — PageIndex Vectorless
// ---------------------------------------------------------------------------

function FallbackDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "fallback" }>;
}) {
  const triggered = detail.triggered;
  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          "rounded-lg border px-3 py-2",
          triggered
            ? "border-warn/30 bg-warn-soft"
            : "border-ok/25 bg-ok-soft",
        )}
      >
        <div className="flex items-center gap-2">
          {triggered ? (
            <Badge tone="warn">Kích hoạt</Badge>
          ) : (
            <Badge tone="ok">Không kích hoạt</Badge>
          )}
          <code className="font-mono text-xs font-semibold text-fg">
            {formatScore(detail.topCosine)} {triggered ? "<" : "≥"}{" "}
            {detail.threshold.toFixed(2)}
          </code>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">
          {detail.reason}
        </p>
      </div>

      {detail.treeNodes.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-fg-subtle">
            LLM duyệt cây mục lục tài liệu (không dùng vector):
          </p>
          <ul className="space-y-1">
            {detail.treeNodes.map((node) => {
              const doc = resolveDocument(node.docId);
              return (
                <li
                  key={node.id}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5",
                    node.selected
                      ? "border-accent/30 bg-accent-soft"
                      : "border-border bg-surface opacity-70",
                  )}
                  style={{ marginLeft: `${node.depth * 18}px` }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded",
                        node.selected
                          ? "bg-accent text-accent-fg"
                          : "bg-surface-3 text-fg-subtle",
                      )}
                    >
                      {node.selected ? (
                        <Check className="size-3" aria-hidden />
                      ) : (
                        <X className="size-3" aria-hidden />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {node.depth > 0 ? (
                          <CornerDownRight
                            className="size-3 text-fg-subtle"
                            aria-hidden
                          />
                        ) : null}
                        <span className="text-xs font-medium text-fg">
                          {node.title}
                        </span>
                        {doc ? (
                          <span className="font-mono text-[10px] text-fg-subtle">
                            {doc.fileName}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-fg-muted">
                        {node.reasoning}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Generation
// ---------------------------------------------------------------------------

function GenerationDetail({
  detail,
}: {
  detail: Extract<StepDetail, { kind: "generation" }>;
}) {
  const byOriginal = [...detail.slots].sort(
    (a, b) => a.originalIndex - b.originalIndex,
  );

  return (
    <div className="space-y-2.5">
      <ConfigRow
        items={[
          ["model", detail.model],
          ["chunk đưa vào", detail.chunkCount],
          ["prompt tokens", detail.promptTokens.toLocaleString("vi-VN")],
          ["completion tokens", detail.completionTokens.toLocaleString("vi-VN")],
        ]}
      />

      {detail.chunkCount === 0 ? (
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-[11px] text-fg-muted">
          Không có chunk nào vượt ngưỡng — LLM được yêu cầu trả lời an toàn, nêu rõ
          phạm vi kho tri thức thay vì suy đoán.
        </p>
      ) : detail.slots.length === 0 ? (
        // Backend không trả thứ tự chunk sau khi reorder, nên không vẽ được sơ đồ
        // hai cột. Nói thẳng thay vì dựng một sơ đồ trống.
        <p className="rounded-lg bg-surface-2 px-3 py-2 text-[11px] leading-relaxed text-fg-muted">
          {detail.chunkCount} chunk được đưa vào prompt. Backend chưa trả về thứ tự
          sau khi sắp xếp lại (<code className="font-mono">{detail.reorderStrategy}</code>
          ) nên phần so sánh trước/sau không hiển thị được.
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
            <p className="text-[11px] font-medium text-fg">
              Sắp xếp lại context:{" "}
              <code className="font-mono text-accent">
                {detail.reorderStrategy}
              </code>
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
              Chunk chỉ số chẵn giữ ở đầu prompt, chunk chỉ số lẻ đảo ngược và đẩy về
              cuối. Hai đầu prompt là nơi LLM chú ý nhất, tránh hiện tượng
              &ldquo;lost in the middle&rdquo;.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
            <div>
              <p className="mb-1 text-[11px] font-medium text-fg-subtle">
                Thứ tự sau rerank
              </p>
              <ol className="space-y-1">
                {byOriginal.map((slot) => (
                  <li
                    key={`orig-${slot.chunkId}`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5"
                  >
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-3 font-mono text-[10px] font-semibold text-fg-muted">
                      {slot.originalIndex}
                    </span>
                    <ChunkLabel
                      chunkId={slot.chunkId}
                      showSection={false}
                      className="min-w-0"
                    />
                  </li>
                ))}
              </ol>
            </div>

            <div className="hidden self-center text-fg-subtle sm:block">
              <ArrowRight className="size-4" aria-hidden />
            </div>

            <div>
              <p className="mb-1 text-[11px] font-medium text-fg-subtle">
                Thứ tự đưa vào prompt
              </p>
              <ol className="space-y-1">
                {detail.slots.map((slot) => (
                  <li
                    key={`final-${slot.chunkId}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-1.5",
                      slot.position === "front"
                        ? "border-accent/30 bg-accent-soft"
                        : "border-brand-red-200 bg-brand-red-50 dark:border-brand-red-800 dark:bg-brand-red-950/40",
                    )}
                  >
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-[10px] font-semibold text-fg-muted">
                      {slot.finalIndex}
                    </span>
                    <ChunkLabel
                      chunkId={slot.chunkId}
                      showSection={false}
                      className="min-w-0 flex-1"
                    />
                    <span className="shrink-0 font-mono text-[10px] text-fg-subtle">
                      {slot.position}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function StepDetails({ detail }: { detail: StepDetail }) {
  switch (detail.kind) {
    case "semantic":
      return <SemanticDetail detail={detail} />;
    case "lexical":
      return <LexicalDetail detail={detail} />;
    case "merge":
      return <MergeDetail detail={detail} />;
    case "rerank":
      return <RerankDetail detail={detail} />;
    case "fallback":
      return <FallbackDetail detail={detail} />;
    case "generation":
      return <GenerationDetail detail={detail} />;
    default:
      return null;
  }
}
