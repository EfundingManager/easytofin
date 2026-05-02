/**
 * Branded HTML Email Templates for EasyToFin
 * Includes OTP, account confirmation, and other transactional emails
 */

interface EmailTemplateData {
  [key: string]: string | number;
}

/**
 * OTP Email Template
 * Sends a 6-digit OTP code for authentication
 */
export function getOtpEmailTemplate(data: {
  recipientName: string;
  otp: string;
  expiryMinutes?: number;
  isNewUser?: boolean;
}): string {
  const expiryMinutes = data.expiryMinutes || 5;
  const actionText = data.isNewUser ? "Complete your registration" : "Sign in to your account";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your EasyToFin Verification Code</title>
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
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .description {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .otp-section {
            background-color: #f9f9f9;
            border: 2px solid #e8e8e8;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            display: block;
        }
        .otp-code {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0a7d5c;
            font-family: 'Courier New', monospace;
            margin: 0;
            word-break: break-all;
        }
        .expiry-info {
            font-size: 12px;
            color: #999;
            margin-top: 15px;
        }
        .security-note {
            background-color: #fffbf0;
            border-left: 4px solid #ffa500;
            padding: 15px;
            margin: 30px 0;
            font-size: 13px;
            color: #666;
            border-radius: 4px;
        }
        .security-note strong {
            color: #333;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e8e8e8;
        }
        .footer-text {
            font-size: 12px;
            color: #999;
            margin: 10px 0;
        }
        .footer-links {
            margin-top: 20px;
            font-size: 12px;
        }
        .footer-links a {
            color: #0a7d5c;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e8e8e8;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🌿 EasyToFin</div>
            <div class="tagline">Your Financial Future, Made Easy</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Hello ${data.recipientName},</div>

            <div class="description">
                ${data.isNewUser 
                  ? "Welcome to EasyToFin! To complete your registration and get started with our financial services, please use the verification code below:"
                  : "We received a request to sign in to your EasyToFin account. Use the verification code below to proceed:"}
            </div>

            <!-- OTP Section -->
            <div class="otp-section">
                <span class="otp-label">Your Verification Code</span>
                <div class="otp-code">${data.otp}</div>
                <div class="expiry-info">This code expires in ${expiryMinutes} minutes</div>
            </div>

            <!-- Security Note -->
            <div class="security-note">
                <strong>🔒 Security Reminder:</strong> Never share this code with anyone. EasyToFin staff will never ask for your verification code.
            </div>

            <div class="description">
                ${data.isNewUser
                  ? "Once verified, you'll be able to complete your profile, select the financial services you're interested in, and our team will be in touch shortly."
                  : "If you didn't request this code, you can safely ignore this email. Your account remains secure."}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                <strong>EasyToFin Financial Services Limited</strong><br>
                Regulated by the Central Bank of Ireland
            </div>
            <div class="divider"></div>
            <div class="footer-links">
                <a href="https://easytofin.com/privacy">Privacy Policy</a>
                <a href="https://easytofin.com/terms">Terms of Service</a>
                <a href="https://easytofin.com/contact">Contact Us</a>
            </div>
            <div class="footer-text" style="margin-top: 20px; font-size: 11px;">
                © 2026 EasyToFin Financial Services Limited. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Account Confirmation Email Template
 * Sent after successful email verification
 */
export function getAccountConfirmationTemplate(data: {
  recipientName: string;
  email: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Confirmed - EasyToFin</title>
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
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .success-badge {
            text-align: center;
            margin-bottom: 30px;
        }
        .success-icon {
            font-size: 64px;
            margin-bottom: 15px;
        }
        .greeting {
            font-size: 22px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 10px;
            text-align: center;
        }
        .subheading {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #f0f7f4;
            border-left: 4px solid #0a7d5c;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
        }
        .next-steps {
            margin: 30px 0;
        }
        .next-steps-title {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 15px;
        }
        .step {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e8e8e8;
        }
        .step:last-child {
            border-bottom: none;
        }
        .step-number {
            background-color: #0a7d5c;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .step-content {
            flex: 1;
        }
        .step-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 5px;
        }
        .step-description {
            font-size: 13px;
            color: #666;
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
            margin: 30px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .cta-button:hover {
            background-color: #085d48;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e8e8e8;
        }
        .footer-text {
            font-size: 12px;
            color: #999;
            margin: 10px 0;
        }
        .footer-links {
            margin-top: 20px;
            font-size: 12px;
        }
        .footer-links a {
            color: #0a7d5c;
            text-decoration: none;
            margin: 0 15px;
        }
        .footer-links a:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e8e8e8;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🌿 EasyToFin</div>
            <div class="tagline">Your Financial Future, Made Easy</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="success-badge">
                <div class="success-icon">✅</div>
                <div class="greeting">Account Confirmed!</div>
                <div class="subheading">Your email has been verified successfully</div>
            </div>

            <div class="info-box">
                <span class="info-label">Verified Email Address</span>
                <div class="info-value">${data.email}</div>
            </div>

            <div class="next-steps">
                <div class="next-steps-title">What's Next?</div>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">Complete Your Profile</div>
                        <div class="step-description">Add your contact information and select the financial services you're interested in (Protection, Pensions, Health Insurance, etc.)</div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">Fill Out Fact-Finding Forms</div>
                        <div class="step-description">Complete detailed questionnaires for your selected services so we can provide personalized recommendations.</div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">Connect with Our Team</div>
                        <div class="step-description">Our financial advisors will review your information and contact you with tailored solutions within 24-48 hours.</div>
                    </div>
                </div>
            </div>

            <a href="${data.loginUrl}" class="cta-button">Go to Your Dashboard</a>

            <div style="background-color: #f0f7f4; padding: 20px; border-radius: 6px; margin-top: 30px;">
                <div style="font-size: 14px; color: #666; line-height: 1.8;">
                    <strong style="color: #1a1a1a;">Need Help?</strong><br>
                    If you have any questions or need assistance, our support team is here to help. Contact us at <a href="mailto:support@easytofin.com" style="color: #0a7d5c; text-decoration: none;">support@easytofin.com</a> or call <a href="tel:+353180088" style="color: #0a7d5c; text-decoration: none;">1800 008 888</a>.
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                <strong>EasyToFin Financial Services Limited</strong><br>
                Regulated by the Central Bank of Ireland
            </div>
            <div class="divider"></div>
            <div class="footer-links">
                <a href="https://easytofin.com/privacy">Privacy Policy</a>
                <a href="https://easytofin.com/terms">Terms of Service</a>
                <a href="https://easytofin.com/contact">Contact Us</a>
            </div>
            <div class="footer-text" style="margin-top: 20px; font-size: 11px;">
                © 2026 EasyToFin Financial Services Limited. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Policy Assignment Notification Email Template
 * Sent when a policy is assigned to a customer
 */
export function getPolicyAssignmentTemplate(data: {
  recipientName: string;
  policyNumber: string;
  productType: string;
  insurerName: string;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  dashboardUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Policy is Ready - EasyToFin</title>
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
            letter-spacing: -0.5px;
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
        .policy-card {
            background: linear-gradient(135deg, #f0f7f4 0%, #f9fcfb 100%);
            border: 2px solid #0a7d5c;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .policy-detail {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e8e8e8;
        }
        .policy-detail:last-child {
            border-bottom: none;
        }
        .policy-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .policy-value {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            text-align: right;
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
        }
        .footer-text {
            font-size: 12px;
            color: #999;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌿 EasyToFin</div>
        </div>

        <div class="content">
            <div class="greeting">Great News, ${data.recipientName}!</div>
            <p style="font-size: 14px; color: #666; line-height: 1.8;">
                Your ${data.productType} policy has been approved and is now active. Here are your policy details:
            </p>

            <div class="policy-card">
                <div class="policy-detail">
                    <span class="policy-label">Policy Number</span>
                    <span class="policy-value">${data.policyNumber}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-label">Product Type</span>
                    <span class="policy-value">${data.productType}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-label">Insurer</span>
                    <span class="policy-value">${data.insurerName}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-label">Premium</span>
                    <span class="policy-value">€${data.premiumAmount.toFixed(2)}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-label">Start Date</span>
                    <span class="policy-value">${data.startDate}</span>
                </div>
                <div class="policy-detail">
                    <span class="policy-label">End Date</span>
                    <span class="policy-value">${data.endDate}</span>
                </div>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.8;">
                You can view and manage your policy details anytime from your EasyToFin dashboard.
            </p>

            <a href="${data.dashboardUrl}" class="cta-button">View Your Policy</a>

            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
                Questions? Contact our support team at support@easytofin.com or 1800 008 888
            </p>
        </div>

        <div class="footer">
            <div class="footer-text">
                <strong>EasyToFin Financial Services Limited</strong><br>
                Regulated by the Central Bank of Ireland<br>
                © 2026 All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
