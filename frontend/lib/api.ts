/**
 * Client HTTP gõ kiểu cho backend FastAPI trong `api/`.
 *
 * Các type ở đây khớp 1-1 với `api/schemas.py` — đó là nguồn sự thật về shape
 * dữ liệu. Đổi bên nào thì phải đổi cả hai, và giữ nguyên tên field snake_case
 * của Python để đọc response thô là đối chiếu được ngay.
 *
 * Lớp này KHÔNG biết gì về mock. Nó chỉ gọi mạng và ném `ApiError` khi hỏng;
 * việc quyết định rơi về mock nằm ở `lib/data.ts`.
 */

/** Base URL của backend. Đổi bằng biến môi trường, xem `.env.local.example`. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"
).replace(/\/+$/, "");

/**
 * Timeout 120 giây — cố tình để rất rộng, KHÔNG phải 5-10s như mặc định thường thấy:
 *
 * - Lần gọi đầu sau khi backend khởi động mất 20–30s vì phải nạp `BAAI/bge-m3`.
 * - Nhánh PageIndex fallback (truy vấn lạc đề) đo thật có lúc lên tới ~92s vì
 *   phải upload PDF rồi poll kết quả.
 *
 * Đặt timeout ngắn thì mọi truy vấn lạc đề đều báo lỗi giả — đúng cái ca cần demo.
 */
export const API_TIMEOUT_MS = 120_000;

/** Sau mốc này thì báo người dùng biết là đang nạp model, không phải treo. */
export const API_SLOW_HINT_MS = 8_000;

// ---------------------------------------------------------------------------
// Type khớp api/schemas.py
// ---------------------------------------------------------------------------

export type ApiDocType = "legal" | "news";
export type ApiCustomerRole = "buyer" | "seller" | "both";
export type ApiStageKey =
  | "semantic"
  | "lexical"
  | "merge"
  | "rerank"
  | "fallback"
  | "generation";

/** "live" = đang chạy code thật · "mock" = task chưa implement, trả dữ liệu giả. */
export type ApiWiring = "live" | "mock";

/** schemas.py::ChunkHit — bốn trường điểm cố tình để TÁCH RIÊNG, đừng gộp. */
export interface ApiChunkHit {
  chunk_id: string;
  content: string;
  source: string;
  doc_type: ApiDocType;
  customer_role: ApiCustomerRole;
  chunk_index: number;
  title: string | null;
  url: string | null;
  /** Cosine gốc từ semantic search [0,1] — căn cứ DUY NHẤT để so ngưỡng fallback. */
  cosine: number | null;
  /** Điểm BM25 thô, không chặn trên. */
  bm25: number | null;
  /** Điểm sau Reciprocal Rank Fusion — chỉ phụ thuộc thứ hạng. */
  rrf: number | null;
  /** Điểm cross-encoder sau rerank. */
  rerank: number | null;
  rank: number | null;
}

/** schemas.py::DocumentSummary */
export interface ApiDocumentSummary {
  doc_id: string;
  title: string;
  file_name: string;
  standardized_file: string;
  doc_type: ApiDocType;
  customer_role: ApiCustomerRole;
  url: string | null;
  chunk_count: number;
  char_count: number;
  token_count: number;
}

/** schemas.py::KnowledgeStats */
export interface ApiKnowledgeStats {
  documents: number;
  chunks: number;
  chars: number;
  tokens: number;
  embedding_model: string;
  embedding_dim: number;
  chunk_size: number;
  chunk_overlap: number;
  vector_store: string;
  collection: string;
  distance: string;
  by_doc_type: Record<string, number>;
  by_customer_role: Record<string, number>;
}

/**
 * Một chunk trả về từ `GET /api/knowledge/chunks`.
 * Endpoint này trả dict thô (không qua response_model) — xem `api/main.py`.
 */
export interface ApiKnowledgeChunk {
  chunk_id: string;
  chunk_index: number;
  content: string;
  chars: number;
  source: string;
  doc_type: ApiDocType | null;
  customer_role: ApiCustomerRole | null;
}

