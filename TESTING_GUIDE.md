# Complete Testing Guide 🧪

## Prerequisites
Make sure these services are running:
```bash
# Terminal 1: Start the worker
./start-worker-simple.sh

# Terminal 2: Start the dev server
npm run dev

# Terminal 3: Start Redis (if not running)
brew services start redis

# Terminal 4: Start PostgreSQL (if not running)
brew services start postgresql@15
```

## 🎯 Feature Testing Checklist

### 1. Authentication & User Management ✅

#### Test User Registration
1. **Go to**: `http://localhost:3000/signup`
2. **Fill out form**:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. **Click**: "Create Account"
4. **Expected**: Redirected to dashboard with success message

#### Test User Login
1. **Go to**: `http://localhost:3000/signin`
2. **Fill out form**:
   - Email: `test@example.com`
   - Password: `password123`
3. **Click**: "Sign In"
4. **Expected**: Redirected to dashboard

#### Test Session Persistence
1. **Refresh the page** - should stay logged in
2. **Close browser and reopen** - should stay logged in
3. **Expected**: Session persists across browser sessions

---

### 2. Video Upload & Processing ✅

#### Test Video Upload
1. **Go to**: `http://localhost:3000/dashboard`
2. **Upload a video**:
   - Drag & drop a video file (MP4, MOV, AVI, WebM)
   - Or click to browse and select a file
   - File size should be ≤ 300MB
3. **Expected**: 
   - Upload progress indicator
   - Success toast notification
   - Job appears in "Recent Jobs" section

#### Test Video Processing
1. **Watch the job status**:
   - Should show "Queued" initially
   - Then "Processing" when worker picks it up
   - Finally "Completed" when done
2. **Expected**: 
   - Real-time status updates
   - Toast notifications for each status change
   - Processing takes 2-5 minutes

#### Test Video Preview
1. **When job shows "Completed"**:
   - Click "View" button
   - Video should open in embedded player
2. **Expected**: 
   - Video plays correctly
   - Shows original duration
   - Shows silence removal info

#### Test Video Download
1. **Click "Download" button**
2. **Expected**: Video file downloads to your computer

---

### 3. Credits System ✅

#### Test Credit Display
1. **Check header badge**: Should show current credits (998)
2. **Check stats card**: Should show same credit count
3. **Expected**: Credits display correctly

#### Test Credit Deduction
1. **Upload a video** (as above)
2. **Watch credits decrease**: Should go from 998 → 997
3. **Expected**: Credits deducted when job is created

#### Test Insufficient Credits
1. **Set credits to 0**:
   ```bash
   node db-manager.js setCredits default 0
   ```
2. **Try to upload a video**
3. **Expected**: Error message "Insufficient credits"

---

### 4. White-Label Features ✅

