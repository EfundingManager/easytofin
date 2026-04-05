import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Trash2, Calendar } from "lucide-react";

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
        <div className="space-y-3">
          {documents.map((doc) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
