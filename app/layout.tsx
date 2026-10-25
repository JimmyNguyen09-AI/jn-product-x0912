import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import "./journey.css";
import "./reading.css";
import "./thread.css";
import "./chapters.css";
import { MotionSystem } from "./components/motion-system";
export const metadata: Metadata = {
  ...(process.env.SITE_URL
    ? { metadataBase: new URL(process.env.SITE_URL) }
    : {}),
  title: "JN — Một câu chuyện, vẫn đang viết.",
  description:
    "Một cuốn sổ riêng về niềm tin, những nghĩ suy và quá trình lớn lên. Đọc những câu chuyện phía sau hình ảnh.",
  openGraph: {
    title: "JN — Một câu chuyện, vẫn đang viết.",
    description: "Một cuốn sổ riêng. Những trang viết yên tĩnh, vẫn đang mở ra.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JN — Một câu chuyện, vẫn đang viết.",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <noscript>
          <style>{`.menu-toggle,.motion-toggle{display:none!important}.chapter-links{opacity:1!important;transform:none!important;display:flex!important;position:static!important;border:0!important;padding:0!important;flex-direction:row!important;flex-wrap:wrap;background:none!important;justify-content:center}.island{gap:3px!important;max-width:96%;width:max-content}.chapter-links a{padding:8px 5px!important;font-size:15px!important}`}</style>
        </noscript>
        <MotionSystem>{children}</MotionSystem>
      </body>
    </html>
  );
}
