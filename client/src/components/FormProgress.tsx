import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export interface FormProgressData {
  product: string;
  completed: boolean;
  submittedAt: Date | null;
}

interface FormProgressProps {
  progress: FormProgressData[];
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
}

const PRODUCT_LABELS: Record<string, { label: string; icon: string }> = {
  protection: { label: 'Life Protection', icon: '🛡️' },
  pensions: { label: 'Pensions Planning', icon: '🏦' },
  healthInsurance: { label: 'Health Insurance', icon: '🏥' },
  generalInsurance: { label: 'General Insurance', icon: '🏠' },
  investments: { label: 'Investments', icon: '📈' },
};

export default function FormProgress({ progress, completedCount, totalCount, completionPercentage }: FormProgressProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Fact-Finding Progress</CardTitle>
        <CardDescription>
          Complete all forms to get personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm font-semibold text-primary">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {completionPercentage}% complete
            </p>
          </div>
        </div>

        {/* Individual Form Progress */}
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-sm font-semibold">Forms Status</h3>
          <div className="space-y-2">
            {progress.map((item) => {
              const productInfo = PRODUCT_LABELS[item.product];
              return (
                <div
                  key={item.product}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className="text-lg">{productInfo.icon}</div>

                  {/* Status */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{productInfo.label}</p>
                    {item.completed && item.submittedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Submitted on {new Date(item.submittedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not started</p>
                    )}
                  </div>

                  {/* Completion Indicator */}
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-900">
              <strong>🎉 Excellent!</strong> You've completed all fact-finding forms. Our team will review your information and contact you shortly with personalized recommendations.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Next Step:</strong> Complete the remaining {totalCount - completedCount} form{totalCount - completedCount !== 1 ? 's' : ''} to help us provide you with the best recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
