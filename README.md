# EasyToFin

A comprehensive financial services platform for insurance and KYC (Know Your Customer) management, built for the Irish market.

## 📋 Overview

EasyToFin is a full-stack web application that provides a complete solution for financial service providers to manage customer relationships, KYC processes, policy assignments, and email campaigns. The platform supports multiple financial products including life insurance, pensions, health insurance, general insurance, and investments.

## ✨ Key Features

### Authentication & Security
- **Multi-Method Authentication**
  - Phone OTP (Twilio SMS verification)
  - Email OTP (SendGrid email verification)
  - Google OAuth (Gmail Sign-In)
- **Two-Factor Authentication (2FA)** for privileged roles
- **Device Trust System** - Remember trusted devices to skip OTP
- **Session Management** - Secure session handling with automatic timeout
- **Rate Limiting** - Protect against brute force attacks
- **Account Lockout** - Automatic lockout after failed attempts
- **IP Blacklist/Whitelist** - Advanced IP-based access control

### User Management
- **Role-Based Access Control (RBAC)**
  - User, Customer, Staff, Manager, Admin, Super Admin
- **KYC Workflow**
  - Online form submission
  - Document upload with drag-and-drop
  - Admin review and approval
  - Status tracking (pending, submitted, verified, rejected)
- **Client Status Tracking**
  - Queue → In Progress → Assigned → Customer

### Financial Products
Support for 5 product types:
1. **Protection** (Life Insurance)
2. **Pensions**
3. **Health Insurance**
4. **General Insurance**
5. **Investments**

Each with dedicated fact-finding forms and workflows.

### Admin Dashboard
- Customer management with global search
- KYC application review
- Policy assignment interface
- Document verification
- Email campaign management
- Rate limit monitoring
- Security audit logs
- Feature flag controls

### Email Campaign System
- Pre-built email templates
- CSV recipient import
- Campaign scheduling
- Delivery tracking
- Open/click analytics

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **tRPC** - End-to-end type-safe APIs
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion** - Animations

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - TypeScript-first ORM
- **MySQL 8+** - Primary database
- **JWT (jose)** - Authentication tokens

### Third-Party Services
- **Twilio** - SMS OTP delivery
- **SendGrid** - Transactional emails
- **Google OAuth** - Social login
- **AWS S3** - Document storage

### Development Tools
- **pnpm** - Package manager
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESBuild** - Production bundling
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.x or v22.x (v22.13.0 recommended)
- **pnpm** v10.x
- **MySQL** 8.0+ or TiDB
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EfundingManager/easytofin.git
   cd easytofin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_here

   # Database Configuration
   DATABASE_URL=mysql://user:password@localhost:3306/easytofin_db

   # Authentication (Manus OAuth & Google)
   VITE_APP_ID=your_manus_app_id
   VITE_OAUTH_PORTAL_URL=https://auth.manus.im
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

   # Twilio (Phone 2FA)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid

   # SendGrid (Email)
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=noreply@easytofin.com
   SENDGRID_FROM_NAME="EASYTOFIN Support"
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
easytofin/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── pages/         # Page components (39 pages)
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts (Theme, Language)
│   │   ├── lib/           # Utility functions
│   │   └── _core/         # Core frontend logic
│   ├── public/            # Static assets
│   └── index.html         # HTML entry point
│
├── server/                # Backend application
│   ├── _core/             # Core server setup
│   │   ├── index.ts      # Express server entry
│   │   ├── oauth.ts      # OAuth handlers
│   │   └── context.ts    # tRPC context
│   ├── routers/           # tRPC routers (48 routers)
│   │   ├── admin.ts
│   │   ├── phone-auth.ts
│   │   ├── email-auth.ts
│   │   ├── gmail-auth.ts
│   │   ├── two-factor-auth.ts
│   │   └── ...
│   ├── services/          # Business logic services
│   ├── db.ts              # Database helpers
│   └── routers.ts         # Router aggregation
│
├── drizzle/               # Database schema and migrations
│   ├── schema.ts          # Database schema (30+ tables)
│   └── *.sql              # Migration files
│
├── shared/                # Shared code between client/server
│   ├── types.ts
│   ├── const.ts
│   └── kycForms.ts
│
├── scripts/               # Utility scripts
├── e2e/                   # End-to-end tests
├── vite.config.ts         # Vite configuration
├── drizzle.config.ts      # Drizzle ORM configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Generate and apply migrations

