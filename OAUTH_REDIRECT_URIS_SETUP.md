# OAuth 2.0 Redirect URIs Configuration Guide

## Overview

This guide provides the exact redirect URIs that must be configured in Google Cloud Console for the EasyToFin application to work correctly on the live server.

---

## Live Server Redirect URIs

### Primary Domain (easytofin.com)

Add these URIs to your Google Cloud Console OAuth 2.0 Client:

```
https://easytofin.com/auth/google/callback
https://easytofin.com/auth/email/callback
https://easytofin.com/auth/phone/callback
```

### WWW Subdomain (www.easytofin.com)

Add these URIs to support the www subdomain:

```
https://www.easytofin.com/auth/google/callback
https://www.easytofin.com/auth/email/callback
https://www.easytofin.com/auth/phone/callback
```

### Development/Preview Server

For development and testing (if needed):

```
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/google/callback
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/email/callback
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/phone/callback
```

---

## Step-by-Step Configuration in Google Cloud Console

### 1. Navigate to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**

### 2. Find Your OAuth 2.0 Client ID

1. Look for "OAuth 2.0 Client IDs" section
2. Find your Client ID for "Web application" type
3. Click on it to edit

### 3. Add Authorized Redirect URIs

1. In the "Authorized redirect URIs" section, click **Add URI**
2. Add each of the following URIs (one at a time):

#### For Live Server (Production):
```
https://easytofin.com/auth/google/callback
https://www.easytofin.com/auth/google/callback
https://easytofin.com/auth/email/callback
https://www.easytofin.com/auth/email/callback
https://easytofin.com/auth/phone/callback
https://www.easytofin.com/auth/phone/callback
```

#### For Development (Optional):
```
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/google/callback
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/email/callback
https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/auth/phone/callback
```

### 4. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select "External" for user type
3. Fill in the required information:
   - **App name:** EasyToFin Financial Services
   - **User support email:** info@easytofin.com
   - **Developer contact:** your-email@easytofin.com
4. Add scopes (if needed):
   - `email`
   - `profile`
   - `openid`
5. Add test users (if in development)
6. Publish the app

### 5. Save Changes

1. Click **Save** after adding all redirect URIs
2. Verify all URIs are listed correctly
3. Note your Client ID and Client Secret (keep these secure!)

---

## Environment Variables

Ensure these environment variables are set in your deployment:

```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=<your-client-id-from-google-console>

# Application URLs
VITE_APP_URL=https://easytofin.com
VITE_FRONTEND_URL=https://easytofin.com
```

---

## Testing the Configuration

### 1. Test on Dev Server

1. Navigate to https://3000-i79ro07pic5u84ngr4vjx-3822f075.us1.manus.computer/
2. Click "Client Login" or "Get a Quote"
3. Select "Gmail" or "Google" login option
4. Verify you can complete the OAuth flow
5. Check that you're redirected back to the app after login

### 2. Test on Live Server

1. Navigate to https://easytofin.com/
2. Click "Client Dashboard" or "Get a Quote"
3. Select "Gmail" or "Google" login option
4. Verify you can complete the OAuth flow
5. Check that you're redirected back to the app after login

### 3. Test with www Subdomain

1. Navigate to https://www.easytofin.com/
2. Repeat the same login flow
3. Verify it works with the www subdomain

---

## Common Issues and Solutions

### Issue: "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy"

**Causes:**
1. Redirect URI not registered in Google Cloud Console
2. Redirect URI doesn't match exactly (including protocol and domain)
3. OAuth consent screen not published
4. App not verified by Google (for sensitive scopes)

**Solutions:**
1. ✅ Add all redirect URIs listed above to Google Cloud Console
2. ✅ Ensure URIs match exactly (https:// not http://, exact domain spelling)
3. ✅ Publish the OAuth consent screen
4. ✅ If using sensitive scopes, request app verification from Google

### Issue: Redirect URI Mismatch

**Error:** "The redirect_uri parameter does not match the registered redirect URIs"

**Solution:**
1. Check that the redirect URI in the error message matches exactly one of the registered URIs
2. Verify protocol (https:// vs http://)
3. Verify domain spelling (no typos)
4. Verify path (should be `/auth/google/callback`)
5. Check for trailing slashes or extra parameters

### Issue: Localhost Testing

**Note:** Google doesn't allow `http://localhost` for production apps. For local testing:
1. Use the dev server URL provided above, OR
2. Use a tool like ngrok to expose localhost with HTTPS, OR
3. Add `http://localhost:3000` to redirect URIs for development only

---

## Security Considerations

1. **Keep Client Secret Safe:** Never commit your Client Secret to version control
2. **Use HTTPS Only:** All redirect URIs must use HTTPS for production
3. **Validate Redirect URIs:** Only add URIs you control
4. **Rotate Credentials:** Periodically rotate your Client ID and Secret
5. **Monitor Usage:** Check Google Cloud Console for suspicious activity

---

## Checklist for Live Server Deployment

- [ ] Google Cloud Console OAuth 2.0 Client created
- [ ] All redirect URIs added to Google Cloud Console
- [ ] OAuth consent screen configured and published
- [ ] VITE_GOOGLE_CLIENT_ID environment variable set
- [ ] VITE_APP_URL environment variable set to https://easytofin.com
- [ ] VITE_FRONTEND_URL environment variable set to https://easytofin.com
- [ ] Tested login flow on dev server
- [ ] Tested login flow on live server (easytofin.com)
- [ ] Tested login flow on www subdomain (www.easytofin.com)
- [ ] Verified no "OAuth 2.0 policy" errors
- [ ] Verified users can complete login and access dashboard

---

## Support

If you encounter issues:

1. Check the error message in browser console (F12 → Console tab)
2. Verify all redirect URIs are correctly configured
3. Ensure OAuth consent screen is published
4. Check that environment variables are set correctly
5. Review Google Cloud Console logs for detailed error information

For additional help, contact Google Cloud Support or refer to the [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2).
