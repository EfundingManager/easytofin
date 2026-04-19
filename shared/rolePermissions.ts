/**
 * Role-Based Access Control (RBAC) Permissions Matrix
 * 
 * Defines what each role can do in the system
 */

export type UserRole = "super_admin" | "admin" | "manager" | "support" | "staff" | "user" | "client";

export interface RolePermissions {
  viewDashboard: boolean;
  viewAllClients: boolean;
  viewClientDetails: boolean;
  editClientInfo: boolean;
  updateKYCStatus: boolean;
  unlockAccount: boolean;
  viewActivityLogs: boolean;
  viewSystemMetrics: boolean;
  manageAdmins: boolean;
  manageManagers: boolean;
  manageSupport: boolean;
  configureSystem: boolean;
  viewSecurityAlerts: boolean;
  exportClientData: boolean;
  sendEmails: boolean;
  viewSubmissions: boolean;
  editSubmissions: boolean;
  approveSubmissions: boolean;
  manageForms: boolean;
  viewReports: boolean;
  createReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    viewDashboard: true,
    viewAllClients: true,
    viewClientDetails: true,
    editClientInfo: true,
    updateKYCStatus: true,
    unlockAccount: true,
    viewActivityLogs: true,
    viewSystemMetrics: true,
    manageAdmins: true,
    manageManagers: true,
    manageSupport: true,
    configureSystem: true,
    viewSecurityAlerts: true,
    exportClientData: true,
    sendEmails: true,
    viewSubmissions: true,
    editSubmissions: true,
    approveSubmissions: true,
    manageForms: true,
    viewReports: true,
    createReports: true,
  },
  admin: {
    viewDashboard: true,
    viewAllClients: true,
    viewClientDetails: true,
    editClientInfo: true,
    updateKYCStatus: true,
    unlockAccount: true,
    viewActivityLogs: true,
    viewSystemMetrics: true,
    manageAdmins: false,
    manageManagers: true,
    manageSupport: true,
    configureSystem: false,
    viewSecurityAlerts: true,
    exportClientData: true,
    sendEmails: true,
    viewSubmissions: true,
    editSubmissions: true,
    approveSubmissions: true,
    manageForms: true,
    viewReports: true,
    createReports: true,
  },
  manager: {
    viewDashboard: true,
    viewAllClients: true,
    viewClientDetails: true,
    editClientInfo: true,
    updateKYCStatus: true,
    unlockAccount: false,
    viewActivityLogs: true,
    viewSystemMetrics: false,
    manageAdmins: false,
    manageManagers: false,
    manageSupport: false,
    configureSystem: false,
    viewSecurityAlerts: false,
    exportClientData: true,
    sendEmails: true,
    viewSubmissions: true,
    editSubmissions: true,
    approveSubmissions: true,
    manageForms: false,
    viewReports: true,
    createReports: false,
  },
  support: {
    viewDashboard: true,
    viewAllClients: true,
    viewClientDetails: true,
    editClientInfo: false,
    updateKYCStatus: false,
    unlockAccount: false,
    viewActivityLogs: false,
    viewSystemMetrics: false,
    manageAdmins: false,
    manageManagers: false,
    manageSupport: false,
    configureSystem: false,
    viewSecurityAlerts: false,
    exportClientData: false,
    sendEmails: true,
    viewSubmissions: true,
    editSubmissions: false,
    approveSubmissions: false,
    manageForms: false,
    viewReports: false,
    createReports: false,
  },
  staff: {
    viewDashboard: true,
    viewAllClients: true,
    viewClientDetails: true,
    editClientInfo: false,
    updateKYCStatus: false,
    unlockAccount: false,
    viewActivityLogs: false,
    viewSystemMetrics: false,
    manageAdmins: false,
    manageManagers: false,
    manageSupport: false,
    configureSystem: false,
    viewSecurityAlerts: false,
    exportClientData: false,
    sendEmails: true,
    viewSubmissions: true,
    editSubmissions: false,
    approveSubmissions: false,
    manageForms: false,
    viewReports: false,
    createReports: false,
  },
  user: {
    viewDashboard: true,
    viewAllClients: false,
    viewClientDetails: false,
    editClientInfo: false,
    updateKYCStatus: false,
    unlockAccount: false,
    viewActivityLogs: false,
    viewSystemMetrics: false,
    manageAdmins: false,
    manageManagers: false,
    manageSupport: false,
    configureSystem: false,
    viewSecurityAlerts: false,
    exportClientData: false,
    sendEmails: false,
    viewSubmissions: false,
    editSubmissions: false,
    approveSubmissions: false,
    manageForms: false,
    viewReports: false,
    createReports: false,
  },
  client: {
    viewDashboard: true,
    viewAllClients: false,
    viewClientDetails: false,
    editClientInfo: false,
    updateKYCStatus: false,
    unlockAccount: false,
    viewActivityLogs: false,
    viewSystemMetrics: false,
    manageAdmins: false,
    manageManagers: false,
    manageSupport: false,
    configureSystem: false,
    viewSecurityAlerts: false,
    exportClientData: false,
    sendEmails: false,
    viewSubmissions: false,
    editSubmissions: false,
    approveSubmissions: false,
    manageForms: false,
    viewReports: false,
    createReports: false,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
}

/**
 * Check if role can access admin features
 */
export function isAdminRole(role: UserRole): boolean {
  return ["super_admin", "admin", "manager", "support"].includes(role);
}
