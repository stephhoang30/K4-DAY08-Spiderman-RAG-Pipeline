"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Gauge,
  GitMerge,
  Radar,
  ShieldAlert,
  Timer,
  Workflow,
} from "lucide-react";
import type { DataSource, RetrievalRun } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatTile } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BackendOfflineBanner,
  DataSourceBadge,
  LoadingNote,
  Skeleton,
} from "@/components/ui/DataSource";
import { PIPELINE_CONFIG, RETRIEVAL_RUNS, RETRIEVAL_SAMPLES } from "@/lib/mock";
import { runRetrieval, type Loaded } from "@/lib/data";
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

/** Truy vấn chạy sẵn khi mới mở trang. */
const DEFAULT_QUERY = RETRIEVAL_SAMPLES[0].question;

function LoadingBoard() {
  return (
    <div className="mt-5 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.75rem]" />
        ))}
      </div>
      <Skeleton className="h-56" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

/** Trang Truy xuất — toàn bộ state của phần thử nghiệm nằm ở đây. */
export function RetrievalExplorer() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [run, setRun] = useState<RetrievalRun | null>(null);
  const [source, setSource] = useState<DataSource>("mock");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(true);
  const [activeChunk, setActiveChunk] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(
    PIPELINE_CONFIG.fallbackThreshold,
  );

  /**
   * Các lượt chạy THẬT trong phiên này, dùng cho bảng so sánh chéo ở mục 04.
   * Không trộn với `RETRIEVAL_RUNS` (mock): đặt số đo thật cạnh số demo trong
   * cùng một bảng là kiểu nhầm lẫn tệ nhất mà trang này phải tránh.
   */
  const [history, setHistory] = useState<RetrievalRun[]>([]);

  /** Chỉ nhận kết quả của lượt chạy mới nhất. */
  const seq = useRef(0);

  const apply = useCallback((result: Loaded<RetrievalRun>, mine: number) => {
    if (mine !== seq.current) return;
    setRun(result.data);
    setSource(result.source);
    setError(result.error);
    setPending(false);
    if (result.source === "live") {
      setHistory((prev) => [
        ...prev.filter((item) => item.question !== result.data.question),
        result.data,
      ]);
    }
  }, []);

  /** Chạy một truy vấn mới — gọi từ ô nhập, không gọi trong effect. */
  const execute = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const mine = (seq.current += 1);
      setPending(true);
      setActiveChunk(null);
      runRetrieval(text).then((result) => apply(result, mine));
    },
    [apply],
  );

  // Chạy sẵn truy vấn mặc định để trang không mở ra trống trơn.
  // `pending` đã khởi tạo là true nên không cần setState đồng bộ trong effect.
  useEffect(() => {
    const mine = (seq.current += 1);
    let alive = true;
    runRetrieval(DEFAULT_QUERY).then((result) => {
      if (alive) apply(result, mine);
    });
    return () => {
      alive = false;
    };
  }, [apply]);

  const keys = useMemo(() => (run ? buildChunkKeys(run) : new Map()), [run]);

  const comparisonRuns = useMemo(() => {
    if (!run) return [];
    if (source === "mock") {
      // Chế độ demo: dùng đúng bộ run mẫu như trước.
      return RETRIEVAL_RUNS.some((item) => item.id === run.id)
        ? RETRIEVAL_RUNS
        : [...RETRIEVAL_RUNS, run];
    }
    return history.some((item) => item.id === run.id) ? history : [...history, run];
  }, [history, run, source]);

  if (pending && !run) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <PageHeader
          eyebrow="Thử nghiệm truy xuất"
          title="Bốn tầng truy xuất trên cùng một truy vấn"
          description="Đang chạy truy vấn đầu tiên qua backend."
        />
        <LoadingNote className="mt-4" label="Đang gọi POST /api/retrieve…" />
        <LoadingBoard />
      </div>
    );
  }

  if (!run) return null;

  const candidateCount = new Set(
    run.stages.flatMap((stage) => stage.items.map((item) => item.chunkId)),
  ).size;
  const realTrigger = run.topCosine < PIPELINE_CONFIG.fallbackThreshold;
  const liveStages = run.stages.filter((stage) => stage.wiring === "live").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Thử nghiệm truy xuất"
        title="Bốn tầng truy xuất trên cùng một truy vấn"
        description="Chạy thử một câu hỏi rồi so trực tiếp Semantic, BM25, kết quả sau RRF và sau rerank. Trang này cũng cho thấy vì sao ngưỡng fallback phải so với điểm cosine gốc chứ không phải điểm RRF sau khi fuse."
        actions={
          <>
            <DataSourceBadge
              source={source}
              title={
                source === "live"
                  ? `Số đo thật từ POST /api/retrieve · ${liveStages}/4 tầng live`
                  : error
              }
            />
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] text-fg-muted">
              <Workflow className="size-3.5 text-accent" aria-hidden />
              <span className="font-mono">
                bge-m3 + BM25 → RRF k={PIPELINE_CONFIG.rrfK} → cross-encoder
              </span>
            </span>
          </>
        }
      />

      {source === "mock" ? (
        <BackendOfflineBanner error={error} className="mt-4" />
      ) : null}

      <div className="mt-5">
        <QueryBar
          value={query}
          onChange={setQuery}
          onRun={execute}
          samples={RETRIEVAL_SAMPLES}
          activeQuestion={run.question}
          pending={pending}
        />
      </div>

      {pending ? (
        <LoadingNote
          className="mt-3"
          label="Đang chạy lại pipeline trên backend…"
        />
      ) : null}

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
          value={formatScore(run.topCosine, 4)}
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
          hint="Lọt vào ít nhất một trong bốn tầng"
          icon={<Gauge className="size-3.5 text-accent" aria-hidden />}
        />
        <StatTile
          label="Tổng thời gian"
          value={formatMs(run.totalMs)}
          hint={`${run.steps.length} bước · ${
            source === "live" ? "đo phía backend" : "số của bộ demo"
          }`}
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
        description="Cùng một truy vấn, bốn thang điểm khác nhau. Mỗi cột mang nhãn đấu nối riêng: “live” nghĩa là tầng đó chạy hàm thật trong src/, “mock” nghĩa là dữ liệu demo. Chú ý hai cột giữa: BM25 dùng thang không chặn trên, còn RRF nén mọi thứ về một dải cực hẹp quanh 0.016–0.033."
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
        description={
          source === "live"
            ? "Kéo thanh trượt để đổi ngưỡng và xem truy vấn hiện tại có kích hoạt PageIndex Vectorless hay không. Bảng so sánh chéo chỉ liệt kê những truy vấn bạn đã chạy thật trong phiên này — chạy thêm vài câu để bảng dày lên."
            : "Kéo thanh trượt để đổi ngưỡng và xem truy vấn hiện tại có kích hoạt PageIndex Vectorless hay không. Bảng so sánh chéo đang dùng bộ truy vấn mẫu của dữ liệu demo."
        }
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
        description="Số liệu lấy thẳng từ trace của lần chạy này, kèm nhãn đấu nối của từng bước."
      >
        <LatencyTable steps={run.steps} totalMs={run.totalMs} />
      </Section>
    </div>
  );
}
