"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FlaskConical, Target } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, StatTile } from "@/components/ui/Card";
import { Collapsible } from "@/components/ui/Collapsible";
import { DataSourceBadge, LoadingNote, Skeleton } from "@/components/ui/DataSource";
import { Markdown } from "@/components/chat/Markdown";
import { loadEvaluation, type DataSource } from "@/lib/data";
import type { ApiEvaluationResponse } from "@/lib/api";

const THRESHOLD = 0.7;
/**
 * RAGAS chấm 0.000 chằn khi bộ phân loại "noncommittal" của nó cho rằng câu trả lời
 * né tránh. Với tiếng Việt, câu phủ định đúng ("KHÔNG áp dụng cho...") và câu ngắn
 * gọn hay bị nhận nhầm — xem mục cảnh báo trong results.md.
 */
const ZERO_EPS = 0.01;

const METRICS = [
  ["faithfulness", "Faithfulness", "Câu trả lời có bám đúng chunk đã lấy không"],
  ["answer_relevancy", "Answer Relevance", "Câu trả lời có đúng trọng tâm câu hỏi không"],
  ["context_recall", "Context Recall", "Chunk chứa đáp án có lọt top-k không"],
  ["context_precision", "Context Precision", "Bao nhiêu % chunk lấy về thực sự hữu ích"],
] as const;

type MetricKey = (typeof METRICS)[number][0];

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : v.toFixed(3);

