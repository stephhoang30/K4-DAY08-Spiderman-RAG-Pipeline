"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Gauge,
  GitMerge,
  Radar,
  ShieldAlert,
  Timer,
  Workflow,
} from "lucide-react";
import type { RetrievalRun } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  DEFAULT_RETRIEVAL_RUN,
  PIPELINE_CONFIG,
  RETRIEVAL_RUNS,
  RETRIEVAL_SAMPLES,
  TOTAL_CHUNKS,
  resolveRetrievalRun,
} from "@/lib/mock";
import { formatMs, formatScore } from "@/lib/utils";
import { QueryBar } from "./QueryBar";
import { RankFlowChart } from "./RankFlowChart";
import { StageColumns } from "./StageColumns";
import { RrfBreakdown } from "./RrfBreakdown";
import { FallbackThresholdLab } from "./FallbackThresholdLab";
import { LatencyTable } from "./LatencyTable";
import { buildChunkKeys } from "./chunkKeys";

function Section({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="flex items-baseline gap-2 text-base font-semibold text-fg">
          <span className="font-mono text-[11px] text-fg-subtle">
            {String(index).padStart(2, "0")}
          </span>
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-fg-muted">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

/** Trang Truy xuất — toàn bộ state của phần thử nghiệm nằm ở đây. */
export function RetrievalExplorer() {
  const [query, setQuery] = useState(DEFAULT_RETRIEVAL_RUN.question);
  const [run, setRun] = useState<RetrievalRun>(DEFAULT_RETRIEVAL_RUN);
  const [pending, setPending] = useState(false);
  const [activeChunk, setActiveChunk] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(
    PIPELINE_CONFIG.fallbackThreshold,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function runQuery(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setPending(true);
    setActiveChunk(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRun(resolveRetrievalRun(text));
      setPending(false);
    }, 320);
  }

  const keys = useMemo(() => buildChunkKeys(run), [run]);

  const comparisonRuns = useMemo(
    () =>
      RETRIEVAL_RUNS.some((item) => item.id === run.id)
        ? RETRIEVAL_RUNS
        : [...RETRIEVAL_RUNS, run],
    [run],
  );

  const candidateCount = new Set(
    run.stages.flatMap((stage) => stage.items.map((item) => item.chunkId)),
  ).size;
  const semanticDetail = run.steps.find((step) => step.detail.kind === "semantic")
    ?.detail;
  const scannedChunks =
    semanticDetail?.kind === "semantic" ? semanticDetail.candidates : TOTAL_CHUNKS;
  const realTrigger = run.topCosine < PIPELINE_CONFIG.fallbackThreshold;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Thử nghiệm truy xuất"
        title="Bốn tầng truy xuất trên cùng một truy vấn"
        description="Chạy thử một câu hỏi rồi so trực tiếp Semantic, BM25, kết quả sau RRF và sau rerank. Trang này cũng cho thấy vì sao ngưỡng fallback phải so với điểm cosine gốc chứ không phải điểm RRF sau khi fuse."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] text-fg-muted">
            <Workflow className="size-3.5 text-accent" aria-hidden />
            <span className="font-mono">
              bge-m3 + BM25 → RRF k={PIPELINE_CONFIG.rrfK} → cross-encoder
            </span>
          </span>
        }
      />

      <div className="mt-5">
        <QueryBar
          value={query}
          onChange={setQuery}
          onRun={runQuery}
          samples={RETRIEVAL_SAMPLES}
          activeQuestion={run.question}
          pending={pending}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-fg-subtle">Đang xem:</span>
        <span className="font-medium text-fg">{run.question}</span>
        {run.offTopic ? <Badge tone="warn">truy vấn lạc đề</Badge> : null}
        {realTrigger ? (
          <Badge tone="warn">
            <ShieldAlert className="size-3" aria-hidden />
            PageIndex fallback
          </Badge>
        ) : (
          <Badge tone="ok">Hybrid đủ tin cậy</Badge>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Cosine gốc top-1"
          value={formatScore(run.topCosine)}
          hint={`Ngưỡng thật của pipeline: ${PIPELINE_CONFIG.fallbackThreshold}`}
          icon={<Radar className="size-3.5 text-accent" aria-hidden />}
        />
        <StatTile
          label="RRF top-1 sau fuse"
          value={run.topRrf.toFixed(6)}
          hint="Chỉ phụ thuộc thứ hạng, không phụ thuộc nội dung"
          icon={<GitMerge className="size-3.5 text-accent" aria-hidden />}
        />
        <StatTile
          label="Chunk ứng viên"
          value={candidateCount}
          hint={`Lọt vào ít nhất một tầng, quét từ ${scannedChunks} chunk`}
          icon={<Gauge className="size-3.5 text-accent" aria-hidden />}
        />
        <StatTile
          label="Tổng thời gian"
          value={formatMs(run.totalMs)}
          hint={`${run.steps.length} bước, kể cả bước sinh câu trả lời`}
          icon={<Timer className="size-3.5 text-accent" aria-hidden />}
        />
      </div>

      <Section
        index={1}
        title="Một chunk đổi hạng thế nào qua từng tầng"
        description="Mỗi đường là một chunk, tô theo màu và chữ cái dùng thống nhất ở mọi bảng bên dưới. Đường đứt nghĩa là tầng đó không trả về chunk này; chấm rỗng ở hàng cuối là vị trí “không có mặt”. Rê chuột vào một đường hoặc một thẻ chunk để làm nổi bật nó ở tất cả các bảng."
      >
        <div className="rounded-xl border border-border bg-surface p-3">
          <RankFlowChart
            run={run}
            keys={keys}
            active={activeChunk}
            onActive={setActiveChunk}
          />
        </div>
      </Section>

      <Section
        index={2}
        title="Bốn cột song song"
        description="Cùng một truy vấn, bốn thang điểm khác nhau. Chú ý hai cột giữa: BM25 dùng thang không chặn trên, còn RRF nén mọi thứ về một dải cực hẹp quanh 0.016–0.033."
      >
        <StageColumns
          run={run}
          keys={keys}
          active={activeChunk}
          onActive={setActiveChunk}
        />
      </Section>

      <Section
        index={3}
        title="Phân rã điểm RRF"
        description="Từng số hạng 1/(k + rank) được tính riêng để thấy điểm cuối cùng được lắp ráp từ đâu."
      >
        <RrfBreakdown
          run={run}
          keys={keys}
          active={activeChunk}
          onActive={setActiveChunk}
        />
      </Section>

      <Section
        index={4}
        title="Ngưỡng fallback: cosine gốc hay điểm RRF?"
        description="Kéo thanh trượt để đổi ngưỡng và xem truy vấn hiện tại có kích hoạt PageIndex Vectorless hay không. Hai con số được đặt cạnh nhau: điểm cosine gốc của top-1 và điểm RRF của top-1."
      >
        <FallbackThresholdLab
          run={run}
          runs={comparisonRuns}
          threshold={threshold}
          onThreshold={setThreshold}
        />
      </Section>

      <Section
        index={5}
        title="Độ trễ từng bước"
        description="Số liệu lấy thẳng từ trace của lần chạy này."
      >
        <LatencyTable steps={run.steps} totalMs={run.totalMs} />
      </Section>
    </div>
  );
}
