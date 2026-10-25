import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sessionAdmin } from "@/lib/auth";
import { getAdminStories } from "@/lib/journal";
import { JournalHeader } from "../components/journal-shell";
import WritingDesk from "./writing-desk";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Bàn viết — JN",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const admin = await sessionAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <>
      <JournalHeader admin />
      <main id="main" className="writing-page">
        <WritingDesk initialStories={await getAdminStories()} email={admin.username} />
      </main>
    </>
  );
}
