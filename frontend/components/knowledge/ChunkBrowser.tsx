"use client";

import { Layers, Link2, MessageSquareQuote } from "lucide-react";
import type { Chunk, KbChunk, KnowledgeDoc } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, DocTypeBadge } from "@/components/ui/Badge";
import { Collapsible } from "@/components/ui/Collapsible";
import { ChunkExcerpt, ChunkLabel } from "@/components/ui/ChunkLabel";
import {
  PIPELINE_CONFIG,
  getCitedChunks,
  getDocFileStats,
  getKbChunks,
} from "@/lib/mock";
import { RoleBadge, formatInt, topicLabel } from "./labels";

/**
 * Nội dung chunk với hai vùng chồng lấn được tô nền:
 * đầu chunk trùng chunk trước (vàng), cuối chunk trùng chunk sau (xanh).
 */
function ChunkContent({ chunk }: { chunk: KbChunk }) {
  const total = chunk.content.length;
  const headEnd = Math.min(chunk.overlapPrev, total);
  const tailStart = Math.max(headEnd, total - chunk.overlapNext);

  const head = chunk.content.slice(0, headEnd);
  const middle = chunk.content.slice(headEnd, tailStart);
  const tail = chunk.content.slice(tailStart);

  return (
    <p className="whitespace-pre-line break-words text-[13px] leading-relaxed text-fg">
      {head ? (
        <mark
          title={`${chunk.overlapPrev} ký tự lặp lại từ chunk #${chunk.index - 1}`}
          className="box-decoration-clone rounded-[3px] bg-warn-soft text-fg underline decoration-warn/70 decoration-dotted underline-offset-2"
        >
          {head}
        </mark>
      ) : null}
      {middle}
      {tail ? (
        <mark
          title={`${chunk.overlapNext} ký tự sẽ lặp lại ở chunk #${chunk.index + 1}`}
          className="box-decoration-clone rounded-[3px] bg-accent-soft text-fg underline decoration-accent/70 decoration-dotted underline-offset-2"
        >
          {tail}
        </mark>
      ) : null}
    </p>
  );
}

function OverlapNote({ chunk }: { chunk: KbChunk }) {
  if (chunk.overlapNext === 0) {
    return (
      <p className="mt-2 rounded-lg border border-dashed border-border bg-surface-2 px-2.5 py-2 text-[11px] text-fg-subtle">
        Chunk cuối trong phần đang hiển thị — không có đoạn chồng lấn phía sau.
      </p>
    );
  }
  const shared = chunk.content.slice(chunk.content.length - chunk.overlapNext);
  return (
    <div className="mt-2 rounded-lg border border-accent/25 bg-accent-soft px-2.5 py-2">
      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-accent">
        <Link2 className="size-3 shrink-0" aria-hidden />
        {chunk.overlapNext} ký tự cuối của chunk #{chunk.index} cũng là{" "}
        {chunk.overlapNext} ký tự đầu của chunk #{chunk.index + 1}
      </p>
      <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-fg-muted">
        {shared}
      </p>
    </div>
  );
}

function ChunkRow({ chunk, docChunkTotal }: { chunk: KbChunk; docChunkTotal: number }) {
  const end = chunk.charStart + chunk.charCount;
  return (
    <li className="rounded-xl border border-border bg-surface">
      <Collapsible
        triggerClassName="px-3 py-2.5 rounded-xl hover:bg-surface-2 transition"
        panelClassName="border-t border-border px-3 py-3"
        summary={(open) => (
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-accent-soft px-1.5 font-mono text-[10px] font-semibold text-accent">
                #{chunk.index}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
                {chunk.section}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-fg-subtle">
                {chunk.tokens} token · {chunk.charCount} ký tự
              </span>
            </span>
            {open ? null : (
              <span className="line-clamp-2 text-[12px] leading-relaxed text-fg-muted">
                {chunk.excerpt}
              </span>
            )}
          </span>
        )}
      >
        <ChunkContent chunk={chunk} />
        <OverlapNote chunk={chunk} />
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-[11px] text-fg-subtle">
          <div className="flex items-baseline gap-1">
            <dt>Mã chunk</dt>
            <dd className="font-mono text-fg-muted">{chunk.id}</dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt>Vị trí trong file</dt>
            <dd className="font-mono tabular-nums text-fg-muted">
              {formatInt(chunk.charStart)} – {formatInt(end)}
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt>Chồng lấn</dt>
            <dd className="font-mono tabular-nums text-fg-muted">
              trước {chunk.overlapPrev} · sau {chunk.overlapNext}
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt>Thứ tự</dt>
            <dd className="font-mono tabular-nums text-fg-muted">
              {chunk.index + 1}/{formatInt(docChunkTotal)}
            </dd>
          </div>
        </dl>
      </Collapsible>
    </li>
  );
}