/** schemas.py::StageResult */
export interface ApiStageResult {
  key: ApiStageKey;
  label: string;
  wiring: ApiWiring;
  duration_ms: number;
  hits: ApiChunkHit[];
  note: string | null;
}

/** schemas.py::FallbackDecision — so `top_cosine` với `threshold`, KHÔNG so `top_rrf`. */
export interface ApiFallbackDecision {
  triggered: boolean;
  threshold: number;
  top_cosine: number;
  top_rrf: number | null;
  reason: string;
}

/** schemas.py::RetrieveRequest */
export interface ApiRetrieveRequest {
  query: string;
  top_k?: number;
  score_threshold?: number;
  use_reranking?: boolean;
}

/** schemas.py::RetrieveResponse */
export interface ApiRetrieveResponse {
  query: string;
  stages: ApiStageResult[];
  fallback: ApiFallbackDecision;
  results: ApiChunkHit[];
  total_ms: number;
}

/** schemas.py::ChatRequest */
export interface ApiChatRequest {
  query: string;
  top_k?: number;
}

/** schemas.py::ChatResponse */
export interface ApiChatResponse {
  query: string;
  answer: string;
  sources: ApiChunkHit[];
  retrieval_source: "hybrid" | "pageindex" | "none";
  stages: ApiStageResult[];
  total_ms: number;
  /** Tình trạng của riêng bước sinh câu trả lời (Task 10). */
  wiring: ApiWiring;
}

/** schemas.py::StageWiring */
export interface ApiStageWiring {
  key: string;
  task: string;
  label: string;
  wiring: ApiWiring;
  detail: string;
}

/** schemas.py::HealthResponse */
// --- Evaluation (khớp api/schemas.py) -------------------------------------

export interface ApiGoldenCase {
  question: string;
  expected_answer: string;
  expected_context: string | null;
}

export interface ApiEvalConfigScores {
  config: string;
  faithfulness: number | null;
  answer_relevancy: number | null;
  context_recall: number | null;
  context_precision: number | null;
  average: number | null;
}

export interface ApiEvalWorstCase {
  question: string;
  faithfulness: number | null;
  answer_relevancy: number | null;
  context_recall: number | null;
  context_precision: number | null;
  weakest_metric: string | null;
}

export interface ApiEvaluationResponse {
  has_results: boolean;
  framework: string | null;
  /** Vì sao chưa chạy được, chỉ có khi has_results = false. */
  blocked_reason: string | null;
  golden_total: number;
  golden_required: number;
  golden_cases: ApiGoldenCase[];
  configs: ApiEvalConfigScores[];
  baseline_config: string | null;
  worst_cases: ApiEvalWorstCase[];
  /** Chỉ 1 mục generic — phân tích đầy đủ nằm trong results_md. */
  recommendations: string[];
  /** Báo cáo markdown do group_project/evaluation/report.py dựng. */
  results_md: string | null;
}

export interface ApiHealthResponse {
  ok: boolean;
  chroma_ready: boolean;
  chunks_indexed: number;
  stages: ApiStageWiring[];
  live_count: number;
  total_count: number;
}

// ---------------------------------------------------------------------------
// Lỗi có kiểu — lớp trên (lib/data.ts) bắt cái này để rơi về mock
// ---------------------------------------------------------------------------