#### Test Default Branding
1. **Visit**: `http://localhost:3000`
2. **Expected**: 
   - Shows "Video Processor" branding
   - Blue color scheme (#3b82f6)
   - Default logo (VP initials)

#### Test Custom Domain (Simulated)
1. **Add to hosts file**:
   ```bash
   echo "127.0.0.1 acme-video.test" | sudo tee -a /etc/hosts
   ```
2. **Visit**: `http://acme-video.test:3000`
3. **Expected**: 
   - Shows "Acme Video Solutions" branding
   - Orange color scheme (#ff6b35)
   - Custom logo (AVS)

#### Test Branding Settings
1. **Go to**: `http://localhost:3000/settings`
2. **Click**: "Configure" under White-Label Branding
3. **Test settings**:
   - Change workspace name
   - Change primary color
   - Add logo URL
   - Set custom domain
4. **Expected**: 
   - Live preview updates
   - Changes save successfully
   - Branding applies globally

---

### 5. Real-Time Notifications ✅

#### Test Job Status Notifications
1. **Upload a video**
2. **Watch for toast notifications**:
   - "Video processing started"
   - "Video processing complete!"
3. **Expected**: Toast notifications appear for each status change

#### Test SSE Connection
1. **Check browser console** for:
   - "SSE connection opened"
   - "SSE ping received"
2. **Expected**: Connection status shows "Connected"

---

### 6. Database Operations ✅

#### Test Database Manager
```bash
# View all workspaces
node db-manager.js workspaces

# View all users
node db-manager.js users

# View all jobs
node db-manager.js jobs

# View statistics
node db-manager.js stats

# Add credits
node db-manager.js increaseCredits default 100

# Set credits
node db-manager.js setCredits default 1000
```

#### Test Database Queries
1. **Check workspace data**:
   ```bash
   curl -s "http://localhost:3000/api/workspace/info" | jq .
   ```
2. **Expected**: Returns workspace with credits, colors, etc.

---

### 7. Video Processing Quality ✅

#### Test Silence Detection
1. **Upload a video with silence**:
   - Record a video with 5-10 seconds of silence
   - Upload it for processing
2. **Expected**: 
   - Silence is detected and removed
   - Processed video is shorter
   - Time saved is calculated

#### Test Different Video Formats
1. **Test MP4**: Should work
2. **Test MOV**: Should work
3. **Test AVI**: Should work
4. **Test WebM**: Should work

---

### 8. Error Handling ✅

#### Test Invalid File Upload
1. **Try uploading**:
   - Non-video file (e.g., .txt, .pdf)
   - Video > 300MB
2. **Expected**: Appropriate error messages

#### Test Network Issues
1. **Stop the worker** (Ctrl+C in worker terminal)
2. **Upload a video**
3. **Expected**: Job stays "Queued" until worker restarts

---

### 9. UI/UX Testing ✅

#### Test Responsive Design
1. **Test on different screen sizes**:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. **Expected**: UI adapts properly

#### Test Navigation
1. **Test all navigation**:
   - Sign in/Sign up
   - Dashboard
   - Settings
   - Sign out
2. **Expected**: Smooth navigation, no broken links

---

### 10. Performance Testing ✅

#### Test Multiple Jobs
1. **Upload 3-5 videos simultaneously**
2. **Expected**: 
   - All jobs process correctly
   - No conflicts or errors
   - Proper queue management

#### Test Large Files
1. **Upload video close to 300MB limit**
2. **Expected**: 
   - Uploads successfully
   - Processes without errors
   - Reasonable processing time

---

## 🐛 Common Issues & Solutions

### Issue: "Workspace not found"
**Solution**: Check if database is running and seeded
```bash
node db-manager.js stats
```

### Issue: Videos not processing
**Solution**: Check if worker is running
```bash
ps aux | grep tsx
```

### Issue: Credits not updating
**Solution**: Refresh the page or click "Refresh" button

### Issue: White-label not working
**Solution**: Check workspace data
```bash
node db-manager.js workspaces
```

### Issue: Videos not playing
**Solution**: Check if files exist in `/uploads/processed/`

---

## 📊 Expected Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ | Users can sign up/in, sessions persist |
| Video Upload | ✅ | Drag & drop, file validation |
| Video Processing | ✅ | FFmpeg silence removal, real-time updates |
| Credits System | ✅ | Deduction, display, validation |
| White-Label | ✅ | Custom domains, branding, settings |
| Notifications | ✅ | Toast notifications, SSE connection |
| Database | ✅ | All CRUD operations working |
| UI/UX | ✅ | Responsive, intuitive interface |
| Error Handling | ✅ | Graceful error messages |
| Performance | ✅ | Handles multiple jobs, large files |

---

## 🎉 Success Criteria

The application is working correctly if:
- ✅ Users can register, login, and stay logged in
- ✅ Videos upload and process successfully
- ✅ Credits are deducted and displayed correctly
- ✅ White-label branding works on custom domains
- ✅ Real-time notifications appear
- ✅ All database operations work
- ✅ UI is responsive and intuitive
- ✅ Error handling is graceful
- ✅ Performance is acceptable

**If all these work, the application is production-ready! 🚀**
