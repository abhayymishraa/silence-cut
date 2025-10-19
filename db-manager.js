#!/usr/bin/env node
// Database Manager - Useful commands for managing the video processor database
import postgres from 'postgres';

const client = postgres("postgresql://postgres@localhost:5432/video_processor");

const commands = {
  // Show all users
  async users() {
    console.log('\n=== Users ===');
    const users = await client`
      SELECT id, name, email, "createdAt"
      FROM video_processor_user
      ORDER BY "createdAt" DESC
    `;
    console.table(users);
  },

  // Show all workspaces with credits
  async workspaces() {
    console.log('\n=== Workspaces ===');
    const workspaces = await client`
      SELECT id, name, slug, credits, "customDomain", "primaryColor"
      FROM video_processor_workspace
      ORDER BY "createdAt" DESC
    `;
    console.table(workspaces);
  },

  // Show all video jobs
  async jobs() {
    console.log('\n=== Video Jobs ===');
    const jobs = await client`
      SELECT 
        vj.id, 
        vj.status, 
        vj.duration,
        u.email as user_email,
        w.name as workspace_name,
        vj."createdAt",
        vj."completedAt"
      FROM video_processor_video_job vj
      LEFT JOIN video_processor_user u ON vj."userId" = u.id
      LEFT JOIN video_processor_workspace w ON vj."workspaceId" = w.id
      ORDER BY vj."createdAt" DESC
      LIMIT 10
    `;
    console.table(jobs);
  },

  // Increase credits for a workspace
  async increaseCredits(slug = 'default', amount = 1000) {
    const result = await client`
      UPDATE video_processor_workspace
      SET credits = credits + ${amount}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE slug = ${slug}
      RETURNING name, slug, credits
    `;
    if (result.length > 0) {
      console.log(`✅ Added ${amount} credits to ${result[0].name}`);
      console.log(`   Total credits: ${result[0].credits}`);
    } else {
      console.log(`❌ Workspace '${slug}' not found`);
    }
  },

  // Set credits to a specific amount
  async setCredits(slug = 'default', amount = 1000) {
    const result = await client`
      UPDATE video_processor_workspace
      SET credits = ${amount}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE slug = ${slug}
      RETURNING name, slug, credits
    `;
    if (result.length > 0) {
      console.log(`✅ Set credits for ${result[0].name} to ${result[0].credits}`);
    } else {
      console.log(`❌ Workspace '${slug}' not found`);
    }
  },

  // Show memberships
  async memberships() {
    console.log('\n=== Memberships ===');
    const memberships = await client`
      SELECT 
        m.id,
        u.email as user_email,
        w.name as workspace_name,
        m.role,
        m."createdAt"
      FROM video_processor_membership m
      LEFT JOIN video_processor_user u ON m."userId" = u.id
      LEFT JOIN video_processor_workspace w ON m."workspaceId" = w.id
      ORDER BY m."createdAt" DESC
    `;
    console.table(memberships);
  },

  // Delete all jobs (useful for testing)
  async clearJobs() {
    const result = await client`
      DELETE FROM video_processor_video_job
      RETURNING id
    `;
    console.log(`✅ Deleted ${result.length} jobs`);
  },

  // Show database stats
  async stats() {
    console.log('\n=== Database Statistics ===');
    
    const userCount = await client`SELECT COUNT(*) as count FROM video_processor_user`;
    const workspaceCount = await client`SELECT COUNT(*) as count FROM video_processor_workspace`;
    const jobCount = await client`SELECT COUNT(*) as count FROM video_processor_video_job`;
    const completedJobs = await client`SELECT COUNT(*) as count FROM video_processor_video_job WHERE status = 'completed'`;
    const processingJobs = await client`SELECT COUNT(*) as count FROM video_processor_video_job WHERE status = 'processing'`;
    const queuedJobs = await client`SELECT COUNT(*) as count FROM video_processor_video_job WHERE status = 'queued'`;
    
    console.log(`Users: ${userCount[0].count}`);
    console.log(`Workspaces: ${workspaceCount[0].count}`);
    console.log(`Total Jobs: ${jobCount[0].count}`);
    console.log(`  - Completed: ${completedJobs[0].count}`);
    console.log(`  - Processing: ${processingJobs[0].count}`);
    console.log(`  - Queued: ${queuedJobs[0].count}`);
  },

  // Help
  help() {
    console.log('\n=== Database Manager Commands ===\n');
    console.log('Usage: node db-manager.js <command> [args]\n');
    console.log('Commands:');
    console.log('  users              - List all users');
    console.log('  workspaces         - List all workspaces with credits');
    console.log('  jobs               - List recent video jobs');
    console.log('  memberships        - List all workspace memberships');
    console.log('  stats              - Show database statistics');
    console.log('  increaseCredits [slug] [amount]  - Add credits to a workspace');
    console.log('  setCredits [slug] [amount]       - Set credits to specific amount');
    console.log('  clearJobs          - Delete all video jobs (use with caution!)');
    console.log('  help               - Show this help message');
    console.log('\nExamples:');
    console.log('  node db-manager.js users');
    console.log('  node db-manager.js increaseCredits default 500');
    console.log('  node db-manager.js setCredits default 1000');
    console.log('  node db-manager.js stats\n');
  }
};

// Main execution
async function main() {
  const command = process.argv[2] || 'help';
  const args = process.argv.slice(3);

  if (commands[command]) {
    try {
      await commands[command](...args);
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      await client.end();
    }
  } else {
    console.log(`❌ Unknown command: ${command}`);
    commands.help();
    await client.end();
  }
}

main().catch(console.error);
