import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { storyCopy } from "../content";
/* Each word is its own span so the closing line can arrive word by word.
 * Spaces stay as real text nodes: innerText and screen readers still read the
 * plain sentence. The index feeds the CSS transition delay. */
function Words({ text, from }: { text: string; from: number }) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word, i) => (
      <Fragment key={i}>
        {i > 0 && " "}
        <span className="word" style={{ "--i": from + i } as CSSProperties}>
          {word}
        </span>
      </Fragment>
    ));
}
const count = (text: string) => text.split(" ").filter(Boolean).length;
export default function ClosingStatement() {
  const [first, second] = storyCopy.closing;
  const space = second.indexOf(" ");
  const lead = space === -1 ? "" : second.slice(0, space);
  const emphasis = space === -1 ? second : second.slice(space + 1);
  const total = count(first) + count(lead) + count(emphasis);
  return (
    <section
      id="unwritten"
      className="closing"
      aria-labelledby="closing-heading"
      style={{ "--words": total } as CSSProperties}
    >
      <h2 id="closing-heading">
        <span>
          <Words text={first} from={0} />
        </span>
        <span>
          {lead && (
            <>
              <Words text={lead} from={count(first)} />{" "}
            </>
          )}
          <em>
            <Words text={emphasis} from={count(first) + count(lead)} />
            <svg
              className="closing-underline"
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 9.5C38 4.5 92 11.5 197 6" pathLength="1" />
            </svg>
          </em>
        </span>
      </h2>
      <div className="closing-epilogue">
        <p className="closing-whisper">
          Những trang tiếp theo vẫn còn để ngỏ — cảm ơn bạn đã đi cùng tôi qua những khung hình đầu tiên.
        </p>
        <div className="closing-actions">
          <Link className="ink-link" href="/stories">
            Vào góc đọc chuyện <span aria-hidden="true">↗</span>
          </Link>
          <a className="closing-top-link" href="#beginning">
            Lật lại từ Chương 1 <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
