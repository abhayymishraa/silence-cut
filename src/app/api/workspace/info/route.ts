import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { workspaces } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Try to get workspace ID from headers
    const workspaceId = request.headers.get("x-workspace-id");
    
    let workspace = null;
    
    // First try to find by ID if provided
    if (workspaceId && workspaceId !== 'default') {
      workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
      });
    }
    
    // If no workspace found by ID, try to find the default workspace
    if (!workspace) {
      workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slug, "default"),
      });
      
      // If still no workspace, create a default workspace
      if (!workspace) {
        try {
          const [newWorkspace] = await db.insert(workspaces).values({
            name: "Default Workspace",
            slug: "default",
            primaryColor: "#3b82f6",
            credits: 1,
          }).returning();
          
          if (newWorkspace) {
            workspace = newWorkspace;
          }
        } catch (insertError) {
          console.error("Error creating default workspace:", insertError);
        }
      }
    }

    // If we have a workspace from the database, return it
    if (workspace) {
      console.log("Returning workspace from DB:", workspace.id);
      return NextResponse.json({
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
        primaryColor: workspace.primaryColor || "#3b82f6",
        logoUrl: workspace.logoUrl || undefined,
        credits: workspace.credits,
      });
    }

    // Fallback to hardcoded default workspace
    console.log("Returning fallback default workspace");
    return NextResponse.json({
      id: "default",
      slug: "default",
      name: "Default Workspace",
      primaryColor: "#3b82f6",
      logoUrl: undefined,
      credits: 1,
    });
  } catch (error) {
    console.error("Error fetching workspace info:", error);
    // Return default workspace info if database is not available
    return NextResponse.json({
      id: "default",
      slug: "default",
      name: "Default Workspace",
      primaryColor: "#3b82f6",
      logoUrl: undefined,
      credits: 1,
    });
  }
}
