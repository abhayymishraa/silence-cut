// Demo script to show white-label features
import postgres from 'postgres';

async function demoWhiteLabel() {
  console.log('🎨 White-Label Demo Setup\n');
  
  const client = postgres("postgresql://postgres@localhost:5432/video_processor");
  
  try {
    // Show current workspaces
    console.log('📋 Current Workspaces:');
    const workspaces = await client`
      SELECT name, slug, "primaryColor", "customDomain", credits
      FROM video_processor_workspace
      ORDER BY "createdAt" DESC
    `;
    
    workspaces.forEach((ws, i) => {
      console.log(`\n${i + 1}. ${ws.name}`);
      console.log(`   Slug: ${ws.slug}`);
      console.log(`   Color: ${ws.primaryColor}`);
      console.log(`   Domain: ${ws.customDomain || 'Not set'}`);
      console.log(`   Credits: ${ws.credits}`);
    });

    console.log('\n🌐 Testing URLs:');
    console.log('• Default Brand: http://localhost:3000');
    console.log('• Custom Domain: http://acme-video.test:3000 (add to /etc/hosts)');
    
    console.log('\n⚙️ Settings Pages:');
    console.log('• General Settings: http://localhost:3000/settings');
    console.log('• Branding Settings: http://localhost:3000/settings/branding');
    
    console.log('\n🧪 Test Features:');
    console.log('1. Upload a video at http://localhost:3000/dashboard');
    console.log('2. Watch real-time processing and notifications');
    console.log('3. Configure branding at /settings/branding');
    console.log('4. Test custom domain (add acme-video.test to hosts)');
    
    console.log('\n📊 Database Stats:');
    const stats = await client`
      SELECT 
        (SELECT COUNT(*) FROM video_processor_user) as users,
        (SELECT COUNT(*) FROM video_processor_workspace) as workspaces,
        (SELECT COUNT(*) FROM video_processor_video_job) as jobs,
        (SELECT COUNT(*) FROM video_processor_video_job WHERE status = 'completed') as completed_jobs
    `;
    
    console.log(`• Users: ${stats[0].users}`);
    console.log(`• Workspaces: ${stats[0].workspaces}`);
    console.log(`• Total Jobs: ${stats[0].jobs}`);
    console.log(`• Completed Jobs: ${stats[0].completed_jobs}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

demoWhiteLabel().catch(console.error);
