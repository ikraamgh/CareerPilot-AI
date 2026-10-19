import type { Metadata } from "next";
import { JobMatchPage } from "@/components/job-match/JobMatchPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Job Match" };

export default function Page() {
  return <JobMatchPage />;
}
