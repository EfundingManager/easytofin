import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Trash2, Calendar, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

interface Document {
  id: number;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "verified" | "rejected";
  uploadedAt: Date | string;
  fileSize?: number;
  mimeType?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete?: (documentId: number) => void;
  onPreview?: (document: Document) => void;
}

const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    id: "ID/Passport",
    proof_of_income: "Proof of Income",
    bank_statement: "Bank Statement",
    proof_of_address: "Proof of Address",
    employment_letter: "Employment Letter",
    other: "Other Document",
  };
  return labels[type] || type;
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "verified":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "N/A";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

export function DocumentList({ documents, onDelete, onPreview }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  // Filter and search logic
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.filter((doc) => {
      // Search filter
      const searchMatch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // Status filter
      if (filterStatus !== "all" && doc.status !== filterStatus) return false;

      // Document type filter
      if (filterType !== "all" && doc.documentType !== filterType) return false;

      // Date range filter
      if (filterDateRange !== "all" && doc.uploadedAt) {
        const uploadDate = new Date(doc.uploadedAt);
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

        if (filterDateRange === "7days") {
          const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (uploadDate < sevenDaysAgo) return false;
        } else if (filterDateRange === "30days" && uploadDate < thirtyDaysAgo) {
          return false;
        } else if (filterDateRange === "90days" && uploadDate < ninetyDaysAgo) {
          return false;
        }
      }

      return true;
    });
  }, [documents, searchTerm, filterStatus, filterType, filterDateRange]);

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    if (!documents) return [];
    return Array.from(new Set(documents.map((doc) => doc.documentType)));
  }, [documents]);

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>All documents submitted by the customer</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No documents uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
        <CardDescription>All documents submitted by the customer</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6 pb-6 border-b">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Document Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getDocumentTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Summary */}
          {(searchTerm || filterStatus !== "all" || filterType !== "all" || filterDateRange !== "all") && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <span>
                Showing {filteredDocuments.length} of {documents.length} document
                {documents.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterType("all");
                  setFilterDateRange("all");
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {documents.length === 0 ? "No documents uploaded yet" : "No documents match your filters"}
            </p>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Document Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {/* Document Name and Type */}
                    <div className="mb-2">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-600">{getDocumentTypeLabel(doc.documentType)}</p>
                    </div>

                    {/* Document Details */}
                    <div className="flex flex-wrap gap-3 items-center text-xs text-gray-600">
                      {/* Upload Date */}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString("en-IE", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      {/* File Size */}
                      {doc.fileSize && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      )}

                      {/* Status Badge */}
                      <Badge variant={getStatusBadgeVariant(doc.status)} className="capitalize">
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {/* Preview Button */}
                  {onPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(doc)}
                      title="Preview document"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    title="Download document"
                    className="h-8 w-8 p-0"
                  >
                    <a href={doc.fileUrl} download={doc.fileName} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>

                  {/* Delete Button */}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc.id)}
                      title="Delete document"
                      className="h-8 w-8 p-0 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
