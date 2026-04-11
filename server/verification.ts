import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { ENV } from './_core/env';

// Initialize Twilio client
const twilioClient = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);

// Initialize SendGrid
sgMail.setApiKey(ENV.sendgridApiKey);

/**
 * Send SMS verification code using Twilio Verify API
 */
export async function sendSMSVerification(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const verification = await twilioClient.verify.v2
      .services(ENV.twilioVerifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    return {
      success: verification.status === 'pending',
    };
  } catch (error) {
    console.error('SMS verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS verification',
    };
  }
}

/**
 * Verify SMS code using Twilio Verify API
 */
export async function verifySMSCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(ENV.twilioVerifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

    return {
      success: verificationCheck.status === 'approved',
    };
  } catch (error) {
    console.error('SMS verification check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify SMS code',
    };
  }
}

/**
 * Generate and send email verification code using SendGrid
 */
export async function sendEmailVerification(email: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: ENV.sendgridFromName,
      },
      subject: 'EasyToFin - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a5f3f;">Email Verification</h2>
          <p>Your EasyToFin email verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1a5f3f; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            EasyToFin Financial Services Limited<br />
            Regulated by the Central Bank of Ireland
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return {
      success: true,
      code: code,
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email verification',
    };
  }
}

/**
 * Verify email code (stored in session/cache during verification flow)
 */
export function verifyEmailCode(providedCode: string, storedCode: string): boolean {
  return providedCode === storedCode;
}
