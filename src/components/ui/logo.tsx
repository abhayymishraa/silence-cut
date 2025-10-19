"use client";

import { useTheme } from "~/contexts/ThemeContext";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const { logoUrl } = useTheme();

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt="Logo"
        width={size === "sm" ? 24 : size === "md" ? 32 : 48}
        height={size === "sm" ? 24 : size === "md" ? 32 : 48}
        className={`${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Default logo if no custom logo
  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold`}
    >
      VP
    </div>
  );
}
