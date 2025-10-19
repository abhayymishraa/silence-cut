"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWorkspace } from "./WorkspaceContext";

interface ThemeContextType {
  primaryColor: string;
  logoUrl?: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();
  const [theme, setTheme] = useState<ThemeContextType>({
    primaryColor: "#3b82f6",
    logoUrl: undefined,
  });

  useEffect(() => {
    if (workspace) {
      setTheme({
        primaryColor: workspace.primaryColor,
        logoUrl: workspace.logoUrl,
      });

      // Apply CSS custom properties
      document.documentElement.style.setProperty(
        "--primary",
        workspace.primaryColor
      );
      document.documentElement.style.setProperty(
        "--primary-foreground",
        getContrastColor(workspace.primaryColor)
      );
    }
  }, [workspace]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper function to get contrasting text color
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
