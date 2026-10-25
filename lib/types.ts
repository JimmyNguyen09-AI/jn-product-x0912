export const topics = ["alone", "trust", "within", "becoming"] as const;
export type Topic = (typeof topics)[number];
export const topicNames: Record<Topic, string> = {
  alone: "Chương 1 · Những bước chân",
  trust: "Chương 2 · Một bàn tay",
  within: "Chương 3 · Những nghĩ suy",
  becoming: "Chương 6 · Về phía ánh sáng",
};
export type StoryEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  topic: Topic;
  status: "draft" | "published" | "archived";
  cover: string;
  coverAlt: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  version: number;
  opening: number;
};
export type StorySummary = Omit<StoryEntry, "body"> & { minutes: number };
export const statusNames = {draft:"Bản nháp",published:"Đã xuất bản",archived:"Trong kho"} as const;
export function readingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.trim().split(/\s+/).length / 180));
}
