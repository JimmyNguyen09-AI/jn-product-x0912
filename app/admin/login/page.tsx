import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { configured, sessionAdmin } from "@/lib/auth";
import { JournalHeader } from "../../components/journal-shell";
import LoginForm from "./login-form";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Đăng nhập — Bàn viết JN",
  robots: { index: false, follow: false },
};
export default async function LoginPage() {
  if (await sessionAdmin()) redirect("/admin");
  return (
    <>
      <JournalHeader />
      <main id="main" className="login-page">
        <div className="login-note">
          <p className="chapter-label">Dành cho người viết</p>
          <h1>
            Trang viết tiếp theo
            <br />
            bắt đầu ở đây.
          </h1>
          <p>
            Một nơi yên tĩnh để giữ một ý nghĩ,
            <br />
            viết thành lời, rồi chia sẻ khi sẵn sàng.
          </p>
        </div>
        {await configured() ? (
          <LoginForm />
        ) : (
          <section className="setup-notice">
            <h2>Thiết lập bàn viết</h2>
            <p>Tài khoản quản trị chưa được tạo.</p>
            <p>
              Trên máy chủ, chạy <code>npm run admin:setup</code> để tạo tài khoản riêng. Sau đó trở lại đây để đăng nhập.
            </p>
            <Link href="/stories">Về góc đọc chuyện ↗</Link>
          </section>
        )}
      </main>
    </>
  );
}
