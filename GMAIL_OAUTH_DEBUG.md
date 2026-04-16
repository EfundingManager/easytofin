# Gmail OAuth 2.0 "Access blocked: Authorization Error" Debugging Guide

## Issue
Users receive "Access blocked: Authorization Error" when attempting to sign in with Google, with message: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy."

## Root Causes & Solutions

### 1. **JavaScript Origin Not Registered** ✅ (Already Fixed)
- **Status**: All origins added to Google Cloud Console
- **Configured Origins**:
  - https://www.easytofin.com
  - https://easyfinserv-dmr4obss.manus.space
  - http://localhost:3000

### 2. **OAuth Consent Screen Configuration** ✅ (Verified)
- **Status**: In production
- **Verification**: Branding verified

### 3. **Potential Remaining Issues**

#### A. Redirect URI Mismatch
Check in Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Click your OAuth 2.0 Client ID
3. Verify **Authorized redirect URIs** includes:
   - `https://www.easytofin.com/api/gmail/callback`
   - `https://easyfinserv-dmr4obss.manus.space/api/gmail/callback`

#### B. OAuth Scopes
Verify your OAuth app has these scopes:
- `openid`
- `email`
- `profile`

To check/update:
1. Go to **APIs & Services** → **OAuth consent screen**
2. Click **Edit App**
3. Go to **Scopes** step
4. Ensure `openid`, `email`, `profile` are included

#### C. Client ID Verification
Verify the Client ID in your code matches Google Cloud:
```
VITE_GOOGLE_CLIENT_ID=455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com
```

### 4. **Browser Console Debugging Steps**

Open your browser's Developer Tools (F12) and follow these steps:

1. **Check for CORS Errors**
   - Open **Console** tab
   - Look for any red error messages
   - Check **Network** tab for failed requests

2. **Verify Google Script Loads**
   - In Console, run: `console.log(window.google?.accounts?.id)`
   - Should return an object, not `undefined`

3. **Check Button Rendering**
   - In Console, run: `document.getElementById('google-signin-button').innerHTML`
   - Should contain Google button HTML, not be empty

4. **Monitor Callback**
   - In Console, look for logs starting with `[Gmail]`
   - Should see: `Google Sign-In callback triggered`

### 5. **Testing Checklist**

- [ ] Clear browser cache and cookies
- [ ] Test in incognito/private window (no cached data)
- [ ] Test on different browser (Chrome, Firefox, Safari)
- [ ] Test on different device/network
- [ ] Verify domain is accessible (not localhost)
- [ ] Check browser console for errors
- [ ] Verify Google script loads: `https://accounts.google.com/gsi/client`

### 6. **If Still Not Working**

Try these advanced steps:

**Option A: Use Google's OAuth 2.0 Playground**
1. Go to https://developers.google.com/oauthplayground
2. Select your OAuth 2.0 Client ID
3. Test the authorization flow manually
4. This will tell you if the issue is with your Client ID or configuration

**Option B: Check Google Cloud Logs**
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Go to **Metrics** tab
4. Look for error patterns

**Option C: Recreate OAuth Client**
If all else fails:
1. Create a new OAuth 2.0 Client ID
2. Add all JavaScript origins
3. Add redirect URIs
4. Update VITE_GOOGLE_CLIENT_ID
5. Test again

## Implementation Details

### Current Configuration
- **Client ID**: 455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com
- **Redirect URI**: https://www.easytofin.com/api/gmail/callback
- **Callback Handler**: `/api/gmail/callback` (POST)
- **Frontend**: EmailAuth component with Google Sign-In button

### Code Flow
1. User clicks "Sign in with Google" button
2. Google Sign-In popup opens
3. User authenticates with Google
4. Google returns JWT credential
5. Frontend decodes JWT and sends to `/api/gmail/callback`
6. Backend creates/updates user and session
7. Backend returns redirect URL
8. Frontend redirects to dashboard

## Contact & Support

If the issue persists after checking all above items, please provide:
1. Browser console output (F12 → Console tab)
2. Network requests (F12 → Network tab, filter by XHR)
3. Google Cloud Console OAuth 2.0 Client ID configuration screenshot
4. Exact error message shown to user
