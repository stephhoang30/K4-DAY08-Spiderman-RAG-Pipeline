import type { RetrievalRun } from "@/lib/types";

/**
 * Bảng màu gán cho từng chunk trong một lần chạy.
 * Màu chỉ dùng cho phần đồ hoạ (đường nối, chấm, viền nhãn) — chữ vẫn lấy token
 * `text-fg…` nên vẫn đọc được ở cả light lẫn dark mode.
 */
export const CHUNK_PALETTE = [
  "#3b82f6",
  "#e05252",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
] as const;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface ChunkKey {
  color: string;
  letter: string;
}

/**
 * Gán màu + chữ cái cho mọi chunk xuất hiện trong run.
 * Thứ tự ưu tiên: hạng sau rerank → hạng sau RRF → hạng ở semantic, để chunk
 * quan trọng nhất luôn là "A".
 */
export function buildChunkKeys(run: RetrievalRun): Map<string, ChunkKey> {
  const weight = new Map<string, number>();

  run.stages.forEach((stage, stageIndex) => {
    const base =
      stage.key === "rerank" ? 0 : stage.key === "merge" ? 1000 : 2000 + stageIndex;
    for (const item of stage.items) {
      const value = base + item.rank;
      const current = weight.get(item.chunkId);
      if (current === undefined || value < current) {
        weight.set(item.chunkId, value);
      }
    }
  });

  const ordered = [...weight.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([chunkId]) => chunkId);

  return new Map(
    ordered.map((chunkId, i) => [
      chunkId,
      {
        color: CHUNK_PALETTE[i % CHUNK_PALETTE.length],
        letter: LETTERS[i % LETTERS.length],
      },
    ]),
  );
}

/** Nhãn chữ cái nhỏ, tô theo màu của chunk. */
export function chunkKeyOf(
  keys: Map<string, ChunkKey>,
  chunkId: string,
): ChunkKey {
  return keys.get(chunkId) ?? { color: "#64748b", letter: "?" };
}