export function EvaluationLive() {
  const [data, setData] = useState<ApiEvaluationResponse | null>(null);
  const [source, setSource] = useState<DataSource>("mock");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadEvaluation().then((res) => {
      if (!alive) return;
      setData(res.data);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Kết quả đo thật" />
        <LoadingNote label="Đang tải kết quả evaluation từ backend…" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </Card>
    );
  }

  // Backend tắt — nói thẳng, đừng hiện số mock ở khối vốn dành cho số thật.
  if (source === "mock" || !data) {
    return (
      <Card>
        <CardHeader
          title="Kết quả đo thật"
          action={<DataSourceBadge source="mock" title="Không kết nối được backend" />}
        />
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          Không gọi được <code className="font-mono">GET /api/evaluation</code>. Bật
          backend rồi tải lại trang:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 text-[12px]">
          <code>.venv/bin/uvicorn api.main:app --port 8001</code>
        </pre>
      </Card>
    );
  }

  // Endpoint sống nhưng chưa ai chạy eval — trả về lý do cụ thể, không phải lỗi.
  if (!data.has_results) {
    return (
      <Card>
        <CardHeader
          title="Kết quả đo thật"
          action={<DataSourceBadge source="live" />}
        />
        <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
          {data.blocked_reason ?? "Chưa có kết quả evaluation."}
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 text-[12px]">
          <code>python -m group_project.evaluation.eval_pipeline</code>
        </pre>
        <p className="mt-3 text-[12px] text-fg-muted">
          Golden dataset đã sẵn sàng: {data.golden_total}/{data.golden_required} câu.
        </p>
      </Card>
    );
  }

  const base =
    data.configs.find((c) => c.config === data.baseline_config) ?? data.configs[0];
  const other = data.configs.find((c) => c !== base);

  // Tách các ca RAGAS chấm 0.000 chằn ra khỏi ca kém thật, rồi tính lại trung bình.
  const zeros = data.worst_cases.filter(
    (c) => (c.answer_relevancy ?? 1) < ZERO_EPS,
  );
  const relAdjusted =
    zeros.length > 0 && base?.answer_relevancy != null
      ? // Suy ngược từ trung bình đã báo: loại n ca bằng 0 khỏi tổng.
        (base.answer_relevancy * data.golden_total) /
        (data.golden_total - zeros.length)
      : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Kết quả đo thật"
          description={`RAGAS · ${data.golden_total} câu golden · ${data.configs.length} cấu hình · ngưỡng đạt ${THRESHOLD}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <DataSourceBadge source="live" />
              <Badge tone="accent" mono>
                {base?.config}
              </Badge>
            </div>
          }
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(([key, label, hint]) => {
            const v = base?.[key as MetricKey] ?? null;
            const pass = (v ?? 0) >= THRESHOLD;
            const adjusted =
              key === "answer_relevancy" && relAdjusted !== null ? relAdjusted : null;
            return (
              <StatTile
                key={key}
                label={label}
                value={
                  <span className={pass ? "text-ok" : "text-warn"}>{fmt(v)}</span>
                }
                hint={
                  adjusted !== null
                    ? `${fmt(adjusted)} sau khi loại ${zeros.length} ca RAGAS chấm sai`
                    : hint
                }
                icon={<Target className="size-4" />}
              />
            );
          })}
        </div>
      </Card>

      {zeros.length > 0 && (
        <Card className="border-warn/30 bg-warn-soft">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
            <div>
              <p className="text-[13px] font-semibold text-warn">
                RAGAS chấm sai {zeros.length} câu
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
                {zeros.length} câu bị chấm{" "}
                <code className="font-mono">answer_relevancy = 0.000</code> chằn trong
                khi ba chỉ số còn lại đều <strong>1.000</strong> — mâu thuẫn. Đọc lại
                thì câu trả lời hoàn toàn đúng. Thủ phạm là bộ phân loại
                &ldquo;noncommittal&rdquo; của RAGAS: nó chấm 0 khi tưởng câu trả lời
                né tránh, và câu phủ định tiếng Việt hay bị nhận nhầm.
              </p>
              {relAdjusted !== null && (
                <p className="mt-1.5 text-[12px] text-fg-muted">
                  Answer Relevance thật là{" "}
                  <strong className="text-fg">{fmt(relAdjusted)}</strong>, không phải{" "}
                  {fmt(base?.answer_relevancy)}.
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {zeros.map((c) => (
                  <li key={c.question} className="text-[12px] text-fg-muted">
                    · {c.question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {other && (
        <Card>
          <CardHeader
            title="So sánh A/B"
            description="Cùng bộ câu hỏi, chỉ khác số chunk đưa vào prompt"
          />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-fg-muted">
                  <th className="pb-2 pr-3 font-medium">Metric</th>
                  <th className="pb-2 pr-3 font-medium">{base?.config}</th>
                  <th className="pb-2 pr-3 font-medium">{other.config}</th>
                  <th className="pb-2 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(([key, label]) => {
                  const a = base?.[key as MetricKey] ?? null;
                  const b = other[key as MetricKey] ?? null;
                  const d = a !== null && b !== null ? a - b : null;
                  return (
                    <tr key={key} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-3">{label}</td>
                      <td className="py-2 pr-3 font-mono">{fmt(a)}</td>
                      <td className="py-2 pr-3 font-mono text-fg-muted">{fmt(b)}</td>
                      <td
                        className={`py-2 font-mono ${
                          d === null || Math.abs(d) < 0.0005
                            ? "text-fg-muted"
                            : d > 0
                              ? "text-ok"
                              : "text-warn"
                        }`}
                      >
                        {d === null
                          ? "—"
                          : Math.abs(d) < 0.0005
                            ? "0.000"
                            : `${d > 0 ? "+" : ""}${d.toFixed(3)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data.worst_cases.length > 0 && (
        <Card>
          <CardHeader
            title={`${data.worst_cases.length} câu yếu nhất`}
            description="Chỉ số thấp nhất của mỗi câu, đo trên cấu hình chính"
          />
          <ul className="mt-3 space-y-2.5">
            {data.worst_cases.map((c) => (
              <li key={c.question} className="rounded-lg bg-surface-2 px-3 py-2.5">
                <p className="text-[13px] text-fg">{c.question}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-fg-muted">
                  <span>faith {fmt(c.faithfulness)}</span>
                  <span>rel {fmt(c.answer_relevancy)}</span>
                  <span>recall {fmt(c.context_recall)}</span>
                  <span>prec {fmt(c.context_precision)}</span>
                  {c.weakest_metric && (
                    <Badge tone="warn" mono>
                      yếu nhất: {c.weakest_metric}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.results_md && (
        <Card>
          <Collapsible
            summary={(open) => (
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <FlaskConical className="size-4 text-fg-muted" />
                Báo cáo đầy đủ — phân tích tầng lỗi và đề xuất cải tiến
                <span className="text-[12px] font-normal text-fg-muted">
                  {open ? "thu lại" : "mở ra"}
                </span>
              </span>
            )}
          >
            <div className="prose-sm max-w-none">
              <Markdown content={data.results_md} />
            </div>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}
