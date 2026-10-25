import Link from "next/link";
import { Reveal } from "./motion-system";
import { topics, type Topic } from "@/lib/types";
export function SceneReadingLink({ topic }: { topic: Topic }) {
  return (
    <a className="scene-reading-link" href={`/stories?topic=${topic}`}>
      <span>Những trang viết phía sau</span>Đọc truyện chương {topics.indexOf(topic) + 1} ↗
    </a>
  );
}
export function MarginNotes() {
  return (
    <section className="margin-notes" aria-labelledby="margins-heading">
      <Reveal>
        <div className="margin-title">
          <span className="chapter-label">Những điều hình ảnh chưa kể</span>
          <h2 id="margins-heading">
            Dành một khoảng nhỏ
            <br />
            cho những lời chưa nói.
          </h2>
          <p>
            Bạn có thể ở lại cùng một khung hình.
            <br />
            Hoặc mở trang viết phía sau nó.
          </p>
        </div>
      </Reveal>
      <div className="margin-entries">
        <details>
          <summary>
            <span>01</span>Một mình chưa phải là toàn bộ câu chuyện.
            <span className="disclosure-sign" aria-hidden="true">
              +
            </span>
          </summary>
          <div>
            <p>
              Khung hình đầu giữ lại hai cảm giác cùng lúc: bước đi một mình, nhưng vẫn mong có một người ở bên.
            </p>
            <Link href="/stories?topic=alone">Đọc tiếp chương một ↗</Link>
          </div>
        </details>
        <details>
          <summary>
            <span>02</span>Có những điều nằm giữa các dòng chữ.
            <span className="disclosure-sign" aria-hidden="true">
              +
            </span>
          </summary>
          <div>
            <p>
              Hai bàn tay kể về niềm tin và sự phản bội. Những dòng chữ dành chỗ cho điều đến sau, mà không cần phơi bày mọi điều riêng tư.
            </p>
            <Link href="/stories?topic=trust">Đọc tiếp chương hai ↗</Link>
          </div>
        </details>
      </div>
    </section>
  );
}
export function BecomingNotes() {
  return (
    <section className="becoming-notes">
      <Reveal>
        <p className="chapter-label">Lớn lên, không cần một hạn chót</p>
        <div className="growth-words">
          <span>Nghỉ lại.</span>
          <span>Bén rễ.</span>
          <span>Vươn lên.</span>
        </div>
        <div className="growth-afterword">
          <p>
            Bông hoa là một hình ảnh.
            <br />
            Lớn lên cần nhiều hơn một trang viết.
          </p>
          <Link className="ink-link" href="/stories?topic=becoming">
            Đọc tiếp những đổi thay ↗
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
