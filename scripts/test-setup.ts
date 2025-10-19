import { db } from "../src/server/db";
import { workspaces, users, memberships } from "../src/server/db/schema";

async function testSetup() {
  console.log("🧪 Testing database setup...");

  try {
    // Test database connection
    const workspaceCount = await db.select().from(workspaces);
    console.log(`✅ Database connected. Found ${workspaceCount.length} workspaces.`);

    // Test workspace query
    const defaultWorkspace = await db.query.workspaces.findFirst({
      where: (workspaces, { eq }) => eq(workspaces.slug, "default"),
    });

    if (defaultWorkspace) {
      console.log(`✅ Default workspace found: ${defaultWorkspace.name}`);
    } else {
      console.log("❌ Default workspace not found. Run seed script first.");
    }

    console.log("🎉 Database setup test completed!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    process.exit(1);
  }
}

testSetup();
