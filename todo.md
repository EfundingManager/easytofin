# EasyToFin Project TODO

## Phase 1: Full-Stack Upgrade
- [x] Upgrade project to full-stack with database and backend
- [x] Install dependencies and fix TypeScript issues
- [x] Restore custom Home.tsx with new authentication hooks

## Phase 2: Client Authentication System
- [x] Create user registration schema in drizzle/schema.ts (phone, email, 2FA settings)
- [x] Implement phone-based registration with OTP/2FA verification
- [x] Create login/registration pages with form validation
- [x] Implement 2FA verification flow
- [x] Add "Client Login" button to Navbar
- [x] Integrate Gmail OAuth login with Google Sign-in button
- [ ] Add session management and authentication middleware

## Phase 3: Product Selection & Fact-Finding Forms
- [ ] Create product selection page after registration
- [ ] Build fact-finding form for Protection products
- [ ] Build fact-finding form for Pensions products
- [ ] Build fact-finding form for Health Insurance products
- [ ] Build fact-finding form for General Insurance products
- [ ] Build fact-finding form for Investments products
- [ ] Create form submission and data storage logic
- [ ] Add form progress tracking and validation

## Phase 4: Admin Backend
- [x] Create admin user role and permissions system (role field in schema)
- [x] Build admin dashboard page with access control
- [x] Create admin dashboard layout with DashboardLayout
- [x] Implement client submissions management interface
- [x] Build fact-finding form responses viewer
- [x] Create configuration management interface (UI placeholders)
- [x] Add analytics and reporting features (stats, product stats, recent activity)
- [x] Create admin-only API endpoints (adminRouter with 10+ procedures)
- [x] Write and pass unit tests for admin router

## Phase 5: Header Integration
- [x] Add "Client Login" button to Navbar (positioned beside "Get A Quote")
- [ ] Implement login/logout state in header
- [ ] Create dropdown menu for logged-in users
- [ ] Add user profile section in dropdown
- [ ] Implement logout functionality

## Phase 6: Testing & Deployment
- [ ] Test client registration flow (Gmail OAuth)
- [ ] Test phone registration with 2FA
- [ ] Test product selection flow
- [ ] Test fact-finding forms for all products
- [ ] Test admin login and dashboard
- [ ] Test admin configuration features
- [ ] Create checkpoint
- [ ] Deploy to production

## Phase 4.5: Admin Dashboard Enhancements
- [x] Add global search function at top of admin dashboard (search by policy number or name)
- [x] Implement client workflow management (queue → customers)
- [x] Add client status tracking (new → in_progress → assigned_policy → customer)
- [x] Create clients queue view (unassigned clients)
- [x] Create customers section (clients with policy numbers)
- [x] Add policy number assignment interface (assignPolicy procedure)
- [x] Move clients from queue to customers when policy assigned

## Phase 5: Policy Assignment Modal
- [x] Create PolicyAssignmentModal component with form fields
- [x] Add form validation for policy number and required fields
- [x] Integrate modal with Clients Queue tab
- [x] Add mutation handler for assigning policies
- [ ] Test policy assignment workflow

## Phase 6: User Profile & Service Selection
- [x] Update database schema to track selected services (userProducts table exists)
- [x] Create API procedures for profile update and service selection (profile router)
- [x] Create UserProfile page component with form
- [x] Add service selection multi-select with checkboxes
- [x] Create success confirmation modal with contact info
- [x] Update routing to add /profile route
- [ ] Test complete registration and profile flow

## Phase 7: Phone Auth Integration with Profile Redirect
- [x] Review phone authentication flow
- [x] Update phone auth backend to set redirect URL (already configured)
- [x] Update phone auth frontend to redirect to profile after login (PhoneAuth.tsx updated)
- [ ] Test complete registration and profile flow

## Phase 8: Email Verification
- [x] Update database schema to track email verification tokens and status (emailVerificationTokens table)
- [x] Create email verification API procedures (email-verification router with 4 procedures)
- [x] Update profile submission to send verification email (UserProfile.tsx updated)
- [x] Create email verification page with token validation (VerifyEmail.tsx)
- [ ] Test complete email verification flow

