import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get headers from the request
    const host = request.headers.get("host") || "";
    const customDomain = request.headers.get("x-workspace-custom-domain");
    const workspaceId = request.headers.get("x-workspace-id");
    const workspaceName = request.headers.get("x-workspace-name");
    const workspaceColor = request.headers.get("x-workspace-color");
    const workspaceLogo = request.headers.get("x-workspace-logo");
    
    console.log('[API] Headers:', {
      host,
      customDomain,
      workspaceId,
      workspaceName,
      workspaceColor,
      workspaceLogo
    });
    
    // If we have custom domain headers, use them
    if (customDomain) {
      const workspaceData = {
        id: workspaceId || 'test-workspace-123',
        slug: 'acme-video',
        name: workspaceName || 'Acme Video Solutions',
        color: workspaceColor || '#ff6b35',
        logo: workspaceLogo || 'https://ui-avatars.com/api/?name=AVS&background=ff6b35&color=ffffff&size=100',
        customDomain: customDomain,
      };
      
      console.log('[API] Returning custom workspace from headers:', workspaceData);
      return NextResponse.json(workspaceData);
    }
    
    // Fallback to host-based detection
    const isCustomDomain = !host.includes("localhost") && !host.includes("127.0.0.1");
    
    if (isCustomDomain) {
      // For custom domains, return the test workspace data
      const workspaceData = {
        id: 'test-workspace-123',
        slug: 'acme-video',
        name: 'Acme Video Solutions',
        color: '#ff6b35',
        logo: 'https://ui-avatars.com/api/?name=AVS&background=ff6b35&color=ffffff&size=100',
        customDomain: host,
      };
      
      console.log('[API] Returning custom workspace from host:', workspaceData);
      return NextResponse.json(workspaceData);
    } else {
      // For default domain, return default workspace data
      const workspaceData = {
        id: 'default',
        slug: 'default',
        name: 'Default Workspace',
        color: '#3b82f6',
        logo: '',
        customDomain: '',
      };
      
      console.log('[API] Returning default workspace:', workspaceData);
      return NextResponse.json(workspaceData);
    }
  } catch (error) {
    console.error("Error fetching current workspace:", error);
    return NextResponse.json({
      id: 'default',
      slug: 'default',
      name: 'Default Workspace',
      color: '#3b82f6',
      logo: '',
      customDomain: '',
    });
  }
}
