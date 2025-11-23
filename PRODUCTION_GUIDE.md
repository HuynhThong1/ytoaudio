# Production Download Fix for Vercel

## Changes Made

I've made the following changes to fix the download prevention issue on production:

### 1. **Created `vercel.json`**
- Increased function timeout to 60 seconds (from default 10s)
- Increased memory to 3008MB for better performance
- This is required because audio conversion can take time

### 2. **Updated `src/app/api/convert/route.ts`**
- Added binary path caching to avoid re-downloading on every request
- Changed `/tmp` path explicitly for production (Vercel requirement)
- Added `chmod` to make binary executable on Linux
- Better error handling for binary download failures

## Important Notes

### For Hobby Plan Users
- Vercel Hobby plan has a **10-second timeout limit**
- The 60-second timeout in `vercel.json` will only work on **Pro plan or higher**
- If you're on Hobby plan, conversions might still timeout for longer videos

### Recommendations

**Option 1: Upgrade to Vercel Pro** (if needed for longer conversions)
- Pro plan allows up to 60-second function duration
- Better for handling longer videos

**Option 2: Optimize for Hobby Plan**
- Keep video lengths short (under 3-5 minutes)
- Use lower quality audio format
- The app will work for most music tracks

**Option 3: Alternative Hosting**
- Deploy to Railway, Render, or other platforms without strict timeouts
- These platforms typically support longer-running processes

## Testing

After deploying these changes:
1. Push code to GitHub
2. Vercel will auto-deploy
3. Test with a short video first (1-2 minutes)
4. Check Vercel function logs if issues persist

## Debugging

If downloads still fail, check Vercel function logs:
```bash
vercel logs [deployment-url]
```

Look for:
- Binary download errors
- Timeout errors
- Memory limit errors
