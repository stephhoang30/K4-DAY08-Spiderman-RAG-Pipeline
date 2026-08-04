import { AppShell } from "@/components/AppShell";
import { KnowledgeApp } from "@/components/knowledge/KnowledgeApp";

export const metadata = {
  title: "Kho tri thức · VinUniversity RAG Lab",
};

export default function KnowledgePage() {
  return (
    <AppShell>
      <KnowledgeApp />
    </AppShell>
  );
}
