/**
 * Đổi response của backend (`lib/api.ts`, khớp `api/schemas.py`) sang các kiểu
 * mà UI đang dùng (`lib/types.ts`).
 *
 * Nguyên tắc khi viết file này: **không bịa số**. Trường nào API không trả thì
 * để trống/0 và component hiển thị bỏ qua, chứ không điền số cho đẹp bảng.
 * Cụ thể những chỗ API thật sự không có:
 *
 *   - token của từng chunk       → 0 (chỉ `/api/knowledge/documents` có token cả file)
 *   - `matchedTerms` của BM25    → [] (backend không trả token khớp)
 *   - `avgDocLength` của BM25    → 0
 *   - cây mục lục PageIndex      → [] (backend không trả node đã duyệt)
 *   - promptTokens/completionTokens → 0
 *
 * Ngược lại, những số này là ĐO THẬT và được lấy nguyên: cosine, bm25, rrf,
 * rerank, thứ hạng từng tầng, thời gian từng tầng, quyết định fallback, số
 * chunk/ký tự/token của corpus, và độ chồng lấn giữa hai chunk liền nhau.
 */

import type {
  ApiChatResponse,
  ApiChunkHit,
  ApiDocumentSummary,
  ApiKnowledgeChunk,
  ApiKnowledgeStats,
  ApiRetrieveResponse,
  ApiStageResult,
} from "@/lib/api";
import type {
  Chunk,
  DocFileStats,
  KbChunk,
  KnowledgeDoc,
  MergeRow,
  PipelineStep,
  PipelineStepId,
  RerankRow,
  RetrievalRun,
  RetrievalStage,
  RetrievalStageItem,
  SourceCitation,
  StepDetail,
  Wiring,
} from "@/lib/types";
import { DOCUMENTS, PIPELINE_CONFIG } from "@/lib/mock";
import { formatScore, truncate } from "@/lib/utils";

const RRF_K = PIPELINE_CONFIG.rrfK;
/** Điểm RRF tối đa (top-1 ở cả hai danh sách) — dùng để chuẩn hoá thanh vẽ. */
const RRF_MAX = 2 / (RRF_K + 1);

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * `doc_id` của backend = tên file bỏ đuôi (xem `api/main.py::knowledge_documents`).
 * Dùng đúng quy tắc đó để chunk trong kết quả truy xuất ghép được với tài liệu.
 */
function docIdOf(source: string): string {
  return source.replace(/\.(pdf|json|md)$/i, "");
}

/**
 * Metadata mô tả (chủ đề, nhãn trích dẫn, tóm tắt) của 13 tài liệu thật.
 * Backend không trả mấy trường này, nhưng chúng nói về ĐÚNG những file đó nên
 * dùng lại được. Mọi con số (chunk, ký tự, token) vẫn lấy từ API, không lấy ở đây.
 */
const DESCRIPTIVE_BY_FILE = new Map(DOCUMENTS.map((doc) => [doc.fileName, doc]));

// ---------------------------------------------------------------------------
// Chunk & tài liệu
// ---------------------------------------------------------------------------

