# Gmail Sign-In Test Plan

## Overview
This document outlines comprehensive testing for the Gmail OAuth sign-in flow in EasyToFin, covering happy paths, edge cases, error scenarios, and security considerations.

---

## 1. Happy Path Tests

### 1.1 New User Registration via Gmail
**Objective:** Verify that a new Gmail user can successfully register and be created in the system.

**Preconditions:**
- User has a valid Gmail account
- User is not yet registered in EasyToFin
- Browser has no active session

**Steps:**
1. Navigate to `/email-auth`
2. Click "Sign in with Email" button
3. Click Google Sign-In button
4. Complete Google authentication flow
5. Authorize EasyToFin to access basic profile

**Expected Results:**
- ✅ User is created in `phoneUsers` table with:
  - `googleId` = Google account ID
  - `email` = Gmail address
  - `name` = Google profile name
  - `role` = "user"
  - `clientStatus` = "queue"
  - `loginMethod` = "google"
  - `emailVerified` = true
- ✅ Session cookie is set (HTTP-only, Secure, SameSite=Lax)
- ✅ User is redirected to `/user/:id` (dashboard)
- ✅ User can access protected pages
- ✅ User profile displays correct information

**Test Data:**
```
Gmail: testuser@gmail.com
Name: Test User
Google ID: 123456789
```

---

### 1.2 Existing User Login via Gmail
**Objective:** Verify that an existing Gmail user can log in successfully.

**Preconditions:**
- User already exists in database with same `googleId`
- Browser has no active session

**Steps:**
1. Navigate to `/email-auth`
2. Click "Sign in with Email"
3. Click Google Sign-In button
4. Complete Google authentication
5. Authorize access

**Expected Results:**
- ✅ User is retrieved from database (not created)
- ✅ Session cookie is updated/refreshed
- ✅ User is redirected to appropriate dashboard
- ✅ User can access all previous data and settings
- ✅ No duplicate user records created

**Test Data:**
```
Gmail: existinguser@gmail.com
Google ID: 987654321
```

---

### 1.3 Admin User Login via Gmail (with 2FA)
**Objective:** Verify that admin/manager/staff users are prompted for 2FA after Gmail login.

**Preconditions:**
- User exists with role = "admin", "manager", or "staff"
- User has phone number registered
- Browser has no active session

**Steps:**
1. Navigate to `/email-auth`
2. Click "Sign in with Email"
3. Click Google Sign-In button
4. Complete Google authentication
5. System detects privileged role
6. Receive SMS OTP
7. Enter OTP code
8. Complete 2FA verification

**Expected Results:**
- ✅ Gmail authentication succeeds
- ✅ Pending token is generated (10-minute expiration)
- ✅ User is redirected to 2FA verification page
- ✅ SMS OTP is sent to registered phone
- ✅ OTP verification succeeds
- ✅ Session cookie is created
- ✅ User is redirected to `/admin` dashboard
- ✅ User has full admin access

**Test Data:**
```
Gmail: manager@easytofin.com
Role: super_admin
Phone: +353 87 123 4567
```

---

### 1.4 Regular User to Customer Upgrade
**Objective:** Verify redirect behavior when user status changes from queue to customer.

**Preconditions:**
- User exists with `clientStatus` = "customer"
- User has assigned policy number
- Browser has no active session

**Steps:**
1. Navigate to `/email-auth`
2. Complete Gmail sign-in flow
3. System checks user status

**Expected Results:**
- ✅ User is redirected to `/customer/:id` (not `/user/:id`)
- ✅ Customer dashboard is displayed
- ✅ Policy information is visible
- ✅ User has customer-specific permissions

---

## 2. Edge Cases

### 2.1 Multiple Gmail Accounts with Same Email
**Objective:** Verify system handles multiple Google accounts linked to same email.

**Preconditions:**
- User has multiple Gmail accounts
- Both accounts have same recovery email

**Steps:**
1. Sign in with first Gmail account
2. Log out
3. Sign in with second Gmail account (same email)
4. System should differentiate by `googleId`

