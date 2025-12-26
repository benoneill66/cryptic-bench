"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../theme-provider";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    if (theme === "light") return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={`Current theme: ${theme}. Click to cycle through themes.`}
    >
      {getIcon()}
    </Button>
  );
}
