# Gmail OAuth "Access blocked: Authorization Error" — Complete Troubleshooting Report

## Issue Summary
Users receive "Access blocked: Authorization Error" when attempting Gmail sign-in with message:
> "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy. If you're the app developer, register the JavaScript origin in the Google Cloud Console."

## Root Cause Analysis

### What We've Verified ✅
1. **OAuth Consent Screen**: In production status
2. **Branding Verification**: Verified by Google
3. **JavaScript Origins**: All domains added to Google Cloud Console
   - https://www.easytofin.com
   - https://easyfinserv-dmr4obss.manus.space
   - http://localhost:3000
4. **Client ID**: Correctly configured (455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com)
5. **Code Implementation**: Google Sign-In button properly initialized with callback handler

### Most Likely Remaining Causes

#### **CRITICAL: Redirect URI Mismatch** (90% probability)
Google requires **exact** match of redirect URIs. Even a single character difference causes this error.

**What to Check:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID (Web application)
3. Under **Authorized redirect URIs**, verify it shows **exactly**:
   ```
   https://www.easytofin.com/api/gmail/callback
   ```

**Common Mistakes:**
- ❌ Trailing slash: `https://www.easytofin.com/api/gmail/callback/`
- ❌ Wrong domain: `https://easyfinserv-dmr4obss.manus.space/api/gmail/callback`
- ❌ Missing /api: `https://www.easytofin.com/gmail/callback`
- ❌ HTTP instead of HTTPS: `http://www.easytofin.com/api/gmail/callback`
- ❌ Port number: `https://www.easytofin.com:443/api/gmail/callback`

#### **Secondary: OAuth Scopes**
Verify your OAuth app has these scopes configured:
- `openid`
- `email`
- `profile`

**To Check:**
1. Go to Google Cloud Console → OAuth consent screen
2. Click **Edit App**
3. Go to **Scopes** step
4. Ensure the three scopes above are included

#### **Tertiary: CORS/Origin Restrictions**
Some browsers enforce stricter CORS policies. Verify:
- All requests use HTTPS (not HTTP)
- No mixed content warnings
- Domain is publicly accessible (not localhost)

## Step-by-Step Resolution

### Step 1: Verify Redirect URI (MOST IMPORTANT)
```
Expected: https://www.easytofin.com/api/gmail/callback
```

1. Open Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Find and click your OAuth 2.0 Client ID
4. Copy the exact redirect URI shown
5. Compare character-by-character with above
6. If different, update it to match exactly
7. Click **Save**
8. **Wait 5-10 minutes** for changes to propagate

### Step 2: Verify OAuth Scopes
1. Go to **OAuth consent screen**
2. Click **Edit App**
3. Proceed through steps until **Scopes**
4. Verify `openid`, `email`, `profile` are included
5. Save changes

### Step 3: Clear Browser Cache
1. Open incognito/private window
2. Navigate to https://www.easytofin.com
3. Click "Client Login"
4. Click "Sign in with Email"
5. Click Google Sign-In button
6. Check for error

### Step 4: Verify Domain Accessibility
```bash
# Test from terminal
curl -I https://www.easytofin.com/api/gmail/callback
# Should return 404 (page not found) or redirect, NOT connection error
```

### Step 5: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for messages starting with `[Gmail]`
4. Expected sequence:
   - `[Gmail] Google Sign-In callback triggered`
   - `[Gmail] Decoding JWT credential...`
   - `[Gmail] Calling /api/gmail/callback endpoint...`

## Advanced Debugging

### Enable Detailed Logging
Add this to your browser console to see detailed flow:
```javascript
// In browser console
window.__GMAIL_DEBUG__ = true;
```

Then test Gmail login and check console for detailed logs.

### Test with Google OAuth 2.0 Playground
1. Go to https://developers.google.com/oauthplayground
2. Click **Settings** (gear icon)
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. Select scopes: `openid email profile`
6. Click **Authorize APIs**
7. If this works, your OAuth config is correct
8. If this fails, your Client ID/Secret or scopes are wrong

### Check Google Cloud Logs
1. Go to Google Cloud Console
2. Navigate to **Logging** → **Logs Explorer**
3. Filter by your OAuth Client ID
4. Look for error patterns
5. This shows exactly why Google rejected the request

## Implementation Details

### Current Configuration
- **Client ID**: 455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com
- **Production Domain**: https://www.easytofin.com
- **Callback Endpoint**: `/api/gmail/callback` (POST)
- **Frontend Component**: `client/src/pages/EmailAuth.tsx`
- **Backend Handler**: `server/_core/oauth.ts`

### Code Flow
```
1. User clicks "Sign in with Google" button
   ↓
2. Google Sign-In popup opens (window.google.accounts.id.initialize)
   ↓
3. User authenticates with Google
   ↓
4. Google returns JWT credential in callback
   ↓
5. Frontend decodes JWT (base64 decode)
   ↓
6. Frontend sends to /api/gmail/callback with:
   - googleId (sub claim)
   - email
   - name
   - picture
   - rememberDevice flag
   ↓
7. Backend creates/updates user
   ↓
8. Backend creates session token
   ↓
9. Backend returns redirect URL
   ↓
10. Frontend redirects to dashboard
```

## If Still Not Working

### Option A: Recreate OAuth Client (Nuclear Option)
If all above steps fail:
1. Create a new OAuth 2.0 Client ID in Google Cloud Console
2. Add all JavaScript origins
3. Add redirect URI: `https://www.easytofin.com/api/gmail/callback`
4. Update `VITE_GOOGLE_CLIENT_ID` environment variable
5. Restart dev server
6. Test again

### Option B: Contact Google Support
If issue persists:
1. Go to Google Cloud Console
2. Click **Support** in top menu
3. Create a support ticket with:
   - Project ID: skilled-axis-492209-m7
   - Client ID: 455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com
   - Error message received
   - Steps to reproduce
   - Screenshot of OAuth configuration

### Option C: Alternative: Use Email OTP Instead
If Gmail integration is blocking deployment, use email OTP as primary method:
- Users click "Sign in with Email"
- Enter email address
- Receive OTP via email
- Enter OTP to login
- This bypasses Google OAuth entirely

## Testing Checklist

- [ ] Redirect URI in Google Cloud Console matches exactly: `https://www.easytofin.com/api/gmail/callback`
- [ ] OAuth Consent Screen is in "Production"
- [ ] Scopes include: `openid`, `email`, `profile`
- [ ] All JavaScript origins are registered
- [ ] Tested in incognito/private window
- [ ] Tested on different browser
- [ ] Tested on different device/network
- [ ] Browser console shows no CORS errors
- [ ] Domain is publicly accessible
- [ ] HTTPS is enforced (no HTTP)
- [ ] Verified with Google OAuth 2.0 Playground

## Contact & Support

For additional help:
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Google Sign-In Docs**: https://developers.google.com/identity/gsi/web
- **Google Cloud Support**: https://cloud.google.com/support

---

**Last Updated**: 2026-04-16
**Status**: Awaiting redirect URI verification in Google Cloud Console
