import type { Metadata } from "next";
import { ResumePage } from "@/components/resume/ResumePage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Resume" };

export default function Page() {
  return <ResumePage />;
}
