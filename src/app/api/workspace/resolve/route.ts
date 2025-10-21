import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { workspaces } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain");
    
    if (!domain) {
      return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
    }

    // Remove port from domain if present
    const cleanDomain = domain.split(':')[0];
    
    // Look up workspace by custom domain
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.customDomain, cleanDomain),
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found for this domain" }, { status: 404 });
    }

    return NextResponse.json({
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      primaryColor: workspace.primaryColor || "#3b82f6",
      logoUrl: workspace.logoUrl || undefined,
      credits: workspace.credits,
    });
  } catch (error) {
    console.error("Error resolving workspace by domain:", error);
    return NextResponse.json({ error: "Failed to resolve workspace" }, { status: 500 });
  }
}
