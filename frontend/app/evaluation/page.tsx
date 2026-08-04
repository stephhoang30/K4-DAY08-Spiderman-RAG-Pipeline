import { AppShell } from "@/components/AppShell";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Đánh giá · VinUniversity RAG Lab",
};

/** PLACEHOLDER — wave 2 thay nội dung bên trong <AppShell> bằng trang thật. */
export default function EvaluationPage() {
  return (
    <AppShell>
      <PlaceholderPage
        eyebrow="Wave 2"
        title="Đánh giá pipeline"
        description="Kết quả chạy golden dataset: Recall@k, MRR, Hit Rate, tỷ lệ kích hoạt fallback và độ trễ trung bình từng bước."
        plannedSections={[
          "Hàng thẻ chỉ số tổng quan — dùng lại StatTile trong components/ui/Card.tsx",
          "Bảng golden dataset: câu hỏi, chunk kỳ vọng, chunk truy xuất được, đạt/không đạt",
          "Biểu đồ so sánh semantic-only / BM25-only / hybrid / hybrid + rerank",
          "Danh sách các truy vấn kích hoạt PageIndex fallback kèm điểm cosine cao nhất",
        ]}
      />
    </AppShell>
  );
}
