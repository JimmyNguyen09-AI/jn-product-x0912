import type { Metadata } from "next";
import Link from "next/link";
import { listPublished } from "@/lib/journal";
import { topics, topicNames } from "@/lib/types";
import { JournalHeader, JournalFooter } from "../components/journal-shell";
import { StoryRows } from "../components/reading-room";
import { Reveal } from "../components/motion-system";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Góc đọc chuyện — JN",
  description:
    "Những trang viết về niềm tin, suy tư và quá trình lớn lên. Một câu chuyện riêng, từng trang một.",
};
export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 120) : "";
  const topic = typeof params.topic === "string" ? params.topic : "";
  const result = await listPublished({ q, topic, page: Number(params.page) || 1 });
  const link = (next: number) =>
    `/stories?${new URLSearchParams({ q, topic, page: String(next) })}`;
  return (
    <>
      <JournalHeader />
      <main id="main" className="library-page">
        <Reveal>
          <header className="library-intro">
            <p className="chapter-label">Góc đọc chuyện / JN</p>
            <h1>
              Một chỗ dành cho
              <br />
              những câu chuyện nhỏ.
            </h1>
            <p>
              Có những khoảnh khắc cần hơn một khung hình.
              <br />
              Ở đây, chúng có thêm một chút chỗ.
            </p>
            <span className="library-side-note" aria-hidden="true">
              cứ thong thả nhé ↓
            </span>
          </header>
        </Reveal>
        <section aria-label="Tìm câu chuyện" className="story-discovery">
          <form action="/stories" method="get" className="story-search">
            <label htmlFor="story-search">Tìm một trang viết</label>
            <div>
              <input
                id="story-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Một từ, một cảm giác, một nhan đề…"
                maxLength={120}
              />
              <input name="topic" type="hidden" value={topic} />
              <button type="submit" aria-label="Tìm câu chuyện">
                Tìm kiếm ↗
              </button>
            </div>
          </form>
          <nav className="topic-links" aria-label="Chủ đề câu chuyện">
            <Link
              href={`/stories?${new URLSearchParams({ q })}`}
              aria-current={
                !topics.includes(topic as (typeof topics)[number])
                  ? "page"
                  : undefined
              }
            >
              Tất cả trang viết
            </Link>
            {topics.map((t) => (
              <Link
                key={t}
                href={`/stories?${new URLSearchParams({ q, topic: t })}`}
                aria-current={topic === t ? "page" : undefined}
              >
                {topicNames[t]}
              </Link>
            ))}
          </nav>
        </section>
        <div className="room-rule">
          <h2>
            {q
              ? `Kết quả cho “${q}”`
              : topicNames[topic as keyof typeof topicNames] || "Tất cả câu chuyện"}
          </h2>
          <span>
            {result.total} trang viết
          </span>
        </div>
        {result.stories.length ? (
          <StoryRows stories={result.stories} />
        ) : (
          <div className="empty-reading">
            <h3>{!q && topics.includes(topic as (typeof topics)[number]) ? "Chương này đang chờ những trang viết mới." : "Chưa có trang viết phù hợp."}</h3>
            <p>{!q && topics.includes(topic as (typeof topics)[number]) ? "Những câu chuyện sẽ xuất hiện ở đây khi được đăng. Trong lúc chờ, bạn có thể đọc các chương khác." : "Thử một từ khác, hoặc xem lại tất cả câu chuyện."}</p>
            <Link className="ink-link" href="/stories">
              Xem tất cả câu chuyện →
            </Link>
          </div>
        )}
        {result.pages > 1 && (
          <nav className="pagination" aria-label="Các trang kết quả">
            {result.page > 1 ? (
              <Link href={link(result.page - 1)}>← Trước</Link>
            ) : (
              <span />
            )}
            <span>
              Trang {result.page} / {result.pages}
            </span>
            {result.page < result.pages ? (
              <Link href={link(result.page + 1)}>Tiếp →</Link>
            ) : (
              <span />
            )}
          </nav>
        )}
        <aside className="library-note">
          <span aria-hidden="true">✳</span>
          <p>
            Không cần đọc theo thứ tự.
            <br />
            Bắt đầu từ trang khiến bạn thấy gần gũi nhất.
          </p>
        </aside>
      </main>
      <JournalFooter />
    </>
  );
}
