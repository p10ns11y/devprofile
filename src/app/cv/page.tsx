import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CV",
  description: "Professional curriculum vitae",
};

export default function CvPage() {
  redirect("/?cv=view");
}
