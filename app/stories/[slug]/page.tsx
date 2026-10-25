/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicStory, listPublished } from "@/lib/journal";
import { topicNames, readingMinutes } from "@/lib/types";
import { JournalHeader, JournalFooter } from "../../components/journal-shell";
import StoryMarkdown, { headingId } from "../../components/story-markdown";
import ReaderTools from "../../components/reader-tools";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublicStory(slug);
  if (!story) notFound();
  return story
    ? {
        title: `${story.title} — JN`,
        description: story.excerpt,
        openGraph: {
          title: story.title,
          description: story.excerpt,
          type: "article",
        },
      }
    : { title: "Không tìm thấy trang — JN" };
}
export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getPublicStory(slug);
  if (!story) notFound();
  const headings = Array.from(story.body.matchAll(/^##\s+(.+)$/gm), (m) => ({
    title: m[1],
    id: headingId(m[1]),
  }));
  const related = (await listPublished({ limit: 24 }))
    .stories.filter((s) => s.id !== story.id)
    .slice(0, 2);
  return (
    <>
      <JournalHeader />
      <main id="main" className="reader-page">
        <Link className="back-to-pages" href="/stories">
          ← Về góc đọc chuyện
        </Link>
        <header className={`reader-title topic-${story.topic}`}>
          <p className="eyebrow">
            {topicNames[story.topic]} / {readingMinutes(story.body)} phút đọc
          </p>
          <h1>{story.title}</h1>
          <p className="reader-deck">{story.excerpt}</p>
          <div className="reader-byline">
            <span>JN</span>
            <span>
              {story.opening
                ? "Từ những trang mở đầu"
                : new Date(story.publishedAt!).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Australia/Sydney",
                  })}
            </span>
          </div>
        </header>
        {story.cover && (
          <figure className="reader-cover">
            <img
              src={story.cover}
              alt={story.coverAlt}
              width="1800"
              height="1100"
            />
          </figure>
        )}
        <ReaderTools id={story.id} title={story.title} />
        <div className="reader-layout">
          <aside className="reader-contents" aria-label="Trong trang này">
            <p className="eyebrow">Trong trang này</p>
            {headings.map((h) => (
              <a key={h.id} href={`#${h.id}`}>
                {h.title}
              </a>
            ))}
          </aside>
          <article id="reading-text" aria-label={story.title}>
            <StoryMarkdown body={story.body} />
            <div className="reader-end">
              <span aria-hidden="true">✳</span>
              <p>Cảm ơn bạn đã dành một chút thời gian ở đây.</p>
              <Link href="/stories">Tìm một trang khác ↗</Link>
            </div>
          </article>
        </div>
        <section className="next-pages" aria-labelledby="next-pages-title">
          <p className="chapter-label">Để đoạn kết còn mở</p>
          <h2 id="next-pages-title">Đi tiếp một chút.</h2>
          <div>
            {related.map((s) => (
              <Link href={`/stories/${s.slug}`} key={s.id}>
                <span className="eyebrow">{topicNames[s.topic]}</span>
                <span>{s.title}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <JournalFooter />
    </>
  );
}
