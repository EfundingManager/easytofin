# Authentication Flow and Cookie Analysis

## 1. Login Workflows

### 1.1 Email/Phone Login Flow
1. User enters email/phone on `/email-auth` or `/phone-auth`
2. System sends OTP to user
3. User enters OTP code
4. Backend verifies OTP and creates session
5. Session cookie (`app_session_id`) is set
6. User is redirected to dashboard based on role

**Cookies Involved:**
- `app_session_id` - Main session cookie

### 1.2 Gmail/Google OAuth Flow
1. User clicks "Sign in with Google" on `/email-auth`
2. Google OAuth dialog opens
3. User authenticates with Google
4. Browser redirects to `/auth/google/callback`
5. Backend verifies Google token and creates session
6. Session cookie is set
7. User is redirected to dashboard

**Cookies Involved:**
- `g_state` - Google state management cookie
- `app_session_id` - Main session cookie

### 1.3 Two-Factor Authentication (Admin/Manager/Support)
1. User logs in with email/phone
2. System detects admin/manager/support role
3. User is redirected to `/2fa` page
4. User receives SMS OTP
5. User enters OTP
6. Backend verifies OTP and updates session
7. User is redirected to role-specific dashboard

**Cookies Involved:**
- `app_session_id` - Session cookie (may need special handling during 2FA)

## 2. Logout Workflow

1. User clicks "Logout" button
2. Logout confirmation dialog appears
3. User confirms logout
4. Backend clears session
5. Frontend clears auth cache
6. User is redirected to `/post-logout`
7. Post-logout page shows quick re-login option

**Cookies Involved:**
- `app_session_id` - Should be cleared/invalidated
- localStorage - User info is retained for quick re-login

## 3. Cookie Configuration Issues

### Current Configuration (cookies.ts)
```typescript
domain: `.${baseDomain}` // e.g., .easytofin.com
secure: true // For production
httpOnly: true
sameSite: "lax"
path: "/"
```

### Potential Issues
1. **Domain Mismatch**: Cookie set for `.easytofin.com` but accessed from `www.easytofin.com` or vice versa
2. **Secure Flag**: May not work correctly if HTTPS is not enforced
3. **SameSite Policy**: "lax" may cause issues with OAuth redirects from different origins
4. **Path Mismatch**: Cookie path "/" should match all routes

## 4. React Error #185 Root Causes

React error #185 typically indicates:
- Missing React hooks imports (useState, useEffect)
- Calling hooks conditionally
- Calling hooks outside of React components
- Duplicate hook imports

**Affected Files:**
- UserProfile.tsx - Fixed with useState/useEffect imports
- EmailAuth.tsx - May have duplicate imports

## 5. Access Denied Root Causes

Access Denied errors occur when:
1. Session cookie is not sent by browser
2. Session cookie is invalid or expired
3. Backend cannot verify session
4. Cookie domain/path doesn't match request

**Common Scenarios:**
- User logs in on `easytofin.com`, then accesses `www.easytofin.com`
- User logs in, then navigates to different domain variant
- Session cookie expires during navigation
- Cookie is set but not sent back in subsequent requests

## 6. Recommended Fixes

### 6.1 Cookie Domain Fix
- Use `.easytofin.com` format to allow both www and non-www variants
- Ensure x-forwarded-host header is used to get actual domain

### 6.2 Session Persistence Fix
- Verify session cookie is being sent in all requests
- Add logging to track cookie presence in requests
- Ensure credentials: "include" is set in tRPC client

### 6.3 React Error Fix
- Audit all components for proper hook imports
- Ensure hooks are called at top level
- Remove duplicate imports
- Add proper TypeScript types for components

### 6.4 OAuth Flow Fix
- Ensure redirect URIs match exactly in Google Cloud Console
- Use consistent domain in OAuth callback
- Handle OAuth state parameter correctly

## 7. Testing Checklist

- [ ] Login with email on easytofin.com
- [ ] Access dashboard from www.easytofin.com
- [ ] Login with Gmail
- [ ] Verify 2FA flow for admin role
- [ ] Logout and verify post-logout page
- [ ] Quick re-login from post-logout page
- [ ] Verify no React errors in console
- [ ] Check all cookies in browser DevTools
- [ ] Test on both www and non-www variants
- [ ] Verify session persistence across page refreshes
