import type {
  LexicalHit,
  MergeRow,
  MockAnswer,
  PipelineStep,
  RerankRow,
  SemanticHit,
  SourceCitation,
} from "@/lib/types";
import { PIPELINE_CONFIG } from "./documents";
import { normalizeQuery } from "@/lib/utils";

const { rrfK, fallbackThreshold } = PIPELINE_CONFIG;

// ---------------------------------------------------------------------------
// Helper dựng bước — giữ cho phần dữ liệu bên dưới gọn và dễ đọc
// ---------------------------------------------------------------------------

function semanticStep(durationMs: number, hits: SemanticHit[]): PipelineStep {
  return {
    id: "semantic",
    title: "Semantic Search",
    subtitle: `${PIPELINE_CONFIG.vectorStore} · ${PIPELINE_CONFIG.embeddingModel}`,
    durationMs,
    status: "done",
    detail: {
      kind: "semantic",
      model: PIPELINE_CONFIG.embeddingModel,
      dimensions: PIPELINE_CONFIG.embeddingDim,
      metric: PIPELINE_CONFIG.similarity,
      collection: PIPELINE_CONFIG.collection,
      candidates: 214,
      topK: hits.length,
      hits,
    },
  };
}

function lexicalStep(
  durationMs: number,
  tokens: string[],
  hits: LexicalHit[],
): PipelineStep {
  return {
    id: "lexical",
    title: "Lexical Search",
    subtitle: `BM25 · k1=${PIPELINE_CONFIG.bm25K1}, b=${PIPELINE_CONFIG.bm25B}`,
    durationMs,
    status: "done",
    detail: {
      kind: "lexical",
      algorithm: PIPELINE_CONFIG.lexicalAlgorithm,
      k1: PIPELINE_CONFIG.bm25K1,
      b: PIPELINE_CONFIG.bm25B,
      corpusSize: 214,
      avgDocLength: 196.4,
      tokens,
      hits,
    },
  };
}

function mergeStep(durationMs: number, rows: MergeRow[]): PipelineStep {
  return {
    id: "merge",
    title: "Merge — Reciprocal Rank Fusion",
    subtitle: `RRF · k=${rrfK}`,
    durationMs,
    status: "done",
    detail: {
      kind: "merge",
      method: "Reciprocal Rank Fusion (Cormack et al., 2009)",
      k: rrfK,
      formula: `score(d) = Σ 1 / (${rrfK} + rank_i(d))`,
      rows,
    },
  };
}

function rerankStep(durationMs: number, rows: RerankRow[]): PipelineStep {
  return {
    id: "rerank",
    title: "Rerank — Cross-encoder",
    subtitle: PIPELINE_CONFIG.rerankerModel,
    durationMs,
    status: "done",
    detail: {
      kind: "rerank",
      model: PIPELINE_CONFIG.rerankerModel,
      pairsScored: rows.length,
      rows,
    },
  };
}

function fallbackSkipped(durationMs: number, topCosine: number): PipelineStep {
  return {
    id: "fallback",
    title: "Fallback — PageIndex Vectorless",
    subtitle: `Ngưỡng cosine ${fallbackThreshold}`,
    durationMs,
    status: "skipped",
    detail: {
      kind: "fallback",
      triggered: false,
      topCosine,
      threshold: fallbackThreshold,
      reason: `Điểm cosine gốc của top-1 là ${topCosine.toFixed(
        3,
      )} ≥ ${fallbackThreshold} → giữ kết quả hybrid, không cần PageIndex.`,
      treeNodes: [],
    },
  };
}

function generationStep(
  durationMs: number,
  chunkIds: string[],
  promptTokens: number,
  completionTokens: number,
): PipelineStep {
  const front = chunkIds.filter((_, i) => i % 2 === 0);
  const back = chunkIds.filter((_, i) => i % 2 === 1).reverse();
  const finalOrder = [...front, ...back];

  return {
    id: "generation",
    title: "Generation",
    subtitle: `${PIPELINE_CONFIG.llmModel} · ${chunkIds.length} chunk`,
    durationMs,
    status: "done",
    detail: {
      kind: "generation",
      model: PIPELINE_CONFIG.llmModel,
      chunkCount: chunkIds.length,
      promptTokens,
      completionTokens,
      reorderStrategy: "front + back[::-1]",
      slots: finalOrder.map((chunkId, finalIndex) => ({
        chunkId,
        originalIndex: chunkIds.indexOf(chunkId),
        finalIndex,
        position: front.includes(chunkId)
          ? ("front" as const)
          : ("back" as const),
      })),
    },
  };
}