/** Tiêu đề ngắn cho một chunk: dòng có nội dung đầu tiên, bỏ dấu markdown. */
function sectionOf(content: string, chunkIndex: number): string {
  const line = content
    .split("\n")
    .map((row) => row.trim())
    .find((row) => row.length > 0);
  if (!line) return `Đoạn #${chunkIndex}`;
  return truncate(line.replace(/^#+\s*/, "").replace(/^\|\s*/, ""), 64);
}

function excerptOf(content: string): string {
  return truncate(content.replace(/\s+/g, " ").trim(), 220);
}

export function chunkFromHit(hit: ApiChunkHit): Chunk {
  return {
    id: hit.chunk_id,
    docId: docIdOf(hit.source),
    index: hit.chunk_index,
    section: sectionOf(hit.content, hit.chunk_index),
    excerpt: excerptOf(hit.content),
    content: hit.content,
    // Endpoint truy xuất không trả token/chunk. 0 = "không biết", UI sẽ ẩn đi.
    tokens: 0,
  };
}

/** Tài liệu dựng tạm từ một hit — chỉ đủ để hiện nhãn, không có số liệu corpus. */
export function docFromHit(hit: ApiChunkHit): KnowledgeDoc {
  const described = DESCRIPTIVE_BY_FILE.get(hit.source);
  return {
    id: docIdOf(hit.source),
    title: hit.title ?? described?.title ?? hit.source,
    fileName: hit.source,
    type: hit.doc_type,
    url: hit.url ?? described?.url ?? "",
    topic: described?.topic ?? hit.doc_type,
    customerRole: hit.customer_role,
    citation: described?.citation ?? hit.title ?? hit.source,
    chunkCount: 0,
    tokenCount: 0,
    crawledAt: "",
    summary: described?.summary ?? "",
  };
}

// ---------------------------------------------------------------------------
// /api/knowledge/* → trang Kho tri thức
// ---------------------------------------------------------------------------

export interface AdaptedKnowledge {
  docs: KnowledgeDoc[];
  fileStats: DocFileStats[];
  stats: ApiKnowledgeStats;
}

export function toKnowledge(
  apiDocs: ApiDocumentSummary[],
  stats: ApiKnowledgeStats,
): AdaptedKnowledge {
  const docs: KnowledgeDoc[] = apiDocs.map((doc) => {
    const described = DESCRIPTIVE_BY_FILE.get(doc.file_name);
    return {
      id: doc.doc_id,
      title: doc.title,
      fileName: doc.file_name,
      type: doc.doc_type,
      url: doc.url ?? described?.url ?? "",
      topic: described?.topic ?? doc.doc_type,
      customerRole: doc.customer_role,
      citation: described?.citation ?? doc.title,
      // Ba số dưới đây là ĐO THẬT từ ChromaDB + file .md
      chunkCount: doc.chunk_count,
      tokenCount: doc.token_count,
      crawledAt: "",
      summary: described?.summary ?? "",
    };
  });

  const fileStats: DocFileStats[] = apiDocs.map((doc) => ({
    docId: doc.doc_id,
    standardizedFile: doc.standardized_file,
    landingFile: doc.file_name,
    sourceFormat: doc.file_name.toLowerCase().endsWith(".pdf") ? "PDF" : "JSON",
    charCount: doc.char_count,
    // API đếm cả YAML frontmatter và không tách phần thân ra — để 0 thay vì
    // đoán, UI sẽ bỏ qua dòng "Thân tài liệu".
    bodyCharCount: 0,
    sourceTitle: doc.title,
  }));

  return { docs, fileStats, stats };
}

/**
 * Độ chồng lấn thật giữa cuối chunk `a` và đầu chunk `b`.
 *
 * KHÔNG dùng hằng số 100: `RecursiveCharacterTextSplitter` cắt theo ranh giới
 * đoạn/câu trước, nên overlap thực tế đo được dao động 0–100 ký tự (có cặp
 * chunk trùng 97 ký tự, có cặp trùng 0). Chặn trên bằng `chunkOverlap` để vòng
 * lặp không quét cả chunk.
 */
function overlapLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length, PIPELINE_CONFIG.chunkOverlap);
  for (let n = max; n > 0; n -= 1) {
    if (a.endsWith(b.slice(0, n))) return n;
  }
  return 0;
}

export function toKbChunks(apiChunks: ApiKnowledgeChunk[]): KbChunk[] {
  const sorted = [...apiChunks].sort((a, b) => a.chunk_index - b.chunk_index);
  const overlaps = sorted.map((chunk, i) =>
    i === sorted.length - 1
      ? 0
      : overlapLength(chunk.content, sorted[i + 1].content),
  );

  let charStart = 0;
  return sorted.map((chunk, i) => {
    const row: KbChunk = {
      id: chunk.chunk_id,
      docId: docIdOf(chunk.source),
      index: chunk.chunk_index,
      section: sectionOf(chunk.content, chunk.chunk_index),
      excerpt: excerptOf(chunk.content),
      content: chunk.content,
      // Không có token/chunk từ API — 0 để UI ẩn, không bịa.
      tokens: 0,
      charCount: chunk.chars,
      charStart,
      overlapPrev: i === 0 ? 0 : overlaps[i - 1],
      overlapNext: overlaps[i],
    };
    charStart += chunk.chars - overlaps[i];
    return row;
  });
}

// ---------------------------------------------------------------------------
// /api/retrieve → trang Truy xuất
// ---------------------------------------------------------------------------

