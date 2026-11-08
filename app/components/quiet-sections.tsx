"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "./motion-system";
import type { Topic } from "@/lib/types";

const resonanceCards: {
  topic: Topic;
  num: string;
  mood: string;
  quote: string;
  whisper: string;
  cta: string;
}[] = [
  {
    topic: "alone",
    num: "01",
    mood: "Quen đi một mình",
    quote: "Ở một mình và cảm thấy cô độc là hai chuyện khác nhau. Đôi khi mình chỉ đang giữ sẵn một khoảng trống đủ yên cho người biết trân trọng.",
    whisper: "Dành cho những ngày bước chậm giữa đám đông.",
    cta: "Đọc những trang Chương 1 ↗",
  },
  {
    topic: "trust",
    num: "02",
    mood: "Tập tin thêm lần nữa",
    quote: "Đưa tay ra luôn cần nhiều can đảm hơn giữ tay trong túi áo. Tổn thương không có nghĩa là lòng tốt của bạn đã sai.",
    whisper: "Dành cho những vết xước đang dần khép miệng.",
    cta: "Đọc những trang Chương 2 ↗",
  },
  {
    topic: "within",
    num: "03",
    mood: "Đêm còn nhiều nghĩ suy",
    quote: "Không cần ép mọi câu hỏi phải có câu trả lời ngay tối nay. Có những điều chỉ cần viết xuống để đầu óc được nghỉ ngơi.",
    whisper: "Dành cho lúc yên lặng bên ngoài trở nên chật chội.",
    cta: "Đọc những trang Chương 3 ↗",
  },
  {
    topic: "love",
    num: "04",
    mood: "Nhớ một điều dang dở",
    quote: "Có những tương lai chỉ kịp xảy ra trong ý nghĩ, nhưng sự dịu dàng đã từng có giữa hai người vẫn là điều có thật.",
    whisper: "Dành cho một chữ “chúng ta” đã ở lại phía sau.",
    cta: "Đọc những trang Chương 4 ↗",
  },
  {
    topic: "family",
    num: "05",
    mood: "Tìm về hơi ấm nhà",
    quote: "Giữa mọi biến thiên, vẫn có những người thương mình từ trước khi mình biết cách gọi tên thế giới.",
    whisper: "Dành cho nơi chốn không cần nhiều lời.",
    cta: "Đọc những trang Chương 5 ↗",
  },
  {
    topic: "becoming",
    num: "06",
    mood: "Đợi nắng lên từ từ",
    quote: "Bạn vẫn đang lớn lên ở những chỗ chưa ai nhìn thấy. Chậm thôi cũng được, miễn là lòng vẫn hướng về phía sáng.",
    whisper: "Dành cho mầm cây đang âm thầm bén rễ.",
    cta: "Đọc những trang Chương 6 ↗",
  },
];

export function NewPages() {
  const [selected, setSelected] = useState(5);
  const [kept, setKept] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("jn-resonance-idx"));
      if (Number.isInteger(saved) && saved >= 0 && saved < resonanceCards.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelected(saved);
      }
      setKept(localStorage.getItem("jn-resonance-kept") === "1");
    } catch {}
  }, []);

  const card = resonanceCards[selected];

  function selectMood(idx: number) {
    setSelected(idx);
    try {
      localStorage.setItem("jn-resonance-idx", String(idx));
    } catch {}
  }

  function toggleKeep() {
    const next = !kept;
    setKept(next);
    try {
      localStorage.setItem("jn-resonance-kept", next ? "1" : "0");
    } catch {}
  }

  return (
    <section className="new-pages" aria-labelledby="new-pages-heading">
      <Reveal>
        <div className="chapter-label">Từ những gì đã đi qua</div>
        <h2 id="new-pages-heading">
          Tôi vẫn còn
          <br />
          những trang để viết.
        </h2>
        <div className="new-pages-columns">
          <p>
            Không phải để kể lại hết mọi chuyện.
            <br />
            Chỉ để giữ lại những gì tôi hiểu thêm về mình.
          </p>
          <div>
            <p>
              Một ý nghĩ viết xuống cho đỡ nặng.
              <br />
              Một chuyện cũ nhìn lại thấy khác.
              <br />
              Một chỗ trống chừa cho điều chưa tới.
            </p>
            <Link className="ink-link" href="/stories">
              Tìm một câu chuyện để đọc ↗
            </Link>
          </div>
        </div>
        <div className="resonance-desk" aria-label="Góc chọn tâm trạng đồng điệu">
          <div className="resonance-header">
            <span className="eyebrow">Dấu trang dành riêng cho bạn</span>
            <p className="resonance-prompt">
              Hôm nay, mảnh ghép nào gần với lòng bạn nhất?
            </p>
          </div>
          <div className="resonance-tabs" role="group" aria-label="Chọn cảm xúc đồng điệu">
            {resonanceCards.map((item, idx) => (
              <button
                key={item.topic}
                type="button"
                className={`resonance-tab topic-${item.topic}`}
                aria-pressed={selected === idx}
                onClick={() => selectMood(idx)}
              >
                <span className="resonance-num" aria-hidden="true">
                  {item.num}
                </span>
                <span>{item.mood}</span>
              </button>
            ))}
          </div>
          <div className={`resonance-postcard topic-${card.topic}`} key={card.topic}>
            <div className="postcard-stamp" aria-hidden="true">
              <span>JN</span>
              <small>CHƯƠNG {card.num}</small>
            </div>
            <p className="postcard-whisper">{card.whisper}</p>
            <blockquote className="postcard-quote">“{card.quote}”</blockquote>
            <div className="postcard-footer">
              <button
                type="button"
                className="postcard-keep"
                aria-pressed={kept}
                onClick={toggleKeep}
              >
                {kept ? "✦ Đã giữ lời nhắn này trong sổ" : "☆ Giữ lời nhắn này cho hôm nay"}
              </button>
              <Link className="ink-link" href={`/stories?topic=${card.topic}`}>
                {card.cta}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
