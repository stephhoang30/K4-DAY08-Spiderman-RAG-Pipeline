import { AppShell } from "@/components/AppShell";
import { RetrievalExplorer } from "@/components/retrieval/RetrievalExplorer";

export const metadata = {
  title: "Truy xuất · VinUniversity RAG Lab",
};

export default function RetrievalPage() {
  return (
    <AppShell>
      <RetrievalExplorer />
    </AppShell>
  );
}
