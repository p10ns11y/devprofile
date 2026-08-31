"use client";

import { BUILDING_SINGULARITY } from "@/data/building-landscape";

export const WHITE_HOLE_TIP_ID = "white-hole-tip";

function showWhiteHoleTip() {
  const tip = document.getElementById(WHITE_HOLE_TIP_ID);
  if (!(tip instanceof HTMLElement) || typeof tip.showPopover !== "function") {
    return;
  }
  try {
    tip.showPopover();
  } catch {
    // Already open.
  }
}

export function WhiteHoleInvoker() {
  return (
    <button
      type="button"
      className="building-atlas__hole-invoker"
      popoverTarget={WHITE_HOLE_TIP_ID}
      popoverTargetAction="show"
      aria-label={`${BUILDING_SINGULARITY.attribution} ${BUILDING_SINGULARITY.sublabel}: the other side of a black hole`}
      onPointerEnter={showWhiteHoleTip}
      onFocus={showWhiteHoleTip}
    >
      {BUILDING_SINGULARITY.sublabel}
    </button>
  );
}

export function WhiteHoleTip() {
  return (
    <div id={WHITE_HOLE_TIP_ID} popover="auto" className="building-atlas__hole-tip">
      <figure>
        <p>{BUILDING_SINGULARITY.tooltip}</p>
        <figcaption>
          — <cite>{BUILDING_SINGULARITY.attribution}</cite>
        </figcaption>
      </figure>
    </div>
  );
}