**Expected Results:**
- ✅ System creates separate user records (different `googleId`)
- ✅ Each account has independent session
- ✅ No data mixing between accounts
- ✅ User can switch between accounts

**Test Data:**
```
Account 1: user.name@gmail.com (Google ID: 111111)
Account 2: user.name@gmail.com (Google ID: 222222)
```

---

### 2.2 Gmail Account with Special Characters in Name
**Objective:** Verify system handles names with special characters, accents, emojis.

**Preconditions:**
- User has Gmail account with special characters in name

**Steps:**
1. Sign in via Gmail with special name
2. Check database storage
3. Verify display in UI

**Expected Results:**
- ✅ Name is stored correctly in database
- ✅ Name displays correctly in UI
- ✅ No encoding issues
- ✅ Search functionality works

**Test Data:**
```
Names to test:
- "José García"
- "François Müller"
- "李明"
- "Jean-Pierre O'Brien"
- "María José de la Cruz"
```

---

### 2.3 Gmail Account with Very Long Name
**Objective:** Verify system handles unusually long names.

**Preconditions:**
- User has Gmail account with very long name

**Steps:**
1. Sign in with long name (>100 characters)
2. Check database storage
3. Verify UI display

**Expected Results:**
- ✅ Name is truncated or stored completely (per schema)
- ✅ No database errors
- ✅ UI displays gracefully (truncated or wrapped)
- ✅ No overflow issues

**Test Data:**
```
Long Name: "This Is A Very Long Name That Someone Might Have In Their Google Account Profile"
```

---

### 2.4 Gmail Account with No Profile Picture
**Objective:** Verify system handles missing profile picture gracefully.

**Preconditions:**
- User has Gmail account without profile picture

**Steps:**
1. Sign in via Gmail
2. Check if picture is stored
3. Verify UI shows default avatar

**Expected Results:**
- ✅ System handles null/undefined picture
- ✅ Default avatar is displayed
- ✅ No broken image links
- ✅ UI remains functional

---

### 2.5 Rapid Successive Login Attempts
**Objective:** Verify system handles rapid consecutive logins.

**Preconditions:**
- User account exists

**Steps:**
1. Sign in via Gmail
2. Immediately sign out
3. Sign in again (within 1 second)
4. Repeat 5 times rapidly

**Expected Results:**
- ✅ No session conflicts
- ✅ Latest session is valid
- ✅ Previous sessions are invalidated
- ✅ No database corruption
- ✅ No duplicate records created

---

### 2.6 Sign-In with Weak Network Connection
**Objective:** Verify system handles network interruptions during sign-in.

**Preconditions:**
- Network throttling enabled (3G or slower)

**Steps:**
1. Navigate to `/email-auth`
2. Click Google Sign-In button
3. Simulate network interruption mid-authentication
4. Attempt to recover

**Expected Results:**
- ✅ User sees appropriate error message
- ✅ User can retry sign-in
- ✅ No partial session created
- ✅ No orphaned database records

---

### 2.7 Sign-In Across Different Devices
**Objective:** Verify user can sign in from multiple devices independently.

**Preconditions:**
- User has access to multiple devices

**Steps:**
1. Sign in on Device A
2. Sign in on Device B (simultaneously)
3. Verify independent sessions
4. Log out on Device A
5. Verify Device B session still valid

**Expected Results:**
- ✅ Each device has independent session
- ✅ Logout on one device doesn't affect others
- ✅ Session cookies are device-specific
- ✅ No session conflicts

---

## 3. Error Scenarios

### 3.1 Missing Google Credentials
**Objective:** Verify system rejects sign-in without valid Google credentials.

**Steps:**
1. Intercept Google Sign-In response
2. Remove `credential` field
3. Attempt to process

**Expected Results:**
- ✅ Error message: "Google Sign-in failed"
- ✅ No user record created
- ✅ No session cookie set
- ✅ User remains on login page

---

### 3.2 Invalid Google JWT Token
**Objective:** Verify system rejects malformed JWT tokens.

