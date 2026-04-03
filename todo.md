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