/**
 * Backend trả `stages` theo thứ tự cố định [semantic, lexical, merge, rerank]
 * rồi nối thêm một tầng phụ (Pipeline Task 9 hoặc PageIndex fallback).
 * Tầng phụ của Task 9 dùng LẠI key "rerank", nên không thể tra bằng key —
 * phải giữ tham chiếu tới đúng bốn tầng lõi rồi coi phần còn lại là tầng phụ.
 */
function splitStages(stages: ApiStageResult[]) {
  const core = new Set<ApiStageResult>();
  const take = (key: ApiStageResult["key"]) => {
    const found = stages.find((stage) => !core.has(stage) && stage.key === key);
    if (found) core.add(found);
    return found;
  };
  const semantic = take("semantic");
  const lexical = take("lexical");
  const merge = take("merge");
  const rerank = take("rerank");
  const extras = stages.filter((stage) => !core.has(stage));
  return { semantic, lexical, merge, rerank, extras };
}

function rankMap(stage: ApiStageResult | undefined): Map<string, number> {
  const map = new Map<string, number>();
  stage?.hits.forEach((hit, i) => map.set(hit.chunk_id, hit.rank ?? i + 1));
  return map;
}

function emptyStage(
  key: RetrievalStage["key"],
  title: string,
  subtitle: string,
  scoreName: string,
): RetrievalStage {
  return {
    key,
    title,
    subtitle,
    scoreName,
    durationMs: 0,
    items: [],
    caption: "Tầng này không trả về kết quả nào trong lần chạy vừa rồi.",
    wiring: "mock",
  };
}

export interface AdaptedRetrieval {
  run: RetrievalRun;
  chunks: Chunk[];
  docs: KnowledgeDoc[];
}