**Steps:**
1. Intercept Google Sign-In response
2. Modify JWT token (corrupt payload)
3. Attempt to process

**Expected Results:**
- ✅ JWT decoding fails gracefully
- ✅ Error message displayed: "Google Sign-in failed"
- ✅ No user record created
- ✅ No security breach

---

### 3.3 Missing Required Fields in JWT
**Objective:** Verify system validates all required fields.

**Test Cases:**
- Missing `email` field
- Missing `sub` (Google ID) field
- Missing `name` field
- Missing `picture` field

**Expected Results for each:**
- ✅ Email missing: Error "Invalid email"
- ✅ Google ID missing: Error "Invalid credentials"
- ✅ Name missing: Use email as fallback
- ✅ Picture missing: Use default avatar

---

### 3.4 Database Connection Failure
**Objective:** Verify graceful handling of database errors.

**Preconditions:**
- Database connection is down or unavailable

**Steps:**
1. Attempt Gmail sign-in
2. System tries to create/retrieve user
3. Database query fails

**Expected Results:**
- ✅ Error message: "Login failed, please try again"
- ✅ No partial session created
- ✅ Error is logged for debugging
- ✅ User can retry when DB is available

---

### 3.5 Session Token Generation Failure
**Objective:** Verify handling of session token creation errors.

**Preconditions:**
- Session token service is unavailable

**Steps:**
1. Complete Gmail authentication
2. System attempts to create session token
3. Token service fails

**Expected Results:**
- ✅ Error message displayed
- ✅ User is not logged in
- ✅ No partial session state
- ✅ User can retry

---

### 3.6 Gmail API Rate Limiting
**Objective:** Verify system handles Google API rate limits.

**Steps:**
1. Simulate Google API returning 429 (Too Many Requests)
2. Attempt sign-in

**Expected Results:**
- ✅ Error message: "Too many requests, please try again later"
- ✅ User can retry after cooldown
- ✅ No infinite loops

---

### 3.7 Expired Pending Token (2FA)
**Objective:** Verify 2FA pending token expiration handling.

**Preconditions:**
- Admin user completes Gmail auth
- Pending token is generated
- 10+ minutes pass

**Steps:**
1. Attempt to verify OTP with expired token
2. System checks token expiration

**Expected Results:**
- ✅ Error: "Session expired, please sign in again"
- ✅ User must restart sign-in flow
- ✅ No stale sessions remain

---

## 4. Security Tests

### 4.1 Session Cookie Security
**Objective:** Verify session cookies have proper security attributes.

**Test:**
```javascript
// Check cookie attributes
- httpOnly: true (prevents XSS access)
- secure: true (HTTPS only)
- sameSite: 'lax' (CSRF protection)
- maxAge: 1 year
```

**Expected Results:**
- ✅ All security flags are set
- ✅ Cookie cannot be accessed via JavaScript
- ✅ Cookie only sent over HTTPS
- ✅ CSRF protection enabled

---

### 4.2 JWT Token Validation
**Objective:** Verify JWT tokens are properly validated.

**Test Cases:**
- ✅ Valid token from Google
- ❌ Token signed with wrong key
- ❌ Token with altered payload
- ❌ Expired token
- ❌ Token from untrusted source

**Expected Results:**
- ✅ Valid tokens accepted
- ✅ Invalid tokens rejected
- ✅ No security bypass possible

---

### 4.3 CSRF Protection
**Objective:** Verify CSRF protection on Gmail callback.

**Steps:**
1. Attempt to call `/api/gmail/callback` from different origin
2. Verify request is rejected

**Expected Results:**
- ✅ CORS headers properly configured
- ✅ Cross-origin requests rejected
- ✅ Same-origin requests allowed

---

### 4.4 SQL Injection Prevention
**Objective:** Verify system is protected against SQL injection.

**Test Data:**
```
Email: "test@gmail.com'; DROP TABLE users; --"
Name: "'; DELETE FROM phoneUsers; --"
Google ID: "1' OR '1'='1"
```

