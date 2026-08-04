import type { DocFileStats, KnowledgeDoc } from "@/lib/types";

/**
 * Knowledge base của bài lab: 5 văn bản chính sách (PDF) + 8 bài hướng dẫn (JSON).
 * Tên file khớp đúng với `src/task1_collect_legal_docs.py` và `src/task2_crawl_news.py`.
 */
export const DOCUMENTS: KnowledgeDoc[] = [
  {
    id: "legal_return_refund",
    title: "Chính sách Trả hàng và Hoàn tiền",
    fileName: "chinh-sach-tra-hang-hoan-tien-shopee.pdf",
    type: "legal",
    url: "https://help.shopee.vn/portal/4/article/77251",
    topic: "return_refund",
    customerRole: "buyer",
    citation: "Chính sách trả hàng và hoàn tiền, 2026",
    chunkCount: 28,
    tokenCount: 5_220,
    crawledAt: "2026-08-04",
    summary:
      "Điều kiện, thời hạn và quy trình yêu cầu Trả hàng/Hoàn tiền trên Shopee Việt Nam.",
  },
  {
    id: "legal_privacy",
    title: "Chính sách Bảo mật",
    fileName: "chinh-sach-bao-mat-shopee.pdf",
    type: "legal",
    url: "https://help.shopee.vn/portal/4/article/77244",
    topic: "privacy",
    customerRole: "both",
    citation: "Chính sách bảo mật, 2026",
    chunkCount: 60,
    tokenCount: 11_312,
    crawledAt: "2026-08-04",
    summary:
      "Cách Shopee thu thập, sử dụng, chia sẻ và lưu trữ dữ liệu cá nhân của người dùng.",
  },
  {
    id: "legal_listing_rules",
    title: "Quy định Đăng bán Sản phẩm",
    fileName: "quy-dinh-dang-ban-san-pham-shopee.pdf",
    type: "legal",
    url: "https://help.shopee.vn/portal/4/article/77246",
    topic: "seller_listing",
    customerRole: "seller",
    citation: "Quy định đăng bán sản phẩm, 2026",
    chunkCount: 30,
    tokenCount: 5_922,
    crawledAt: "2026-08-04",
    summary:
      "Yêu cầu về tên, hình ảnh, mô tả, phân loại sản phẩm và các hành vi bị cấm khi đăng bán.",
  },
  {
    id: "legal_prohibited",
    title: "Danh mục Sản phẩm Cấm và Hạn chế",
    fileName: "chinh-sach-cam-han-che-san-pham-shopee.pdf",
    type: "legal",
    url: "https://help.shopee.vn/portal/4/article/77247",
    topic: "prohibited_items",
    customerRole: "seller",
    citation: "Chính sách sản phẩm cấm và hạn chế, 2026",
    chunkCount: 18,
    tokenCount: 3_810,
    crawledAt: "2026-08-04",
    summary:
      "Danh sách nhóm hàng hoá bị cấm hoàn toàn và nhóm bị hạn chế cần giấy phép khi đăng bán.",
  },
  {
    id: "legal_shipping",
    title: "Chính sách Vận chuyển",
    fileName: "chinh-sach-van-chuyen-shopee.pdf",
    type: "legal",
    url: "https://help.shopee.vn/portal/4/article/77250",
    topic: "shipping",
    customerRole: "both",
    citation: "Chính sách vận chuyển, 2026",
    chunkCount: 35,
    tokenCount: 6_648,
    crawledAt: "2026-08-04",
    summary:
      "Đơn vị vận chuyển, thời gian giao dự kiến, phí ship và xử lý đơn thất lạc/hư hỏng.",
  },

  // ---- News / hướng dẫn hỗ trợ khách hàng ----
  {
    id: "news_payment_methods",
    title: "Các phương thức thanh toán trên Shopee",
    fileName: "article_01_phuong-thuc-thanh-toan.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79198",
    topic: "payment",
    customerRole: "buyer",
    citation: "Hướng dẫn phương thức thanh toán, 2026",
    chunkCount: 12,
    tokenCount: 1_658,
    crawledAt: "2026-08-04",
    summary:
      "Liệt kê toàn bộ phương thức thanh toán Shopee hỗ trợ và điều kiện áp dụng từng loại.",
  },
  {
    id: "news_qr_payment",
    title: "Thanh toán bằng mã QR",
    fileName: "article_02_thanh-toan-qr.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79537",
    topic: "payment",
    customerRole: "buyer",
    citation: "Hướng dẫn thanh toán QR, 2026",
    chunkCount: 3,
    tokenCount: 490,
    crawledAt: "2026-08-04",
    summary: "Các bước quét mã QR để thanh toán đơn hàng qua ứng dụng ngân hàng.",
  },
  {
    id: "news_order_tracking",
    title: "Theo dõi vận chuyển đơn hàng",
    fileName: "article_03_theo-doi-van-chuyen-don-hang.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79215",
    topic: "order_tracking",
    customerRole: "buyer",
    citation: "Hướng dẫn theo dõi vận chuyển, 2026",
    chunkCount: 2,
    tokenCount: 537,
    crawledAt: "2026-08-04",
    summary: "Cách xem trạng thái, mã vận đơn và lịch sử di chuyển của đơn hàng.",
  },
  {
    id: "news_refund_evidence",
    title: "Bằng chứng cần có khi yêu cầu Trả hàng/Hoàn tiền",
    fileName: "article_04_bang-chung-tra-hang-hoan-tien.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79467",
    topic: "refund_evidence",
    customerRole: "buyer",
    citation: "Hướng dẫn bằng chứng hoàn tiền, 2026",
    chunkCount: 7,
    tokenCount: 1_038,
    crawledAt: "2026-08-04",
    summary:
      "Yêu cầu về ảnh, video mở hộp và tài liệu kèm theo để yêu cầu hoàn tiền được duyệt.",
  },
  {
    id: "news_refund_request",
    title: "Gửi yêu cầu Trả hàng/Hoàn tiền",
    fileName: "article_05_gui-yeu-cau-tra-hang-hoan-tien.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79233",
    topic: "refund_request",
    customerRole: "buyer",
    citation: "Hướng dẫn gửi yêu cầu hoàn tiền, 2026",
    chunkCount: 4,
    tokenCount: 857,
    crawledAt: "2026-08-04",
    summary: "Thao tác từng bước trên ứng dụng Shopee để tạo yêu cầu Trả hàng/Hoàn tiền.",
  },
  {
    id: "news_refund_tracking",
    title: "Theo dõi tiến trình Trả hàng/Hoàn tiền",
    fileName: "article_06_theo-doi-tra-hang-hoan-tien.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79298",
    topic: "refund_tracking",
    customerRole: "buyer",
    citation: "Hướng dẫn theo dõi hoàn tiền, 2026",
    chunkCount: 2,
    tokenCount: 556,
    crawledAt: "2026-08-04",
    summary: "Các trạng thái của yêu cầu hoàn tiền và thời gian xử lý tương ứng.",
  },
  {
    id: "news_refund_restrictions",
    title: "Sản phẩm hạn chế Trả hàng/Hoàn tiền",
    fileName: "article_07_san-pham-han-che-tra-hang.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79465",
    topic: "refund_restrictions",
    customerRole: "both",
    citation: "Hướng dẫn sản phẩm hạn chế trả hàng, 2026",
    chunkCount: 4,
    tokenCount: 735,
    crawledAt: "2026-08-04",
    summary:
      "Nhóm sản phẩm không được trả hoặc chỉ được hoàn tiền trong điều kiện đặc biệt.",
  },
  {
    id: "news_cross_border",
    title: "Theo dõi đơn hàng quốc tế",
    fileName: "article_08_theo-doi-don-hang-quoc-te.json",
    type: "news",
    url: "https://help.shopee.vn/portal/4/article/79470",
    topic: "cross_border",
    customerRole: "buyer",
    citation: "Hướng dẫn theo dõi đơn quốc tế, 2026",
    chunkCount: 1,
    tokenCount: 271,
    crawledAt: "2026-08-04",
    summary:
      "Cách tra cứu đơn hàng từ nước ngoài, các mốc thông quan và thời gian giao dự kiến.",
  },
];

