import { AppShell } from "@/components/AppShell";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Truy xuất · VinUniversity RAG Lab",
};

/** PLACEHOLDER — wave 2 thay nội dung bên trong <AppShell> bằng trang thật. */
export default function RetrievalPage() {
  return (
    <AppShell>
      <PlaceholderPage
        eyebrow="Wave 2"
        title="Thử nghiệm truy xuất"
        description="So sánh trực tiếp Semantic / BM25 / RRF / Rerank trên cùng một truy vấn, và quan sát ngưỡng kích hoạt PageIndex fallback."
        plannedSections={[
          "Ô nhập truy vấn + nút chạy thử, kết quả lấy từ MOCK_ANSWERS trong lib/mock/answers.ts",
          "Bốn cột song song: kết quả dense, sparse, sau RRF, sau rerank — có thể tái dùng component StepDetails trong components/chat/StepDetails.tsx",
          "Thanh trượt đổi ngưỡng fallback để thấy khi nào PageIndex được kích hoạt (mặc định 0.48)",
          "Bảng so sánh độ trễ từng bước — dữ liệu durationMs có sẵn trong mỗi PipelineStep",
        ]}
      />
    </AppShell>
  );
}
