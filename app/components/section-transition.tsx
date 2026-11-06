"use client";
/*
 * Scroll-driven section transitions for the home story.
 * Every element here is decorative (aria-hidden, pointer-events: none) and sits
 * BETWEEN sections, never inside a sticky scene. Motion values only drive
 * opacity, transform and SVG pathLength; nothing changes layout per frame.
 * Server output and no-JavaScript readers get the fully drawn static version:
 * motion values are attached only after hydration and never under reduced motion.
 */
import {
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

export type InkVariant = "wave" | "underline" | "stitch" | "loop";
export type InkTone = "graphite" | "blue" | "sunflower";

/* Slightly wobbly, hand-drawn strokes. Each variant has a main stroke followed
 * by a lighter "second pass", like a pencil retracing a line. */
const strokes: Record<InkVariant, { box: string; main: string; echo?: string }> = {
  wave: {
    box: "0 0 600 40",
    main: "M4 23 C 70 10, 130 33, 205 21 S 330 7, 410 22 S 540 34, 596 17",
    echo: "M28 29 C 110 18, 180 36, 262 26 S 390 14, 470 27 S 548 36, 578 26",
  },
  underline: {
    box: "0 0 600 40",
    main: "M6 24 Q 160 12 312 21 T 592 17",
    echo: "M548 29 q 18 -7 36 -4 q -10 4 -16 8",
  },
  stitch: {
    box: "0 0 240 24",
    main:
      "M4 13 l 24 -3 M40 11 l 22 3 M74 15 l 24 -4 M110 10 l 22 4 M144 15 l 24 -3 M180 11 l 22 3 M214 14 l 22 -3",
  },
  loop: {
    box: "0 0 320 44",
    main:
      "M4 30 C 50 18, 100 36, 150 24 c 18 -5 30 -20 16 -24 c -14 -3 -24 18 -6 25 c 36 14 100 -12 152 -4",
    echo: "M190 36 c 30 -8 60 -10 118 -4",
  },
};

const noop = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** True after hydration, false on the server and during hydration. */
function useHydrated() {
  return useSyncExternalStore(noop, clientSnapshot, serverSnapshot);
}

/** Scroll-linked motion is used only after hydration and when motion is allowed. */
function useScrollMotion() {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && reduced !== true;
}

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

function useEntry(ref: RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return scrollYProgress;
}

function InkStroke({
  variant,
  progress,
  live,
}: {
  variant: InkVariant;
  progress: MotionValue<number>;
  live: boolean;
}) {
  const s = strokes[variant];
  const echo = useTransform(progress, [0.35, 1], [0, 1]);
  return (
    <svg
      className={`ink-stroke ink-stroke-${variant}`}
      viewBox={s.box}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
    >
      <motion.path d={s.main} style={live ? { pathLength: progress } : undefined} />
      {s.echo ? (
        <motion.path
          className="ink-echo"
          d={s.echo}
          style={live ? { pathLength: echo } : undefined}
        />
      ) : null}
    </svg>
  );
}

/** Rotated handwritten page marker, e.g. "— trang 02 —". */
function PageMarker({
  page,
  progress,
  live,
}: {
  page: string;
  progress: MotionValue<number>;
  live: boolean;
}) {
  const opacity = useTransform(progress, [0.3, 0.9], [0, 1]);
  const y = useTransform(progress, [0.3, 0.9], [10, 0]);
  return (
    <motion.span
      className="page-marker"
      style={live ? { opacity, y, rotate: -2 } : undefined}
    >
      — trang {page} —
    </motion.span>
  );
}

/**
 * Hand-drawn pencil divider that draws itself as it scrolls into view.
 * Sits between two sections; optional page marker fades in beside it.
 */
export function InkDivider({
  variant = "wave",
  tone = "graphite",
  marker,
}: {
  variant?: InkVariant;
  tone?: InkTone;
  marker?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useScrollMotion();
  const progress = useEntry(ref, ["start 94%", "end 58%"]);
  return (
    <div
      ref={ref}
      className={`ink-divider ink-divider-${variant} ink-tone-${tone}`}
      aria-hidden="true"
    >
      <InkStroke variant={variant} progress={progress} live={live} />
      {marker ? <PageMarker page={marker} progress={progress} live={live} /> : null}
    </div>
  );
}

/**
 * Gentle parallax for decorative elements only (never reading text).
 * Drifts from +range to -range px over its own trip through the viewport.
 */
export function Drift({
  children,
  range = 36,
  className = "",
}: {
  children: ReactNode;
  range?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const live = useScrollMotion();
  const progress = useEntry(ref, ["start end", "end start"]);
  const y = useTransform(progress, [0, 1], [range, -range]);
  return (
    <motion.span
      ref={ref}
      className={`drift ${className}`.trim()}
      style={live ? { y } : undefined}
    >
      {children}
    </motion.span>
  );
}

/**
 * The "page turn" between a chapter scene and its afterword notes:
 * a soft landing gradient (so sticky video scenes do not end on a hard edge),
 * a faint graphite smudge, a small pencil doodle that sweeps in and drifts,
 * a divider that draws itself and a page marker carrying the chapter number.
 * (The afterword sections draw their own large numeral watermark.)
 */
export function ChapterTurn({
  number,
  variant = "wave",
  tone = "graphite",
  from,
  smudge = false,
}: {
  /** Two-digit chapter number for the page marker. */
  number: string;
  variant?: InkVariant;
  tone?: InkTone;
  /** Colour the previous section ends with; fades into paper. Shown only when the cloud overlap hides the scene's own fade. */
  from?: string;
  /** Adds a faint graphite smudge at the top of the turn. */
  smudge?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useScrollMotion();
  const progress = useEntry(ref, ["start 100%", "end 62%"]);
  const draw = useTransform(progress, [0.25, 1], [0, 1]);
  const markOpacity = useTransform(progress, [0, 0.55], [0, 1]);
  const markX = useTransform(progress, [0, 0.7], [-24, 0]);
  const smudgeOpacity = useTransform(progress, [0, 0.6], [0, 1]);
  return (
    <div
      ref={ref}
      className={`chapter-turn chapter-turn-${variant} ink-tone-${tone}`}
      aria-hidden="true"
      style={from ? ({ "--turn-from": from } as CSSProperties) : undefined}
    >
      {from ? <span className="turn-vignette" /> : null}
      {smudge ? (
        <motion.span
          className="turn-smudge"
          style={live ? { opacity: smudgeOpacity } : undefined}
        />
      ) : null}
      <div className="turn-row">
        <Drift range={18} className="turn-mark-drift">
          <motion.svg
            className="turn-mark"
            viewBox="0 0 40 40"
            focusable="false"
            style={live ? { opacity: markOpacity, x: markX } : undefined}
          >
            <path d="M20 19 c 3 -5 11 -3 10 3 c -1 7 -12 9 -16 3 c -4 -7 4 -15 12 -12 c 8 3 9 14 2 19 c -5 3 -12 1 -14 -4" />
          </motion.svg>
        </Drift>
        <div className="turn-line">
          <InkStroke variant={variant} progress={draw} live={live} />
        </div>
        <PageMarker page={number} progress={progress} live={live} />
      </div>
    </div>
  );
}

/**
 * A paper-fold crease: a thin horizontal band with a soft graphite shadow
 * above and a light edge below, fading in as it enters the viewport.
 */
export function PaperFold({ marker }: { marker?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const live = useScrollMotion();
  const progress = useEntry(ref, ["start 96%", "end 64%"]);
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const scaleX = useTransform(progress, [0, 1], [0.82, 1]);
  return (
    <div ref={ref} className="paper-fold" aria-hidden="true">
      <motion.span
        className="fold-crease"
        style={live ? { opacity, scaleX } : undefined}
      />
      {marker ? <PageMarker page={marker} progress={progress} live={live} /> : null}
    </div>
  );
}
