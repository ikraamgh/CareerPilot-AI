import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsPage />;
}
