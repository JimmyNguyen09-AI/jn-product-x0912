"use client";
import Link from "next/link";
import { useRef } from "react";
import { storyCopy } from "./content";
import { useStoryMotion } from "./use-story-motion";
import Navigation from "./components/navigation";
import CloudTransition from "./components/cloud-transition";
import { Media, Beats } from "./components/scene-media";
import ReadingRoom from "./components/reading-room";
import {
  SceneReadingLink,
} from "./components/margin-notes";
import { ChapterNotes } from "./components/chapter-notes";
import { Reveal } from "./components/motion-system";
import type { StorySummary } from "@/lib/types";
import ClosingStatement from "./components/closing-statement";
import { NewPages } from "./components/quiet-sections";
import { AlmostUs, FamilyChapter } from "./components/new-chapters";
import {
  ChapterTurn,
  InkDivider,
  PaperFold,
} from "./components/section-transition";
import "./transitions.css";
export default function Story({
  stories,
  total,
  year,
}: {
  stories: StorySummary[];
  total: number;
  year: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  useStoryMotion(root);
  return (
    <div ref={root} className="sketchbook">
      <a className="skip-link" href="#story">
        Bỏ qua điều hướng, đến câu chuyện
      </a>
      <Navigation />
      <CloudTransition />
      <main id="story" tabIndex={-1}>
        <section
          id="beginning"
          className="scene hero"
          data-scene="walk"
          aria-labelledby="story-title"
        >
          <div className="scene-inner">
            <h1 id="story-title" className="annotation hero-note">
              {storyCopy.annotation}
            </h1>
            <Media name="walk" />
            <SceneReadingLink topic="alone" />
            <p className="sr-only">
              {storyCopy.pairs.map((p) => p.join(" ")).join(" ")}
            </p>
            <div className="hero-beats" aria-hidden="true">
              {storyCopy.pairs.map(([left, right], i) => (
                <div className="beat hero-pair" data-beat={i} key={left}>
                  <p>{left}</p>
                  <p>{right}</p>
                </div>
              ))}
            </div>
            <div className="scene-bottom">
              <span className="chapter-label">Chương 1 / Những bước chân</span>
              <span className="scroll-cue">
                Đi tiếp một chút <span aria-hidden="true">↓</span>
              </span>
              <span className="page-number" aria-hidden="true">
                01 — 06
              </span>
            </div>
          </div>
        </section>
        <section
          tabIndex={-1}
          id="trust"
          className="scene trust"
          data-scene="trust"
          aria-labelledby="trust-heading"
        >
          <div className="scene-inner">
            <h2 className="chapter-label scene-title" id="trust-heading">
              Chương 2 / Một bàn tay
            </h2>
            <Beats lines={storyCopy.trust} />
            <Media name="trust" />
            <SceneReadingLink topic="trust" />
          </div>
        </section>
        <ChapterTurn number="01" variant="wave" from="#f4f1e7" />
        <ChapterNotes topic="alone" />
        <InkDivider variant="stitch" marker="02" />
        <ChapterNotes topic="trust" />
        <InkDivider variant="loop" tone="blue" marker="03" />
        <section id="noise" className="noise" aria-labelledby="noise-heading">
          <div className="noise-art">
            <span className="chapter-label">Chương 3 / Những nghĩ suy</span>
            <Media name="noise" />
          </div>
          <Reveal className="noise-copy">
            <p className="annotation">Yên lặng không hẳn là bình yên.</p>
            <h2 id="noise-heading" className="preserve-lines">
              {storyCopy.noise.heading}
            </h2>
            <p className="narrative preserve-lines">{storyCopy.noise.body}</p>
            <Link className="noise-reading-link" href="/stories?topic=within">
              Một trang cho những nghĩ suy chưa chịu đi ↗
            </Link>
            <svg
              className="pencil-line"
              viewBox="0 0 170 12"
              aria-hidden="true"
            >
              <path d="M2 6Q70 1 166 5M18 9Q90 5 153 8" />
            </svg>
          </Reveal>
        </section>
        <ChapterTurn number="03" variant="underline" />
        <ChapterNotes topic="within" />
        <PaperFold marker="04" />
        <AlmostUs />
        <ChapterTurn number="04" variant="loop" smudge />
        <ChapterNotes topic="love" />
        <InkDivider variant="underline" marker="05" />
        <FamilyChapter />
        <ChapterTurn number="05" variant="stitch" />
        <ChapterNotes topic="family" />
        <PaperFold marker="06" />
        <section
          id="becoming"
          className="scene becoming"
          data-scene="bloom"
          aria-labelledby="becoming-heading"
        >
          <div className="scene-inner">
            <h2 className="chapter-label scene-title" id="becoming-heading">
              Chương 6 / Về phía ánh sáng
            </h2>
            <Media name="bloom" />
            <SceneReadingLink topic="becoming" />
            <Beats lines={storyCopy.bloom} />
            <span className="growth-mark" aria-hidden="true">
              về phía ánh sáng ↗
            </span>
          </div>
        </section>
        <ChapterTurn number="06" variant="wave" tone="sunflower" smudge />
        <ChapterNotes topic="becoming" />
        <NewPages />
        <PaperFold />
        <ReadingRoom stories={stories} total={total} />
        <InkDivider variant="wave" tone="blue" />
        <ClosingStatement />
      </main>
      <footer>
        <a
          href="#beginning"
          className="footer-signature"
          aria-label="JN — về đầu trang"
        >
          JN.
        </a>
        <span>© {year}</span>
        <Link href="/admin">Đăng nhập · Bàn viết ↗</Link>
        <a href="#beginning">
          Về lại trang đầu <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
