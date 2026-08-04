/**
 * Sổ tra cứu chunk & tài liệu dùng chung cho các nhãn hiển thị.
 *
 * Vì sao cần: các component nhãn (`ChunkLabel`, `SourcesPanel`, `RankFlowChart`,
 * `StepDetails`) chỉ nhận `chunkId` rồi tự tra nội dung. Khi còn 100% mock thì
 * tra thẳng `lib/mock` là đủ, nhưng chunk thật từ ChromaDB có id khác hẳn
 * (`article_05_....json_chunk_3` thay vì `chunk_0126`) nên tra mock sẽ trượt.
 *
 * Cách giải quyết: một sổ tra runtime. Lớp `lib/data.ts` nạp chunk thật vào đây
 * TRƯỚC khi setState, nên lần render kế tiếp là có dữ liệu. Tra không thấy thì
 * rơi về mock — nhờ vậy khi backend tắt mọi nhãn vẫn hiện đầy đủ.
 *
 * Id của hai nguồn không đụng nhau (`chunk_0042` vs `<file>_chunk_3`,
 * `legal_privacy` vs `chinh-sach-bao-mat-shopee`) nên không có chuyện dữ liệu
 * thật bị mock đè hay ngược lại.
 */

import type { Chunk, KnowledgeDoc } from "@/lib/types";
import { getChunk as getMockChunk, getDocument as getMockDocument } from "@/lib/mock";

const liveChunks = new Map<string, Chunk>();
const liveDocs = new Map<string, KnowledgeDoc>();

/** Nạp chunk thật. Bản ghi sau đè bản ghi trước cùng id. */
export function registerLiveChunks(chunks: Chunk[]): void {
  for (const chunk of chunks) liveChunks.set(chunk.id, chunk);
}

/**
 * Nạp tài liệu thật.
 *
 * @param fillOnly true → chỉ ghi khi id chưa có. Dùng cho tài liệu dựng tạm từ
 *   kết quả truy xuất (chỉ có title/url) để không đè bản đầy đủ lấy từ
 *   `/api/knowledge/documents` (có đủ số chunk, ký tự, token).
 */
export function registerLiveDocuments(
  docs: KnowledgeDoc[],
  fillOnly = false,
): void {
  for (const doc of docs) {
    if (fillOnly && liveDocs.has(doc.id)) continue;
    liveDocs.set(doc.id, doc);
  }
}

/** Chunk thật trước, không có thì lấy mock. */
export function resolveChunk(chunkId: string): Chunk | undefined {
  return liveChunks.get(chunkId) ?? getMockChunk(chunkId);
}

/** Tài liệu thật trước, không có thì lấy mock. */
export function resolveDocument(docId: string): KnowledgeDoc | undefined {
  return liveDocs.get(docId) ?? getMockDocument(docId);
}

/** Tài liệu chứa một chunk, tra qua `Chunk.docId`. */
export function resolveDocumentOfChunk(
  chunkId: string,
): KnowledgeDoc | undefined {
  const chunk = resolveChunk(chunkId);
  return chunk ? resolveDocument(chunk.docId) : undefined;
}