## Phase 9: Admin Email Notifications
- [x] Create admin notification email service (adminNotification.ts with 3 functions)
- [x] Update profile submission to trigger admin notifications (profile router updated)
- [x] Update policy assignment to trigger admin notifications (workflow router updated)
- [ ] Test email notification workflow

## Phase 10: Fact-Finding Forms for Each Service
- [x] Database schema already has factFindingForms table
- [x] Create Protection (Life Insurance) fact-finding form component
- [x] Create Pensions fact-finding form component
- [x] Create Health Insurance fact-finding form component
- [x] Create General Insurance fact-finding form component
- [x] Create Investments fact-finding form component
- [x] Create API procedures to save form responses (submitFactFindingForm mutation)
- [x] Create fact-finding form page with service routing (FactFindingForm.tsx)
- [ ] Test complete fact-finding workflow

## Phase 11: Form Progress Tracking
- [x] Create progress tracking API procedures (getFormProgress, updateFormProgress in profile-progress router)
- [x] Create FormProgress component with visual progress bar and completion status
- [x] Integrate progress tracker into FactFindingForm page (both selection and form pages)
- [x] Add progress persistence to database (via factFindingForms table)
- [x] Add resume functionality for incomplete forms (status tracking)
- [ ] Test progress tracking workflow

## Phase 12: User Dashboard
- [x] Create UserDashboard page component with layout
- [x] Integrate profile status display (name, email, phone, verification status)
- [x] Integrate form progress tracker from FormProgress component
- [x] Add quick action buttons (Edit Profile, Continue Forms, View Policies)
- [x] Add routing to /dashboard for authenticated users
- [ ] Test complete dashboard workflow

## Phase 13: Profile Submission Redirect
- [x] Update UserProfile to redirect to dashboard after submission
- [x] Update success message to indicate redirect ("Redirecting to your dashboard...")
- [ ] Test complete profile submission and redirect flow

## Phase 14: Document Upload Feature
- [x] Update database schema to store document uploads (clientDocuments table)
- [x] Create document upload API procedures (upload, list, delete, getDownloadUrl in documents router)
- [x] Create DocumentUpload component with drag-and-drop
- [x] Integrate document upload into user dashboard
- [x] Add document management section showing uploaded files
- [ ] Test complete document upload workflow

## Phase 15: Phone & Email Registration Options
- [x] Update authentication UI to show phone and email registration options (AuthSelection page)
- [x] Create email registration flow with OTP verification (EmailAuth page + emailAuthRouter)
- [x] Update phone registration flow with OTP verification (already implemented)
- [x] Add email/phone toggle on registration page (AuthSelection page with both options)
- [ ] Test complete registration with both methods

## Phase 16: Branded Email Templates
- [x] Create OTP email template with brand colors and logo (emailTemplates.ts)
- [x] Create account confirmation email template (emailTemplates.ts)
- [x] Create policy assignment email template (emailTemplates.ts)
- [x] Create email template service for rendering templates (emailService.ts with 5 functions)
- [x] Integrate email sending with branded templates (email-auth router updated)
- [ ] Test email delivery and rendering

## Phase 17: Admin Customer Detail Pages
- [x] Create detailed customer page component showing all customer information (AdminCustomerDetail.tsx)
- [x] Create API procedure to fetch customer details with associated policies and documents (getCustomerDetail in admin router)
- [x] Update admin dashboard customers table with clickable Customer ID and Full Name
- [x] Add routing for customer detail pages (/admin/customers/:customerId)
- [x] Add back button and navigation to customer detail page

## Phase 18: Enhanced Customer Detail Page
- [x] Update database schema to add address field to phoneUsers table
- [x] Update database schema to add advisor information to policyAssignments table (advisorName, advisorPhone)
- [x] Update API procedures to return enhanced customer and policy data (already returns all fields)
- [x] Update AdminCustomerDetail page to display address and all policy details (effective date, renewal date, advisor info)
- [x] Add advisor contact information display on customer detail page

## Phase 19: Admin Document Review
- [x] Create document review API procedures (updateDocumentStatus, addDocumentNote, getDocumentDetails in document-review router)
- [x] Create DocumentReview component with status update interface
- [ ] Integrate document review into customer detail page
- [ ] Add document verification workflow with admin notes
- [ ] Test document review and status update workflow

