"use client";

import { useEffect } from "react";
import { useWorkspace } from "~/contexts/WorkspaceContext";

export function WhiteLabelProvider({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!workspace) return;

    // Apply global CSS custom properties for white-labeling
    const root = document.documentElement;
    
    // Set primary color
    if (workspace.primaryColor) {
      root.style.setProperty('--primary', workspace.primaryColor);
      root.style.setProperty('--primary-foreground', getContrastColor(workspace.primaryColor));
    }

    // Set workspace name in document title
    if (workspace.name && workspace.name !== "Default Workspace") {
      document.title = `${workspace.name} - Video Processing`;
    }

    // Set favicon if logo is provided
    if (workspace.logoUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = workspace.logoUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = workspace.logoUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // Add custom CSS for workspace branding
    const styleId = 'workspace-branding';
    let existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --workspace-primary: ${workspace.primaryColor || '#3b82f6'};
        --workspace-primary-foreground: ${getContrastColor(workspace.primaryColor || '#3b82f6')};
      }
      
      .workspace-branded {
        --primary: var(--workspace-primary);
        --primary-foreground: var(--workspace-primary-foreground);
      }
      
      .workspace-logo {
        background-image: ${workspace.logoUrl ? `url('${workspace.logoUrl}')` : 'none'};
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
    `;
    document.head.appendChild(style);

  }, [workspace]);

  return <>{children}</>;
}

// Helper function to get contrast color (black or white)
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
