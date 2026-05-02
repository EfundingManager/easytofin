/**
 * Role-Based Permission System for User Management
 * Implements strict role hierarchy and permission checks
 */

export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "support" | "user" | "customer";

/**
 * Role hierarchy levels (higher number = higher privilege)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  admin: 5,
  manager: 4,
  staff: 3,
  support: 2,
  user: 1,
  customer: 0,
};

/**
 * Roles that cannot be edited or deleted (protected)
 */
const PROTECTED_ROLES: UserRole[] = ["super_admin", "admin"];

/**
 * Check if a role is protected (cannot be edited or deleted)
 */
export function isProtectedRole(role: UserRole): boolean {
  return PROTECTED_ROLES.includes(role);
}

/**
 * Check if the logged-in user can edit a target user
 * 
 * Rules:
 * 1. Cannot edit self
 * 2. Cannot edit protected roles (super_admin, admin)
 * 3. Can only edit users below their role level
 * 4. Super Admin can edit all non-super-admin roles
 * 5. Admin can edit manager, staff, support, user, customer only
 * 6. Manager can edit staff, support, user, customer only
 * 7. Staff can edit support, user, customer only
 * 8. Support can edit user, customer only
 * 9. User and Customer cannot edit anyone
 */
export function canEditUser(
  loggedInUserRole: UserRole,
  loggedInUserId: number,
  targetUserId: number,
  targetUserRole: UserRole
): boolean {
  // Cannot edit self
  if (loggedInUserId === targetUserId) {
    return false;
  }

  // Cannot edit protected roles
  if (isProtectedRole(targetUserRole)) {
    return false;
  }

  // Get role hierarchy levels
  const loggedInLevel = ROLE_HIERARCHY[loggedInUserRole];
  const targetLevel = ROLE_HIERARCHY[targetUserRole];

  // Can only edit users below their role level
  return loggedInLevel > targetLevel;
}

/**
 * Check if the logged-in user can delete a target user
 * Same rules as canEditUser
 */
export function canDeleteUser(
  loggedInUserRole: UserRole,
  loggedInUserId: number,
  targetUserId: number,
  targetUserRole: UserRole
): boolean {
  // Cannot delete self
  if (loggedInUserId === targetUserId) {
    return false;
  }

  // Cannot delete protected roles
  if (isProtectedRole(targetUserRole)) {
    return false;
  }

  // Get role hierarchy levels
  const loggedInLevel = ROLE_HIERARCHY[loggedInUserRole];
  const targetLevel = ROLE_HIERARCHY[targetUserRole];

  // Can only delete users below their role level
  return loggedInLevel > targetLevel;
}

/**
 * Check if the logged-in user can assign roles to a target user
 * Rules:
 * 1. Cannot assign roles to self
 * 2. Cannot assign protected roles (super_admin, admin)
 * 3. Can only assign roles to users below their role level
 * 4. Cannot assign roles that are equal to or higher than their own role
 */
export function canAssignRoles(
  loggedInUserRole: UserRole,
  loggedInUserId: number,
  targetUserId: number,
  targetUserRole: UserRole,
  newRoles: UserRole[]
): boolean {
  // Cannot assign roles to self
  if (loggedInUserId === targetUserId) {
    return false;
  }

  // Cannot assign protected roles (super_admin, admin)
  if (newRoles.some(role => isProtectedRole(role))) {
    return false;
  }

  // Get role hierarchy levels
  const loggedInLevel = ROLE_HIERARCHY[loggedInUserRole];
  const targetLevel = ROLE_HIERARCHY[targetUserRole];

  // Can only assign roles to users below their role level
  if (loggedInLevel <= targetLevel) {
    return false;
  }

  // Cannot assign roles that are equal to or higher than their own role
  const maxNewRoleLevel = Math.max(...newRoles.map(role => ROLE_HIERARCHY[role]));
  return loggedInLevel > maxNewRoleLevel;
}

/**
 * Get the list of roles that a logged-in user can assign
 * Returns all roles below their own role level
 */
export function getAssignableRoles(loggedInUserRole: UserRole): UserRole[] {
  const loggedInLevel = ROLE_HIERARCHY[loggedInUserRole];
  
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < loggedInLevel)
    .map(([role, _]) => role as UserRole);
}

/**
 * Get the list of roles that should be visible by default in the UI
 * Default: show Super Admin, Admin, Manager, Staff, Support (hide User and Customer)
 */
export function getDefaultVisibleRoles(): UserRole[] {
  return ["super_admin", "admin", "manager", "staff", "support"];
}

/**
 * Check if a role should be visible by default
 */
export function isDefaultVisibleRole(role: UserRole): boolean {
  return getDefaultVisibleRoles().includes(role);
}
