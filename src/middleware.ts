import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need workspace context
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the host from the request
  const host = request.headers.get("host") || "";
  
  // Check if this is a custom domain (not the main app domain)
  const isCustomDomain = !host.includes("localhost") && 
    !host.includes("127.0.0.1") && 
    process.env.NEXTAUTH_URL && 
    !host.includes(new URL(process.env.NEXTAUTH_URL).hostname);
  
  // Fetch workspace info for custom domains
  let workspaceData = null;
  if (isCustomDomain) {
    try {
      // Query the database directly or use a cached lookup
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/workspace/resolve?domain=${host}`, {
        headers: {
          'x-middleware-request': 'true',
        },
      });
      
      if (response.ok) {
        workspaceData = await response.json();
      }
    } catch (error) {
      console.error('Error resolving custom domain:', error);
    }
  }
  
  // Try to get workspace from database if no custom domain was found
  if (!workspaceData) {
    try {
      // Fetch the default workspace
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/workspace/info`, {
        headers: {
          'x-middleware-request': 'true',
        },
      });
      
      if (response.ok) {
        workspaceData = await response.json();
      }
    } catch (error) {
      console.error('Error fetching default workspace:', error);
    }
  }
  
  // If we still don't have workspace data, use default values
  if (!workspaceData) {
    workspaceData = {
      id: "default",
      slug: "default",
      name: "Default Workspace",
      primaryColor: "#3b82f6",
      logoUrl: "",
      credits: 1
    };
  }
  
  const response = NextResponse.next();
  
  // Set workspace headers based on domain lookup or use default
  response.headers.set("x-workspace-id", workspaceData.id);
  response.headers.set("x-workspace-slug", workspaceData.slug);
  response.headers.set("x-workspace-name", workspaceData.name);
  response.headers.set("x-workspace-color", workspaceData.primaryColor || "#3b82f6");
  response.headers.set("x-workspace-logo", workspaceData.logoUrl || "");
  if (isCustomDomain) {
    response.headers.set("x-workspace-custom-domain", host);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
