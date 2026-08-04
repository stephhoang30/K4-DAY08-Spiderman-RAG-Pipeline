import { Badge } from "@/components/ui/Badge";
import { getDocument } from "@/lib/mock";
import { cn, formatScore } from "@/lib/utils";

/**
 * Các mảnh nhỏ dùng lại giữa 5 khối của trang Đánh giá.
 * Không tự đặt màu mới — chỉ dùng token trong globals.css và Badge/ScoreBar sẵn có.
 */

/** Tiêu đề đánh số cho từng phần của trang. */
export function Section({
  index,
  title,
  description,
  actions,
  children,
  id,
}: {
  index: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-[11px] font-semibold text-accent">
              {index}
            </span>
            <h2 className="text-base font-semibold tracking-tight text-fg">
              {title}
            </h2>
          </div>
          {description ? (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Chênh lệch so với config đối chứng. */
export function DeltaBadge({
  delta,
  digits = 3,
  className,
}: {
  delta: number;
  digits?: number;
  className?: string;
}) {
  if (Math.abs(delta) < 0.0005) {
    return (
      <span className={cn("font-mono text-[10px] text-fg-subtle", className)}>
        ±0
      </span>
    );
  }
  return (
    <Badge
      tone={delta > 0 ? "ok" : "danger"}
      mono
      className={cn("px-1 py-0", className)}
    >
      {delta > 0 ? "+" : "−"}
      {Math.abs(delta).toFixed(digits)}
    </Badge>
  );
}

/** Ô điểm trong bảng — xanh khi đạt ngưỡng, đỏ khi trượt. */
export function MetricValue({
  value,
  threshold,
  className,
}: {
  value: number;
  threshold: number;
  className?: string;
}) {
  const passed = value >= threshold;
  return (
    <span
      className={cn(
        "font-mono text-xs font-semibold tabular-nums",
        passed ? "text-fg" : "text-danger",
        className,
      )}
    >
      {formatScore(value)}
    </span>
  );
}

/** Nhãn tài liệu gọn, dùng trong bảng golden dataset. */
export function DocChip({
  docId,
  maxWidth = "max-w-[8.5rem]",
}: {
  docId: string;
  maxWidth?: string;
}) {
  const doc = getDocument(docId);
  if (!doc) {
    return (
      <span className="font-mono text-[11px] text-fg-subtle">{docId}</span>
    );
  }
  return (
    <Badge
      tone={doc.type === "legal" ? "legal" : "news"}
      className={cn("align-middle", maxWidth)}
    >
      <span className="min-w-0 truncate" title={doc.fileName}>
        {doc.title}
      </span>
    </Badge>
  );
}

/** Trạng thái đạt / không đạt của một ca. */
export function PassBadge({ passed }: { passed: boolean }) {
  return (
    <Badge tone={passed ? "ok" : "danger"}>
      {passed ? "Đạt" : "Không đạt"}
    </Badge>
  );
}

/** Bảng bọc trong khung cuộn ngang riêng — không để cả trang cuộn ngang. */
export function TableScroller({
  children,
  minWidth,
  className,
}: {
  children: React.ReactNode;
  minWidth: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto scrollbar-slim", className)}>
      <div className={minWidth}>{children}</div>
    </div>
  );
}
