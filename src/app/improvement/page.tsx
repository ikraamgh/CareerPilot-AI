import type { Metadata } from "next";
import { ImprovementPage } from "@/components/improvement/ImprovementPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Improvement Plan" };

export default function Page() {
  return <ImprovementPage />;
}
