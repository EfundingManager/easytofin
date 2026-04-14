import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface PensionsFormData {
  // Personal Information
  dateOfBirth: string;
  retirementAge: number;
  yearsToRetirement: number;
  
  // Current Pensions
  existingPensions: string;
  employerPension: boolean;
  employerContribution: string;
  
  // Income & Savings
  currentAnnualIncome: string;
  annualSavingsCapacity: string;
  existingSavings: string;
  
  // Retirement Goals
  retirementIncomeNeeded: string;
  retirementLifestyle: 'modest' | 'comfortable' | 'luxury';
  expectedLifeExpectancy: number;
  
  // Financial Obligations
  mortgage: boolean;
  mortgageBalance: string;
  mortgageEndDate: string;
  dependents: number;
  
  // Investment Preferences
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentExperience: 'none' | 'some' | 'experienced';
  
  // Additional Information
  inheritanceExpected: boolean;
  inheritanceAmount: string;
  otherIncome: string;
}

interface PensionsFormProps {
  onSubmit: (data: PensionsFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function PensionsForm({ onSubmit, isLoading = false }: PensionsFormProps) {
  const [formData, setFormData] = useState<PensionsFormData>({
    dateOfBirth: '',
    retirementAge: 65,
    yearsToRetirement: 0,
    existingPensions: '',
    employerPension: false,
    employerContribution: '',
    currentAnnualIncome: '',
    annualSavingsCapacity: '',
    existingSavings: '',
    retirementIncomeNeeded: '',
    retirementLifestyle: 'comfortable',
    expectedLifeExpectancy: 85,
    mortgage: false,
    mortgageBalance: '',
    mortgageEndDate: '',
    dependents: 0,
    riskTolerance: 'moderate',
    investmentExperience: 'some',
    inheritanceExpected: false,
    inheritanceAmount: '',
    otherIncome: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.currentAnnualIncome) {
      setError('Current annual income is required');
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
          <CardTitle>Pensions Planning Fact-Finding Form</CardTitle>
          <CardDescription>
            Help us understand your retirement goals and create a personalized pension strategy
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Target Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    name="retirementAge"
                    type="number"
                    min="50"
                    max="75"
                    value={formData.retirementAge}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedLifeExpectancy">Expected Life Expectancy</Label>
                  <Input
                    id="expectedLifeExpectancy"
                    name="expectedLifeExpectancy"
                    type="number"
                    min="70"
                    max="100"
                    value={formData.expectedLifeExpectancy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  name="dependents"
                  type="number"
                  min="0"
                  value={formData.dependents}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Current Pensions */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Current Pension Arrangements</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="employerPension"
                  checked={formData.employerPension}
                  onCheckedChange={handleCheckboxChange('employerPension')}
                />
                <Label htmlFor="employerPension" className="cursor-pointer">
                  I have an employer pension scheme
                </Label>
              </div>

              {formData.employerPension && (
                <div className="space-y-2">
                  <Label htmlFor="employerContribution">Employer Contribution (annual €)</Label>
                  <Input
                    id="employerContribution"
                    name="employerContribution"
                    type="number"
                    placeholder="0"
                    value={formData.employerContribution}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="existingPensions">Details of Existing Pensions</Label>
                <textarea
                  id="existingPensions"
                  name="existingPensions"
                  placeholder="List any existing pensions, ARFs, PRSAs, or retirement savings"
                  value={formData.existingPensions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>
            </div>

            {/* Income & Savings */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Income & Savings</h3>

              <div className="space-y-2">
                <Label htmlFor="currentAnnualIncome">Current Annual Income (€) *</Label>
                <Input
                  id="currentAnnualIncome"
                  name="currentAnnualIncome"
                  type="number"
                  placeholder="0"
                  value={formData.currentAnnualIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualSavingsCapacity">Annual Savings Capacity (€)</Label>
                <Input
                  id="annualSavingsCapacity"
                  name="annualSavingsCapacity"
                  type="number"
                  placeholder="0"
                  value={formData.annualSavingsCapacity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="existingSavings">Existing Savings & Investments (€)</Label>
                <Input
                  id="existingSavings"
                  name="existingSavings"
                  type="number"
                  placeholder="0"
                  value={formData.existingSavings}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="inheritanceExpected"
                  checked={formData.inheritanceExpected}
                  onCheckedChange={handleCheckboxChange('inheritanceExpected')}
                />
                <Label htmlFor="inheritanceExpected" className="cursor-pointer">
                  I expect to receive an inheritance
                </Label>
              </div>

              {formData.inheritanceExpected && (
                <div className="space-y-2">
                  <Label htmlFor="inheritanceAmount">Expected Inheritance Amount (€)</Label>
                  <Input
                    id="inheritanceAmount"
                    name="inheritanceAmount"
                    type="number"
                    placeholder="0"
                    value={formData.inheritanceAmount}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            {/* Retirement Goals */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Retirement Goals</h3>

              <div className="space-y-2">
                <Label htmlFor="retirementLifestyle">Desired Retirement Lifestyle *</Label>
                <select
                  id="retirementLifestyle"
                  name="retirementLifestyle"
                  value={formData.retirementLifestyle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="modest">Modest (basic needs covered)</option>
                  <option value="comfortable">Comfortable (current lifestyle maintained)</option>
                  <option value="luxury">Luxury (enhanced lifestyle)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirementIncomeNeeded">Annual Retirement Income Needed (€)</Label>
                <Input
                  id="retirementIncomeNeeded"
                  name="retirementIncomeNeeded"
                  type="number"
                  placeholder="0"
                  value={formData.retirementIncomeNeeded}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Financial Obligations */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Financial Obligations</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="mortgage"
                  checked={formData.mortgage}
                  onCheckedChange={handleCheckboxChange('mortgage')}
                />
                <Label htmlFor="mortgage" className="cursor-pointer">
                  I have an outstanding mortgage
                </Label>
              </div>

              {formData.mortgage && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mortgageBalance">Mortgage Balance (€)</Label>
                    <Input
                      id="mortgageBalance"
                      name="mortgageBalance"
                      type="number"
                      placeholder="0"
                      value={formData.mortgageBalance}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mortgageEndDate">Mortgage End Date</Label>
                    <Input
                      id="mortgageEndDate"
                      name="mortgageEndDate"
                      type="date"
                      value={formData.mortgageEndDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Investment Preferences */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Investment Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
                <select
                  id="riskTolerance"
                  name="riskTolerance"
                  value={formData.riskTolerance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="conservative">Conservative (capital preservation)</option>
                  <option value="moderate">Moderate (balanced growth)</option>
                  <option value="aggressive">Aggressive (maximum growth)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentExperience">Investment Experience *</Label>
                <select
                  id="investmentExperience"
                  name="investmentExperience"
                  value={formData.investmentExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="none">No experience</option>
                  <option value="some">Some experience</option>
                  <option value="experienced">Experienced investor</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="otherIncome">Other Sources of Retirement Income</Label>
                <textarea
                  id="otherIncome"
                  name="otherIncome"
                  placeholder="e.g., State pension, rental income, part-time work plans"
                  value={formData.otherIncome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
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
              Your information will be used to create a personalized pension plan tailored to your retirement goals.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
