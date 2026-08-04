import {
  ArrowDownUp,
  GitMerge,
  Network,
  Radar,
  Sparkles,
  TextSearch,
  type LucideIcon,
} from "lucide-react";
import type { PipelineStepId, PipelineStepStatus } from "@/lib/types";

export const STEP_ICON: Record<PipelineStepId, LucideIcon> = {
  semantic: Radar,
  lexical: TextSearch,
  merge: GitMerge,
  rerank: ArrowDownUp,
  fallback: Network,
  generation: Sparkles,
};

/** Số thứ tự bước hiển thị trong timeline. */
export const STEP_ORDER: PipelineStepId[] = [
  "semantic",
  "lexical",
  "merge",
  "rerank",
  "fallback",
  "generation",
];

export const STATUS_LABEL: Record<PipelineStepStatus, string> = {
  done: "Xong",
  skipped: "Bỏ qua",
  fallback: "Fallback kích hoạt",
  running: "Đang chạy",
  pending: "Chờ",
};

export const STATUS_CLASS: Record<PipelineStepStatus, string> = {
  done: "bg-ok-soft text-ok border-ok/25",
  skipped: "bg-surface-3 text-fg-subtle border-border",
  fallback: "bg-warn-soft text-warn border-warn/30",
  running: "bg-accent-soft text-accent border-accent/30",
  pending: "bg-surface-3 text-fg-subtle border-border",
};