export const DOCUMENTS_BY_ID: Record<string, KnowledgeDoc> = Object.fromEntries(
  DOCUMENTS.map((doc) => [doc.id, doc]),
);

export function getDocument(id: string): KnowledgeDoc | undefined {
  return DOCUMENTS_BY_ID[id];
}

/** Tham số pipeline hiển thị trong UI — khớp với cấu hình trong src/. */
export const PIPELINE_CONFIG = {
  chunkSize: 800,
  chunkOverlap: 100,
  embeddingModel: "BAAI/bge-m3",
  embeddingDim: 1024,
  vectorStore: "ChromaDB",
  // Phải khớp COLLECTION_NAME trong src/task4_chunking_indexing.py
  collection: "ecommerce_support_docs",
  similarity: "cosine",
  lexicalAlgorithm: "BM25 (rank-bm25)",
  bm25K1: 1.5,
  bm25B: 0.75,
  fusionMethod: "Reciprocal Rank Fusion",
  rrfK: 60,
  rerankerModel: "jina-reranker-v2-base-multilingual",
  fallbackThreshold: 0.48,
  fallbackName: "PageIndex Vectorless RAG",
  llmModel: "openai/gpt-4o-mini",
  topK: 5,
} as const;

export const TOTAL_CHUNKS = DOCUMENTS.reduce((sum, d) => sum + d.chunkCount, 0);

