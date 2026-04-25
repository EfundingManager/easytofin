import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface KYCPDFExportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

/**
 * Button component for exporting KYC form data as PDF
 * Generates a comprehensive summary PDF of all completed KYC forms
 */
export function KYCPDFExportButton({
  className,
  variant = 'outline',
  size = 'default',
  showLabel = true,
}: KYCPDFExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const generatePdfMutation = trpc.pdfExport.generateKYCSummaryPDF.useMutation();

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      toast.loading('Generating PDF...');

      const result = await generatePdfMutation.mutateAsync();

      if (result.success && result.pdfBase64) {
        // Convert base64 to blob
        const binaryString = atob(result.pdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success(`PDF exported successfully: ${result.filename}`);
      } else {
        toast.dismiss();
        toast.error('Failed to generate PDF');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isLoading || generatePdfMutation.isPending}
      variant={variant}
      size={size}
      className={className}
      title="Export all KYC forms as PDF"
    >
      {isLoading || generatePdfMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {showLabel && 'Exporting...'}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {showLabel && 'Export PDF'}
        </>
      )}
    </Button>
  );
}
