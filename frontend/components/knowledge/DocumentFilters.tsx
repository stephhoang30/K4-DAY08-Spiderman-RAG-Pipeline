"use client";

import { RotateCcw, Search } from "lucide-react";
import { useId } from "react";
import type { CustomerRole, DocType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "./labels";

export type TypeFilter = DocType | "all";
export type RoleFilter = CustomerRole | "all";

const TYPE_OPTIONS: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "legal", label: "legal" },
  { value: "news", label: "news" },
];

const ROLE_OPTIONS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "buyer", label: ROLE_LABEL.buyer },
  { value: "seller", label: ROLE_LABEL.seller },
  { value: "both", label: ROLE_LABEL.both },
];

/** Nhóm nút chọn một giá trị — thay cho <select> để bấm nhanh khi demo. */
function SegmentedGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  mono = false,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (next: T) => void;
  mono?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex min-w-0 items-center gap-1.5"
    >
      <span className="shrink-0 text-[11px] font-medium text-fg-subtle">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-md px-2 py-1 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                mono && "font-mono",
                active
                  ? "bg-surface font-semibold text-accent shadow-[0_1px_2px_rgba(15,26,38,0.06)]"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DocumentFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  role,
  onRoleChange,
  resultCount,
  totalCount,
  onReset,
}: {
  search: string;
  onSearchChange: (next: string) => void;
  type: TypeFilter;
  onTypeChange: (next: TypeFilter) => void;
  role: RoleFilter;
  onRoleChange: (next: RoleFilter) => void;
  resultCount: number;
  totalCount: number;
  onReset: () => void;
}) {
  const searchId = useId();
  const dirty = search.trim() !== "" || type !== "all" || role !== "all";

  return (
    <div className="flex flex-col gap-3 border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="relative min-w-0 flex-1 basis-64">
          <label htmlFor={searchId} className="sr-only">
            Tìm theo tên tài liệu hoặc nội dung chunk
          </label>
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-subtle"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên file, chủ đề hoặc nội dung chunk…"
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-2.5 text-[13px] text-fg placeholder:text-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          />
        </div>

        <SegmentedGroup
          label="Loại"
          value={type}
          options={TYPE_OPTIONS}
          onChange={onTypeChange}
          mono
        />
        <SegmentedGroup
          label="Vai trò"
          value={role}
          options={ROLE_OPTIONS}
          onChange={onRoleChange}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-fg-subtle">
        <p aria-live="polite">
          Hiển thị{" "}
          <span className="font-mono font-semibold tabular-nums text-fg">
            {resultCount}
          </span>
          /{totalCount} tài liệu — thẻ tổng quan phía trên cũng tính theo bộ lọc
          này.
        </p>
        {dirty ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-accent transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <RotateCcw className="size-3" aria-hidden />
            Xoá bộ lọc
          </button>
        ) : null}
      </div>
    </div>
  );
}
