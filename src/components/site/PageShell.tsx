import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`min-h-screen min-w-0 overflow-x-clip bg-surface1 text-text1 ${className}`}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
