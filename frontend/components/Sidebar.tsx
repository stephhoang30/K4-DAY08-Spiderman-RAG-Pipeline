"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Library,
  MessagesSquare,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { PIPELINE_CONFIG } from "@/lib/mock";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/",
    label: "Chat",
    description: "Hỏi đáp chính sách",
    icon: MessagesSquare,
  },
  {
    href: "/knowledge",
    label: "Kho tri thức",
    description: "Tài liệu & chunk",
    icon: Library,
  },
  {
    href: "/retrieval",
    label: "Truy xuất",
    description: "Thử nghiệm pipeline",
    icon: Workflow,
  },
  {
    href: "/evaluation",
    label: "Đánh giá",
    description: "Golden dataset & metric",
    icon: BarChart3,
  },
] as const satisfies ReadonlyArray<{
  href: "/" | "/knowledge" | "/retrieval" | "/evaluation";
  label: string;
  description: string;
  icon: LucideIcon;
}>;

/**
 * Sidebar dùng chung cho mọi trang.
 * `children` là vùng nội dung riêng của từng trang (ví dụ: danh sách hội thoại
 * ở trang Chat). Wave 2 có thể truyền bộ lọc tài liệu, danh sách run…
 */
export function Sidebar({
  children,
  onNavigate,
}: {
  children?: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Logo />
        </Link>
        <ThemeToggle />
      </div>

      <nav className="px-2.5" aria-label="Điều hướng chính">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "text-fg-muted hover:bg-surface-3 hover:text-fg",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-accent" : "text-fg-subtle",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="hidden truncate text-[11px] text-fg-subtle xl:block">
                    {item.description}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children ? (
        <div className="mt-2 flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="border-t border-border px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
          Cấu hình pipeline
        </p>
        <dl className="mt-1.5 space-y-1 text-[11px] text-fg-muted">
          <div className="flex justify-between gap-2">
            <dt>Embedding</dt>
            <dd className="truncate font-mono">{PIPELINE_CONFIG.embeddingModel}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Chunk</dt>
            <dd className="font-mono tabular-nums">
              {PIPELINE_CONFIG.chunkSize}/{PIPELINE_CONFIG.chunkOverlap}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>Ngưỡng fallback</dt>
            <dd className="font-mono tabular-nums">
              {PIPELINE_CONFIG.fallbackThreshold.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
