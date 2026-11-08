"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InkButton } from "./motion-system";
import type { StorySummary } from "@/lib/types";

type PaperTone = "paper" | "sepia" | "night";
const paperLabels: Record<PaperTone, string> = {
  paper: "Giấy sáng",
  sepia: "Giấy ấm",
  night: "Đêm dịu",
};
const paperOrder: PaperTone[] = ["paper", "sepia", "night"];

export function LibraryCompanion({ stories }: { stories: StorySummary[] }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [randomSlug, setRandomSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("jn-saved-pages") || "[]");
      if (Array.isArray(raw)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedIds(raw.filter((x): x is string => typeof x === "string"));
      }
    } catch {}
    if (stories.length > 0) {
      setRandomSlug(stories[Math.floor(Math.random() * stories.length)].slug);
    }
  }, [stories]);

  const savedStories = stories.filter((s) => savedIds.includes(s.id));

  return (
    <div className="library-companion">
      {randomSlug && (
        <Link className="serendipity-pill" href={`/stories/${randomSlug}`}>
          <span aria-hidden="true">✦</span> Mở ngẫu nhiên một trang viết ↗
        </Link>
      )}
      {savedStories.length > 0 && (
        <div className="saved-shelf" aria-label="Trang viết đã đánh dấu trên máy này">
          <span className="saved-shelf-label">
            <span aria-hidden="true">🔖</span> Đã kẹp dấu trang ({savedStories.length}):
          </span>
          <div className="saved-shelf-links">
            {savedStories.map((s) => (
              <Link key={s.id} href={`/stories/${s.slug}`} className="saved-story-chip">
                {s.title} ↗
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReaderTools({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [saved, setSaved] = useState(false),
    [size, setSize] = useState(1),
    [tone, setTone] = useState<PaperTone>("paper"),
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
      const storedTone = localStorage.getItem("jn-reading-paper") as PaperTone | null;
      if (storedTone && paperOrder.includes(storedTone)) setTone(storedTone);
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
    if (tone === "paper") {
      document.documentElement.removeAttribute("data-reader-paper");
    } else {
      document.documentElement.setAttribute("data-reader-paper", tone);
    }
    try {
      localStorage.setItem("jn-reading-paper", tone);
    } catch {}
    return () => {
      document.documentElement.removeAttribute("data-reader-paper");
    };
  }, [tone]);
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
      const headings = Array.from(article.querySelectorAll<HTMLElement>("h2[id], h3[id]"));
      if (headings.length > 0) {
        const current =
          headings.filter((h) => h.getBoundingClientRect().top <= innerHeight * 0.32).at(-1) ||
          headings[0];
        document.querySelectorAll<HTMLAnchorElement>(".reader-contents a").forEach((link) => {
          if (link.getAttribute("href") === `#${current.id}`) {
            link.setAttribute("data-active", "true");
          } else {
            link.removeAttribute("data-active");
          }
        });
      }
      try {
        localStorage.setItem(`jn-page-${id}`, String(progress));
      } catch {}
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--page-reading");
    };
  }, [id]);
  function cycleTone() {
    const next = paperOrder[(paperOrder.indexOf(tone) + 1) % paperOrder.length];
    setTone(next);
    setStatus(`Đang dùng nền ${paperLabels[next].toLowerCase()}.`);
  }
  function bookmark() {
    try {
      const entries: string[] = JSON.parse(
        localStorage.getItem("jn-saved-pages") || "[]",
      );
      const next = saved ? entries.filter((v) => v !== id) : [...entries, id];
      localStorage.setItem("jn-saved-pages", JSON.stringify(next));
      setSaved(!saved);
      setStatus(saved ? "Đã bỏ dấu trang rồi." : "Đã kẹp dấu trang, lưu trên máy này.");
    } catch {
      setStatus("Trình duyệt này không cho lưu dấu trang.");
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setStatus("Đã chép đường dẫn rồi.");
    } catch {
      setStatus("Bạn chép địa chỉ trên thanh trình duyệt để gửi trang này nhé.");
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
          <InkButton
            className="reader-tool reader-tone-btn"
            aria-label={`Đổi màu giấy đọc, hiện tại: ${paperLabels[tone]}`}
            onClick={cycleTone}
          >
            <span className={`tone-dot tone-dot-${tone}`} aria-hidden="true" />
            {paperLabels[tone]}
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
          <span>Bạn quay lại với “{title}” rồi.</span>
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
            Đọc tiếp từ chỗ hôm trước →
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
