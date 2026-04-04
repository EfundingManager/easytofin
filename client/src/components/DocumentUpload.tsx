import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Upload, File, Trash2, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 'ID', label: 'ID/Passport' },
  { id: 'ProofOfIncome', label: 'Proof of Income' },
  { id: 'BankStatement', label: 'Bank Statement' },
  { id: 'ProofOfAddress', label: 'Proof of Address' },
  { id: 'Other', label: 'Other Document' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const documentsQuery = trpc.documents.getDocuments.useQuery();
  const uploadMutation = trpc.documents.uploadDocument.useMutation({
    onSuccess: () => {
      setSelectedType('');
      setUploadError(null);
      documentsQuery.refetch();
    },
    onError: (error) => {
      setUploadError(error.message || 'Upload failed');
    },
  });
  const deleteMutation = trpc.documents.deleteDocument.useMutation({
    onSuccess: () => {
      documentsQuery.refetch();
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadError(null);

    if (!selectedType) {
      setUploadError('Please select a document type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        if (!base64) {
          setUploadError('Failed to read file');
          return;
        }

        await uploadMutation.mutateAsync({
          documentType: selectedType,
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
          fileSize: file.size,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Failed to process file');
    }
  };

  const documents = documentsQuery.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Upload supporting documents like ID, proof of income, and bank statements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOCUMENT_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className="text-xs"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {uploadError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            } ${uploadMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={uploadMutation.isPending || !selectedType}
            />
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Drag and drop your file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse (max 10MB)</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="w-5 h-5" />
            Your Documents
          </CardTitle>
          <CardDescription>
            {documents.length === 0 ? 'No documents uploaded yet' : `${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Upload documents to get started
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {doc.documentType}
                        </Badge>
                        <Badge
                          variant={
                            doc.status === 'verified'
                              ? 'default'
                              : doc.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {doc.status === 'verified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Download functionality can be implemented here
                        window.open(doc.fileUrl, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ documentId: doc.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
