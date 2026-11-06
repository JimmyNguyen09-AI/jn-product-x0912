"use client";
import {
  Fragment,
  useEffect,
  useMemo,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { AnimateUIProvider } from "@animate-ui/react/provider";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import { MotionConfig, motion, type Variants } from "motion/react";
import { useMotionTokens } from "@animate-ui/react/utils/motion";
export function MotionSystem({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    return () => document.documentElement.classList.remove("motion-ready");
  }, []);
  return (
    <AnimateUIProvider reducedMotion="user">
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AnimateUIProvider>
  );
}
const IN_VIEW_MARGIN = "0px 0px -40px 0px";
/* Pencil-sketch reveal: a short lift with an optional blur-up. Transforms and
 * filters are left in their resting state once visible, so nothing inside the
 * reveal is permanently inside a transformed box. */
export type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay in milliseconds before the reveal starts. */
  delay?: number;
  /** Lift distance in pixels; 0 keeps the original flat fade. */
  y?: number;
  /** Start from a 6px blur that clears as the block arrives. */
  blur?: boolean;
  /** Stagger direct children (seconds between each). Children are wrapped in
   * `.reveal-item` blocks, so only use it on block content. */
  stagger?: number;
  /** Render as another element (default `div`). */
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
};
function revealVariants(y: number, blur: boolean): Variants {
  return {
    hidden: {
      opacity: 0,
      y,
      ...(blur ? { filter: "blur(6px)" } : {}),
    },
    visible: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : {}),
    },
  };
}
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  blur = false,
  stagger,
  as: Tag,
  style,
  id,
}: RevealProps) {
  const { transition } = useMotionTokens();
  const base = useMemo(
    () => ({ ...transition.reveal, duration: 0.55 }),
    [transition.reveal],
  );
  const variants = useMemo<Variants>(
    () =>
      stagger
        ? {
            hidden: {},
            visible: {
              transition: {
                staggerChildren: stagger,
                delayChildren: delay / 1000,
              },
            },
          }
        : revealVariants(y, blur),
    [y, blur, stagger, delay],
  );
  const itemVariants = useMemo<Variants>(
    () => ({
      hidden: revealVariants(y, blur).hidden,
      visible: { ...revealVariants(y, blur).visible, transition: base },
    }),
    [y, blur, base],
  );
  const content = stagger
    ? Array.isArray(children)
      ? children.map((child, i) => (
          <motion.div className="reveal-item" variants={itemVariants} key={i}>
            {child}
          </motion.div>
        ))
      : (
          <motion.div className="reveal-item" variants={itemVariants}>
            {children}
          </motion.div>
        )
    : children;
  const shared = {
    inView: true,
    inViewOnce: true,
    inViewMargin: IN_VIEW_MARGIN,
    variants,
    transition: base,
    delay,
  } as const;
  if (Tag) {
    return (
      <Fade asChild data-fade {...shared}>
        <Tag className={className} style={style} id={id}>
          {content}
        </Tag>
      </Fade>
    );
  }
  return (
    <Fade data-fade className={className} style={style} id={id} {...shared}>
      {content}
    </Fade>
  );
}
/* RevealText writes a sentence one word (or line) at a time, like handwriting
 * arriving on the page. Whitespace is kept as real text nodes, so innerText
 * and screen readers still receive the plain sentence. */
export type RevealTextProps = {
  text: string;
  /** Split by word (default) or by line (`\n`). */
  by?: "word" | "line";
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
  id?: string;
  /** Delay before the first unit, in milliseconds. */
  delay?: number;
  /** Seconds between units. */
  step?: number;
  y?: number;
};
const textTags = {
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  span: motion.span,
  div: motion.div,
} as const;
export function RevealText({
  text,
  by = "word",
  as = "p",
  className,
  id,
  delay = 0,
  step = 0.05,
  y = 10,
}: RevealTextProps) {
  const { transition } = useMotionTokens();
  const Tag = textTags[as];
  const units = useMemo(
    () => (by === "line" ? text.split("\n") : text.split(/\s+/)).filter(Boolean),
    [text, by],
  );
  const unitVariants = useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y },
      visible: {
        opacity: 1,
        y: 0,
        transition: { ...transition.reveal, duration: 0.5 },
      },
    }),
    [y, transition.reveal],
  );
  return (
    <Tag
      className={className}
      id={id}
      data-reveal-text={by}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: IN_VIEW_MARGIN }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: step, delayChildren: delay / 1000 },
        },
      }}
    >
      {units.map((unit, i) => (
        <Fragment key={i}>
          {i > 0 && (by === "line" ? <br /> : " ")}
          <motion.span
            className="reveal-unit"
            data-fade
            variants={unitVariants}
          >
            {unit}
          </motion.span>
        </Fragment>
      ))}
    </Tag>
  );
}
/** Alias for line-by-line reveals. */
export function Lines(props: Omit<RevealTextProps, "by">) {
  return <RevealText {...props} by="line" />;
}
export { Button as InkButton };
