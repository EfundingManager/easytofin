import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface ProtectionFormData {
  // Personal Information
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
  dependentAges: string;
  
  // Employment
  occupation: string;
  employmentStatus: 'employed' | 'self-employed' | 'retired' | 'unemployed';
  yearsInOccupation: number;
  
  // Health
  currentHealth: 'excellent' | 'good' | 'fair' | 'poor';
  medicalConditions: string;
  medications: string;
  smoker: boolean;
  
  // Financial
  annualIncome: string;
  existingCover: string;
  coverageNeeds: string;
  
  // Coverage Requirements
  lifeEventTrigger: string;
  priorityNeeds: string[];
  timeframe: 'immediate' | '1-3months' | '3-6months' | '6-12months';
}

interface ProtectionFormProps {
  onSubmit: (data: ProtectionFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function ProtectionForm({ onSubmit, isLoading = false }: ProtectionFormProps) {
  const [formData, setFormData] = useState<ProtectionFormData>({
    dateOfBirth: '',
    maritalStatus: 'single',
    dependents: 0,
    dependentAges: '',
    occupation: '',
    employmentStatus: 'employed',
    yearsInOccupation: 0,
    currentHealth: 'good',
    medicalConditions: '',
    medications: '',
    smoker: false,
    annualIncome: '',
    existingCover: '',
    coverageNeeds: '',
    lifeEventTrigger: '',
    priorityNeeds: [],
    timeframe: 'immediate',
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

  const handlePriorityToggle = (priority: string) => {
    setFormData(prev => ({
      ...prev,
      priorityNeeds: prev.priorityNeeds.includes(priority)
        ? prev.priorityNeeds.filter(p => p !== priority)
        : [...prev.priorityNeeds, priority],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.occupation) {
      setError('Occupation is required');
      return;
    }
    if (!formData.annualIncome) {
      setError('Annual income is required');
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
          <CardTitle>Life Protection Fact-Finding Form</CardTitle>
          <CardDescription>
            Please provide detailed information to help us recommend the right protection coverage for you
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

            {/* Personal Information Section */}
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
                <Label htmlFor="maritalStatus">Marital Status *</Label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="dependentAges">Dependent Ages (comma-separated)</Label>
                  <Input
                    id="dependentAges"
                    name="dependentAges"
                    placeholder="e.g., 5, 8, 12"
                    value={formData.dependentAges}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Employment Section */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Employment Information</h3>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  placeholder="e.g., Software Engineer, Teacher, Manager"
                  value={formData.occupation}
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

              <div className="space-y-2">
                <Label htmlFor="yearsInOccupation">Years in Current Occupation</Label>
                <Input
                  id="yearsInOccupation"
                  name="yearsInOccupation"
                  type="number"
                  min="0"
                  value={formData.yearsInOccupation}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Health Section */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Health Information</h3>

              <div className="space-y-2">
                <Label htmlFor="currentHealth">Current Health Status *</Label>
                <select
                  id="currentHealth"
                  name="currentHealth"
                  value={formData.currentHealth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Medical Conditions (if any)</Label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  placeholder="List any chronic conditions, allergies, or health issues"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <textarea
                  id="medications"
                  name="medications"
                  placeholder="List any medications you're currently taking"
                  value={formData.medications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="smoker"
                  checked={formData.smoker}
                  onCheckedChange={handleCheckboxChange('smoker')}
                />
                <Label htmlFor="smoker" className="cursor-pointer">
                  I am a smoker
                </Label>
              </div>
            </div>

            {/* Financial Section */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Financial Information</h3>

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

              <div className="space-y-2">
                <Label htmlFor="existingCover">Existing Life Cover (if any)</Label>
                <Input
                  id="existingCover"
                  name="existingCover"
                  placeholder="e.g., €100,000 through employer"
                  value={formData.existingCover}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverageNeeds">Coverage Needs Assessment</Label>
                <textarea
                  id="coverageNeeds"
                  name="coverageNeeds"
                  placeholder="Describe your coverage needs (e.g., mortgage protection, income replacement, family security)"
                  value={formData.coverageNeeds}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>
            </div>

            {/* Coverage Requirements */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Coverage Requirements</h3>

              <div className="space-y-2">
                <Label htmlFor="lifeEventTrigger">What triggered your interest in protection? *</Label>
                <textarea
                  id="lifeEventTrigger"
                  name="lifeEventTrigger"
                  placeholder="e.g., New mortgage, Growing family, Career change"
                  value={formData.lifeEventTrigger}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Priority Needs (select all that apply)</Label>
                <div className="space-y-2">
                  {['Mortgage Protection', 'Income Replacement', 'Family Security', 'Debt Coverage', 'Education Funds'].map(priority => (
                    <div key={priority} className="flex items-center gap-2">
                      <Checkbox
                        id={priority}
                        checked={formData.priorityNeeds.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                      />
                      <Label htmlFor={priority} className="cursor-pointer">
                        {priority}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">When do you need coverage? *</Label>
                <select
                  id="timeframe"
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="immediate">Immediately</option>
                  <option value="1-3months">Within 1-3 months</option>
                  <option value="3-6months">Within 3-6 months</option>
                  <option value="6-12months">Within 6-12 months</option>
                </select>
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
              By submitting this form, you authorize us to collect and process your information to provide personalized recommendations.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
