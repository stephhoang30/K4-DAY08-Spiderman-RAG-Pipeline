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
