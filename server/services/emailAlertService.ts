import { invokeLLM } from '../_core/llm';

export interface FailedLoginAlertData {
  email: string;
  attemptType: 'password' | 'otp' | 'email_link';
  failureReason?: string;
  ipAddress?: string;
  location?: string;
  failedAttemptCount: number;
  timestamp: Date;
}

/**
 * Send failed login alert email to user
 */
export async function sendLoginAlertEmail(data: FailedLoginAlertData): Promise<boolean> {
  try {
    const timeStr = data.timestamp.toLocaleString();
    const locationStr = data.location ? ` from ${data.location}` : '';
    const ipStr = data.ipAddress ? ` (IP: ${data.ipAddress})` : '';

    const emailContent = generateLoginAlertEmail({
      email: data.email,
      attemptType: data.attemptType,
      failureReason: data.failureReason,
      timestamp: timeStr,
      location: locationStr,
      ipAddress: ipStr,
      failedAttemptCount: data.failedAttemptCount,
    });

    // Send email using built-in email service
    const result = await sendEmail({
      to: data.email,
      subject: `Security Alert: Failed Login Attempt on Your EasyToFin Account`,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result) {
      console.log(`[EmailAlert] Sent failed login alert to ${data.email}`);
      return true;
    } else {
      console.error(`[EmailAlert] Failed to send alert to ${data.email}`);
      return false;
    }
  } catch (error) {
    console.error('[EmailAlert] Error sending login alert:', error);
    return false;
  }
}

/**
 * Generate login alert email content
 */
function generateLoginAlertEmail(data: {
  email: string;
  attemptType: string;
  failureReason?: string;
  timestamp: string;
  location: string;
  ipAddress: string;
  failedAttemptCount: number;
}): { html: string; text: string } {
  const attemptTypeLabel = {
    password: 'Password Login',
    otp: 'OTP Verification',
    email_link: 'Email Link',
  }[data.attemptType] || data.attemptType;

  const failureReasonLabel = data.failureReason
    ? `Reason: ${formatFailureReason(data.failureReason)}`
    : '';

  const warningMessage =
    data.failedAttemptCount >= 5
      ? `<p style="color: #d32f2f; font-weight: bold;">⚠️ WARNING: Multiple failed attempts detected. Your account may be at risk.</p>`
      : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1a5f7a; color: white; padding: 20px; border-radius: 4px; text-align: center; }
    .content { padding: 20px; background-color: #f5f5f5; margin-top: 20px; border-radius: 4px; }
    .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #1a5f7a; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #1a5f7a; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
    .button { display: inline-block; background-color: #1a5f7a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔒 Security Alert</h2>
      <p>Failed Login Attempt Detected</p>
    </div>

    <div class="content">
      <p>Hello,</p>
      
      <p>We detected a failed login attempt on your EasyToFin account. Here are the details:</p>

      <div class="alert">
        <strong>⚠️ Important:</strong> If this wasn't you, please secure your account immediately by changing your password.
      </div>

      ${warningMessage}

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Attempt Type:</span> ${attemptTypeLabel}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date & Time:</span> ${data.timestamp}
        </div>
        <div class="detail-row">
          <span class="detail-label">Location:</span> ${data.location || 'Unknown'}
        </div>
        <div class="detail-row">
          <span class="detail-label">IP Address:</span> ${data.ipAddress || 'Not available'}
        </div>
        ${failureReasonLabel ? `<div class="detail-row"><span class="detail-label">${failureReasonLabel}</span></div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Failed Attempts (Last Hour):</span> ${data.failedAttemptCount}
        </div>
      </div>

      <p><strong>What should you do?</strong></p>
      <ul>
        <li>If this was you, you can ignore this message.</li>
        <li>If this wasn't you, <a href="https://easytofin.com/reset-password" class="button">Reset Your Password</a></li>
        <li>Enable two-factor authentication for additional security.</li>
        <li>Review your recent login activity in account settings.</li>
      </ul>

      <p>If you didn't attempt to log in and didn't request this email, please <a href="mailto:support@easytofin.com">contact our support team</a> immediately.</p>
    </div>

    <div class="footer">
      <p>This is an automated security alert from EasyToFin. Please do not reply to this email.</p>
      <p>&copy; 2026 EasyToFin Financial Services. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Security Alert: Failed Login Attempt

We detected a failed login attempt on your EasyToFin account.

Details:
- Attempt Type: ${attemptTypeLabel}
- Date & Time: ${data.timestamp}
- Location: ${data.location || 'Unknown'}
- IP Address: ${data.ipAddress || 'Not available'}
${failureReasonLabel ? `- ${failureReasonLabel}` : ''}
- Failed Attempts (Last Hour): ${data.failedAttemptCount}

${data.failedAttemptCount >= 5 ? 'WARNING: Multiple failed attempts detected. Your account may be at risk.' : ''}

What should you do?
- If this was you, you can ignore this message.
- If this wasn't you, reset your password: https://easytofin.com/reset-password
- Enable two-factor authentication for additional security.
- Review your recent login activity in account settings.

If you didn't attempt to log in, please contact our support team: support@easytofin.com

---
This is an automated security alert from EasyToFin. Please do not reply to this email.
© 2026 EasyToFin Financial Services. All rights reserved.
  `;

  return { html, text };
}

/**
 * Format failure reason for display
 */
function formatFailureReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    invalid_password: 'Invalid password',
    invalid_otp: 'Invalid OTP code',
    expired_otp: 'OTP code expired',
    invalid_email: 'Email not found',
    account_locked: 'Account temporarily locked',
    rate_limited: 'Too many attempts - please try again later',
    invalid_token: 'Invalid or expired recovery link',
    user_not_found: 'User account not found',
  };

  return reasonMap[reason] || reason;
}

/**
 * Send email using built-in email service
 * This is a placeholder - integrate with your actual email service
 */
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  try {
    // TODO: Integrate with SendGrid or other email service
    // For now, just log the email
    console.log(`[Email] Sending email to ${options.to}`);
    console.log(`[Email] Subject: ${options.subject}`);

    // In production, use SendGrid API:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });

    return true;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}
