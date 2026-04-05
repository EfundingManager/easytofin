import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, X } from "lucide-react";

interface AdminFormUploadProps {
  customerId: number;
  onUploadSuccess?: () => void;
}

export function AdminFormUpload({ customerId, onUploadSuccess }: AdminFormUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formType, setFormType] = useState("protection");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.documents.uploadDocument.useMutation();
  const formsQuery = trpc.admin.getCustomerDetail.useQuery({ customerId });
  const downloadMutation = trpc.documents.getDownloadUrl.useMutation();
  const deleteMutation = trpc.documents.deleteDocument.useMutation();

  const formTypes = [
    { value: "protection", label: "Protection Form" },
    { value: "pensions", label: "Pensions Form" },
    { value: "healthInsurance", label: "Health Insurance Form" },
    { value: "generalInsurance", label: "General Insurance Form" },
    { value: "investments", label: "Investments Form" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        userId: customerId,
        file: selectedFile,
        documentType: `form_${formType}`,
      });
      setSelectedFile(null);
      setFormType("protection");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await formsQuery.refetch();
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDownload = async (documentId: number) => {
    try {
      const result = await downloadMutation.mutateAsync({ documentId });
      if (result.url) {
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteMutation.mutateAsync({ documentId });
        await formsQuery.refetch();
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const customer = formsQuery.data;
  const formDocuments = customer?.documents?.filter((doc: any) => doc.type.startsWith("form_")) || [];

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Form Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form Type Selection */}
          <div>
            <label className="text-sm font-medium">Form Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {formTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } ${selectedFile ? "bg-green-50 border-green-300" : ""}`}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium text-sm">Drag and drop your form here</p>
                  <p className="text-xs text-gray-600">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Form"}
          </Button>
        </CardContent>
      </Card>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Form Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {formsQuery.isLoading ? (
            <p className="text-center py-4 text-gray-500">Loading forms...</p>
          ) : formDocuments.length > 0 ? (
            <div className="space-y-2">
              {formDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {doc.type.replace("form_", "").charAt(0).toUpperCase() +
                          doc.type.replace("form_", "").slice(1)}{" "}
                        Form
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        doc.status === "verified"
                          ? "bg-green-50 text-green-700"
                          : doc.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {doc.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(doc.id)}
                      disabled={downloadMutation.isPending}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">No form documents uploaded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
