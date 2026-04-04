import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface InvestmentsFormData {
  // Personal Information
  dateOfBirth: string;
  employmentStatus: 'employed' | 'self-employed' | 'retired' | 'unemployed';
  
  // Financial Situation
  annualIncome: string;
  existingSavings: string;
  monthlyInvestmentCapacity: string;
  totalInvestmentCapital: string;
  
  // Investment Experience
  investmentExperience: 'none' | 'beginner' | 'intermediate' | 'advanced';
  previousInvestments: string;
  
  // Investment Goals
  investmentObjective: 'growth' | 'income' | 'preservation' | 'mixed';
  investmentTimeframe: '1-3years' | '3-5years' | '5-10years' | '10plus';
  targetReturnExpectation: 'conservative' | 'moderate' | 'aggressive';
  
  // Risk Profile
  riskTolerance: 'low' | 'medium' | 'high';
  comfortWithVolatility: 'very-uncomfortable' | 'somewhat-uncomfortable' | 'neutral' | 'comfortable' | 'very-comfortable';
  maxAcceptableLoss: string;
  
  // Financial Obligations
  outstandingDebts: string;
  monthlyExpenses: string;
  emergencyFund: boolean;
  emergencyFundAmount: string;
  
  // Investment Preferences
  preferredAssetClasses: string[];
  excludedInvestments: string;
  esgPreference: 'not-important' | 'somewhat-important' | 'very-important';
  
  // Tax Considerations
  taxBracket: 'low' | 'medium' | 'high';
  taxEfficientInvesting: boolean;
}