/** Dựng bảng RRF từ hai danh sách rank (chunkId theo thứ tự hạng). */
function buildMergeRows(dense: string[], sparse: string[]): MergeRow[] {
  const ids = Array.from(new Set([...dense, ...sparse]));
  const rows = ids.map((chunkId) => {
    const d = dense.indexOf(chunkId);
    const s = sparse.indexOf(chunkId);
    const denseRank = d === -1 ? null : d + 1;
    const sparseRank = s === -1 ? null : s + 1;
    const rrf =
      (denseRank ? 1 / (rrfK + denseRank) : 0) +
      (sparseRank ? 1 / (rrfK + sparseRank) : 0);
    return { chunkId, denseRank, sparseRank, rrf, fusedRank: 0 };
  });
  rows.sort((a, b) => b.rrf - a.rrf);
  rows.forEach((row, i) => {
    row.fusedRank = i + 1;
  });
  return rows;
}

/** Dựng bảng rerank: `after` là danh sách chunkId sau khi cross-encoder chấm lại. */
function buildRerankRows(
  fused: MergeRow[],
  after: Array<{ chunkId: string; score: number }>,
): RerankRow[] {
  return after.map((item, i) => {
    const before = fused.find((r) => r.chunkId === item.chunkId);
    return {
      chunkId: item.chunkId,
      rankBefore: before?.fusedRank ?? fused.length + 1,
      rankAfter: i + 1,
      scoreBefore: before?.rrf ?? 0,
      scoreAfter: item.score,
    };
  });
}

function sourcesFromRerank(
  rows: RerankRow[],
  limit: number,
  denseIds: string[],
  sparseIds: string[],
): SourceCitation[] {
  return rows.slice(0, limit).map((row) => {
    const inDense = denseIds.includes(row.chunkId);
    const inSparse = sparseIds.includes(row.chunkId);
    return {
      chunkId: row.chunkId,
      score: row.scoreAfter,
      scoreLabel: "rerank",
      retrievedBy:
        inDense && inSparse
          ? "Semantic + BM25"
          : inDense
            ? "Chỉ Semantic"
            : "Chỉ BM25",
    };
  });
}

// ===========================================================================
// 1 — Thời hạn trả hàng / hoàn tiền
// ===========================================================================

const a1Dense = [
  "chunk_0042",
  "chunk_0118",
  "chunk_0126",
  "chunk_0043",
  "chunk_0051",
  "chunk_0131",
  "chunk_0166",
  "chunk_0167",
];
const a1Cosine = [0.871, 0.784, 0.733, 0.712, 0.688, 0.604, 0.559, 0.521];
const a1Sparse = [
  "chunk_0042",
  "chunk_0051",
  "chunk_0126",
  "chunk_0118",
  "chunk_0043",
  "chunk_0166",
];
const a1Bm25 = [18.42, 14.07, 12.85, 11.63, 9.31, 7.44];
const a1Merge = buildMergeRows(a1Dense, a1Sparse);
const a1Rerank = buildRerankRows(a1Merge, [
  { chunkId: "chunk_0042", score: 0.9471 },
  { chunkId: "chunk_0051", score: 0.7318 },
  { chunkId: "chunk_0118", score: 0.6042 },
  { chunkId: "chunk_0126", score: 0.4185 },
  { chunkId: "chunk_0043", score: 0.3907 },
]);
const a1GenChunks = [
  "chunk_0042",
  "chunk_0051",
  "chunk_0118",
  "chunk_0126",
  "chunk_0043",
];

