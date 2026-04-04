import { notifyOwner } from './notification';

export interface AdminNotificationData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  selectedServices: string[];
  submittedAt: Date;
}

/**
 * Send notification to admin when a new profile is submitted
 */
export async function notifyAdminNewProfile(data: AdminNotificationData): Promise<boolean> {
  try {
    const servicesList = data.selectedServices.join(', ');
    const title = `New Profile Submission: ${data.clientName}`;
    const content = `
A new verified profile has been submitted:

**Client Information:**
- Name: ${data.clientName}
- Email: ${data.clientEmail}
- Phone: ${data.clientPhone}

**Selected Services:**
${data.selectedServices.map(s => `- ${formatServiceName(s)}`).join('\n')}

**Submitted At:** ${data.submittedAt.toLocaleString()}

Please review this profile in the admin dashboard and proceed with fact-finding if needed.
    `.trim();

    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error('[AdminNotification] Failed to notify admin:', error);
    return false;
  }
}

/**
 * Format service name for display
 */
function formatServiceName(serviceId: string): string {
  const serviceMap: Record<string, string> = {
    protection: 'Life Protection',
    pensions: 'Pensions',
    healthInsurance: 'Health Insurance',
    generalInsurance: 'General Insurance',
    investments: 'Investments',
  };
  return serviceMap[serviceId] || serviceId;
}

/**
 * Send notification when client email is verified
 */
export async function notifyAdminEmailVerified(clientName: string, clientEmail: string): Promise<boolean> {
  try {
    const title = `Email Verified: ${clientName}`;
    const content = `
Client email has been verified:

**Client:** ${clientName}
**Email:** ${clientEmail}
**Verified At:** ${new Date().toLocaleString()}

This client is now ready for the next step in the onboarding process.
    `.trim();

    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error('[AdminNotification] Failed to notify admin about email verification:', error);
    return false;
  }
}

/**
 * Send notification when policy is assigned
 */
export async function notifyAdminPolicyAssigned(
  clientName: string,
  policyNumber: string,
  productType: string,
  insurer: string
): Promise<boolean> {
  try {
    const title = `Policy Assigned: ${policyNumber}`;
    const content = `
A policy has been assigned to a client:

**Client:** ${clientName}
**Policy Number:** ${policyNumber}
**Product:** ${formatServiceName(productType)}
**Insurer:** ${insurer}
**Assigned At:** ${new Date().toLocaleString()}

The client has been moved to the customers section.
    `.trim();

    const result = await notifyOwner({ title, content });
    return result;
  } catch (error) {
    console.error('[AdminNotification] Failed to notify admin about policy assignment:', error);
    return false;
  }
}
