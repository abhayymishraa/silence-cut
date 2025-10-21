"use client";

import { useEffect, useState } from "react";
import { WhiteLabeledLanding } from "./WhiteLabeledLanding";

interface ClientPageWrapperProps {
  children: React.ReactNode;
}

export function ClientPageWrapper({ children }: ClientPageWrapperProps) {
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('[ClientPageWrapper] Component mounted, current host:', typeof window !== 'undefined' ? window.location.host : 'SSR');

  useEffect(() => {
    const currentHost = window.location.host;
    console.log('[ClientPageWrapper] Current host:', currentHost);
    
    // Check if this is a custom domain (not localhost)
    const isCustomDomainHost = currentHost !== 'localhost:3000' && 
                              currentHost !== '127.0.0.1:3000' &&
                              !currentHost.includes('localhost') &&
                              !currentHost.includes('127.0.0.1');
    
    console.log('[ClientPageWrapper] Is custom domain host:', isCustomDomainHost);
    
    if (isCustomDomainHost) {
      console.log('[ClientPageWrapper] Detected custom domain, showing white-labeled landing');
      setIsCustomDomain(true);
      setIsLoading(false);
      return;
    }

    // For localhost, wait for workspace-updated event
    const handleWorkspaceUpdate = (event: CustomEvent) => {
      console.log('[ClientPageWrapper] Workspace updated event received:', event.detail);
      const workspaceData = event.detail;
      
      // Check if this workspace has a custom domain
      const hasCustomDomain = workspaceData?.customDomain;
      console.log('[ClientPageWrapper] Workspace has custom domain:', hasCustomDomain);
      
      setIsCustomDomain(!!hasCustomDomain);
      setIsLoading(false);
    };

    // Listen for workspace updates
    window.addEventListener('workspace-updated', handleWorkspaceUpdate as EventListener);

    // Fallback timeout
    const timeout = setTimeout(() => {
      console.log('[ClientPageWrapper] Timeout reached, defaulting to non-custom domain');
      setIsCustomDomain(false);
      setIsLoading(false);
    }, 2000);

    return () => {
      window.removeEventListener('workspace-updated', handleWorkspaceUpdate as EventListener);
      clearTimeout(timeout);
    };
  }, []);

  if (isLoading) {
    console.log('[ClientPageWrapper] Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  console.log('[ClientPageWrapper] Rendering decision:', { isCustomDomain, currentHost: window.location.host });

  // If it's a custom domain, show white-labeled landing
  if (isCustomDomain) {
    console.log('[ClientPageWrapper] Rendering WhiteLabeledLanding');
    return <WhiteLabeledLanding />;
  }

  // Otherwise show the default page
  console.log('[ClientPageWrapper] Rendering default page');
  return <>{children}</>;
}
