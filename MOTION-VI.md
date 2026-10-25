# Chương, sương và sợi chỉ

**Cập nhật:** website hiện có sáu chương; tình yêu và gia đình được thêm trước hoa, không có sợi chỉ trong hai chương này. Câu kết trở lại “What comes next is unwritten.” theo brief mới. Xem [CHAPTERS.md](CHAPTERS.md); mô tả bốn chương và câu kết Việt hóa bên dưới ghi lại phiên bản trước.

Giao diện công khai, góc đọc và bàn viết đều dùng tiếng Việt. Bốn nhãn điều hướng là **Chương 1–4**; các chủ đề và thứ tự video được giữ nguyên. Hai phần bổ sung là khoảng nghỉ sau chương 3 và lời dẫn vào các trang viết sau chương 4. Câu kết được Việt hóa thành “Những điều phía trước vẫn còn để ngỏ.” theo yêu cầu ngôn ngữ mới nhất.

## Các file chính

- `app/thread-config.ts`: hình dạng và mốc thời gian của chỉ, công thức sương.
- `app/components/story-thread.tsx`: SVG riêng cho từng video; path desktop/mobile riêng cho các đoạn đi bộ, suy tư và hoa. Đoạn giữa hai bàn tay giữ cùng tọa độ tương đối với khung video để không gắn trượt vào ngón tay.
- `app/use-story-motion.ts`: dùng chung bộ điều khiển cuộn hiện có; sự kiện đứt và chuyển vàng đọc `currentTime` khi video đã hoàn thành seek, không đọc thời điểm đích chưa giải mã.
- `app/thread.css`: lớp SVG, sương, bố cục hai phần mới và giảm chuyển động.
- `app/components/quiet-sections.tsx`: hai phần mới.
- `app/content.ts`: lời kể và nhãn chương.
- `lib/opening-notes.ts`: bốn trang mở đầu tiếng Việt. Migration chỉ cập nhật bản mẫu chưa từng chỉnh sửa; bài người dùng đã sửa được giữ lại.

## Mốc có thể chỉnh

Tất cả tính bằng **giây trên video web đang dùng**, không phải thời gian sau khi vào viewport.

| Mốc | Giá trị | Vai trò |
| --- | --- | --- |
| tensionStart / tensionEnd | 1,8 / 3,8 | Đường chỉ dần bớt chùng |
| breakPoint | 4,45 | Tách hai đầu ở cử chỉ phản bội |
| breakSettle | 0,45 | Khoảng timeline để hai đầu lùi và chùng xuống |
| untangleStart / untangleEnd | 2,7 / 6,4 | Chuyển từ vòng thắt sang đường thoáng |
| goldStart / goldEnd | 3,25 / 6,7 | Nối sắc vàng sau khi màu bắt đầu xuất hiện trên hoa |
| fogLead | 0,85 | Sương tiến vào trước cuối vòng lặp đi bộ |
| fogHold / fogClear | 0,12 / 0,7 | Giữ sương qua frame đầu rồi làm tan |

Mốc được kiểm tra lại bằng các frame trong `artifacts/thread-timing.jpg`. Thời lượng clip đọc từ metadata; bộ kiểm tra không giả định mọi video đều dài 10 giây. Nếu thay video, cần kiểm tra lại các mốc trên.

Sương chạy theo frame video đi bộ bằng `requestVideoFrameCallback` (dự phòng `timeupdate`), chỉ hoạt động khi video phát. Không có bộ hẹn giờ tự chạy. Video bàn tay và hoa vẫn luôn paused. Chỉ nằm trên video nhưng dưới chữ và lớp mây chuyển cảnh. Đường chỉ tránh cơ thể, vùng hành động và tâm hoa; không giả lập luồn sau chủ thể. Đoạn cuối tan trước câu kết để giữ khoảng trắng.

Reduced motion ẩn cả sương và chỉ, bỏ pin/scrub và hiển thị đầy đủ nội dung. SVG không nhận sự kiện chuột và không nằm trong cây accessibility. Không cài thêm thư viện animation; Animate UI vẫn đảm nhiệm reveal và phản hồi nút.

## Kiểm tra

Chạy server trước; `TEST_URL` có thể trỏ vào server đang mở.

```powershell
$env:TEST_URL='http://localhost:3000'
npm run test:thread
npm run test:story
npm run test:journal
npm run lint
npm run build
```

Đã kiểm tra Chrome trên Windows ở 390/768/1440px, đảo chiều, đứng yên, cuộn nhanh, nhảy chương, reload, tiếng Việt, giảm chuyển động, JavaScript tắt, lỗi video và luồng quản trị. Ảnh chụp cùng kết quả nằm trong `artifacts/`. Chưa kiểm chứng Safari/iPhone thật hoặc hạ tầng production. Docker có CLI nhưng daemon Linux chưa chạy. Không deploy hay publish website.

Font Patrick Hand và Pangolin được lưu local, có đủ ký tự tiếng Việt và kèm giấy phép OFL. Nguồn: [Google Fonts / Patrick Hand](https://github.com/google/fonts/tree/main/ofl/patrickhand), [Google Fonts / Pangolin](https://github.com/google/fonts/tree/main/ofl/pangolin). Các font cũ vẫn được giữ trong asset gốc nhưng không dùng để ghép dấu tiếng Việt.
