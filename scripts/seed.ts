import { db } from "../src/server/db";
import { workspaces, users, memberships } from "../src/server/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create default workspace
    const [defaultWorkspace] = await db
      .insert(workspaces)
      .values({
        name: "Default Workspace",
        slug: "default",
        primaryColor: "#3b82f6",
        credits: 1,
      })
      .returning();

    if (!defaultWorkspace) {
      throw new Error("Failed to create default workspace");
    }

    console.log("✅ Created default workspace:", defaultWorkspace.id);

    // Create demo user (this would normally be created through auth)
    const [demoUser] = await db
      .insert(users)
      .values({
        id: "demo-user-123",
        name: "Demo User",
        email: "demo@example.com",
      })
      .returning();

    if (!demoUser) {
      throw new Error("Failed to create demo user");
    }

    console.log("✅ Created demo user:", demoUser.id);

    // Create membership
    await db.insert(memberships).values({
      userId: demoUser.id,
      workspaceId: defaultWorkspace.id,
      role: "owner",
    });

    console.log("✅ Created membership");

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
