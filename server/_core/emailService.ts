/**
 * Email Service for EasyToFin
 * Handles sending branded HTML emails using SendGrid
 */

import sgMail from '@sendgrid/mail';
import { ENV } from "./env";
import {
  getOtpEmailTemplate,
  getAccountConfirmationTemplate,
  getPolicyAssignmentTemplate,
} from "./emailTemplates";

// Initialize SendGrid
sgMail.setApiKey(ENV.sendgridApiKey);

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  recipientName?: string;
}

/**
 * Send OTP email to user
 */
export async function sendOtpEmail(
  email: string,
  recipientName: string,
  otp: string,
  isNewUser: boolean = false
): Promise<boolean> {
  try {
    const htmlContent = getOtpEmailTemplate({
      recipientName,
      otp,
      expiryMinutes: 5,
      isNewUser,
    });

    const subject = isNewUser
      ? "Complete Your EasyToFin Registration - Verification Code"
      : "Your EasyToFin Sign-In Code";

    console.log(`[EMAIL] Sending OTP to ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Recipient: ${recipientName}`);

    // Send via SendGrid
    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: ENV.sendgridFromName,
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending OTP email to ${email}:`, error);
    return false;
  }
}

/**
 * Send account confirmation email
 */
export async function sendAccountConfirmationEmail(
  email: string,
  recipientName: string,
  loginUrl: string
): Promise<boolean> {
  try {
    const htmlContent = getAccountConfirmationTemplate({
      recipientName,
      email,
      loginUrl,
    });

    const subject = "Your EasyToFin Account is Confirmed ✅";

    console.log(`[EMAIL] Sending confirmation email to ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);

    // Send via SendGrid
    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: ENV.sendgridFromName,
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] Confirmation email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending confirmation email to ${email}:`, error);
    return false;
  }
}

/**
 * Send policy assignment notification email
 */
export async function sendPolicyAssignmentEmail(
  email: string,
  recipientName: string,
  policyData: {
    policyNumber: string;
    productType: string;
    insurerName: string;
    premiumAmount: number;
    startDate: string;
    endDate: string;
  },
  dashboardUrl: string
): Promise<boolean> {
  try {
    const htmlContent = getPolicyAssignmentTemplate({
      recipientName,
      policyNumber: policyData.policyNumber,
      productType: policyData.productType,
      insurerName: policyData.insurerName,
      premiumAmount: policyData.premiumAmount,
      startDate: policyData.startDate,
      endDate: policyData.endDate,
      dashboardUrl,
    });

    const subject = `Your ${policyData.productType} Policy is Ready - ${policyData.policyNumber}`;

    console.log(`[EMAIL] Sending policy assignment email to ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);

    // Send via SendGrid
    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: ENV.sendgridFromName,
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] Policy assignment email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending policy assignment email to ${email}:`, error);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  recipientName: string,
  dashboardUrl: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a5f3f;">Welcome to EasyToFin</h2>
        <p>Hi ${recipientName},</p>
        <p>Thank you for joining EasyToFin Financial Services. We're excited to help you with your financial needs.</p>
        <p>
          <a href="${dashboardUrl}" style="background-color: #1a5f3f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Your Dashboard
          </a>
        </p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          EasyToFin Financial Services Limited<br />
          Regulated by the Central Bank of Ireland
        </p>
      </div>
    `;

    const subject = "Welcome to EasyToFin!";

    console.log(`[EMAIL] Sending welcome email to ${email}`);

    // Send via SendGrid
    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: ENV.sendgridFromName,
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending welcome email to ${email}:`, error);
    return false;
  }
}