**Expected Results:**
- ✅ All inputs are properly escaped
- ✅ No SQL injection possible
- ✅ Data is safely stored

---

### 4.5 XSS Prevention
**Objective:** Verify system prevents XSS attacks.

**Test Data:**
```
Name: "<script>alert('XSS')</script>"
Email: "test@gmail.com<img src=x onerror='alert(1)'>"
```

**Expected Results:**
- ✅ Scripts are escaped/sanitized
- ✅ No JavaScript execution
- ✅ Data displayed as plain text

---

### 4.6 Privilege Escalation Prevention
**Objective:** Verify users cannot escalate privileges.

**Steps:**
1. Sign in as regular user
2. Attempt to modify role in request/response
3. Try to access admin endpoints

**Expected Results:**
- ✅ Role cannot be modified via client
- ✅ Admin endpoints reject regular users
- ✅ Server-side role validation enforced

---

## 5. Integration Tests

### 5.1 Gmail Sign-In → Profile Completion
**Objective:** Verify complete flow from login to profile setup.

**Steps:**
1. Sign in via Gmail
2. Redirect to profile page
3. Complete profile information
4. Submit profile
5. Redirect to dashboard

**Expected Results:**
- ✅ All redirects work correctly
- ✅ Profile data is saved
- ✅ User can access dashboard
- ✅ Profile information is persistent

---

### 5.2 Gmail Sign-In → Admin Dashboard
**Objective:** Verify admin users can access admin dashboard after 2FA.

**Steps:**
1. Admin signs in via Gmail
2. Complete 2FA verification
3. Redirect to admin dashboard
4. Verify all admin features accessible

**Expected Results:**
- ✅ Admin dashboard loads
- ✅ All tabs visible (Overview, Email Blaster, etc.)
- ✅ Admin functions work correctly

---

### 5.3 Gmail Sign-In → Email Verification
**Objective:** Verify email verification flow after Gmail login.

**Steps:**
1. Sign in via Gmail
2. Email is auto-verified (Gmail is trusted)
3. Check email verification status

**Expected Results:**
- ✅ `emailVerified` = true in database
- ✅ No email verification email sent
- ✅ User can access all features

---

### 5.4 Gmail Sign-In → Document Upload
**Objective:** Verify authenticated user can upload documents.

**Steps:**
1. Sign in via Gmail
2. Navigate to document upload
3. Upload a document
4. Verify document is saved

**Expected Results:**
- ✅ Document upload works
- ✅ Document is associated with user
- ✅ Document is retrievable

---

## 6. Performance Tests

### 6.1 Sign-In Response Time
**Objective:** Verify sign-in completes within acceptable time.

**Measurement:**
- Time from clicking Google Sign-In button to redirect
- Target: < 3 seconds

**Expected Results:**
- ✅ Sign-in completes in < 3 seconds
- ✅ No timeouts
- ✅ Smooth user experience

---

### 6.2 Concurrent Sign-Ins
**Objective:** Verify system handles multiple concurrent sign-ins.

**Test:**
- 10 users sign in simultaneously
- Measure response time and success rate

**Expected Results:**
- ✅ All sign-ins succeed
- ✅ No database locks
- ✅ Response time < 5 seconds per user
- ✅ No data corruption

---

### 6.3 Database Query Performance
**Objective:** Verify database queries are optimized.

**Queries to test:**
- `getPhoneUserByGoogleId(googleId)`
- `createPhoneUser(data)`
- `updatePhoneUser(id, data)`

**Expected Results:**
- ✅ Queries complete in < 100ms
- ✅ Proper indexes are used
- ✅ No N+1 query problems

---

## 7. Browser Compatibility Tests

### 7.1 Chrome/Chromium
**Steps:**
1. Open in Chrome
2. Complete Gmail sign-in
3. Verify all features work

**Expected Results:**
- ✅ Google Sign-In button renders
- ✅ Sign-in flow completes
- ✅ Redirects work correctly

---

### 7.2 Firefox
**Steps:**
1. Open in Firefox
2. Complete Gmail sign-in
3. Verify all features work

