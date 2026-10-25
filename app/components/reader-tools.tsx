"use client";
import { useEffect, useState } from "react";
import { InkButton } from "./motion-system";
export default function ReaderTools({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [saved, setSaved] = useState(false),
    [size, setSize] = useState(1),
    [status, setStatus] = useState(""),
    [resume, setResume] = useState<number | null>(null);
  useEffect(() => {
    // Browser-only preferences hydrate once after SSR, and on article change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResume(null);
    try {
      setSaved(
        JSON.parse(localStorage.getItem("jn-saved-pages") || "[]").includes(id),
      );
      const value = Number(localStorage.getItem("jn-reading-size") || 1);
      setSize(Math.min(1.3, Math.max(0.9, value)));
      const position = Number(localStorage.getItem(`jn-page-${id}`) || 0);
      if (position > 0.05 && position < 0.95) setResume(position);
    } catch {}
  }, [id]);
  useEffect(() => {
    document.documentElement.style.setProperty("--reader-scale", String(size));
    try {
      localStorage.setItem("jn-reading-size", String(size));
    } catch {}
    return () => {
      document.documentElement.style.removeProperty("--reader-scale");
    };
  }, [size]);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const article = document.getElementById("reading-text");
      if (!article) return;
      const progress = Math.min(
        1,
        Math.max(
          0,
          (innerHeight * 0.25 - article.getBoundingClientRect().top) /
            Math.max(1, article.offsetHeight - innerHeight * 0.5),
        ),
      );
      document.documentElement.style.setProperty(
        "--page-reading",
        `${progress * 100}%`,
      );
      try {
        localStorage.setItem(`jn-page-${id}`, String(progress));
      } catch {}
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--page-reading");
    };
  }, [id]);
  function bookmark() {
    try {
      const entries: string[] = JSON.parse(
        localStorage.getItem("jn-saved-pages") || "[]",
      );
      const next = saved ? entries.filter((v) => v !== id) : [...entries, id];
      localStorage.setItem("jn-saved-pages", JSON.stringify(next));
      setSaved(!saved);
      setStatus(saved ? "Đã bỏ dấu trang." : "Đã lưu dấu trang trên thiết bị này.");
    } catch {
      setStatus("Trình duyệt này không lưu được dấu trang.");
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setStatus("Đã sao chép đường dẫn.");
    } catch {
      setStatus("Bạn có thể sao chép địa chỉ trên trình duyệt để chia sẻ trang này.");
    }
  }
  return (
    <>
      <div className="reader-progress" aria-hidden="true" />
      <div className="reader-tools" aria-label="Tùy chọn đọc">
        <div>
          <InkButton
            className="reader-tool"
            aria-label="Giảm cỡ chữ"
            disabled={size <= 0.9}
            onClick={() => setSize((v) => Math.max(0.9, +(v - 0.1).toFixed(1)))}
          >
            A−
          </InkButton>
          <InkButton
            className="reader-tool"
            aria-label="Tăng cỡ chữ"
            disabled={size >= 1.3}
            onClick={() => setSize((v) => Math.min(1.3, +(v + 0.1).toFixed(1)))}
          >
            A+
          </InkButton>
        </div>
        <div>
          <InkButton
            className="reader-tool"
            aria-pressed={saved}
            onClick={bookmark}
          >
            {saved ? "Đã đánh dấu ✓" : "Đánh dấu"}
          </InkButton>
          <InkButton className="reader-tool" onClick={copy}>
            Chia sẻ ↗
          </InkButton>
        </div>
      </div>
      <p className="reader-feedback" role="status">
        {status}
      </p>
      {resume !== null && (
        <div className="resume-reading">
          <span>Bạn đã trở lại với “{title}”.</span>
          <InkButton
            className="text-button"
            onClick={() => {
              const article = document.getElementById("reading-text")!;
              window.scrollTo({
                top:
                  article.getBoundingClientRect().top + scrollY +
                  resume *
                    Math.max(1, article.offsetHeight - innerHeight * 0.5) -
                  innerHeight * 0.25,
                behavior: "auto",
              });
              setResume(null);
            }}
          >
            Đọc tiếp từ chỗ đã dừng →
          </InkButton>
          <button
            aria-label="Đóng nhắc đọc tiếp"
            onClick={() => setResume(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
