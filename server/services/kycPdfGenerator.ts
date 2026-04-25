import jsPDF from 'jspdf';
import {
  LifeProtectionForm,
  PensionsForm,
  HealthInsuranceForm,
  GeneralInsuranceForm,
  InvestmentsForm,
} from '@shared/kycForms';
import { format } from 'date-fns';

interface KYCFormData {
  lifeProtection?: LifeProtectionForm;
  pensions?: PensionsForm;
  healthInsurance?: HealthInsuranceForm;
  generalInsurance?: GeneralInsuranceForm;
  investments?: InvestmentsForm;
}

interface PDFGenerationOptions {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  generatedDate?: Date;
}

export class KYCPdfGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private currentY: number = 15;
  private lineHeight: number = 7;
  private sectionSpacing: number = 10;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  /**
   * Generate complete KYC summary PDF
   */
  generateKYCSummaryPDF(
    formData: KYCFormData,
    options: PDFGenerationOptions
  ): Buffer {
    // Add header
    this.addHeader(options);

    // Add executive summary
    this.addExecutiveSummary(formData, options);

    // Add each form section
    if (formData.lifeProtection) {
      this.addLifeProtectionSection(formData.lifeProtection);
    }
    if (formData.pensions) {
      this.addPensionsSection(formData.pensions);
    }
    if (formData.healthInsurance) {
      this.addHealthInsuranceSection(formData.healthInsurance);
    }
    if (formData.generalInsurance) {
      this.addGeneralInsuranceSection(formData.generalInsurance);
    }
    if (formData.investments) {
      this.addInvestmentsSection(formData.investments);
    }

    // Add footer
    this.addFooter(options);

    // Return PDF as buffer
    return Buffer.from(this.doc.output('arraybuffer'));
  }

  /**
   * Generate filename for PDF
   */
  static generateFilename(customerName: string, date: Date = new Date()): string {
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = format(date, 'yyyy-MM-dd');
    return `${sanitizedName}_KYC_Summary_${dateStr}.pdf`;
  }

  private addHeader(options: PDFGenerationOptions): void {
    // Company name and logo area
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 102, 102); // Teal color
    this.doc.text('EasyToFin Financial Services', this.margin, this.currentY);

    this.currentY += 8;
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('KYC Fact-Finding Summary Report', this.margin, this.currentY);

    // Customer info box
    this.currentY += 12;
    this.drawBox(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      35,
      240, 240, 240
    );

    this.currentY += 3;
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Customer: ${options.customerName}`, this.margin + 3, this.currentY);

    this.currentY += 6;
    if (options.customerEmail) {
      this.doc.setFontSize(9);
      this.doc.text(`Email: ${options.customerEmail}`, this.margin + 3, this.currentY);
      this.currentY += 5;
    }

    if (options.customerPhone) {
      this.doc.setFontSize(9);
      this.doc.text(`Phone: ${options.customerPhone}`, this.margin + 3, this.currentY);
      this.currentY += 5;
    }

    this.doc.setFontSize(9);
    this.doc.text(
      `Generated: ${format(options.generatedDate || new Date(), 'dd MMMM yyyy HH:mm')}`,
      this.margin + 3,
      this.currentY
    );

    this.currentY += 10;
    this.addHorizontalLine();
    this.currentY += 5;
  }

  private addExecutiveSummary(formData: KYCFormData, options: PDFGenerationOptions): void {
    this.addSectionTitle('Executive Summary');

    const completedProducts = [];
    if (formData.lifeProtection) completedProducts.push('Life Protection');
    if (formData.pensions) completedProducts.push('Pensions');
    if (formData.healthInsurance) completedProducts.push('Health Insurance');
    if (formData.generalInsurance) completedProducts.push('General Insurance');
    if (formData.investments) completedProducts.push('Investments');

    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);

    const summaryText = `This document contains the KYC (Know Your Customer) fact-finding information collected for ${options.customerName}. The following products have been assessed: ${completedProducts.join(', ')}.`;

    const splitText = this.doc.splitTextToSize(summaryText, this.pageWidth - 2 * this.margin - 6);
    this.doc.text(splitText, this.margin + 3, this.currentY);

    this.currentY += splitText.length * this.lineHeight + this.sectionSpacing;
    this.checkPageBreak();
  }

  private addLifeProtectionSection(form: LifeProtectionForm): void {
    this.addSectionTitle('Life Protection / Life Insurance');

    this.addSubsection('Personal Details');
    this.addKeyValuePair('Name', `${form.personalDetails.firstName} ${form.personalDetails.lastName}`);
    this.addKeyValuePair('Date of Birth', form.personalDetails.dateOfBirth);
    this.addKeyValuePair('Nationality', form.personalDetails.nationality);
    this.addKeyValuePair('Marital Status', form.personalDetails.maritalStatus);
    this.addKeyValuePair('Dependents', String(form.personalDetails.dependents));

    this.addSubsection('Contact Information');
    this.addKeyValuePair('Email', form.contactInformation.email);
    this.addKeyValuePair('Phone', form.contactInformation.phone);
    this.addKeyValuePair('Address', form.contactInformation.address);
    this.addKeyValuePair('City', form.contactInformation.city);
    this.addKeyValuePair('Postal Code', form.contactInformation.postalCode);

    this.addSubsection('Employment Details');
    this.addKeyValuePair('Employment Status', form.employmentDetails.employmentStatus);
    if (form.employmentDetails.employerName) {
      this.addKeyValuePair('Employer', form.employmentDetails.employerName);
    }
    if (form.employmentDetails.occupation) {
      this.addKeyValuePair('Occupation', form.employmentDetails.occupation);
    }
    if (form.employmentDetails.annualIncome) {
      this.addKeyValuePair('Annual Income', `€${form.employmentDetails.annualIncome}`);
    }

    this.addSubsection('Financial Situation');
    this.addKeyValuePair('Monthly Income', form.financialSituation.monthlyIncome);
    this.addKeyValuePair('Monthly Expenses', form.financialSituation.monthlyExpenses);
    this.addKeyValuePair('Existing Debt', form.financialSituation.existingDebt);
    if (form.financialSituation.savingsAmount) {
      this.addKeyValuePair('Savings', form.financialSituation.savingsAmount);
    }

    this.addSubsection('Life Protection Details');
    this.addKeyValuePair('Health Status', form.healthStatus);
    this.addKeyValuePair('Smoker Status', form.smokerStatus);
    this.addKeyValuePair('Coverage Amount', form.coverageAmount);
    this.addKeyValuePair('Insurance Need', form.insuranceNeed);

    if (form.medicalConditions) {
      this.addKeyValuePair('Medical Conditions', form.medicalConditions);
    }
    if (form.familyMedicalHistory) {
      this.addKeyValuePair('Family Medical History', form.familyMedicalHistory);
    }

    if (form.beneficiaries && form.beneficiaries.length > 0) {
      this.addSubsection('Beneficiaries');
      form.beneficiaries.forEach((beneficiary, index) => {
        this.addKeyValuePair(
          `Beneficiary ${index + 1}`,
          `${beneficiary.name} (${beneficiary.relationship}) - ${beneficiary.percentage}%`
        );
      });
    }

    if (form.additionalNotes) {
      this.addSubsection('Additional Notes');
      const splitText = this.doc.splitTextToSize(
        form.additionalNotes,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    this.currentY += this.sectionSpacing;
    this.checkPageBreak();
  }

  private addPensionsSection(form: PensionsForm): void {
    this.addSectionTitle('Pensions');

    this.addSubsection('Personal Details');
    this.addKeyValuePair('Name', `${form.personalDetails.firstName} ${form.personalDetails.lastName}`);
    this.addKeyValuePair('Date of Birth', form.personalDetails.dateOfBirth);

    this.addSubsection('Employment Details');
    this.addKeyValuePair('Employment Status', form.employmentDetails.employmentStatus);
    if (form.employmentDetails.occupation) {
      this.addKeyValuePair('Occupation', form.employmentDetails.occupation);
    }

    this.addSubsection('Financial Situation');
    this.addKeyValuePair('Monthly Income', form.financialSituation.monthlyIncome);
    this.addKeyValuePair('Monthly Expenses', form.financialSituation.monthlyExpenses);

    this.addSubsection('Pension Details');
    this.addKeyValuePair('Retirement Age', String(form.retirementAge));
    this.addKeyValuePair('Target Retirement Income', form.targetRetirementIncome);
    this.addKeyValuePair('Investment Preference', form.investmentPreference);
    this.addKeyValuePair('Risk Tolerance', form.riskTolerance);
    this.addKeyValuePair('Annual Contributions', form.existingPensionContributions);
    this.addKeyValuePair('Employer Scheme', form.employerPensionScheme);

    if (form.pensionSchemeDetails) {
      this.addKeyValuePair('Scheme Details', form.pensionSchemeDetails);
    }

    if (form.currentPensions && form.currentPensions.length > 0) {
      this.addSubsection('Current Pensions');
      form.currentPensions.forEach((pension, index) => {
        this.addKeyValuePair(`Pension ${index + 1} Type`, pension.type);
        if (pension.provider) {
          this.addKeyValuePair(`Pension ${index + 1} Provider`, pension.provider);
        }
        if (pension.estimatedValue) {
          this.addKeyValuePair(`Pension ${index + 1} Value`, pension.estimatedValue);
        }
      });
    }

    if (form.additionalNotes) {
      this.addSubsection('Additional Notes');
      const splitText = this.doc.splitTextToSize(
        form.additionalNotes,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    this.currentY += this.sectionSpacing;
    this.checkPageBreak();
  }

  private addHealthInsuranceSection(form: HealthInsuranceForm): void {
    this.addSectionTitle('Health Insurance');

    this.addSubsection('Personal Details');
    this.addKeyValuePair('Name', `${form.personalDetails.firstName} ${form.personalDetails.lastName}`);
    this.addKeyValuePair('Date of Birth', form.personalDetails.dateOfBirth);

    this.addSubsection('Health Profile');
    this.addKeyValuePair('Health Status', form.healthStatus);
    if (form.medicalConditions && form.medicalConditions.length > 0) {
      this.addKeyValuePair('Medical Conditions', form.medicalConditions.join(', '));
    }
    if (form.currentMedications) {
      this.addKeyValuePair('Current Medications', form.currentMedications);
    }

    this.addSubsection('Coverage Preferences');
    this.addKeyValuePair('Coverage Type', form.coverageType);
    this.addKeyValuePair('Hospital Cover', form.coveragePreferences.hospitalCover ? 'Yes' : 'No');
    this.addKeyValuePair('Outpatient Cover', form.coveragePreferences.outpatientCover ? 'Yes' : 'No');
    this.addKeyValuePair('Dental Cover', form.coveragePreferences.dentalCover ? 'Yes' : 'No');
    this.addKeyValuePair('Vision Cover', form.coveragePreferences.visionCover ? 'Yes' : 'No');
    this.addKeyValuePair('Mental Health Cover', form.coveragePreferences.mentalHealthCover ? 'Yes' : 'No');

    if (form.preferredHospitals && form.preferredHospitals.length > 0) {
      this.addKeyValuePair('Preferred Hospitals', form.preferredHospitals.join(', '));
    }

    this.addKeyValuePair('Budget Range', form.budgetRange);

    if (form.additionalNotes) {
      this.addSubsection('Additional Notes');
      const splitText = this.doc.splitTextToSize(
        form.additionalNotes,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    this.currentY += this.sectionSpacing;
    this.checkPageBreak();
  }

  private addGeneralInsuranceSection(form: GeneralInsuranceForm): void {
    this.addSectionTitle('General Insurance');

    this.addSubsection('Personal Details');
    this.addKeyValuePair('Name', `${form.personalDetails.firstName} ${form.personalDetails.lastName}`);
    this.addKeyValuePair('Date of Birth', form.personalDetails.dateOfBirth);

    this.addSubsection('Insurance Details');
    this.addKeyValuePair('Insurance Type', form.insuranceType);

    if (form.insuranceType === 'home' && form.propertyDetails) {
      this.addSubsection('Property Details');
      this.addKeyValuePair('Property Type', form.propertyDetails.type);
      if (form.propertyDetails.yearBuilt) {
        this.addKeyValuePair('Year Built', String(form.propertyDetails.yearBuilt));
      }
      if (form.propertyDetails.estimatedValue) {
        this.addKeyValuePair('Estimated Value', form.propertyDetails.estimatedValue);
      }
      this.addKeyValuePair('Mortgage Status', form.propertyDetails.mortgageStatus);
    }

    if (form.insuranceType === 'motor' && form.vehicleDetails) {
      this.addSubsection('Vehicle Details');
      if (form.vehicleDetails.make) {
        this.addKeyValuePair('Make', form.vehicleDetails.make);
      }
      if (form.vehicleDetails.model) {
        this.addKeyValuePair('Model', form.vehicleDetails.model);
      }
      if (form.vehicleDetails.year) {
        this.addKeyValuePair('Year', String(form.vehicleDetails.year));
      }
      if (form.vehicleDetails.registrationNumber) {
        this.addKeyValuePair('Registration', form.vehicleDetails.registrationNumber);
      }
      if (form.vehicleDetails.annualMileage) {
        this.addKeyValuePair('Annual Mileage', String(form.vehicleDetails.annualMileage));
      }
    }

    if (form.insuranceType === 'business' && form.businessDetails) {
      this.addSubsection('Business Details');
      if (form.businessDetails.businessType) {
        this.addKeyValuePair('Business Type', form.businessDetails.businessType);
      }
      if (form.businessDetails.yearsInBusiness) {
        this.addKeyValuePair('Years in Business', String(form.businessDetails.yearsInBusiness));
      }
      if (form.businessDetails.numberOfEmployees) {
        this.addKeyValuePair('Employees', String(form.businessDetails.numberOfEmployees));
      }
      if (form.businessDetails.annualTurnover) {
        this.addKeyValuePair('Annual Turnover', form.businessDetails.annualTurnover);
      }
    }

    if (form.currentCoverage) {
      this.addKeyValuePair('Current Coverage', form.currentCoverage);
    }

    if (form.coverageNeeds && form.coverageNeeds.length > 0) {
      this.addKeyValuePair('Coverage Needs', form.coverageNeeds.join(', '));
    }

    if (form.claimsHistory && form.claimsHistory.length > 0) {
      this.addSubsection('Claims History');
      form.claimsHistory.forEach((claim, index) => {
        this.addKeyValuePair(
          `Claim ${index + 1}`,
          `${claim.year} - ${claim.type}${claim.amount ? ` (€${claim.amount})` : ''}`
        );
      });
    }

    if (form.additionalNotes) {
      this.addSubsection('Additional Notes');
      const splitText = this.doc.splitTextToSize(
        form.additionalNotes,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    this.currentY += this.sectionSpacing;
    this.checkPageBreak();
  }

  private addInvestmentsSection(form: InvestmentsForm): void {
    this.addSectionTitle('Investments');

    this.addSubsection('Personal Details');
    this.addKeyValuePair('Name', `${form.personalDetails.firstName} ${form.personalDetails.lastName}`);
    this.addKeyValuePair('Date of Birth', form.personalDetails.dateOfBirth);

    this.addSubsection('Financial Situation');
    this.addKeyValuePair('Monthly Income', form.financialSituation.monthlyIncome);
    this.addKeyValuePair('Monthly Expenses', form.financialSituation.monthlyExpenses);
    this.addKeyValuePair('Existing Debt', form.financialSituation.existingDebt);
    if (form.financialSituation.savingsAmount) {
      this.addKeyValuePair('Current Savings', form.financialSituation.savingsAmount);
    }

    this.addSubsection('Investment Profile');
    this.addKeyValuePair('Experience Level', form.investmentExperience);
    this.addKeyValuePair('Investment Objective', form.investmentObjective);
    this.addKeyValuePair('Investment Timeline', `${form.investmentTimeline} years`);
    this.addKeyValuePair('Risk Tolerance', form.riskTolerance);
    this.addKeyValuePair('Investment Amount', `€${form.investmentAmount}`);

    if (form.investmentKnowledge) {
      this.addSubsection('Investment Knowledge');
      this.addKeyValuePair('Stocks', form.investmentKnowledge.stocks);
      this.addKeyValuePair('Bonds', form.investmentKnowledge.bonds);
      this.addKeyValuePair('Mutual Funds', form.investmentKnowledge.mutualFunds);
      this.addKeyValuePair('ETFs', form.investmentKnowledge.etfs);
      this.addKeyValuePair('Cryptocurrencies', form.investmentKnowledge.crypto);
    }

    if (form.financialGoals && form.financialGoals.length > 0) {
      this.addKeyValuePair('Financial Goals', form.financialGoals.join(', '));
    }

    if (form.taxConsiderations) {
      this.addSubsection('Tax Considerations');
      const splitText = this.doc.splitTextToSize(
        form.taxConsiderations,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    if (form.additionalNotes) {
      this.addSubsection('Additional Notes');
      const splitText = this.doc.splitTextToSize(
        form.additionalNotes,
        this.pageWidth - 2 * this.margin - 6
      );
      this.doc.text(splitText, this.margin + 3, this.currentY);
      this.currentY += splitText.length * this.lineHeight;
    }

    this.currentY += this.sectionSpacing;
    this.checkPageBreak();
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(20);
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 102, 102); // Teal
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
    this.addHorizontalLine();
    this.currentY += 4;
  }

  private addSubsection(title: string): void {
    this.checkPageBreak(10);
    this.doc.setFontSize(11);
    this.doc.setTextColor(50, 50, 50);
    this.doc.text(title, this.margin + 3, this.currentY);
    this.currentY += 6;
  }

  private addKeyValuePair(key: string, value: string): void {
    this.checkPageBreak(5);
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);

    const keyWidth = 50;
    this.doc.text(`${key}:`, this.margin + 3, this.currentY);

    this.doc.setTextColor(80, 80, 80);
    const valueX = this.margin + 3 + keyWidth;
    const maxValueWidth = this.pageWidth - valueX - this.margin;
    const splitValue = this.doc.splitTextToSize(value, maxValueWidth);

    this.doc.text(splitValue, valueX, this.currentY);
    this.currentY += Math.max(this.lineHeight, splitValue.length * this.lineHeight);
  }

  private addHorizontalLine(): void {
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
  }

  private drawBox(x: number, y: number, width: number, height: number, r: number, g: number, b: number): void {
    this.doc.setFillColor(r, g, b);
    this.doc.rect(x, y, width, height, 'F');
  }

  private addFooter(options: PDFGenerationOptions): void {
    const pageCount = this.doc.internal.pages.length - 1;

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);

      // Page number
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      );

      // Footer text
      this.doc.text(
        'EasyToFin Financial Services | Regulated by the Central Bank of Ireland',
        this.pageWidth / 2,
        this.pageHeight - 5,
        { align: 'center' }
      );
    }
  }

  private checkPageBreak(requiredSpace: number = 15): void {
    if (this.currentY + requiredSpace > this.pageHeight - 15) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }
}
