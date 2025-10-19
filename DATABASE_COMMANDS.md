# Database Management Commands

## ✅ Credits Updated!
Your workspace now has **1000 credits**.

---

## Using the Database Manager

I've created a convenient tool called `db-manager.js` that lets you easily manage your database.

### Available Commands

#### 1. View Statistics
```bash
node db-manager.js stats
```
Shows total users, workspaces, and job counts.

#### 2. List Users
```bash
node db-manager.js users
```
Shows all users with their emails and IDs.

#### 3. List Workspaces
```bash
node db-manager.js workspaces
```
Shows all workspaces with their credits and settings.

#### 4. List Video Jobs
```bash
node db-manager.js jobs
```
Shows the 10 most recent video jobs with their status.

#### 5. List Memberships
```bash
node db-manager.js memberships
```
Shows which users belong to which workspaces.

#### 6. Increase Credits
```bash
node db-manager.js increaseCredits default 500
```
Adds 500 credits to the "default" workspace (adds to existing credits).

#### 7. Set Credits to Specific Amount
```bash
node db-manager.js setCredits default 1000
```
Sets credits to exactly 1000 (replaces current credits).

#### 8. Clear All Jobs (Careful!)
```bash
node db-manager.js clearJobs
```
Deletes all video jobs from the database. Use for testing only!

#### 9. Help
```bash
node db-manager.js help
```
Shows all available commands.

---

## Direct PostgreSQL Commands (Alternative)

If you have `psql` installed, you can also run SQL directly:

### Connect to Database
```bash
psql -U postgres -d video_processor
```

### Common SQL Commands

#### View Workspaces with Credits
```sql
SELECT id, name, slug, credits FROM video_processor_workspace;
```

#### Update Credits
```sql
UPDATE video_processor_workspace 
SET credits = 1000 
WHERE slug = 'default';
```

#### View All Jobs
```sql
SELECT id, status, "createdAt", "completedAt" 
FROM video_processor_video_job 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

#### View Users
```sql
SELECT id, name, email FROM video_processor_user;
```

#### Delete All Jobs
```sql
DELETE FROM video_processor_video_job;
```

---

## Current Database Status

✅ **Workspace**: Default Workspace  
✅ **Credits**: 1000  
✅ **Users**: 3  
✅ **Jobs**: 2 (all completed)  

---

## Quick Reference

| Task | Command |
|------|---------|
| Check credits | `node db-manager.js workspaces` |
| Add 100 credits | `node db-manager.js increaseCredits default 100` |
| Set to 500 credits | `node db-manager.js setCredits default 500` |
| View all jobs | `node db-manager.js jobs` |
| View statistics | `node db-manager.js stats` |
| View users | `node db-manager.js users` |

---

## Tips

1. **Always check first**: Run `node db-manager.js workspaces` to see current credits before making changes
2. **Use increaseCredits**: If you want to add credits without overwriting, use `increaseCredits`
3. **Use setCredits**: If you want to set an exact amount, use `setCredits`
4. **Regular monitoring**: Run `node db-manager.js stats` to keep track of your database
5. **Development testing**: Use `node db-manager.js clearJobs` to clean up test data

---

## Examples

### Example 1: Give yourself unlimited credits for testing
```bash
node db-manager.js setCredits default 999999
```

### Example 2: Check how many jobs you've processed
```bash
node db-manager.js stats
```

### Example 3: See your recent video processing history
```bash
node db-manager.js jobs
```

### Example 4: Add 50 credits
```bash
node db-manager.js increaseCredits default 50
```

---

**Note**: The `db-manager.js` tool is saved in your project root for easy access anytime!
