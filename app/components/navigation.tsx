/* eslint-disable @next/next/no-img-element -- Local SVG/WebP assets are already optimized; protected uploads must retain direct origin authentication and revocation. */
"use client";
import { useEffect, useRef, useState } from "react";
import { chapters, motion } from "../content";
import { InkButton } from "./motion-system";
export default function Navigation({
  paused,
  onPause,
}: {
  paused: boolean;
  onPause: () => void;
}) {
  const [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
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
      className="island"
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
        onClick={() => setOpen(!open)}
      >
        Các chương <span aria-hidden="true">{open ? "−" : "+"}</span>
      </InkButton>
      <div id="chapter-links" className={`chapter-links ${open ? "open" : ""}`}>
        {chapters.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
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
      <InkButton
        className="motion-toggle"
        aria-label={paused ? "Phát video nền" : "Tạm dừng video nền"}
        aria-pressed={paused}
        onClick={onPause}
      >
        <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
      </InkButton>
      <span className="reading-line" aria-hidden="true" />
    </nav>
  );
}
