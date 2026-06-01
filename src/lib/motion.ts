import type { Transition, Variants } from "motion/react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function motionTransition(reduced: boolean, duration = 0.6): Transition {
  if (reduced) {
    return { duration: 0 };
  }
  return { duration, ease: "easeOut" };
}
