import type { Metadata } from "next";
import { HistoryPage } from "@/components/history/HistoryPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analysis History" };

export default function Page() {
  return <HistoryPage />;
}
