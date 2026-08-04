import { Lightbulb, Search, TriangleAlert, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import {
  IMPROVEMENTS,
  METRIC_IDS,
  METRIC_META,
  RAGAS_THRESHOLD,
  WORST_PERFORMERS,
  getGoldenCase,
  overallScore,
} from "@/lib/mock";
import type { EvalFailureStage } from "@/lib/types";
import { cn, formatScore } from "@/lib/utils";

const STAGE_META: Record<
  EvalFailureStage,
  { label: string; tone: "warn" | "danger"; hint: string }
> = {
  retrieval: {
    label: "Retrieval",
    tone: "warn",
    hint: "Chunk chứa đáp án không vào được prompt — lỗi nằm trước bước sinh.",
  },
  generation: {
    label: "Generation",
    tone: "danger",
    hint: "Ngữ cảnh đã đúng nhưng LLM viết thêm thứ không có trong ngữ cảnh.",
  },
};

const ranked = [...WORST_PERFORMERS].sort((a, b) => {
  const left = getGoldenCase(a.caseId);
  const right = getGoldenCase(b.caseId);
  if (!left || !right) return 0;
  return overallScore(left.scores) - overallScore(right.scores);
});

function WorstCaseCard({
  rank,
  caseId,
  failureStage,
  failurePoint,
  rootCause,
  evidence,
}: {
  rank: number;
  caseId: string;
  failureStage: EvalFailureStage;
  failurePoint: string;
  rootCause: string;
  evidence: string;
}) {
  const row = getGoldenCase(caseId);
  if (!row) return null;
  const stage = STAGE_META[failureStage];
  const overall = overallScore(row.scores);

  return (
    <Card as="li" className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-border px-4 py-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-danger-soft font-mono text-xs font-semibold text-danger">
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <code className="font-mono text-[11px] font-semibold text-fg-muted">
              {caseId}
            </code>
            <Badge tone={stage.tone}>Lỗi ở bước {stage.label}</Badge>
            {row.usedFallback ? <Badge tone="warn">PageIndex</Badge> : null}
          </div>
          <p className="mt-1 text-sm font-medium leading-relaxed text-fg">
            {row.question}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-lg font-semibold tabular-nums text-danger">
            {formatScore(overall)}
          </div>
          <div className="text-[10px] text-fg-subtle">TB 4 chỉ số</div>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-3.5 lg:grid-cols-[minmax(0,15rem)_1fr]">
        {/* Điểm từng chỉ số */}
        <dl className="space-y-1.5">
          {METRIC_IDS.map((id) => {
            const value = row.scores[id];
            const passed = value >= RAGAS_THRESHOLD;
            return (
              <div key={id} className="flex items-center gap-2">
                <dt className="w-[5.5rem] shrink-0 text-[11px] text-fg-subtle">
                  {METRIC_META[id].short}
                </dt>
                <dd className="flex min-w-0 flex-1 items-center">
                  <ScoreBar
                    value={value}
                    label={formatScore(value)}
                    tone={passed ? "ok" : "danger"}
                    width="flex-1"
                    className="w-full"
                  />
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="space-y-2.5">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
              <Search className="size-3.5" aria-hidden />
              Điểm hỏng
            </p>
            <p className="mt-1 font-mono text-[11px] text-fg-muted">
              {failurePoint}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
              <TriangleAlert className="size-3.5" aria-hidden />
              Nguyên nhân gốc
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
              {rootCause}
            </p>
          </div>

          <div
            className={cn(
              "rounded-lg border px-3 py-2",
              stage.tone === "warn"
                ? "border-warn/30 bg-warn-soft"
                : "border-danger/30 bg-danger-soft",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
              Bằng chứng
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
              {evidence}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ImprovementList() {
  return (
    <Card>
      <CardHeader
        title="Đề xuất cải tiến"
        description="Mỗi đề xuất gắn với ca cụ thể ở trên, kèm tác động kỳ vọng lên chỉ số."
        action={
          <Lightbulb className="size-4 shrink-0 text-warn" aria-hidden />
        }
      />
      <ol className="divide-y divide-border">
        {IMPROVEMENTS.map((item, i) => (
          <li key={item.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-[10px] font-semibold text-accent">
                {i + 1}
              </span>
              <h4 className="text-sm font-semibold text-fg">{item.title}</h4>
              <Badge tone="neutral">công sức: {item.effort}</Badge>
              {item.targetCaseIds.map((caseId) => (
                <Badge key={caseId} tone="accent" mono>
                  {caseId}
                </Badge>
              ))}
            </div>

            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                  <Wrench className="size-3.5" aria-hidden />
                  Action
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                  {item.action}
                </p>
              </div>
              <div className="rounded-lg border border-ok/25 bg-ok-soft px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                  Expected impact
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                  {item.expectedImpact}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function WorstPerformers() {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {ranked.map((item, i) => (
          <WorstCaseCard key={item.caseId} rank={i + 1} {...item} />
        ))}
      </ul>
      <ImprovementList />
    </div>
  );
}
