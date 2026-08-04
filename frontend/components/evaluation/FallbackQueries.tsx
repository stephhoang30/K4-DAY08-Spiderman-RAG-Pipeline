import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import {
  FALLBACK_QUERIES,
  GOLDEN_TOTAL,
  PIPELINE_CONFIG,
} from "@/lib/mock";
import { formatScore } from "@/lib/utils";

const THRESHOLD = PIPELINE_CONFIG.fallbackThreshold;

/**
 * Danh sách truy vấn có cosine gốc top-1 < ngưỡng nên rơi sang nhánh
 * PageIndex Vectorless. Điểm so ngưỡng luôn là cosine gốc, không phải điểm RRF.
 */
export function FallbackQueries() {
  const fromGolden = FALLBACK_QUERIES.filter((q) => q.caseId).length;
  const resolved = FALLBACK_QUERIES.filter((q) => q.resolved).length;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader
          title={`${FALLBACK_QUERIES.length} truy vấn kích hoạt PageIndex`}
          description={`Điều kiện kích hoạt: cosine gốc của chunk top-1 < ${THRESHOLD.toFixed(2)}.`}
          action={
            <Badge tone="warn" mono>
              {resolved}/{FALLBACK_QUERIES.length} trả lời được
            </Badge>
          }
        />

        <div className="overflow-x-auto scrollbar-slim">
          <table className="w-full min-w-[54rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-fg-subtle">
                <th className="px-4 py-2 font-medium">Truy vấn</th>
                <th className="px-3 py-2 font-medium">Cosine top-1</th>
                <th className="px-3 py-2 font-medium">Vì sao dưới ngưỡng</th>
                <th className="px-4 py-2 font-medium">Kết quả sau PageIndex</th>
              </tr>
            </thead>
            <tbody>
              {FALLBACK_QUERIES.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/60 align-top last:border-0"
                >
                  <td className="max-w-[20rem] px-4 py-2.5">
                    <p className="text-xs font-medium leading-relaxed text-fg">
                      {item.query}
                    </p>
                    {item.caseId ? (
                      <span className="mt-1 inline-flex">
                        <Badge tone="accent" mono>
                          golden {item.caseId}
                        </Badge>
                      </span>
                    ) : (
                      <span className="mt-1 block text-[11px] text-fg-subtle">
                        từ nhật ký chat
                      </span>
                    )}
                  </td>

                  <td className="w-[11rem] px-3 py-2.5">
                    <ScoreBar
                      value={item.topCosine}
                      label={formatScore(item.topCosine)}
                      tone="warn"
                      width="w-16"
                    />
                    <p className="mt-1 font-mono text-[10px] tabular-nums text-fg-subtle">
                      {formatScore(item.topCosine)} &lt; {THRESHOLD.toFixed(2)}
                    </p>
                  </td>

                  <td className="max-w-[22rem] px-3 py-2.5">
                    <p className="text-[12px] leading-relaxed text-fg-muted">
                      {item.reason}
                    </p>
                  </td>

                  <td className="max-w-[22rem] px-4 py-2.5">
                    <div className="mb-1">
                      <Badge tone={item.resolved ? "ok" : "danger"}>
                        {item.resolved ? "Trả lời được" : "Vẫn thiếu đáp án"}
                      </Badge>
                    </div>
                    <p className="text-[12px] leading-relaxed text-fg-muted">
                      {item.outcome}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] leading-relaxed text-fg-subtle">
        {fromGolden}/{GOLDEN_TOTAL} câu trong golden dataset rơi vào nhánh này;{" "}
        {FALLBACK_QUERIES.length - fromGolden} truy vấn còn lại lấy từ nhật ký chat
        thật để kiểm tra hành vi ngoài phạm vi kho tri thức. Nhánh fallback giữ cho
        hệ thống trả lời an toàn khi hybrid search không tìm được đoạn đủ liên quan,
        nhưng nó dừng ở mức mục nên vẫn không cứu được ca chunk bị cắt hỏng như G08.
      </p>
    </div>
  );
}
