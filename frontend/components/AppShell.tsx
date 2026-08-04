"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

/**
 * Khung ứng dụng: sidebar cố định trên desktop, drawer trượt trên mobile.
 * Mọi trang đều bọc bằng component này (xem app/page.tsx và các route khác).
 *
 * @param sidebarSlot Nội dung phụ trong sidebar, riêng theo từng trang.
 * @param fullHeight  true → vùng <main> không tự cuộn, trang tự quản lý chiều cao
 *                    (trang Chat dùng cái này để ghim ô nhập ở đáy).
 *                    false (mặc định) → <main> cuộn dọc như trang tài liệu bình thường.
 */
export function AppShell({
  children,
  sidebarSlot,
  fullHeight = false,
}: {
  children: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  fullHeight?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-bg">
      {/* Sidebar — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-border lg:block">
        <Sidebar>{sidebarSlot}</Sidebar>
      </aside>

      {/* Sidebar — mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 animate-fade-in"
          />
          <div className="absolute inset-y-0 left-0 w-[17.5rem] max-w-[85vw] border-r border-border shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng menu"
              className="absolute right-2 top-4 z-10 grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-3 hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
            <Sidebar onNavigate={() => setOpen(false)}>{sidebarSlot}</Sidebar>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar — chỉ hiện trên mobile */}
        <header className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở menu"
            className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-fg-muted hover:bg-surface-3 hover:text-fg"
          >
            <Menu className="size-4" aria-hidden />
          </button>
          <Logo size="sm" subtitle={null} className="min-w-0 flex-1" />
          <ThemeToggle />
        </header>

        <main
          className={cn(
            "min-h-0 flex-1",
            fullHeight ? "overflow-hidden" : "overflow-y-auto scrollbar-slim",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
