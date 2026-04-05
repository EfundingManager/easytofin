import { getDb } from "../server/db";
import { policyAssignments, clientDocuments, factFindingForms } from "../drizzle/schema";

async function seedSandboxData() {
  try {
    console.log("🌱 Starting sandbox data seeding...");
    const db = await getDb();
    if (!db) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    // Customer IDs from previous sandbox customers script
    const customerIds = [9, 11, 13, 14, 15];

    // ============ POLICIES ============
    console.log("\n📋 Creating sandbox policies...");

    const policies = [
      {
        phoneUserId: 9,
        policyNumber: "POL-1775418249796-0",
        product: "protection" as const,
        insurerName: "Irish Life",
        premiumAmount: "385.96",
        startDate: new Date("2024-04-05"),
        endDate: new Date("2025-04-05"),
        advisorName: "Michael O'Connor",
        advisorPhone: "+353 1 234 5678",
        notes: "Life assurance policy with critical illness cover",
      },
      {
        phoneUserId: 11,
        policyNumber: "POL-1775418249961-1",
        product: "pensions" as const,
        insurerName: "Zurich",
        premiumAmount: "381.33",
        startDate: new Date("2023-01-15"),
        endDate: new Date("2026-01-15"),
        advisorName: "Sarah Murphy",
        advisorPhone: "+353 1 345 6789",
        notes: "Personal pension plan with investment options",
      },
      {
        phoneUserId: 13,
        policyNumber: "POL-1775418250117-2",
        product: "healthInsurance" as const,
        insurerName: "Laya Healthcare",
        premiumAmount: "104.98",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2025-03-01"),
        advisorName: "David Walsh",
        advisorPhone: "+353 1 456 7890",
        notes: "Family health insurance with dental and optical cover",
      },
      {
        phoneUserId: 14,
        policyNumber: "POL-1775418250272-3",
        product: "generalInsurance" as const,
        insurerName: "AXA",
        premiumAmount: "334.81",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2025-02-01"),
        advisorName: "Emma Kelly",
        advisorPhone: "+353 1 567 8901",
        notes: "Home and contents insurance with accidental damage cover",
      },
      {
        phoneUserId: 15,
        policyNumber: "POL-1775418250426-4",
        product: "investments" as const,
        insurerName: "Davy",
        premiumAmount: "121.92",
        startDate: new Date("2023-06-01"),
        endDate: new Date("2026-06-01"),
        advisorName: "James McCarthy",
        advisorPhone: "+353 1 678 9012",
        notes: "Investment bond with managed portfolio",
      },
    ];

    for (const policy of policies) {
      try {
        await db.insert(policyAssignments).values(policy as any);
        console.log(`✅ Created policy: ${policy.policyNumber}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  Policy already exists: ${policy.policyNumber}`);
        } else {
          throw error;
        }
      }
    }

    // ============ DOCUMENTS ============
    console.log("\n📄 Creating sandbox documents...");

    const documents = [
      {
        phoneUserId: 9,
        documentType: "id",
        fileName: "john_smith_passport.pdf",
        fileUrl: "https://example.com/documents/john_smith_passport.pdf",
        fileKey: "documents/9/john_smith_passport-abc123.pdf",
        mimeType: "application/pdf",
        fileSize: 245000,
        status: "verified" as const,
        notes: "Passport verified - valid until 2030",
      },
      {
        phoneUserId: 9,
        documentType: "proof_of_income",
        fileName: "john_smith_payslip_2024.pdf",
        fileUrl: "https://example.com/documents/john_smith_payslip.pdf",
        fileKey: "documents/9/john_smith_payslip-def456.pdf",
        mimeType: "application/pdf",
        fileSize: 156000,
        status: "verified" as const,
        notes: "Recent payslip from employer",
      },
      {
        phoneUserId: 9,
        documentType: "proof_of_address",
        fileName: "john_smith_utility_bill.pdf",
        fileUrl: "https://example.com/documents/john_smith_utility.pdf",
        fileKey: "documents/9/john_smith_utility-ghi789.pdf",
        mimeType: "application/pdf",
        fileSize: 189000,
        status: "pending" as const,
        notes: "Utility bill submitted - awaiting verification",
      },
      {
        phoneUserId: 11,
        documentType: "id",
        fileName: "sarah_johnson_drivers_license.pdf",
        fileUrl: "https://example.com/documents/sarah_drivers_license.pdf",
        fileKey: "documents/11/sarah_drivers_license-jkl012.pdf",
        mimeType: "application/pdf",
        fileSize: 234000,
        status: "verified" as const,
        notes: "Driver's license verified",
      },
      {
        phoneUserId: 11,
        documentType: "bank_statement",
        fileName: "sarah_johnson_bank_statement.pdf",
        fileUrl: "https://example.com/documents/sarah_bank_statement.pdf",
        fileKey: "documents/11/sarah_bank_statement-mno345.pdf",
        mimeType: "application/pdf",
        fileSize: 267000,
        status: "verified" as const,
        notes: "Bank statement from last 3 months",
      },
      {
        phoneUserId: 13,
        documentType: "id",
        fileName: "michael_brown_passport.pdf",
        fileUrl: "https://example.com/documents/michael_passport.pdf",
        fileKey: "documents/13/michael_passport-pqr678.pdf",
        mimeType: "application/pdf",
        fileSize: 212000,
        status: "verified" as const,
        notes: "Passport verified",
      },
      {
        phoneUserId: 14,
        documentType: "proof_of_income",
        fileName: "yijie_lin_employment_letter.pdf",
        fileUrl: "https://example.com/documents/yijie_employment.pdf",
        fileKey: "documents/14/yijie_employment-stu901.pdf",
        mimeType: "application/pdf",
        fileSize: 145000,
        status: "pending" as const,
        notes: "Employment letter - pending review",
      },
      {
        phoneUserId: 15,
        documentType: "id",
        fileName: "yijie_lin_id_card.pdf",
        fileUrl: "https://example.com/documents/yijie_id_card.pdf",
        fileKey: "documents/15/yijie_id_card-vwx234.pdf",
        mimeType: "application/pdf",
        fileSize: 198000,
        status: "rejected" as const,
        notes: "ID card expired - please resubmit with valid ID",
      },
    ];

    for (const doc of documents) {
      try {
        await db.insert(clientDocuments).values(doc as any);
        console.log(`✅ Created document: ${doc.fileName}`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  Document already exists: ${doc.fileName}`);
        } else {
          throw error;
        }
      }
    }

    // ============ FACT-FINDING FORMS ============
    console.log("\n📝 Creating sandbox fact-finding forms...");

    const forms = [
      {
        phoneUserId: 9,
        policyNumber: "POL-1775418249796-0",
        product: "protection" as const,
        formData: JSON.stringify({
          age: 35,
          income: 65000,
          dependents: 2,
          coverRequired: 500000,
          existingCover: 100000,
        }),
        status: "submitted" as const,
        submittedAt: new Date("2024-03-15"),
        policyAssignedAt: new Date("2024-04-05"),
      },
      {
        phoneUserId: 11,
        policyNumber: "POL-1775418249961-1",
        product: "pensions" as const,
        formData: JSON.stringify({
          age: 42,
          retirementAge: 65,
          currentSavings: 150000,
          monthlyContribution: 500,
          investmentRisk: "medium",
        }),
        status: "reviewed" as const,
        submittedAt: new Date("2023-01-01"),
        policyAssignedAt: new Date("2023-01-15"),
      },
      {
        phoneUserId: 13,
        policyNumber: "POL-1775418250117-2",
        product: "healthInsurance" as const,
        formData: JSON.stringify({
          familySize: 4,
          ageRange: "30-45",
          preExistingConditions: "none",
          coverType: "comprehensive",
          dentalCover: true,
        }),
        status: "submitted" as const,
        submittedAt: new Date("2024-02-20"),
        policyAssignedAt: new Date("2024-03-01"),
      },
      {
        phoneUserId: 14,
        policyNumber: "POL-1775418250272-3",
        product: "generalInsurance" as const,
        formData: JSON.stringify({
          propertyType: "apartment",
          propertyValue: 350000,
          contents: 50000,
          location: "Dublin",
          securityFeatures: "alarm, locks",
        }),
        status: "submitted" as const,
        submittedAt: new Date("2024-01-30"),
        policyAssignedAt: new Date("2024-02-01"),
      },
      {
        phoneUserId: 15,
        policyNumber: "POL-1775418250426-4",
        product: "investments" as const,
        formData: JSON.stringify({
          investmentAmount: 25000,
          investmentTerm: "10 years",
          riskProfile: "balanced",
          objectives: "retirement savings",
          experience: "intermediate",
        }),
        status: "reviewed" as const,
        submittedAt: new Date("2023-05-15"),
        policyAssignedAt: new Date("2023-06-01"),
      },
    ];

    for (const form of forms) {
      try {
        await db.insert(factFindingForms).values(form as any);
        console.log(`✅ Created form: ${form.product} (${form.policyNumber})`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  Form already exists: ${form.policyNumber}`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✨ Sandbox data seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${policies.length} policies created`);
    console.log(`   - ${documents.length} documents created`);
    console.log(`   - ${forms.length} fact-finding forms created`);
  } catch (error) {
    console.error("❌ Error seeding sandbox data:", error);
    process.exit(1);
  }
}

seedSandboxData();
