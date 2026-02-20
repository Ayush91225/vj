# FORCE RE-AUTHENTICATION

## You're still using the old token!

The logs show you're STILL getting 403, which means you haven't gotten a new token yet.

## Clear Everything:

### Option 1: Browser Console (EASIEST)
1. Open your app in browser
2. Press F12 (open DevTools)
3. Go to Console tab
4. Paste this and press Enter:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Option 2: Manual
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Local Storage" → your domain
4. Right-click → Clear
5. Refresh page

### Option 3: Incognito/Private Window
1. Open app in Incognito/Private window
2. Login with GitHub
3. Create project

## Then:
1. Login with GitHub (you'll see it asks for NEW permissions)
2. Create a project
3. Branch will be created ✅

## The token is cached in your browser!
That's why you keep getting 403 - you're using the OLD token without the new `workflow` permission.
