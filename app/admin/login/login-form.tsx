"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InkButton } from "../../components/motion-system";
export default function LoginForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="login-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        const fields = new FormData(e.currentTarget);
        try {
          const result = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: fields.get("username"),
              password: fields.get("password"),
            }),
          });
          const data = await result.json();
          if (!result.ok) throw new Error(data.error);
          router.replace("/admin");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Không đăng nhập được. Vui lòng thử lại.");
          setBusy(false);
        }
      }}
    >
      <p className="eyebrow">Lối vào riêng</p>
      <h2>Chào bạn trở lại.</h2>
      <label htmlFor="username">Tên đăng nhập</label>
      <input
        type="text"
        id="username"
        name="username"
        required
        autoComplete="username"
        maxLength={64}
        autoCapitalize="none"
        spellCheck={false}
      />
      <label htmlFor="password">Mật khẩu</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        autoComplete="current-password"
        maxLength={256}
      />
      <p role="alert" className="form-error">
        {error}
      </p>
      <InkButton type="submit" className="ink-button" disabled={busy}>
        {busy ? "Đang đăng nhập…" : "Mở bàn viết ↗"}
      </InkButton>
      <p className="form-hint">
        Đây là không gian của người viết. Bạn không cần tài khoản để đọc chuyện.
      </p>
    </form>
  );
}
