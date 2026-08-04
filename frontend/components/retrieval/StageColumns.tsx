"use client";

import { ArrowRight, Timer } from "lucide-react";
import type { RetrievalRun, RetrievalStage, RetrievalStageItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { ChunkLabel } from "@/components/ui/ChunkLabel";
import { ScoreBar, scoreTone } from "@/components/ui/ScoreBar";
import { WiringBadge } from "@/components/ui/DataSource";
import { cn, formatMs } from "@/lib/utils";
import { chunkKeyOf, type ChunkKey } from "./chunkKeys";

function barTone(stage: RetrievalStage, item: RetrievalStageItem) {
  if (stage.key === "lexical") return "red" as const;
  if (stage.key === "merge") return "accent" as const;
  return scoreTone(item.score);
}

/** Chip chữ cái + màu của chunk, dùng chung ở cột và ở bảng RRF. */
export function ChunkKeyChip({
  chunkKey,
  className,
}: {
  chunkKey: ChunkKey;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-semibold",
        className,
      )}
      style={{
        color: chunkKey.color,
        borderColor: chunkKey.color,
        backgroundColor: `${chunkKey.color}1f`,
      }}
    >
      {chunkKey.letter}
    </span>
  );
}

function StageItemRow({
  stage,
  item,
  chunkKey,
  active,
  onActive,
}: {
  stage: RetrievalStage;
  item: RetrievalStageItem;
  chunkKey: ChunkKey;
  active: string | null;
  onActive: (chunkId: string | null) => void;
}) {
  const dimmed = active !== null && active !== item.chunkId;
  const focused = active === item.chunkId;

  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => onActive(item.chunkId)}
        onMouseLeave={() => onActive(null)}
        onFocus={() => onActive(item.chunkId)}
        onBlur={() => onActive(null)}
        onClick={() => onActive(focused ? null : item.chunkId)}
        aria-pressed={focused}
        className={cn(
          "flex w-full gap-2 rounded-lg border px-2 py-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          focused
            ? "border-accent/50 bg-accent-soft"
            : "border-border bg-surface hover:bg-surface-2",
          dimmed && "opacity-45",
        )}
      >
        <ChunkKeyChip chunkKey={chunkKey} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold tabular-nums text-fg-subtle">
              #{item.rank}
            </span>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-fg">
              {item.scoreLabel}
            </span>
          </span>
          <ChunkLabel
            chunkId={item.chunkId}
            showType={false}
            className="mt-0.5"
          />
          <ScoreBar
            value={item.normalized}
            tone={barTone(stage, item)}
            width="flex-1"
            className="mt-1.5 w-full"
          />
          {item.note ? (
            <span className="mt-1 block truncate font-mono text-[10px] text-fg-subtle">
              {item.note}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

function StageColumn({
  stage,
  index,
  keys,
  active,
  onActive,
}: {
  stage: RetrievalStage;
  index: number;
  keys: Map<string, ChunkKey>;
  active: string | null;
  onActive: (chunkId: string | null) => void;
}) {
  return (
    <Card as="section" className="flex flex-col">
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex min-w-0 items-baseline gap-1.5 text-sm font-semibold text-fg">
            <span className="font-mono text-[10px] text-fg-subtle">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="truncate">{stage.title}</span>
          </h3>
          <span className="flex shrink-0 items-center gap-1">
            {/* Nhãn đấu nối riêng của tầng này — Task nào còn mock thì hiện ở
                đúng cột đó, không gộp chung thành một nhãn cho cả trang. */}
            <WiringBadge wiring={stage.wiring} note={stage.note} />
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-fg-muted">
              <Timer className="size-3" aria-hidden />
              {formatMs(stage.durationMs)}
            </span>
          </span>
        </div>
        <p
          className="mt-0.5 truncate font-mono text-[10px] text-fg-subtle"
          title={stage.note ?? stage.subtitle}
        >
          {stage.subtitle}
        </p>
      </div>

      {stage.items.length > 0 ? (
        <ol className="flex-1 space-y-1.5 p-2">
          {stage.items.map((item) => (
            <StageItemRow
              key={item.chunkId}
              stage={stage}
              item={item}
              chunkKey={chunkKeyOf(keys, item.chunkId)}
              active={active}
              onActive={onActive}
            />
          ))}
        </ol>
      ) : (
        <p className="flex-1 p-3 text-[11px] text-fg-subtle">
          Tầng này không trả về kết quả nào.
        </p>
      )}

      <p className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-fg-subtle">
        {stage.caption}
      </p>
    </Card>
  );
}

/** Câu tóm tắt chunk đổi hạng nhiều nhất giữa semantic và rerank. */
function BiggestMover({
  run,
  keys,
  onActive,
}: {
  run: RetrievalRun;
  keys: Map<string, ChunkKey>;
  onActive: (chunkId: string | null) => void;
}) {
  const semantic = run.stages[0];
  const rerank = run.stages[3];
  const semanticRank = new Map(semantic.items.map((i) => [i.chunkId, i.rank]));

  let best: { chunkId: string; from: number; to: number; delta: number } | null =
    null;
  for (const item of rerank.items) {
    const from = semanticRank.get(item.chunkId);
    if (from === undefined) continue;
    const delta = from - item.rank;
    if (delta > 0 && (best === null || delta > best.delta)) {
      best = { chunkId: item.chunkId, from, to: item.rank, delta };
    }
  }

  if (!best) return null;
  const mover = best;
  const key = chunkKeyOf(keys, mover.chunkId);

  return (
    <button
      type="button"
      onMouseEnter={() => onActive(mover.chunkId)}
      onMouseLeave={() => onActive(null)}
      onFocus={() => onActive(mover.chunkId)}
      onBlur={() => onActive(null)}
      className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-left transition hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ChunkKeyChip chunkKey={key} />
      <span className="text-[11px] text-fg-muted">Leo hạng nhiều nhất:</span>
      <span className="font-mono text-[11px] font-semibold text-fg">
        {mover.chunkId}
      </span>
      <span className="inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-fg-muted">
        semantic #{mover.from}
        <ArrowRight className="size-3" aria-hidden />
        rerank #{mover.to}
      </span>
      <span className="rounded bg-ok-soft px-1 font-mono text-[10px] font-semibold text-ok">
        ▲{mover.delta} bậc
      </span>
      <span className="text-[11px] text-fg-subtle">
        — cross-encoder xếp lại theo nội dung, không theo khoảng cách vector.
      </span>
    </button>
  );
}

/** Bốn cột song song + chú thích. */
export function StageColumns({
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
  return (
    <div className="space-y-3">
      <BiggestMover run={run} keys={keys} onActive={onActive} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {run.stages.map((stage, i) => (
          <StageColumn
            key={stage.key}
            stage={stage}
            index={i}
            keys={keys}
            active={active}
            onActive={onActive}
          />
        ))}
      </div>
    </div>
  );
}
