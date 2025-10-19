# 🌐 Domain Workspace Testing Guide

This guide shows you how to test the custom domain and white-label workspace features.

## 🚀 Quick Start

### 1. Run the Demo Script
```bash
node demo-white-label.js
```

This will show you:
- Current workspaces in the database
- Testing URLs
- Database statistics

---

## 🧪 Testing Methods

### Method 1: Local Development (Recommended)

#### Step 1: Add Test Domain to Hosts File
```bash
# On macOS/Linux
echo "127.0.0.1 acme-video.test" | sudo tee -a /etc/hosts

# On Windows (run as Administrator)
echo 127.0.0.1 acme-video.test >> C:\Windows\System32\drivers\etc\hosts
```

#### Step 2: Create Test Workspace with Custom Domain
```bash
# Run this script to create a test workspace
node -e "
import postgres from 'postgres';
const client = postgres('postgresql://postgres@localhost:5432/video_processor');

async function createTestWorkspace() {
  try {
    // Create a test workspace with custom domain
    const result = await client\`
      INSERT INTO video_processor_workspace (id, name, slug, \"primaryColor\", \"customDomain\", credits)
      VALUES (
        gen_random_uuid(),
        'Acme Video Solutions',
        'acme-video',
        '#ff6b35',
        'acme-video.test',
        50
      )
      RETURNING *
    \`;
    
    console.log('✅ Test workspace created:', result[0]);
    
    // Create a membership for the current user
    const user = await client\`SELECT id FROM video_processor_user WHERE email = 'grabhaymishra@gmail.com' LIMIT 1\`;
    if (user.length > 0) {
      await client\`
        INSERT INTO video_processor_membership (id, \"userId\", \"workspaceId\", role)
        VALUES (gen_random_uuid(), \${user[0].id}, \${result[0].id}, 'owner')
      \`;
      console.log('✅ User membership created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestWorkspace();
"
```

