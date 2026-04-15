import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download, Copy, Eye, Code } from "lucide-react";

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: number;
    name: string;
    subject: string;
    htmlContent: string;
    plainTextContent?: string;
    category: string;
    isActive: string;
    slug?: string;
  } | null;
}

export function EmailTemplatePreviewModal({
  isOpen,
  onClose,
  template,
}: EmailTemplatePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "html">("preview");

  if (!template) return null;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(template.htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([template.htmlContent], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] md:w-full">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-2">
                <div className="space-y-2">
                  <p className="text-sm">Subject: {template.subject}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    {template.isActive === "true" && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "preview" | "html")} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-2">
              <Code className="w-4 h-4" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto bg-muted/50 rounded-lg p-2 md:p-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <iframe
                  srcDoc={template.htmlContent}
                  className="w-full h-[400px] md:h-[600px] border-0"
                  title={`Preview of ${template.name}`}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto bg-muted rounded-lg p-2 md:p-4 font-mono text-xs md:text-sm">
              <pre className="whitespace-pre-wrap break-words text-foreground">
                {template.htmlContent}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleCopyHtml} className="gap-2">
            <Copy className="w-4 h-4" />
            {copied ? "Copied!" : "Copy HTML"}
          </Button>
          <Button variant="outline" onClick={handleDownloadHtml} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