// ---------------------------------------------------------------------------
// Thống kê file thật (trang Kho tri thức)
// ---------------------------------------------------------------------------

/**
 * Đối chiếu mỗi tài liệu với file thật trong repo.
 * `charCount` / `bodyCharCount` đo trực tiếp trên `data/standardized/**\/*.md`
 * (13 file, tổng 144.183 ký tự); `landingFile` là file gốc Task 1/Task 2 tải về.
 */
export const DOC_FILE_STATS: DocFileStats[] = [
  {
    docId: "legal_return_refund",
    standardizedFile: "chinh-sach-tra-hang-hoan-tien-shopee.md",
    landingFile: "chinh-sach-tra-hang-hoan-tien-shopee.pdf",
    sourceFormat: "PDF",
    charCount: 19_917,
    bodyCharCount: 19_479,
    sourceTitle: "CHÍNH SÁCH TRẢ HÀNG VÀ HOÀN TIỀN",
  },
  {
    docId: "legal_privacy",
    standardizedFile: "chinh-sach-bao-mat-shopee.md",
    landingFile: "chinh-sach-bao-mat-shopee.pdf",
    sourceFormat: "PDF",
    charCount: 43_572,
    bodyCharCount: 42_911,
    sourceTitle: "CHÍNH SÁCH BẢO MẬT",
  },
  {
    docId: "legal_listing_rules",
    standardizedFile: "quy-dinh-dang-ban-san-pham-shopee.md",
    landingFile: "quy-dinh-dang-ban-san-pham-shopee.pdf",
    sourceFormat: "PDF",
    charCount: 21_847,
    bodyCharCount: 21_352,
    sourceTitle: "QUY ĐỊNH VỀ ĐĂNG BÁN SẢN PHẨM TRÊN SHOPEE",
  },
  {
    docId: "legal_prohibited",
    standardizedFile: "chinh-sach-cam-han-che-san-pham-shopee.md",
    landingFile: "chinh-sach-cam-han-che-san-pham-shopee.pdf",
    sourceFormat: "PDF",
    charCount: 13_109,
    bodyCharCount: 12_722,
    sourceTitle: "CHÍNH SÁCH CẤM/HẠN CHẾ SẢN PHẨM",
  },
  {
    docId: "legal_shipping",
    standardizedFile: "chinh-sach-van-chuyen-shopee.md",
    landingFile: "chinh-sach-van-chuyen-shopee.pdf",
    sourceFormat: "PDF",
    charCount: 24_747,
    bodyCharCount: 24_200,
    sourceTitle: "CHÍNH SÁCH VẬN CHUYỂN SHOPEE",
  },
  {
    docId: "news_payment_methods",
    standardizedFile: "article_01_phuong-thuc-thanh-toan.md",
    landingFile: "article_01_phuong-thuc-thanh-toan.json",
    sourceFormat: "JSON",
    charCount: 6_205,
    bodyCharCount: 5_889,
    sourceTitle:
      "[Thành viên mới] Shopee hiện đang có những phương thức thanh toán nào?",
  },
  {
    docId: "news_qr_payment",
    standardizedFile: "article_02_thanh-toan-qr.md",
    landingFile: "article_02_thanh-toan-qr.json",
    sourceFormat: "JSON",
    charCount: 1_810,
    bodyCharCount: 1_481,
    sourceTitle:
      "[Thanh toán] Làm thế nào để thanh toán bằng phương thức Thanh toán QR",
  },
  {
    docId: "news_order_tracking",
    standardizedFile: "article_03_theo-doi-van-chuyen-don-hang.md",
    landingFile: "article_03_theo-doi-van-chuyen-don-hang.json",
    sourceFormat: "JSON",
    charCount: 1_742,
    bodyCharCount: 1_381,
    sourceTitle:
      "[Thành viên mới] Cách theo dõi tình trạng vận chuyển của đơn hàng?",
  },
  {
    docId: "news_refund_evidence",
    standardizedFile: "article_04_bang-chung-tra-hang-hoan-tien.md",
    landingFile: "article_04_bang-chung-tra-hang-hoan-tien.json",
    sourceFormat: "JSON",
    charCount: 3_655,
    bodyCharCount: 3_315,
    sourceTitle:
      "[Trả hàng/Hoàn tiền] Hướng dẫn chuẩn bị bằng chứng khi yêu cầu Trả hàng/ Hoàn tiền",
  },
  {
    docId: "news_refund_request",
    standardizedFile: "article_05_gui-yeu-cau-tra-hang-hoan-tien.md",
    landingFile: "article_05_gui-yeu-cau-tra-hang-hoan-tien.json",
    sourceFormat: "JSON",
    charCount: 2_797,
    bodyCharCount: 2_417,
    sourceTitle: "[Trả hàng/ Hoàn tiền] Hướng dẫn gửi yêu cầu Trả hàng/ Hoàn tiền",
  },
  {
    docId: "news_refund_tracking",
    standardizedFile: "article_06_theo-doi-tra-hang-hoan-tien.md",
    landingFile: "article_06_theo-doi-tra-hang-hoan-tien.json",
    sourceFormat: "JSON",
    charCount: 1_739,
    bodyCharCount: 1_325,
    sourceTitle:
      "[Trả hàng/ Hoàn tiền] Theo dõi tình trạng Trả hàng/ Hoàn tiền trên Shopee",
  },
  {
    docId: "news_refund_restrictions",
    standardizedFile: "article_07_san-pham-han-che-tra-hang.md",
    landingFile: "article_07_san-pham-han-che-tra-hang.json",
    sourceFormat: "JSON",
    charCount: 2_207,
    bodyCharCount: 1_872,
    sourceTitle: "[Trả hàng/ Hoàn tiền] Sản phẩm hạn chế trả hàng là gì?",
  },
  {
    docId: "news_cross_border",
    standardizedFile: "article_08_theo-doi-don-hang-quoc-te.md",
    landingFile: "article_08_theo-doi-don-hang-quoc-te.json",
    sourceFormat: "JSON",
    charCount: 836,
    bodyCharCount: 507,
    sourceTitle:
      "[Đơn hàng Quốc tế] Hướng dẫn theo dõi hành trình đơn hàng Quốc tế đã đặt trên Shopee?",
  },
];

export const DOC_FILE_STATS_BY_ID: Record<string, DocFileStats> =
  Object.fromEntries(DOC_FILE_STATS.map((stats) => [stats.docId, stats]));

export function getDocFileStats(docId: string): DocFileStats | undefined {
  return DOC_FILE_STATS_BY_ID[docId];
}

export const TOTAL_TOKENS = DOCUMENTS.reduce((sum, d) => sum + d.tokenCount, 0);

export const TOTAL_CHARS = DOC_FILE_STATS.reduce((sum, s) => sum + s.charCount, 0);

/** Nguồn dữ liệu chung của bài lab, hiển thị ở sơ đồ luồng. */
export const CORPUS_SOURCE = "help.shopee.vn";