function CitedChunks({ chunks }: { chunks: Chunk[] }) {
  if (chunks.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-2 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
        <MessageSquareQuote className="size-3 shrink-0" aria-hidden />
        Đoạn của tài liệu này đang được trích dẫn ở trang Chat
      </p>
      <ul className="mt-2 space-y-2">
        {chunks.map((chunk) => (
          <li key={chunk.id} className="min-w-0">
            <ChunkLabel chunkId={chunk.id} showType={false} />
            <ChunkExcerpt chunkId={chunk.id} className="mt-0.5" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-fg-muted">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="inline-block size-3 rounded-[3px] border border-warn/30 bg-warn-soft"
        />
        {PIPELINE_CONFIG.chunkOverlap} ký tự lặp từ chunk liền trước
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="inline-block size-3 rounded-[3px] border border-accent/30 bg-accent-soft"
        />
        {PIPELINE_CONFIG.chunkOverlap} ký tự sẽ lặp sang chunk liền sau
      </li>
    </ul>
  );
}

export function ChunkBrowser({
  doc,
  docs,
  onSelect,
}: {
  doc: KnowledgeDoc | null;
  docs: KnowledgeDoc[];
  onSelect: (docId: string) => void;
}) {
  if (!doc) {
    return (
      <Card as="section">
        <CardHeader
          title="Trình duyệt chunk"
          description="Chọn một tài liệu ở bảng phía trên để xem các chunk của nó."
        />
        <p className="px-4 py-10 text-center text-sm text-fg-muted">
          Chưa có tài liệu nào được chọn.
        </p>
      </Card>
    );
  }

  const chunks = getKbChunks(doc.id);
  const stats = getDocFileStats(doc.id);
  const cited = getCitedChunks(doc.id);

  return (
    <Card as="section">
      <CardHeader
        title="Trình duyệt chunk"
        description={`Nội dung cắt thật từ ${
          stats?.standardizedFile ?? doc.fileName
        } theo cửa sổ ${PIPELINE_CONFIG.chunkSize} ký tự, chồng lấn ${
          PIPELINE_CONFIG.chunkOverlap
        }.`}
        action={
          <label className="flex min-w-0 items-center gap-1.5">
            <span className="sr-only">Chọn tài liệu để xem chunk</span>
            <Layers className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
            <select
              value={doc.id}
              onChange={(event) => onSelect(event.target.value)}
              className="min-w-0 max-w-[14rem] truncate rounded-lg border border-border bg-surface px-2 py-1 text-xs text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              {docs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className="space-y-3 p-4">
        <div className="rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <DocTypeBadge type={doc.type} />
            <RoleBadge role={doc.customerRole} />
            <Badge mono>{doc.topic}</Badge>
            <span className="min-w-0 truncate text-[13px] font-semibold text-fg">
              {doc.title}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
            {doc.summary}
          </p>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-subtle">
            <div className="flex items-baseline gap-1">
              <dt>Chủ đề</dt>
              <dd className="text-fg-muted">{topicLabel(doc.topic)}</dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt>File .md</dt>
              <dd className="font-mono text-fg-muted">
                {stats?.standardizedFile ?? doc.fileName}
              </dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt>Thân tài liệu</dt>
              <dd className="font-mono tabular-nums text-fg-muted">
                {formatInt(stats?.bodyCharCount ?? 0)} ký tự
              </dd>
            </div>
            <div className="flex items-baseline gap-1">
              <dt>Trích dẫn</dt>
              <dd className="text-fg-muted">[{doc.citation}]</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Legend />
          <p className="text-[11px] text-fg-subtle">
            Đang xem{" "}
            <span className="font-mono font-semibold tabular-nums text-fg">
              {chunks.length}
            </span>{" "}
            chunk đầu tiên trên tổng{" "}
            <span className="font-mono tabular-nums">
              {formatInt(doc.chunkCount)}
            </span>
          </p>
        </div>

        {chunks.length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-muted">
            Tài liệu này chưa có chunk mẫu trong bộ dữ liệu demo.
          </p>
        ) : (
          <ul className="space-y-2">
            {chunks.map((chunk) => (
              <ChunkRow
                key={chunk.id}
                chunk={chunk}
                docChunkTotal={doc.chunkCount}
              />
            ))}
          </ul>
        )}

        <CitedChunks chunks={cited} />
      </div>
    </Card>
  );
}
