import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface HealthInsuranceFormData {
  // Personal Information
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  
  // Family Coverage
  needsFamilyCover: boolean;
  spouseDateOfBirth: string;
  children: number;
  childrenAges: string;
  
  // Current Health
  currentHealth: 'excellent' | 'good' | 'fair' | 'poor';
  medicalConditions: string;
  medications: string;
  recentHospitalization: boolean;
  hospitalizationDetails: string;
  
  // Lifestyle
  smoker: boolean;
  exerciseFrequency: 'daily' | '3-4times' | '1-2times' | 'rarely' | 'never';
  alcohol: 'none' | 'moderate' | 'heavy';
  
  // Coverage Preferences
  coverageType: 'basic' | 'standard' | 'comprehensive';
  dentalCover: boolean;
  visionCover: boolean;
  prescriptionCover: boolean;
  mentalHealthCover: boolean;
  
  // Healthcare Needs
  frequentDoctor: boolean;
  frequentSpecialist: boolean;
  chronicConditionManagement: boolean;
  preferredHospitals: string;
  
  // Budget
  maxMonthlyPremium: string;
  deductiblePreference: 'low' | 'medium' | 'high';
}

interface HealthInsuranceFormProps {
  onSubmit: (data: HealthInsuranceFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function HealthInsuranceForm({ onSubmit, isLoading = false }: HealthInsuranceFormProps) {
  const [formData, setFormData] = useState<HealthInsuranceFormData>({
    dateOfBirth: '',
    gender: 'male',
    maritalStatus: 'single',
    needsFamilyCover: false,
    spouseDateOfBirth: '',
    children: 0,
    childrenAges: '',
    currentHealth: 'good',
    medicalConditions: '',
    medications: '',
    recentHospitalization: false,
    hospitalizationDetails: '',
    smoker: false,
    exerciseFrequency: '1-2times',
    alcohol: 'moderate',
    coverageType: 'standard',
    dentalCover: true,
    visionCover: false,
    prescriptionCover: true,
    mentalHealthCover: false,
    frequentDoctor: false,
    frequentSpecialist: false,
    chronicConditionManagement: false,
    preferredHospitals: '',
    maxMonthlyPremium: '',
    deductiblePreference: 'medium',
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
    if (formData.needsFamilyCover && !formData.spouseDateOfBirth) {
      setError('Spouse date of birth is required for family coverage');
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
          <CardTitle>Private Health Insurance Fact-Finding Form</CardTitle>
          <CardDescription>
            Help us find the perfect health insurance plan for you and your family
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
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
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
              </div>
            </div>

            {/* Family Coverage */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Family Coverage</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="needsFamilyCover"
                  checked={formData.needsFamilyCover}
                  onCheckedChange={handleCheckboxChange('needsFamilyCover')}
                />
                <Label htmlFor="needsFamilyCover" className="cursor-pointer">
                  I need family health insurance coverage
                </Label>
              </div>

              {formData.needsFamilyCover && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="spouseDateOfBirth">Spouse Date of Birth *</Label>
                    <Input
                      id="spouseDateOfBirth"
                      name="spouseDateOfBirth"
                      type="date"
                      value={formData.spouseDateOfBirth}
                      onChange={handleInputChange}
                      required={formData.needsFamilyCover}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="children">Number of Children</Label>
                      <Input
                        id="children"
                        name="children"
                        type="number"
                        min="0"
                        value={formData.children}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="childrenAges">Children Ages (comma-separated)</Label>
                      <Input
                        id="childrenAges"
                        name="childrenAges"
                        placeholder="e.g., 5, 8, 12"
                        value={formData.childrenAges}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Current Health */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Current Health Status</h3>

              <div className="space-y-2">
                <Label htmlFor="currentHealth">Overall Health Status *</Label>
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
                <Label htmlFor="medicalConditions">Existing Medical Conditions</Label>
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
                  placeholder="List all medications you're currently taking"
                  value={formData.medications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="recentHospitalization"
                  checked={formData.recentHospitalization}
                  onCheckedChange={handleCheckboxChange('recentHospitalization')}
                />
                <Label htmlFor="recentHospitalization" className="cursor-pointer">
                  I have been hospitalized in the past 5 years
                </Label>
              </div>

              {formData.recentHospitalization && (
                <div className="space-y-2">
                  <Label htmlFor="hospitalizationDetails">Hospitalization Details</Label>
                  <textarea
                    id="hospitalizationDetails"
                    name="hospitalizationDetails"
                    placeholder="When and why were you hospitalized?"
                    value={formData.hospitalizationDetails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                  />
                </div>
              )}
            </div>

            {/* Lifestyle */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Lifestyle</h3>

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

              <div className="space-y-2">
                <Label htmlFor="exerciseFrequency">Exercise Frequency *</Label>
                <select
                  id="exerciseFrequency"
                  name="exerciseFrequency"
                  value={formData.exerciseFrequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="3-4times">3-4 times per week</option>
                  <option value="1-2times">1-2 times per week</option>
                  <option value="rarely">Rarely</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alcohol">Alcohol Consumption *</Label>
                <select
                  id="alcohol"
                  name="alcohol"
                  value={formData.alcohol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="none">None</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
            </div>

            {/* Coverage Preferences */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Coverage Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="coverageType">Coverage Type *</Label>
                <select
                  id="coverageType"
                  name="coverageType"
                  value={formData.coverageType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="basic">Basic (essential coverage)</option>
                  <option value="standard">Standard (comprehensive coverage)</option>
                  <option value="comprehensive">Comprehensive (premium coverage)</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label>Additional Coverage Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dentalCover"
                      checked={formData.dentalCover}
                      onCheckedChange={handleCheckboxChange('dentalCover')}
                    />
                    <Label htmlFor="dentalCover" className="cursor-pointer">
                      Dental coverage
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="visionCover"
                      checked={formData.visionCover}
                      onCheckedChange={handleCheckboxChange('visionCover')}
                    />
                    <Label htmlFor="visionCover" className="cursor-pointer">
                      Vision coverage
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="prescriptionCover"
                      checked={formData.prescriptionCover}
                      onCheckedChange={handleCheckboxChange('prescriptionCover')}
                    />
                    <Label htmlFor="prescriptionCover" className="cursor-pointer">
                      Prescription coverage
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mentalHealthCover"
                      checked={formData.mentalHealthCover}
                      onCheckedChange={handleCheckboxChange('mentalHealthCover')}
                    />
                    <Label htmlFor="mentalHealthCover" className="cursor-pointer">
                      Mental health coverage
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Healthcare Needs */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Healthcare Needs</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="frequentDoctor"
                    checked={formData.frequentDoctor}
                    onCheckedChange={handleCheckboxChange('frequentDoctor')}
                  />
                  <Label htmlFor="frequentDoctor" className="cursor-pointer">
                    I frequently visit my GP
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="frequentSpecialist"
                    checked={formData.frequentSpecialist}
                    onCheckedChange={handleCheckboxChange('frequentSpecialist')}
                  />
                  <Label htmlFor="frequentSpecialist" className="cursor-pointer">
                    I regularly see specialists
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="chronicConditionManagement"
                    checked={formData.chronicConditionManagement}
                    onCheckedChange={handleCheckboxChange('chronicConditionManagement')}
                  />
                  <Label htmlFor="chronicConditionManagement" className="cursor-pointer">
                    I need ongoing chronic condition management
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredHospitals">Preferred Hospitals/Clinics</Label>
                <textarea
                  id="preferredHospitals"
                  name="preferredHospitals"
                  placeholder="List any preferred hospitals or clinics"
                  value={formData.preferredHospitals}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Budget & Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="maxMonthlyPremium">Maximum Monthly Premium (€)</Label>
                <Input
                  id="maxMonthlyPremium"
                  name="maxMonthlyPremium"
                  type="number"
                  placeholder="0"
                  value={formData.maxMonthlyPremium}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deductiblePreference">Deductible Preference *</Label>
                <select
                  id="deductiblePreference"
                  name="deductiblePreference"
                  value={formData.deductiblePreference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="low">Low deductible (higher premium)</option>
                  <option value="medium">Medium deductible (balanced)</option>
                  <option value="high">High deductible (lower premium)</option>
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
              Your health information will be kept confidential and used only to find the best insurance plan for you.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
