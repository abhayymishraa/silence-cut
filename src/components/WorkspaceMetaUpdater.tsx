"use client";

import { useEffect } from "react";

export function WorkspaceMetaUpdater() {
  useEffect(() => {
    console.log('[WorkspaceMetaUpdater] Component mounted, current host:', window.location.host);
    
    // Fetch workspace data from the API
    const fetchWorkspaceData = async () => {
      try {
        console.log('[WorkspaceMetaUpdater] Fetching workspace data...');
        console.log('[WorkspaceMetaUpdater] Current host:', window.location.host);
        const response = await fetch('/api/workspace/current', {
          headers: {
            'Host': window.location.host,
          }
        });
        console.log('[WorkspaceMetaUpdater] Response status:', response.status);
        const workspaceData = await response.json();
        
        console.log('[WorkspaceMetaUpdater] Workspace data:', workspaceData);
        
        // Update all meta tags
        const updateMetaTag = (name: string, content: string) => {
          let meta = document.querySelector(`meta[name="${name}"]`);
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
          console.log(`[WorkspaceMetaUpdater] Updated meta tag ${name}: ${content}`);
        };
        
        updateMetaTag('x-workspace-id', workspaceData.id);
        updateMetaTag('x-workspace-slug', workspaceData.slug);
        updateMetaTag('x-workspace-name', workspaceData.name);
        updateMetaTag('x-workspace-color', workspaceData.color);
        updateMetaTag('x-workspace-logo', workspaceData.logo);
        updateMetaTag('x-workspace-custom-domain', workspaceData.customDomain);
        
        console.log('[WorkspaceMetaUpdater] Set custom domain meta tag:', workspaceData.customDomain);
        
        console.log('[WorkspaceMetaUpdater] Meta tags updated');
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('workspace-updated', { 
          detail: workspaceData 
        }));
        console.log('[WorkspaceMetaUpdater] Dispatched workspace-updated event');
      } catch (error) {
        console.error('[WorkspaceMetaUpdater] Error fetching workspace data:', error);
      }
    };
    
    fetchWorkspaceData();
  }, []);

  return null; // This component doesn't render anything
}
