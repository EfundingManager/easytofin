# Authentication Security Audit & Implementation Plan

## Current State Analysis

### 1. Session Management
**Current Implementation:**
- Session cookie: `app_session_id` (httpOnly, secure, sameSite=lax)
- Session stored in database via JWT
- Cookie domain: `.easytofin.com` (domain-based, not host-only)

**Issues Identified:**
- [ ] Session not regenerated on login (same session ID reused)
- [ ] No explicit session destruction on logout (only cookie cleared)
- [ ] No session invalidation in database on logout
- [ ] No token rotation or new token generation on login

### 2. Frontend State Management
**Current Implementation:**
- useAuth hook stores user in localStorage (`manus-runtime-user-info`)
- tRPC queries cached by React Query
- No explicit cache invalidation on logout

**Issues Identified:**
- [ ] localStorage not cleared on logout
- [ ] React Query cache not cleared on logout
- [ ] Old cached data may be visible briefly after logout
- [ ] No forced refetch after login

### 3. Redirect Strategy
**Current Implementation:**
- Uses wouter `setLocation()` for client-side navigation
- No full page reload after login/logout

**Issues Identified:**
- [ ] Client-side redirect allows cached state to persist
- [ ] Old tokens may still be in memory
- [ ] No guarantee of fresh session on redirect

### 4. Token/Session Lifecycle
**Current Implementation:**
- OAuth callback sets session cookie
- Email/phone auth sets session cookie
- Logout clears cookie

**Issues Identified:**
- [ ] No session ID rotation
- [ ] No token expiration handling
- [ ] No verification that new token is used after login
- [ ] No invalidation of old tokens

## Required Fixes

### Phase 1: Session Destruction on Logout
- [ ] Clear session cookie on server
- [ ] Invalidate/delete session in database
- [ ] Revoke any active tokens
- [ ] Clear any refresh tokens

### Phase 2: Session Regeneration on Login
- [ ] Generate new session ID
- [ ] Create new session record in database
- [ ] Issue new session cookie
- [ ] Invalidate old session if exists

### Phase 3: Frontend State Cleanup
- [ ] Clear localStorage on logout
- [ ] Clear React Query cache on logout
- [ ] Clear all application state
- [ ] Remove any stored tokens

### Phase 4: Force Fresh Data Fetch
- [ ] Invalidate all queries on login
- [ ] Force refetch of user profile
- [ ] Clear any prefetched data

### Phase 5: Token Verification
- [ ] Verify old token is no longer valid
- [ ] Verify new token is issued
- [ ] Test token rotation
- [ ] Verify token expiration

### Phase 6: Hard Redirects
- [ ] Use window.location.href for full page reload
- [ ] Ensure no client-side state persists
- [ ] Clear all in-memory data
- [ ] Force browser cache invalidation

## Implementation Checklist

### Backend Changes
- [ ] Update logout endpoint to destroy session in database
- [ ] Update login endpoints to regenerate session
- [ ] Add session invalidation logic
- [ ] Add token rotation logic
- [ ] Add session expiration handling

### Frontend Changes
- [ ] Update useAuth logout to clear all state
- [ ] Update logout redirect to use window.location.href
- [ ] Update login redirect to use window.location.href
- [ ] Clear localStorage on logout
- [ ] Clear React Query cache on logout
- [ ] Force query invalidation on login

### Testing
- [ ] Test logout destroys session
- [ ] Test login regenerates session
- [ ] Test old token is invalid after logout
- [ ] Test new token works after login
- [ ] Test frontend state is cleared
- [ ] Test hard redirect works
- [ ] Test no cached data persists

## Security Considerations

1. **Session Fixation Prevention** - Regenerate session ID on login
2. **Session Hijacking Prevention** - Invalidate old sessions on logout
3. **Token Leakage Prevention** - Clear tokens from memory on logout
4. **Cache Poisoning Prevention** - Clear all caches on logout
5. **Cross-Site Request Forgery** - Verify CSRF tokens if applicable
6. **Cross-Site Scripting** - Ensure httpOnly cookies prevent XSS access

## Timeline
- [ ] Phase 1-3: Backend and frontend changes (2 hours)
- [ ] Phase 4-5: Token verification and testing (1 hour)
- [ ] Phase 6: Hard redirects and final testing (1 hour)
- [ ] Total: ~4 hours