const ANSWER_RETURN_DEADLINE: MockAnswer = {
  id: "ans_return_deadline",
  question: "Thời hạn yêu cầu trả hàng/hoàn tiền là bao lâu?",
  keywords: [
    "thoi han",
    "bao lau",
    "tra hang",
    "hoan tien",
    "15 ngay",
    "han tra hang",
    "deadline",
  ],
  answer: `**Thời hạn tiêu chuẩn là 15 ngày** kể từ khi đơn hàng được cập nhật trạng thái *Giao hàng thành công*. Sau mốc này, nút "Trả hàng/Hoàn tiền" trong ứng dụng sẽ không còn khả dụng [Chính sách trả hàng và hoàn tiền, 2026].

### Các mốc thời gian cần nhớ

| Trường hợp | Thời hạn gửi yêu cầu |
| --- | --- |
| Hàng hoá thông thường | **15 ngày** kể từ khi giao thành công |
| Thực phẩm tươi sống, đông lạnh | **24 giờ** kể từ khi giao thành công |
| Sản phẩm có bảo hành chính hãng | Sau 15 ngày vẫn liên hệ được, nhưng xử lý theo điều khoản bảo hành |

### Sau khi gửi yêu cầu thì bao lâu có kết quả?

- Shopee xét duyệt trong **2–3 ngày làm việc** kể từ khi nhận đủ bằng chứng.
- Nếu Người bán không phản hồi trong **2 ngày**, yêu cầu được xử lý tự động theo hướng có lợi cho người mua.
- Tiền hoàn về **Ví ShopeePay trong 24 giờ**; về thẻ tín dụng/ghi nợ hoặc tài khoản ngân hàng mất **7–14 ngày làm việc** [Chính sách trả hàng và hoàn tiền, 2026].

> Lưu ý: một số nhóm hàng như voucher điện tử, thẻ nạp, vé dịch vụ đã kích hoạt không áp dụng quy trình trả hàng thông thường — cần liên hệ Chăm sóc Khách hàng trong 24 giờ [Hướng dẫn sản phẩm hạn chế trả hàng, 2026].`,
  steps: [
    semanticStep(
      412,
      a1Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a1Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      78,
      ["thời hạn", "yêu cầu", "trả hàng", "hoàn tiền", "bao lâu"],
      a1Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a1Bm25[i],
        rank: i + 1,
        matchedTerms:
          i === 0
            ? ["thời hạn", "trả hàng", "hoàn tiền"]
            : i === 1
              ? ["hoàn tiền", "thời hạn"]
              : ["trả hàng", "hoàn tiền"],
      })),
    ),
    mergeStep(9, a1Merge),
    rerankStep(631, a1Rerank),
    fallbackSkipped(6, 0.871),
    generationStep(1264, a1GenChunks, 3184, 412),
  ],
  sources: sourcesFromRerank(a1Rerank, 4, a1Dense, a1Sparse),
  totalMs: 2400,
  usedFallback: false,
};

// ===========================================================================
// 2 — Phương thức thanh toán
// ===========================================================================

const a2Dense = [
  "chunk_0087",
  "chunk_0088",
  "chunk_0094",
  "chunk_0051",
  "chunk_0118",
  "chunk_0221",
];
const a2Cosine = [0.892, 0.771, 0.744, 0.581, 0.502, 0.463];
const a2Sparse = ["chunk_0087", "chunk_0088", "chunk_0094", "chunk_0051"];
const a2Bm25 = [21.36, 16.92, 15.28, 8.11];
const a2Merge = buildMergeRows(a2Dense, a2Sparse);
const a2Rerank = buildRerankRows(a2Merge, [
  { chunkId: "chunk_0087", score: 0.9628 },
  { chunkId: "chunk_0088", score: 0.8814 },
  { chunkId: "chunk_0094", score: 0.6135 },
  { chunkId: "chunk_0118", score: 0.1602 },
  { chunkId: "chunk_0051", score: 0.1287 },
]);
const a2GenChunks = ["chunk_0087", "chunk_0088", "chunk_0094", "chunk_0118"];

const ANSWER_PAYMENT: MockAnswer = {
  id: "ans_payment_methods",
  question: "Shopee hỗ trợ những phương thức thanh toán nào?",
  keywords: [
    "phuong thuc thanh toan",
    "thanh toan",
    "tra gop",
    "shopeepay",
    "cod",
    "the tin dung",
    "napas",
    "payment",
  ],
  answer: `Shopee Việt Nam hỗ trợ **9 nhóm phương thức thanh toán** [Hướng dẫn phương thức thanh toán, 2026]:

1. **Ví ShopeePay** — thanh toán bằng số dư ví, cũng là kênh nhận hoàn tiền nhanh nhất (trong 24 giờ).
2. **Thẻ tín dụng / thẻ ghi nợ** — Visa, Mastercard, JCB, American Express.
3. **Trả góp qua thẻ tín dụng** — kỳ hạn 3, 6, 9 hoặc 12 tháng.
4. **Thanh toán bằng mã QR** — quét qua ứng dụng ngân hàng hỗ trợ VietQR.
5. **Chuyển khoản qua ứng dụng ngân hàng** — liên kết ngay trong luồng thanh toán.
6. **Thẻ nội địa NAPAS** — thẻ ATM đã đăng ký Internet Banking.
7. **Apple Pay**
8. **Google Pay**
9. **Thanh toán khi nhận hàng (COD)**

### Điều kiện áp dụng

- **COD có thể không khả dụng** với đơn giá trị cao, đơn từ Shop nước ngoài, hoặc khu vực ngoài vùng phục vụ của đơn vị vận chuyển.
- **Trả góp** yêu cầu giá trị đơn đạt mức tối thiểu do ngân hàng phát hành quy định và chỉ áp dụng với danh sách ngân hàng liên kết [Hướng dẫn phương thức thanh toán, 2026].
- Với **mã QR**, mã có thời hạn hiệu lực; nếu hết hạn, người mua quay lại mục *Đơn Mua* để tạo mã mới [Hướng dẫn thanh toán QR, 2026].

Danh sách phương thức khả dụng luôn hiển thị ở bước *Phương thức thanh toán* trước khi bấm đặt hàng.`,
  steps: [
    semanticStep(
      388,
      a2Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a2Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      64,
      ["shopee", "hỗ trợ", "phương thức", "thanh toán"],
      a2Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a2Bm25[i],
        rank: i + 1,
        matchedTerms:
          i < 3 ? ["phương thức", "thanh toán"] : ["thanh toán"],
      })),
    ),
    mergeStep(7, a2Merge),
    rerankStep(594, a2Rerank),
    fallbackSkipped(5, 0.892),
    generationStep(1122, a2GenChunks, 2846, 386),
  ],
  sources: sourcesFromRerank(a2Rerank, 3, a2Dense, a2Sparse),
  totalMs: 2180,
  usedFallback: false,
};

