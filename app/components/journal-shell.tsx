/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
import Link from "next/link";
export function JournalHeader({ admin = false }: { admin?: boolean }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng, đến nội dung
      </a>
      <header className="journal-header">
        <Link href="/" className="journal-brand" aria-label="JN — về đầu trang">
          <img src="/jn-sketch.svg" alt="" width="38" height="34" />
          <span>Một câu chuyện, vẫn đang viết.</span>
        </Link>
        <nav
          aria-label={
            admin ? "Điều hướng trang viết" : "Điều hướng góc đọc"
          }
        >
          <Link href="/">Trang đầu</Link>
          <Link href="/stories">Góc đọc chuyện</Link>
          {admin && <Link href="/admin">Bàn viết</Link>}
        </nav>
      </header>
    </>
  );
}
export function JournalFooter() {
  return (
    <footer className="journal-footer">
      <Link href="/" className="footer-signature">
        JN.
      </Link>
      <span>Vài trang viết. Một kết thúc còn mở.</span>
      <Link href="/admin">Bàn viết ↗</Link>
    </footer>
  );
}
