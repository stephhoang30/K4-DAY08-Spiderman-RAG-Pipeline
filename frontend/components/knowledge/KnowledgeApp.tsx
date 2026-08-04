"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DataSource, KbChunk, KnowledgeDoc } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  BackendOfflineBanner,
  DataSourceBadge,
  LoadingNote,
  Skeleton,
} from "@/components/ui/DataSource";
import {
  loadDocumentChunks,
  loadKnowledge,
  type KnowledgeSnapshot,
} from "@/lib/data";
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

/**
 * Chuỗi tìm kiếm gộp của một tài liệu.
 *
 * Chỉ dựng từ metadata: nội dung chunk được nạp theo từng tài liệu (mỗi lần chọn
 * mới gọi `/api/knowledge/chunks`), nên không thể gộp sẵn nội dung của cả 13 tài
 * liệu vào chuỗi tìm kiếm như hồi còn 100% mock.
 */
function buildHaystack(doc: KnowledgeDoc, standardizedFile: string): string {
  return [
    doc.title,
    doc.fileName,
    doc.topic,
    topicLabel(doc.topic),
    doc.summary,
    doc.citation,
    standardizedFile,
  ]
    .join(" ")
    .toLowerCase();
}

function LoadingSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.75rem]" />
        ))}
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-80" />
    </div>
  );
}

export function KnowledgeApp() {
  const [snapshot, setSnapshot] = useState<KnowledgeSnapshot | null>(null);
  const [source, setSource] = useState<DataSource>("mock");
  const [error, setError] = useState<string | undefined>(undefined);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortState>({ key: "chunks", dir: "desc" });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /**
   * Chunk của tài liệu đã nạp xong, kèm id của tài liệu đó.
   * Gói chung một state để suy ra trạng thái "đang tải" bằng phép so sánh
   * (`docId !== activeDoc.id`) thay vì phải setState ngay trong thân effect.
   */
  const [chunkState, setChunkState] = useState<{
    docId: string;
    chunks: KbChunk[];
  } | null>(null);
  const chunkSeq = useRef(0);

  // Nạp danh sách tài liệu + thống kê corpus một lần khi mở trang.
  useEffect(() => {
    let alive = true;
    loadKnowledge().then((result) => {
      if (!alive) return;
      setSnapshot(result.data);
      setSource(result.source);
      setError(result.error);
      setSelectedId((prev) => prev ?? result.data.docs[0]?.id ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const statsOf = useMemo(
    () => (docId: string) => snapshot?.fileStats[docId],
    [snapshot],
  );

  const haystacks = useMemo(() => {
    if (!snapshot) return {} as Record<string, string>;
    return Object.fromEntries(
      snapshot.docs.map((doc) => [
        doc.id,
        buildHaystack(doc, snapshot.fileStats[doc.id]?.standardizedFile ?? ""),
      ]),
    );
  }, [snapshot]);

  const filtered = useMemo(() => {
    if (!snapshot) return [];
    const needle = search.trim().toLowerCase();
    return snapshot.docs.filter((doc) => {
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (roleFilter !== "all" && doc.customerRole !== roleFilter) return false;
      if (needle && !(haystacks[doc.id] ?? "").includes(needle)) return false;
      return true;
    });
  }, [snapshot, search, typeFilter, roleFilter, haystacks]);

  const sorted = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => compareDocs(a, b, sort.key, statsOf) * factor);
  }, [filtered, sort, statsOf]);

  const totals = useMemo(
    () => sumTotals(filtered, (docId) => statsOf(docId)?.charCount ?? 0),
    [filtered, statsOf],
  );

  // Tài liệu đang xem phải nằm trong kết quả lọc; nếu bị lọc mất thì lấy dòng đầu.
  const activeDoc: KnowledgeDoc | null =
    sorted.find((doc) => doc.id === selectedId) ?? sorted[0] ?? null;

  // Chunk nạp riêng theo từng tài liệu — 206 chunk mà tải hết một lượt thì thừa.
  const activeDocId = activeDoc?.id ?? null;
  const activeFileName = activeDoc?.fileName ?? null;
  useEffect(() => {
    if (!activeDocId || !activeFileName) return;
    let alive = true;
    const mine = (chunkSeq.current += 1);
    loadDocumentChunks(activeFileName, activeDocId, source === "live").then(
      (result) => {
        if (!alive || mine !== chunkSeq.current) return;
        setChunkState({ docId: activeDocId, chunks: result.data });
      },
    );
    return () => {
      alive = false;
    };
  }, [activeDocId, activeFileName, source]);

  const chunksReady = chunkState !== null && chunkState.docId === activeDocId;
  const chunks = chunksReady ? chunkState.chunks : [];

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

  if (!snapshot) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <PageHeader
          eyebrow="Task 3 & Task 4"
          title="Kho tri thức"
          description="Đang đọc thống kê corpus từ backend."
        />
        <LoadingNote className="mt-4" label="Đang gọi GET /api/knowledge/…" />
        <LoadingSkeleton />
      </div>
    );
  }

  const legalCount = snapshot.docs.filter((doc) => doc.type === "legal").length;
  const newsCount = snapshot.docs.filter((doc) => doc.type === "news").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Task 3 & Task 4"
        title="Kho tri thức"
        description={`${snapshot.totals.documents} tài liệu hỗ trợ khách hàng của Shopee Việt Nam đã được chuẩn hoá, cắt thành ${snapshot.totals.chunks} chunk và index vào vector store. Lọc bảng để xem thành phần của kho, chọn một tài liệu để soi từng chunk.`}
        actions={
          <>
            <DataSourceBadge
              source={source}
              title={
                source === "live"
                  ? `Đọc trực tiếp từ ${snapshot.config.collection} qua GET /api/knowledge/…`
                  : error
              }
            />
            <Badge tone="legal">{legalCount} legal</Badge>
            <Badge tone="news">{newsCount} news</Badge>
            <Badge mono>
              {snapshot.config.chunkSize}/{snapshot.config.chunkOverlap}
            </Badge>
          </>
        }
      />

      {source === "mock" ? (
        <BackendOfflineBanner error={error} className="mt-4" />
      ) : null}

      <div className="mt-6 space-y-6">
        <OverviewStats
          totals={totals}
          all={snapshot.totals}
          config={snapshot.config}
        />

        <PipelineFlow
          totalChars={snapshot.totals.chars}
          totalChunks={snapshot.totals.chunks}
          config={snapshot.config}
        />

        <Card as="section">
          <DocumentFilters
            search={search}
            onSearchChange={setSearch}
            type={typeFilter}
            onTypeChange={setTypeFilter}
            role={roleFilter}
            onRoleChange={setRoleFilter}
            resultCount={filtered.length}
            totalCount={snapshot.docs.length}
            onReset={handleReset}
          />
          <DocumentTable
            docs={sorted}
            statsOf={statsOf}
            sort={sort}
            onSort={handleSort}
            selectedId={activeDoc?.id ?? null}
            onSelect={setSelectedId}
          />
        </Card>

        <ChunkBrowser
          doc={activeDoc}
          docs={sorted.length > 0 ? sorted : snapshot.docs}
          onSelect={setSelectedId}
          chunks={chunks}
          stats={activeDoc ? statsOf(activeDoc.id) : undefined}
          config={snapshot.config}
          loading={!chunksReady}
        />
      </div>
    </div>
  );
}