// ===========================================================================
// 3 — Sản phẩm cấm đăng bán
// ===========================================================================

const a3Dense = [
  "chunk_0203",
  "chunk_0207",
  "chunk_0181",
  "chunk_0126",
  "chunk_0043",
];
const a3Cosine = [0.883, 0.826, 0.741, 0.514, 0.467];
const a3Sparse = ["chunk_0203", "chunk_0207", "chunk_0181", "chunk_0126"];
const a3Bm25 = [24.71, 17.35, 16.02, 6.88];
const a3Merge = buildMergeRows(a3Dense, a3Sparse);
const a3Rerank = buildRerankRows(a3Merge, [
  { chunkId: "chunk_0203", score: 0.9713 },
  { chunkId: "chunk_0181", score: 0.8027 },
  { chunkId: "chunk_0207", score: 0.7864 },
  { chunkId: "chunk_0126", score: 0.2015 },
  { chunkId: "chunk_0043", score: 0.0932 },
]);
const a3GenChunks = ["chunk_0203", "chunk_0181", "chunk_0207", "chunk_0126"];

const ANSWER_PROHIBITED: MockAnswer = {
  id: "ans_prohibited_items",
  question: "Người bán không được đăng bán những sản phẩm nào?",
  keywords: [
    "khong duoc dang ban",
    "san pham cam",
    "hang cam",
    "cam ban",
    "nguoi ban",
    "han che",
    "prohibited",
  ],
  answer: `Có **hai nhóm** cần phân biệt: hàng **bị cấm tuyệt đối** và hàng **bị hạn chế** (được bán nếu có giấy phép).

### 1. Hàng hoá bị cấm tuyệt đối

- Vũ khí, đạn dược, vật liệu nổ, công cụ hỗ trợ
- Chất ma tuý và tiền chất
- Động vật hoang dã và sản phẩm từ loài nguy cấp (ngà voi, sừng tê giác, vảy tê tê)
- Hàng giả, hàng nhái, hàng vi phạm quyền sở hữu trí tuệ
- Tiền tệ, tem phiếu, giấy tờ tuỳ thân
- Thuốc kê đơn, thuốc gây nghiện, thiết bị y tế chưa được cấp phép
- Hoá chất độc hại; sản phẩm khiêu dâm, đồi truỵ
- Thiết bị nghe lén, phá sóng, định vị bí mật
- Nội tạng, mô người; hàng thuộc diện cấm nhập khẩu

[Chính sách sản phẩm cấm và hạn chế, 2026]

### 2. Hàng hoá hạn chế — cần giấy phép

Thực phẩm chức năng, mỹ phẩm, rượu và đồ uống có cồn, thiết bị y tế loại A/B, sản phẩm cho trẻ sơ sinh, hoá chất gia dụng, sim số và thẻ viễn thông. Shopee có quyền yêu cầu bổ sung hồ sơ bất kỳ lúc nào và gỡ sản phẩm nếu Người bán không cung cấp đúng hạn.

### 3. Hành vi đăng bán bị xử phạt

Ngoài danh mục hàng hoá, Người bán còn bị tính điểm phạt khi: đặt tên gây hiểu nhầm hoặc nhồi từ khoá; dùng ảnh có watermark của shop khác; đăng trùng lặp nhiều listing cho cùng sản phẩm; niêm yết giá ảo rồi giao dịch ngoài sàn; chèn số điện thoại hoặc mạng xã hội vào tên/mô tả. Tích luỹ đủ điểm phạt sẽ dẫn tới hạn chế tính năng hoặc khoá shop [Quy định đăng bán sản phẩm, 2026].`,
  steps: [
    semanticStep(
      401,
      a3Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a3Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      71,
      ["người bán", "không được", "đăng bán", "sản phẩm"],
      a3Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a3Bm25[i],
        rank: i + 1,
        matchedTerms:
          i === 0
            ? ["cấm", "sản phẩm", "đăng bán"]
            : i === 2
              ? ["đăng bán", "người bán", "sản phẩm"]
              : ["sản phẩm", "hạn chế"],
      })),
    ),
    mergeStep(8, a3Merge),
    rerankStep(688, a3Rerank),
    fallbackSkipped(5, 0.883),
    generationStep(1397, a3GenChunks, 3052, 498),
  ],
  sources: sourcesFromRerank(a3Rerank, 3, a3Dense, a3Sparse),
  totalMs: 2570,
  usedFallback: false,
};

