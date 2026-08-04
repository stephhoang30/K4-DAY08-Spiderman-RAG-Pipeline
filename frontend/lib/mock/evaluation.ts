import type {
  EvalImprovement,
  EvaluationRunMeta,
  FallbackQueryRecord,
  GoldenCase,
  RagasMetricId,
  RagasMetricSummary,
  RagasScores,
  RetrievalConfigResult,
  WorstCaseAnalysis,
} from "@/lib/types";
import { PIPELINE_CONFIG } from "./documents";

/**
 * Kết quả đánh giá pipeline (Task 11 + 12 của bài lab) — toàn bộ là mock.
 *
 * Nguyên tắc dựng số liệu:
 * - `GOLDEN_CASES` là nguồn sự thật duy nhất. Điểm tổng hợp của config chính
 *   (`hybrid_rerank`) được TÍNH từ 15 ca này chứ không gõ tay, nên bảng A/B,
 *   hàng thẻ RAGAS và bảng golden dataset luôn khớp nhau.
 * - Ba config còn lại là số đo của các lần chạy trước, gõ cố định.
 */

/** Ngưỡng đạt của bài lab, áp cho cả bốn chỉ số RAGAS. */
export const RAGAS_THRESHOLD = 0.7;

export const METRIC_IDS = [
  "faithfulness",
  "answerRelevance",
  "contextRecall",
  "contextPrecision",
] as const satisfies ReadonlyArray<RagasMetricId>;

export const METRIC_META: Record<
  RagasMetricId,
  { label: string; labelVi: string; short: string; description: string }
> = {
  faithfulness: {
    label: "Faithfulness",
    labelVi: "Độ trung thực",
    short: "Faith.",
    description:
      "Mọi khẳng định trong câu trả lời có truy ngược được về chunk đã lấy không.",
  },
  answerRelevance: {
    label: "Answer Relevance",
    labelVi: "Độ liên quan câu trả lời",
    short: "Ans. Rel.",
    description: "Câu trả lời có đúng trọng tâm câu hỏi, không lan man.",
  },
  contextRecall: {
    label: "Context Recall",
    labelVi: "Độ bao phủ ngữ cảnh",
    short: "Ctx. Rec.",
    description: "Chunk chứa đáp án chuẩn có nằm trong top-k truy xuất không.",
  },
  contextPrecision: {
    label: "Context Precision",
    labelVi: "Độ tinh khiết ngữ cảnh",
    short: "Ctx. Prec.",
    description: "Tỉ lệ chunk thực sự liên quan trên tổng số chunk đưa vào prompt.",
  },
};

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Điểm trung bình bốn chỉ số của một ca — dùng để xếp hạng ca tệ nhất. */
export function overallScore(scores: RagasScores): number {
  return round3(
    METRIC_IDS.reduce((sum, id) => sum + scores[id], 0) / METRIC_IDS.length,
  );
}

function averageScores(cases: GoldenCase[]): RagasScores {
  return Object.fromEntries(
    METRIC_IDS.map((id) => [
      id,
      round3(cases.reduce((sum, c) => sum + c.scores[id], 0) / cases.length),
    ]),
  ) as RagasScores;
}

