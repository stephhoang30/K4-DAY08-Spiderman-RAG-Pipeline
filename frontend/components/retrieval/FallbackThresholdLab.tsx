"use client";

import { Check, RotateCcw, X } from "lucide-react";
import type { RetrievalRun, StepDetail } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Collapsible } from "@/components/ui/Collapsible";
import { StepDetails } from "@/components/chat/StepDetails";
import {
  PIPELINE_CONFIG,
  RRF_TOP1_BOTH_LISTS,
  RRF_TOP1_ONE_LIST,
} from "@/lib/mock";
import { cn, formatScore } from "@/lib/utils";

const QUICK_VALUES = [0.48, 0.2, 0.03, 0.005];

function VerdictBadge({ triggered }: { triggered: boolean }) {
  return (
    <Badge tone={triggered ? "warn" : "ok"}>
      {triggered ? (
        <Check className="size-3" aria-hidden />
      ) : (
        <X className="size-3" aria-hidden />
      )}
      {triggered ? "Kích hoạt PageIndex" : "Không kích hoạt"}
    </Badge>
  );
}

function ScoreCard({
  kind,
  label,
  value,
  formula,
  hint,
  threshold,
  children,
}: {
  kind: "correct" | "wrong";
  label: string;
  value: number;
  formula: string;
  hint: string;
  threshold: number;
  children?: React.ReactNode;
}) {
  const triggered = value < threshold;
  const correct = kind === "correct";

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        correct
          ? "border-ok/30 bg-surface"
          : "border-danger/30 border-dashed bg-surface",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={correct ? "ok" : "danger"}>
          {correct ? "Căn cứ đúng" : "Căn cứ sai"}
        </Badge>
        <span className="text-[13px] font-semibold text-fg">{label}</span>
      </div>

      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-fg">
        {correct ? formatScore(value) : value.toFixed(6)}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">{formula}</p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">{hint}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
        <code className="font-mono text-[11px] font-semibold tabular-nums text-fg">
          {correct ? formatScore(value) : value.toFixed(6)} {triggered ? "<" : "≥"}{" "}
          {threshold.toFixed(3)}
        </code>
        <VerdictBadge triggered={triggered} />
      </div>

      {children}
    </div>
  );
}

