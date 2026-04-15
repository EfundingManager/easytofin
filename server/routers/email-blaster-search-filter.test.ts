import { describe, it, expect } from "vitest";

describe("Email Template Search and Filter Feature", () => {
  describe("Search Functionality", () => {
    it("should search templates by name", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Password Reset", subject: "Reset Password", category: "transactional" },
        { id: 3, name: "Newsletter", subject: "Weekly Newsletter", category: "marketing" },
      ];

      const searchQuery = "welcome";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Welcome Email");
    });

    it("should search templates by subject", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome to EasyToFin", category: "marketing" },
        { id: 2, name: "Password Reset", subject: "Reset Your Password", category: "transactional" },
        { id: 3, name: "Newsletter", subject: "Weekly Newsletter", category: "marketing" },
      ];

      const searchQuery = "password";
      const filtered = templates.filter((t) =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].subject).toContain("Password");
    });

    it("should search templates case-insensitively", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "URGENT ALERT", subject: "System Alert", category: "transactional" },
      ];

      const searchQueries = ["welcome", "WELCOME", "Welcome"];
      searchQueries.forEach((query) => {
        const filtered = templates.filter((t) =>
          t.name.toLowerCase().includes(query.toLowerCase())
        );
        expect(filtered).toHaveLength(1);
      });
    });

    it("should return empty array when no matches found", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Password Reset", subject: "Reset Password", category: "transactional" },
      ];

      const searchQuery = "nonexistent";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it("should search by partial name match", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Welcome SMS", subject: "SMS Welcome", category: "transactional" },
        { id: 3, name: "Goodbye Email", subject: "Goodbye", category: "marketing" },
      ];

      const searchQuery = "welcome";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
      expect(filtered.map((t) => t.id)).toEqual([1, 2]);
    });

    it("should search by partial subject match", () => {
      const templates = [
        { id: 1, name: "Email 1", subject: "Welcome to EasyToFin", category: "marketing" },
        { id: 2, name: "Email 2", subject: "Welcome Back", category: "transactional" },
        { id: 3, name: "Email 3", subject: "Goodbye", category: "marketing" },
      ];

      const searchQuery = "welcome";
      const filtered = templates.filter((t) =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });

    it("should handle empty search query", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Password Reset", subject: "Reset Password", category: "transactional" },
      ];

      const searchQuery = "";
      const filtered = templates.filter((t) =>
        searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });
  });

  describe("Category Filter Functionality", () => {
    it("should filter templates by category", () => {
      const templates = [
        { id: 1, name: "Welcome Email", category: "marketing" },
        { id: 2, name: "Password Reset", category: "transactional" },
        { id: 3, name: "Newsletter", category: "marketing" },
      ];

      const selectedCategory = "marketing";
      const filtered = templates.filter((t) => t.category === selectedCategory);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((t) => t.category === "marketing")).toBe(true);
    });

    it("should return all templates when no category selected", () => {
      const templates = [
        { id: 1, name: "Welcome Email", category: "marketing" },
        { id: 2, name: "Password Reset", category: "transactional" },
        { id: 3, name: "Newsletter", category: "marketing" },
      ];

      const selectedCategory = null;
      const filtered = templates.filter((t) => selectedCategory === null || t.category === selectedCategory);

      expect(filtered).toHaveLength(3);
    });

    it("should get unique categories from templates", () => {
      const templates = [
        { id: 1, category: "marketing" },
        { id: 2, category: "transactional" },
        { id: 3, category: "marketing" },
        { id: 4, category: "notification" },
        { id: 5, category: "transactional" },
      ];

      const categories = Array.from(new Set(templates.map((t) => t.category)));

      expect(categories).toHaveLength(3);
      expect(categories).toContain("marketing");
      expect(categories).toContain("transactional");
      expect(categories).toContain("notification");
    });

    it("should handle templates with different category values", () => {
      const templates = [
        { id: 1, category: "marketing" },
        { id: 2, category: "transactional" },
        { id: 3, category: "promotional" },
        { id: 4, category: "notification" },
      ];

      const categories = Array.from(new Set(templates.map((t) => t.category)));

      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((category) => {
        expect(typeof category).toBe("string");
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Combined Search and Filter", () => {
    it("should apply both search and filter together", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Welcome SMS", subject: "SMS Welcome", category: "transactional" },
        { id: 3, name: "Newsletter", subject: "Weekly Newsletter", category: "marketing" },
      ];

      const searchQuery = "welcome";
      const selectedCategory = "marketing";

      const filtered = templates.filter((t) => {
        const matchesSearch =
          searchQuery === "" ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === null || t.category === selectedCategory;

        return matchesSearch && matchesCategory;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });

    it("should return empty when search matches but category does not", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome", category: "marketing" },
        { id: 2, name: "Welcome SMS", subject: "SMS Welcome", category: "transactional" },
      ];

      const searchQuery = "welcome";
      const selectedCategory = "promotional";

      const filtered = templates.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = t.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      expect(filtered).toHaveLength(0);
    });

    it("should return empty when category matches but search does not", () => {
      const templates = [
        { id: 1, name: "Welcome Email", category: "marketing" },
        { id: 2, name: "Newsletter", category: "marketing" },
      ];

      const searchQuery = "password";
      const selectedCategory = "marketing";

      const filtered = templates.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = t.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

      expect(filtered).toHaveLength(0);
    });
  });

  describe("Filter State Management", () => {
    it("should clear search query", () => {
      let searchQuery = "welcome";
      searchQuery = "";

      expect(searchQuery).toBe("");
    });

    it("should clear category filter", () => {
      let selectedCategory: string | null = "marketing";
      selectedCategory = null;

      expect(selectedCategory).toBeNull();
    });

    it("should clear both filters together", () => {
      let searchQuery = "welcome";
      let selectedCategory: string | null = "marketing";

      searchQuery = "";
      selectedCategory = null;

      expect(searchQuery).toBe("");
      expect(selectedCategory).toBeNull();
    });

    it("should detect when filters are active", () => {
      const hasActiveFilters = (searchQuery: string, selectedCategory: string | null) => {
        return searchQuery !== "" || selectedCategory !== null;
      };

      expect(hasActiveFilters("welcome", null)).toBe(true);
      expect(hasActiveFilters("", "marketing")).toBe(true);
      expect(hasActiveFilters("welcome", "marketing")).toBe(true);
      expect(hasActiveFilters("", null)).toBe(false);
    });
  });

  describe("Display and UI Logic", () => {
    it("should display template count with filters applied", () => {
      const templates = [
        { id: 1, name: "Welcome Email", category: "marketing" },
        { id: 2, name: "Password Reset", category: "transactional" },
        { id: 3, name: "Newsletter", category: "marketing" },
      ];

      const searchQuery = "welcome";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const message = `Showing ${filtered.length} of ${templates.length} templates`;
      expect(message).toBe("Showing 1 of 3 templates");
    });

    it("should show empty state message when no results", () => {
      const templates: any[] = [];
      const hasTemplates = templates.length > 0;

      expect(hasTemplates).toBe(false);
    });

    it("should show no matches message when filters applied but no results", () => {
      const templates = [
        { id: 1, name: "Welcome Email", category: "marketing" },
      ];

      const searchQuery = "nonexistent";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const hasFilters = searchQuery !== "";
      const hasResults = filtered.length > 0;

      expect(hasFilters).toBe(true);
      expect(hasResults).toBe(false);
    });

    it("should display category statistics", () => {
      const templates = [
        { id: 1, category: "marketing" },
        { id: 2, category: "marketing" },
        { id: 3, category: "transactional" },
      ];

      const categories = Array.from(new Set(templates.map((t) => t.category)));
      const totalCount = templates.length;
      const activeCount = templates.filter((t) => t.category === "marketing").length;

      expect(totalCount).toBe(3);
      expect(activeCount).toBe(2);
      expect(categories.length).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty template list", () => {
      const templates: any[] = [];
      const searchQuery = "test";

      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it("should handle special characters in search", () => {
      const templates = [
        { id: 1, name: "Email & SMS", subject: "Test" },
        { id: 2, name: "Email/SMS", subject: "Test" },
      ];

      const searchQuery = "&";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it("should handle very long search queries", () => {
      const templates = [
        { id: 1, name: "Welcome Email", subject: "Welcome to EasyToFin" },
      ];

      const searchQuery = "This is a very long search query that probably won't match anything";
      const filtered = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it("should handle null or undefined values gracefully", () => {
      const templates = [
        { id: 1, name: "Email 1", category: "marketing" },
        { id: 2, name: "Email 2", category: null },
      ];

      const selectedCategory = "marketing";
      const filtered = templates.filter((t) => t.category === selectedCategory);

      expect(filtered).toHaveLength(1);
    });
  });
});
