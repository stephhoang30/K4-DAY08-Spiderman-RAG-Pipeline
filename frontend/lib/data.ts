/**
 * Lớp truy cập dữ liệu — chỗ DUY NHẤT quyết định lấy từ API thật hay từ mock.
 *
 *     try   -> gọi API, trả { data, source: "live" }
 *     catch -> trả { data: mock, source: "mock", error }
 *
 * Mọi trang đi qua đây và không import `lib/mock` để lấy dữ liệu nữa. Nhờ vậy
 * người chấm bài mở frontend mà quên bật backend thì app vẫn chạy đầy đủ, chỉ
 * đổi nhãn thành "dữ liệu demo".
 *
 * Mock KHÔNG bị xoá: nó là bản dự phòng, và trang Đánh giá vẫn hoàn toàn dựa
 * vào nó vì backend chưa có endpoint eval.
 */

import {
  describeError,
  fetchHealth,
  fetchKnowledgeChunks,
  fetchKnowledgeDocuments,
  fetchKnowledgeStats,
  postChat,
  postRetrieve,
  type ApiHealthResponse,
  type ApiRetrieveRequest,
} from "@/lib/api";
import { toChatAnswer, toKbChunks, toKnowledge, toRetrievalRun } from "@/lib/adapters";
import { registerLiveChunks, registerLiveDocuments } from "@/lib/chunkRegistry";
import type {
  DataSource,
  DocFileStats,
  KbChunk,
  KnowledgeDoc,
  PipelineStep,
  RetrievalRun,
  SourceCitation,
  Wiring,
} from "@/lib/types";
import {
  DOCUMENTS,
  DOC_FILE_STATS,
  PIPELINE_CONFIG,
  TOTAL_CHARS,
  TOTAL_CHUNKS,
  TOTAL_TOKENS,
  buildDefaultAnswer,
  getKbChunks,
  matchAnswer,
  resolveRetrievalRun,
} from "@/lib/mock";

/** "live" = số thật từ backend · "mock" = dữ liệu demo trong repo. */
export type { DataSource } from "@/lib/types";

export interface Loaded<T> {
  data: T;
  source: DataSource;
  /** Vì sao phải rơi về mock. Chỉ có khi `source === "mock"` và đã thử gọi API. */
  error?: string;
}

const live = <T,>(data: T): Loaded<T> => ({ data, source: "live" });
const mock = <T,>(data: T, error?: string): Loaded<T> => ({
  data,
  source: "mock",
  error,
});

/**
 * Trang Đánh giá chưa có endpoint tương ứng ở backend — cố tình giữ nguyên mock
 * thay vì bịa số. Xem `api/README.md`: chỉ có health / knowledge / retrieve / chat.
 */
export const EVALUATION_SOURCE: DataSource = "mock";

// ---------------------------------------------------------------------------
// Tình trạng backend
// ---------------------------------------------------------------------------

/** Gọi `/api/health`. Không ném lỗi — backend tắt thì trả `{ data: null }`. */
export async function checkBackend(): Promise<Loaded<ApiHealthResponse | null>> {
  try {
    return live(await fetchHealth());
  } catch (error) {
    return mock(null, describeError(error));
  }
}

// ---------------------------------------------------------------------------
// Kho tri thức
// ---------------------------------------------------------------------------

export interface KnowledgeSnapshot {
  docs: KnowledgeDoc[];
  fileStats: Record<string, DocFileStats>;
  totals: { documents: number; chunks: number; tokens: number; chars: number };
  config: {
    embeddingModel: string;
    embeddingDim: number;
    chunkSize: number;
    chunkOverlap: number;
    vectorStore: string;
    collection: string;
    distance: string;
  };
}

function byDocId(stats: DocFileStats[]): Record<string, DocFileStats> {
  return Object.fromEntries(stats.map((row) => [row.docId, row]));
}

