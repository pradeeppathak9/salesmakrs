import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "salesmakrs_theme";

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // No stored preference yet — respect the OS setting on this first visit
  // only. Every visit after this one uses whatever gets stored below,
  // regardless of later OS changes.
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
