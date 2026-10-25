# Tình yêu dang dở và Gia đình

Thứ tự: Những bước chân → Một bàn tay → Những nghĩ suy → **Chương 4: Tình yêu dang dở** → **Chương 5: Gia đình** → **Chương 6: Về phía ánh sáng**. Các phần sau hoa và backend được giữ lại. Câu kết dùng đúng “What comes next is unwritten.” theo brief mới.

Hai chương giữ nguyên các câu tiếng Anh được cung cấp. Điều khiển và alt text dùng tiếng Việt. Gia đình là sự hiện diện bền bỉ qua mọi giai đoạn; không có lời dẫn nói gia đình chỉ xuất hiện sau chia tay. Không thêm sợi chỉ vào hai chương.

## Tài nguyên

| Nội dung | File gốc trong public |
| --- | --- |
| Hai người ngồi trên mây, rồi chỉ còn người nam | gemini_generated_video_4d06bcf4.mp4 |
| Home: bố, mẹ, anh trai và tôi | d9371ef0-545a-4181-8207-bac1175a6b12.png |
| Mum’s side: bà, ba cậu, ba mợ và hình bóng ông | 3bab7d7f-e10a-4b9a-80b6-8e39e60b9f86.png |
| Growing up: năm anh em | 2ceea3e0-3e54-4bf9-9075-b64ff69ca8cc.png |
| Dad’s side: ông bà trước hiên | 1ed7e378-0f4d-47a3-890a-c504acf8b2d0.png |

Video gốc khoảng 10 giây, 1280×720, 24 fps, có audio. Bản web bỏ audio, H.264 CRF 18, faststart, keyframe mỗi 6 frame. Desktop giữ toàn bộ khung; mobile lấy vùng x=240..920 (680×720), chỉ bỏ nền trống hai bên, giữ cả hai nhân vật và chỗ ngồi trống xuyên suốt. SSIM desktop so với gốc: 0,996194. Xem artifacts/love-inspection.jpg.

Bốn PNG gốc 1448×1086 được giữ nguyên. Album dùng WebP 640/960px, giữ màu và đủ khung; chỉ lightbox tải PNG gốc. Hình bóng ông ngoại có sẵn không được sửa hoặc thêm hiệu ứng. Không tạo ảnh thay thế. Tái tạo derivatives bằng `python scripts/prepare-family-media.py` với Pillow và imageio-ffmpeg.

## File và mốc chỉnh

- `app/content.ts`: copy, nguồn video, nhãn chương. Clip bắt đầu nhạt khoảng 3,5–4s; chỗ ngồi trống khoảng 5–5,2s. Ba khoảng text theo tiến độ video: `[0,.29]`, `[.32,.49]`, `[.54,1]`.
- `motion.love.holdStart=.88`: video đến frame cuối ở 88% quãng cuộn. `fadeStart=.94`: tan vào nền trong 6% cuối, sau một nhịp giữ chỗ ngồi trống.
- `app/components/new-chapters.tsx`: hai chương và dòng dẫn sang hoa.
- `app/family-content.ts`: bốn nguồn ảnh, nhãn, caption và alt text.
- `app/components/family-album.tsx`: chồng ảnh; nhấc/rút 250ms, đổi z-index, trở về 320ms. Chọn liên tiếp giữ ý định cuối, không chạy chồng nhiều hoạt ảnh. Lightbox có vòng Tab, Escape, mũi tên, trước/sau, khóa cuộn và trả focus.
- `app/chapters.css`: bố cục fullscreen, chữ và album responsive.
- `app/use-story-motion.ts`: chung progress/seek hiện có; đồng bộ URL có hash sau enhancement/font và đổi nguồn video khi qua breakpoint mobile.

Reduced motion dùng poster cùng toàn bộ chữ và đổi lớp ảnh ngay. Không JavaScript vẫn có bốn ảnh, caption và link ảnh gốc. Motion dùng tiếp Animate UI/Motion: easing disclosure, tổng 570ms theo brief; không spring nảy hoặc 3D. Dialog chỉ fade ngắn; giảm chuyển động bỏ animation.

## Kiểm tra

`npm run test:family` dùng server localhost:3000; đổi TEST_URL nếu cần. Chrome Windows 390/768/1440px: scrub hai chiều, đứng yên/hold, reload, đổi breakpoint, ba mép ảnh phía sau bấm được, chọn liên tiếp, caption, lightbox, bàn phím, trả focus/cuộn, điều hướng, giảm chuyển động, JavaScript tắt và lỗi video. Kết quả và ảnh render ở artifacts/family-results.json, family-*.png và love-*.png. Đã chạy lại các bộ story/thread/journal, lint và production build.

Chưa kiểm chứng Safari/iPhone hoặc Android thật, hay hosting production. Không deploy/publish.
