# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gmail-core.spec.ts >> Gmail Login - Core Scenarios >> should maintain user ID consistency across multiple logins
- Location: e2e/gmail-core.spec.ts:87:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  4   |  * Core E2E Tests for Gmail Login Flow
  5   |  * 
  6   |  * This is a focused test suite covering the essential Gmail login scenarios:
  7   |  * - New user registration
  8   |  * - Existing user login
  9   |  * - Session creation
  10  |  * - Proper redirects
  11  |  * - Error handling
  12  |  */
  13  | 
  14  | test.describe('Gmail Login - Core Scenarios', () => {
  15  |   test('should display Google Sign-In button on email auth page', async ({ page }) => {
  16  |     await page.goto('/email-auth');
  17  |     await page.waitForLoadState('networkidle');
  18  | 
  19  |     // Check if Google Sign-In button is visible
  20  |     const googleButton = page.locator('[role="button"]:has-text("Sign in with Google")');
  21  |     await expect(googleButton).toBeVisible({ timeout: 10000 });
  22  |   });
  23  | 
  24  |   test('should register new Gmail user successfully', async ({ page }) => {
  25  |     const email = `newuser-${Date.now()}@gmail.com`;
  26  |     const googleId = `google-new-${Date.now()}`;
  27  | 
  28  |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  29  |       data: {
  30  |         googleId: googleId,
  31  |         email: email,
  32  |         name: 'New Gmail User',
  33  |         picture: 'https://example.com/photo.jpg',
  34  |       },
  35  |     });
  36  | 
  37  |     expect(response.ok()).toBeTruthy();
  38  |     const result = await response.json();
  39  |     const data = result.result.data;
  40  | 
  41  |     // Verify new user registration
  42  |     expect(data.success).toBe(true);
  43  |     expect(data.isNewRegistration).toBe(true);
  44  |     expect(data.message).toContain('Registration successful');
  45  |     expect(data.userId).toBeDefined();
  46  |     expect(data.redirectUrl).toContain('/profile');
  47  |   });
  48  | 
  49  |   test('should login existing Gmail user successfully', async ({ page }) => {
  50  |     const email = `existing-${Date.now()}@gmail.com`;
  51  |     const googleId = `google-existing-${Date.now()}`;
  52  | 
  53  |     // Create user first
  54  |     const createResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  55  |       data: {
  56  |         googleId: googleId,
  57  |         email: email,
  58  |         name: 'Existing User',
  59  |         picture: 'https://example.com/photo.jpg',
  60  |       },
  61  |     });
  62  | 
  63  |     const createResult = await createResponse.json();
  64  |     const userId = createResult.result.data.userId;
  65  | 
  66  |     // Login with same user
  67  |     const loginResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  68  |       data: {
  69  |         googleId: googleId,
  70  |         email: email,
  71  |         name: 'Existing User',
  72  |         picture: 'https://example.com/photo.jpg',
  73  |       },
  74  |     });
  75  | 
  76  |     expect(loginResponse.ok()).toBeTruthy();
  77  |     const loginResult = await loginResponse.json();
  78  |     const loginData = loginResult.result.data;
  79  | 
  80  |     // Verify existing user login
  81  |     expect(loginData.success).toBe(true);
  82  |     expect(loginData.isNewRegistration).toBe(false);
  83  |     expect(loginData.message).toContain('Login successful');
  84  |     expect(loginData.userId).toBe(userId);
  85  |   });
  86  | 
  87  |   test('should maintain user ID consistency across multiple logins', async ({ page }) => {
  88  |     const email = `consistency-${Date.now()}@gmail.com`;
  89  |     const googleId = `google-consistency-${Date.now()}`;
  90  | 
  91  |     const userIds = [];
  92  | 
  93  |     // Perform 3 logins
  94  |     for (let i = 0; i < 3; i++) {
  95  |       const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  96  |         data: {
  97  |           googleId: googleId,
  98  |           email: email,
  99  |           name: 'Consistency User',
  100 |           picture: 'https://example.com/photo.jpg',
  101 |         },
  102 |       });
  103 | 
> 104 |       expect(response.ok()).toBeTruthy();
      |                             ^ Error: expect(received).toBeTruthy()
  105 |       const result = await response.json();
  106 |       userIds.push(result.result.data.userId);
  107 |     }
  108 | 
  109 |     // All user IDs should be identical
  110 |     expect(userIds[0]).toBe(userIds[1]);
  111 |     expect(userIds[1]).toBe(userIds[2]);
  112 |   });
  113 | 
  114 |   test('should store user profile information correctly', async ({ page }) => {
  115 |     const email = `profile-${Date.now()}@gmail.com`;
  116 |     const googleId = `google-profile-${Date.now()}`;
  117 |     const name = 'Profile Test User';
  118 | 
  119 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  120 |       data: {
  121 |         googleId: googleId,
  122 |         email: email,
  123 |         name: name,
  124 |         picture: 'https://example.com/profile.jpg',
  125 |       },
  126 |     });
  127 | 
  128 |     expect(response.ok()).toBeTruthy();
  129 |     const result = await response.json();
  130 |     const userData = result.result.data.user;
  131 | 
  132 |     // Verify user data
  133 |     expect(userData.email).toBe(email);
  134 |     expect(userData.name).toBe(name);
  135 |     expect(userData.googleId).toBe(googleId);
  136 |   });
  137 | 
  138 |   test('should set email as verified for Gmail users', async ({ page }) => {
  139 |     const email = `verified-${Date.now()}@gmail.com`;
  140 |     const googleId = `google-verified-${Date.now()}`;
  141 | 
  142 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  143 |       data: {
  144 |         googleId: googleId,
  145 |         email: email,
  146 |         name: 'Verified User',
  147 |         picture: 'https://example.com/photo.jpg',
  148 |       },
  149 |     });
  150 | 
  151 |     expect(response.ok()).toBeTruthy();
  152 |     const result = await response.json();
  153 |     const userData = result.result.data.user;
  154 | 
  155 |     // Email should be marked as verified
  156 |     if (userData.emailVerified) {
  157 |       expect(userData.emailVerified).toBe('true');
  158 |     }
  159 |   });
  160 | 
  161 |   test('should assign default role to new Gmail users', async ({ page }) => {
  162 |     const email = `role-${Date.now()}@gmail.com`;
  163 |     const googleId = `google-role-${Date.now()}`;
  164 | 
  165 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  166 |       data: {
  167 |         googleId: googleId,
  168 |         email: email,
  169 |         name: 'Role Test User',
  170 |         picture: 'https://example.com/photo.jpg',
  171 |       },
  172 |     });
  173 | 
  174 |     expect(response.ok()).toBeTruthy();
  175 |     const result = await response.json();
  176 |     const userData = result.result.data.user;
  177 | 
  178 |     // New users should have 'user' role
  179 |     expect(userData.role).toBe('user');
  180 |   });
  181 | 
  182 |   test('should reject Gmail login with invalid email', async ({ page }) => {
  183 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  184 |       data: {
  185 |         googleId: 'google-invalid',
  186 |         email: 'invalid-email',
  187 |         name: 'Invalid Email User',
  188 |         picture: 'https://example.com/photo.jpg',
  189 |       },
  190 |     });
  191 | 
  192 |     // Should return error
  193 |     expect(response.status()).not.toBe(200);
  194 |   });
  195 | 
  196 |   test('should reject Gmail login with missing Google ID', async ({ page }) => {
  197 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  198 |       data: {
  199 |         googleId: '',
  200 |         email: 'test@gmail.com',
  201 |         name: 'Test User',
  202 |         picture: 'https://example.com/photo.jpg',
  203 |       },
  204 |     });
```