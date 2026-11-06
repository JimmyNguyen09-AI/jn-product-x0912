import Link from "next/link";
import { Reveal } from "./motion-system";
import { topics, type Topic } from "@/lib/types";
export function SceneReadingLink({ topic }: { topic: Topic }) {
  return (
    <a className="scene-reading-link" href={`/stories?topic=${topic}`}>
      <span>Những trang viết phía sau</span>Đọc chuyện chương {topics.indexOf(topic) + 1} ↗
    </a>
  );
}
export function MarginNotes() {
  return (
    <section className="margin-notes" aria-labelledby="margins-heading">
      <Reveal>
        <div className="margin-title">
          <span className="chapter-label">Những điều bức vẽ chưa kể</span>
          <h2 id="margins-heading">
            Chừa một khoảng nhỏ
            <br />
            cho những lời chưa nói.
          </h2>
          <p>
            Bạn có thể ở lại với khung hình.
            <br />
            Hoặc lật sang trang viết phía sau nó.
          </p>
        </div>
      </Reveal>
      <div className="margin-entries">
        <details>
          <summary>
            <span>01</span>Một mình chưa phải là cả câu chuyện.
            <span className="disclosure-sign" aria-hidden="true">
              +
            </span>
          </summary>
          <div>
            <p>
              Khung hình đầu giữ hai cảm giác cùng lúc: đi một mình, nhưng vẫn mong có một người bên cạnh.
            </p>
            <Link href="/stories?topic=alone">Đọc tiếp chương một ↗</Link>
          </div>
        </details>
        <details>
          <summary>
            <span>02</span>Có những điều nằm giữa hai dòng chữ.
            <span className="disclosure-sign" aria-hidden="true">
              +
            </span>
          </summary>
          <div>
            <p>
              Hai bàn tay kể về niềm tin và một lần bị làm đau. Chữ viết chừa chỗ cho điều đến sau, mà không phải phơi ra hết những gì riêng tư.
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
        <p className="chapter-label">Lớn lên, không cần hạn chót</p>
        <div className="growth-words">
          <span>Nghỉ lại.</span>
          <span>Bén rễ.</span>
          <span>Vươn lên.</span>
        </div>
        <div className="growth-afterword">
          <p>
            Bông hoa chỉ là một hình ảnh.
            <br />
            Lớn lên thì cần nhiều hơn một trang viết.
          </p>
          <Link className="ink-link" href="/stories?topic=becoming">
            Đọc tiếp về những đổi thay ↗
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
