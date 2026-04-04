import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import ProtectionForm, { ProtectionFormData } from '@/components/FactFindingForms/ProtectionForm';
import PensionsForm, { PensionsFormData } from '@/components/FactFindingForms/PensionsForm';
import HealthInsuranceForm, { HealthInsuranceFormData } from '@/components/FactFindingForms/HealthInsuranceForm';
import GeneralInsuranceForm, { GeneralInsuranceFormData } from '@/components/FactFindingForms/GeneralInsuranceForm';
import InvestmentsForm, { InvestmentsFormData } from '@/components/FactFindingForms/InvestmentsForm';

type FormData = ProtectionFormData | PensionsFormData | HealthInsuranceFormData | GeneralInsuranceFormData | InvestmentsFormData;

const PRODUCT_INFO: Record<string, { title: string; description: string; icon: string }> = {
  protection: {
    title: 'Life Protection',
    description: 'Comprehensive life insurance to protect your family\'s financial future',
    icon: '🛡️',
  },
  pensions: {
    title: 'Pensions Planning',
    description: 'Retirement planning and pension strategies for your future',
    icon: '🏦',
  },
  healthInsurance: {
    title: 'Health Insurance',
    description: 'Private health insurance for you and your family',
    icon: '🏥',
  },
  generalInsurance: {
    title: 'General Insurance',
    description: 'Home, motor, and liability insurance coverage',
    icon: '🏠',
  },
  investments: {
    title: 'Investments',
    description: 'Investment planning and portfolio management',
    icon: '📈',
  },
};

export default function FactFindingForm() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/fact-finding/:product');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = (params?.product as string) || '';
  const productInfo = PRODUCT_INFO[product];

  const saveFormMutation = trpc.profile.submitFactFindingForm.useMutation();

  if (!match || !productInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Fact-Finding Forms</h1>
            <p className="text-lg text-muted-foreground">
              Select a service to complete your detailed fact-finding form
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PRODUCT_INFO).map(([key, info]) => (
              <Card
                key={key}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/fact-finding/${key}`)}
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <CardTitle>{info.title}</CardTitle>
                  <CardDescription>{info.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Form</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveFormMutation.mutateAsync({
        product: product as any,
        formData: JSON.stringify(data),
      });

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setLocation('/dashboard');
        }, 3000);
      } else {
        setError(result.error || 'Failed to submit form');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle>Form Submitted Successfully!</CardTitle>
            <CardDescription>
              Thank you for completing the {productInfo.title} fact-finding form. We'll review your information and contact you shortly with personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Redirecting to dashboard in a few seconds...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/fact-finding')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span>{productInfo.icon}</span>
              {productInfo.title} Form
            </h1>
            <p className="text-muted-foreground">{productInfo.description}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form Component */}
        <div>
          {product === 'protection' && (
            <ProtectionForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
          {product === 'pensions' && (
            <PensionsForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
          {product === 'healthInsurance' && (
            <HealthInsuranceForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
          {product === 'generalInsurance' && (
            <GeneralInsuranceForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
          {product === 'investments' && (
            <InvestmentsForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
          )}
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Please provide accurate and detailed information to help us create the best recommendations for your financial needs. All information is kept confidential and secure.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
