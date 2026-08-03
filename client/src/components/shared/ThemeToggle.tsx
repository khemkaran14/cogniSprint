import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Reads theme applied by the pre-hydration inline script / OS preference —
    // only knowable from the DOM/matchMedia, so this can't be computed up front.
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cognisprint-theme", next);
    } catch {
      // ignore storage failures (private browsing, etc.)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="px-2"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
