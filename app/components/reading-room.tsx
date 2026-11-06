/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
import Link from "next/link";
import { Reveal } from "./motion-system";
import { type StorySummary, topicNames } from "@/lib/types";
export function StoryRows({ stories }: { stories: StorySummary[] }) {
  return (
    <div className="story-rows">
      {stories.map((story, index) => (
        <Reveal key={story.id}>
          <article className={`story-row topic-${story.topic}`}>
            <span className="story-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="story-row-copy">
              <p className="eyebrow">
                {topicNames[story.topic]}{" "}
                <span> / {story.minutes} phút đọc</span>
              </p>
              <h3>
                <Link href={`/stories/${story.slug}`}>{story.title}</Link>
              </h3>
              <p>{story.excerpt}</p>
              <span className="story-provenance">
                {story.opening
                  ? "Từ những trang mở đầu"
                  : story.publishedAt
                    ? new Date(story.publishedAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Australia/Sydney",
                      })
                    : ""}
              </span>
            </div>
            {story.cover && (
              <Link
                className="story-row-cover"
                href={`/stories/${story.slug}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={story.cover}
                  alt=""
                  width="240"
                  height="160"
                  loading="lazy"
                />
              </Link>
            )}
            <Link
              className="read-arrow"
              href={`/stories/${story.slug}`}
              aria-label={`Đọc ${story.title}`}
            >
              ↗
            </Link>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
export default function ReadingRoom({
  stories,
  total,
}: {
  stories: StorySummary[];
  total: number;
}) {
  return (
    <section
      id="stories"
      className="reading-room"
      aria-labelledby="reading-room-heading"
    >
      <Reveal>
        <header className="reading-room-heading">
          <div>
            <p className="chapter-label">Sau những trang mở đầu</p>
            <h2 id="reading-room-heading">
              Vẫn còn vài điều
              <br />
              nằm giữa những dòng chữ.
            </h2>
          </div>
          <div className="room-invitation">
            <p>
              Nãy giờ mới là phần mở đầu.
              <br />
              Những chuyện nhỏ hơn, tôi để ở đây.
            </p>
            <Link className="ink-link" href="/stories">
              Vào góc đọc chuyện <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>
      </Reveal>
      <div className="room-rule">
        <span>Những trang gần đây</span>
        <span>
          {total} câu chuyện, đọc chậm thôi
        </span>
      </div>
      {stories.length ? (
        <StoryRows stories={stories} />
      ) : (
        <p className="empty-reading">
          Trang tiếp theo tôi vẫn đang viết. Lúc nào thảnh thơi, bạn ghé lại nhé.
        </p>
      )}
      <div className="room-colophon">
        <p>Đọc chậm thôi. Chừa lại một chút chỗ trống.</p>
        <Link href="/stories">Tất cả câu chuyện →</Link>
      </div>
    </section>
  );
}
