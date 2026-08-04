"use client";

import { BookOpen, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { SourceCitation } from "@/lib/types";
import { Collapsible } from "@/components/ui/Collapsible";
import { DocTypeBadge } from "@/components/ui/Badge";
import { ScoreBar, scoreTone } from "@/components/ui/ScoreBar";
import { getChunk, getDocument } from "@/lib/mock";
import { formatScore } from "@/lib/utils";

function SourceItem({
  source,
  index,
}: {
  source: SourceCitation;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const chunk = getChunk(source.chunkId);
  const doc = chunk ? getDocument(chunk.docId) : undefined;
  if (!chunk || !doc) return null;

  return (
    <li className="rounded-xl border border-border bg-surface p-2.5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-[10px] font-semibold text-accent">
          {index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <DocTypeBadge type={doc.type} />
            <span className="text-[13px] font-semibold text-fg">{doc.title}</span>
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-fg-subtle">
            <span className="font-mono">{doc.fileName}</span>
            <span aria-hidden>·</span>
            <span>{chunk.section}</span>
            <span aria-hidden>·</span>
            <span className="font-mono">{chunk.id}</span>
          </div>

          {expanded ? null : (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-fg-muted">
              {chunk.excerpt}
            </p>
          )}

          {expanded ? (
            <div className="mt-1.5 rounded-lg border border-border bg-surface-2 p-2.5">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-fg">
                {chunk.content}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-fg-subtle">
                <span>
                  Trích dẫn:{" "}
                  <span className="text-fg-muted">[{doc.citation}]</span>
                </span>
                <span className="font-mono">{chunk.tokens} tokens</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Trang gốc
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </div>
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="text-[11px] text-fg-subtle">
                {source.retrievedBy}
              </span>
              <ScoreBar
                value={source.score}
                label={`${source.scoreLabel} ${formatScore(source.score)}`}
                tone={scoreTone(source.score)}
                width="w-14"
              />
            </span>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-accent transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {expanded ? "Thu gọn" : "Xem toàn bộ đoạn"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function SourcesPanel({ sources }: { sources: SourceCitation[] }) {
  if (sources.length === 0) return null;

  return (
    <Collapsible
      className="rounded-xl border border-border bg-surface"
      triggerClassName="px-3 py-2 rounded-xl hover:bg-surface-2 transition"
      panelClassName="border-t border-border p-3"
      summary={(open) => (
        <span className="flex items-center gap-2 text-[13px] font-medium text-fg-muted">
          <BookOpen className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
          <span className="flex-1">
            Nguồn tham khảo{" "}
            <span className="text-fg">({sources.length} đoạn)</span>
          </span>
          <span className="hidden text-[11px] text-fg-subtle sm:block">
            {open ? "Thu gọn" : "Xem nguồn"}
          </span>
        </span>
      )}
    >
      <ul className="space-y-2">
        {sources.map((source, i) => (
          <SourceItem key={source.chunkId} source={source} index={i + 1} />
        ))}
      </ul>
    </Collapsible>
  );
}