/** Thanh 0→1 với vùng kích hoạt, vạch ngưỡng và vị trí hai loại điểm. */
function ThresholdScale({
  threshold,
  cosine,
  rrf,
}: {
  threshold: number;
  cosine: number;
  rrf: number;
}) {
  const pct = (v: number) => `${Math.max(0, Math.min(1, v)) * 100}%`;
  // Nhãn ngưỡng bị ghim trong khung để không tràn ra ngoài thẻ ở hai đầu dải.
  const labelPct = `${Math.max(4, Math.min(96, threshold * 100))}%`;

  return (
    <div className="pt-6">
      <div className="relative h-7 rounded-lg border border-border bg-surface-2">
        {/* Vùng < ngưỡng = fallback kích hoạt */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-lg bg-warn-soft"
          style={{ width: pct(threshold) }}
          aria-hidden
        />
        {/* Vạch ngưỡng */}
        <div
          className="absolute inset-y-[-6px] w-0.5 bg-accent"
          style={{ left: pct(threshold) }}
          aria-hidden
        />
        <span
          className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-fg"
          style={{ left: labelPct }}
        >
          {threshold.toFixed(3)}
        </span>

        {/* Điểm cosine gốc */}
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ok"
          style={{ left: pct(cosine) }}
          title={`Cosine gốc top-1 = ${formatScore(cosine)}`}
        />
        {/* Điểm RRF */}
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-danger"
          style={{ left: pct(rrf) }}
          title={`RRF top-1 = ${rrf.toFixed(6)}`}
        />
      </div>

      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-fg-subtle">
        <span>0.00</span>
        <span>0.25</span>
        <span>0.50</span>
        <span>0.75</span>
        <span>1.00</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-ok" aria-hidden />
          cosine gốc top-1 ({formatScore(cosine)})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-danger" aria-hidden />
          RRF top-1 ({rrf.toFixed(6)}) — dính sát mép trái, mọi truy vấn đều nằm ở
          đúng chỗ này
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded bg-warn-soft ring-1 ring-warn/40" aria-hidden />
          vùng kích hoạt fallback
        </span>
      </div>
    </div>
  );
}

/** Bảng: cùng một ngưỡng, toàn bộ truy vấn mẫu cho ra phán quyết thế nào. */
function CrossQueryTable({
  runs,
  currentId,
  threshold,
}: {
  runs: RetrievalRun[];
  currentId: string;
  threshold: number;
}) {
  return (
    <div className="overflow-x-auto scrollbar-slim rounded-xl border border-border">
      <table className="w-full min-w-[44rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-[10px] uppercase tracking-wide text-fg-subtle">
            <th className="px-3 py-2 font-medium">Truy vấn</th>
            <th className="px-2 py-2 text-right font-medium">cosine top-1</th>
            <th className="px-2 py-2 text-right font-medium">RRF top-1</th>
            <th className="px-2 py-2 font-medium">Phán quyết theo cosine</th>
            <th className="px-3 py-2 font-medium">Phán quyết theo RRF</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((item) => {
            const byCosine = item.topCosine < threshold;
            const byRrf = item.topRrf < threshold;
            return (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border/60 last:border-0",
                  item.id === currentId ? "bg-accent-soft" : "bg-surface",
                )}
              >
                <td className="max-w-[20rem] px-3 py-2">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-xs text-fg">{item.question}</span>
                    {item.offTopic ? <Badge tone="warn">lạc đề</Badge> : null}
                  </span>
                </td>
                <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg">
                  {formatScore(item.topCosine)}
                </td>
                <td className="px-2 py-2 text-right font-mono text-[11px] tabular-nums text-fg-muted">
                  {item.topRrf.toFixed(6)}
                </td>
                <td className="px-2 py-2">
                  <VerdictBadge triggered={byCosine} />
                </td>
                <td className="px-3 py-2">
                  <VerdictBadge triggered={byRrf} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Phòng thử ngưỡng fallback: kéo thanh trượt và so song song hai con số —
 * điểm cosine gốc (đúng) và điểm RRF sau fuse (sai).
 */
export function FallbackThresholdLab({
  run,
  runs,
  threshold,
  onThreshold,
}: {
  run: RetrievalRun;
  runs: RetrievalRun[];
  threshold: number;
  onThreshold: (value: number) => void;
}) {
  const topChunkId = run.stages[0].items[0]?.chunkId ?? "—";
  const topMerge = run.mergeRows[0];
  const cosineTriggered = run.topCosine < threshold;
  const rrfTriggered = run.topRrf < threshold;

  const rrfRegime =
    threshold > RRF_TOP1_BOTH_LISTS
      ? {
          tone: "danger" as const,
          text: `Ngưỡng ${threshold.toFixed(3)} lớn hơn giá trị RRF lớn nhất mà top-1 có thể đạt (${RRF_TOP1_BOTH_LISTS.toFixed(
            6,
          )}) → fallback kích hoạt ở 100% truy vấn, kể cả câu hỏi khớp hoàn hảo. PageIndex chạy thừa và mỗi lượt hỏi cộng thêm hơn một giây.`,
        }
      : threshold <= RRF_TOP1_ONE_LIST
        ? {
            tone: "danger" as const,
            text: `Ngưỡng ${threshold.toFixed(
              3,
            )} đã tụt xuống dưới cả giá trị RRF nhỏ nhất của top-1 (${RRF_TOP1_ONE_LIST.toFixed(
              6,
            )}) → fallback không bao giờ kích hoạt, kể cả với "Cách nấu phở bò ngon tại nhà?". Nhánh PageIndex trở thành code chết.`,
          }
        : {
            tone: "warn" as const,
            text: `Ngưỡng ${threshold.toFixed(
              3,
            )} rơi đúng vào khe giữa hai hằng số ${RRF_TOP1_ONE_LIST.toFixed(
              6,
            )} và ${RRF_TOP1_BOTH_LISTS.toFixed(
              6,
            )} → phán quyết chỉ còn phụ thuộc việc top-1 có mặt ở một hay cả hai danh sách. Vẫn không liên quan gì tới nội dung chunk.`,
          };

  // Tái dùng nguyên khối chi tiết bước fallback của trang Chat, nhưng thay
  // ngưỡng bằng giá trị đang kéo trên thanh trượt.
  const derivedFallback: Extract<StepDetail, { kind: "fallback" }> = {
    kind: "fallback",
    triggered: cosineTriggered,
    topCosine: run.topCosine,
    threshold,
    reason: cosineTriggered
      ? run.usedFallback
        ? `Điểm cosine gốc của top-1 là ${formatScore(
            run.topCosine,
          )} < ${threshold.toFixed(
            3,
          )} → hybrid search không đủ tin cậy, chuyển sang PageIndex: LLM duyệt cây mục lục tài liệu thay vì so khớp vector.`
        : `Với ngưỡng ${threshold.toFixed(
            3,
          )}, truy vấn này cũng sẽ rơi vào nhánh PageIndex. Lần chạy thật dùng ngưỡng ${PIPELINE_CONFIG.fallbackThreshold} nên nhánh này bị bỏ qua, vì vậy không có cây mục lục để hiển thị.`
      : run.usedFallback
        ? `Với ngưỡng ${threshold.toFixed(3)}, điểm cosine ${formatScore(
            run.topCosine,
          )} đã được coi là đủ tốt — pipeline sẽ giữ kết quả hybrid dù chunk top-1 thật ra không trả lời được câu hỏi. Hạ ngưỡng quá tay là cách nhanh nhất để tắt nhầm nhánh fallback.`
        : `Điểm cosine gốc của top-1 là ${formatScore(
            run.topCosine,
          )} ≥ ${threshold.toFixed(3)} → giữ kết quả hybrid, không cần PageIndex.`,
    treeNodes: cosineTriggered ? (run.fallbackDetail?.treeNodes ?? []) : [],
  };

  return (
    <div className="space-y-4">
      {/* Thanh trượt */}
      <div className="rounded-xl border border-border bg-surface-2 px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="fallback-threshold"
            className="text-[13px] font-medium text-fg"
          >
            Ngưỡng kích hoạt fallback
          </label>
          <div className="flex items-center gap-2">
            <output
              htmlFor="fallback-threshold"
              className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-fg"
            >
              {threshold.toFixed(3)}
            </output>
            <button
              type="button"
              onClick={() => onThreshold(PIPELINE_CONFIG.fallbackThreshold)}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-fg-muted transition hover:bg-surface-3 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <RotateCcw className="size-3" aria-hidden />
              Về {PIPELINE_CONFIG.fallbackThreshold}
            </button>
          </div>
        </div>

        <input
          id="fallback-threshold"
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={threshold}
          onChange={(e) => onThreshold(Number(e.target.value))}
          className="mt-2.5 w-full cursor-pointer accent-accent"
        />

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-fg-subtle">Đặt nhanh:</span>
          {QUICK_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onThreshold(value)}
              aria-pressed={Math.abs(threshold - value) < 1e-9}
              className={cn(
                "rounded-md border px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                Math.abs(threshold - value) < 1e-9
                  ? "border-accent/40 bg-accent-soft text-accent"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-3 hover:text-fg",
              )}
            >
              {value.toFixed(3)}
              {value === PIPELINE_CONFIG.fallbackThreshold ? " (mặc định)" : ""}
            </button>
          ))}
        </div>

        <ThresholdScale
          threshold={threshold}
          cosine={run.topCosine}
          rrf={run.topRrf}
        />
      </div>

      {/* Hai con số song song */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ScoreCard
          kind="correct"
          label="Điểm cosine gốc của top-1"
          value={run.topCosine}
          formula={`${topChunkId} · bước Semantic Search`}
          hint="Thang thật trong [0, 1], phản ánh khoảng cách ngữ nghĩa giữa câu hỏi và chunk. Đây là con số pipeline thật đem so với ngưỡng."
          threshold={threshold}
        >
          <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">
            {cosineTriggered
              ? "Ngưỡng hiện tại coi truy vấn này là không đủ tin cậy → PageIndex vào cuộc."
              : "Ngưỡng hiện tại coi kết quả hybrid là đủ tin cậy → bỏ qua PageIndex."}
          </p>
        </ScoreCard>

        <ScoreCard
          kind="wrong"
          label="Điểm RRF của top-1 sau fuse"
          value={run.topRrf}
          formula={
            topMerge
              ? [
                  topMerge.denseRank
                    ? `1/(${run.rrfK}+${topMerge.denseRank})`
                    : null,
                  topMerge.sparseRank
                    ? `1/(${run.rrfK}+${topMerge.sparseRank})`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" + ")
              : "—"
          }
          hint="Chỉ phụ thuộc thứ hạng nên luôn nằm quanh 0.016–0.033 bất kể chunk có liên quan hay không."
          threshold={threshold}
        >
          <p
            className={cn(
              "mt-2 rounded-lg px-2 py-1.5 text-[11px] leading-relaxed",
              rrfRegime.tone === "danger"
                ? "bg-danger-soft text-danger"
                : "bg-warn-soft text-warn",
            )}
          >
            {rrfRegime.text}
          </p>
        </ScoreCard>
      </div>

      {/* Cùng một ngưỡng, toàn bộ truy vấn mẫu */}
      <div className="space-y-2">
        <h3 className="text-[13px] font-semibold text-fg">
          Cùng ngưỡng {threshold.toFixed(3)}, {runs.length} truy vấn mẫu cho phán
          quyết thế nào
        </h3>
        <CrossQueryTable runs={runs} currentId={run.id} threshold={threshold} />
        <p className="text-[11px] leading-relaxed text-fg-subtle">
          Cột &ldquo;theo cosine&rdquo; ít nhất còn phân biệt được các dòng với
          nhau. Cột &ldquo;theo RRF&rdquo; cho ra{" "}
          <strong className="text-fg-muted">cùng một phán quyết ở mọi dòng</strong> —
          đó chính là lý do không được lấy điểm RRF làm ngưỡng.
          {rrfTriggered
            ? ` Ở ngưỡng này, RRF bắt cả ${runs.length} truy vấn chạy PageIndex.`
            : " Ở ngưỡng này, RRF không bắt truy vấn nào chạy PageIndex, kể cả câu hỏi về phở bò."}
        </p>
        <p className="text-[11px] leading-relaxed text-fg-subtle">
          Nhưng cosine cũng không phải căn cứ hoàn hảo: câu &ldquo;Shopee có chính
          sách đổi trả vé máy bay và tour du lịch không?&rdquo; đạt{" "}
          <strong className="text-fg-muted">0.638</strong> — ngoài phạm vi kho tri
          thức mà vẫn nằm trên ngưỡng mặc định, nên không kích hoạt fallback. Cụm
          &ldquo;chính sách đổi trả&rdquo; đủ để kéo vector về đúng Chính sách Trả
          hàng/Hoàn tiền. Một ngưỡng cosine đơn lẻ chỉ chặn được câu hỏi lạc đề{" "}
          <em>về mặt từ ngữ</em>, không chặn được câu hỏi mà kho không có đáp án.
        </p>
      </div>

      {/* Tái dùng khối chi tiết bước fallback của trang Chat */}
      <Collapsible
        className="rounded-xl border border-border bg-surface"
        triggerClassName="px-3 py-2 rounded-xl hover:bg-surface-2 transition"
        panelClassName="border-t border-border p-3"
        summary={
          <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-fg-muted">
            Nhánh PageIndex Vectorless ở ngưỡng {threshold.toFixed(3)}
            <VerdictBadge triggered={cosineTriggered} />
          </span>
        }
      >
        <StepDetails detail={derivedFallback} />
      </Collapsible>
    </div>
  );
}