export function toRetrievalRun(res: ApiRetrieveResponse): AdaptedRetrieval {
  const { semantic, lexical, merge, rerank, extras } = splitStages(res.stages);
  const denseRanks = rankMap(semantic);
  const sparseRanks = rankMap(lexical);
  const mergeRanks = rankMap(merge);

  // ---- Chunk & tài liệu xuất hiện ở bất kỳ đâu trong lần chạy này ----
  const seen = new Map<string, ApiChunkHit>();
  for (const stage of res.stages) {
    for (const hit of stage.hits) if (!seen.has(hit.chunk_id)) seen.set(hit.chunk_id, hit);
  }
  for (const hit of res.results) if (!seen.has(hit.chunk_id)) seen.set(hit.chunk_id, hit);
  const hits = [...seen.values()];
  const chunks = hits.map(chunkFromHit);
  const docs = [...new Map(hits.map((h) => [docIdOf(h.source), docFromHit(h)])).values()];

  // ---- Cột 1: Semantic (cosine gốc) ----
  const semanticStage: RetrievalStage = semantic
    ? {
        key: "semantic",
        title: "Semantic",
        subtitle: `${PIPELINE_CONFIG.vectorStore} · ${PIPELINE_CONFIG.embeddingModel} · ${PIPELINE_CONFIG.embeddingDim}d`,
        scoreName: "cosine",
        durationMs: semantic.duration_ms,
        wiring: semantic.wiring,
        note: semantic.note ?? undefined,
        caption:
          "Thang thật trong [0, 1]. Đây là điểm duy nhất được đem so với ngưỡng fallback.",
        items: semantic.hits.map<RetrievalStageItem>((hit, i) => {
          const cosine = hit.cosine ?? 0;
          return {
            chunkId: hit.chunk_id,
            rank: hit.rank ?? i + 1,
            score: cosine,
            scoreLabel: formatScore(cosine, 4),
            normalized: clamp01(cosine),
          };
        }),
      }
    : emptyStage("semantic", "Semantic", PIPELINE_CONFIG.embeddingModel, "cosine");

  // ---- Cột 2: BM25 ----
  const maxBm25 = Math.max(
    ...(lexical?.hits.map((hit) => hit.bm25 ?? 0) ?? [0]),
    1,
  );
  const lexicalStage: RetrievalStage = lexical
    ? {
        key: "lexical",
        title: "BM25",
        subtitle: `${PIPELINE_CONFIG.lexicalAlgorithm} · k1=${PIPELINE_CONFIG.bm25K1}, b=${PIPELINE_CONFIG.bm25B}`,
        scoreName: "BM25",
        durationMs: lexical.duration_ms,
        wiring: lexical.wiring,
        note: lexical.note ?? undefined,
        caption:
          "Điểm không chặn trên, phụ thuộc độ dài chunk — chỉ so sánh được trong cùng một truy vấn.",
        items: lexical.hits.map<RetrievalStageItem>((hit, i) => {
          const bm25 = hit.bm25 ?? 0;
          return {
            chunkId: hit.chunk_id,
            rank: hit.rank ?? i + 1,
            score: bm25,
            scoreLabel: bm25.toFixed(2),
            normalized: clamp01(bm25 / maxBm25),
          };
        }),
      }
    : emptyStage("lexical", "BM25", PIPELINE_CONFIG.lexicalAlgorithm, "BM25");

  // ---- Cột 3: sau RRF ----
  const mergeRows: MergeRow[] = (merge?.hits ?? []).map((hit, i) => ({
    chunkId: hit.chunk_id,
    denseRank: denseRanks.get(hit.chunk_id) ?? null,
    sparseRank: sparseRanks.get(hit.chunk_id) ?? null,
    rrf: hit.rrf ?? 0,
    fusedRank: hit.rank ?? i + 1,
  }));

  const mergeStage: RetrievalStage = merge
    ? {
        key: "merge",
        title: "Sau RRF",
        subtitle: `Reciprocal Rank Fusion · k=${RRF_K}`,
        scoreName: "RRF",
        durationMs: merge.duration_ms,
        wiring: merge.wiring,
        note: merge.note ?? undefined,
        caption: `Chỉ phụ thuộc thứ hạng. Top-1 luôn là ${RRF_MAX.toFixed(
          6,
        )} (có ở cả hai danh sách) hoặc ${(1 / (RRF_K + 1)).toFixed(
          6,
        )} (chỉ một danh sách).`,
        items: mergeRows.map<RetrievalStageItem>((row) => ({
          chunkId: row.chunkId,
          rank: row.fusedRank,
          score: row.rrf,
          scoreLabel: row.rrf.toFixed(6),
          normalized: clamp01(row.rrf / RRF_MAX),
          note: [
            row.denseRank ? `1/(${RRF_K}+${row.denseRank})` : null,
            row.sparseRank ? `1/(${RRF_K}+${row.sparseRank})` : null,
          ]
            .filter(Boolean)
            .join(" + "),
        })),
      }
    : emptyStage("merge", "Sau RRF", `RRF · k=${RRF_K}`, "RRF");

  // ---- Cột 4: sau Rerank ----
  const rerankRows: RerankRow[] = (rerank?.hits ?? []).map((hit, i) => ({
    chunkId: hit.chunk_id,
    rankBefore: mergeRanks.get(hit.chunk_id) ?? mergeRows.length + 1,
    rankAfter: hit.rank ?? i + 1,
    scoreBefore: hit.rrf ?? 0,
    scoreAfter: hit.rerank ?? 0,
  }));

  const rerankStage: RetrievalStage = rerank
    ? {
        key: "rerank",
        title: "Sau Rerank",
        subtitle: `Cross-encoder · ${PIPELINE_CONFIG.rerankerModel}`,
        scoreName: "cross-encoder",
        durationMs: rerank.duration_ms,
        wiring: rerank.wiring,
        note: rerank.note ?? undefined,
        caption:
          "Cross-encoder đọc đồng thời câu hỏi và chunk nên điểm phản ánh độ liên quan thật.",
        items: rerankRows.map<RetrievalStageItem>((row) => ({
          chunkId: row.chunkId,
          rank: row.rankAfter,
          score: row.scoreAfter,
          scoreLabel: formatScore(row.scoreAfter, 4),
          normalized: clamp01(row.scoreAfter),
          note:
            row.rankBefore === row.rankAfter
              ? `giữ hạng #${row.rankAfter}`
              : `#${row.rankBefore} → #${row.rankAfter}`,
        })),
      }
    : emptyStage(
        "rerank",
        "Sau Rerank",
        PIPELINE_CONFIG.rerankerModel,
        "cross-encoder",
      );

  // ---- Các bước cho bảng độ trễ ----
  const steps: PipelineStep[] = [];
  if (semantic) {
    steps.push({
      id: "semantic",
      title: "Semantic Search",
      subtitle: `${PIPELINE_CONFIG.vectorStore} · ${PIPELINE_CONFIG.embeddingModel}`,
      durationMs: semantic.duration_ms,
      status: "done",
      wiring: semantic.wiring,
      note: semantic.note ?? undefined,
      detail: {
        kind: "semantic",
        model: PIPELINE_CONFIG.embeddingModel,
        dimensions: PIPELINE_CONFIG.embeddingDim,
        metric: PIPELINE_CONFIG.similarity,
        collection: PIPELINE_CONFIG.collection,
        candidates: 0,
        topK: semantic.hits.length,
        hits: semantic.hits.map((hit, i) => ({
          chunkId: hit.chunk_id,
          cosine: hit.cosine ?? 0,
          rank: hit.rank ?? i + 1,
        })),
      },
    });
  }
  if (lexical) {
    steps.push({
      id: "lexical",
      title: "Lexical Search",
      subtitle: `BM25 · k1=${PIPELINE_CONFIG.bm25K1}, b=${PIPELINE_CONFIG.bm25B}`,
      durationMs: lexical.duration_ms,
      status: "done",
      wiring: lexical.wiring,
      note: lexical.note ?? undefined,
      detail: {
        kind: "lexical",
        algorithm: PIPELINE_CONFIG.lexicalAlgorithm,
        k1: PIPELINE_CONFIG.bm25K1,
        b: PIPELINE_CONFIG.bm25B,
        corpusSize: 0,
        avgDocLength: 0,
        tokens: [],
        hits: lexical.hits.map((hit, i) => ({
          chunkId: hit.chunk_id,
          bm25: hit.bm25 ?? 0,
          rank: hit.rank ?? i + 1,
          matchedTerms: [],
        })),
      },
    });
  }
  if (merge) {
    steps.push({
      id: "merge",
      title: "Merge — Reciprocal Rank Fusion",
      subtitle: `RRF · k=${RRF_K}`,
      durationMs: merge.duration_ms,
      status: "done",
      wiring: merge.wiring,
      note: merge.note ?? undefined,
      detail: {
        kind: "merge",
        method: "Reciprocal Rank Fusion (Cormack et al., 2009)",
        k: RRF_K,
        formula: `score(d) = Σ 1 / (${RRF_K} + rank_i(d))`,
        rows: mergeRows,
      },
    });
  }
  if (rerank) {
    steps.push({
      id: "rerank",
      title: "Rerank — Cross-encoder",
      subtitle: PIPELINE_CONFIG.rerankerModel,
      durationMs: rerank.duration_ms,
      status: "done",
      wiring: rerank.wiring,
      note: rerank.note ?? undefined,
      detail: {
        kind: "rerank",
        model: PIPELINE_CONFIG.rerankerModel,
        pairsScored: merge?.hits.length ?? rerankRows.length,
        rows: rerankRows,
      },
    });
  }

  const fallbackDetail: Extract<StepDetail, { kind: "fallback" }> = {
    kind: "fallback",
    triggered: res.fallback.triggered,
    topCosine: res.fallback.top_cosine,
    threshold: res.fallback.threshold,
    reason: res.fallback.reason,
    // Backend không trả cây mục lục mà LLM đã duyệt.
    treeNodes: [],
  };

  // Tầng phụ: "Pipeline Task 9" hoặc "PageIndex Vectorless".
  for (const extra of extras) {
    const isFallback = extra.key === "fallback";
    steps.push({
      id: isFallback ? "fallback" : (extra.key as PipelineStepId),
      title: extra.label,
      subtitle: extra.note ?? "",
      durationMs: extra.duration_ms,
      status: isFallback ? "fallback" : "done",
      wiring: extra.wiring,
      note: extra.note ?? undefined,
      detail: isFallback
        ? fallbackDetail
        : {
            kind: "rerank",
            model: extra.label,
            pairsScored: extra.hits.length,
            rows: extra.hits.map((hit, i) => ({
              chunkId: hit.chunk_id,
              rankBefore: mergeRanks.get(hit.chunk_id) ?? mergeRows.length + 1,
              rankAfter: hit.rank ?? i + 1,
              scoreBefore: hit.rrf ?? 0,
              scoreAfter: hit.rerank ?? 0,
            })),
          },
    });
  }

  const run: RetrievalRun = {
    id: `live_${res.query.slice(0, 60)}`,
    question: res.query,
    offTopic: res.fallback.triggered,
    stages: [semanticStage, lexicalStage, mergeStage, rerankStage],
    mergeRows,
    rrfK: RRF_K,
    topCosine: res.fallback.top_cosine,
    topRrf: res.fallback.top_rrf ?? 0,
    fallbackDetail,
    steps,
    totalMs: res.total_ms,
    usedFallback: res.fallback.triggered,
  };

  return { run, chunks, docs };
}