#### Step 3: Test the Custom Domain
1. **Visit**: `http://acme-video.test:3000`
2. **Expected**: 
   - Shows "Acme Video Solutions" branding
   - Orange color scheme (#ff6b35)
   - Custom domain in the URL

#### Step 4: Test Default Domain
1. **Visit**: `http://localhost:3000`
2. **Expected**: 
   - Shows "Default Workspace" branding
   - Blue color scheme (#3b82f6)

---

### Method 2: Using Browser Developer Tools

#### Step 1: Modify Request Headers
1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Right-click on any request** → "Copy as cURL"
4. **Modify the cURL** to include custom headers:

```bash
curl 'http://localhost:3000/api/workspace/info' \
  -H 'x-workspace-domain: acme-video.test' \
  -H 'Cookie: [your-session-cookie]'
```

#### Step 2: Test API Endpoints
```bash
# Test workspace resolution
curl 'http://localhost:3000/api/workspace/resolve?domain=acme-video.test'

# Test workspace info with custom domain
curl 'http://localhost:3000/api/workspace/info' \
  -H 'x-workspace-domain: acme-video.test'
```

---

### Method 3: Using Postman/Insomnia

#### Step 1: Create Collection
1. **Create new collection**: "Video Processor API"
2. **Add environment variables**:
   - `base_url`: `http://localhost:3000`
   - `custom_domain`: `acme-video.test`

#### Step 2: Test Endpoints
1. **GET** `/api/workspace/resolve?domain=acme-video.test`
2. **GET** `/api/workspace/info` with header `x-workspace-domain: acme-video.test`
3. **POST** `/api/trpc/workspace.switchWorkspace` with workspace ID

---

## 🔍 What to Test

### 1. Domain Resolution
- [ ] Custom domain resolves to correct workspace
- [ ] Default domain falls back to default workspace
- [ ] Invalid domain shows appropriate error

### 2. White-Label Branding
- [ ] Logo changes based on workspace
- [ ] Primary color applies globally
- [ ] Workspace name displays correctly
- [ ] Favicon updates (if logo provided)

### 3. Workspace Switching
- [ ] Can switch between workspaces
- [ ] UI updates immediately after switch
- [ ] Data refreshes to new workspace
- [ ] Loading states work properly

### 4. Data Isolation
- [ ] Credits are workspace-specific
- [ ] Video jobs are workspace-specific
- [ ] Settings are workspace-specific
- [ ] Users can only see their workspace data

### 5. API Headers
- [ ] `x-workspace-id` header is set correctly
- [ ] `x-workspace-slug` header is set correctly
- [ ] `x-workspace-name` header is set correctly
- [ ] `x-workspace-color` header is set correctly

---

## 🛠️ Debugging Tools

### 1. Check Database
```bash
# List all workspaces
node -e "
import postgres from 'postgres';
const client = postgres('postgresql://postgres@localhost:5432/video_processor');
client\`SELECT * FROM video_processor_workspace\`.then(console.log).finally(() => client.end());
"
```

### 2. Check Middleware
```bash
# Test middleware resolution
curl -v 'http://localhost:3000/api/workspace/resolve?domain=acme-video.test'
```

### 3. Check Meta Tags
1. **View page source** on custom domain
2. **Look for meta tags**:
   ```html
   <meta name="x-workspace-id" content="...">
   <meta name="x-workspace-slug" content="acme-video">
   <meta name="x-workspace-name" content="Acme Video Solutions">
   <meta name="x-workspace-color" content="#ff6b35">
   ```

---

## 🎯 Expected Results

### Custom Domain (`acme-video.test:3000`)
- ✅ **Branding**: "Acme Video Solutions" 
- ✅ **Color**: Orange (#ff6b35)
- ✅ **Logo**: Custom logo (if set)
- ✅ **Credits**: 50 credits
- ✅ **Data**: Isolated to this workspace

### Default Domain (`localhost:3000`)
- ✅ **Branding**: "Default Workspace"
- ✅ **Color**: Blue (#3b82f6)
- ✅ **Logo**: Default initials
- ✅ **Credits**: 1 credit (default)
- ✅ **Data**: Default workspace data

---

## 🚨 Common Issues

### Issue 1: Domain Not Resolving
**Problem**: Custom domain shows default workspace
**Solution**: 
1. Check hosts file: `cat /etc/hosts | grep acme-video`
2. Check workspace in DB: `SELECT * FROM video_processor_workspace WHERE "customDomain" = 'acme-video.test'`
3. Restart browser/clear DNS cache

### Issue 2: Branding Not Updating
**Problem**: UI shows old branding after switching
**Solution**:
1. Hard refresh (Ctrl+F5)
2. Check meta tags in page source
3. Check browser console for errors

### Issue 3: Data Not Isolated
**Problem**: Shows data from wrong workspace
**Solution**:
1. Check `x-workspace-id` header in network tab
2. Verify workspace switching API call
3. Check database for correct workspace ID

---

## 📊 Test Checklist

- [ ] **Domain Resolution**: Custom domain works
- [ ] **Default Fallback**: Default domain works
- [ ] **Branding**: Colors and logos update
- [ ] **Data Isolation**: Each workspace has separate data
- [ ] **Workspace Switching**: Can switch between workspaces
- [ ] **API Headers**: Headers are set correctly
- [ ] **Meta Tags**: Meta tags update properly
- [ ] **Error Handling**: Invalid domains handled gracefully
- [ ] **Performance**: Switching is fast and smooth
- [ ] **Persistence**: Settings persist across page reloads

---

## 🎉 Success Criteria

✅ **Custom domains work** - Different URLs show different workspaces
✅ **White-label branding** - Colors, logos, and names update
✅ **Data isolation** - Each workspace has separate data
✅ **Smooth switching** - Can switch between workspaces easily
✅ **API consistency** - All API calls use correct workspace context
✅ **Error handling** - Invalid domains are handled gracefully

**If all these work, your domain workspace system is fully functional! 🚀**
