import { AppShell } from "@/components/AppShell";
import { PlaceholderPage } from "@/components/ui/PlaceholderPage";

export const metadata = {
  title: "Kho tri thức · VinUniversity RAG Lab",
};

/** PLACEHOLDER — wave 2 thay nội dung bên trong <AppShell> bằng trang thật. */
export default function KnowledgePage() {
  return (
    <AppShell>
      <PlaceholderPage
        eyebrow="Wave 2"
        title="Kho tri thức"
        description="Danh sách 13 tài liệu nguồn (5 PDF chính sách + 8 bài hướng dẫn) và các chunk đã lập chỉ mục trong ChromaDB."
        plannedSections={[
          "Bảng tài liệu: tên file, loại (legal/news), chủ đề, số chunk, số token, ngày crawl — dữ liệu có sẵn ở DOCUMENTS trong lib/mock/documents.ts",
          "Bộ lọc theo loại tài liệu và theo vai trò khách hàng (buyer / seller / both)",
          "Trình duyệt chunk: nội dung đầy đủ, mục, số token — dữ liệu ở CHUNKS trong lib/mock/chunks.ts",
          "Thẻ tổng quan cấu hình chunking và embedding — PIPELINE_CONFIG trong lib/mock/documents.ts",
        ]}
      />
    </AppShell>
  );
}
