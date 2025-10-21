import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, workspaces, memberships } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    console.log("Signup API called");
    const { email, password, name } = await request.json();
    console.log("Signup data:", { email, name });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      console.log("User already exists");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await hash(password, 12);

    // Create the user
    console.log("Creating user...");
    const [newUser] = await db.insert(users).values({
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
    }).returning();

    if (!newUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Find or create a default workspace
    let workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.slug, "default"),
    });

    if (!workspace) {
      const [newWorkspace] = await db.insert(workspaces).values({
        name: "Default Workspace",
        slug: "default",
        primaryColor: "#3b82f6",
        credits: 1,
      }).returning();
      workspace = newWorkspace;
    }

    // Add user to the default workspace as owner
    await db.insert(memberships).values({
      userId: newUser.id,
      workspaceId: workspace.id,
      role: "owner",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
