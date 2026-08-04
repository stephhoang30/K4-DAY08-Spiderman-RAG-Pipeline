/** Ghép className có điều kiện (thay cho clsx để không thêm dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** 1180 -> "1.18s", 420 -> "420ms" */
export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

/** 0.8123 -> "0.812" */
export function formatScore(score: number, digits = 3): string {
  return score.toFixed(digits);
}

/** Chuẩn hoá câu hỏi để so khớp mock: bỏ dấu câu, hạ chữ thường. */
export function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[?!.,;:"'`()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cắt chuỗi dài kèm dấu ba chấm. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

/**
 * Sắp xếp lại chunk theo kiểu `front + back[::-1]` (Task 10) để tránh
 * hiện tượng "lost in the middle" khi đưa context vào LLM.
 */
export function reorderForLlm<T>(items: T[]): T[] {
  const front = items.filter((_, i) => i % 2 === 0);
  const back = items.filter((_, i) => i % 2 === 1);
  return [...front, ...back.reverse()];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