**Expected Results:**
- ✅ Google Sign-In button renders
- ✅ Sign-in flow completes
- ✅ Redirects work correctly

---

### 7.3 Safari
**Steps:**
1. Open in Safari
2. Complete Gmail sign-in
3. Verify all features work

**Note:** Safari Private Browsing may block cookies

**Expected Results:**
- ✅ Works in normal mode
- ⚠️ May not work in Private Browsing

---

### 7.4 Mobile Browsers
**Steps:**
1. Open on iOS Safari
2. Open on Android Chrome
3. Complete Gmail sign-in

**Expected Results:**
- ✅ Responsive design works
- ✅ Touch interactions work
- ✅ Sign-in flow completes

---

## 8. Localization Tests

### 8.1 Different Language Settings
**Test Languages:**
- English
- Chinese (Simplified)
- Polish

**Steps:**
1. Change language setting
2. Sign in via Gmail
3. Verify UI text is in correct language

**Expected Results:**
- ✅ All UI text is localized
- ✅ Error messages are in correct language
- ✅ No mixed languages

---

## 9. Regression Tests

### 9.1 Email OTP Still Works
**Objective:** Verify email OTP login still works after Gmail feature.

**Steps:**
1. Navigate to `/email-auth`
2. Choose "Sign in with Email"
3. Enter email address
4. Receive OTP
5. Enter OTP code
6. Verify login succeeds

**Expected Results:**
- ✅ Email OTP flow works independently
- ✅ No interference from Gmail sign-in
- ✅ Both methods can be used

---

### 9.2 Phone OTP Still Works
**Objective:** Verify phone OTP login still works.

**Steps:**
1. Navigate to `/auth-selection`
2. Choose "Sign in with Phone"
3. Enter phone number
4. Receive SMS OTP
5. Enter OTP code
6. Verify login succeeds

**Expected Results:**
- ✅ Phone OTP flow works independently
- ✅ No interference from Gmail sign-in
- ✅ Both methods can be used

---

## 10. Test Execution Checklist

### Pre-Test Setup
- [ ] Test environment is clean (no existing sessions)
- [ ] Database is in known state
- [ ] Test data is prepared
- [ ] Browser developer tools are open
- [ ] Network throttling is configured (if needed)
- [ ] VPN/Proxy is configured (if needed)

### Test Execution
- [ ] All happy path tests pass
- [ ] All edge case tests pass
- [ ] All error scenario tests pass
- [ ] All security tests pass
- [ ] All integration tests pass
- [ ] All performance tests pass
- [ ] All browser compatibility tests pass
- [ ] All localization tests pass
- [ ] All regression tests pass

### Post-Test
- [ ] Test results are documented
- [ ] Screenshots/videos are captured for failures
- [ ] Bugs are logged with reproduction steps
- [ ] Performance metrics are recorded
- [ ] Test report is generated
- [ ] Stakeholders are notified

---

## 11. Known Limitations & Notes

### Current Implementation
- ✅ Gmail sign-in implemented for regular users
- ✅ 2FA required for admin/manager/staff roles
- ✅ Session cookies are HTTP-only and secure
- ✅ Email is auto-verified for Gmail users
- ✅ User role defaults to "user" for new Gmail signups

### Future Enhancements
- [ ] Link existing email/phone accounts to Gmail
- [ ] Support multiple sign-in methods per account
- [ ] Social login with other providers (Facebook, Microsoft)
- [ ] Account linking/merging functionality
- [ ] Sign-in history and device management

### Testing Environment
- Test URL: `https://3000-ik1w0gekbvdymry4887fh-18a31f23.us2.manus.computer`
- Google Client ID: `455246065310-idbi6ad270uj9tmcof5l0gpn96ai525t.apps.googleusercontent.com`
- Test Gmail Accounts: (provided separately for security)

---

## 12. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | - | - | - |
| Developer | - | - | - |
| Product Manager | - | - | - |
| Security | - | - | - |

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-16  
**Next Review:** 2026-05-16
