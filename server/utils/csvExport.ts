/**
 * CSV Export Utility
 * Provides functions to generate and export data to CSV format
 */

export interface CSVExportOptions {
  filename?: string;
  columns: string[];
  data: Record<string, any>[];
}

/**
 * Escape CSV field values to handle special characters
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return "";
  }

  const stringValue = String(field);

  // If field contains comma, double quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV content from data array
 */
export function generateCSV(options: CSVExportOptions): string {
  const { columns, data } = options;

  // Create header row
  const header = columns.map(escapeCSVField).join(",");

  // Create data rows
  const rows = data.map((row) =>
    columns.map((col) => escapeCSVField(row[col])).join(",")
  );

  // Combine header and rows
  return [header, ...rows].join("\n");
}

/**
 * Format client data for CSV export
 */
export function formatClientsForCSV(
  clients: any[],
  selectedColumns: string[]
): Record<string, any>[] {
  return clients.map((client) => {
    const row: Record<string, any> = {};

    selectedColumns.forEach((col) => {
      switch (col) {
        case "id":
          row.id = client.id;
          break;
        case "name":
          row.name = client.name || "";
          break;
        case "email":
          row.email = client.email || "";
          break;
        case "phone":
          row.phone = client.phone || "";
          break;
        case "kycStatus":
          row.kycStatus = client.kycStatus || "pending";
          break;
        case "verified":
          row.verified = client.verified ? "Yes" : "No";
          break;
        case "createdAt":
          row.createdAt = new Date(client.createdAt).toLocaleDateString("en-IE");
          break;
        case "accountAge":
          const ageInDays = Math.floor(
            (Date.now() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          row.accountAge = `${ageInDays} days`;
          break;
      }
    });

    return row;
  });
}

/**
 * Get available export columns with descriptions
 */
export const EXPORT_COLUMNS = [
  { id: "id", label: "Client ID", description: "Unique client identifier" },
  { id: "name", label: "Name", description: "Client full name" },
  { id: "email", label: "Email", description: "Client email address" },
  { id: "phone", label: "Phone", description: "Client phone number" },
  { id: "kycStatus", label: "KYC Status", description: "Know Your Customer verification status" },
  { id: "verified", label: "Verified", description: "Email/phone verification status" },
  { id: "createdAt", label: "Joined Date", description: "Account creation date" },
  { id: "accountAge", label: "Account Age", description: "Days since account creation" },
];
