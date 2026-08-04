import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/evaluation/common";
import { ConfigComparison } from "@/components/evaluation/ConfigComparison";
import { EvaluationLive } from "@/components/evaluation/EvaluationLive";
import { FallbackQueries } from "@/components/evaluation/FallbackQueries";
import { GoldenDataset } from "@/components/evaluation/GoldenDataset";
import { MetricOverview } from "@/components/evaluation/MetricOverview";
import { RunSummary } from "@/components/evaluation/RunSummary";
import { WorstPerformers } from "@/components/evaluation/WorstPerformers";
import { PIPELINE_CONFIG } from "@/lib/mock";

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
          description="Kết quả chấm bằng RAGAS với ngưỡng đạt 0.70. Khối đầu trang là số đo thật lấy từ backend; các khối bên dưới là bộ số minh hoạ cho những chiều mà API chưa trả."
          actions={
            <Badge tone="neutral" mono>
              RAGAS
            </Badge>
          }
        />

        {/* Số ĐO THẬT từ GET /api/evaluation. Đặt trên cùng vì đây mới là kết quả
            chạy trên pipeline thật; các khối bên dưới là bộ số minh hoạ. */}
        <div className="mt-6">
          <EvaluationLive />
        </div>

        <div className="mt-8 rounded-xl border border-warn/30 bg-warn-soft px-3 py-2.5">
          <p className="text-[13px] font-semibold text-warn">
            Các khối bên dưới là dữ liệu minh hoạ, không phải số đo
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
            Kết quả thật nằm ở khối phía trên. Phần dưới đây giữ bộ số mẫu trong{" "}
            <code className="font-mono">lib/mock</code> vì nó minh hoạ những chiều mà{" "}
            <code className="font-mono">/api/evaluation</code> không trả: biểu đồ bốn
            cấu hình truy xuất, điểm từng câu trong golden dataset, và danh sách truy
            vấn kích hoạt PageIndex fallback.
          </p>
        </div>

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
