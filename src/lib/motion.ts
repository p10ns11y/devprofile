import type { Transition, Variants } from "motion/react";

export const defaultViewport = { once: true, margin: "-80px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export function motionTransition(reduced: boolean, duration = 0.6): Transition {
  if (reduced) {
    return { duration: 0 };
  }
  return { duration, ease: "easeOut" };
}

export function itemTransition(reduced: boolean): Transition {
  if (reduced) {
    return { duration: 0 };
  }
  return { duration: 0.4, ease: "easeOut" };
}
