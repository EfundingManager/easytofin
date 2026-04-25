# Debug Endpoints Guide - Browser Console Instructions

## Overview

This guide shows you how to use the debug endpoints from your browser's developer console to diagnose session and authentication issues on the live server.

---

## Prerequisites

1. Open your browser on https://easytofin.com (or https://www.easytofin.com)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. You're now ready to run debug commands

---

## Debug Endpoint 1: Check Session Status

### Command

Copy and paste this into the browser console:

```javascript
fetch('/api/trpc/debug.sessionStatus').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### What It Does

This endpoint returns:
- **authenticated**: Whether you're currently logged in
- **user**: Your user info (id, email, name, role) if logged in
- **headers**: Cookie headers received by the server
- **server**: Hostname and forwarded headers
- **environment**: Environment variables (VITE_APP_URL, etc.)

### Expected Output (If Logged In)

```json
{
  "result": {
    "data": {
      "timestamp": "2026-04-25T11:00:00.000Z",
      "authenticated": true,
      "user": {
        "id": 720001,
        "email": "ciku203@outlook.com",
        "name": "EASY TOF",
        "role": "user"
      },
      "headers": {
        "cookie": "app_session_id=abc123def456...",
        "origin": "https://easytofin.com",
        "referer": "https://easytofin.com/user/dashboard",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
      },
      "server": {
        "hostname": "easytofin.com",
        "xForwardedHost": "easytofin.com",
        "xForwardedProto": "https"
      },
      "environment": {
        "nodeEnv": "production",
        "appUrl": "https://easytofin.com",
        "frontendUrl": "https://easytofin.com"
      }
    }
  }
}
```

### Expected Output (If NOT Logged In)

```json
{
  "result": {
    "data": {
      "timestamp": "2026-04-25T11:00:00.000Z",
      "authenticated": false,
      "user": null,
      "headers": {
        "cookie": "no cookies",
        "origin": "https://easytofin.com",
        "referer": null,
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
      },
      "server": {
        "hostname": "easytofin.com",
        "xForwardedHost": "easytofin.com",
        "xForwardedProto": "https"
      },
      "environment": {
        "nodeEnv": "production",
        "appUrl": "https://easytofin.com",
        "frontendUrl": "https://easytofin.com"
      }
    }
  }
}
```

### What to Look For

- **"authenticated": false** + **"cookie": "no cookies"** → Session cookie not being sent
- **"authenticated": false** + **"cookie": "app_session_id=..."** → Cookie sent but session invalid
- **"authenticated": true** → Session is working correctly
- **"hostname"** mismatch → Domain configuration issue

---

## Debug Endpoint 2: Check Session Cookie Details

### Command

Copy and paste this into the browser console:

```javascript
fetch('/api/trpc/debug.checkSessionCookie').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### What It Does

This endpoint returns:
- **sessionCookiePresent**: Whether the app_session_id cookie exists
- **sessionCookieValue**: First 20 characters of the cookie (for verification)
- **allCookies**: List of all cookies sent to the server
- **rawCookieHeader**: Raw cookie header from the request
- **hostname**: The hostname the request came from
- **protocol**: HTTP or HTTPS
- **isSecure**: Whether the connection is secure

### Expected Output (If Cookie Present)

```json
{
  "result": {
    "data": {
      "timestamp": "2026-04-25T11:00:00.000Z",
      "sessionCookiePresent": true,
      "sessionCookieValue": "eyJhbGciOiJIUzI1NiIs...",
      "allCookies": ["app_session_id"],
      "rawCookieHeader": "app_session_id=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "hostname": "easytofin.com",
      "protocol": "https",
      "isSecure": true
    }
  }
}
```

### Expected Output (If Cookie Missing)

```json
{
  "result": {
    "data": {
      "timestamp": "2026-04-25T11:00:00.000Z",
      "sessionCookiePresent": false,
      "sessionCookieValue": null,
      "allCookies": [],
      "rawCookieHeader": "",
      "hostname": "easytofin.com",
      "protocol": "https",
      "isSecure": true
    }
  }
}
```

### What to Look For

- **"sessionCookiePresent": false** → Cookie not being sent by browser
- **"allCookies": []** → No cookies at all being sent
- **"hostname"**: Should match the domain you're accessing (easytofin.com or www.easytofin.com)
- **"isSecure": false** → HTTPS not being detected (potential issue)

---

## Debug Endpoint 3: Verify Session Validity

### Command

Copy and paste this into the browser console:

