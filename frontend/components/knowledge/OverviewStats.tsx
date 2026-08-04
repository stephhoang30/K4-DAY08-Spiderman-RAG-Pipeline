import { Boxes, FileText, Hash, Type } from "lucide-react";
import type { KnowledgeDoc } from "@/lib/types";
import type { KnowledgeSnapshot } from "@/lib/data";
import { StatTile } from "@/components/ui/Card";
import { formatCompact, formatInt } from "./labels";

export interface CorpusTotals {
  docs: number;
  chunks: number;
  tokens: number;
  chars: number;
}

/** Cộng dồn số liệu của danh sách tài liệu ĐANG hiển thị sau khi lọc. */
export function sumTotals(
  docs: KnowledgeDoc[],
  charOf: (docId: string) => number,
): CorpusTotals {
  return docs.reduce<CorpusTotals>(
    (acc, doc) => ({
      docs: acc.docs + 1,
      chunks: acc.chunks + doc.chunkCount,
      tokens: acc.tokens + doc.tokenCount,
      chars: acc.chars + charOf(doc.id),
    }),
    { docs: 0, chunks: 0, tokens: 0, chars: 0 },
  );
}

/** "trên tổng 13 tài liệu" — chỉ hiện khi bộ lọc đang cắt bớt dữ liệu. */
function hintOf(value: number, total: number, unit: string): string {
  if (value === total) return `toàn bộ ${formatInt(total)} ${unit}`;
  return `đang lọc · tổng ${formatInt(total)} ${unit}`;
}

/**
 * @param totals Số liệu của các tài liệu ĐANG hiển thị sau khi lọc.
 * @param all    Số liệu của toàn kho, dùng làm mẫu số trong dòng gợi ý.
 * @param config Tham số embedding/chunking. Khi backend chạy thì đây là giá trị
 *   backend báo về (`/api/knowledge/stats`), không phải hằng số trong repo.
 */
export function OverviewStats({
  totals,
  all,
  config,
}: {
  totals: CorpusTotals;
  all: KnowledgeSnapshot["totals"];
  config: KnowledgeSnapshot["config"];
}) {
  const step = config.chunkSize - config.chunkOverlap;

  return (
    <section aria-label="Tổng quan kho tri thức" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Tài liệu"
          value={formatInt(totals.docs)}
          hint={hintOf(totals.docs, all.documents, "tài liệu")}
          icon={<FileText className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Chunk đã index"
          value={formatInt(totals.chunks)}
          hint={hintOf(totals.chunks, all.chunks, "chunk")}
          icon={<Boxes className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Token"
          value={formatCompact(totals.tokens)}
          hint={hintOf(totals.tokens, all.tokens, "token")}
          icon={<Hash className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Ký tự nguồn (.md)"
          value={formatCompact(totals.chars)}
          hint={hintOf(totals.chars, all.chars, "ký tự")}
          icon={<Type className="size-3.5" aria-hidden />}
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Mô hình embedding</dt>
          <dd className="mt-1 truncate font-mono text-[13px] font-semibold text-fg">
            {config.embeddingModel}
          </dd>
          <dd className="mt-0.5 text-[11px] text-fg-subtle">
            {config.embeddingDim} chiều · đa ngữ, hợp với tiếng Việt
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Cấu hình chunking</dt>
          <dd className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-fg">
            {config.chunkSize} / {config.chunkOverlap}
          </dd>
          <dd className="mt-0.5 text-[11px] text-fg-subtle">
            cửa sổ {config.chunkSize} ký tự, bước nhảy {step}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Vector store</dt>
          <dd className="mt-1 truncate font-mono text-[13px] font-semibold text-fg">
            {config.vectorStore} · {config.distance}
          </dd>
          <dd className="mt-0.5 truncate text-[11px] text-fg-subtle">
            collection {config.collection}
          </dd>
        </div>
      </dl>
    </section>
  );
}
