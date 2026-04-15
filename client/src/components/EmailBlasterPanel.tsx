import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, Trash2, RefreshCw, Mail, Eye, Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmailTemplatePreviewModal } from "./EmailTemplatePreviewModal";

export function EmailBlasterPanel() {
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all templates
  const { data: templates, isLoading, refetch } = trpc.emailBlaster.getAllTemplates.useQuery();

  // Import mutation
  const importMutation = trpc.emailBlaster.importFromSendGrid.useMutation({
    onSuccess: (data) => {
      setIsImporting(false);
      setImportMessage({
        type: "success",
        text: `Successfully imported ${data.imported} out of ${data.total} templates`,
      });
      refetch();
      setTimeout(() => setImportMessage(null), 5000);
    },
    onError: (error) => {
      setIsImporting(false);
      setImportMessage({
        type: "error",
        text: `Import failed: ${error.message}`,
      });
      setTimeout(() => setImportMessage(null), 5000);
    },
  });

  // Delete mutation
  const deleteMutation = trpc.emailBlaster.deleteTemplate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleImport = async () => {
    setIsImporting(true);
    setImportMessage(null);
    await importMutation.mutateAsync();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate({ id });
    }
  };

  // Filter and search logic
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories from templates
  const categories = Array.from(new Set(templates?.map((t) => t.category) || []));

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SendGrid Template Import
          </CardTitle>
          <CardDescription>Import email templates from your SendGrid account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {importMessage && (
            <Alert variant={importMessage.type === "error" ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importMessage.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={isImporting || importMutation.isPending}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isImporting || importMutation.isPending ? "Importing..." : "Import Templates"}
            </Button>
            <p className="text-sm text-muted-foreground py-2">
              {templates?.length ? `${templates.length} templates available` : "No templates imported yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Manage imported email templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Section */}
          {templates && templates.length > 0 && (
            <div className="space-y-3 pb-4 border-b">
              <div className="flex flex-col gap-3 md:flex-row md:gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(searchQuery || selectedCategory) && (
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
              {(searchQuery || selectedCategory) && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredTemplates.length} of {templates.length} templates
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : !templates || templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Click "Import Templates" to get started.
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates match your search or filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{template.subject}</p>
                    <div className="flex gap-2 mt-2">
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
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsPreviewOpen(true);
                      }}
                      title="Preview template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
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

      {/* Statistics */}
      {templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Template Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {templates.filter((t) => t.isActive === "true").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Template Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
}
