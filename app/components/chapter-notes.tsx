import Link from "next/link";
import { topics, topicNames, type Topic } from "@/lib/types";
import { Reveal } from "./motion-system";

const notes: Record<Topic, { title: string; body: string; question: string; detail: string; words: string }> = {
  alone: {
    title: "Một mình, nhưng vẫn muốn được gần ai đó.",
    body: "Những bước chân đầu tiên mở ra câu chuyện về sự cô độc và mong muốn kết nối. Hai cảm giác ấy có thể cùng tồn tại: quen đi một mình, nhưng vẫn tìm kiếm một bàn tay có thể tin tưởng.",
    question: "Phía sau những bước chân là gì?",
    detail: "Những trang viết của chương này dành cho khoảng cách giữa việc ở một mình và cảm thấy một mình. Bạn có thể bắt đầu ở đây, hoặc chọn chương gần với cảm xúc của mình hơn.",
    words: "Một mình · Kết nối · Những khởi đầu",
  },
  trust: {
    title: "Đưa tay ra cũng là một cách can đảm.",
    body: "Mong được đáp lại là điều khiến một người bước về phía người khác. Khi niềm tin bị tổn thương, câu chuyện không dừng ở khoảnh khắc ấy. Còn những câu hỏi, những khoảng cách và cách ta học để tin thêm một lần nữa.",
    question: "Điều gì còn lại sau một lần mất niềm tin?",
    detail: "Ở đây là chỗ dành cho những suy nghĩ về sự tin tưởng và giới hạn của bản thân. Không cần kể hết mọi chi tiết để thừa nhận rằng một điều đã làm mình đau.",
    words: "Niềm tin · Khoảng cách · Giới hạn",
  },
  within: {
    title: "Có những cuộc đối thoại chỉ diễn ra bên trong.",
    body: "Một khoảnh khắc đã qua vẫn có thể được tua lại nhiều lần trong đầu. Một câu nói, một điều chưa kịp trả lời, một khả năng khác. Viết xuống là cách dành cho những nghĩ suy ấy một nơi để ở, bên ngoài sự im lặng.",
    question: "Những trang viết này dành chỗ cho điều gì?",
    detail: "Cho những câu hỏi chưa có lời đáp và cảm xúc chưa dễ gọi tên. Bạn không cần tìm ngay một kết luận; có thể chỉ đọc một đoạn rồi quay lại vào lúc khác.",
    words: "Nghĩ suy · Im lặng · Gọi tên cảm xúc",
  },
  love: {
    title: "Một đoạn đường chung, một tương lai còn dang dở.",
    body: "Có những điều từng được hình dung bằng chữ “chúng ta”. Khi một người không còn trong khung hình, chỗ trống ấy giữ lại cả điều đã có và điều chưa kịp thành hình.",
    question: "Vì sao có một chương dành cho những điều dang dở?",
    detail: "Không phải câu chuyện nào cũng có một kết thúc rõ ràng. Chương này dành cho những trang viết về sự gần gũi, chia xa và những dự định chỉ từng tồn tại trong suy nghĩ.",
    words: "Gần gũi · Chia xa · Những điều chưa thành",
  },
  family: {
    title: "Nhìn lại những người ở quanh mình.",
    body: "Một bức ảnh giữ được nhiều hơn một gương mặt. Trong cuốn album này là gia đình, những thế hệ và những ký ức góp phần làm nên một con người. Mỗi tấm ảnh là một lối mở vào câu chuyện phía sau.",
    question: "Bắt đầu từ một tấm ảnh như thế nào?",
    detail: "Chọn tên một kỷ niệm trong album phía trên để đưa ảnh ra trước. Chạm vào ảnh để xem đầy đủ, hoặc mở những trang viết của chương này để đọc tiếp về gia đình.",
    words: "Gia đình · Ký ức · Lớn lên cùng nhau",
  },
  becoming: {
    title: "Lớn lên không phải lúc nào cũng nhìn thấy được.",
    body: "Bông hướng dương khép lại hành trình bằng một sự thay đổi chậm rãi. Tổn thương vẫn là một phần của câu chuyện, nhưng không cần là toàn bộ câu chuyện. Vẫn còn chỗ cho những điều đang lớn lên.",
    question: "Sau chương này là gì?",
    detail: "Những trang viết mới sẽ tiếp tục xuất hiện trong Góc đọc. Bạn có thể đọc theo từng chương, tìm một cảm giác quen thuộc hoặc trở lại với những điều mình từng bỏ ngỏ.",
    words: "Hồi phục · Đổi thay · Những trang tiếp theo",
  },
};

export function ChapterNotes({ topic }: { topic: Topic }) {
  const note = notes[topic];
  const number = topics.indexOf(topic) + 1;
  return <section id={`reading-${topic}`} className={`chapter-notes chapter-notes-${topic}`} aria-labelledby={`notes-${topic}`}>
    <Reveal className="chapter-note-heading">
      <p className="chapter-label">{topicNames[topic]} / Sau khung hình</p>
      <h2 id={`notes-${topic}`}>{note.title}</h2>
      <p className="chapter-keywords">{note.words}</p>
    </Reveal>
    <Reveal className="chapter-note-body">
      <p>{note.body}</p>
      <details><summary>{note.question}<span aria-hidden="true">＋</span></summary><p>{note.detail}</p></details>
      <Link className="chapter-read-link" href={`/stories?topic=${topic}`}>
        <span><small>Những trang viết phía sau</small>Đọc truyện chương {number}</span><span aria-hidden="true">↗</span>
      </Link>
      <Link className="chapter-library-link" href="/stories">Hoặc khám phá toàn bộ Góc đọc →</Link>
    </Reveal>
  </section>;
}
