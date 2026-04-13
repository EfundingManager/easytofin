import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// KYC Form validation schema
const kycFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  idType: z.enum(["passport", "national_id", "drivers_license", "other"]),
  idNumber: z.string().min(1, "ID number is required"),
  idIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  idExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  occupation: z.string().optional(),
  employerName: z.string().optional(),
  sourceOfIncome: z.enum(["employment", "self_employed", "investment", "pension", "other"]),
  annualIncome: z.string().optional(),
  politicallyExposed: z.boolean().default(false),
  pepDetails: z.string().optional(),
});

type KYCFormData = z.infer<typeof kycFormSchema>;

interface KycFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function KycForm({ onSuccess, onCancel }: KycFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<KYCFormData>({
    resolver: zodResolver(kycFormSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      idType: "passport",
      idNumber: "",
      idIssueDate: "",
      idExpiryDate: "",
      occupation: "",
      employerName: "",
      sourceOfIncome: "employment",
      annualIncome: "",
      politicallyExposed: false,
      pepDetails: "",
    },
  });

  const submitFormMutation = trpc.kycForm.submitForm.useMutation();

  const onSubmit: SubmitHandler<KYCFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      await submitFormMutation.mutateAsync(data);
      setSubmitSuccess(true);
      toast.success("KYC form submitted successfully! Our team will review your application.");
      
      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setSubmitSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Error submitting KYC form:", error);
      toast.error("Failed to submit KYC form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h3 className="text-lg font-semibold">Application Submitted</h3>
            <p className="text-center text-sm text-gray-600">
              Thank you for submitting your KYC application. Our team will review your information and contact you within 2-3 business days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Know Your Customer (KYC) Verification</CardTitle>
        <CardDescription>
          Please provide your personal and identification information to complete the KYC verification process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality *</FormLabel>
                      <FormControl>
                        <Input placeholder="Irish" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dublin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="D01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ireland" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Identification Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Identification Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="idType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="national_id">National ID Card</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="idIssueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Issue Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Employment Information</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sourceOfIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source of Income *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source of income" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employment">Employment</SelectItem>
                          <SelectItem value="self_employed">Self-Employed</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="pension">Pension</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="€50,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PEP Section */}
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Politically Exposed Person (PEP)</h3>
              
              <FormField
                control={form.control}
                name="politicallyExposed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I am a Politically Exposed Person (PEP)
                      </FormLabel>
                      <FormDescription className="text-xs">
                        A PEP is a person who holds or has held a prominent public position
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("politicallyExposed") && (
                <FormField
                  control={form.control}
                  name="pepDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PEP Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide details about your PEP status..."
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Compliance Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By submitting this form, you confirm that all information provided is accurate and complete. False or misleading information may result in account suspension or legal action.
              </AlertDescription>
            </Alert>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || submitFormMutation.isPending}
                className="flex-1"
              >
                {isSubmitting || submitFormMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit KYC Application"
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