## Phase 20: Admin Document and Form Upload on Customer Detail Page
- [x] Create admin document upload component for Documents tab (AdminDocumentUpload.tsx)
- [x] Create admin form upload component for Forms tab (AdminFormUpload.tsx)
- [x] Integrate upload components into AdminCustomerDetail page
- [x] Add API procedures for admin file uploads (using existing documents router)
- [x] Test document and form uploads on customer detail page

## Phase 21: Enhanced Policy Display on Customer Detail Page
- [x] Create enhanced policy display component with all required fields (PolicyDisplay.tsx)
- [x] Update AdminCustomerDetail page to use enhanced policy display
- [x] Test policy information display on customer detail page

## Phase 22: Sandbox Data for Policies, Documents, and Forms
- [x] Create sandbox script to populate policies with realistic data (sandbox-policies-documents-forms.ts)
- [x] Create sandbox script to populate documents with realistic data (sandbox-policies-documents-forms.ts)
- [x] Create sandbox script to populate forms with realistic data (sandbox-policies-documents-forms.ts)
- [x] Execute sandbox scripts and verify data is created
- [x] Fix admin router to fetch from correct tables (policyAssignments, clientDocuments, factFindingForms)
- [x] Test display on customer detail page - policies now showing correctly

## Phase 23: Document List Component with Status Badges and Download Links
- [x] Create document list component with status badges and download links (DocumentList.tsx)
- [x] Integrate document list component into AdminCustomerDetail page
- [x] Test document display and download functionality - component renders correctly with empty state

## Phase 24: Document List Search and Filter Functionality
- [x] Create enhanced DocumentList component with search and filter controls
- [x] Implement search functionality to filter documents by name and type
- [x] Implement filter controls for document type, status, and date range (7/30/90 days)
- [x] Test search and filter functionality - all controls render correctly

## Phase 25: Document Preview Modal for PDF Viewing
- [x] Create document preview modal component with PDF viewer (DocumentPreviewModal.tsx)
- [x] Integrate preview modal into DocumentList component - preview button opens modal
- [x] Test PDF preview functionality - modal renders correctly with all features

## Phase 26: Client Dashboard Policies Widget
- [x] Create policies widget component for client dashboard (ClientPoliciesWidget.tsx)
- [x] Create policiesRouter with getClientPolicies procedure
- [x] Integrate policies widget into client dashboard
- [x] Test policies display on client dashboard - widget renders correctly with empty state

## Phase 27: Policy Renewal Reminder Widget
- [x] Create policy renewal reminder widget component (PolicyRenewalReminder.tsx)
- [x] Add getUpcomingRenewals procedure to policies router
- [x] Integrate renewal reminder widget into client dashboard
- [x] Test renewal reminder widget functionality - widget renders correctly with empty state

## Phase 28: Add KYC Form Type
- [x] Update AdminFormUpload component to include KYC form type
- [x] Test KYC form option in dropdown - KYC Form now appears as first option

## Phase 29: KYC Verification Status Field
- [x] Add kycStatus field to users table schema (phoneUsers table)
- [x] Create KYC status update procedure in admin router (updateKycStatus mutation)
- [x] Create KYC status component for admin customer detail page (KYCStatusDisplay.tsx)
- [x] Integrate KYC status component into admin customer detail page
- [x] Test KYC status update functionality - component renders and allows status changes

## Phase 30: KYC Verification Requirement for Policy Assignment
- [x] Add KYC verification check to policy assignment procedure (workflow router)
- [x] Create UI validation to prevent policy assignment when KYC is not verified (PolicyAssignmentModal)
- [x] Test policy assignment with KYC verification requirement - warning displays and button disabled

## Phase 31: Fix Email Registration Display
- [x] Review AuthSelection page and identify missing email option - email option already present
- [x] Fix admin router getCustomerDetail to return address and kycStatus fields
- [x] Fix workflow router duplicate variable declaration (clientResult → clientDetailsResult)
- [x] Test email registration option displays correctly - both Phone and Email options visible

## Phase 32: WeCom Live Chat Widget Integration
- [x] Research WeCom integration requirements and obtain WeCom ID (wwd347ac3e0b84cbf7)
- [x] Create WeCom configuration component with settings (WeComWidget.tsx)
- [x] Integrate WeCom widget into main layout for all pages (App.tsx + index.html)
- [x] Configure WeCom for multi-language support (English: Contact Us, Chinese: 联系我们, Polish: Skontaktuj się z nami)
- [x] Add WeCom embed code to index.html with official SDK initialization

