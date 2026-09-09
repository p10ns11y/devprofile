/** Retired multi-skin lab variants — all redirect to /lab/hire. */
export type LabVariant = "a" | "b" | "c" | "d" | "e" | "f" | "g";

export const labVariants: { href: string; label: string; id?: LabVariant }[] = [
  { href: "/lab/hire", label: "Production φ-flow" },
  { href: "/", label: "Home" },
];

export const RETIRED_LAB_PATHS = [
  "/lab/landing-a",
  "/lab/landing-b",
  "/lab/landing-c",
  "/lab/landing-d",
  "/lab/landing-e",
  "/lab/landing-f",
  "/lab/landing-g",
] as const;
