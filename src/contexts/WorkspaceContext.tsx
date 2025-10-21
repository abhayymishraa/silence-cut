"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface Workspace {
  id: string;
  slug: string;
  name: string;
  primaryColor: string;
  logoUrl?: string;
  customDomain?: string;
  credits: number;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  setWorkspace: (workspace: Workspace | null) => void;
  isLoading: boolean;
  isSwitching: boolean;
  refreshWorkspace: () => Promise<void>;
  switchToWorkspace: (workspace: Workspace) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Get tRPC utils at component level
  const utils = api.useUtils();

  // Function to fetch workspace info
  const getWorkspaceInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/workspace/current");
      
      if (response.ok) {
        const data = await response.json();
        // Map the field names from /api/workspace/current to match our workspace interface
        const workspaceData = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          primaryColor: data.color,
          logoUrl: data.logo,
          credits: data.credits || 1,
        };
        setWorkspace(workspaceData);
        console.log("Workspace data loaded:", workspaceData);
        return workspaceData;
      } else {
        console.error("Failed to fetch workspace info, status:", response.status);
        // Try to use default workspace if API fails
        setWorkspace({
          id: "default",
          slug: "default",
          name: "Default Workspace",
          primaryColor: "#3b82f6",
          logoUrl: undefined,
          credits: 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch workspace info:", error);
      // Set default workspace on error
      setWorkspace({
        id: "default",
        slug: "default",
        name: "Default Workspace",
        primaryColor: "#3b82f6",
        logoUrl: undefined,
        credits: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh workspace data
  const refreshWorkspace = async () => {
    await getWorkspaceInfo();
  };

  // Switch to a specific workspace
  const switchToWorkspace = async (newWorkspace: Workspace) => {
    setIsSwitching(true);
    
    try {
      setWorkspace(newWorkspace);
      
      // Update meta tags
      document.querySelector('meta[name="x-workspace-id"]')?.setAttribute('content', newWorkspace.id);
      document.querySelector('meta[name="x-workspace-slug"]')?.setAttribute('content', newWorkspace.slug);
      document.querySelector('meta[name="x-workspace-name"]')?.setAttribute('content', newWorkspace.name);
      document.querySelector('meta[name="x-workspace-color"]')?.setAttribute('content', newWorkspace.primaryColor || '#3b82f6');
      if (newWorkspace.logoUrl) {
        document.querySelector('meta[name="x-workspace-logo"]')?.setAttribute('content', newWorkspace.logoUrl);
      }

      // Small delay to ensure meta tags are updated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Invalidate specific queries that depend on workspace
      try {
        await Promise.all([
          utils.workspace.getCredits.invalidate(),
          utils.video.getJobs.invalidate(),
          utils.workspace.listUserWorkspaces.invalidate(),
        ]);
      } catch (error) {
        console.error("Error invalidating queries:", error);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    getWorkspaceInfo();
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, isLoading, isSwitching, refreshWorkspace, switchToWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
