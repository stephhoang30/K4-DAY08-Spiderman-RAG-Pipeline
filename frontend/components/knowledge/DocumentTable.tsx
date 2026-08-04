"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown, ExternalLink } from "lucide-react";
import type { DocFileStats, KnowledgeDoc } from "@/lib/types";
import { DocTypeBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RoleBadge, formatDate, formatInt, topicLabel } from "./labels";

export type SortKey =
  | "title"
  | "type"
  | "topic"
  | "role"
  | "chunks"
  | "tokens"
  | "chars"
  | "crawledAt";

export type SortDir = "asc" | "desc";

export interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface Column {
  key: SortKey;
  label: string;
  /** Cột số căn phải và mặc định sắp giảm dần khi bấm lần đầu. */
  numeric?: boolean;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: "title", label: "Tài liệu", className: "min-w-[16rem]" },
  { key: "type", label: "Loại" },
  { key: "topic", label: "Chủ đề", className: "min-w-[9rem]" },
  { key: "role", label: "Vai trò" },
  { key: "chunks", label: "Chunk", numeric: true },
  { key: "tokens", label: "Token", numeric: true },
  { key: "chars", label: "Ký tự", numeric: true },
  { key: "crawledAt", label: "Ngày crawl", numeric: true },
];

const ARIA_SORT: Record<SortDir, "ascending" | "descending"> = {
  asc: "ascending",
  desc: "descending",
};

/** So sánh hai tài liệu theo cột đang chọn; chuỗi dùng collation tiếng Việt. */
export function compareDocs(
  a: KnowledgeDoc,
  b: KnowledgeDoc,
  key: SortKey,
  statsOf: (docId: string) => DocFileStats | undefined,
): number {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title, "vi");
    case "type":
      return a.type.localeCompare(b.type);
    case "topic":
      return topicLabel(a.topic).localeCompare(topicLabel(b.topic), "vi");
    case "role":
      return a.customerRole.localeCompare(b.customerRole);
    case "chunks":
      return a.chunkCount - b.chunkCount;
    case "tokens":
      return a.tokenCount - b.tokenCount;
    case "chars":
      return (statsOf(a.id)?.charCount ?? 0) - (statsOf(b.id)?.charCount ?? 0);
    case "crawledAt":
      return a.crawledAt.localeCompare(b.crawledAt);
    default:
      return 0;
  }
}

/** Hướng sắp mặc định khi bấm vào một cột mới. */
export function defaultDirFor(key: SortKey): SortDir {
  const column = COLUMNS.find((item) => item.key === key);
  return column?.numeric ? "desc" : "asc";
}

function SortHeader({
  column,
  sort,
  onSort,
}: {
  column: Column;
  sort: SortState;
  onSort: (key: SortKey) => void;
}) {
  const active = sort.key === column.key;
  const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? ARIA_SORT[sort.dir] : "none"}
      className={cn(
        "whitespace-nowrap border-b border-border bg-surface-2 px-3 py-2 text-left font-medium",
        column.className,
      )}
    >
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[11px] uppercase tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
          column.numeric && "flex-row-reverse",
          active ? "text-accent" : "text-fg-subtle hover:text-fg",
        )}
      >
        <Icon className="size-3 shrink-0" aria-hidden />
        {column.label}
      </button>
    </th>
  );
}

export function DocumentTable({
  docs,
  statsOf,
  sort,
  onSort,
  selectedId,
  onSelect,
}: {
  docs: KnowledgeDoc[];
  statsOf: (docId: string) => DocFileStats | undefined;
  sort: SortState;
  onSort: (key: SortKey) => void;
  selectedId: string | null;
  onSelect: (docId: string) => void;
}) {
  if (docs.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-fg-muted">
        Không có tài liệu nào khớp bộ lọc. Thử xoá bớt điều kiện tìm kiếm.
      </p>
    );
  }

  return (
    // Khung cuộn riêng: bảng rộng thì cuộn trong khối này, cả trang không lệch.
    <div className="overflow-x-auto scrollbar-slim">
      <table className="w-full min-w-[56rem] border-collapse text-[13px]">
        <caption className="sr-only">
          Danh sách tài liệu trong kho tri thức, bấm tiêu đề cột để sắp xếp và
          bấm tên tài liệu để xem chunk.
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <SortHeader
                key={column.key}
                column={column}
                sort={sort}
                onSort={onSort}
              />
            ))}
            <th
              scope="col"
              className="whitespace-nowrap border-b border-border bg-surface-2 px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-fg-subtle"
            >
              Nguồn
            </th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => {
            const stats = statsOf(doc.id);
            const selected = doc.id === selectedId;
            return (
              <tr
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                aria-selected={selected}
                className={cn(
                  "cursor-pointer border-b border-border transition last:border-b-0",
                  selected ? "bg-accent-soft" : "hover:bg-surface-2",
                )}
              >
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(doc.id);
                    }}
                    className="block max-w-[22rem] rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span
                      className={cn(
                        "block truncate font-medium",
                        selected ? "text-accent" : "text-fg",
                      )}
                    >
                      {doc.title}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-fg-subtle">
                      {stats?.standardizedFile ?? doc.fileName}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-2 align-top">
                  <DocTypeBadge type={doc.type} />
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="block text-fg-muted">
                    {topicLabel(doc.topic)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-fg-subtle">
                    {doc.topic}
                  </span>
                </td>
                <td className="px-3 py-2 align-top">
                  <RoleBadge role={doc.customerRole} />
                </td>
                <td className="px-3 py-2 text-right align-top font-mono tabular-nums text-fg-muted">
                  {formatInt(doc.chunkCount)}
                </td>
                <td className="px-3 py-2 text-right align-top font-mono tabular-nums text-fg-muted">
                  {formatInt(doc.tokenCount)}
                </td>
                <td className="px-3 py-2 text-right align-top font-mono tabular-nums text-fg-muted">
                  {stats ? formatInt(stats.charCount) : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right align-top font-mono tabular-nums text-fg-subtle">
                  {/* API không trả ngày crawl — hiện gạch ngang thay vì ô trống. */}
                  {doc.crawledAt ? formatDate(doc.crawledAt) : "—"}
                </td>
                <td className="px-3 py-2 align-top">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-md text-[11px] text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    help.shopee.vn
                    <ExternalLink className="size-3 shrink-0" aria-hidden />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
