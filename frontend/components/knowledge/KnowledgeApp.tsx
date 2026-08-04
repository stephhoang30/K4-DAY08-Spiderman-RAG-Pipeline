"use client";

import { useMemo, useState } from "react";
import type { KnowledgeDoc } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  DOCUMENTS,
  PIPELINE_CONFIG,
  TOTAL_CHARS,
  getCitedChunks,
  getDocFileStats,
  getKbChunks,
} from "@/lib/mock";
import { OverviewStats, sumTotals } from "./OverviewStats";
import { PipelineFlow } from "./PipelineFlow";
import {
  DocumentFilters,
  type RoleFilter,
  type TypeFilter,
} from "./DocumentFilters";
import {
  DocumentTable,
  compareDocs,
  defaultDirFor,
  type SortKey,
  type SortState,
} from "./DocumentTable";
import { ChunkBrowser } from "./ChunkBrowser";
import { topicLabel } from "./labels";

const charOf = (docId: string) => getDocFileStats(docId)?.charCount ?? 0;

/**
 * Chuỗi tìm kiếm gộp của một tài liệu: metadata + toàn bộ nội dung chunk mẫu,
 * để ô tìm kiếm khớp được cả "tên/nội dung" như yêu cầu.
 */
function buildHaystack(doc: KnowledgeDoc): string {
  const stats = getDocFileStats(doc.id);
  const chunkText = [...getKbChunks(doc.id), ...getCitedChunks(doc.id)]
    .map((chunk) => `${chunk.section} ${chunk.content}`)
    .join(" ");
  return [
    doc.title,
    doc.fileName,
    doc.topic,
    topicLabel(doc.topic),
    doc.summary,
    doc.citation,
    stats?.standardizedFile ?? "",
    stats?.sourceTitle ?? "",
    chunkText,
  ]
    .join(" ")
    .toLowerCase();
}

const HAYSTACKS: Record<string, string> = Object.fromEntries(
  DOCUMENTS.map((doc) => [doc.id, buildHaystack(doc)]),
);

export function KnowledgeApp() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "chunks", dir: "desc" });
  const [selectedId, setSelectedId] = useState<string>(DOCUMENTS[0].id);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return DOCUMENTS.filter((doc) => {
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (roleFilter !== "all" && doc.customerRole !== roleFilter) return false;
      if (needle && !HAYSTACKS[doc.id].includes(needle)) return false;
      return true;
    });
  }, [search, typeFilter, roleFilter]);

  const sorted = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort(
      (a, b) => compareDocs(a, b, sort.key, getDocFileStats) * factor,
    );
  }, [filtered, sort]);

  const totals = useMemo(() => sumTotals(filtered, charOf), [filtered]);

  // Tài liệu đang xem phải nằm trong kết quả lọc; nếu bị lọc mất thì lấy dòng đầu.
  const activeDoc: KnowledgeDoc | null =
    sorted.find((doc) => doc.id === selectedId) ?? sorted[0] ?? null;

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: defaultDirFor(key) },
    );
  }

  function handleReset() {
    setSearch("");
    setTypeFilter("all");
    setRoleFilter("all");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Task 3 & Task 4"
        title="Kho tri thức"
        description="13 tài liệu hỗ trợ khách hàng của Shopee Việt Nam đã được chuẩn hoá, cắt chunk và index vào ChromaDB. Lọc bảng để xem thành phần của kho, chọn một tài liệu để soi từng chunk."
        actions={
          <>
            <Badge tone="legal">5 legal</Badge>
            <Badge tone="news">8 news</Badge>
            <Badge mono>
              {PIPELINE_CONFIG.chunkSize}/{PIPELINE_CONFIG.chunkOverlap}
            </Badge>
          </>
        }
      />

      <div className="mt-6 space-y-6">
        <OverviewStats totals={totals} />

        <PipelineFlow totalChars={TOTAL_CHARS} />

        <Card as="section">
          <DocumentFilters
            search={search}
            onSearchChange={setSearch}
            type={typeFilter}
            onTypeChange={setTypeFilter}
            role={roleFilter}
            onRoleChange={setRoleFilter}
            resultCount={filtered.length}
            totalCount={DOCUMENTS.length}
            onReset={handleReset}
          />
          <DocumentTable
            docs={sorted}
            statsOf={getDocFileStats}
            sort={sort}
            onSort={handleSort}
            selectedId={activeDoc?.id ?? null}
            onSelect={setSelectedId}
          />
        </Card>

        <ChunkBrowser
          doc={activeDoc}
          docs={sorted.length > 0 ? sorted : DOCUMENTS}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