// ===========================================================================
// 4 — Bằng chứng hoàn tiền
// ===========================================================================

const a4Dense = [
  "chunk_0131",
  "chunk_0132",
  "chunk_0118",
  "chunk_0042",
  "chunk_0166",
  "chunk_0043",
];
const a4Cosine = [0.864, 0.799, 0.726, 0.658, 0.573, 0.541];
const a4Sparse = [
  "chunk_0131",
  "chunk_0118",
  "chunk_0042",
  "chunk_0132",
  "chunk_0043",
];
const a4Bm25 = [19.84, 15.22, 12.71, 11.06, 8.15];
const a4Merge = buildMergeRows(a4Dense, a4Sparse);
const a4Rerank = buildRerankRows(a4Merge, [
  { chunkId: "chunk_0131", score: 0.9564 },
  { chunkId: "chunk_0132", score: 0.9021 },
  { chunkId: "chunk_0118", score: 0.5433 },
  { chunkId: "chunk_0042", score: 0.3178 },
  { chunkId: "chunk_0043", score: 0.1044 },
]);
const a4GenChunks = ["chunk_0131", "chunk_0132", "chunk_0118", "chunk_0042"];

const ANSWER_EVIDENCE: MockAnswer = {
  id: "ans_refund_evidence",
  question: "Cần chuẩn bị bằng chứng gì khi yêu cầu hoàn tiền?",
  keywords: [
    "bang chung",
    "chung minh",
    "hinh anh",
    "video mo hop",
    "unboxing",
    "yeu cau hoan tien",
    "evidence",
  ],
  answer: `Có **ba nhóm bằng chứng bắt buộc** khi gửi yêu cầu Trả hàng/Hoàn tiền [Hướng dẫn bằng chứng hoàn tiền, 2026]:

1. **Ảnh sản phẩm thực nhận** — chụp rõ phần lỗi hoặc phần không đúng mô tả (1–5 ảnh).
2. **Ảnh kiện hàng bên ngoài** — còn nguyên tem niêm phong và nhãn vận chuyển để đối chiếu mã đơn.
3. **Video mở hộp (unboxing)** — quay **liền mạch, không cắt ghép**, bắt đầu từ khi kiện hàng còn nguyên vẹn. Video là **bắt buộc** với trường hợp thiếu hàng, vỡ hỏng hoặc giao sai sản phẩm.

### Giới hạn định dạng

| Loại | Định dạng | Số lượng | Dung lượng |
| --- | --- | --- | --- |
| Ảnh | JPG, PNG | tối đa 5 tệp | ≤ 5MB mỗi tệp |
| Video | MP4 | tối đa 1 tệp | ≤ 30MB, dài ≤ 30 giây |

### Vài lưu ý để không bị từ chối

- Bằng chứng mờ, thiếu sáng hoặc **không thấy mã vận đơn** có thể khiến yêu cầu bị từ chối; khi đó bạn có **3 ngày** để gửi bổ sung.
- Nộp bằng chứng ngay khi tạo yêu cầu trong *Đơn Mua → Trả hàng/Hoàn tiền* để rút ngắn thời gian xét duyệt [Hướng dẫn gửi yêu cầu hoàn tiền, 2026].
- Nhớ mốc **15 ngày** kể từ khi giao thành công (24 giờ với thực phẩm tươi sống) [Chính sách trả hàng và hoàn tiền, 2026].`,
  steps: [
    semanticStep(
      395,
      a4Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a4Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      69,
      ["bằng chứng", "chuẩn bị", "yêu cầu", "hoàn tiền"],
      a4Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a4Bm25[i],
        rank: i + 1,
        matchedTerms:
          i === 0
            ? ["bằng chứng", "hoàn tiền", "yêu cầu"]
            : ["yêu cầu", "hoàn tiền"],
      })),
    ),
    mergeStep(8, a4Merge),
    rerankStep(612, a4Rerank),
    fallbackSkipped(5, 0.864),
    generationStep(1181, a4GenChunks, 2914, 431),
  ],
  sources: sourcesFromRerank(a4Rerank, 4, a4Dense, a4Sparse),
  totalMs: 2270,
  usedFallback: false,
};

// ===========================================================================
// 5 — Theo dõi đơn hàng quốc tế
// ===========================================================================

