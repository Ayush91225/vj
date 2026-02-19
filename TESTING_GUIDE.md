# Authentication Testing Guide

## Quick Start

### Option 1: Start Everything at Once
```bash
./start-dev-full.sh
```

### Option 2: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend/lambda/api
python dev_server.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Test Scenarios

### ✅ Test 1: Unauthenticated User Redirect
**Steps:**
1. Clear browser storage: `localStorage.clear()` in console
2. Visit `http://localhost:3000`
3. **Expected**: Automatically redirects to `/auth`

### ✅ Test 2: GitHub Login Flow
**Steps:**
1. On `/auth` page, click "Continue with GitHub"
2. Authorize the app on GitHub
3. **Expected**: 
   - Redirects back to `http://localhost:3000/auth/callback?code=...`
   - Shows "Authenticating with GitHub..." spinner
   - Redirects to `/project` page
   - Token stored in localStorage

**Verify:**
```javascript
// In browser console
localStorage.getItem('vajraopz_token')
// Should return: "eyJ1c2VyX2lkIjoiLi4uIn0.abc123..."
```

### ✅ Test 3: Token Persistence
**Steps:**
1. After successful login, refresh the page
2. **Expected**: Stays logged in, no redirect to `/auth`

### ✅ Test 4: Already Authenticated User
**Steps:**
1. While logged in, manually navigate to `/auth`
2. **Expected**: Automatically redirects to `/project`

### ✅ Test 5: Token Expiry
**Steps:**
1. Login successfully
2. In browser console, modify token expiry:
```javascript
// Get current token
const token = localStorage.getItem('vajraopz_token');
const [payload, sig] = token.split('.');
const decoded = JSON.parse(atob(payload));

// Set expiry to past
decoded.exp = Math.floor(Date.now() / 1000) - 1000;

// Save expired token
const newPayload = btoa(JSON.stringify(decoded));
localStorage.setItem('vajraopz_token', `${newPayload}.${sig}`);
```
3. Refresh page
4. **Expected**: Redirects to `/auth` (token expired)

### ✅ Test 6: Invalid Token
**Steps:**
1. In browser console:
```javascript
localStorage.setItem('vajraopz_token', 'invalid-token-123');
```
2. Refresh page
3. **Expected**: Redirects to `/auth`

### ✅ Test 7: Logout Flow
**Steps:**
1. Login successfully
2. In browser console:
```javascript
// Simulate logout
localStorage.removeItem('vajraopz_token');
```
3. Navigate to any protected route (e.g., `/project`)
4. **Expected**: Redirects to `/auth`

### ✅ Test 8: Network Error Handling
**Steps:**
1. Stop the backend server
2. Try to login
3. **Expected**: Shows error message "Failed to initiate GitHub authentication"

### ✅ Test 9: OAuth Error Handling
**Steps:**
1. Manually visit: `http://localhost:3000/auth/callback?error=access_denied`
2. **Expected**: Shows error message "GitHub authentication failed"

### ✅ Test 10: Multiple Tabs
**Steps:**
1. Login in Tab 1
2. Open Tab 2 to `http://localhost:3000`
3. **Expected**: Tab 2 shows logged-in state (token from localStorage)

## Debugging

### Check Backend Health
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "vajraopz-backend",
  "mode": "local-development",
  "github_client_id": "Iv23liqkVfyeR5Wi86hU"
}
```

### Check Token in Browser
```javascript
// In browser console
const token = localStorage.getItem('vajraopz_token');
if (token) {
  const [payload] = token.split('.');
  const decoded = JSON.parse(atob(payload));
  console.log('User ID:', decoded.user_id);
  console.log('Issued At:', new Date(decoded.iat * 1000));
  console.log('Expires At:', new Date(decoded.exp * 1000));
  console.log('Is Expired:', decoded.exp < Date.now() / 1000);
}
```

### Check Auth State in Zustand
```javascript
// In browser console
const authState = JSON.parse(localStorage.getItem('vajraopz-auth-state'));
console.log('Auth State:', authState);
```

### Network Requests
Open DevTools > Network tab and filter by "graphql":

**GitHub Auth Request:**
```json
{
  "query": "query githubAuth { githubAuth { url state } }"
}
```

**GitHub Callback Request:**
```json
{
  "query": "mutation githubCallback($code: String!, $state: String!) { ... }",
  "variables": {
    "code": "abc123...",
    "state": "uuid-here"
  }
}
```

## Common Issues

### Issue: "Failed to initiate GitHub authentication"
**Cause**: Backend not running or wrong URL
**Fix**: 
```bash
# Check backend is running
curl http://localhost:3001/health

# Restart backend
cd backend/lambda/api
python dev_server.py
```

### Issue: "GitHub token exchange failed"
**Cause**: Invalid GitHub client secret
**Fix**: Check `backend/.env` has correct `GITHUB_CLIENT_SECRET`

### Issue: Redirect loop between /auth and /project
**Cause**: Corrupted token or state
**Fix**:
```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();
// Hard refresh
location.reload(true);
```

### Issue: Token parsing error
**Cause**: Old token format in localStorage
**Fix**:
```javascript
localStorage.removeItem('vajraopz_token');
localStorage.removeItem('vajraopz-auth-state');
```

## Success Criteria

All tests should pass with:
- ✅ Unauthenticated users redirect to `/auth`
- ✅ GitHub login works end-to-end
- ✅ Token persists across page refreshes
- ✅ Expired tokens trigger re-authentication
- ✅ Invalid tokens are rejected
- ✅ Error messages are user-friendly
- ✅ No console errors during normal flow

## Performance Checks

- Initial page load: < 2s
- Auth redirect: < 100ms
- GitHub OAuth: < 3s (depends on GitHub)
- Token validation: < 10ms

## Security Checks

- ✅ Token has expiry (24 hours)
- ✅ Token has HMAC signature
- ✅ CSRF state parameter used
- ✅ No credentials in console logs
- ✅ No credentials in URL after redirect
