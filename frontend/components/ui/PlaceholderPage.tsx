import { Construction } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { Card } from "./Card";

/**
 * Khung tạm cho các trang wave 2 (Knowledge / Retrieval / Evaluation).
 * Agent tiếp theo thay nội dung trong app/<route>/page.tsx bằng trang thật.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  plannedSections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  plannedSections: string[];
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <Card className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-soft text-warn">
            <Construction className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-fg">
              Trang đang được dựng ở đợt sau
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              Nền tảng giao diện (design token, sidebar, dark mode, mock data) đã
              sẵn sàng. Nội dung dự kiến của trang này:
            </p>
            <ul className="mt-3 space-y-1.5">
              {plannedSections.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-fg-muted"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
