import React, { useState } from "react";
import { FileText, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DocumentReview() {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Fetch all documents for admin review
  const documentsQuery = trpc.kycDocuments.getDocuments.useQuery({});
  const approveMutation = trpc.kycDocuments.approveDocument.useMutation();
  const rejectMutation = trpc.kycDocuments.rejectDocument.useMutation();

  const handleApprove = async () => {
    if (!selectedDocument) return;

    try {
      await approveMutation.mutateAsync({
        documentId: selectedDocument.id,
        notes: approvalNotes,
      });

      // Refresh documents list
      documentsQuery.refetch();
      setSelectedDocument(null);
      setApprovalNotes("");
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        documentId: selectedDocument.id,
        reason: rejectionReason,
      });

      // Refresh documents list
      documentsQuery.refetch();
      setSelectedDocument(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const documents = documentsQuery.data?.documents || [];
  const pendingDocs = documents.filter((d) => d.status === "pending");
  const verifiedDocs = documents.filter((d) => d.status === "verified");
  const rejectedDocs = documents.filter((d) => d.status === "rejected");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDocs.length}</div>
            <p className="text-xs text-gray-500">Documents awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedDocs.length}</div>
            <p className="text-xs text-gray-500">Documents approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedDocs.length}</div>
            <p className="text-xs text-gray-500">Documents rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingDocs.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({verifiedDocs.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedDocs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingDocs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No pending documents</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                {pendingDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc)}
                    className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedDocument?.id === doc.id ? "border-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <p className="font-medium text-sm">{doc.documentType}</p>
                    <p className="text-xs text-gray-500">{doc.fileName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {selectedDocument ? (
                  <DocumentReviewPanel
                    document={selectedDocument}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    approvalNotes={approvalNotes}
                    setApprovalNotes={setApprovalNotes}
                    isApproving={approveMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-gray-500">Select a document to review</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedDocs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No verified documents</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {verifiedDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedDocs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No rejected documents</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedDocs.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentReviewPanel({
  document,
  onApprove,
  onReject,
  rejectionReason,
  setRejectionReason,
  approvalNotes,
  setApprovalNotes,
  isApproving,
  isRejecting,
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {document.fileName}
        </CardTitle>
        <CardDescription>
          {document.documentType} • Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Preview Link */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Download className="w-4 h-4" />
            View Document
          </a>
        </div>

        {/* Approval Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Approval Notes (Optional)</label>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add any notes about this document..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Rejection Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this document is being rejected..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <Button
            onClick={onReject}
            disabled={isRejecting || isApproving || !rejectionReason.trim()}
            variant="destructive"
            className="flex-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentCard({ document }: { document: any }) {
  const statusConfig = {
    pending: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50" },
    verified: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  };

  const config = statusConfig[document.status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Icon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-1`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{document.fileName}</p>
            <p className="text-sm text-gray-500">
              {document.documentType} • {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
            {document.notes && (
              <p className="text-sm mt-2 p-2 bg-gray-50 rounded">{document.notes}</p>
            )}
          </div>
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex-shrink-0"
          >
            View
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
