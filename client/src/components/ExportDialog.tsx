import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (columns: string[]) => Promise<void>;
  isLoading?: boolean;
  totalRecords?: number;
}

const EXPORT_COLUMNS = [
  { id: "id", label: "Client ID", description: "Unique client identifier" },
  { id: "name", label: "Name", description: "Client full name" },
  { id: "email", label: "Email", description: "Client email address" },
  { id: "phone", label: "Phone", description: "Client phone number" },
  { id: "kycStatus", label: "KYC Status", description: "Know Your Customer verification status" },
  { id: "verified", label: "Verified", description: "Email/phone verification status" },
  { id: "createdAt", label: "Joined Date", description: "Account creation date" },
  { id: "accountAge", label: "Account Age", description: "Days since account creation" },
];

export function ExportDialog({
  isOpen,
  onOpenChange,
  onExport,
  isLoading,
  totalRecords,
}: ExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "id",
    "name",
    "email",
    "kycStatus",
    "verified",
    "createdAt",
  ]);

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === EXPORT_COLUMNS.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(EXPORT_COLUMNS.map((col) => col.id));
    }
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert("Please select at least one column to export");
      return;
    }
    await onExport(selectedColumns);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Clients to CSV</DialogTitle>
          <DialogDescription>
            Select the columns you want to include in the export
          </DialogDescription>
        </DialogHeader>

        {totalRecords !== undefined && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Exporting <strong>{totalRecords}</strong> client record{totalRecords !== 1 ? "s" : ""}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2 pb-4 border-b">
            <Checkbox
              id="select-all"
              checked={selectedColumns.length === EXPORT_COLUMNS.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="font-semibold cursor-pointer">
              Select All Columns
            </Label>
          </div>

          {/* Column Checkboxes */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {EXPORT_COLUMNS.map((column) => (
              <div key={column.id} className="flex items-start space-x-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={column.id} className="font-medium cursor-pointer">
                    {column.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{column.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || selectedColumns.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
