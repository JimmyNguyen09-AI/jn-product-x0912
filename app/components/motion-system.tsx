"use client";
import { useEffect, type ReactNode } from "react";
import { AnimateUIProvider } from "@animate-ui/react/provider";
import { Fade } from "@animate-ui/react/primitives/effects/fade";
import { Button } from "@animate-ui/react/primitives/buttons/button";
import { MotionConfig } from "motion/react";
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
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { transition } = useMotionTokens();
  return (
    <Fade
      data-fade
      className={className}
      inView
      inViewOnce
      transition={transition.reveal}
    >
      {children}
    </Fade>
  );
}
export { Button as InkButton };
