import React, { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface PreviewableFile {
  id?: string;
  file?: File;
  url?: string;
  fileName: string;
  documentType: string;
  status: "pending" | "verified" | "rejected";
  uploadedAt?: Date;
}

interface ImagePreviewProps {
  files: PreviewableFile[];
  onClose?: () => void;
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  file: PreviewableFile | null;
  allFiles: PreviewableFile[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Thumbnail Grid Component - displays small previews of uploaded images
 */
export function ImagePreviewGrid({ files, onClose }: ImagePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<PreviewableFile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageFiles = files.filter((f) => {
    const url = f.url || (f.file ? URL.createObjectURL(f.file) : "");
    return url && isImageFile(f.fileName);
  });

  if (imageFiles.length === 0) {
    return null;
  }

  const handleThumbnailClick = (file: PreviewableFile, index: number) => {
    setSelectedFile(file);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % imageFiles.length;
    setCurrentIndex(nextIndex);
    setSelectedFile(imageFiles[nextIndex]);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + imageFiles.length) % imageFiles.length;
    setCurrentIndex(prevIndex);
    setSelectedFile(imageFiles[prevIndex]);
  };

  return (
    <>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Image Previews</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {imageFiles.map((file, index) => (
            <ThumbnailCard
              key={file.fileName}
              file={file}
              isSelected={selectedFile?.fileName === file.fileName}
              onClick={() => handleThumbnailClick(file, index)}
            />
          ))}
        </div>
      </div>

      <ImagePreviewModal
        isOpen={selectedFile !== null}
        file={selectedFile}
        allFiles={imageFiles}
        currentIndex={currentIndex}
        onClose={() => setSelectedFile(null)}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
}

/**
 * Individual Thumbnail Card Component
 */
function ThumbnailCard({
  file,
  isSelected,
  onClick,
}: {
  file: PreviewableFile;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState(false);

  React.useEffect(() => {
    if (file.url) {
      setImageUrl(file.url);
    } else if (file.file) {
      const url = URL.createObjectURL(file.file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (error || !imageUrl) {
    return (
      <div
        className={`aspect-square rounded-lg border-2 bg-gray-100 flex items-center justify-center cursor-pointer transition-all ${
          isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={onClick}
      >
        <span className="text-xs text-gray-500 text-center px-2">No preview</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
      }`}
      title={file.fileName}
    >
      <img
        src={imageUrl}
        alt={file.fileName}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
      {isSelected && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-lg" />
      )}
    </button>
  );
}

/**
 * Full-Size Image Preview Modal with Navigation
 */
function ImagePreviewModal({
  isOpen,
  file,
  allFiles,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>("");

  React.useEffect(() => {
    if (file?.url) {
      setImageUrl(file.url);
    } else if (file?.file) {
      const url = URL.createObjectURL(file.file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 50));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(() => {
    if (!imageUrl || !file) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, file]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "Escape") onClose();
    },
    [isOpen, onNext, onPrevious, onClose]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 bg-black/95">
        <DialogHeader className="sr-only">
          <DialogTitle>Image Preview - {file.fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Header with File Info */}
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">{file.fileName}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {currentIndex + 1} of {allFiles.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-hidden bg-black/50 relative">
            {imageUrl ? (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={imageUrl}
                  alt={file.fileName}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <p>Unable to load image</p>
              </div>
            )}

            {/* Navigation Arrows */}
            {allFiles.length > 1 && (
              <>
                <button
                  onClick={onPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Previous (←)"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Next (→)"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Controls Footer */}
          <div className="border-t border-gray-700 px-4 py-3 bg-black/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="text-gray-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-400 min-w-[3rem] text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="text-gray-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-gray-400 hover:text-white"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Keyboard Hints */}
          <div className="px-4 py-2 bg-gray-900/50 text-center text-xs text-gray-500">
            {allFiles.length > 1 && <span>← → to navigate • </span>}
            <span>Esc to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper function to check if file is an image
 */
function isImageFile(fileName: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return imageExtensions.includes(ext);
}

/**
 * Helper function to check if file is a PDF
 */
export function isPdfFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith(".pdf");
}
