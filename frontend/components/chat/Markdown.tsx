"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Quote } from "lucide-react";

/**
 * Biến các trích dẫn dạng `[Chính sách trả hàng và hoàn tiền, 2026]` thành link
 * nội bộ `#cite` để render ra chip trích dẫn (react-markdown không cho phép
 * can thiệp text node nếu không viết plugin riêng).
 */
function markCitations(markdown: string): string {
  return markdown.replace(
    /\[([^[\]\n]+?,\s*20\d{2})\](?!\()/g,
    (_match, label: string) => `[${label}](#cite)`,
  );
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 text-lg font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-base font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-[15px] font-semibold tracking-tight text-fg first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1 text-sm font-semibold text-fg first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 space-y-1 pl-1 first:mt-0 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 marker:font-mono marker:text-xs marker:text-fg-subtle first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-fg">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-fg-muted">{children}</em>,
  hr: () => <hr className="my-4 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="my-3 flex gap-2 rounded-lg border-l-2 border-accent bg-accent-soft/60 px-3 py-2">
      <Quote className="mt-1 size-3.5 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0 text-[13px] text-fg-muted [&>p]:my-0">
        {children}
      </div>
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className?.startsWith("language-"));
    if (isBlock) {
      return (
        <code className="block font-mono text-[12px] leading-relaxed text-fg">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[12px] text-fg">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto scrollbar-slim rounded-lg border border-border bg-surface-2 p-3">
      {children}
    </pre>
  ),
  a: ({ children, href }) => {
    if (href === "#cite") {
      return (
        <span className="mx-0.5 inline-flex items-baseline rounded border border-accent/25 bg-accent-soft px-1 py-px align-baseline text-[11px] font-medium text-accent">
          {children}
        </span>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-accent underline underline-offset-2 hover:text-accent-hover"
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto scrollbar-slim rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface-2 text-[11px] uppercase tracking-wide text-fg-subtle">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 font-medium">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/60 px-3 py-2 align-top">{children}</td>
  ),
};

export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-[14.5px] text-fg-muted [&_ul>li]:relative [&_ul>li]:pl-4 [&_ul>li]:before:absolute [&_ul>li]:before:left-1 [&_ul>li]:before:top-[0.62em] [&_ul>li]:before:size-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-accent/60">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markCitations(content)}
      </ReactMarkdown>
    </div>
  );
}
