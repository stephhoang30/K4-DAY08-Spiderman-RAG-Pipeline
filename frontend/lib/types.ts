/**
 * Kiểu dữ liệu dùng chung cho toàn bộ demo RAG Pipeline.
 * Tất cả dữ liệu đều là mock (lib/mock/*) — app không gọi API thật.
 */

export type DocType = "legal" | "news";
export type CustomerRole = "buyer" | "seller" | "both";

/** Một tài liệu nguồn trong knowledge base. */
export interface KnowledgeDoc {
  id: string;
  title: string;
  fileName: string;
  type: DocType;
  url: string;
  topic: string;
  customerRole: CustomerRole;
  /** Nhãn trích dẫn xuất hiện trong câu trả lời, ví dụ "Chính sách trả hàng và hoàn tiền, 2026". */
  citation: string;
  chunkCount: number;
  tokenCount: number;
  crawledAt: string;
  summary: string;
}

/** Một chunk sau khi cắt (chunk_size=800, overlap=100). */
export interface Chunk {
  id: string;
  docId: string;
  /** Vị trí chunk trong tài liệu (0-based). */
  index: number;
  section: string;
  /** Trích ngắn hiển thị trong bảng/nguồn. */
  excerpt: string;
  /** Nội dung đầy đủ, hiện khi bấm "mở rộng". */
  content: string;
  tokens: number;
}

/**
 * Thống kê file gốc → file chuẩn hoá của một tài liệu.
 * Chỉ trang Kho tri thức dùng; tách riêng khỏi `KnowledgeDoc` để không đụng
 * vào kiểu mà trang Chat đang dựa vào.
 */
export interface DocFileStats {
  /** Khớp với `KnowledgeDoc.id`. */
  docId: string;
  /** Tên file .md trong `data/standardized/<type>/`. */
  standardizedFile: string;
  /** Tên file gốc trong `data/landing/<type>/`. */
  landingFile: string;
  /** Định dạng gốc trước khi qua MarkItDown (Task 3). */
  sourceFormat: "PDF" | "JSON";
  /** Số ký tự của file .md, tính cả YAML frontmatter. */
  charCount: number;
  /** Số ký tự phần thân sau khi bỏ frontmatter — đầu vào của bước chunking. */
  bodyCharCount: number;
  /** Tiêu đề gốc lấy từ frontmatter / metadata của crawler. */
  sourceTitle: string;
}

/**
 * Chunk kèm vị trí trong file gốc, dùng cho trình duyệt chunk ở trang
 * Kho tri thức. Nội dung được cắt thật từ `data/standardized/*.md` theo cửa sổ
 * ký tự cố định (chunk_size=800, overlap=100).
 */