interface InvestmentsFormProps {
  onSubmit: (data: InvestmentsFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function InvestmentsForm({ onSubmit, isLoading = false }: InvestmentsFormProps) {
  const [formData, setFormData] = useState<InvestmentsFormData>({
    dateOfBirth: '',
    employmentStatus: 'employed',
    annualIncome: '',
    existingSavings: '',
    monthlyInvestmentCapacity: '',
    totalInvestmentCapital: '',
    investmentExperience: 'beginner',
    previousInvestments: '',
    investmentObjective: 'growth',
    investmentTimeframe: '5-10years',
    targetReturnExpectation: 'moderate',
    riskTolerance: 'medium',
    comfortWithVolatility: 'neutral',
    maxAcceptableLoss: '',
    outstandingDebts: '',
    monthlyExpenses: '',
    emergencyFund: true,
    emergencyFundAmount: '',
    preferredAssetClasses: ['stocks', 'bonds'],
    excludedInvestments: '',
    esgPreference: 'somewhat-important',
    taxBracket: 'medium',
    taxEfficientInvesting: false,
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAssetClassToggle = (assetClass: string) => {
    setFormData(prev => ({
      ...prev,
      preferredAssetClasses: prev.preferredAssetClasses.includes(assetClass)
        ? prev.preferredAssetClasses.filter(a => a !== assetClass)
        : [...prev.preferredAssetClasses, assetClass],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.annualIncome) {
      setError('Annual income is required');
      return;
    }
    if (formData.preferredAssetClasses.length === 0) {
      setError('Please select at least one asset class');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Investment Planning Fact-Finding Form</CardTitle>
          <CardDescription>
            Help us create a personalized investment strategy aligned with your goals and risk tolerance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="flex items-gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status *</Label>
                <select
                  id="employmentStatus"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
            </div>

            {/* Financial Situation */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Financial Situation</h3>

              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income (€) *</Label>
                <Input
                  id="annualIncome"
                  name="annualIncome"
                  type="number"
                  placeholder="0"
                  value={formData.annualIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="existingSavings">Existing Savings (€)</Label>
                  <Input
                    id="existingSavings"
                    name="existingSavings"
                    type="number"
                    placeholder="0"
                    value={formData.existingSavings}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyInvestmentCapacity">Monthly Investment Capacity (€)</Label>
                  <Input
                    id="monthlyInvestmentCapacity"
                    name="monthlyInvestmentCapacity"
                    type="number"
                    placeholder="0"
                    value={formData.monthlyInvestmentCapacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalInvestmentCapital">Total Investment Capital Available (€)</Label>
                <Input
                  id="totalInvestmentCapital"
                  name="totalInvestmentCapital"
                  type="number"
                  placeholder="0"
                  value={formData.totalInvestmentCapital}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Investment Experience */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Investment Experience</h3>

              <div className="space-y-2">
                <Label htmlFor="investmentExperience">Investment Experience Level *</Label>
                <select
                  id="investmentExperience"
                  name="investmentExperience"
                  value={formData.investmentExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="none">No experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousInvestments">Previous Investment Experience</Label>
                <textarea
                  id="previousInvestments"
                  name="previousInvestments"
                  placeholder="Describe any previous investments you've made"
                  value={formData.previousInvestments}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>
            </div>

            {/* Investment Goals */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Investment Goals</h3>

              <div className="space-y-2">
                <Label htmlFor="investmentObjective">Primary Investment Objective *</Label>
                <select
                  id="investmentObjective"
                  name="investmentObjective"
                  value={formData.investmentObjective}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="growth">Capital Growth</option>
                  <option value="income">Income Generation</option>
                  <option value="preservation">Capital Preservation</option>
                  <option value="mixed">Mixed Objectives</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentTimeframe">Investment Timeframe *</Label>
                <select
                  id="investmentTimeframe"
                  name="investmentTimeframe"
                  value={formData.investmentTimeframe}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="1-3years">1-3 years</option>
                  <option value="3-5years">3-5 years</option>
                  <option value="5-10years">5-10 years</option>
                  <option value="10plus">10+ years</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetReturnExpectation">Target Return Expectation *</Label>
                <select
                  id="targetReturnExpectation"
                  name="targetReturnExpectation"
                  value={formData.targetReturnExpectation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="conservative">Conservative (2-4% annually)</option>
                  <option value="moderate">Moderate (4-7% annually)</option>
                  <option value="aggressive">Aggressive (7%+ annually)</option>
                </select>
              </div>
            </div>

            {/* Risk Profile */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Risk Profile</h3>

              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
                <select
                  id="riskTolerance"
                  name="riskTolerance"
                  value={formData.riskTolerance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="low">Low (capital preservation priority)</option>
                  <option value="medium">Medium (balanced approach)</option>
                  <option value="high">High (growth priority)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comfortWithVolatility">Comfort with Market Volatility *</Label>
                <select
                  id="comfortWithVolatility"
                  name="comfortWithVolatility"
                  value={formData.comfortWithVolatility}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="very-uncomfortable">Very Uncomfortable</option>
                  <option value="somewhat-uncomfortable">Somewhat Uncomfortable</option>
                  <option value="neutral">Neutral</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="very-comfortable">Very Comfortable</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAcceptableLoss">Maximum Acceptable Loss (%) in Down Market</Label>
                <Input
                  id="maxAcceptableLoss"
                  name="maxAcceptableLoss"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 20"
                  value={formData.maxAcceptableLoss}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Financial Obligations */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Financial Obligations</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="outstandingDebts">Outstanding Debts (€)</Label>
                  <Input
                    id="outstandingDebts"
                    name="outstandingDebts"
                    type="number"
                    placeholder="0"
                    value={formData.outstandingDebts}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Expenses (€)</Label>
                  <Input
                    id="monthlyExpenses"
                    name="monthlyExpenses"
                    type="number"
                    placeholder="0"
                    value={formData.monthlyExpenses}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="emergencyFund"
                  name="emergencyFund"
                  checked={formData.emergencyFund}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="emergencyFund" className="cursor-pointer">
                  I have an emergency fund
                </Label>
              </div>

              {formData.emergencyFund && (
                <div className="space-y-2">
                  <Label htmlFor="emergencyFundAmount">Emergency Fund Amount (€)</Label>
                  <Input
                    id="emergencyFundAmount"
                    name="emergencyFundAmount"
                    type="number"
                    placeholder="0"
                    value={formData.emergencyFundAmount}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {/* Investment Preferences */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Investment Preferences</h3>

              <div className="space-y-3">
                <Label>Preferred Asset Classes *</Label>
                <div className="space-y-2">
                  {[
                    { id: 'stocks', label: 'Stocks/Equities' },
                    { id: 'bonds', label: 'Bonds/Fixed Income' },
                    { id: 'reits', label: 'Real Estate (REITs)' },
                    { id: 'commodities', label: 'Commodities' },
                    { id: 'crypto', label: 'Cryptocurrencies' },
                    { id: 'funds', label: 'Mutual Funds/ETFs' },
                  ].map(asset => (
                    <div key={asset.id} className="flex items-center gap-2">
                      <Checkbox
                        id={asset.id}
                        checked={formData.preferredAssetClasses.includes(asset.id)}
                        onChange={() => handleAssetClassToggle(asset.id)}
                      />
                      <Label htmlFor={asset.id} className="cursor-pointer">
                        {asset.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excludedInvestments">Investments to Exclude</Label>
                <textarea
                  id="excludedInvestments"
                  name="excludedInvestments"
                  placeholder="List any investments you want to avoid"
                  value={formData.excludedInvestments}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="esgPreference">ESG (Environmental, Social, Governance) Preference *</Label>
                <select
                  id="esgPreference"
                  name="esgPreference"
                  value={formData.esgPreference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="not-important">Not Important</option>
                  <option value="somewhat-important">Somewhat Important</option>
                  <option value="very-important">Very Important</option>
                </select>
              </div>
            </div>

            {/* Tax Considerations */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Tax Considerations</h3>

              <div className="space-y-2">
                <Label htmlFor="taxBracket">Tax Bracket *</Label>
                <select
                  id="taxBracket"
                  name="taxBracket"
                  value={formData.taxBracket}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="taxEfficientInvesting"
                  name="taxEfficientInvesting"
                  checked={formData.taxEfficientInvesting}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="taxEfficientInvesting" className="cursor-pointer">
                  I'm interested in tax-efficient investing strategies
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your investment profile will be used to create a personalized investment strategy tailored to your goals.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