```javascript
fetch('/api/trpc/debug.verifySession').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### What It Does

This endpoint attempts to validate the current session and returns:
- **valid**: Whether the session is valid
- **reason**: Explanation of the result
- **authenticated**: Whether user is authenticated
- **user**: User details if authenticated

### Expected Output (If Valid)

```json
{
  "result": {
    "data": {
      "valid": true,
      "reason": "Session is valid",
      "authenticated": true,
      "user": {
        "id": 720001,
        "email": "ciku203@outlook.com"
      }
    }
  }
}
```

### Expected Output (If Invalid)

```json
{
  "result": {
    "data": {
      "valid": false,
      "reason": "No session cookie found",
      "authenticated": false,
      "user": null
    }
  }
}
```

---

## Troubleshooting Flowchart

Use these debug endpoints in order to identify the issue:

### Step 1: Run `debug.sessionStatus`

**Question:** Is "authenticated" true?

- **YES** → Session is working! Skip to Step 4
- **NO** → Continue to Step 2

### Step 2: Run `debug.checkSessionCookie`

**Question:** Is "sessionCookiePresent" true?

- **YES** → Cookie is being sent but session is invalid. This is a session validation issue.
  - **Action:** Check server logs for session validation errors
  - **Possible cause:** Session expired, token invalid, or database issue

- **NO** → Cookie is not being sent. This is a cookie issue.
  - Continue to Step 3

### Step 3: Check Browser Cookies

Open Developer Tools → **Application** tab → **Cookies** → Select **https://easytofin.com**

**Question:** Do you see "app_session_id" cookie?

- **YES** → Cookie exists in browser but not being sent
  - **Possible causes:**
    - Cookie domain mismatch (set for `.easytofin.com` but accessing `www.easytofin.com`)
    - Cookie path issue
    - Cookie expired
  - **Action:** Check cookie properties (Domain, Path, Expires)

- **NO** → Cookie was never set during login
  - **Possible causes:**
    - Login didn't complete successfully
    - Cookie setting failed on server
    - Browser rejected the cookie
  - **Action:** Try logging in again and immediately check for the cookie

### Step 4: Session is Working

If you reach here with "authenticated": true, the session is working correctly. The Access Denied error might be due to:
- Page not loading properly
- JavaScript error in the app
- Route protection issue
- Browser cache issue (try Ctrl+Shift+Delete to clear cache)

---

## Common Issues and Solutions

### Issue: "sessionCookiePresent": false + "authenticated": false

**Problem:** Session cookie not being sent to server

**Solutions:**
1. Check if cookie exists in browser (Application → Cookies)
2. If cookie exists:
   - Check cookie Domain property (should be `.easytofin.com` or exact domain)
   - Check cookie Path property (should be `/`)
   - Check if cookie is expired
   - Try accessing from exact same domain (if on www.easytofin.com, try easytofin.com)
3. If cookie doesn't exist:
   - Try logging in again
   - Check browser console for errors
   - Try incognito/private browsing mode

### Issue: "sessionCookiePresent": true + "authenticated": false

**Problem:** Cookie is sent but session is invalid

**Solutions:**
1. Session may have expired (try logging in again)
2. Server-side session validation error (check server logs)
3. Database connection issue (check server logs)
4. Token format issue (check server logs)

### Issue: "hostname" doesn't match your domain

**Problem:** Server is receiving wrong hostname

**Solutions:**
1. Check if you're accessing correct domain
2. Check x-forwarded-host header (should match your domain)
3. This might indicate a proxy/load balancer configuration issue
4. Contact support if issue persists

---

## Advanced Debugging: Check Browser Cookies Directly

### View All Cookies

Open Developer Tools → **Application** tab → **Cookies** → Select **https://easytofin.com**

Look for:
- **Name:** app_session_id
- **Value:** Long JWT-like string
- **Domain:** Should be `.easytofin.com` or `easytofin.com`
- **Path:** Should be `/`
- **Expires/Max-Age:** Should be in the future
- **HttpOnly:** Should be checked (✓)
- **Secure:** Should be checked (✓) for HTTPS
- **SameSite:** Should be `Lax` or `Strict`

### Delete Test Cookie

If you ran the `debug.testCookie` endpoint, you can delete the test cookie:

1. Open Developer Tools → **Application** → **Cookies**
2. Find `test-cookie`
3. Right-click and select **Delete**

---

## Getting Help

If you're still experiencing issues after running these debug commands:

1. **Take a screenshot** of the debug output
2. **Note the values** for:
   - authenticated (true/false)
   - sessionCookiePresent (true/false)
   - hostname
   - isSecure
3. **Check server logs** for any error messages
4. **Contact support** with this information

---

## Quick Reference: Copy-Paste Commands

### Check Session Status
```javascript
fetch('/api/trpc/debug.sessionStatus').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### Check Session Cookie
```javascript
fetch('/api/trpc/debug.checkSessionCookie').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### Verify Session
```javascript
fetch('/api/trpc/debug.verifySession').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

### Set Test Cookie
```javascript
fetch('/api/trpc/debug.testCookie').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
```

---

## Next Steps After Debugging

Once you've identified the issue using these endpoints:

1. **Share the debug output** with the development team
2. **Describe what you found** (e.g., "cookie not being sent", "session invalid", etc.)
3. **Include any error messages** from the browser console
4. **Provide steps to reproduce** the issue
5. The team will implement a targeted fix based on the diagnosis

---

## Security Note

These debug endpoints are public and don't require authentication. They're designed for troubleshooting only. In production, consider:
- Restricting access to these endpoints (admin only)
- Disabling them after troubleshooting
- Adding rate limiting to prevent abuse
