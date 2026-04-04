/**
 * Email Service for EasyToFin
 * Handles sending branded HTML emails using the built-in notification system
 */

import { notifyOwner } from "./notification";
import {
  getOtpEmailTemplate,
  getAccountConfirmationTemplate,
  getPolicyAssignmentTemplate,
} from "./emailTemplates";

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

    // Log email for development
    console.log(`[EMAIL] Sending OTP to ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Recipient: ${recipientName}`);

    // In production, integrate with email service like SendGrid, AWS SES, etc.
    // For now, we'll use the notification system to alert the owner
    if (process.env.NODE_ENV === "production") {
      // TODO: Replace with actual email service
      // await sendEmailViaProvider({ to: email, subject, htmlContent });
    }

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

    // In production, integrate with email service
    if (process.env.NODE_ENV === "production") {
      // TODO: Replace with actual email service
      // await sendEmailViaProvider({ to: email, subject, htmlContent });
    }

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
      ...policyData,
      dashboardUrl,
    });

    const subject = `Your ${policyData.productType} Policy is Ready - Policy #${policyData.policyNumber}`;

    console.log(`[EMAIL] Sending policy assignment email to ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Policy Number: ${policyData.policyNumber}`);

    // In production, integrate with email service
    if (process.env.NODE_ENV === "production") {
      // TODO: Replace with actual email service
      // await sendEmailViaProvider({ to: email, subject, htmlContent });
    }

    // Notify admin about policy assignment
    await notifyOwner({
      title: `Policy Assigned: ${policyData.policyNumber}`,
      content: `Policy ${policyData.policyNumber} (${policyData.productType}) has been assigned to ${recipientName} (${email}). Premium: €${policyData.premiumAmount.toFixed(2)}`,
    });

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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EasyToFin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0a7d5c 0%, #0d9d6f 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #0a7d5c;
            color: white;
            padding: 14px 40px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            margin: 25px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e8e8e8;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 EasyToFin</div>
            <div style="font-size: 14px; opacity: 0.9;">Your Financial Future, Made Easy</div>
        </div>

        <div class="content">
            <div class="greeting">Welcome to EasyToFin, ${recipientName}! 🎉</div>
            <p style="font-size: 14px; color: #666; line-height: 1.8;">
                We're excited to have you join our community of customers who trust us with their financial wellbeing.
            </p>
            <p style="font-size: 14px; color: #666; line-height: 1.8;">
                Your account is now active and ready to use. Start by completing your profile and selecting the financial services that matter most to you.
            </p>
            <a href="${dashboardUrl}" class="cta-button">Get Started Now</a>
            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
                Questions? We're here to help at support@easytofin.com or 1800 008 888
            </p>
        </div>

        <div class="footer">
            <strong>EasyToFin Financial Services Limited</strong><br>
            Regulated by the Central Bank of Ireland<br>
            © 2026 All rights reserved.
        </div>
    </div>
</body>
</html>
    `;

    const subject = "Welcome to EasyToFin! 🎉";

    console.log(`[EMAIL] Sending welcome email to ${email}`);

    if (process.env.NODE_ENV === "production") {
      // TODO: Replace with actual email service
      // await sendEmailViaProvider({ to: email, subject, htmlContent });
    }

    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending welcome email to ${email}:`, error);
    return false;
  }
}

/**
 * Send document verification email
 */
export async function sendDocumentVerificationEmail(
  email: string,
  recipientName: string,
  documentType: string,
  status: "verified" | "rejected",
  notes?: string
): Promise<boolean> {
  try {
    const isVerified = status === "verified";
    const statusText = isVerified ? "Verified ✅" : "Rejected ❌";
    const statusColor = isVerified ? "#0a7d5c" : "#d32f2f";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document ${statusText} - EasyToFin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0a7d5c 0%, #0d9d6f 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .status-badge {
            background-color: ${isVerified ? "#f0f7f4" : "#ffebee"};
            border-left: 4px solid ${statusColor};
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .status-title {
            font-size: 18px;
            font-weight: 700;
            color: ${statusColor};
            margin-bottom: 10px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e8e8e8;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 EasyToFin</div>
        </div>

        <div class="content">
            <p>Hello ${recipientName},</p>
            
            <div class="status-badge">
                <div class="status-title">${documentType} - ${statusText}</div>
                <p style="margin: 0; font-size: 14px; color: #666;">
                    ${isVerified
                      ? "Your document has been verified and approved. Thank you for providing the necessary information."
                      : "Your document requires additional information or clarification."}
                </p>
                ${notes ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #666;"><strong>Notes:</strong> ${notes}</p>` : ""}
            </div>

            <p style="font-size: 14px; color: #666;">
                ${isVerified ? "You can now proceed with your application." : "Please resubmit your document with the necessary corrections."}
            </p>
        </div>

        <div class="footer">
            <strong>EasyToFin Financial Services Limited</strong><br>
            Regulated by the Central Bank of Ireland<br>
            © 2026 All rights reserved.
        </div>
    </div>
</body>
</html>
    `;

    const subject = `Your ${documentType} Has Been ${statusText}`;

    console.log(`[EMAIL] Sending document verification email to ${email}`);

    if (process.env.NODE_ENV === "production") {
      // TODO: Replace with actual email service
      // await sendEmailViaProvider({ to: email, subject, htmlContent });
    }

    return true;
  } catch (error) {
    console.error(`[EMAIL] Error sending document verification email to ${email}:`, error);
    return false;
  }
}
