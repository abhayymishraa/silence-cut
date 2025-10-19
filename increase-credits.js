// Script to increase credits for a workspace
import postgres from 'postgres';

async function increaseCredits() {
  console.log('Connecting to database...');
  const client = postgres("postgresql://postgres@localhost:5432/video_processor");
  
  try {
    // Show current credits
    console.log('\n=== Current Workspace Credits ===');
    const currentWorkspaces = await client`
      SELECT id, name, slug, credits
      FROM video_processor_workspace
      ORDER BY "createdAt" DESC
    `;
    
    currentWorkspaces.forEach(ws => {
      console.log(`- ${ws.name} (${ws.slug}): ${ws.credits} credits`);
    });
    
    // Increase credits for default workspace to 1000
    console.log('\n=== Increasing Credits ===');
    const result = await client`
      UPDATE video_processor_workspace
      SET credits = 1000, "updatedAt" = CURRENT_TIMESTAMP
      WHERE slug = 'default'
      RETURNING id, name, slug, credits
    `;
    
    if (result.length > 0) {
      console.log(`✅ Successfully updated ${result[0].name}:`);
      console.log(`   Credits: ${result[0].credits}`);
    } else {
      console.log('❌ No workspace found with slug "default"');
    }
    
    // Show final credits
    console.log('\n=== Updated Workspace Credits ===');
    const updatedWorkspaces = await client`
      SELECT id, name, slug, credits
      FROM video_processor_workspace
      ORDER BY "createdAt" DESC
    `;
    
    updatedWorkspaces.forEach(ws => {
      console.log(`- ${ws.name} (${ws.slug}): ${ws.credits} credits`);
    });
    
    console.log('\n✅ Credits updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

increaseCredits().catch(console.error);
