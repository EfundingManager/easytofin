import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface PolicyAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
  onSuccess?: () => void;
}

export function PolicyAssignmentModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onSuccess,
}: PolicyAssignmentModalProps) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [product, setProduct] = useState<"protection" | "pensions" | "healthInsurance" | "generalInsurance" | "investments" | "">("");
  const [insurerName, setInsurerName] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignPolicyMutation = trpc.workflow.assignPolicy.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!policyNumber.trim()) {
      newErrors.policyNumber = "Policy number is required";
    }
    if (!product) {
      newErrors.product = "Product type is required";
    }
    if (premiumAmount && isNaN(parseFloat(premiumAmount))) {
      newErrors.premiumAmount = "Premium amount must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await assignPolicyMutation.mutateAsync({
        clientId,
        policyNumber: policyNumber.trim(),
        product: product as "protection" | "pensions" | "healthInsurance" | "generalInsurance" | "investments",
        insurerName: insurerName.trim() || undefined,
        premiumAmount: premiumAmount.trim() || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setPolicyNumber("");
      setProduct("");
      setInsurerName("");
      setPremiumAmount("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setErrors({});

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to assign policy:", error);
      setErrors({ submit: "Failed to assign policy. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPolicyNumber("");
      setProduct("");
      setInsurerName("");
      setPremiumAmount("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Policy</DialogTitle>
          <DialogDescription>
            Assign a policy to {clientName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Policy Number */}
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number *</Label>
            <Input
              id="policyNumber"
              placeholder="e.g., POL-2026-001234"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              disabled={isSubmitting}
              className={errors.policyNumber ? "border-red-500" : ""}
            />
            {errors.policyNumber && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.policyNumber}
              </p>
            )}
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label htmlFor="product">Product Type *</Label>
            <Select value={product} onValueChange={(value: any) => setProduct(value)} disabled={isSubmitting}>
              <SelectTrigger id="product" className={errors.product ? "border-red-500" : ""}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protection">Protection</SelectItem>
                <SelectItem value="pensions">Pensions</SelectItem>
                <SelectItem value="healthInsurance">Health Insurance</SelectItem>
                <SelectItem value="generalInsurance">General Insurance</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
              </SelectContent>
            </Select>
            {errors.product && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.product}
              </p>
            )}
          </div>

          {/* Insurer Name */}
          <div className="space-y-2">
            <Label htmlFor="insurerName">Insurer Name</Label>
            <Input
              id="insurerName"
              placeholder="e.g., Insurance Company Ltd"
              value={insurerName}
              onChange={(e) => setInsurerName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Premium Amount */}
          <div className="space-y-2">
            <Label htmlFor="premiumAmount">Premium Amount</Label>
            <Input
              id="premiumAmount"
              placeholder="e.g., 250.00"
              type="text"
              value={premiumAmount}
              onChange={(e) => setPremiumAmount(e.target.value)}
              disabled={isSubmitting}
              className={errors.premiumAmount ? "border-red-500" : ""}
            />
            {errors.premiumAmount && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.premiumAmount}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this policy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Success Message */}
          {assignPolicyMutation.isSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600">Policy assigned successfully!</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Assign Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
