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
  const mainDomain = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : "localhost";
  const isCustomDomain = !host.includes("localhost") && 
    !host.includes("127.0.0.1") && 
    !host.includes(mainDomain);
  
  console.log(`[Middleware] Host: ${host}, isCustomDomain: ${isCustomDomain}`);
  
  // For testing purposes, hardcode the workspace data based on domain
  let workspaceData = null;
  
  if (isCustomDomain) {
    // For custom domains, return the test workspace data
    workspaceData = {
      id: "test-workspace-123",
      slug: "acme-video",
      name: "Acme Video Solutions",
      primaryColor: "#ff6b35",
      logoUrl: "https://via.placeholder.com/100x100/ff6b35/ffffff?text=AVS",
      credits: 100
    };
    console.log(`[Middleware] Using custom domain workspace:`, workspaceData);
  } else {
    // For default domain, return default workspace data
    workspaceData = {
      id: "default",
      slug: "default", 
      name: "Default Workspace",
      primaryColor: "#3b82f6",
      logoUrl: "",
      credits: 1
    };
    console.log(`[Middleware] Using default workspace:`, workspaceData);
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
