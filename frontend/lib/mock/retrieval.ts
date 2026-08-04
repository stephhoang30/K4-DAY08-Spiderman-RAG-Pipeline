import type {
  MergeRow,
  MockAnswer,
  PipelineStep,
  RetrievalRun,
  RetrievalSample,
  RetrievalStage,
  RetrievalStageItem,
  StepDetail,
} from "@/lib/types";
import { MOCK_ANSWERS, matchAnswer } from "./answers";
import { PIPELINE_CONFIG } from "./documents";
import { formatScore, normalizeQuery } from "@/lib/utils";

/**
 * Dữ liệu cho trang Truy xuất (/retrieval).
 *
 * Toàn bộ số liệu được rút ra từ `MOCK_ANSWERS` — trang này không định nghĩa lại
 * pipeline, chỉ xếp bốn tầng (semantic / BM25 / RRF / rerank) cạnh nhau để so sánh.
 * Riêng truy vấn lạc đề hoàn toàn ("cách nấu phở bò") được dựng thêm ở đây vì
 * `buildDefaultAnswer` trong answers.ts chỉ có 3 bước, không đủ để so bốn cột.
 */

const { rrfK, fallbackThreshold } = PIPELINE_CONFIG;

/** Điểm RRF tối đa: top-1 ở CẢ hai danh sách → 1/(k+1) + 1/(k+1). */
export const RRF_TOP1_BOTH_LISTS = 2 / (rrfK + 1);
/** Điểm RRF khi top-1 chỉ xuất hiện ở MỘT danh sách → 1/(k+1). */
export const RRF_TOP1_ONE_LIST = 1 / (rrfK + 1);

// ---------------------------------------------------------------------------
// Rút chi tiết từng bước ra khỏi PipelineStep[]
// ---------------------------------------------------------------------------

type StepOf<K extends StepDetail["kind"]> = {
  step: PipelineStep;
  detail: Extract<StepDetail, { kind: K }>;
};

function pickStep<K extends StepDetail["kind"]>(
  steps: PipelineStep[],
  kind: K,
): StepOf<K> | null {
  for (const step of steps) {
    if (step.detail.kind === kind) {
      return { step, detail: step.detail as Extract<StepDetail, { kind: K }> };
    }
  }
  return null;
}