export type ApiErrorKind =
  /** Quá 120s — thường là backend đang nạp model hoặc PageIndex chạy quá lâu. */
  | "timeout"
  /** Không kết nối được: backend chưa chạy, sai cổng, hoặc CORS chặn. */
  | "offline"
  /** Kết nối được nhưng backend trả 4xx/5xx (ví dụ 503 khi chưa chạy Task 4). */
  | "http"
  /** Backend trả về thứ không phải JSON hợp lệ. */
  | "parse";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly url: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    url: string,
    status?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.url = url;
    this.status = status;
    // Cần thiết vì tsconfig target=ES2017 và class kế thừa Error:
    // không có dòng này thì `instanceof ApiError` trả false sau khi transpile.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Câu tiếng Việt hiển thị thẳng cho người dùng. */
  get viMessage(): string {
    switch (this.kind) {
      case "offline":
        return "Không kết nối được backend.";
      case "timeout":
        return `Backend không phản hồi trong ${API_TIMEOUT_MS / 1000}s.`;
      case "http":
        return this.status === 503
          ? "Backend chưa index ChromaDB (chạy: python -m src.task4_chunking_indexing)."
          : `Backend trả lỗi HTTP ${this.status ?? "?"}.`;
      case "parse":
        return "Backend trả về dữ liệu không đọc được.";
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Mô tả ngắn gọn bất kỳ lỗi nào để gắn vào banner. */
export function describeError(error: unknown): string {
  if (isApiError(error)) return error.viMessage;
  if (error instanceof Error) return error.message;
  return "Lỗi không xác định.";
}

// ---------------------------------------------------------------------------
// Lõi gọi mạng
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const timeoutMs = init?.timeoutMs ?? API_TIMEOUT_MS;

  // AbortController thay vì AbortSignal.timeout() để chắc chắn chạy trên mọi
  // trình duyệt mà bài lab có thể được mở, và để phân biệt được timeout với
  // lỗi mạng (AbortSignal.timeout ném DOMException khó phân loại).
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError(
        "timeout",
        `Quá ${timeoutMs}ms khi gọi ${path}`,
        url,
      );
    }
    throw new ApiError(
      "offline",
      error instanceof Error ? error.message : `Không gọi được ${path}`,
      url,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Cố đọc `detail` của FastAPI để thông báo cụ thể hơn mã lỗi trần.
    let detail = "";
    try {
      const body = (await response.json()) as { detail?: string };
      detail = typeof body?.detail === "string" ? body.detail : "";
    } catch {
      // body không phải JSON — bỏ qua, dùng mã lỗi là đủ
    }
    throw new ApiError(
      "http",
      detail || `${response.status} ${response.statusText}`,
      url,
      response.status,
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("parse", `Response của ${path} không phải JSON`, url);
  }
}

function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

// ---------------------------------------------------------------------------
// Endpoint
// ---------------------------------------------------------------------------

/**
 * Tầng nào đang chạy code thật, tầng nào còn mock.
 * Timeout ngắn hơn hẳn: endpoint này không đụng tới model nên phải trả về ngay;
 * nếu chậm thì coi như backend chưa sẵn sàng.
 */
export function fetchHealth(): Promise<ApiHealthResponse> {
  return request<ApiHealthResponse>("/api/health", { timeoutMs: 8_000 });
}

export function fetchKnowledgeStats(): Promise<ApiKnowledgeStats> {
  return request<ApiKnowledgeStats>("/api/knowledge/stats");
}

/**
 * Kết quả evaluation đã chạy trước đó.
 *
 * Endpoint này KHÔNG tự chạy RAGAS (một lượt mất vài phút và gọi LLM rất nhiều
 * lần), nên nó nhanh — dùng timeout ngắn hơn mặc định.
 */
export function fetchEvaluation(): Promise<ApiEvaluationResponse> {
  return request<ApiEvaluationResponse>("/api/evaluation", { timeoutMs: 20_000 });
}

export function fetchKnowledgeDocuments(): Promise<ApiDocumentSummary[]> {
  return request<ApiDocumentSummary[]>("/api/knowledge/documents");
}

export function fetchKnowledgeChunks(
  source: string,
  limit = 50,
): Promise<ApiKnowledgeChunk[]> {
  const qs = new URLSearchParams({ source, limit: String(limit) });
  return request<ApiKnowledgeChunk[]>(`/api/knowledge/chunks?${qs}`);
}

export function postRetrieve(
  body: ApiRetrieveRequest,
): Promise<ApiRetrieveResponse> {
  return postJson<ApiRetrieveResponse>("/api/retrieve", {
    top_k: 5,
    score_threshold: 0.48,
    use_reranking: true,
    ...body,
  });
}

export function postChat(body: ApiChatRequest): Promise<ApiChatResponse> {
  return postJson<ApiChatResponse>("/api/chat", { top_k: 5, ...body });
}
