import Link from "next/link";
import { topics, topicNames, type Topic } from "@/lib/types";
import { Reveal } from "./motion-system";

const notes: Record<Topic, { title: string; body: string; question: string; detail: string; words: string }> = {
  alone: {
    title: "Một mình, mà vẫn muốn có ai đó gần.",
    body: "Những bước chân đầu tiên là chuyện tôi đi một mình, và cái mong có người đi cùng. Hai thứ ấy ở chung trong tôi khá lâu rồi: quen đi một mình, nhưng vẫn để mắt tìm một bàn tay để tin.",
    question: "Phía sau những bước chân là gì?",
    detail: "Mấy trang viết của chương này nói về khoảng cách giữa việc ở một mình và cảm thấy một mình. Bạn có thể bắt đầu từ đây, hoặc chọn chương nào gần với bạn lúc này hơn.",
    words: "Một mình · Kết nối · Những khởi đầu",
  },
  trust: {
    title: "Đưa tay ra cũng là một kiểu can đảm.",
    body: "Mong được nắm lại là thứ khiến người ta bước về phía nhau. Khi niềm tin bị làm đau, chuyện không dừng ở khoảnh khắc đó. Còn những câu hỏi, những khoảng cách, và cách mình tập tin thêm một lần nữa.",
    question: "Còn lại gì sau một lần tin nhầm?",
    detail: "Đây là chỗ tôi viết về niềm tin và về giới hạn của mình. Không cần kể hết từng chi tiết mới được nói ra rằng một chuyện đã làm mình đau.",
    words: "Niềm tin · Khoảng cách · Giới hạn",
  },
  within: {
    title: "Có những cuộc nói chuyện chỉ xảy ra trong đầu.",
    body: "Một khoảnh khắc đã qua vẫn có thể tua lại trong đầu nhiều lần. Một câu nói, một điều chưa kịp đáp, một ngả rẽ khác. Tôi viết xuống để những suy nghĩ ấy có chỗ ở, ngoài im lặng.",
    question: "Những trang này viết cho điều gì?",
    detail: "Cho mấy câu hỏi chưa có lời đáp và những cảm giác khó gọi tên. Bạn không cần tìm ngay một kết luận. Đọc một đoạn thôi cũng được, rồi lúc khác quay lại.",
    words: "Nghĩ suy · Im lặng · Gọi tên cảm xúc",
  },
  love: {
    title: "Một đoạn đường chung, một tương lai dang dở.",
    body: "Có những điều tôi từng hình dung bằng chữ “chúng ta”. Khi một người không còn trong khung hình nữa, chỗ trống ấy giữ cả những gì đã có và những gì chưa kịp thành hình.",
    question: "Sao lại có một chương cho những điều dang dở?",
    detail: "Không phải chuyện nào cũng có một cái kết rõ ràng. Chương này cho những trang viết về sự gần gũi, về chia xa, và về những dự định chỉ từng có trong đầu.",
    words: "Gần gũi · Chia xa · Những điều chưa thành",
  },
  family: {
    title: "Nhìn lại những người ở quanh mình.",
    body: "Một tấm ảnh giữ được nhiều hơn mấy gương mặt. Trong cuốn album này là gia đình tôi, là những thế hệ và những ký ức đã góp vào việc tôi thành ra con người hôm nay. Mỗi tấm ảnh là một cánh cửa nhỏ mở vào chuyện phía sau.",
    question: "Bắt đầu từ một tấm ảnh thế nào?",
    detail: "Chọn tên một kỷ niệm trong album phía trên để đưa ảnh ra trước. Chạm vào ảnh để xem lớn, hoặc mở những trang viết của chương này để đọc tiếp về gia đình.",
    words: "Gia đình · Ký ức · Lớn lên cùng nhau",
  },
  becoming: {
    title: "Lớn lên không phải lúc nào cũng nhìn thấy được.",
    body: "Bông hướng dương khép lại câu chuyện bằng một thay đổi rất chậm. Tổn thương vẫn ở đó, là một phần của chuyện, nhưng không cần là toàn bộ. Vẫn còn chỗ cho những thứ đang lớn.",
    question: "Sau chương này là gì?",
    detail: "Những trang viết mới sẽ tiếp tục xuất hiện trong Góc đọc. Bạn có thể đọc theo chương, tìm một cảm giác quen quen, hoặc quay lại với điều mình từng bỏ ngỏ.",
    words: "Hồi phục · Đổi thay · Những trang tiếp theo",
  },
};

export function ChapterNotes({ topic }: { topic: Topic }) {
  const note = notes[topic];
  const number = topics.indexOf(topic) + 1;
  return <section id={`reading-${topic}`} className={`chapter-notes chapter-notes-${topic}`} aria-labelledby={`notes-${topic}`}>
    <Reveal className="chapter-note-heading">
      <p className="chapter-label">{topicNames[topic]} / Phía sau khung hình</p>
      <h2 id={`notes-${topic}`}>{note.title}</h2>
      <p className="chapter-keywords">{note.words}</p>
    </Reveal>
    <Reveal className="chapter-note-body">
      <p>{note.body}</p>
      <details><summary>{note.question}<span aria-hidden="true">＋</span></summary><p>{note.detail}</p></details>
      <Link className="chapter-read-link" href={`/stories?topic=${topic}`}>
        <span><small>Những trang viết phía sau</small>Đọc chuyện chương {number}</span><span aria-hidden="true">↗</span>
      </Link>
      <Link className="chapter-library-link" href="/stories">Hoặc ghé cả Góc đọc →</Link>
    </Reveal>
  </section>;
}
