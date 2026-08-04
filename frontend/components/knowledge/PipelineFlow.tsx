import {
  ArrowRight,
  Boxes,
  Database,
  FileText,
  Scissors,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { CORPUS_SOURCE, PIPELINE_CONFIG, TOTAL_CHUNKS } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { formatInt } from "./labels";

type StageKind = "store" | "process";

interface Stage {
  id: string;
  kind: StageKind;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  meta: string;
}

/**
 * Sáu chặng của đường ống nạp dữ liệu, khớp với thư mục thật trong repo:
 * data/landing → Task 3 → data/standardized → Task 4 → embedding → ChromaDB.
 */
function buildStages(totalChars: number): Stage[] {
  return [
    {
      id: "landing",
      kind: "store",
      icon: FileText,
      title: "data/landing/",
      subtitle: "5 PDF chính sách + 8 JSON bài viết",
      meta: `Task 1 & 2 · ${CORPUS_SOURCE}`,
    },
    {
      id: "markitdown",
      kind: "process",
      icon: Wand2,
      title: "Task 3 · MarkItDown",
      subtitle: "Trích văn bản, thêm YAML frontmatter",
      meta: "title · url · doc_type · customer_role",
    },
    {
      id: "standardized",
      kind: "store",
      icon: Boxes,
      title: "data/standardized/",
      subtitle: "13 file .md đã chuẩn hoá",
      meta: `${formatInt(totalChars)} ký tự`,
    },
    {
      id: "chunking",
      kind: "process",
      icon: Scissors,
      title: "Task 4 · Chunking",
      subtitle: `Cửa sổ ${PIPELINE_CONFIG.chunkSize} ký tự, bước ${
        PIPELINE_CONFIG.chunkSize - PIPELINE_CONFIG.chunkOverlap
      }`,
      meta: `overlap ${PIPELINE_CONFIG.chunkOverlap} ký tự`,
    },
    {
      id: "embedding",
      kind: "process",
      icon: Sparkles,
      title: "Embedding",
      subtitle: PIPELINE_CONFIG.embeddingModel,
      meta: `${PIPELINE_CONFIG.embeddingDim} chiều · đa ngữ`,
    },
    {
      id: "chroma",
      kind: "store",
      icon: Database,
      title: PIPELINE_CONFIG.vectorStore,
      subtitle: `collection ${PIPELINE_CONFIG.collection}`,
      meta: `≈ ${formatInt(TOTAL_CHUNKS)} vector · ${PIPELINE_CONFIG.similarity}`,
    },
  ];
}

function StageNode({ stage }: { stage: Stage }) {
  const Icon = stage.icon;
  const isStore = stage.kind === "store";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-start gap-2.5 rounded-xl border px-3 py-2.5",
        isStore
          ? "border-accent/25 bg-accent-soft"
          : "border-dashed border-border bg-surface-2",
      )}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg",
          isStore ? "bg-accent text-accent-fg" : "bg-surface-3 text-fg-muted",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-[13px] font-semibold",
            isStore ? "font-mono text-accent" : "text-fg",
          )}
        >
          {stage.title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-fg-muted">
          {stage.subtitle}
        </span>
        <span className="mt-0.5 block font-mono text-[10px] leading-snug text-fg-subtle">
          {stage.meta}
        </span>
      </span>
    </div>
  );
}

/**
 * Sơ đồ luồng dữ liệu — thuần div + icon, không thêm thư viện vẽ.
 * Trên màn hẹp các chặng tự xuống dòng, mũi tên xoay 90° nên không bao giờ
 * đẩy trang cuộn ngang.
 */
export function PipelineFlow({ totalChars }: { totalChars: number }) {
  const stages = buildStages(totalChars);

  return (
    <Card as="section">
      <CardHeader
        title="Luồng dữ liệu vào kho tri thức"
        description="Từ file tải về đến vector trong ChromaDB — mỗi chặng ứng với một task trong src/."
      />
      <div className="p-4">
        <ol className="flex flex-wrap items-stretch gap-2">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className="flex min-w-0 flex-1 basis-56 items-stretch gap-2"
            >
              <StageNode stage={stage} />
              {index < stages.length - 1 ? (
                <span
                  aria-hidden
                  className="grid shrink-0 place-items-center text-fg-subtle"
                >
                  {/* Dưới 640px mỗi chặng chiếm trọn một dòng nên mũi tên xoay xuống. */}
                  <ArrowRight className="size-4 rotate-90 sm:rotate-0" />
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
          Khối nền xanh là nơi dữ liệu được lưu lại trên đĩa; khối viền đứt là
          bước xử lý không sinh file trung gian. Đổi corpus thì phải xoá
          <span className="mx-1 font-mono text-fg-muted">chroma_db/</span>
          rồi index lại, nếu không chunk cũ và mới sẽ lẫn vào nhau.
        </p>
      </div>
    </Card>
  );
}
