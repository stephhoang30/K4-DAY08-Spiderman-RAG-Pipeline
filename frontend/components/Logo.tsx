import { cn } from "@/lib/utils";

/**
 * Logo VinUniversity — SVG inline (không import file ngoài repo).
 * Đỏ #c72127 / xanh #134d8b. Ở dark mode xanh được làm sáng lên cho dễ đọc.
 */
export function LogoMark({
  className,
  title = "VinUniversity",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 613 613"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <polygon fill="#c72127" points="126,115 213.5,202.5 126,290" />
      <polygon
        className="fill-[#134d8b] dark:fill-[#3d7cc0]"
        points="486,113 486,296 306,476 133.5,303.5 225,212 306,293 387,212"
      />
    </svg>
  );
}

export function Logo({
  className,
  subtitle = "RAG Pipeline Lab",
  size = "md",
}: {
  className?: string;
  subtitle?: string | null;
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={size === "sm" ? "h-6 w-6" : "h-8 w-8"} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate font-semibold tracking-tight text-fg",
            size === "sm" ? "text-sm" : "text-[15px]",
          )}
        >
          VinUniversity
        </span>
        {subtitle ? (
          <span className="truncate text-[11px] font-medium uppercase tracking-wider text-fg-subtle">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
