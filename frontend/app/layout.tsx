import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "VinUniversity · RAG Pipeline Lab",
  description:
    "Demo chatbot RAG trả lời câu hỏi về chính sách thương mại điện tử Shopee Việt Nam — hybrid retrieval, rerank, PageIndex fallback.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Đặt class .dark trước khi hydrate để không nhấp nháy nền sáng. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