const a5Dense = [
  "chunk_0152",
  "chunk_0153",
  "chunk_0167",
  "chunk_0166",
  "chunk_0118",
];
const a5Cosine = [0.847, 0.781, 0.612, 0.588, 0.441];
const a5Sparse = ["chunk_0152", "chunk_0153", "chunk_0167", "chunk_0166"];
const a5Bm25 = [17.93, 14.62, 9.87, 8.44];
const a5Merge = buildMergeRows(a5Dense, a5Sparse);
const a5Rerank = buildRerankRows(a5Merge, [
  { chunkId: "chunk_0152", score: 0.9382 },
  { chunkId: "chunk_0153", score: 0.8617 },
  { chunkId: "chunk_0166", score: 0.2841 },
  { chunkId: "chunk_0167", score: 0.2276 },
  { chunkId: "chunk_0118", score: 0.0518 },
]);
const a5GenChunks = ["chunk_0152", "chunk_0153", "chunk_0166"];

const ANSWER_CROSS_BORDER: MockAnswer = {
  id: "ans_cross_border",
  question: "Làm sao theo dõi đơn hàng quốc tế?",
  keywords: [
    "don hang quoc te",
    "quoc te",
    "theo doi don",
    "hang quoc te",
    "thong quan",
    "cross border",
  ],
  answer: `Đơn từ Shop nước ngoài được gắn nhãn **"Hàng quốc tế"** hoặc **"Shopee International"**. Cách tra cứu [Hướng dẫn theo dõi đơn quốc tế, 2026]:

1. Mở ứng dụng Shopee → **Tôi** → **Đơn Mua**
2. Chọn đơn hàng có nhãn *Hàng quốc tế*
3. Nhấn **Xem chi tiết vận chuyển**

### Các mốc hành trình bạn sẽ thấy

\`\`\`
Rời kho Người bán
  → Trung tâm phân loại nước xuất
  → Xuất cảnh
  → Nhập cảnh Việt Nam
  → Thông quan
  → Bàn giao vận chuyển nội địa
  → Đang giao
\`\`\`

Mã vận đơn quốc tế cũng có thể tra trực tiếp trên website của đơn vị vận chuyển tương ứng.

### Thời gian giao dự kiến

- Thông thường **7–20 ngày làm việc**, tuỳ quốc gia xuất phát và thời điểm trong năm.
- **Giai đoạn thông quan không tính** vào thời gian cam kết giao hàng của Shopee.
- Nếu đơn **không cập nhật trạng thái quá 7 ngày liên tiếp**, hãy liên hệ Chăm sóc Khách hàng kèm mã đơn.
- Đơn quá hạn giao dự kiến sẽ được **tự động gia hạn** thời gian bảo vệ người mua [Hướng dẫn theo dõi đơn quốc tế, 2026].

Trường hợp xấu nhất — đơn không có cập nhật trong **15 ngày liên tiếp** và đơn vị vận chuyển xác nhận thất lạc — bạn được hoàn **100% giá trị đơn hàng kèm phí vận chuyển** [Chính sách vận chuyển, 2026].`,
  steps: [
    semanticStep(
      377,
      a5Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a5Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      62,
      ["theo dõi", "đơn hàng", "quốc tế"],
      a5Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a5Bm25[i],
        rank: i + 1,
        matchedTerms:
          i < 2 ? ["quốc tế", "đơn hàng", "theo dõi"] : ["đơn hàng", "vận chuyển"],
      })),
    ),
    mergeStep(7, a5Merge),
    rerankStep(566, a5Rerank),
    fallbackSkipped(4, 0.847),
    generationStep(1044, a5GenChunks, 2431, 402),
  ],
  sources: sourcesFromRerank(a5Rerank, 3, a5Dense, a5Sparse),
  totalMs: 2060,
  usedFallback: false,
};

// ===========================================================================
// 6 — FALLBACK: câu hỏi lệch miền → PageIndex Vectorless
// ===========================================================================

const a6Dense = [
  "chunk_0126",
  "chunk_0042",
  "chunk_0087",
  "chunk_0043",
  "chunk_0167",
];
const a6Cosine = [0.412, 0.371, 0.338, 0.316, 0.294];
const a6Sparse = ["chunk_0126", "chunk_0042", "chunk_0087", "chunk_0043"];
const a6Bm25 = [6.42, 5.18, 3.77, 2.94];
const a6Merge = buildMergeRows(a6Dense, a6Sparse);
const a6Rerank = buildRerankRows(a6Merge, [
  { chunkId: "chunk_0126", score: 0.2874 },
  { chunkId: "chunk_0042", score: 0.1533 },
  { chunkId: "chunk_0043", score: 0.0912 },
  { chunkId: "chunk_0087", score: 0.0481 },
  { chunkId: "chunk_0167", score: 0.0207 },
]);