function emptyStage(
  key: RetrievalStage["key"],
  title: string,
  subtitle: string,
  scoreName: string,
  caption: string,
): RetrievalStage {
  return { key, title, subtitle, scoreName, durationMs: 0, items: [], caption };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// ---------------------------------------------------------------------------
// Dựng RetrievalRun từ một MockAnswer (hoặc bất kỳ trace nào cùng hình dạng)
// ---------------------------------------------------------------------------

interface RunSeed {
  id: string;
  question: string;
  steps: PipelineStep[];
  totalMs: number;
  usedFallback: boolean;
}

function buildRun(seed: RunSeed, offTopic: boolean): RetrievalRun {
  const semantic = pickStep(seed.steps, "semantic");
  const lexical = pickStep(seed.steps, "lexical");
  const merge = pickStep(seed.steps, "merge");
  const rerank = pickStep(seed.steps, "rerank");
  const fallback = pickStep(seed.steps, "fallback");

  // ---- Cột 1: Semantic (cosine gốc) ----
  const semanticStage: RetrievalStage = semantic
    ? {
        key: "semantic",
        title: "Semantic",
        subtitle: `${PIPELINE_CONFIG.vectorStore} · ${semantic.detail.model} · ${semantic.detail.dimensions}d`,
        scoreName: "cosine",
        durationMs: semantic.step.durationMs,
        caption:
          "Thang thật trong [0, 1]. Đây là điểm duy nhất được đem so với ngưỡng fallback.",
        items: semantic.detail.hits.map<RetrievalStageItem>((hit) => ({
          chunkId: hit.chunkId,
          rank: hit.rank,
          score: hit.cosine,
          scoreLabel: formatScore(hit.cosine),
          normalized: clamp01(hit.cosine),
        })),
      }
    : emptyStage(
        "semantic",
        "Semantic",
        PIPELINE_CONFIG.embeddingModel,
        "cosine",
        "Bước này không chạy trong lần thử vừa rồi.",
      );

  // ---- Cột 2: BM25 ----
  const maxBm25 = lexical
    ? Math.max(...lexical.detail.hits.map((h) => h.bm25), 1)
    : 1;
  const lexicalStage: RetrievalStage = lexical
    ? {
        key: "lexical",
        title: "BM25",
        subtitle: `${lexical.detail.algorithm} · k1=${lexical.detail.k1}, b=${lexical.detail.b}`,
        scoreName: "BM25",
        durationMs: lexical.step.durationMs,
        caption:
          "Điểm không chặn trên, phụ thuộc độ dài chunk — chỉ so sánh được trong cùng một truy vấn.",
        items: lexical.detail.hits.map<RetrievalStageItem>((hit) => ({
          chunkId: hit.chunkId,
          rank: hit.rank,
          score: hit.bm25,
          scoreLabel: hit.bm25.toFixed(2),
          normalized: clamp01(hit.bm25 / maxBm25),
          note:
            hit.matchedTerms.length > 0
              ? `khớp: ${hit.matchedTerms.join(", ")}`
              : "không khớp token nào",
        })),
      }
    : emptyStage(
        "lexical",
        "BM25",
        PIPELINE_CONFIG.lexicalAlgorithm,
        "BM25",
        "Bước này không chạy trong lần thử vừa rồi.",
      );

  // ---- Cột 3: sau RRF ----
  const mergeRows: MergeRow[] = merge
    ? [...merge.detail.rows].sort((a, b) => a.fusedRank - b.fusedRank)
    : [];
  const mergeStage: RetrievalStage = merge
    ? {
        key: "merge",
        title: "Sau RRF",
        subtitle: `Reciprocal Rank Fusion · k=${merge.detail.k}`,
        scoreName: "RRF",
        durationMs: merge.step.durationMs,
        caption: `Chỉ phụ thuộc thứ hạng. Top-1 luôn là ${RRF_TOP1_BOTH_LISTS.toFixed(
          6,
        )} (có ở cả hai danh sách) hoặc ${RRF_TOP1_ONE_LIST.toFixed(6)} (chỉ một danh sách).`,
        items: mergeRows.map<RetrievalStageItem>((row) => ({
          chunkId: row.chunkId,
          rank: row.fusedRank,
          score: row.rrf,
          scoreLabel: row.rrf.toFixed(6),
          normalized: clamp01(row.rrf / RRF_TOP1_BOTH_LISTS),
          note: [
            row.denseRank ? `1/(${merge.detail.k}+${row.denseRank})` : null,
            row.sparseRank ? `1/(${merge.detail.k}+${row.sparseRank})` : null,
          ]
            .filter(Boolean)
            .join(" + "),
        })),
      }
    : emptyStage(
        "merge",
        "Sau RRF",
        `Reciprocal Rank Fusion · k=${rrfK}`,
        "RRF",
        "Bước này không chạy trong lần thử vừa rồi.",
      );

  // ---- Cột 4: sau Rerank ----
  const rerankStage: RetrievalStage = rerank
    ? {
        key: "rerank",
        title: "Sau Rerank",
        subtitle: `Cross-encoder · ${rerank.detail.model}`,
        scoreName: "cross-encoder",
        durationMs: rerank.step.durationMs,
        caption:
          "Cross-encoder đọc đồng thời câu hỏi và chunk nên điểm phản ánh độ liên quan thật.",
        items: rerank.detail.rows.map<RetrievalStageItem>((row) => ({
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
        "Bước này không chạy trong lần thử vừa rồi.",
      );

  return {
    id: seed.id,
    question: seed.question,
    offTopic,
    stages: [semanticStage, lexicalStage, mergeStage, rerankStage],
    mergeRows,
    rrfK: merge?.detail.k ?? rrfK,
    topCosine: semantic?.detail.hits[0]?.cosine ?? 0,
    topRrf: mergeRows[0]?.rrf ?? 0,
    fallbackDetail: fallback?.detail ?? null,
    steps: seed.steps,
    totalMs: seed.totalMs,
    usedFallback: seed.usedFallback,
  };
}

// ---------------------------------------------------------------------------
// Truy vấn lạc đề hoàn toàn — dựng đủ 6 bước để so được bốn cột
// ---------------------------------------------------------------------------

/**
 * Chunk "gần nhất" mà vector search moi ra khi truy vấn không dính gì tới kho
 * tri thức: điểm cosine rất thấp nhưng vẫn có thứ hạng 1, 2, 3…
 */
const OFF_TOPIC_DENSE = [
  "chunk_0126",
  "chunk_0042",
  "chunk_0087",
  "chunk_0167",
  "chunk_0043",
];
const OFF_TOPIC_COSINE = [0.213, 0.198, 0.176, 0.164, 0.151];
const OFF_TOPIC_SPARSE = ["chunk_0126", "chunk_0087", "chunk_0042"];
const OFF_TOPIC_BM25 = [1.84, 1.12, 0.76];
const OFF_TOPIC_RERANK = [0.0412, 0.0231, 0.0157, 0.0104, 0.0061];

/** Bản sao rút gọn của bộ dựng RRF trong answers.ts (module đó không export). */
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

/** Cắt truy vấn thành token hiển thị cho bước BM25. */
function queryTokens(query: string): string[] {
  return normalizeQuery(query).split(" ").filter(Boolean).slice(0, 6);
}

function buildOffTopicSteps(query: string, topCosine: number): PipelineStep[] {
  // Dịch cả dải cosine để top-1 đúng bằng `topCosine` yêu cầu.
  const shift = topCosine - OFF_TOPIC_COSINE[0];
  const cosines = OFF_TOPIC_COSINE.map((value) =>
    Number((value + shift).toFixed(3)),
  );
  const rows = buildMergeRows(OFF_TOPIC_DENSE, OFF_TOPIC_SPARSE);

  return [
    {
      id: "semantic",
      title: "Semantic Search",
      subtitle: `${PIPELINE_CONFIG.vectorStore} · ${PIPELINE_CONFIG.embeddingModel}`,
      durationMs: 351,
      status: "done",
      detail: {
        kind: "semantic",
        model: PIPELINE_CONFIG.embeddingModel,
        dimensions: PIPELINE_CONFIG.embeddingDim,
        metric: PIPELINE_CONFIG.similarity,
        collection: PIPELINE_CONFIG.collection,
        candidates: 214,
        topK: OFF_TOPIC_DENSE.length,
        hits: OFF_TOPIC_DENSE.map((chunkId, i) => ({
          chunkId,
          cosine: cosines[i],
          rank: i + 1,
        })),
      },
    },
    {
      id: "lexical",
      title: "Lexical Search",
      subtitle: `BM25 · k1=${PIPELINE_CONFIG.bm25K1}, b=${PIPELINE_CONFIG.bm25B}`,
      durationMs: 54,
      status: "done",
      detail: {
        kind: "lexical",
        algorithm: PIPELINE_CONFIG.lexicalAlgorithm,
        k1: PIPELINE_CONFIG.bm25K1,
        b: PIPELINE_CONFIG.bm25B,
        corpusSize: 214,
        avgDocLength: 196.4,
        tokens: queryTokens(query),
        hits: OFF_TOPIC_SPARSE.map((chunkId, i) => ({
          chunkId,
          bm25: OFF_TOPIC_BM25[i],
          rank: i + 1,
          matchedTerms: [],
        })),
      },
    },
    {
      id: "merge",
      title: "Merge — Reciprocal Rank Fusion",
      subtitle: `RRF · k=${rrfK}`,
      durationMs: 5,
      status: "done",
      detail: {
        kind: "merge",
        method: "Reciprocal Rank Fusion (Cormack et al., 2009)",
        k: rrfK,
        formula: `score(d) = Σ 1 / (${rrfK} + rank_i(d))`,
        rows,
      },
    },
    {
      id: "rerank",
      title: "Rerank — Cross-encoder",
      subtitle: PIPELINE_CONFIG.rerankerModel,
      durationMs: 498,
      status: "done",
      detail: {
        kind: "rerank",
        model: PIPELINE_CONFIG.rerankerModel,
        pairsScored: OFF_TOPIC_DENSE.length,
        rows: OFF_TOPIC_DENSE.map((chunkId, i) => {
          const before = rows.find((r) => r.chunkId === chunkId);
          return {
            chunkId,
            rankBefore: before?.fusedRank ?? rows.length + 1,
            rankAfter: i + 1,
            scoreBefore: before?.rrf ?? 0,
            scoreAfter: OFF_TOPIC_RERANK[i],
          };
        }),
      },
    },
    {
      id: "fallback",
      title: "Fallback — PageIndex Vectorless",
      subtitle: `Kích hoạt · ${topCosine.toFixed(3)} < ${fallbackThreshold}`,
      durationMs: 1327,
      status: "fallback",
      detail: {
        kind: "fallback",
        triggered: true,
        topCosine,
        threshold: fallbackThreshold,
        reason: `Điểm cosine gốc của top-1 chỉ đạt ${topCosine.toFixed(
          3,
        )} < ${fallbackThreshold} → chuyển sang PageIndex. Nếu đem điểm RRF (${RRF_TOP1_BOTH_LISTS.toFixed(
          6,
        )}) ra so, nhánh này sẽ không bao giờ phân biệt được truy vấn lạc đề với truy vấn đúng chủ đề.`,
        treeNodes: [
          {
            id: "node_off_scan",
            docId: "legal_return_refund",
            title: "Duyệt mục lục 13 tài liệu (5 legal + 8 news)",
            depth: 0,
            selected: false,
            reasoning:
              "LLM đọc tiêu đề và mục lục từng tài liệu thay vì so vector — không nhánh nào thuộc chủ đề câu hỏi.",
          },
          {
            id: "node_off_rr",
            docId: "legal_return_refund",
            title: "Chính sách Trả hàng và Hoàn tiền",
            depth: 1,
            selected: false,
            reasoning: "Chỉ nói về hàng hoá mua trên sàn, không liên quan.",
          },
          {
            id: "node_off_res",
            docId: "news_refund_restrictions",
            title: "Sản phẩm hạn chế Trả hàng/Hoàn tiền",
            depth: 1,
            selected: false,
            reasoning:
              "Chunk có điểm cosine cao nhất nằm ở đây, nhưng nội dung là voucher và vé dịch vụ — vẫn lệch chủ đề.",
          },
        ],
      },
    },
    {
      id: "generation",
      title: "Generation",
      subtitle: `${PIPELINE_CONFIG.llmModel} · 0 chunk`,
      durationMs: 512,
      status: "done",
      detail: {
        kind: "generation",
        model: PIPELINE_CONFIG.llmModel,
        chunkCount: 0,
        promptTokens: 496,
        completionTokens: 174,
        reorderStrategy: "front + back[::-1]",
        slots: [],
      },
    },
  ];
}

const OFF_TOPIC_QUESTION = "Cách nấu phở bò ngon tại nhà?";

const OFF_TOPIC_RUN = buildRun(
  {
    id: "run_off_topic_pho",
    question: OFF_TOPIC_QUESTION,
    steps: buildOffTopicSteps(OFF_TOPIC_QUESTION, 0.213),
    totalMs: 2747,
    usedFallback: true,
  },
  true,
);

/** Truy vấn tự do không khớp mock nào → dựng trace lạc đề mang đúng câu hỏi đó. */
export function buildOffTopicRun(query: string): RetrievalRun {
  return buildRun(
    {
      id: `run_free_${normalizeQuery(query).replace(/\s+/g, "_").slice(0, 40)}`,
      question: query.trim(),
      steps: buildOffTopicSteps(query, 0.198),
      totalMs: 2747,
      usedFallback: true,
    },
    true,
  );
}

// ---------------------------------------------------------------------------
// Danh sách run + truy vấn mẫu
// ---------------------------------------------------------------------------

const ANSWER_RUNS: RetrievalRun[] = MOCK_ANSWERS.map((answer: MockAnswer) =>
  buildRun(answer, answer.usedFallback),
);

function runByAnswerId(id: string): RetrievalRun {
  const found = ANSWER_RUNS.find((run) => run.id === id);
  if (!found) throw new Error(`Không tìm thấy mock answer: ${id}`);
  return found;
}

/** Năm truy vấn mẫu bấm được — hai truy vấn cuối dùng để demo nhánh fallback. */
export const RETRIEVAL_RUNS: RetrievalRun[] = [
  runByAnswerId("ans_return_deadline"),
  runByAnswerId("ans_payment_methods"),
  runByAnswerId("ans_refund_evidence"),
  runByAnswerId("ans_fallback_travel"),
  OFF_TOPIC_RUN,
];

export const RETRIEVAL_SAMPLES: RetrievalSample[] = [
  {
    id: RETRIEVAL_RUNS[0].id,
    question: RETRIEVAL_RUNS[0].question,
    label: "Thời hạn trả hàng",
    offTopic: false,
  },
  {
    id: RETRIEVAL_RUNS[1].id,
    question: RETRIEVAL_RUNS[1].question,
    label: "Phương thức thanh toán",
    offTopic: false,
  },
  {
    id: RETRIEVAL_RUNS[2].id,
    question: RETRIEVAL_RUNS[2].question,
    label: "Bằng chứng hoàn tiền",
    offTopic: false,
  },
  {
    id: RETRIEVAL_RUNS[3].id,
    question: RETRIEVAL_RUNS[3].question,
    label: "Vé máy bay, tour du lịch",
    offTopic: true,
  },
  {
    id: RETRIEVAL_RUNS[4].id,
    question: RETRIEVAL_RUNS[4].question,
    label: "Cách nấu phở bò",
    offTopic: true,
  },
];

/** Run mặc định khi mới mở trang. */
export const DEFAULT_RETRIEVAL_RUN = RETRIEVAL_RUNS[0];

/**
 * Tìm run tương ứng với truy vấn người dùng nhập:
 * khớp nguyên văn → khớp keyword (matchAnswer) → dựng trace lạc đề.
 */
export function resolveRetrievalRun(query: string): RetrievalRun {
  const q = normalizeQuery(query);
  if (!q) return DEFAULT_RETRIEVAL_RUN;

  const exact = [...RETRIEVAL_RUNS, ...ANSWER_RUNS].find(
    (run) => normalizeQuery(run.question) === q,
  );
  if (exact) return exact;

  const matched = matchAnswer(query);
  if (matched) return runByAnswerId(matched.id);

  return buildOffTopicRun(query);
}
