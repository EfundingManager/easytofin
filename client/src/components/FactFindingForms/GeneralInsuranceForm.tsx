import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';

export interface GeneralInsuranceFormData {
  // Property Information
  propertyType: 'house' | 'apartment' | 'bungalow' | 'other';
  propertyValue: string;
  propertyAge: number;
  constructionType: 'brick' | 'stone' | 'timber' | 'mixed' | 'other';
  
  // Security Features
  lockedGates: boolean;
  alarmSystem: boolean;
  cctv: boolean;
  secureLocks: boolean;
  
  // Motor Information
  hasMotorVehicle: boolean;
  vehicleType: 'car' | 'motorcycle' | 'van' | 'other';
  vehicleValue: string;
  vehicleAge: number;
  annualMileage: string;
  parkingLocation: 'garage' | 'driveway' | 'street' | 'other';
  
  // Claims History
  previousClaims: boolean;
  claimsDetails: string;
  accidentsInPast5Years: number;
  
  // Liability
  needsPersonalLiability: boolean;
  liabilityAmount: string;
  businessActivity: boolean;
  
  // Coverage Needs
  selectedCoverages: string[];
  maxAnnualPremium: string;
  preferredDeductible: 'low' | 'medium' | 'high';
}

interface GeneralInsuranceFormProps {
  onSubmit: (data: GeneralInsuranceFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function GeneralInsuranceForm({ onSubmit, isLoading = false }: GeneralInsuranceFormProps) {
  const [formData, setFormData] = useState<GeneralInsuranceFormData>({
    propertyType: 'house',
    propertyValue: '',
    propertyAge: 0,
    constructionType: 'brick',
    lockedGates: false,
    alarmSystem: false,
    cctv: false,
    secureLocks: true,
    hasMotorVehicle: false,
    vehicleType: 'car',
    vehicleValue: '',
    vehicleAge: 0,
    annualMileage: '',
    parkingLocation: 'garage',
    previousClaims: false,
    claimsDetails: '',
    accidentsInPast5Years: 0,
    needsPersonalLiability: false,
    liabilityAmount: '',
    businessActivity: false,
    selectedCoverages: ['homeowners'],
    maxAnnualPremium: '',
    preferredDeductible: 'medium',
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

  const handleCoverageToggle = (coverage: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCoverages: prev.selectedCoverages.includes(coverage)
        ? prev.selectedCoverages.filter(c => c !== coverage)
        : [...prev.selectedCoverages, coverage],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.propertyValue) {
      setError('Property value is required');
      return;
    }
    if (formData.hasMotorVehicle && !formData.vehicleValue) {
      setError('Vehicle value is required');
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
          <CardTitle>General Insurance Fact-Finding Form</CardTitle>
          <CardDescription>
            Provide details about your property and assets to get comprehensive coverage quotes
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

            {/* Property Information */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Property Information</h3>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue">Property Value (€) *</Label>
                  <Input
                    id="propertyValue"
                    name="propertyValue"
                    type="number"
                    placeholder="0"
                    value={formData.propertyValue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyAge">Property Age (years)</Label>
                  <Input
                    id="propertyAge"
                    name="propertyAge"
                    type="number"
                    min="0"
                    value={formData.propertyAge}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructionType">Construction Type *</Label>
                <select
                  id="constructionType"
                  name="constructionType"
                  value={formData.constructionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="brick">Brick</option>
                  <option value="stone">Stone</option>
                  <option value="timber">Timber</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Security Features</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="lockedGates"
                    name="lockedGates"
                    checked={formData.lockedGates}
                    onChange={handleCheckboxChange}
                  />
                  <Label htmlFor="lockedGates" className="cursor-pointer">
                    Locked gates/fencing
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="alarmSystem"
                    name="alarmSystem"
                    checked={formData.alarmSystem}
                    onChange={handleCheckboxChange}
                  />
                  <Label htmlFor="alarmSystem" className="cursor-pointer">
                    Alarm system installed
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="cctv"
                    name="cctv"
                    checked={formData.cctv}
                    onChange={handleCheckboxChange}
                  />
                  <Label htmlFor="cctv" className="cursor-pointer">
                    CCTV cameras
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="secureLocks"
                    name="secureLocks"
                    checked={formData.secureLocks}
                    onChange={handleCheckboxChange}
                  />
                  <Label htmlFor="secureLocks" className="cursor-pointer">
                    Secure locks on all doors/windows
                  </Label>
                </div>
              </div>
            </div>

            {/* Motor Vehicle Information */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Motor Vehicle Information</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasMotorVehicle"
                  name="hasMotorVehicle"
                  checked={formData.hasMotorVehicle}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="hasMotorVehicle" className="cursor-pointer">
                  I need motor vehicle insurance
                </Label>
              </div>

              {formData.hasMotorVehicle && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="van">Van</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleValue">Vehicle Value (€) *</Label>
                      <Input
                        id="vehicleValue"
                        name="vehicleValue"
                        type="number"
                        placeholder="0"
                        value={formData.vehicleValue}
                        onChange={handleInputChange}
                        required={formData.hasMotorVehicle}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleAge">Vehicle Age (years)</Label>
                      <Input
                        id="vehicleAge"
                        name="vehicleAge"
                        type="number"
                        min="0"
                        value={formData.vehicleAge}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualMileage">Annual Mileage</Label>
                      <Input
                        id="annualMileage"
                        name="annualMileage"
                        type="number"
                        placeholder="0"
                        value={formData.annualMileage}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parkingLocation">Parking Location *</Label>
                      <select
                        id="parkingLocation"
                        name="parkingLocation"
                        value={formData.parkingLocation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="garage">Garage</option>
                        <option value="driveway">Driveway</option>
                        <option value="street">Street</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Claims History */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Claims History</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="previousClaims"
                  name="previousClaims"
                  checked={formData.previousClaims}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="previousClaims" className="cursor-pointer">
                  I have made previous insurance claims
                </Label>
              </div>

              {formData.previousClaims && (
                <div className="space-y-2">
                  <Label htmlFor="claimsDetails">Claims Details</Label>
                  <textarea
                    id="claimsDetails"
                    name="claimsDetails"
                    placeholder="Describe your previous claims"
                    value={formData.claimsDetails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-20"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accidentsInPast5Years">Accidents in Past 5 Years</Label>
                <Input
                  id="accidentsInPast5Years"
                  name="accidentsInPast5Years"
                  type="number"
                  min="0"
                  value={formData.accidentsInPast5Years}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Liability & Business */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Liability & Business</h3>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="needsPersonalLiability"
                  name="needsPersonalLiability"
                  checked={formData.needsPersonalLiability}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="needsPersonalLiability" className="cursor-pointer">
                  I need personal liability coverage
                </Label>
              </div>

              {formData.needsPersonalLiability && (
                <div className="space-y-2">
                  <Label htmlFor="liabilityAmount">Liability Coverage Amount (€)</Label>
                  <Input
                    id="liabilityAmount"
                    name="liabilityAmount"
                    type="number"
                    placeholder="0"
                    value={formData.liabilityAmount}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="businessActivity"
                  name="businessActivity"
                  checked={formData.businessActivity}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="businessActivity" className="cursor-pointer">
                  I conduct business activities from home
                </Label>
              </div>
            </div>

            {/* Coverage Selection */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Coverage Selection</h3>

              <div className="space-y-2">
                <Label>Select Coverage Types</Label>
                <div className="space-y-2">
                  {[
                    { id: 'homeowners', label: 'Homeowners Insurance' },
                    { id: 'contents', label: 'Contents Insurance' },
                    { id: 'motor', label: 'Motor Insurance' },
                    { id: 'liability', label: 'Liability Insurance' },
                    { id: 'travel', label: 'Travel Insurance' },
                    { id: 'pet', label: 'Pet Insurance' },
                  ].map(coverage => (
                    <div key={coverage.id} className="flex items-center gap-2">
                      <Checkbox
                        id={coverage.id}
                        checked={formData.selectedCoverages.includes(coverage.id)}
                        onChange={() => handleCoverageToggle(coverage.id)}
                      />
                      <Label htmlFor={coverage.id} className="cursor-pointer">
                        {coverage.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget & Preferences */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-semibold">Budget & Preferences</h3>

              <div className="space-y-2">
                <Label htmlFor="maxAnnualPremium">Maximum Annual Premium (€)</Label>
                <Input
                  id="maxAnnualPremium"
                  name="maxAnnualPremium"
                  type="number"
                  placeholder="0"
                  value={formData.maxAnnualPremium}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDeductible">Preferred Deductible *</Label>
                <select
                  id="preferredDeductible"
                  name="preferredDeductible"
                  value={formData.preferredDeductible}
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
              Your information will help us find the best general insurance coverage for your needs.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