const ANSWER_FALLBACK: MockAnswer = {
  id: "ans_fallback_travel",
  question: "Shopee có chính sách đổi trả vé máy bay và tour du lịch không?",
  keywords: [
    "ve may bay",
    "tour du lich",
    "du lich",
    "dat phong khach san",
    "ve tau",
    "doi tra ve",
  ],
  answer: `Mình **không tìm thấy quy định riêng về vé máy bay hay tour du lịch** trong kho tài liệu hiện có — bộ tài liệu này chỉ bao gồm 5 văn bản chính sách và 8 bài hướng dẫn về mua sắm hàng hoá trên Shopee.

Điều gần nhất có thể áp dụng: **vé dịch vụ và voucher điện tử đã kích hoạt** thuộc nhóm **không áp dụng quy trình Trả hàng/Hoàn tiền tiêu chuẩn**. Với nhóm này, người mua cần liên hệ Bộ phận Chăm sóc Khách hàng **trong vòng 24 giờ** nếu mã không sử dụng được hoặc dịch vụ không được cung cấp đúng cam kết [Hướng dẫn sản phẩm hạn chế trả hàng, 2026].

### Gợi ý

- Với vé máy bay đặt qua đối tác trên Shopee, chính sách hoàn/huỷ thường do **hãng bay và đối tác cung cấp dịch vụ** quy định, không theo Chính sách Trả hàng/Hoàn tiền của sàn.
- Bạn nên kiểm tra điều kiện vé ngay trên trang chi tiết dịch vụ trước khi thanh toán.

*Câu trả lời này được tạo qua nhánh **PageIndex Vectorless RAG** vì điểm cosine cao nhất chỉ đạt 0.412, thấp hơn ngưỡng 0.48 — hybrid search không tìm được đoạn văn đủ liên quan.*`,
  steps: [
    semanticStep(
      368,
      a6Dense.map((chunkId, i) => ({
        chunkId,
        cosine: a6Cosine[i],
        rank: i + 1,
      })),
    ),
    lexicalStep(
      58,
      ["chính sách", "đổi trả", "vé máy bay", "tour", "du lịch"],
      a6Sparse.map((chunkId, i) => ({
        chunkId,
        bm25: a6Bm25[i],
        rank: i + 1,
        matchedTerms: ["chính sách", "đổi trả"],
      })),
    ),
    mergeStep(6, a6Merge),
    rerankStep(521, a6Rerank),
    {
      id: "fallback",
      title: "Fallback — PageIndex Vectorless",
      subtitle: `Kích hoạt · 0.412 < ${fallbackThreshold}`,
      durationMs: 1483,
      status: "fallback",
      detail: {
        kind: "fallback",
        triggered: true,
        topCosine: 0.412,
        threshold: fallbackThreshold,
        reason:
          "Điểm cosine gốc của top-1 là 0.412 < 0.48 → hybrid search không đủ tin cậy. Chuyển sang PageIndex: LLM duyệt cây mục lục tài liệu thay vì so khớp vector.",
        treeNodes: [
          {
            id: "node_rr_root",
            docId: "legal_return_refund",
            title: "Chính sách Trả hàng và Hoàn tiền",
            depth: 0,
            selected: true,
            reasoning:
              "Câu hỏi nói về 'đổi trả' → tài liệu này là ứng viên chính, đi tiếp vào mục lục.",
          },
          {
            id: "node_rr_s4",
            docId: "legal_return_refund",
            title: "Mục 4 — Sản phẩm không áp dụng trả hàng",
            depth: 1,
            selected: true,
            reasoning:
              "Vé và dịch vụ là loại hàng đặc thù → khả năng nằm ở mục ngoại lệ.",
          },
          {
            id: "node_rr_s2",
            docId: "legal_return_refund",
            title: "Mục 2 — Thời hạn yêu cầu",
            depth: 1,
            selected: false,
            reasoning: "Chỉ nói về mốc 15 ngày / 24 giờ, không liên quan loại hàng.",
          },
          {
            id: "node_res_root",
            docId: "news_refund_restrictions",
            title: "Sản phẩm hạn chế Trả hàng/Hoàn tiền",
            depth: 0,
            selected: true,
            reasoning:
              "Tiêu đề khớp trực tiếp với ý 'loại hàng nào không được đổi trả'.",
          },
          {
            id: "node_res_group",
            docId: "news_refund_restrictions",
            title: "Nhóm sản phẩm hạn chế → voucher, vé dịch vụ đã kích hoạt",
            depth: 1,
            selected: true,
            reasoning:
              "Đây là đoạn gần nhất với câu hỏi: vé dịch vụ đã kích hoạt không áp dụng trả hàng thông thường.",
          },
          {
            id: "node_ship_root",
            docId: "legal_shipping",
            title: "Chính sách Vận chuyển",
            depth: 0,
            selected: false,
            reasoning: "Không có mục nào nói về vé, tour hay dịch vụ du lịch.",
          },
        ],
      },
    },
    generationStep(1198, ["chunk_0126", "chunk_0042"], 1642, 358),
  ],
  sources: [
    {
      chunkId: "chunk_0126",
      score: 0.71,
      scoreLabel: "PageIndex",
      retrievedBy: "PageIndex (điều hướng cây mục lục)",
    },
    {
      chunkId: "chunk_0042",
      score: 0.34,
      scoreLabel: "PageIndex",
      retrievedBy: "PageIndex (điều hướng cây mục lục)",
    },
  ],
  totalMs: 3630,
  usedFallback: true,
};

