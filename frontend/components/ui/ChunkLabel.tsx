import { getChunk, getDocument } from "@/lib/mock";
import { cn, truncate } from "@/lib/utils";
import { DocTypeBadge } from "./Badge";

/**
 * Nhãn gọn cho một chunk: tên tài liệu + mục + loại tài liệu.
 * Dùng lại ở bảng pipeline, danh sách nguồn và (wave 2) trang Knowledge/Retrieval.
 */
export function ChunkLabel({
  chunkId,
  showType = true,
  showSection = true,
  className,
}: {
  chunkId: string;
  showType?: boolean;
  showSection?: boolean;
  className?: string;
}) {
  const chunk = getChunk(chunkId);
  const doc = chunk ? getDocument(chunk.docId) : undefined;

  if (!chunk || !doc) {
    return (
      <span className={cn("font-mono text-xs text-fg-subtle", className)}>
        {chunkId}
      </span>
    );
  }

  return (
    <span className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <span className="flex min-w-0 items-center gap-1.5">
        {showType ? <DocTypeBadge type={doc.type} /> : null}
        <span className="truncate text-xs font-medium text-fg">{doc.title}</span>
      </span>
      {showSection ? (
        <span className="truncate text-[11px] text-fg-subtle">
          {chunk.section} · <span className="font-mono">{chunk.id}</span>
        </span>
      ) : null}
    </span>
  );
}

/** Trích ngắn của chunk, dùng trong bảng chi tiết bước. */
export function ChunkExcerpt({
  chunkId,
  max = 150,
  className,
}: {
  chunkId: string;
  max?: number;
  className?: string;
}) {
  const chunk = getChunk(chunkId);
  if (!chunk) return null;
  return (
    <p className={cn("text-[11px] leading-relaxed text-fg-muted", className)}>
      {truncate(chunk.excerpt, max)}
    </p>
  );
}
