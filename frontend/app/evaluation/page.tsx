import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/evaluation/common";
import { ConfigComparison } from "@/components/evaluation/ConfigComparison";
import { FallbackQueries } from "@/components/evaluation/FallbackQueries";
import { GoldenDataset } from "@/components/evaluation/GoldenDataset";
import { MetricOverview } from "@/components/evaluation/MetricOverview";
import { RunSummary } from "@/components/evaluation/RunSummary";
import { WorstPerformers } from "@/components/evaluation/WorstPerformers";
import {
  EVALUATION_RUN,
  GOLDEN_PASSED,
  GOLDEN_TOTAL,
  PIPELINE_CONFIG,
  PRIMARY_CONFIG,
  RETRIEVAL_CONFIGS,
} from "@/lib/mock";

export const metadata = {
  title: "Đánh giá · VinUniversity RAG Lab",
};

export default function EvaluationPage() {
  return (
    <AppShell sidebarSlot={<RunSummary />}>
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <PageHeader
          eyebrow="Đánh giá"
          title="Đánh giá pipeline RAG"
          description={`Bộ ${GOLDEN_TOTAL} cặp Q&A về chính sách Shopee chạy qua ${RETRIEVAL_CONFIGS.length} cấu hình truy xuất, chấm bằng RAGAS với ngưỡng đạt 0.70. Trang này gồm bốn chỉ số tổng quan, bảng so sánh A/B, toàn bộ golden dataset và phân tích ca tệ nhất.`}
          actions={
            <>
              <Badge tone="accent" mono>
                {PRIMARY_CONFIG.label}
              </Badge>
              <Badge tone={GOLDEN_PASSED / GOLDEN_TOTAL >= 0.7 ? "ok" : "warn"} mono>
                {GOLDEN_PASSED}/{GOLDEN_TOTAL} câu đạt
              </Badge>
              <Badge tone="neutral" mono>
                {EVALUATION_RUN.ranAt}
              </Badge>
            </>
          }
        />

        <div className="mt-8 space-y-10">
          <Section
            index="01"
            title="Bốn chỉ số RAGAS"
            description="Điểm trung bình của cấu hình chính trên toàn bộ golden dataset. Thẻ chuyển sang màu cảnh báo khi chỉ số rơi dưới ngưỡng đạt."
          >
            <MetricOverview />
          </Section>

          <Section
            index="02"
            title="So sánh A/B giữa các cấu hình truy xuất"
            description="Bốn cấu hình chạy trên đúng cùng một bộ câu hỏi, chỉ khác tầng truy xuất — nhờ vậy chênh lệch điểm phản ánh đúng đóng góp của từng tầng."
          >
            <ConfigComparison />
          </Section>

          <Section
            index="03"
            title="Golden dataset"
            description="Câu hỏi thật về chính sách Shopee Việt Nam. Mỗi dòng ghi tài liệu kỳ vọng, tài liệu thực tế truy xuất và điểm bốn chỉ số; mở rộng để đối chiếu câu trả lời sinh ra với chunk đã dùng."
          >
            <GoldenDataset />
          </Section>

          <Section
            index="04"
            title="Phân tích ba ca tệ nhất"
            description="Mỗi ca được quy về một bước hỏng cụ thể (retrieval hay generation) kèm nguyên nhân gốc, thay vì chỉ ghi nhận điểm thấp."
          >
            <WorstPerformers />
          </Section>

          <Section
            index="05"
            title="Truy vấn kích hoạt PageIndex fallback"
            description={`Khi cosine gốc của chunk top-1 rơi dưới ${PIPELINE_CONFIG.fallbackThreshold.toFixed(2)}, pipeline bỏ vector và để LLM duyệt cây mục lục tài liệu.`}
          >
            <FallbackQueries />
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
