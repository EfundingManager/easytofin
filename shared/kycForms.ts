/**
 * KYC Fact-Finding Forms - Irish Insurance Requirements
 * Comprehensive form schemas for all five product types
 */

// Common KYC fields used across all forms
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'civil_partnership';
  dependents: number;
  dependentAges?: string[]; // Ages of dependents
}

export interface ContactInformation {
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface EmploymentDetails {
  employmentStatus: 'employed' | 'self_employed' | 'retired' | 'unemployed' | 'student';
  employerName?: string;
  occupation?: string;
  yearsInCurrentRole?: number;
  annualIncome?: string;
  sourceOfIncome?: string;
}

export interface FinancialSituation {
  monthlyIncome: string;
  monthlyExpenses: string;
  existingDebt: string;
  debtDetails?: string;
  savingsAmount?: string;
  investmentExperience: 'none' | 'basic' | 'intermediate' | 'advanced';
}

// Life Protection / Life Insurance Form
export interface LifeProtectionForm {
  personalDetails: PersonalDetails;
  contactInformation: ContactInformation;
  employmentDetails: EmploymentDetails;
  financialSituation: FinancialSituation;
  
  // Life-specific fields
  currentInsurance?: string; // Existing life insurance coverage
  coverageAmount: string; // Desired coverage amount
  insuranceNeed: 'mortgage_protection' | 'income_replacement' | 'debt_repayment' | 'family_protection' | 'business_protection' | 'other';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  medicalConditions?: string;
  smokerStatus: 'smoker' | 'non_smoker';
  familyMedicalHistory?: string;
  beneficiaries: Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>;
  additionalNotes?: string;
}

// Pensions Form
export interface PensionsForm {
  personalDetails: PersonalDetails;
  contactInformation: ContactInformation;
  employmentDetails: EmploymentDetails;
  financialSituation: FinancialSituation;
  
  // Pensions-specific fields
  currentPensions: Array<{
    type: 'occupational' | 'personal' | 'prsa' | 'other';
    provider?: string;
    estimatedValue?: string;
    annualContribution?: string;
  }>;
  retirementAge: number;
  targetRetirementIncome: string;
  investmentPreference: 'conservative' | 'balanced' | 'growth' | 'aggressive';
  riskTolerance: 'low' | 'medium' | 'high';
  existingPensionContributions: string; // Annual amount
  employerPensionScheme: 'yes' | 'no';
  pensionSchemeDetails?: string;
  additionalNotes?: string;
}

// Health Insurance Form
export interface HealthInsuranceForm {
  personalDetails: PersonalDetails;
  contactInformation: ContactInformation;
  employmentDetails: EmploymentDetails;
  
  // Health Insurance-specific fields
  currentHealthInsurance?: string;
  coverageType: 'individual' | 'family' | 'group';
  familyMembers?: Array<{
    name: string;
    relationship: string;
    dateOfBirth: string;
    healthStatus: string;
  }>;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  medicalConditions: string[];
  currentMedications?: string;
  preferredHospitals?: string[];
  coveragePreferences: {
    hospitalCover: boolean;
    outpatientCover: boolean;
    dentalCover: boolean;
    visionCover: boolean;
    mentalHealthCover: boolean;
  };
  budgetRange: string; // Monthly premium budget
  additionalNotes?: string;
}

// General Insurance Form
export interface GeneralInsuranceForm {
  personalDetails: PersonalDetails;
  contactInformation: ContactInformation;
  employmentDetails: EmploymentDetails;
  
  // General Insurance-specific fields
  insuranceType: 'home' | 'motor' | 'business' | 'liability' | 'travel';
  propertyDetails?: {
    type: 'apartment' | 'house' | 'commercial' | 'other';
    yearBuilt?: number;
    estimatedValue?: string;
    mortgageStatus: 'owned' | 'mortgaged';
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    registrationNumber?: string;
    annualMileage?: number;
    mainDriver?: string;
    drivingExperience?: number; // years
  };
  businessDetails?: {
    businessType?: string;
    yearsInBusiness?: number;
    numberOfEmployees?: number;
    annualTurnover?: string;
  };
  currentCoverage?: string;
  claimsHistory: Array<{
    year: number;
    type: string;
    amount?: string;
  }>;
  coverageNeeds: string[];
  budgetRange: string;
  additionalNotes?: string;
}

// Investments Form
export interface InvestmentsForm {
  personalDetails: PersonalDetails;
  contactInformation: ContactInformation;
  employmentDetails: EmploymentDetails;
  financialSituation: FinancialSituation;
  
  // Investments-specific fields
  investmentExperience: 'none' | 'basic' | 'intermediate' | 'advanced';
  investmentObjective: 'capital_growth' | 'income' | 'capital_preservation' | 'mixed';
  investmentTimeline: number; // years
  riskTolerance: 'low' | 'medium' | 'high' | 'very_high';
  investmentAmount: string;
  regularContributions?: string; // Monthly/annual amount
  existingInvestments?: Array<{
    type: string;
    value?: string;
  }>;
  investmentKnowledge: {
    stocks: 'none' | 'basic' | 'intermediate' | 'advanced';
    bonds: 'none' | 'basic' | 'intermediate' | 'advanced';
    mutualFunds: 'none' | 'basic' | 'intermediate' | 'advanced';
    etfs: 'none' | 'basic' | 'intermediate' | 'advanced';
    crypto: 'none' | 'basic' | 'intermediate' | 'advanced';
  };
  financialGoals: string[];
  taxConsiderations?: string;
  additionalNotes?: string;
}

// Union type for all forms
export type KYCForm = 
  | LifeProtectionForm 
  | PensionsForm 
  | HealthInsuranceForm 
  | GeneralInsuranceForm 
  | InvestmentsForm;

// Form metadata for tracking
export interface FormMetadata {
  formId: string;
  phoneUserId: number;
  product: 'protection' | 'pensions' | 'healthInsurance' | 'generalInsurance' | 'investments';
  status: 'draft' | 'submitted' | 'reviewed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  policyNumber?: string;
}
