# Comprehensive Cookie and Authentication Issues Report

## Critical Issues Found

### 1. COOKIE DOMAIN MISMATCH ISSUE
**Severity:** CRITICAL - Causes Access Denied errors

**Root Cause:**
- Cookie domain is set using `x-forwarded-host` header which may return `*.manus.computer` on dev/preview
- When user logs in on preview domain, cookie is set for that domain
- When user navigates to actual domain (easytofin.com), cookie is not sent because domain doesn't match

**Current Code (cookies.ts):**
```typescript
const forwarded = req.get("x-forwarded-host") || req.hostname;
const baseDomain = forwarded.replace(/^www\./, "");
const domain = `.${baseDomain}`;
```

**Problem:**
- On live server: `x-forwarded-host` = `easytofin.com` → cookie domain = `.easytofin.com` ✓
- On preview: `x-forwarded-host` = `3000-xxx.manus.computer` → cookie domain = `.manus.computer` ✗
- When user logs in on preview and then accesses live domain, cookie doesn't transfer

**Solution:**
Need to detect if we're on a preview domain and use the actual production domain instead.

### 2. MULTIPLE COOKIE NAMES ISSUE
**Severity:** HIGH - Causes session confusion

**Cookies Used:**
1. `app_session_id` - Main session cookie (COOKIE_NAME)
2. `pending_2fa_session` - 2FA session cookie (PENDING_2FA_COOKIE_NAME)
3. `g_state` - Google OAuth state cookie (set by Google)

**Problem:**
- When user logs in, `app_session_id` is set
- If user needs 2FA, `pending_2fa_session` is also set
- But the main `app_session_id` is still active
- This can cause confusion about which session is active

**Current Flow:**
1. User enters email/OTP
2. Backend sets `app_session_id` cookie (line 254 in email-auth.ts)
3. If admin/manager/staff, backend also sets `pending_2fa_session` (line 290)
4. Frontend receives both cookies
5. When user accesses protected routes, which cookie is checked?

### 3. MISSING COOKIE IMPORT IN ROUTERS.TS
**Severity:** MEDIUM - Causes compilation errors

**Issue:**
- Line 57 in routers.ts uses `COOKIE_NAME` but it's not imported
- Should be: `import { COOKIE_NAME, ... } from "@shared/const";`

**Current Code:**
```typescript
ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
```

**Error:**
```
TS2304: Cannot find name 'COOKIE_NAME'
```

### 4. INCONSISTENT COOKIE CLEARING ON LOGOUT
**Severity:** HIGH - Causes session persistence issues

**Issue:**
- Logout clears `app_session_id` but not `pending_2fa_session`
- If user had 2FA session, it remains in browser
- Next login might use stale 2FA session

**Current Code (routers.ts line 57):**
```typescript
ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
```

**Missing:**
```typescript
ctx.res.clearCookie(PENDING_2FA_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
```

### 5. REACT ERROR #185 - MISSING HOOK IMPORTS
**Severity:** MEDIUM - Causes component crashes

**Affected Files:**
1. UserProfile.tsx - ✓ FIXED
2. EmailAuth.tsx - Had duplicate imports (fixed)
3. Other components may have similar issues

**Root Cause:**
- Components use `useState`/`useEffect` without importing from React
- Or have duplicate imports from multiple sources

### 6. COOKIE OPTIONS NOT CONSISTENT ACROSS ENDPOINTS
**Severity:** MEDIUM - Causes cookie handling inconsistencies

**Issue:**
- Some endpoints call `getSessionCookieOptions(req)` with request object
- Some endpoints call `getSessionCookieOptions(ctx.req)` with context request
- Some endpoints may not pass request at all

**Affected Endpoints:**
- `/api/gmail/callback` (line 45)
- `/api/oauth/callback` (line 97)
- `emailAuth.verifyOtp` (line 253)
- `phoneAuth.verifyOtp` (similar pattern)
- `auth.logout` (line 56)

### 7. VITE_FRONTEND_URL NOT SET
**Severity:** MEDIUM - Causes incorrect redirect URLs

**Issue:**
- Line 260 in email-auth.ts uses `process.env.VITE_FRONTEND_URL`
- This environment variable is not defined
- Falls back to hardcoded `https://easytofin.com`

**Current Code:**
```typescript
const dashboardUrl = `${process.env.VITE_FRONTEND_URL || "https://easytofin.com"}/dashboard`;
```

**Problem:**
- On preview server, should use preview URL, not production URL
- This causes incorrect email links

## Recommended Fixes (Priority Order)

### Fix 1: Add Missing COOKIE_NAME Import (CRITICAL)
```typescript
// routers.ts line 1
import { COOKIE_NAME, PENDING_2FA_COOKIE_NAME, ... } from "@shared/const";
```

### Fix 2: Clear All Cookies on Logout (HIGH)
```typescript
// routers.ts logout mutation
logout: publicProcedure.mutation(({ ctx }) => {
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  ctx.res.clearCookie(PENDING_2FA_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
  return { success: true } as const;
}),
```

### Fix 3: Improve Cookie Domain Detection (CRITICAL)
```typescript
// cookies.ts
function getCookieDomain(req: Request): string | undefined {
  const forwarded = req.get("x-forwarded-host") || req.hostname;
  
  // If on preview/development domain, don't set domain (host-only)
  if (forwarded.includes("manus.computer") || forwarded.includes("localhost")) {
    return undefined;
  }
  
  // For production domains, use domain-based cookies
  const baseDomain = forwarded.replace(/^www\./, "");
  return `.${baseDomain}`;
}
```

### Fix 4: Set VITE_FRONTEND_URL Environment Variable
```typescript
// Should be set in environment
VITE_FRONTEND_URL=https://easytofin.com  // production
VITE_FRONTEND_URL=https://3000-xxx.manus.computer  // preview
```

### Fix 5: Ensure Consistent Cookie Options Across All Endpoints
- All endpoints should use `getSessionCookieOptions(req)` consistently
- Verify all endpoints pass the request object correctly

### Fix 6: Add Cookie Validation Middleware
```typescript
// Verify cookies are being sent correctly
app.use((req, res, next) => {
  console.log("[Cookie Debug]", {
    hostname: req.hostname,
    forwarded: req.get("x-forwarded-host"),
    cookies: req.cookies,
    headers: req.headers.cookie,
  });
  next();
});
```

## Testing Checklist

After implementing fixes:

- [ ] Login on dev server (preview domain)
- [ ] Verify `app_session_id` cookie is set with correct domain
- [ ] Navigate to different pages - verify cookie is sent
- [ ] Logout - verify both cookies are cleared
- [ ] Login again - verify new session works
- [ ] Login on live server (easytofin.com)
- [ ] Verify cookie domain is `.easytofin.com`
- [ ] Access dashboard - verify no "Access Denied" error
- [ ] Test 2FA flow for admin role
- [ ] Verify 2FA cookie is cleared after 2FA completion or logout
- [ ] Test Gmail login
- [ ] Test quick re-login from post-logout page
- [ ] Verify no React errors in console
- [ ] Check browser DevTools cookies for correct domain/path/secure flags

## Summary

The main issues causing Access Denied and React errors are:

1. **Cookie domain mismatch** - cookies set for wrong domain on preview
2. **Missing imports** - COOKIE_NAME not imported in routers.ts
3. **Incomplete logout** - 2FA cookies not cleared
4. **Missing environment variables** - VITE_FRONTEND_URL not set
5. **React hook imports** - duplicate or missing imports in components

All of these are fixable with the recommended changes above.