## Phase 33: WeCom Customer Contact Secret Configuration
- [x] Update WeCom widget with Customer Contact Secret (B8sEti5rjXgsG6nDSa7ozQMmJ-kAB1c3S19UXJmyES8)
- [x] Implement WeCom widget button with proper authentication in index.html
- [x] Configure WeCom SDK initialization with authentication parameters

## Phase 34: Fix WeCom Widget Display
- [x] Debug WeCom widget initialization and display issues
- [x] Implement simplified WeCom widget that displays reliably (WeComWidgetSimple.tsx)
- [x] Test WeCom widget visibility on multiple pages - widget displays on home and admin pages

## Phase 35: Fix WeCom Widget 404 Error
- [x] Investigate 404 error in WeCom widget network requests - SDK URL was being opened as chat URL
- [x] Fix WeCom chat URL and authentication parameters - updated to use proper WeCom SDK initialization
- [x] Rewrite WeComWidgetSimple component with proper SDK loading and error handling

## Phase 36: Fix WeCom SDK Loading Error
- [x] Diagnose WeCom SDK loading failure - SDK URL was being blocked/not loading
- [x] Implement improved WeCom SDK loading with error recovery - removed SDK dependency
- [x] Test WeCom widget without SDK dependency - widget works and displays without errors

## Phase 37: Fix WeCom redirect_uri Parameter Error
- [x] Diagnose redirect_uri parameter error - parameter was causing URL format issues
- [x] Fix WeCom chat URL and redirect_uri parameter format - removed problematic redirect_uri
- [x] Test WeCom chat window functionality - widget works without errors

## Phase 38: Update WeCom API Link and kfid Configuration
- [x] Update WeComWidgetSimple component with new API link (https://work.weixin.qq.com/kfid/kfc17931e7a2589a51a)
- [x] Configure WeCom widget with correct kfid (kfc17931e7a2589a51a) for customer service routing
- [x] Update fallback URL to use WeCom API link with kfid
- [x] Test WeCom widget with new configuration - widget displays and opens correctly
- [x] Verify multi-language support (English, Chinese, Polish) with new configuration

## Phase 39: WeCom Widget Chinese-Only Display
- [x] Update WeComWidgetSimple to detect language and only display on Chinese pages
- [x] Change button text to "企业微信" (WeCom in Chinese)
- [x] Hide widget on English and Polish pages
- [x] Test widget visibility on different language pages

## Phase 40: Auto-Redirect to Client Dashboard After Login
- [x] Update PhoneAuth component to redirect to /dashboard after successful login
- [x] Update EmailAuth component to redirect to /dashboard after successful login
- [x] Verify redirect happens automatically without manual navigation
- [x] Test redirect flow on both phone and email authentication

## Phase 41: Fix Google Sign-In Popup Blocking Errors
- [x] Investigate Google Sign-In popup blocking issue in PhoneAuth
- [x] Update Google Sign-In implementation with better error handling and configuration
- [x] Add proper script loading detection and error handling
- [x] Test Google Sign-In on PhoneAuth page - no more popup blocking errors

## Phase 42: Apply Google Sign-In Improvements to EmailAuth
- [x] Update EmailAuth component with same Google Sign-In error handling
- [x] Add proper script loading detection and state management
- [x] Test Google Sign-In on EmailAuth page
- [x] Verify consistent behavior with PhoneAuth implementation

## Phase 43: Review and Improve Chinese Homepage Translations
- [x] Audit Chinese homepage for translation quality and professional terminology
- [x] Identify non-professional or awkward translations
- [x] Update with proper insurance and finance industry terminology
- [x] Test and verify Chinese homepage displays correctly

## Phase 44: Implement Twilio SMS and SendGrid Email Verification
- [x] Set up Twilio and SendGrid environment variables
- [x] Create SMS verification service using Twilio Verify API
- [x] Create email verification service using SendGrid
- [x] Update PhoneAuth router with SMS OTP verification
- [x] Update EmailAuth router with email OTP verification
- [x] Create verification service tests
- [x] Integrate Twilio and SendGrid into authentication flow
- [x] Verify verification codes expire properly