const MOCK_KNOWLEDGE: KnowledgeSnapshot = {
  docs: DOCUMENTS,
  fileStats: byDocId(DOC_FILE_STATS),
  totals: {
    documents: DOCUMENTS.length,
    chunks: TOTAL_CHUNKS,
    tokens: TOTAL_TOKENS,
    chars: TOTAL_CHARS,
  },
  config: {
    embeddingModel: PIPELINE_CONFIG.embeddingModel,
    embeddingDim: PIPELINE_CONFIG.embeddingDim,
    chunkSize: PIPELINE_CONFIG.chunkSize,
    chunkOverlap: PIPELINE_CONFIG.chunkOverlap,
    vectorStore: PIPELINE_CONFIG.vectorStore,
    collection: PIPELINE_CONFIG.collection,
    distance: PIPELINE_CONFIG.similarity,
  },
};

export async function loadKnowledge(): Promise<Loaded<KnowledgeSnapshot>> {
  try {
    const [apiDocs, apiStats] = await Promise.all([
      fetchKnowledgeDocuments(),
      fetchKnowledgeStats(),
    ]);
    const { docs, fileStats, stats } = toKnowledge(apiDocs, apiStats);
    registerLiveDocuments(docs);
    return live({
      docs,
      fileStats: byDocId(fileStats),
      totals: {
        documents: stats.documents,
        chunks: stats.chunks,
        tokens: stats.tokens,
        chars: stats.chars,
      },
      config: {
        embeddingModel: stats.embedding_model,
        embeddingDim: stats.embedding_dim,
        chunkSize: stats.chunk_size,
        chunkOverlap: stats.chunk_overlap,
        vectorStore: stats.vector_store,
        collection: stats.collection,
        distance: stats.distance,
      },
    });
  } catch (error) {
    return mock(MOCK_KNOWLEDGE, describeError(error));
  }
}

/**
 * Chunk của một tài liệu.
 *
 * @param source Tên file gốc (`KnowledgeDoc.fileName`) — đúng tham số mà
 *   `/api/knowledge/chunks` cần.
 * @param docId Dùng để tra mock khi backend tắt.
 */
export async function loadDocumentChunks(
  source: string,
  docId: string,
  wantLive: boolean,
): Promise<Loaded<KbChunk[]>> {
  if (!wantLive) return mock(getKbChunks(docId));
  try {
    const chunks = toKbChunks(await fetchKnowledgeChunks(source, 500));
    registerLiveChunks(chunks);
    return live(chunks);
  } catch (error) {
    return mock(getKbChunks(docId), describeError(error));
  }
}

// ---------------------------------------------------------------------------
// Truy xuất
// ---------------------------------------------------------------------------

export async function runRetrieval(
  query: string,
  options: Omit<ApiRetrieveRequest, "query"> = {},
): Promise<Loaded<RetrievalRun>> {
  try {
    const res = await postRetrieve({ query, ...options });
    const { run, chunks, docs } = toRetrievalRun(res);
    registerLiveChunks(chunks);
    // fillOnly: tài liệu dựng từ hit chỉ có title/url, đừng đè bản đầy đủ mà
    // trang Kho tri thức đã nạp (bản đó có số chunk/ký tự/token thật).
    registerLiveDocuments(docs, true);
    return live(run);
  } catch (error) {
    return mock(resolveRetrievalRun(query), describeError(error));
  }
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatResult {
  answer: string;
  steps: PipelineStep[];
  sources: SourceCitation[];
  totalMs: number;
  usedFallback: boolean;
  /** Tình trạng của riêng bước sinh câu trả lời (Task 10). */
  generationWiring?: Wiring;
}

export async function runChat(query: string): Promise<Loaded<ChatResult>> {
  try {
    const res = await postChat({ query });
    const adapted = toChatAnswer(res);
    registerLiveChunks(adapted.chunks);
    registerLiveDocuments(adapted.docs, true);
    return live({
      answer: adapted.answer,
      steps: adapted.steps,
      sources: adapted.sources,
      totalMs: adapted.totalMs,
      usedFallback: adapted.usedFallback,
      generationWiring: adapted.generationWiring,
    });
  } catch (error) {
    const fallback = matchAnswer(query) ?? buildDefaultAnswer(query);
    return mock(
      {
        answer: fallback.answer,
        steps: fallback.steps,
        sources: fallback.sources,
        totalMs: fallback.totalMs,
        usedFallback: fallback.usedFallback,
      },
      describeError(error),
    );
  }
}
