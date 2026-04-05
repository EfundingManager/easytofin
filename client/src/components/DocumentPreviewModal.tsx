import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";

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

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setZoom(100);
      setIsLoading(true);
    }
  }, [isOpen, document]);

  if (!document) return null;

  const isPDF = document.mimeType?.includes("pdf") || document.fileName.toLowerCase().endsWith(".pdf");
  const isImage = document.mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(document.fileName);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 truncate">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{document.fileName}</span>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {document.status && (
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {document.status}
                  </span>
                )}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-50 rounded-lg flex items-center justify-center min-h-[400px]">
          {isPDF ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center mb-4">PDF Preview</p>
              <p className="text-sm text-gray-500 text-center mb-4">
                PDF preview is not supported in the browser. Please download the file to view it.
              </p>
              <Button asChild className="gap-2">
                <a href={document.fileUrl} download={document.fileName} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          ) : isImage ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <img
                src={document.fileUrl}
                alt={document.fileName}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", zoom: `${zoom}%` }}
                onLoad={() => setIsLoading(false)}
                className="rounded"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-4">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center mb-4">Preview Not Available</p>
              <p className="text-sm text-gray-500 text-center mb-4">
                This file type cannot be previewed in the browser.
              </p>
              <Button asChild className="gap-2">
                <a href={document.fileUrl} download={document.fileName} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          {/* Left: File Info */}
          <div className="text-sm text-gray-600">
            <p>
              {document.uploadedAt &&
                new Date(document.uploadedAt).toLocaleDateString("en-IE", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
            </p>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Right: Download Button */}
          <Button asChild variant="default" size="sm" className="gap-2">
            <a href={document.fileUrl} download={document.fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
