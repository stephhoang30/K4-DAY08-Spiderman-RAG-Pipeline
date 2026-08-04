"use client";

import { Minus, TriangleAlert } from "lucide-react";
import type { RetrievalRun } from "@/lib/types";
import { ChunkLabel } from "@/components/ui/ChunkLabel";
import { RRF_TOP1_BOTH_LISTS, RRF_TOP1_ONE_LIST } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { ChunkKeyChip } from "./StageColumns";
import { chunkKeyOf, type ChunkKey } from "./chunkKeys";

function term(k: number, rank: number | null): string {
  if (rank === null) return "—";
  return (1 / (k + rank)).toFixed(6);
}

function RankCell({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-md bg-surface-3 text-fg-subtle">
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

/**
 * Bảng phân rã điểm RRF: từng chunk, hạng ở hai danh sách, từng số hạng
 * `1/(k + rank)` và tổng. Đây là chỗ nhìn thấy rõ nhất vì sao điểm RRF không
 * mang thông tin về độ liên quan.
 */
export function RrfBreakdown({
  run,
  keys,
  active,
  onActive,
}: {
  run: RetrievalRun;
  keys: Map<string, ChunkKey>;
  active: string | null;
  onActive: (chunkId: string | null) => void;
}) {
  const k = run.rrfK;
  const rerankRank = new Map(
    run.stages[3].items.map((item) => [item.chunkId, item.rank]),
  );
  const top = run.mergeRows[0];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-accent/25 bg-accent-soft px-3 py-2">
        <code className="block font-mono text-xs font-semibold text-fg">
          RRF(d) = Σ 1 / ({k} + rank_i(d))
        </code>
        <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
          Tổng chạy trên hai danh sách: semantic và BM25. Chunk vắng mặt ở một danh
          sách thì số hạng tương ứng bằng 0, không phải điểm phạt — nên chunk chỉ có
          ở một danh sách vẫn có thể lọt vào top.
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-slim rounded-xl border border-border">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-[10px] uppercase tracking-wide text-fg-subtle">
              <th className="px-3 py-2 font-medium">Chunk</th>
              <th className="px-2 py-2 text-center font-medium">Hạng semantic</th>
              <th className="px-2 py-2 text-center font-medium">Hạng BM25</th>
              <th className="px-2 py-2 text-right font-medium">1/({k}+r₍sem₎)</th>
              <th className="px-2 py-2 text-right font-medium">1/({k}+r₍bm25₎)</th>
              <th className="px-2 py-2 text-right font-medium">Tổng RRF</th>
              <th className="px-2 py-2 text-center font-medium">Hạng sau fuse</th>
              <th className="px-3 py-2 text-center font-medium">Hạng sau rerank</th>
            </tr>
          </thead>
          <tbody>
            {run.mergeRows.map((row) => {
              const key = chunkKeyOf(keys, row.chunkId);
              const after = rerankRank.get(row.chunkId);
              const dimmed = active !== null && active !== row.chunkId;
              return (
                <tr
                  key={row.chunkId}
                  onMouseEnter={() => onActive(row.chunkId)}
                  onMouseLeave={() => onActive(null)}
                  className={cn(
                    "border-b border-border/60 transition last:border-0",
                    active === row.chunkId
                      ? "bg-accent-soft"
                      : row.fusedRank === 1
                        ? "bg-surface-2"
                        : "bg-surface",
                    dimmed && "opacity-45",
                  )}
                >
                  <td className="max-w-[15rem] px-3 py-2">
                    <span className="flex items-start gap-2">
                      <ChunkKeyChip chunkKey={key} className="mt-0.5" />
                      <ChunkLabel chunkId={row.chunkId} showType={false} />
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <RankCell rank={row.denseRank} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <RankCell rank={row.sparseRank} />
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg-muted">
                    {term(k, row.denseRank)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg-muted">
                    {term(k, row.sparseRank)}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-[11px] font-semibold tabular-nums text-fg">
                    {row.rrf.toFixed(6)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className="inline-flex size-5 items-center justify-center rounded-md bg-accent-soft font-mono text-[10px] font-semibold text-accent">
                      {row.fusedRank}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-[11px] tabular-nums text-fg-muted">
                    {after ? `#${after}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-warn/30 bg-warn-soft px-3 py-2.5">
        <div className="flex items-start gap-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">
              Bẫy: điểm RRF chỉ mã hoá thứ hạng
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
              Toàn bộ giá trị trong cột &ldquo;Tổng RRF&rdquo; được lắp ráp từ đúng hai
              hằng số:{" "}
              <code className="font-mono text-fg">
                1/{k + 1} = {RRF_TOP1_ONE_LIST.toFixed(6)}
              </code>{" "}
              và{" "}
              <code className="font-mono text-fg">
                2/{k + 1} = {RRF_TOP1_BOTH_LISTS.toFixed(6)}
              </code>
              . Không có chỗ nào cho nội dung chunk: top-1 của truy vấn đúng chủ đề và
              top-1 của truy vấn &ldquo;Cách nấu phở bò ngon tại nhà?&rdquo; cho ra
              cùng một con số.
            </p>
            {top ? (
              <p className="mt-1.5 font-mono text-[11px] text-fg">
                Top-1 hiện tại: {top.chunkId} ={" "}
                {[
                  top.denseRank ? `1/(${k}+${top.denseRank})` : null,
                  top.sparseRank ? `1/(${k}+${top.sparseRank})` : null,
                ]
                  .filter(Boolean)
                  .join(" + ")}{" "}
                = {top.rrf.toFixed(6)}
              </p>
            ) : null}
            <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">
              Vì thế ngưỡng fallback phải so với điểm cosine gốc ở bước semantic. Kéo
              thanh trượt ở phần dưới để thấy hậu quả khi so nhầm bằng điểm RRF.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
