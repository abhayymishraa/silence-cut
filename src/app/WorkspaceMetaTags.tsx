"use client";

import { useEffect } from 'react';
import { useWorkspace } from '~/contexts/WorkspaceContext';

export function WorkspaceMetaTags() {
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (workspace) {
      // Update meta tags when workspace data is available
      const metaTags = {
        'x-workspace-id': workspace.id,
        'x-workspace-slug': workspace.slug,
        'x-workspace-name': workspace.name,
        'x-workspace-color': workspace.primaryColor || '#3b82f6',
        'x-workspace-logo': workspace.logoUrl || '',
      };

      // Update each meta tag
      Object.entries(metaTags).forEach(([name, content]) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content || '');
      });
    }
  }, [workspace]);

  return null; // This component doesn't render anything
}
