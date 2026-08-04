/**
 * Điểm import chung cho toàn bộ mock data của demo.
 * Wave 2 (Knowledge / Retrieval / Evaluation) nên import từ đây.
 */
export {
  DOCUMENTS,
  DOCUMENTS_BY_ID,
  getDocument,
  PIPELINE_CONFIG,
  TOTAL_CHUNKS,
  DOC_FILE_STATS,
  DOC_FILE_STATS_BY_ID,
  getDocFileStats,
  TOTAL_TOKENS,
  TOTAL_CHARS,
  CORPUS_SOURCE,
} from "./documents";

export {
  CHUNKS,
  CHUNKS_BY_ID,
  getChunk,
  KB_CHUNKS,
  KB_CHUNKS_BY_DOC,
  getKbChunks,
  getCitedChunks,
} from "./chunks";

export {
  MOCK_ANSWERS,
  SUGGESTED_QUESTIONS,
  getAnswerById,
  matchAnswer,
  buildDefaultAnswer,
} from "./answers";

export {
  MOCK_CONVERSATIONS,
  createEmptyConversation,
  createUserMessage,
  createPendingAssistantMessage,
} from "./conversations";

export {
  RETRIEVAL_RUNS,
  RETRIEVAL_SAMPLES,
  DEFAULT_RETRIEVAL_RUN,
  RRF_TOP1_BOTH_LISTS,
  RRF_TOP1_ONE_LIST,
  buildOffTopicRun,
  resolveRetrievalRun,
} from "./retrieval";

export {
  RAGAS_THRESHOLD,
  METRIC_IDS,
  METRIC_META,
  RAGAS_METRICS,
  GOLDEN_CASES,
  GOLDEN_TOTAL,
  GOLDEN_PASSED,
  RETRIEVAL_CONFIGS,
  BASELINE_CONFIG,
  PRIMARY_CONFIG,
  WORST_PERFORMERS,
  IMPROVEMENTS,
  FALLBACK_QUERIES,
  EVALUATION_RUN,
  deltaVsBaseline,
  overallScore,
  getGoldenCase,
} from "./evaluation";
