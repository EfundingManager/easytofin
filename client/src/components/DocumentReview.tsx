import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

interface DocumentReviewProps {
  document: {
    id: number;
    userId: number;
    type: string;
    s3Key: string;
    url: string;
    status: "pending" | "verified" | "rejected";
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  onStatusUpdate?: () => void;
}

export function DocumentReview({ document, onStatusUpdate }: DocumentReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "verified" | "rejected">(document.status);

  const updateStatusMutation = trpc.documentReview.updateDocumentStatus.useMutation();
  const addNoteMutation = trpc.documentReview.addDocumentNote.useMutation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        documentId: document.id,
        status: selectedStatus,
        notes: newNote || undefined,
      });
      setNewNote("");
      setIsEditing(false);
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNoteMutation.mutateAsync({
        documentId: document.id,
        note: newNote,
      });
      setNewNote("");
      onStatusUpdate?.();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{document.type}</CardTitle>
              <p className="text-sm text-gray-500">
                Uploaded {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(document.status)}
            <Badge className={getStatusColor(document.status)}>
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Document
          </a>
        </div>

        {/* Existing Notes */}
        {document.notes && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm mb-2">Review Notes:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{document.notes}</p>
          </div>
        )}

        {/* Status Update Section */}
        {isEditing ? (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="text-sm font-medium">Update Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Add Note</label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add review notes or reason for rejection..."
                className="w-full mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className="flex-1"
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
            Review Document
          </Button>
        )}

        {/* Quick Add Note */}
        {!isEditing && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Note</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a quick note..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                size="sm"
              >
                {addNoteMutation.isPending ? "..." : "Add"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
