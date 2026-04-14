# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gmail-core.spec.ts >> Gmail Login - Core Scenarios >> should redirect new user to correct profile page
- Location: e2e/gmail-core.spec.ts:242:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
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
  205 | 
  206 |     // Should return error
  207 |     expect(response.status()).not.toBe(200);
  208 |   });
  209 | 
  210 |   test('should reject Gmail login with missing name', async ({ page }) => {
  211 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  212 |       data: {
  213 |         googleId: 'google-no-name',
  214 |         email: 'test@gmail.com',
  215 |         name: '',
  216 |         picture: 'https://example.com/photo.jpg',
  217 |       },
  218 |     });
  219 | 
  220 |     // Should return error
  221 |     expect(response.status()).not.toBe(200);
  222 |   });
  223 | 
  224 |   test('should handle Gmail login with optional picture', async ({ page }) => {
  225 |     const email = `nopic-${Date.now()}@gmail.com`;
  226 |     const googleId = `google-nopic-${Date.now()}`;
  227 | 
  228 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  229 |       data: {
  230 |         googleId: googleId,
  231 |         email: email,
  232 |         name: 'No Picture User',
  233 |         // picture is optional
  234 |       },
  235 |     });
  236 | 
  237 |     expect(response.ok()).toBeTruthy();
  238 |     const result = await response.json();
  239 |     expect(result.result.data.success).toBe(true);
  240 |   });
  241 | 
  242 |   test('should redirect new user to correct profile page', async ({ page }) => {
  243 |     const email = `redirect-${Date.now()}@gmail.com`;
  244 |     const googleId = `google-redirect-${Date.now()}`;
  245 | 
  246 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  247 |       data: {
  248 |         googleId: googleId,
  249 |         email: email,
  250 |         name: 'Redirect User',
  251 |         picture: 'https://example.com/photo.jpg',
  252 |       },
  253 |     });
  254 | 
> 255 |     expect(response.ok()).toBeTruthy();
      |                           ^ Error: expect(received).toBeTruthy()
  256 |     const result = await response.json();
  257 |     const redirectUrl = result.result.data.redirectUrl;
  258 | 
  259 |     // New user should redirect to /profile
  260 |     expect(redirectUrl).toContain('/profile');
  261 |   });
  262 | 
  263 |   test('should handle concurrent Gmail registrations', async ({ page }) => {
  264 |     const registrations = [];
  265 | 
  266 |     // Create 3 concurrent registrations
  267 |     for (let i = 0; i < 3; i++) {
  268 |       const email = `concurrent-${Date.now()}-${i}@gmail.com`;
  269 |       const googleId = `google-concurrent-${Date.now()}-${i}`;
  270 | 
  271 |       registrations.push(
  272 |         page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  273 |           data: {
  274 |             googleId: googleId,
  275 |             email: email,
  276 |             name: `Concurrent User ${i}`,
  277 |             picture: 'https://example.com/photo.jpg',
  278 |           },
  279 |         })
  280 |       );
  281 |     }
  282 | 
  283 |     const responses = await Promise.all(registrations);
  284 | 
  285 |     // All should succeed
  286 |     for (const response of responses) {
  287 |       expect(response.ok()).toBeTruthy();
  288 |       const result = await response.json();
  289 |       expect(result.result.data.success).toBe(true);
  290 |     }
  291 | 
  292 |     // All should have unique user IDs
  293 |     const userIds = new Set();
  294 |     for (const response of responses) {
  295 |       const result = await response.json();
  296 |       userIds.add(result.result.data.userId);
  297 |     }
  298 |     expect(userIds.size).toBe(3);
  299 |   });
  300 | 
  301 |   test('should not create duplicate accounts for same Google ID', async ({ page }) => {
  302 |     const email = `duplicate-${Date.now()}@gmail.com`;
  303 |     const googleId = `google-duplicate-${Date.now()}`;
  304 | 
  305 |     // First registration
  306 |     const firstResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  307 |       data: {
  308 |         googleId: googleId,
  309 |         email: email,
  310 |         name: 'Duplicate Test',
  311 |         picture: 'https://example.com/photo.jpg',
  312 |       },
  313 |     });
  314 | 
  315 |     const firstResult = await firstResponse.json();
  316 |     const firstUserId = firstResult.result.data.userId;
  317 | 
  318 |     // Second registration with same Google ID
  319 |     const secondResponse = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  320 |       data: {
  321 |         googleId: googleId,
  322 |         email: email,
  323 |         name: 'Duplicate Test',
  324 |         picture: 'https://example.com/photo.jpg',
  325 |       },
  326 |     });
  327 | 
  328 |     const secondResult = await secondResponse.json();
  329 |     const secondUserId = secondResult.result.data.userId;
  330 | 
  331 |     // Should return the same user
  332 |     expect(secondUserId).toBe(firstUserId);
  333 |     // Should not be marked as new registration
  334 |     expect(secondResult.result.data.isNewRegistration).toBe(false);
  335 |   });
  336 | 
  337 |   test('should handle Gmail login with special characters in name', async ({ page }) => {
  338 |     const email = `special-${Date.now()}@gmail.com`;
  339 |     const googleId = `google-special-${Date.now()}`;
  340 |     const nameWithSpecialChars = "O'Brien-Smith (José)";
  341 | 
  342 |     const response = await page.request.post('/api/trpc/gmailAuth.handleGoogleCallback', {
  343 |       data: {
  344 |         googleId: googleId,
  345 |         email: email,
  346 |         name: nameWithSpecialChars,
  347 |         picture: 'https://example.com/photo.jpg',
  348 |       },
  349 |     });
  350 | 
  351 |     expect(response.ok()).toBeTruthy();
  352 |     const result = await response.json();
  353 |     const userData = result.result.data.user;
  354 | 
  355 |     // Name should be stored correctly
```