import { describe, it, expect } from "vitest";
import {
  isProtectedRole,
  canEditUser,
  canDeleteUser,
  canAssignRoles,
  getAssignableRoles,
  getDefaultVisibleRoles,
  isDefaultVisibleRole,
  type UserRole,
} from "./role-permissions";

describe("Role-Based Permission System", () => {
  describe("isProtectedRole", () => {
    it("should identify super_admin as protected", () => {
      expect(isProtectedRole("super_admin")).toBe(true);
    });

    it("should identify admin as protected", () => {
      expect(isProtectedRole("admin")).toBe(true);
    });

    it("should not identify manager as protected", () => {
      expect(isProtectedRole("manager")).toBe(false);
    });

    it("should not identify staff as protected", () => {
      expect(isProtectedRole("staff")).toBe(false);
    });

    it("should not identify support as protected", () => {
      expect(isProtectedRole("support")).toBe(false);
    });

    it("should not identify user as protected", () => {
      expect(isProtectedRole("user")).toBe(false);
    });

    it("should not identify customer as protected", () => {
      expect(isProtectedRole("customer")).toBe(false);
    });
  });

  describe("canEditUser", () => {
    it("should not allow user to edit themselves", () => {
      expect(canEditUser("admin", 1, 1, "staff")).toBe(false);
    });

    it("should not allow editing super_admin", () => {
      expect(canEditUser("admin", 1, 2, "super_admin")).toBe(false);
    });

    it("should not allow editing admin (protected)", () => {
      expect(canEditUser("admin", 1, 2, "admin")).toBe(false);
    });

    it("should not allow super_admin to edit admin (protected)", () => {
      expect(canEditUser("super_admin", 1, 2, "admin")).toBe(false);
    });

    it("should allow admin to edit manager", () => {
      expect(canEditUser("admin", 1, 2, "manager")).toBe(true);
    });

    it("should allow admin to edit staff", () => {
      expect(canEditUser("admin", 1, 2, "staff")).toBe(true);
    });

    it("should allow admin to edit support", () => {
      expect(canEditUser("admin", 1, 2, "support")).toBe(true);
    });

    it("should allow admin to edit user", () => {
      expect(canEditUser("admin", 1, 2, "user")).toBe(true);
    });

    it("should allow admin to edit customer", () => {
      expect(canEditUser("admin", 1, 2, "customer")).toBe(true);
    });

    it("should not allow admin to edit another admin", () => {
      expect(canEditUser("admin", 1, 2, "admin")).toBe(false);
    });

    it("should not allow manager to edit admin", () => {
      expect(canEditUser("manager", 1, 2, "admin")).toBe(false);
    });

    it("should allow manager to edit staff", () => {
      expect(canEditUser("manager", 1, 2, "staff")).toBe(true);
    });

    it("should allow manager to edit support", () => {
      expect(canEditUser("manager", 1, 2, "support")).toBe(true);
    });

    it("should not allow manager to edit manager", () => {
      expect(canEditUser("manager", 1, 2, "manager")).toBe(false);
    });

    it("should not allow staff to edit manager", () => {
      expect(canEditUser("staff", 1, 2, "manager")).toBe(false);
    });

    it("should allow staff to edit support", () => {
      expect(canEditUser("staff", 1, 2, "support")).toBe(true);
    });

    it("should allow user to edit customer", () => {
      expect(canEditUser("user", 1, 2, "customer")).toBe(true);
    });

    it("should not allow user to edit user", () => {
      expect(canEditUser("user", 1, 2, "user")).toBe(false);
    });

    it("should not allow customer to edit anyone", () => {
      expect(canEditUser("customer", 1, 2, "user")).toBe(false);
    });
  });

  describe("canDeleteUser", () => {
    it("should not allow user to delete themselves", () => {
      expect(canDeleteUser("admin", 1, 1, "staff")).toBe(false);
    });

    it("should not allow deleting super_admin", () => {
      expect(canDeleteUser("admin", 1, 2, "super_admin")).toBe(false);
    });

    it("should not allow deleting admin (protected)", () => {
      expect(canDeleteUser("admin", 1, 2, "admin")).toBe(false);
    });

    it("should not allow super_admin to delete admin (protected)", () => {
      expect(canDeleteUser("super_admin", 1, 2, "admin")).toBe(false);
    });

    it("should allow admin to delete staff", () => {
      expect(canDeleteUser("admin", 1, 2, "staff")).toBe(true);
    });

    it("should allow manager to delete support", () => {
      expect(canDeleteUser("manager", 1, 2, "support")).toBe(true);
    });

    it("should not allow manager to delete manager", () => {
      expect(canDeleteUser("manager", 1, 2, "manager")).toBe(false);
    });

    it("should allow user to delete customer", () => {
      expect(canDeleteUser("user", 1, 2, "customer")).toBe(true);
    });

    it("should not allow user to delete user", () => {
      expect(canDeleteUser("user", 1, 2, "user")).toBe(false);
    });
  });

  describe("canAssignRoles", () => {
    it("should not allow assigning roles to self", () => {
      expect(canAssignRoles("admin", 1, 1, "staff", ["manager"])).toBe(false);
    });

    it("should not allow assigning super_admin role", () => {
      expect(canAssignRoles("super_admin", 1, 2, "staff", ["super_admin"])).toBe(false);
    });

    it("should not allow assigning admin role", () => {
      expect(canAssignRoles("super_admin", 1, 2, "staff", ["admin"])).toBe(false);
    });

    it("should allow super_admin to assign manager role", () => {
      expect(canAssignRoles("super_admin", 1, 2, "staff", ["manager"])).toBe(true);
    });

    it("should allow admin to assign staff role", () => {
      expect(canAssignRoles("admin", 1, 2, "user", ["staff"])).toBe(true);
    });

    it("should not allow admin to assign admin role", () => {
      expect(canAssignRoles("admin", 1, 2, "staff", ["admin"])).toBe(false);
    });

    it("should not allow admin to assign role equal to their own", () => {
      expect(canAssignRoles("admin", 1, 2, "staff", ["admin"])).toBe(false);
    });

    it("should not allow admin to assign role higher than their own", () => {
      expect(canAssignRoles("admin", 1, 2, "staff", ["super_admin"])).toBe(false);
    });

    it("should not allow manager to assign manager role", () => {
      expect(canAssignRoles("manager", 1, 2, "staff", ["manager"])).toBe(false);
    });

    it("should allow manager to assign staff role", () => {
      expect(canAssignRoles("manager", 1, 2, "user", ["staff"])).toBe(true);
    });

    it("should allow user to assign customer role", () => {
      expect(canAssignRoles("user", 1, 2, "customer", ["customer"])).toBe(true);
    });

    it("should not allow user to assign user role", () => {
      expect(canAssignRoles("user", 1, 2, "customer", ["user"])).toBe(false);
    });

    it("should not allow customer to assign any role", () => {
      expect(canAssignRoles("customer", 1, 2, "user", ["customer"])).toBe(false);
    });
  });

  describe("getAssignableRoles", () => {
    it("should return all roles below super_admin", () => {
      const roles = getAssignableRoles("super_admin");
      expect(roles).toContain("admin");
      expect(roles).toContain("manager");
      expect(roles).toContain("staff");
      expect(roles).toContain("support");
      expect(roles).toContain("user");
      expect(roles).toContain("customer");
      expect(roles).not.toContain("super_admin");
    });

    it("should return roles below admin", () => {
      const roles = getAssignableRoles("admin");
      expect(roles).toContain("manager");
      expect(roles).toContain("staff");
      expect(roles).toContain("support");
      expect(roles).toContain("user");
      expect(roles).toContain("customer");
      expect(roles).not.toContain("super_admin");
      expect(roles).not.toContain("admin");
    });

    it("should return roles below manager", () => {
      const roles = getAssignableRoles("manager");
      expect(roles).toContain("staff");
      expect(roles).toContain("support");
      expect(roles).toContain("user");
      expect(roles).toContain("customer");
      expect(roles).not.toContain("admin");
      expect(roles).not.toContain("manager");
    });

    it("should return only customer role for user", () => {
      const roles = getAssignableRoles("user");
      expect(roles).toContain("customer");
      expect(roles).not.toContain("user");
      expect(roles).not.toContain("support");
    });

    it("should return empty array for customer", () => {
      const roles = getAssignableRoles("customer");
      expect(roles).toHaveLength(0);
    });
  });

  describe("getDefaultVisibleRoles", () => {
    it("should include super_admin", () => {
      expect(getDefaultVisibleRoles()).toContain("super_admin");
    });

    it("should include admin", () => {
      expect(getDefaultVisibleRoles()).toContain("admin");
    });

    it("should include manager", () => {
      expect(getDefaultVisibleRoles()).toContain("manager");
    });

    it("should include staff", () => {
      expect(getDefaultVisibleRoles()).toContain("staff");
    });

    it("should include support", () => {
      expect(getDefaultVisibleRoles()).toContain("support");
    });

    it("should not include user", () => {
      expect(getDefaultVisibleRoles()).not.toContain("user");
    });

    it("should not include customer", () => {
      expect(getDefaultVisibleRoles()).not.toContain("customer");
    });
  });

  describe("isDefaultVisibleRole", () => {
    it("should return true for super_admin", () => {
      expect(isDefaultVisibleRole("super_admin")).toBe(true);
    });

    it("should return true for admin", () => {
      expect(isDefaultVisibleRole("admin")).toBe(true);
    });

    it("should return true for manager", () => {
      expect(isDefaultVisibleRole("manager")).toBe(true);
    });

    it("should return true for staff", () => {
      expect(isDefaultVisibleRole("staff")).toBe(true);
    });

    it("should return true for support", () => {
      expect(isDefaultVisibleRole("support")).toBe(true);
    });

    it("should return false for user", () => {
      expect(isDefaultVisibleRole("user")).toBe(false);
    });

    it("should return false for customer", () => {
      expect(isDefaultVisibleRole("customer")).toBe(false);
    });
  });

  describe("Role Hierarchy Comprehensive Tests", () => {
    it("super_admin should have control over non-protected roles", () => {
      const editableRoles: UserRole[] = ["manager", "staff", "support", "user", "customer"];
      const protectedRoles: UserRole[] = ["admin"];

      editableRoles.forEach((role) => {
        expect(canEditUser("super_admin", 1, 2, role)).toBe(true);
        expect(canDeleteUser("super_admin", 1, 2, role)).toBe(true);
      });

      protectedRoles.forEach((role) => {
        expect(canEditUser("super_admin", 1, 2, role)).toBe(false);
        expect(canDeleteUser("super_admin", 1, 2, role)).toBe(false);
      });
    });

    it("admin should have control over manager and below", () => {
      const controllableRoles: UserRole[] = ["manager", "staff", "support", "user", "customer"];
      const uncontrollableRoles: UserRole[] = ["super_admin", "admin"];

      controllableRoles.forEach((role) => {
        expect(canEditUser("admin", 1, 2, role)).toBe(true);
      });

      uncontrollableRoles.forEach((role) => {
        expect(canEditUser("admin", 1, 2, role)).toBe(false);
      });
    });

    it("manager should have control over staff and below", () => {
      const controllableRoles: UserRole[] = ["staff", "support", "user", "customer"];
      const uncontrollableRoles: UserRole[] = ["super_admin", "admin", "manager"];

      controllableRoles.forEach((role) => {
        expect(canEditUser("manager", 1, 2, role)).toBe(true);
      });

      uncontrollableRoles.forEach((role) => {
        expect(canEditUser("manager", 1, 2, role)).toBe(false);
      });
    });

    it("staff should have control over support and below", () => {
      const controllableRoles: UserRole[] = ["support", "user", "customer"];
      const uncontrollableRoles: UserRole[] = ["super_admin", "admin", "manager", "staff"];

      controllableRoles.forEach((role) => {
        expect(canEditUser("staff", 1, 2, role)).toBe(true);
      });

      uncontrollableRoles.forEach((role) => {
        expect(canEditUser("staff", 1, 2, role)).toBe(false);
      });
    });

    it("support should have control over user and customer only", () => {
      expect(canEditUser("support", 1, 2, "user")).toBe(true);
      expect(canEditUser("support", 1, 2, "customer")).toBe(true);
      expect(canEditUser("support", 1, 2, "staff")).toBe(false);
      expect(canEditUser("support", 1, 2, "manager")).toBe(false);
    });

    it("user should have control over customer only", () => {
      expect(canEditUser("user", 1, 2, "customer")).toBe(true);
      expect(canEditUser("user", 1, 2, "user")).toBe(false);
      expect(canEditUser("user", 1, 2, "support")).toBe(false);
    });

    it("customer should have no control over anyone", () => {
      const allRoles: UserRole[] = ["super_admin", "admin", "manager", "staff", "support", "user", "customer"];
      allRoles.forEach((role) => {
        expect(canEditUser("customer", 1, 2, role)).toBe(false);
      });
    });
  });
});