// ===========================================================================
// Export & matching
// ===========================================================================

export const MOCK_ANSWERS: MockAnswer[] = [
  ANSWER_RETURN_DEADLINE,
  ANSWER_PAYMENT,
  ANSWER_PROHIBITED,
  ANSWER_EVIDENCE,
  ANSWER_CROSS_BORDER,
  ANSWER_FALLBACK,
];

/** Câu hỏi gợi ý hiển thị ở màn hình rỗng. */
export const SUGGESTED_QUESTIONS = [
  ANSWER_RETURN_DEADLINE.question,
  ANSWER_PAYMENT.question,
  ANSWER_PROHIBITED.question,
  ANSWER_EVIDENCE.question,
  ANSWER_CROSS_BORDER.question,
];

export function getAnswerById(id: string): MockAnswer | undefined {
  return MOCK_ANSWERS.find((a) => a.id === id);
}

/** So khớp câu hỏi tự do với mock: khớp chính xác trước, sau đó đếm keyword. */
export function matchAnswer(query: string): MockAnswer | null {
  const q = normalizeQuery(query);
  if (!q) return null;

  const exact = MOCK_ANSWERS.find((a) => normalizeQuery(a.question) === q);
  if (exact) return exact;

  let best: MockAnswer | null = null;
  let bestScore = 0;
  for (const answer of MOCK_ANSWERS) {
    const score = answer.keywords.reduce(
      (sum, kw) => (q.includes(kw) ? sum + kw.split(" ").length : sum),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = answer;
    }
  }
  return bestScore >= 2 ? best : null;
}

/**
 * Trả lời mặc định khi không khớp mock nào: lịch sự + 2 bước pipeline rút gọn.
 */
export function buildDefaultAnswer(query: string): MockAnswer {
  const dense = ["chunk_0042", "chunk_0087", "chunk_0221"];
  const cosine = [0.298, 0.271, 0.244];

  return {
    id: "ans_default",
    question: query,
    keywords: [],
    answer: `Mình chưa tìm được đoạn tài liệu nào đủ liên quan để trả lời chắc chắn câu hỏi này.

Kho tri thức của demo hiện chỉ gồm **5 văn bản chính sách** và **8 bài hướng dẫn** của Shopee Việt Nam, xoay quanh các chủ đề:

- Trả hàng / hoàn tiền (điều kiện, thời hạn, bằng chứng)
- Thanh toán (phương thức, QR, trả góp, COD)
- Vận chuyển và theo dõi đơn (kể cả đơn quốc tế)
- Bảo mật dữ liệu người dùng
- Quy định đăng bán và danh mục hàng cấm/hạn chế

Bạn thử hỏi lại theo một trong các chủ đề trên, hoặc diễn đạt cụ thể hơn nhé.`,
    steps: [
      semanticStep(
        342,
        dense.map((chunkId, i) => ({
          chunkId,
          cosine: cosine[i],
          rank: i + 1,
        })),
      ),
      {
        id: "fallback",
        title: "Fallback — PageIndex Vectorless",
        subtitle: `Kích hoạt · 0.298 < ${fallbackThreshold}`,
        durationMs: 604,
        status: "fallback",
        detail: {
          kind: "fallback",
          triggered: true,
          topCosine: 0.298,
          threshold: fallbackThreshold,
          reason:
            "Điểm cosine gốc của top-1 là 0.298 < 0.48 → chuyển sang PageIndex. LLM duyệt mục lục 13 tài liệu nhưng không nhánh nào khớp chủ đề câu hỏi.",
          treeNodes: [
            {
              id: "node_default_scan",
              docId: "legal_return_refund",
              title: "Duyệt mục lục 13 tài liệu (legal + news)",
              depth: 0,
              selected: false,
              reasoning:
                "Không có mục nào khớp chủ đề câu hỏi → trả về câu trả lời an toàn thay vì bịa nội dung.",
            },
          ],
        },
      },
      generationStep(486, [], 512, 186),
    ],
    sources: [],
    totalMs: 1430,
    usedFallback: true,
  };
}
