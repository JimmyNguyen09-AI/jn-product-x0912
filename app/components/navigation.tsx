/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { chapters, motion } from "../content";
import { InkButton } from "./motion-system";

const chapterSubtitles: Record<string, string> = {
  beginning: "Những bước chân",
  trust: "Một bàn tay",
  noise: "Những nghĩ suy",
  "almost-us": "Tình yêu dang dở",
  family: "Gia đình",
  becoming: "Về phía ánh sáng",
  stories: "Những trang viết",
};

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    // The island lifts off the paper once the reader has started scrolling.
    let raf = 0;
    const measure = () => {
      raf = 0;
      setScrolled(scrollY > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    const dismiss = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return (
    <nav
      ref={nav}
      className={`island${scrolled ? " scrolled" : ""}`}
      aria-label="Các chương"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          document.getElementById("menu-toggle")?.focus();
        }
      }}
    >
      <a
        href="#beginning"
        className="brand"
        aria-label="JN — về đầu trang"
        onClick={() => setOpen(false)}
      >
        <img src="/jn-sketch.svg" alt="" width="36" height="32" />
      </a>
      <InkButton
        id="menu-toggle"
        className="menu-toggle"
        aria-controls="chapter-links"
        aria-expanded={open}
        onClick={() => flushSync(() => setOpen((v) => !v))}
      >
        Các chương <span aria-hidden="true">{open ? "−" : "+"}</span>
      </InkButton>
      <div id="chapter-links" className={`chapter-links ${open ? "open" : ""}`}>
        {chapters.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            data-subtitle={chapterSubtitles[id]}
            onClick={(e) => {
              setOpen(false);
              const target = document.getElementById(id)!;
              if (
                id === "trust" &&
                document.querySelector(".clouds-enabled") &&
                !e.metaKey &&
                !e.ctrlKey &&
                !e.shiftKey &&
                !e.altKey
              ) {
                e.preventDefault();
                history.pushState(null, "", "#trust");
                scrollTo(
                  0,
                  target.offsetTop +
                    (target.offsetHeight -
                      target.querySelector<HTMLElement>(".scene-inner")!
                        .offsetHeight) *
                      motion.cloud.trustEnd,
                );
                target.focus({ preventScroll: true });
              }
            }}
          >
            {label}
          </a>
        ))}
      </div>
      <span className="reading-line" aria-hidden="true" />
    </nav>
  );
}
