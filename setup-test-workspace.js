#!/usr/bin/env node

// Setup script to create a test workspace with custom domain
import postgres from 'postgres';

async function setupTestWorkspace() {
  console.log('🚀 Setting up test workspace for domain testing...\n');
  
  const client = postgres("postgresql://postgres@localhost:5432/video_processor");
  
  try {
    // Check if test workspace already exists
    const existing = await client`
      SELECT * FROM video_processor_workspace 
      WHERE "customDomain" = 'acme-video.test'
    `;
    
    if (existing.length > 0) {
      console.log('✅ Test workspace already exists:');
      console.log(`   Name: ${existing[0].name}`);
      console.log(`   Domain: ${existing[0].customDomain}`);
      console.log(`   Color: ${existing[0].primaryColor}`);
      console.log(`   Credits: ${existing[0].credits}`);
    } else {
      // Create test workspace
      console.log('📝 Creating test workspace...');
      const result = await client`
        INSERT INTO video_processor_workspace (id, name, slug, "primaryColor", "customDomain", credits)
        VALUES (
          gen_random_uuid(),
          'Acme Video Solutions',
          'acme-video',
          '#ff6b35',
          'acme-video.test',
          50
        )
        RETURNING *
      `;
      
      console.log('✅ Test workspace created:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Name: ${result[0].name}`);
      console.log(`   Slug: ${result[0].slug}`);
      console.log(`   Domain: ${result[0].customDomain}`);
      console.log(`   Color: ${result[0].primaryColor}`);
      console.log(`   Credits: ${result[0].credits}`);
      
      // Create membership for current user
      const user = await client`
        SELECT id, name, email 
        FROM video_processor_user 
        WHERE email = 'grabhaymishra@gmail.com' 
        LIMIT 1
      `;
      
      if (user.length > 0) {
        await client`
          INSERT INTO video_processor_membership (id, "userId", "workspaceId", role)
          VALUES (gen_random_uuid(), ${user[0].id}, ${result[0].id}, 'owner')
        `;
        console.log(`✅ User membership created for: ${user[0].email}`);
      } else {
        console.log('⚠️  User not found. You may need to sign up first.');
      }
    }
    
    console.log('\n🌐 Testing URLs:');
    console.log('• Default Brand: http://localhost:3000');
    console.log('• Custom Domain: http://acme-video.test:3000');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Add to hosts file: echo "127.0.0.1 acme-video.test" | sudo tee -a /etc/hosts');
    console.log('2. Visit: http://acme-video.test:3000');
    console.log('3. Compare with: http://localhost:3000');
    
    console.log('\n🧪 Test Features:');
    console.log('• Upload videos on both domains');
    console.log('• Check if data is isolated');
    console.log('• Verify branding differences');
    console.log('• Test workspace switching');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

setupTestWorkspace().catch(console.error);
