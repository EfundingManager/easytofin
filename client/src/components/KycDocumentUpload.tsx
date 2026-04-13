import React, { useState, useRef, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface KycDocumentUploadProps {
  phoneUserId?: number;
  onUploadSuccess?: () => void;
  onDocumentsChange?: (documents: UploadedDocument[]) => void;
}

interface UploadedDocument {
  id?: string;
  fileName: string;
  documentType: string;
  status: "pending" | "verified" | "rejected";
  uploadedAt?: Date;
  rejectionReason?: string;
}

const ALLOWED_DOCUMENT_TYPES = [
  { value: "id_front", label: "ID Front Side" },
  { value: "id_back", label: "ID Back Side" },
  { value: "proof_of_address", label: "Proof of Address" },
  { value: "employment_verification", label: "Employment Verification" },
  { value: "other", label: "Other Document" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf", "image/webp"];

export function KycDocumentUpload({ phoneUserId, onUploadSuccess, onDocumentsChange }: KycDocumentUploadProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.kycForm.uploadDocument.useMutation();
  const documentsQuery = trpc.kycForm.getDocuments.useQuery({});

  const handleFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);
    const newDocuments: UploadedDocument[] = [];

    fileArray.forEach((file) => {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid file type. Please upload JPEG, PNG, WebP, or PDF files.`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File size exceeds 10MB limit.`);
        return;
      }

      // Auto-detect document type from filename
      let documentType = "other";
      if (file.name.toLowerCase().includes("front")) documentType = "id_front";
      else if (file.name.toLowerCase().includes("back")) documentType = "id_back";
      else if (file.name.toLowerCase().includes("address")) documentType = "proof_of_address";
      else if (file.name.toLowerCase().includes("employment")) documentType = "employment_verification";

      newDocuments.push({
        fileName: file.name,
        documentType,
        status: "pending",
        uploadedAt: new Date(),
      });
    });

    const updated = [...uploadedDocuments, ...newDocuments];
    setUploadedDocuments(updated);
    onDocumentsChange?.(updated);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [uploadedDocuments]);

  const removeDocument = (index: number) => {
    const updated = uploadedDocuments.filter((_, i) => i !== index);
    setUploadedDocuments(updated);
    onDocumentsChange?.(updated);
    toast.success("Document removed");
  };

  const updateDocumentType = (index: number, documentType: string) => {
    const updated = [...uploadedDocuments];
    updated[index].documentType = documentType;
    setUploadedDocuments(updated);
    onDocumentsChange?.(updated);
  };

  const handleUpload = async () => {
    if (uploadedDocuments.length === 0) {
      toast.error("Please add at least one document");
      return;
    }

    try {
      setIsUploading(true);

      for (const doc of uploadedDocuments) {
        if (doc.status === "pending") {
          try {
            await uploadMutation.mutateAsync({
              documentType: doc.documentType as any,
              fileName: doc.fileName,
            } as any);

            // Update document status
            const updated = uploadedDocuments.map((d) =>
              d.fileName === doc.fileName ? { ...d, status: "verified" as const } : d
            );
            setUploadedDocuments(updated);
            onDocumentsChange?.(updated);
          } catch (error) {
            console.error(`Failed to upload ${doc.fileName}:`, error);
            toast.error(`Failed to upload ${doc.fileName}`);
          }
        }
      }

      toast.success("All documents uploaded successfully!");
      documentsQuery.refetch();
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Identification Documents
          </CardTitle>
          <CardDescription>
            Upload clear copies of your identification documents. Supported formats: PDF, JPEG, PNG, WebP (Max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="space-y-3">
              <Upload className="w-10 h-10 mx-auto text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Drag and drop your documents here</p>
                <p className="text-sm text-gray-500">or click to select files</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* File Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure documents are clear, legible, and show all required information. Blurry or incomplete documents may be rejected.
            </AlertDescription>
          </Alert>

          {/* Uploaded Documents List */}
          {uploadedDocuments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Documents ({uploadedDocuments.length})</h3>
              <div className="space-y-2">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Pending"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      {/* Document Type Selector */}
                      <select
                        value={doc.documentType}
                        onChange={(e) => updateDocumentType(index, e.target.value)}
                        disabled={isUploading || doc.status !== "pending"}
                        className="text-xs px-2 py-1 border border-gray-300 rounded bg-white disabled:opacity-50"
                      >
                        {ALLOWED_DOCUMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      {/* Status Badge */}
                      <StatusBadge status={doc.status} />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeDocument(index)}
                        disabled={isUploading}
                        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove document"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rejection Reason Display */}
              {uploadedDocuments.some((doc) => doc.status === "rejected" && doc.rejectionReason) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {uploadedDocuments
                      .filter((doc) => doc.rejectionReason)
                      .map((doc) => (
                        <div key={doc.fileName}>
                          <strong>{doc.fileName}:</strong> {doc.rejectionReason}
                        </div>
                      ))}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={isUploading || uploadedDocuments.length === 0}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </>
              )}
            </Button>
          </div>

          {/* Document Type Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm text-blue-900">Document Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>ID Front Side:</strong> Clear photo of the front of your ID document</li>
              <li>• <strong>ID Back Side:</strong> Clear photo of the back of your ID document</li>
              <li>• <strong>Proof of Address:</strong> Recent utility bill, bank statement, or lease agreement</li>
              <li>• <strong>Employment Verification:</strong> Employment letter or payslip (if applicable)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Previously Uploaded Documents */}
      {documentsQuery.data && documentsQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Previously Uploaded Documents</CardTitle>
            <CardDescription>
              {documentsQuery.data.length} document(s) on file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsQuery.data.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {doc.documentType} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "verified" | "rejected" }) {
  const statusConfig = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Review" },
    verified: { bg: "bg-green-100", text: "text-green-800", label: "Verified" },
    rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`whitespace-nowrap ${config.bg} ${config.text}`}>
      {config.label}
    </Badge>
  );
}