// ---------------------------------------------------------------------------
// /api/chat → trang Chat
// ---------------------------------------------------------------------------

export interface AdaptedChat {
  answer: string;
  steps: PipelineStep[];
  sources: SourceCitation[];
  totalMs: number;
  usedFallback: boolean;
  /** Tình trạng của riêng bước sinh câu trả lời (Task 10). */
  generationWiring: Wiring;
  retrievalSource: ApiChatResponse["retrieval_source"];
  chunks: Chunk[];
  docs: KnowledgeDoc[];
}

export function toChatAnswer(res: ApiChatResponse): AdaptedChat {
  // Dựng lại phần truy xuất bằng đúng bộ chuyển đổi của trang Truy xuất, để hai
  // trang không bao giờ diễn giải cùng một response theo hai kiểu khác nhau.
  const { run, chunks, docs } = toRetrievalRun({
    query: res.query,
    stages: res.stages,
    fallback: {
      triggered: res.retrieval_source === "pageindex",
      threshold: PIPELINE_CONFIG.fallbackThreshold,
      top_cosine: res.stages.find((s) => s.key === "semantic")?.hits[0]?.cosine ?? 0,
      top_rrf: res.stages.find((s) => s.key === "merge")?.hits[0]?.rrf ?? null,
      reason:
        res.retrieval_source === "pageindex"
          ? "Pipeline trả về kết quả từ nhánh PageIndex Vectorless."
          : "Pipeline giữ kết quả hybrid.",
    },
    results: res.sources,
    total_ms: res.total_ms,
  });

  // Đường đi của mỗi chunk: có mặt ở danh sách nào của tầng đầu.
  const inDense = new Set(
    res.stages.find((s) => s.key === "semantic")?.hits.map((h) => h.chunk_id) ?? [],
  );
  const inSparse = new Set(
    res.stages.find((s) => s.key === "lexical")?.hits.map((h) => h.chunk_id) ?? [],
  );
  const retrievedBy = (chunkId: string): string => {
    if (inDense.has(chunkId) && inSparse.has(chunkId)) return "semantic + BM25";
    if (inDense.has(chunkId)) return "chỉ semantic";
    if (inSparse.has(chunkId)) return "chỉ BM25";
    return "PageIndex";
  };

  const sources: SourceCitation[] = res.sources.map((hit) => ({
    chunkId: hit.chunk_id,
    // Điểm mà pipeline dùng để xếp hạng kết quả cuối. Gọi là "điểm cuối" chứ
    // không gọi là cross-encoder: tuỳ nhánh, Task 9 có thể trả điểm rerank hoặc
    // điểm của nhánh PageIndex, backend gộp cả hai vào cùng một trường.
    score: hit.rerank ?? hit.cosine ?? hit.rrf ?? 0,
    scoreLabel: "điểm cuối",
    retrievedBy: retrievedBy(hit.chunk_id),
  }));

  // Thời gian sinh câu trả lời = tổng thời gian trừ các tầng truy xuất đã đo.
  const measured = run.steps.reduce((sum, step) => sum + step.durationMs, 0);
  const generationMs = Math.max(0, Math.round((res.total_ms - measured) * 10) / 10);

  const steps: PipelineStep[] = [
    ...run.steps,
    {
      id: "generation",
      title: "Generation",
      subtitle: `Task 10 · ${res.sources.length} chunk đưa vào prompt`,
      durationMs: generationMs,
      status: "done",
      wiring: res.wiring,
      note:
        res.wiring === "live"
          ? "src.task10_generation.generate_with_citation()"
          : "Task 10 chưa implement — câu trả lời là thông báo của backend",
      detail: {
        kind: "generation",
        model: PIPELINE_CONFIG.llmModel,
        chunkCount: res.sources.length,
        // Backend không trả số token của prompt/completion.
        promptTokens: 0,
        completionTokens: 0,
        reorderStrategy: "front + back[::-1]",
        slots: [],
      },
    },
  ];

  return {
    answer: res.answer,
    steps,
    sources,
    totalMs: res.total_ms,
    usedFallback: res.retrieval_source === "pageindex",
    generationWiring: res.wiring,
    retrievalSource: res.retrieval_source,
    chunks,
    docs,
  };
}