// ---------------------------------------------------------------------------
// 1. Golden dataset — 15 cặp Q&A chấm bằng config chính (hybrid + rerank)
// ---------------------------------------------------------------------------

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: "G01",
    question:
      "Tôi có bao nhiêu ngày để gửi yêu cầu Trả hàng/Hoàn tiền sau khi nhận hàng?",
    category: "Trả hàng & hoàn tiền",
    expectedDocIds: ["legal_return_refund"],
    expectedChunkIds: ["chunk_0042"],
    retrievedDocIds: ["legal_return_refund", "news_refund_request"],
    retrievedChunkIds: ["chunk_0042", "chunk_0118", "chunk_0043"],
    scores: {
      faithfulness: 0.96,
      answerRelevance: 0.94,
      contextRecall: 0.96,
      contextPrecision: 0.93,
    },
    passed: true,
    usedFallback: false,
    // Diễn đạt khác câu mẫu ở trang Chat (0.789) nên điểm thấp hơn một chút.
    topCosine: 0.771,
    generatedAnswer: `**Thời hạn là 15 ngày** kể từ khi đơn hàng chuyển sang trạng thái *Giao hàng thành công*. Sau mốc này, nút "Trả hàng/Hoàn tiền" không còn khả dụng và đơn hàng được xem là đã hoàn tất [Chính sách trả hàng và hoàn tiền, 2026].

Riêng sản phẩm có bảo hành chính hãng, bạn vẫn có thể liên hệ Chăm sóc Khách hàng sau 15 ngày nhưng sẽ xử lý theo điều khoản bảo hành của nhà sản xuất.`,
    note: "Chunk chứa đáp án đứng hạng 1 ở cả semantic lẫn BM25. Không có chunk nhiễu trong top-3.",
  },
  {
    id: "G02",
    question: "Mua thực phẩm đông lạnh bị hỏng thì phải báo trong bao lâu?",
    category: "Trả hàng & hoàn tiền",
    expectedDocIds: ["legal_return_refund"],
    expectedChunkIds: ["chunk_0042"],
    retrievedDocIds: ["legal_return_refund"],
    retrievedChunkIds: ["chunk_0042", "chunk_0043"],
    scores: {
      faithfulness: 0.93,
      answerRelevance: 0.91,
      contextRecall: 0.93,
      contextPrecision: 0.87,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.734,
    generatedAnswer: `Với **thực phẩm tươi sống, thực phẩm đông lạnh** và hàng hoá có hạn sử dụng ngắn, thời hạn gửi yêu cầu được rút xuống còn **24 giờ** kể từ khi giao hàng thành công, thay vì 15 ngày như hàng hoá thông thường [Chính sách trả hàng và hoàn tiền, 2026].

Bạn nên quay video mở hộp ngay khi nhận để kịp gửi kèm minh chứng trong khung 24 giờ này.`,
    note: "Truy xuất chính xác. Câu cuối về video mở hộp là suy luận hợp lý nhưng không nằm trong chunk, làm Faithfulness giảm nhẹ.",
  },
  {
    id: "G03",
    question: "Tiền hoàn về thẻ tín dụng mất bao nhiêu ngày?",
    category: "Trả hàng & hoàn tiền",
    expectedDocIds: ["legal_return_refund"],
    expectedChunkIds: ["chunk_0051"],
    retrievedDocIds: ["legal_return_refund", "news_payment_methods"],
    retrievedChunkIds: ["chunk_0051", "chunk_0087"],
    scores: {
      faithfulness: 0.94,
      answerRelevance: 0.89,
      contextRecall: 0.91,
      contextPrecision: 0.85,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.706,
    generatedAnswer: `Khoản hoàn được trả về đúng phương thức thanh toán ban đầu:

| Phương thức | Thời gian nhận tiền |
| --- | --- |
| Ví ShopeePay | trong **24 giờ** |
| Thẻ tín dụng / ghi nợ, tài khoản ngân hàng | **7–14 ngày làm việc** tuỳ ngân hàng phát hành |

Trước đó Shopee cần **2–3 ngày làm việc** để xét duyệt yêu cầu [Chính sách trả hàng và hoàn tiền, 2026].`,
    note: "Chunk danh sách phương thức thanh toán lọt vào top-3 nhưng không cần thiết — Context Precision mất điểm ở đây.",
  },
  {
    id: "G04",
    question: "Shopee hỗ trợ những phương thức thanh toán nào?",
    category: "Thanh toán",
    expectedDocIds: ["news_payment_methods"],
    expectedChunkIds: ["chunk_0087"],
    retrievedDocIds: ["news_payment_methods"],
    retrievedChunkIds: ["chunk_0087", "chunk_0088"],
    scores: {
      faithfulness: 0.97,
      answerRelevance: 0.95,
      contextRecall: 0.97,
      contextPrecision: 0.95,
    },
    passed: true,
    usedFallback: false,
    // Đúng truy vấn mẫu B ở trang Chat/Truy xuất → dùng chung điểm đo thật.
    topCosine: 0.7748,
    generatedAnswer: `Shopee Việt Nam hỗ trợ các phương thức sau [Hướng dẫn phương thức thanh toán, 2026]:

- **Ví ShopeePay** — hoàn tiền về nhanh nhất
- **Thẻ tín dụng / ghi nợ** (Visa, Mastercard, JCB, American Express)
- **Trả góp qua thẻ tín dụng** — kỳ hạn 3, 6, 9 hoặc 12 tháng
- **Thanh toán QR**
- **Chuyển khoản qua ứng dụng ngân hàng**
- **Thẻ nội địa NAPAS**
- **Apple Pay** và **Google Pay**
- **Thanh toán khi nhận hàng (COD)**`,
    note: "Ca tốt nhất trong bộ: câu hỏi khớp gần như nguyên văn tiêu đề mục, cả 4 chỉ số đều trên 0.95.",
  },
  {
    id: "G05",
    question: "Trả góp qua thẻ tín dụng có điều kiện gì?",
    category: "Thanh toán",
    expectedDocIds: ["news_payment_methods"],
    expectedChunkIds: ["chunk_0088"],
    retrievedDocIds: ["news_payment_methods"],
    retrievedChunkIds: ["chunk_0088", "chunk_0087"],
    scores: {
      faithfulness: 0.88,
      answerRelevance: 0.84,
      contextRecall: 0.86,
      contextPrecision: 0.83,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.658,
    generatedAnswer: `Trả góp qua thẻ tín dụng yêu cầu **giá trị đơn hàng đạt mức tối thiểu do ngân hàng phát hành quy định** và chỉ áp dụng với danh sách ngân hàng liên kết. Kỳ hạn hỗ trợ gồm 3, 6, 9 hoặc 12 tháng [Hướng dẫn phương thức thanh toán, 2026].

Danh sách phương thức khả dụng cho từng đơn luôn hiển thị ở bước "Phương thức thanh toán" trước khi đặt hàng.`,
    note: "Tài liệu không nêu con số tối thiểu cụ thể nên câu trả lời buộc phải nói chung chung — Answer Relevance vì thế chỉ ở mức khá.",
  },
  {
    id: "G06",
    question: "Thanh toán bằng mã QR thực hiện thế nào?",
    category: "Thanh toán",
    expectedDocIds: ["news_qr_payment"],
    expectedChunkIds: ["chunk_0094"],
    retrievedDocIds: ["news_qr_payment", "news_payment_methods"],
    retrievedChunkIds: ["chunk_0094", "chunk_0087"],
    scores: {
      faithfulness: 0.92,
      answerRelevance: 0.9,
      contextRecall: 0.92,
      contextPrecision: 0.88,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.723,
    generatedAnswer: `1. Chọn **Thanh toán QR** ở bước đặt hàng — Shopee sinh một mã QR có thời hạn hiệu lực.
2. Mở ứng dụng ngân hàng hoặc ví điện tử có hỗ trợ **VietQR**, quét mã và xác nhận giao dịch.
3. Khi ngân hàng báo thành công, đơn hàng tự chuyển sang trạng thái *Đã thanh toán*.

Nếu mã hết hạn trước khi thanh toán, quay lại mục **Đơn Mua** và tạo lại mã mới [Hướng dẫn thanh toán QR, 2026].`,
    note: "Truy xuất đúng bài hướng dẫn QR; chunk danh sách phương thức chỉ đóng vai trò bối cảnh.",
  },
  {
    id: "G07",
    question: "Cần chuẩn bị bằng chứng gì khi yêu cầu hoàn tiền?",
    category: "Bằng chứng hoàn tiền",
    expectedDocIds: ["news_refund_evidence"],
    expectedChunkIds: ["chunk_0131"],
    retrievedDocIds: ["news_refund_evidence", "news_refund_request"],
    retrievedChunkIds: ["chunk_0131", "chunk_0118", "chunk_0132"],
    scores: {
      faithfulness: 0.95,
      answerRelevance: 0.92,
      contextRecall: 0.94,
      contextPrecision: 0.92,
    },
    passed: true,
    usedFallback: false,
    // Đúng truy vấn mẫu C ở trang Chat/Truy xuất → dùng chung điểm đo thật.
    topCosine: 0.7788,
    generatedAnswer: `Cần đủ **ba nhóm bằng chứng** [Hướng dẫn bằng chứng hoàn tiền, 2026]:

1. **Ảnh sản phẩm thực nhận** — chụp rõ phần lỗi hoặc phần không đúng mô tả, tối thiểu 1 và tối đa 5 ảnh.
2. **Ảnh kiện hàng bên ngoài** — còn nguyên tem niêm phong và nhãn vận chuyển để đối chiếu mã đơn.
3. **Video mở hộp** — quay liền mạch, không cắt ghép, bắt đầu từ khi kiện hàng còn nguyên vẹn.

Video là **bắt buộc** với các trường hợp thiếu hàng, vỡ hỏng hoặc giao sai sản phẩm.`,
    note: "Chunk chứa giới hạn định dạng cũng lọt vào top-3, giúp câu trả lời đầy đủ mà không phải đoán.",
  },
  {
    id: "G08",
    question: "Video mở hộp được phép dài tối đa bao nhiêu giây và nặng bao nhiêu MB?",
    category: "Bằng chứng hoàn tiền",
    expectedDocIds: ["news_refund_evidence"],
    expectedChunkIds: ["chunk_0132"],
    retrievedDocIds: ["news_refund_evidence", "news_refund_request"],
    retrievedChunkIds: ["chunk_0131", "chunk_0118"],
    scores: {
      faithfulness: 0.61,
      answerRelevance: 0.58,
      contextRecall: 0.36,
      contextPrecision: 0.43,
    },
    passed: false,
    usedFallback: true,
    topCosine: 0.441,
    generatedAnswer: `Video mở hộp cần **quay liền mạch, không cắt ghép**, bắt đầu từ khi kiện hàng còn nguyên vẹn cho tới khi lấy sản phẩm ra [Hướng dẫn bằng chứng hoàn tiền, 2026].

Tài liệu truy xuất được **chưa nêu giới hạn thời lượng và dung lượng cụ thể** của tệp video. Bạn nên kiểm tra lại thông báo giới hạn hiện ngay tại màn hình tải tệp trong ứng dụng.

*Câu trả lời đi qua nhánh PageIndex Vectorless vì cosine cao nhất chỉ đạt 0.441 < 0.48.*`,
    note: "Đáp án đúng (30 giây, 30MB) nằm ở chunk_0132 nhưng chunk này không vào được top-k. Xem phần phân tích ca tệ nhất.",
  },
  {
    id: "G09",
    question: "Người bán không được đăng bán những sản phẩm nào?",
    category: "Quy định người bán",
    expectedDocIds: ["legal_prohibited"],
    expectedChunkIds: ["chunk_0203"],
    retrievedDocIds: ["legal_prohibited", "legal_listing_rules"],
    retrievedChunkIds: ["chunk_0203", "chunk_0207", "chunk_0181"],
    scores: {
      faithfulness: 0.96,
      answerRelevance: 0.93,
      contextRecall: 0.95,
      contextPrecision: 0.91,
    },
    passed: true,
    usedFallback: false,
    // Đúng truy vấn mẫu D ở trang Chat → dùng chung điểm đo thật 0.6760.
    topCosine: 0.676,
    generatedAnswer: `Nhóm hàng bị **cấm tuyệt đối** trên Shopee gồm [Chính sách sản phẩm cấm và hạn chế, 2026]:

- Vũ khí, đạn dược, vật liệu nổ và công cụ hỗ trợ
- Chất ma tuý và tiền chất
- Động vật hoang dã, sản phẩm từ loài nguy cấp (ngà voi, sừng tê giác, vảy tê tê)
- Hàng giả, hàng nhái, hàng vi phạm quyền sở hữu trí tuệ
- Tiền tệ, tem phiếu, giấy tờ tuỳ thân
- Thuốc kê đơn, thiết bị y tế chưa được cấp phép, hoá chất độc hại
- Sản phẩm khiêu dâm, đồi truỵ; thiết bị nghe lén, phá sóng
- Nội tạng và mô người`,
    note: "Câu hỏi bao trùm nguyên một mục nên cả semantic lẫn BM25 đều hội tụ về đúng chunk.",
  },
  {
    id: "G10",
    question: "Muốn bán thực phẩm chức năng trên Shopee thì cần giấy tờ gì?",
    category: "Quy định người bán",
    expectedDocIds: ["legal_prohibited"],
    expectedChunkIds: ["chunk_0207"],
    retrievedDocIds: ["legal_prohibited", "legal_listing_rules"],
    retrievedChunkIds: ["chunk_0203", "chunk_0181"],
    scores: {
      faithfulness: 0.55,
      answerRelevance: 0.62,
      contextRecall: 0.31,
      contextPrecision: 0.38,
    },
    passed: false,
    usedFallback: false,
    topCosine: 0.523,
    generatedAnswer: `Trong danh mục hàng hoá bị cấm, **thực phẩm chức năng không bị cấm bán** [Chính sách sản phẩm cấm và hạn chế, 2026].

Tuy nhiên tài liệu truy xuất được chỉ liệt kê nhóm hàng cấm tuyệt đối nên **chưa nêu giấy tờ cần chuẩn bị**. Thông thường Người bán cần cung cấp giấy tờ chứng minh nguồn gốc sản phẩm khi Shopee yêu cầu.`,
    note: "Đáp án đúng là giấy công bố sản phẩm ở Mục 2 (chunk_0207) — nhưng top-k chỉ có Mục 1. Câu cuối là suy đoán, không có trong ngữ cảnh.",
  },
  {
    id: "G11",
    question: "Đăng trùng một sản phẩm ở nhiều listing có bị phạt không?",
    category: "Quy định người bán",
    expectedDocIds: ["legal_listing_rules"],
    expectedChunkIds: ["chunk_0181"],
    retrievedDocIds: ["legal_listing_rules", "legal_prohibited"],
    retrievedChunkIds: ["chunk_0181", "chunk_0203"],
    scores: {
      faithfulness: 0.89,
      answerRelevance: 0.86,
      contextRecall: 0.89,
      contextPrecision: 0.86,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.671,
    generatedAnswer: `**Có.** Đăng trùng lặp cùng một sản phẩm ở nhiều listing để chiếm kết quả tìm kiếm là hành vi bị xử lý [Quy định đăng bán sản phẩm, 2026].

Cùng nhóm vi phạm này còn có: đặt tên gây hiểu nhầm hoặc nhồi từ khoá, dùng ảnh có watermark của shop khác, niêm yết giá ảo rồi giao dịch ngoài sàn, chèn số điện thoại hay mạng xã hội vào mô tả.

Mỗi vi phạm bị tính điểm phạt; tích luỹ đủ điểm sẽ dẫn tới hạn chế tính năng hoặc khoá shop.`,
    note: "Chunk hàng cấm lọt vào top-2 do trùng nhiều từ khoá quản trị, kéo Context Precision xuống một chút.",
  },
  {
    id: "G12",
    question: "Đơn hàng bị thất lạc thì tôi được bồi thường thế nào?",
    category: "Vận chuyển",
    expectedDocIds: ["legal_shipping"],
    expectedChunkIds: ["chunk_0166"],
    retrievedDocIds: ["legal_shipping"],
    retrievedChunkIds: ["chunk_0166", "chunk_0167"],
    scores: {
      faithfulness: 0.91,
      answerRelevance: 0.88,
      contextRecall: 0.9,
      contextPrecision: 0.88,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.694,
    generatedAnswer: `Đơn được xác định **thất lạc** khi không có cập nhật trạng thái vận chuyển trong **15 ngày liên tiếp** và đơn vị vận chuyển xác nhận không tìm thấy kiện hàng. Khi đó người mua được **hoàn 100% giá trị đơn hàng, bao gồm cả phí vận chuyển đã trả** [Chính sách vận chuyển, 2026].

Với kiện hàng hư hỏng do vận chuyển, cần gửi video mở hộp và ảnh kiện hàng **trong vòng 48 giờ** kể từ khi nhận để được bồi thường.`,
    note: "Cả hai chunk đều thuộc đúng tài liệu vận chuyển; không có nhiễu chéo tài liệu.",
  },
  {
    id: "G13",
    question: "Làm sao theo dõi đơn hàng mua từ shop nước ngoài?",
    category: "Đơn quốc tế",
    expectedDocIds: ["news_cross_border"],
    expectedChunkIds: ["chunk_0152"],
    retrievedDocIds: ["news_cross_border"],
    retrievedChunkIds: ["chunk_0152", "chunk_0153"],
    scores: {
      faithfulness: 0.9,
      answerRelevance: 0.87,
      contextRecall: 0.89,
      contextPrecision: 0.87,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.752,
    generatedAnswer: `Vào **Tôi → Đơn Mua**, chọn đơn có nhãn *Hàng quốc tế* hoặc *Shopee International*, rồi nhấn **Xem chi tiết vận chuyển** [Hướng dẫn theo dõi đơn quốc tế, 2026].

Màn hình này hiển thị đủ các mốc: rời kho người bán → trung tâm phân loại nước xuất → xuất cảnh → nhập cảnh Việt Nam → thông quan → giao cho đơn vị vận chuyển nội địa → đang giao.

Đơn quốc tế thường mất **7–20 ngày làm việc**; thời gian thông quan không tính vào cam kết giao hàng của Shopee.`,
    note: "Hai chunk liền kề trong cùng bài viết bổ trợ nhau, câu trả lời bao trọn cả cách tra cứu lẫn thời gian dự kiến.",
  },
  {
    id: "G14",
    question: "Voucher điện tử và thẻ nạp game có được trả hàng không?",
    category: "Trả hàng & hoàn tiền",
    expectedDocIds: ["news_refund_restrictions"],
    expectedChunkIds: ["chunk_0126"],
    retrievedDocIds: [
      "news_refund_restrictions",
      "legal_return_refund",
      "news_refund_request",
    ],
    retrievedChunkIds: ["chunk_0126", "chunk_0042", "chunk_0118"],
    scores: {
      faithfulness: 0.83,
      answerRelevance: 0.78,
      contextRecall: 0.78,
      contextPrecision: 0.75,
    },
    passed: true,
    usedFallback: false,
    topCosine: 0.612,
    generatedAnswer: `**Không áp dụng quy trình Trả hàng/Hoàn tiền tiêu chuẩn.** Voucher điện tử, thẻ cào và thẻ nạp game, vé sự kiện đã kích hoạt, dịch vụ số đã sử dụng, hàng đặt riêng theo yêu cầu, đồ lót và mỹ phẩm đã bóc niêm phong đều thuộc nhóm hạn chế [Hướng dẫn sản phẩm hạn chế trả hàng, 2026].

Nếu mã không sử dụng được hoặc dịch vụ không đúng cam kết, hãy liên hệ Bộ phận Chăm sóc Khách hàng **trong vòng 24 giờ**.`,
    note: "Ca sát ngưỡng nhất trong nhóm đạt: hai chunk quy trình trả hàng thông thường lọt vào top-3 và không đóng góp gì cho đáp án.",
  },
  {
    id: "G15",
    question: "Tôi muốn Shopee xoá dữ liệu cá nhân của mình thì làm thế nào?",
    category: "Bảo mật dữ liệu",
    expectedDocIds: ["legal_privacy"],
    expectedChunkIds: ["chunk_0221"],
    retrievedDocIds: ["legal_privacy", "news_refund_restrictions"],
    retrievedChunkIds: ["chunk_0221", "chunk_0126"],
    scores: {
      faithfulness: 0.52,
      answerRelevance: 0.81,
      contextRecall: 0.82,
      contextPrecision: 0.78,
    },
    passed: false,
    usedFallback: false,
    topCosine: 0.588,
    generatedAnswer: `Bạn gửi yêu cầu xoá dữ liệu qua **Trung tâm Hỗ trợ**; Shopee phản hồi trong vòng **30 ngày** [Chính sách bảo mật, 2026].

Kèm theo yêu cầu, bạn cần **tải lên ảnh CCCD hai mặt** để xác minh danh tính, và toàn bộ lịch sử đơn hàng sẽ bị xoá **trong 7 ngày làm việc** sau khi yêu cầu được duyệt.

Một số dữ liệu giao dịch vẫn phải lưu theo yêu cầu của pháp luật kế toán và thuế.`,
    note: "Truy xuất đúng chunk. Đoạn về ảnh CCCD và mốc 7 ngày làm việc hoàn toàn không có trong ngữ cảnh — lỗi thuộc bước sinh.",
  },
];

export const GOLDEN_TOTAL = GOLDEN_CASES.length;
export const GOLDEN_PASSED = GOLDEN_CASES.filter((c) => c.passed).length;

// ---------------------------------------------------------------------------
// 2. So sánh A/B — bốn cấu hình truy xuất trên cùng bộ 15 câu
// ---------------------------------------------------------------------------

/**
 * Điểm của `hybrid_rerank` được tính trực tiếp từ GOLDEN_CASES.
 * Ba config còn lại là số của các lần chạy trước, giữ cố định.
 */
const HYBRID_RERANK_SCORES = averageScores(GOLDEN_CASES);

export const RETRIEVAL_CONFIGS: RetrievalConfigResult[] = [
  {
    id: "dense_only",
    label: "dense_only",
    description: "Chỉ semantic search trên ChromaDB, không có nhánh từ khoá.",
    isBaseline: true,
    isPrimary: false,
    scores: {
      faithfulness: 0.742,
      answerRelevance: 0.768,
      contextRecall: 0.611,
      contextPrecision: 0.664,
    },
    // Chỉ gồm sinh embedding (~66ms) + truy vấn ChromaDB (~2ms).
    avgLatencyMs: 68,
    passedCases: 8,
    totalCases: GOLDEN_TOTAL,
  },
  {
    id: "bm25_only",
    label: "bm25_only",
    description: "Chỉ BM25 lexical (k1=1.5, b=0.75), không dùng embedding.",
    isBaseline: false,
    isPrimary: false,
    scores: {
      faithfulness: 0.713,
      answerRelevance: 0.629,
      contextRecall: 0.658,
      contextPrecision: 0.702,
    },
    avgLatencyMs: 69,
    passedCases: 6,
    totalCases: GOLDEN_TOTAL,
  },
  {
    id: "hybrid_rrf",
    label: "hybrid_rrf",
    description: "Semantic + BM25 gộp bằng Reciprocal Rank Fusion (k=60).",
    isBaseline: false,
    isPrimary: false,
    scores: {
      faithfulness: 0.826,
      answerRelevance: 0.804,
      contextRecall: 0.771,
      contextPrecision: 0.735,
    },
    avgLatencyMs: 141,
    passedCases: 11,
    totalCases: GOLDEN_TOTAL,
  },
  {
    id: "hybrid_rerank",
    label: "hybrid_rerank",
    description: `Hybrid RRF + cross-encoder ${PIPELINE_CONFIG.rerankerModel} — cấu hình chính.`,
    isBaseline: false,
    isPrimary: true,
    scores: HYBRID_RERANK_SCORES,
    // Cross-encoder chiếm gần như toàn bộ: ~602ms trên tổng ~743ms.
    avgLatencyMs: 743,
    passedCases: GOLDEN_PASSED,
    totalCases: GOLDEN_TOTAL,
  },
];

export const BASELINE_CONFIG =
  RETRIEVAL_CONFIGS.find((c) => c.isBaseline) ?? RETRIEVAL_CONFIGS[0];

export const PRIMARY_CONFIG =
  RETRIEVAL_CONFIGS.find((c) => c.isPrimary) ??
  RETRIEVAL_CONFIGS[RETRIEVAL_CONFIGS.length - 1];

/** Δ của một config so với config đối chứng. */
export function deltaVsBaseline(
  config: RetrievalConfigResult,
  metric: RagasMetricId,
): number {
  return round3(config.scores[metric] - BASELINE_CONFIG.scores[metric]);
}

// ---------------------------------------------------------------------------
// 3. Hàng thẻ RAGAS tổng quan (config chính so với config đối chứng)
// ---------------------------------------------------------------------------

export const RAGAS_METRICS: RagasMetricSummary[] = METRIC_IDS.map((id) => {
  const value = PRIMARY_CONFIG.scores[id];
  const baseline = BASELINE_CONFIG.scores[id];
  return {
    id,
    label: METRIC_META[id].label,
    labelVi: METRIC_META[id].labelVi,
    description: METRIC_META[id].description,
    value,
    baseline,
    delta: round3(value - baseline),
    threshold: RAGAS_THRESHOLD,
    passed: value >= RAGAS_THRESHOLD,
  };
});

// ---------------------------------------------------------------------------
// 4. Ba ca tệ nhất + đề xuất cải tiến
// ---------------------------------------------------------------------------

export const WORST_PERFORMERS: WorstCaseAnalysis[] = [
  {
    caseId: "G10",
    failureStage: "retrieval",
    failurePoint: "BM25 → RRF (chunk sai mục nhưng trùng từ khoá)",
    rootCause:
      "BM25 kéo nhầm chunk cùng từ khoá ở khác mục: chunk_0203 (Mục 1 — Hàng hoá bị cấm) chứa các token \"thực phẩm\", \"sản phẩm\", \"giấy phép\" với tần suất cao nên đứng hạng 1 lexical. Đáp án thật nằm ở chunk_0207 (Mục 2 — Hàng hoá hạn chế) với cụm \"giấy công bố sản phẩm\" chỉ xuất hiện một lần. RRF cộng hạng nên chunk sai được đẩy lên top-1, còn cross-encoder chỉ xếp lại trong đúng tập ứng viên đã sai từ đầu.",
    evidence:
      "Cosine top-1 đạt 0.523 — vẫn trên ngưỡng 0.48 nên PageIndex không được kích hoạt. Hệ thống \"tự tin\" với ngữ cảnh sai và trả lời bằng suy đoán.",
  },
  {
    caseId: "G08",
    failureStage: "retrieval",
    failurePoint: "Chunking → Semantic (chunk bị cắt giữa bảng)",
    rootCause:
      "Chunk chứa đáp án bị cắt giữa bảng nên embedding mất ngữ cảnh: với chunk_size=800 và overlap=100, bảng \"Định dạng và giới hạn\" bị chia đôi. Phần con số (30 giây, 30MB, 5 ảnh, 5MB) rơi sang chunk_0132 nhưng tiêu đề mục và cụm \"video mở hộp\" nằm lại ở chunk trước. Vector của chunk_0132 vì thế chỉ còn các con số trần, gần như không có tín hiệu ngữ nghĩa để khớp với câu hỏi.",
    evidence:
      "Cosine top-1 chỉ 0.441 < 0.48 nên PageIndex được kích hoạt và tìm đúng bài viết, nhưng nhánh vectorless dừng ở mức mục nên vẫn không lấy được đoạn chứa con số. Context Recall rơi xuống 0.36.",
  },
  {
    caseId: "G15",
    failureStage: "generation",
    failurePoint: "Generation (bịa chi tiết ngoài ngữ cảnh)",
    rootCause:
      "Truy xuất hoàn toàn đúng — chunk_0221 chứa đủ quyền của chủ thể dữ liệu và mốc phản hồi 30 ngày. Nhưng LLM tự thêm hai chi tiết không có trong ngữ cảnh: yêu cầu \"tải lên ảnh CCCD hai mặt\" và mốc \"xoá lịch sử đơn hàng trong 7 ngày làm việc\". Đây là kiến thức nền của mô hình rò rỉ vào câu trả lời vì prompt không có ràng buộc bắt buộc trích dẫn theo từng câu.",
    evidence:
      "Faithfulness 0.52 trong khi Context Recall vẫn 0.82 — chênh lệch lớn giữa hai chỉ số là dấu hiệu điển hình của lỗi ở bước sinh, không phải bước truy xuất.",
  },
];

export const IMPROVEMENTS: EvalImprovement[] = [
  {
    id: "imp_chunking",
    title: "Cắt chunk theo cấu trúc thay vì cắt cứng 800 ký tự",
    action:
      "Đổi sang bộ tách nhận biết tiêu đề và bảng: không cắt ngang một khối bảng, và gắn chuỗi \"<tên tài liệu> › <tiêu đề mục>\" vào đầu mỗi chunk trước khi embed để chunk con vẫn giữ được ngữ cảnh cha.",
    expectedImpact:
      "Xoá nguyên nhân gốc của G08 và các câu hỏi hỏi số liệu trong bảng. Ước tính Context Recall của nhóm câu hỏi định lượng tăng khoảng +0.30, Context Recall toàn bộ tăng khoảng +0.04.",
    targetCaseIds: ["G08"],
    effort: "trung bình",
  },
  {
    id: "imp_threshold",
    title: "Chấm ngưỡng bằng điểm rerank, không chỉ cosine top-1",
    action:
      "Thêm điều kiện kích hoạt PageIndex khi điểm cross-encoder cao nhất < 0.65 dù cosine ≥ 0.48; đồng thời phạt điểm những chunk chỉ khớp từ khoá mà tiêu đề mục không khớp ý định câu hỏi.",
    expectedImpact:
      "Bắt được nhóm ca \"tự tin nhưng sai nguồn\" — G10 (cosine 0.523 nhưng chunk sai mục) và câu \"Shopee có chính sách đổi trả vé máy bay và tour du lịch không?\" (cosine tới 0.638 dù kho không có tài liệu nào về du lịch, trong khi cross-encoder chỉ chấm 0.591). Ước tính Context Precision tăng khoảng +0.05 và số ca đạt tăng thêm 1–2 câu trên 15.",
    targetCaseIds: ["G10"],
    effort: "thấp",
  },
  {
    id: "imp_citation",
    title: "Ràng buộc trích dẫn theo từng câu ở bước sinh",
    action:
      "Yêu cầu LLM gắn mã chunk cho mỗi câu khẳng định, sau đó chạy một lượt kiểm tra tự động loại bỏ câu không ánh xạ được về chunk nào trước khi trả kết quả cho người dùng.",
    expectedImpact:
      "Chặn kiểu lỗi bịa chi tiết của G15 và phần suy đoán ở G02, G10. Ước tính Faithfulness trung bình tăng khoảng +0.06 mà không ảnh hưởng độ trễ truy xuất.",
    targetCaseIds: ["G15", "G10", "G02"],
    effort: "thấp",
  },
];

// ---------------------------------------------------------------------------
// 5. Truy vấn kích hoạt PageIndex fallback (cosine top-1 < 0.48)
// ---------------------------------------------------------------------------

export const FALLBACK_QUERIES: FallbackQueryRecord[] = [
  {
    id: "fb_01",
    query: "Video mở hộp được phép dài tối đa bao nhiêu giây và nặng bao nhiêu MB?",
    topCosine: 0.441,
    reason:
      "Chunk chứa đáp án bị cắt giữa bảng định dạng nên chỉ còn các con số trần, không có cụm \"video mở hộp\" để embedding bám vào.",
    outcome:
      "PageIndex tìm đúng bài Hướng dẫn bằng chứng hoàn tiền nhưng dừng ở mức mục, chưa lấy được đoạn chứa giới hạn 30 giây / 30MB.",
    resolved: false,
    caseId: "G08",
  },
  {
    id: "fb_02",
    query: "Cách nấu phở bò ngon tại nhà?",
    topCosine: 0.3739,
    reason:
      "Không một từ nào trong câu hỏi thuộc miền thương mại điện tử, nên chunk gần nhất chỉ còn tương đồng ở mức nền của bge-m3 — đây là điểm thấp nhất đo được trên toàn bộ kho.",
    outcome:
      "PageIndex duyệt mục lục 13 tài liệu, không chọn nhánh nào và trả lời rằng câu hỏi nằm ngoài phạm vi thay vì bịa nội dung.",
    resolved: true,
  },
  {
    id: "fb_03",
    query: "Shop của tôi bị khoá vì bán hàng giả thì kháng cáo ở đâu?",
    topCosine: 0.427,
    reason:
      "Quy trình kháng cáo không có trong tài liệu; các chunk gần nhất chỉ nói về điểm phạt và hậu quả vi phạm nên độ tương đồng thấp.",
    outcome:
      "PageIndex chọn nhánh Quy định đăng bán › Hành vi vi phạm, trả lời được phần cơ chế điểm phạt và nói rõ phần kháng cáo nằm ngoài phạm vi.",
    resolved: true,
  },
  {
    id: "fb_04",
    query: "Mua bằng Apple Pay thì tiền hoàn về đâu và mất bao lâu?",
    topCosine: 0.458,
    reason:
      "Câu ghép hai chủ đề (phương thức thanh toán + thời gian hoàn tiền) nằm ở hai tài liệu khác nhau, vector trung bình không gần chunk nào.",
    outcome:
      "PageIndex đi qua hai nhánh Chính sách hoàn tiền › Thời gian hoàn và Hướng dẫn thanh toán › Danh sách phương thức, ghép được câu trả lời đầy đủ.",
    resolved: true,
  },
  {
    id: "fb_05",
    query: "Đơn quốc tế bị giữ ở hải quan thì ai chịu phí phát sinh?",
    topCosine: 0.463,
    reason:
      "Tài liệu chỉ nói thời gian thông quan không tính vào cam kết giao hàng, không nói về phí — câu hỏi hỏi khía cạnh chưa được bao phủ.",
    outcome:
      "PageIndex chọn đúng bài Theo dõi đơn quốc tế, nêu rõ phần trách nhiệm chi phí chưa được quy định trong tài liệu hiện có.",
    resolved: true,
  },
];

// ---------------------------------------------------------------------------
// 6. Thông tin lần chạy
// ---------------------------------------------------------------------------

export const EVALUATION_RUN: EvaluationRunMeta = {
  runId: "eval_2026_08_02_run07",
  ranAt: "2026-08-02",
  judgeModel: PIPELINE_CONFIG.llmModel,
  datasetSize: GOLDEN_TOTAL,
  primaryConfigLabel: PRIMARY_CONFIG.label,
  notes:
    "Cùng một bộ 15 câu chạy qua bốn cấu hình truy xuất, chấm bằng RAGAS với ngưỡng đạt 0.70 cho cả bốn chỉ số.",
};

export function getGoldenCase(id: string): GoldenCase | undefined {
  return GOLDEN_CASES.find((c) => c.id === id);
}
