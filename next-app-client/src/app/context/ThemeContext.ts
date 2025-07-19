"use client";
import { createContext } from "react";

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setIsDark: () => {},
});