# Code Quality
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run unit tests
```

## 👤 User Roles & Access

### Regular Users
- Register via phone/email/Gmail
- Complete KYC verification
- Submit fact-finding forms
- Upload documents
- View personal dashboard

### Customers (KYC-Verified)
- Access customer portal
- View assigned policies
- Manage documents
- Contact support

### Staff/Manager
- View assigned clients
- Process applications
- Update client status

### Admin
- Full customer management
- KYC approval/rejection
- Policy assignment
- Email campaign management
- System configuration
- Security monitoring

### Super Admin
- All admin privileges
- User role management
- Feature flag controls
- System-wide settings

## 🔐 Security Features

- **HTTP-Only Cookies** - Prevent XSS attacks
- **CSRF Protection** - Cross-Site Request Forgery prevention
- **Rate Limiting** - Protect against brute force
  - Max 3 OTP requests per hour per identifier
  - Max 5 verification attempts per OTP code
- **Account Lockout** - Automatic after failed attempts
- **IP-Based Protection**
  - Blacklist/Whitelist management
  - Reputation tracking
  - Automatic blocking
- **Session Security**
  - Automatic timeout (30 minutes)
  - Activity monitoring
  - Session fixation prevention
- **Audit Logging** - Track all security-related events
- **Device Fingerprinting** - Detect and remember trusted devices

## 📊 Database Schema

The application uses 30+ tables for comprehensive data management:

### Core Tables
- `users` / `phoneUsers` - User authentication
- `otpCodes` - OTP verification codes
- `sessionTokens` - Active sessions

### Business Logic
- `factFindingForms` - Customer questionnaires
- `policyAssignments` - Policy records
- `userProducts` - Product selections
- `clientDocuments` - Document storage metadata

### Email System
- `emailTemplates` - Email templates
- `emailBlasts` - Campaign management
- `emailBlastDeliveries` - Delivery tracking
- `recipientLists` / `recipients` - Mailing lists

### Security & Monitoring
- `loginAttempts` - Track login attempts
- `accountLockouts` - Lockout management
- `securityAuditLog` - Security events
- `sessionActivityLog` - Session tracking
- `rateLimitLogs` - Rate limit violations
- `ipRateLimitLog` - IP-based rate limiting
- `ipWhitelist` / `ipBlacklist` - IP management
- `ipReputation` - IP reputation scores

### Device Management
- `trustedDevices` - Remembered devices
- `deviceVerificationTokens` - Device verification

### Feature Flags
- `featureFlags` - Dynamic feature control

## 🌐 Internationalization

The platform supports multiple languages:
- English (Primary)
- Chinese (Simplified)
- Polish

Language switching is available throughout the application.

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

The project includes comprehensive test coverage:
- 134+ server-side tests
- 75+ Gmail integration tests
- 36+ Remember Me functionality tests
- 34+ device fingerprinting tests
- Authentication flow tests
- Security feature tests

### E2E Tests
```bash
npx playwright test
```

End-to-end tests cover critical user flows using Playwright.

## 📦 Deployment

### Production Build
```bash
# 1. Build the application
pnpm build

# 2. Set production environment variables
export NODE_ENV=production
export DATABASE_URL=your_production_db_url
# ... other env vars

# 3. Start the production server
pnpm start
```

### Environment Requirements
- Node.js 20+ runtime
- MySQL 8+ database
- SSL certificates for HTTPS
- Twilio account for SMS
- SendGrid account for emails
- Google OAuth credentials
- AWS S3 bucket for file storage

## 📖 Documentation

- `LOCAL_SETUP.md` - Local development setup guide
- `AUTH_FLOW_ANALYSIS.md` - Authentication flow documentation
- `AUTH_SECURITY_AUDIT.md` - Security audit report
- `GMAIL_SIGNIN_TEST_PLAN.md` - Gmail integration test plan
- `OAUTH_REDIRECT_URIS_SETUP.md` - OAuth configuration guide
- `todo.md` - Development progress (87 phases completed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support inquiries:
- Email: info@efunding.ie
- Phone: +353 87 915 8817
- Website: https://www.easytofin.com

## 🙏 Acknowledgments

- Built with [Manus](https://manus.im) - Full-stack development platform
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is an active development project. Features and documentation are continuously updated.
