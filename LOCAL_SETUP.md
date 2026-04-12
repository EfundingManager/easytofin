# EASYTOFIN Local Development Setup Guide

This guide provides step-by-step instructions for configuring and running the EASYTOFIN backend and frontend on your local machine. The project is a full-stack TypeScript application using Vite, React, Express, tRPC, and Drizzle ORM with a MySQL database.

## Prerequisites

Before you begin, ensure your local environment meets the following requirements:

- **Node.js**: Version 20.x or 22.x (v22.13.0 recommended)
- **Package Manager**: `pnpm` (v10.x recommended)
- **Database**: A running instance of MySQL 8.0+ or TiDB
- **Git**: For cloning the repository

## 1. Clone the Repository

First, clone the project repository to your local machine and navigate into the project directory.

```bash
git clone https://github.com/EfundingManager/easytofin.git
cd easytofin
```

## 2. Install Dependencies

The project uses `pnpm` for dependency management. Install all required packages by running:

```bash
pnpm install
```

## 3. Environment Configuration

The application requires several environment variables to function correctly, particularly for database access, authentication, and third-party integrations (like Twilio for 2FA).

Create a `.env` file in the root of the project directory:

```bash
touch .env
```

Open the `.env` file and add the following configuration, replacing the placeholder values with your actual credentials:

```env
# ── Server Configuration ──────────────────────────────────────────
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here

# ── Database Configuration ────────────────────────────────────────
# Replace user, password, host, and db_name with your MySQL details
DATABASE_URL=mysql://user:password@localhost:3306/easytofin_db

# ── Authentication (Manus OAuth & Google) ─────────────────────────
VITE_APP_ID=your_manus_app_id
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OAUTH_SERVER_URL=https://api.manus.im
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# ── Twilio (Required for Admin/Manager/Staff Phone 2FA) ───────────
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid

# ── SendGrid (For Email Verification) ─────────────────────────────
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@easytofin.com
SENDGRID_FROM_NAME="EASYTOFIN Support"
```

## 4. Database Setup and Migration

The project uses Drizzle ORM to manage the database schema. Once your `DATABASE_URL` is configured and your MySQL server is running, you need to push the schema to the database.

Run the following command to generate and apply the migrations:

```bash
pnpm db:push
```

This command will create all necessary tables, including `users`, `phoneUsers`, `policyAssignments`, and the `otpCodes` table used for two-factor authentication.

## 5. Start the Development Server

With the dependencies installed, environment variables configured, and the database initialized, you can now start the local development server.

```bash
pnpm dev
```

This command starts the backend Express server using `tsx` in watch mode. The server also automatically handles Vite middleware to serve the React frontend during development.

By default, the application will be available at:
**http://localhost:3000**

## 6. Setting Up an Admin Account

By default, new users who sign in via Google or Email are assigned the standard `user` role. To access the admin dashboard, you must manually promote your account and configure a phone number for the mandatory Two-Factor Authentication (2FA).

### Step 6.1: Sign In
1. Open `http://localhost:3000` in your browser.
2. Sign in using Google or Email OTP. This creates your initial user record in the database.

### Step 6.2: Promote to Admin
You can promote your account directly in the database using a MySQL client, or by running a simple SQL query:

```sql
UPDATE phoneUsers SET role = 'admin' WHERE email = 'your.email@example.com';
UPDATE users SET role = 'admin' WHERE email = 'your.email@example.com';
```

### Step 6.3: Configure Phone Number for 2FA
Admin, Manager, and Staff roles **must** complete phone-based 2FA before successfully logging in. You must register a phone number in E.164 format (e.g., `+447911123456`) for your account.

The project includes a CLI script to manage this. Run the following command in your terminal:

```bash
npx tsx scripts/manage-staff-phones.ts set-by-email your.email@example.com +447911123456
```

### Step 6.4: Complete Admin Login
1. Log out of the application if you are currently signed in.
2. Sign in again.
3. Because your account is now an `admin`, the system will redirect you to the `/2fa` challenge page.
4. You will receive an SMS OTP via Twilio to the phone number you configured.
5. Enter the 6-digit code to complete the login and access the Admin Dashboard.

## Troubleshooting

### Port Conflicts
If port 3000 is already in use, the server will automatically search for the next available port (e.g., 3001, 3002). Check the terminal output to see which port was selected.

### Database Connection Errors
If `pnpm db:push` fails, verify that your MySQL server is running and that the `DATABASE_URL` in your `.env` file is formatted correctly. Ensure the database specified in the URL actually exists (you may need to run `CREATE DATABASE easytofin_db;` manually first).

### 2FA SMS Not Arriving
If you do not receive the SMS during the 2FA challenge:
1. Verify your Twilio credentials in the `.env` file.
2. Ensure the phone number was entered in correct E.164 format.
3. Check the server terminal logs for any Twilio API error messages.
