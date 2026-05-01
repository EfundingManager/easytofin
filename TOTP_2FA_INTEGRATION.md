# TOTP 2FA Authentication Integration - Phase 4

## Overview
This document describes the integration of TOTP (Time-based One-Time Password) 2FA into the authentication flow for privileged roles (Super Admin, Admin, Manager, Staff, Support).

## Architecture

### 1. TOTP Authentication Status Module
**File:** `server/_core/totp-auth-integration.ts`

Provides utility functions for:
- `hasPrivilegedRole(role)`: Checks if a role requires TOTP 2FA
- `getTOTPAuthStatus(phoneUserId)`: Retrieves TOTP configuration and first-login status
- `logTOTPAttempt()`: Logs TOTP verification attempts to audit trail

### 2. Enhanced Authentication Context
**File:** `server/_core/context.ts`

Updated `TrpcContext` to include TOTP status:
```typescript
totpStatus?: {
  requiresTOTP: boolean;        // User's role requires TOTP
  totpEnabled: boolean;         // TOTP secret is configured
  isFirstLogin: boolean;        // First login not yet completed
  totpSetupCompleted: boolean;  // TOTP setup was completed
};
```

### 3. Authentication Flow Integration
**File:** `server/_core/sdk.ts` (to be updated)

The `authenticateRequest()` function will be enhanced to:
1. Authenticate user normally
2. Check if user has privileged role
3. If privileged role:
   - Check if TOTP is configured
   - Check if first login is complete
   - Return TOTP status in response

### 4. Database Helpers
**File:** `server/db.ts`

New helper functions:
- `getTotpSecret(phoneUserId)`: Get TOTP secret record
- `getFirstLoginTracking(phoneUserId)`: Get first login tracking record
- `getUserRoles(phoneUserId)`: Get all roles assigned to user

## TOTP 2FA Procedures (Already Implemented)
**File:** `server/routers/admin.ts`

Existing procedures:
- `generateTotpSecret`: Generate TOTP secret and QR code
- `verifyAndSaveTotpSecret`: Verify TOTP code and save secret
- `verifyTotpCode`: Verify TOTP code during login
- `resetTotpForUser`: Reset TOTP for a user (Super Admin only)

## Database Schema (Already Implemented)

### totpSecrets Table
```sql
CREATE TABLE totpSecrets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phoneUserId INT NOT NULL UNIQUE,
  secret VARCHAR(255) NOT NULL,
  backupCodes JSON NOT NULL,
  isEnabled ENUM('true', 'false') DEFAULT 'false',
  enabledAt TIMESTAMP,
  disabledAt TIMESTAMP,
  lastUsedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### firstLoginTracking Table
```sql
CREATE TABLE firstLoginTracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phoneUserId INT NOT NULL UNIQUE,
  hasCompletedFirstLogin ENUM('true', 'false') DEFAULT 'false',
  requiresTOTP2FA ENUM('true', 'false') DEFAULT 'false',
  totpSetupCompletedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### totp2faAuditLog Table
```sql
CREATE TABLE totp2faAuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phoneUserId INT NOT NULL,
  eventType VARCHAR(50) NOT NULL,
  code VARCHAR(255),
  isValid ENUM('true', 'false'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication Flow Diagram

```
User Login
    ↓
Verify Session Cookie
    ↓
Lookup User (by googleId, email, phone, ID)
    ↓
Check if Privileged Role?
    ├─ NO → Return User (normal flow)
    └─ YES → Check TOTP Status
            ├─ TOTP Not Configured → Redirect to TOTP Setup
            ├─ TOTP Configured & First Login → Redirect to TOTP Verification
            └─ TOTP Configured & Not First Login → Return User
```

## Implementation Checklist

### Phase 4: Authentication Flow Integration
- [ ] Update `authenticateRequest()` to return enhanced response with TOTP status
- [ ] Add TOTP status check for privileged roles
- [ ] Implement first-login detection logic
- [ ] Add failed TOTP attempt logging
- [ ] Create role-based redirect logic in frontend

### Phase 5: User Management UI Improvements
- [ ] Add TOTP reset button in User Management page
- [ ] Implement TOTP status display in user list
- [ ] Add confirmation dialog for TOTP reset

### Phase 6: Testing
- [ ] Test first login flow with TOTP setup
- [ ] Test subsequent login flow with TOTP verification
- [ ] Test backup code usage
- [ ] Test failed TOTP attempts
- [ ] Test role hierarchy enforcement
- [ ] Verify audit logging

## Testing

### Unit Tests
**File:** `server/totp-auth-integration.test.ts`

Tests cover:
- Privileged role detection (16 tests)
- TOTP status determination
- Authentication flow logic
- Role hierarchy enforcement

All tests passing: ✅ 16/16

### Integration Tests (To Be Implemented)
- End-to-end authentication flow with TOTP
- First login TOTP setup flow
- Subsequent login TOTP verification flow
- Backup code usage
- Failed attempt handling

## Security Considerations

1. **TOTP Window**: Using 2-step window for time drift tolerance
2. **Backup Codes**: 8 codes generated, one-time use only
3. **Audit Logging**: All TOTP events logged to database
4. **Rate Limiting**: Failed attempts should be rate-limited
5. **Session Security**: HTTP-only, secure cookies with SameSite=Lax

## Next Steps

1. Update `authenticateRequest()` in `sdk.ts` to integrate TOTP status
2. Create TOTP verification endpoint in admin router
3. Update frontend to handle TOTP redirect
4. Implement TOTP verification page
5. Add TOTP reset functionality to User Management
6. Comprehensive testing of all flows
7. Deployment to production

## References

- TOTP Implementation: `server/totp.test.ts`
- Admin Router: `server/routers/admin.ts`
- Database Schema: `drizzle/schema.ts`
- Authentication Context: `server/_core/context.ts`
- TOTP Integration Module: `server/_core/totp-auth-integration.ts`
