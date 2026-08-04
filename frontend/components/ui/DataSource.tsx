import { Database, FlaskConical, Radio, ServerOff } from "lucide-react";
import type { DataSource } from "@/lib/data";
import type { Wiring } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Nhãn nguồn dữ liệu cho cả một trang.
 *
 * Đây là yêu cầu quan trọng nhất của phần đấu nối: người xem phải luôn biết
 * con số trên màn hình là đo thật hay là dữ liệu demo. Nhìn nhầm số mock thành
 * số thật còn tệ hơn là không có nhãn nào.
 */
export function DataSourceBadge({
  source,
  className,
  title,
}: {
  source: DataSource;
  className?: string;
  title?: string;
}) {
  const isLive = source === "live";
  // Không dùng <Badge> ở đây vì cần `title` để giải thích khi rê chuột
  // (ví dụ: lý do cụ thể khiến phải rơi về mock).
  return (
    <span
      title={
        title ??
        (isLive
          ? "Số liệu lấy trực tiếp từ backend FastAPI"
          : "Số liệu lấy từ lib/mock — backend chưa chạy hoặc chưa có endpoint")
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        isLive
          ? "border-ok/25 bg-ok-soft text-ok"
          : "border-warn/25 bg-warn-soft text-warn",
        className,
      )}
    >
      {isLive ? (
        <Radio className="size-3 shrink-0" aria-hidden />
      ) : (
        <FlaskConical className="size-3 shrink-0" aria-hidden />
      )}
      {isLive ? "dữ liệu thật" : "dữ liệu demo"}
    </span>
  );
}

/**
 * Nhãn đấu nối của MỘT tầng pipeline, lấy thẳng từ `StageResult.wiring`.
 *
 * Từng tầng có nhãn riêng vì chúng độc lập với nhau: có thể Task 5-9 đã chạy
 * code thật trong khi Task 10 còn stub. Bước nào còn mock thì phải ghi rõ ở
 * đúng bước đó, không được để cả khối trace trông như live.
 */
export function WiringBadge({
  wiring,
  note,
  className,
}: {
  wiring: Wiring | undefined;
  note?: string;
  className?: string;
}) {
  const isLive = wiring === "live";
  return (
    <span
      title={note ?? (isLive ? "Tầng này chạy code thật trong src/" : "Dữ liệu demo")}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded border px-1 py-px font-mono text-[10px] font-medium leading-4",
        isLive
          ? "border-ok/25 bg-ok-soft text-ok"
          : "border-warn/25 bg-warn-soft text-warn",
        className,
      )}
    >
      {isLive ? "live" : "mock"}
    </span>
  );
}

/**
 * Banner khi backend không gọi được — nói rõ đang xem dữ liệu demo và chỉ luôn
 * lệnh bật backend, để người chấm bài không phải đi tìm trong README.
 */
export function BackendOfflineBanner({
  error,
  className,
}: {
  error?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border border-warn/30 bg-warn-soft px-3 py-2.5",
        className,
      )}
    >
      <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-warn">
        <ServerOff className="size-3.5 shrink-0" aria-hidden />
        Đang dùng dữ liệu demo, backend chưa chạy
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-fg-muted">
        Mọi con số trên trang này lấy từ <code className="font-mono">lib/mock</code>.
        Bật backend rồi tải lại trang để xem số đo thật:
      </p>
      <pre className="mt-1.5 overflow-x-auto scrollbar-slim rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-[11px] text-fg">
        .venv/bin/uvicorn api.main:app --port 8001
      </pre>
      {error ? (
        <p className="mt-1.5 text-[11px] text-fg-subtle">Chi tiết: {error}</p>
      ) : null}
    </div>
  );
}

/**
 * Thông báo trong lúc chờ.
 * Nói trước là lần gọi đầu có thể mất tới 30 giây, vì backend phải nạp
 * `BAAI/bge-m3` — không nói thì người dùng tưởng app treo.
 */
export function LoadingNote({
  label = "Đang gọi backend…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-[12px] text-fg-muted",
        className,
      )}
    >
      <Database className="size-3.5 shrink-0 animate-pulse text-accent" aria-hidden />
      {label}
      <span className="text-fg-subtle">
        lần gọi đầu có thể mất 20–30s vì phải nạp model BAAI/bge-m3
      </span>
    </p>
  );
}

/** Khối xám nhấp nháy dùng khi đang tải. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-surface-3", className)}
    />
  );
}
