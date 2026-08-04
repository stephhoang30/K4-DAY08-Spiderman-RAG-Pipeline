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
} from "./documents";

export { CHUNKS, CHUNKS_BY_ID, getChunk } from "./chunks";

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
