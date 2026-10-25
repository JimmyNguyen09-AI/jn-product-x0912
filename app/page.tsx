import Story from "./story";
import { listPublished } from "@/lib/journal";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { stories, total } = await listPublished({ limit: 4 });
  return <Story stories={stories} total={total} year={Number(new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Australia/Sydney" }).format(new Date()))} />;
}
