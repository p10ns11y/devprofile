"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type ProfileViewSwitchProps = {
  deck: ReactNode;
  scroll: ReactNode;
};

export function ProfileViewSwitch({ deck, scroll }: ProfileViewSwitchProps) {
  const searchParams = useSearchParams();
  const isScroll = searchParams.get("view") === "scroll";
  return isScroll ? scroll : deck;
}