export interface KbChunk extends Chunk {
  /** Số ký tự của chunk (≤ chunk_size). */
  charCount: number;
  /** Vị trí bắt đầu của chunk trong phần thân tài liệu. */
  charStart: number;
  /** Số ký tự ở đầu chunk trùng với chunk liền trước (0 nếu là chunk đầu). */
  overlapPrev: number;
  /** Số ký tự ở cuối chunk trùng với chunk liền sau (0 nếu là chunk cuối). */
  overlapNext: number;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export type PipelineStepId =
  | "semantic"
  | "lexical"
  | "merge"
  | "rerank"
  | "fallback"
  | "generation";

export type PipelineStepStatus =
  | "done"
  | "skipped"
  | "fallback"
  | "running"
  | "pending";

export interface SemanticHit {
  chunkId: string;
  cosine: number;
  rank: number;
}

export interface LexicalHit {
  chunkId: string;
  bm25: number;
  rank: number;
  matchedTerms: string[];
}

export interface MergeRow {
  chunkId: string;
  denseRank: number | null;
  sparseRank: number | null;
  rrf: number;
  fusedRank: number;
}

export interface RerankRow {
  chunkId: string;
  rankBefore: number;
  rankAfter: number;
  scoreBefore: number;
  scoreAfter: number;
}

export interface PageIndexNode {
  id: string;
  docId: string;
  title: string;
  depth: number;
  /** LLM có chọn nhánh này để đi tiếp không. */
  selected: boolean;
  reasoning: string;
}

export interface GenerationSlot {
  chunkId: string;
  /** Vị trí trước khi reorder. */
  originalIndex: number;
  /** Vị trí sau khi reorder `front + back[::-1]`. */
  finalIndex: number;
  position: "front" | "back";
}

export type StepDetail =
  | {
      kind: "semantic";
      model: string;
      dimensions: number;
      metric: string;
      collection: string;
      candidates: number;
      topK: number;
      hits: SemanticHit[];
    }
  | {
      kind: "lexical";
      algorithm: string;
      k1: number;
      b: number;
      corpusSize: number;
      avgDocLength: number;
      tokens: string[];
      hits: LexicalHit[];
    }
  | {
      kind: "merge";
      method: string;
      k: number;
      formula: string;
      rows: MergeRow[];
    }
  | {
      kind: "rerank";
      model: string;
      pairsScored: number;
      rows: RerankRow[];
    }
  | {
      kind: "fallback";
      triggered: boolean;
      topCosine: number;
      threshold: number;
      reason: string;
      treeNodes: PageIndexNode[];
    }
  | {
      kind: "generation";
      model: string;
      chunkCount: number;
      promptTokens: number;
      completionTokens: number;
      reorderStrategy: string;
      slots: GenerationSlot[];
    };

export interface PipelineStep {
  id: PipelineStepId;
  title: string;
  subtitle: string;
  durationMs: number;
  status: PipelineStepStatus;
  detail: StepDetail;
}

/** Nguồn tham khảo hiển thị dưới câu trả lời. */
export interface SourceCitation {
  chunkId: string;
  /** Điểm cuối cùng dùng để xếp hạng nguồn (rerank, hoặc PageIndex score). */
  score: number;
  scoreLabel: string;
  /** Đường đi của chunk: "semantic + BM25", "chỉ BM25", "PageIndex"… */
  retrievedBy: string;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  /** Chỉ có ở assistant. */
  steps?: PipelineStep[];
  sources?: SourceCitation[];
  totalMs?: number;
  /** true khi đang giả lập streaming. */
  streaming?: boolean;
  /** Số bước đã lộ ra trong lúc streaming (undefined = hiện tất cả). */
  revealedSteps?: number;
  usedFallback?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

/** Một câu hỏi mẫu có sẵn câu trả lời + trace pipeline. */
export interface MockAnswer {
  id: string;
  question: string;
  /** Từ khoá để so khớp câu hỏi người dùng gõ tự do. */
  keywords: string[];
  answer: string;
  steps: PipelineStep[];
  sources: SourceCitation[];
  totalMs: number;
  usedFallback: boolean;
}

// ---------------------------------------------------------------------------
// Trang Truy xuất (/retrieval) — so sánh bốn tầng trên cùng một truy vấn
// ---------------------------------------------------------------------------

/** Bốn tầng được đặt cạnh nhau ở trang Truy xuất. */
export type RetrievalStageKey = "semantic" | "lexical" | "merge" | "rerank";

/** Một dòng kết quả trong cột của một tầng. */
export interface RetrievalStageItem {
  chunkId: string;
  rank: number;
  /** Điểm gốc của tầng: cosine, BM25, RRF hoặc điểm cross-encoder. */
  score: number;
  /** Chuỗi hiển thị của `score` (số chữ số thập phân khác nhau theo tầng). */
  scoreLabel: string;
  /** `score` đã chuẩn hoá về [0, 1] để vẽ thanh — chỉ dùng cho hiển thị. */
  normalized: number;
  /** Ghi chú phụ: token BM25 khớp được, phép tính RRF, thay đổi hạng… */
  note?: string;
}

/** Một cột kết quả (một tầng của pipeline). */
export interface RetrievalStage {
  key: RetrievalStageKey;
  title: string;
  /** Model / tham số của tầng, hiển thị dưới tiêu đề cột. */
  subtitle: string;
  /** Tên thang điểm, ví dụ "cosine" hoặc "RRF". */
  scoreName: string;
  durationMs: number;
  items: RetrievalStageItem[];
  /** Một câu giải thích ý nghĩa thang điểm của tầng. */
  caption: string;
}

/** Toàn bộ dữ liệu một lần chạy thử ở trang Truy xuất. */
export interface RetrievalRun {
  id: string;
  question: string;
  /** true = truy vấn lạc đề, dùng để demo nhánh PageIndex fallback. */
  offTopic: boolean;
  /** Đúng bốn tầng, theo thứ tự semantic → lexical → merge → rerank. */
  stages: RetrievalStage[];
  /** Bảng phân rã RRF lấy từ bước merge. */
  mergeRows: MergeRow[];
  rrfK: number;
  /** Điểm cosine gốc của top-1 — căn cứ ĐÚNG để so với ngưỡng fallback. */
  topCosine: number;
  /** Điểm RRF của top-1 sau fuse — căn cứ SAI, chỉ phụ thuộc thứ hạng. */
  topRrf: number;
  /** Chi tiết bước fallback của lần chạy thật (null nếu pipeline không có bước này). */
  fallbackDetail: Extract<StepDetail, { kind: "fallback" }> | null;
  /** Toàn bộ bước — dùng cho bảng độ trễ. */
  steps: PipelineStep[];
  totalMs: number;
  usedFallback: boolean;
}

/** Một truy vấn mẫu bấm được ở trang Truy xuất. */
export interface RetrievalSample {
  id: string;
  question: string;
  /** Nhãn ngắn hiển thị trên chip. */
  label: string;
  offTopic: boolean;
}

// ---------------------------------------------------------------------------
// Evaluation — RAGAS, golden dataset, so sánh A/B
// ---------------------------------------------------------------------------

/** Bốn chỉ số RAGAS bài lab yêu cầu. */
export type RagasMetricId =
  | "faithfulness"
  | "answerRelevance"
  | "contextRecall"
  | "contextPrecision";

/** Bộ điểm RAGAS, mỗi chỉ số nằm trong [0, 1]. */
export type RagasScores = Record<RagasMetricId, number>;

/** Một thẻ chỉ số ở hàng tổng quan trang Đánh giá. */
export interface RagasMetricSummary {
  id: RagasMetricId;
  /** Tên gốc trong RAGAS, ví dụ "Faithfulness". */
  label: string;
  /** Tên tiếng Việt hiển thị kèm. */
  labelVi: string;
  /** Chỉ số này đo cái gì — hiện dưới ô thống kê. */
  description: string;
  value: number;
  /** Điểm của config đối chứng, dùng để tính delta. */
  baseline: number;
  /** value − baseline. */
  delta: number;
  threshold: number;
  passed: boolean;
}

export type RetrievalConfigId =
  | "dense_only"
  | "bm25_only"
  | "hybrid_rrf"
  | "hybrid_rerank";

/** Kết quả chạy golden dataset với một cấu hình truy xuất. */
export interface RetrievalConfigResult {
  id: RetrievalConfigId;
  label: string;
  description: string;
  /** Config đối chứng — mọi cột Δ đều so với config này. */
  isBaseline: boolean;
  /** Config chính đang dùng trong demo. */
  isPrimary: boolean;
  scores: RagasScores;
  avgLatencyMs: number;
  passedCases: number;
  totalCases: number;
}

/** Một cặp Q&A trong golden dataset. */
export interface GoldenCase {
  id: string;
  question: string;
  category: string;
  /** Tài liệu kỳ vọng chứa đáp án (id trong DOCUMENTS). */
  expectedDocIds: string[];
  /** Chunk kỳ vọng chứa đáp án — dùng để chấm Context Recall ở mức chunk. */
  expectedChunkIds: string[];
  /** Tài liệu thực tế được truy xuất ở top-k. */
  retrievedDocIds: string[];
  /** Chunk thực tế đưa vào prompt. */
  retrievedChunkIds: string[];
  scores: RagasScores;
  /** Đạt khi cả bốn chỉ số ≥ ngưỡng. */
  passed: boolean;
  usedFallback: boolean;
  /** Cosine gốc của chunk top-1, dùng để so ngưỡng fallback. */
  topCosine: number;
  generatedAnswer: string;
  /** Ghi chú của người chấm — vì sao đạt hoặc không đạt. */
  note: string;
}

/** Bước hỏng của một ca tệ: truy xuất sai chunk hay sinh sai từ chunk đúng. */
export type EvalFailureStage = "retrieval" | "generation";

export interface WorstCaseAnalysis {
  caseId: string;
  failureStage: EvalFailureStage;
  /** Điểm hỏng cụ thể: chunking, semantic, BM25, rerank, generation… */
  failurePoint: string;
  rootCause: string;
  /** Bằng chứng quan sát được trong log/trace. */
  evidence: string;
}

/** Một đề xuất cải tiến kèm tác động kỳ vọng. */
export interface EvalImprovement {
  id: string;
  title: string;
  action: string;
  expectedImpact: string;
  /** Các ca trong golden dataset mà đề xuất này nhắm tới. */
  targetCaseIds: string[];
  effort: "thấp" | "trung bình" | "cao";
}

/** Một truy vấn làm cosine top-1 rơi xuống dưới ngưỡng và kích hoạt PageIndex. */
export interface FallbackQueryRecord {
  id: string;
  query: string;
  topCosine: number;
  /** Vì sao điểm cosine thấp. */
  reason: string;
  /** Kết quả sau khi PageIndex duyệt cây mục lục. */
  outcome: string;
  resolved: boolean;
  /** Có trong golden dataset không — nếu có thì là id của ca đó. */
  caseId?: string;
}

/** Thông tin lần chạy đánh giá, hiển thị ở sidebar và đầu trang. */
export interface EvaluationRunMeta {
  runId: string;
  ranAt: string;
  /** LLM đóng vai giám khảo khi chấm RAGAS. */
  judgeModel: string;
  datasetSize: number;
  primaryConfigLabel: string;
  notes: string;
}
