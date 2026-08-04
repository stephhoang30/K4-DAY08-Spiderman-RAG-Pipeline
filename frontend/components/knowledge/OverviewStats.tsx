import { Boxes, FileText, Hash, Type } from "lucide-react";
import type { KnowledgeDoc } from "@/lib/types";
import { StatTile } from "@/components/ui/Card";
import {
  DOCUMENTS,
  PIPELINE_CONFIG,
  TOTAL_CHARS,
  TOTAL_CHUNKS,
  TOTAL_TOKENS,
} from "@/lib/mock";
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

export function OverviewStats({ totals }: { totals: CorpusTotals }) {
  const step = PIPELINE_CONFIG.chunkSize - PIPELINE_CONFIG.chunkOverlap;

  return (
    <section aria-label="Tổng quan kho tri thức" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Tài liệu"
          value={formatInt(totals.docs)}
          hint={hintOf(totals.docs, DOCUMENTS.length, "tài liệu")}
          icon={<FileText className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Chunk đã index"
          value={formatInt(totals.chunks)}
          hint={hintOf(totals.chunks, TOTAL_CHUNKS, "chunk")}
          icon={<Boxes className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Token ước tính"
          value={formatCompact(totals.tokens)}
          hint={hintOf(totals.tokens, TOTAL_TOKENS, "token")}
          icon={<Hash className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Ký tự nguồn (.md)"
          value={formatCompact(totals.chars)}
          hint={hintOf(totals.chars, TOTAL_CHARS, "ký tự")}
          icon={<Type className="size-3.5" aria-hidden />}
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Mô hình embedding</dt>
          <dd className="mt-1 truncate font-mono text-[13px] font-semibold text-fg">
            {PIPELINE_CONFIG.embeddingModel}
          </dd>
          <dd className="mt-0.5 text-[11px] text-fg-subtle">
            {PIPELINE_CONFIG.embeddingDim} chiều · đa ngữ, hợp với tiếng Việt
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Cấu hình chunking</dt>
          <dd className="mt-1 font-mono text-[13px] font-semibold tabular-nums text-fg">
            {PIPELINE_CONFIG.chunkSize} / {PIPELINE_CONFIG.chunkOverlap}
          </dd>
          <dd className="mt-0.5 text-[11px] text-fg-subtle">
            cửa sổ {PIPELINE_CONFIG.chunkSize} ký tự, bước nhảy {step}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-medium text-fg-muted">Vector store</dt>
          <dd className="mt-1 truncate font-mono text-[13px] font-semibold text-fg">
            {PIPELINE_CONFIG.vectorStore} · {PIPELINE_CONFIG.similarity}
          </dd>
          <dd className="mt-0.5 truncate text-[11px] text-fg-subtle">
            collection {PIPELINE_CONFIG.collection}
          </dd>
        </div>
      </dl>
    </section>
  );
}
