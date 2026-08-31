"use client";

import { Eye, Sun } from "lucide-react";
import { lcvInteract } from "@/lib/lcv-interact";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dim");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dim":
        return <Eye className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const nextTheme = theme === "light" ? "dim" : "light";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="w-9 h-9 p-0 cursor-pointer"
      title={`Switch to ${nextTheme} theme`}
      aria-label={`Switch to ${nextTheme} theme`}
      {...lcvInteract({
        event: "toggle-theme",
        from: `theme:${theme}`,
        success: `theme:${nextTheme}`,
        fail: `theme:${theme}`,
        interrupted: `theme:${theme}`,
      })}
    >
      {getIcon()}
    </Button>
  );
}
